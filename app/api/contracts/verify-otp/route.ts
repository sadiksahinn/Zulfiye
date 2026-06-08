import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const { contractId, otp } = await req.json();
  if (!contractId || !otp) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: contract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .maybeSingle();

  if (!contract) return NextResponse.json({ error: "Sözleşme bulunamadı" }, { status: 404 });
  if (contract.status === "onaylandi") return NextResponse.json({ error: "Zaten onaylandı" }, { status: 400 });
  if (contract.otp_attempts >= 5) return NextResponse.json({ error: "Çok fazla hatalı deneme. Yeni kod talep edin." }, { status: 429 });
  if (!contract.otp_code || !contract.otp_expires_at) return NextResponse.json({ error: "Önce SMS kodu gönderin" }, { status: 400 });
  if (new Date(contract.otp_expires_at) < new Date()) return NextResponse.json({ error: "Kodun süresi dolmuş. Yeni kod talep edin." }, { status: 400 });

  if (contract.otp_code !== String(otp).trim()) {
    await supabase.from("contracts").update({ otp_attempts: (contract.otp_attempts || 0) + 1 }).eq("id", contractId);
    return NextResponse.json({ error: "Hatalı kod. Lütfen tekrar deneyin." }, { status: 400 });
  }

  // IP adresi al
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0] || hdrs.get("x-real-ip") || "bilinmiyor";

  // Onayla
  await supabase.from("contracts").update({
    status: "onaylandi",
    signed_at: new Date().toISOString(),
    signed_ip: ip,
    otp_code: null,
  }).eq("id", contractId);

  return NextResponse.json({ success: true });
}
