import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { contractId } = await req.json();
  if (!contractId) return NextResponse.json({ error: "contractId gerekli" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*, customers(full_name, phone)")
    .eq("id", contractId)
    .maybeSingle();

  if (error || !contract) return NextResponse.json({ error: "Sözleşme bulunamadı" }, { status: 404 });
  if (contract.status === "onaylandi") return NextResponse.json({ error: "Sözleşme zaten onaylandı" }, { status: 400 });

  const phone = contract.customers?.phone;
  if (!phone) return NextResponse.json({ error: "Müşteri telefon numarası yok" }, { status: 400 });

  // 6 haneli OTP üret
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 dakika

  // DB'ye kaydet
  await supabase.from("contracts").update({
    otp_code: otp,
    otp_expires_at: expires,
    otp_attempts: 0,
    customer_phone: phone,
  }).eq("id", contractId);

  // SMS gönder
  const usercode  = process.env.NETGSM_USERCODE;
  const password  = process.env.NETGSM_PASSWORD;
  const msgheader = process.env.NETGSM_MSGHEADER || "ZULFIYECANB";
  const name      = contract.customers?.full_name || "Müşteri";

  const digits = String(phone).replace(/\D/g, "");
  const cleanPhone = digits.startsWith("90") ? digits : digits.startsWith("0") ? `90${digits.slice(1)}` : `90${digits}`;

  const message = `Sayın ${name}, Zülfiye Canbolat Gelinlik sözleşme onay kodunuz: ${otp}. Bu kod 10 dakika geçerlidir. Başkasıyla paylaşmayınız.`;

  let smsSent = false;
  if (usercode && password) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company dil="TR">Netgsm</company>
    <usercode>${usercode}</usercode>
    <password>${password}</password>
    <type>1:n</type>
    <msgheader>${msgheader}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>${cleanPhone}</no>
  </body>
</mainbody>`;
    try {
      const r = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
        method: "POST", headers: { "Content-Type": "application/xml" }, body: xml,
      });
      const text = await r.text();
      smsSent = ["00","01","02"].includes(text.trim().split(" ")[0]);
    } catch {}
  }

  return NextResponse.json({ success: true, smsSent, phone: cleanPhone, otp: !usercode ? otp : undefined });
}
