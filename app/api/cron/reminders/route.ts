import { NextResponse } from "next/server";
import { sendSMS, smsTemplates } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase credentials eksik" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const in2days  = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  const results: string[] = [];
  let smsSent = 0;

  // ─── 1. Geciken kiralamaları güncelle ───────────────────────────────────────
  const { data: overdueRentals } = await supabase
    .from("rentals").select("id")
    .in("status", ["aktif", "planlandi"])
    .lt("return_date", today);

  if (overdueRentals?.length) {
    await supabase.from("rentals")
      .update({ status: "gecikti" })
      .in("id", overdueRentals.map(r => r.id));
    results.push(`${overdueRentals.length} kiralama gecikti yapıldı`);
  }

  // ─── 2. Yarınki prova hatırlatması ──────────────────────────────────────────
  const { data: tomorrowFittings } = await supabase
    .from("fittings")
    .select("*, customers(full_name, phone)")
    .eq("fitting_date", tomorrow)
    .eq("status", "bekliyor");

  for (const f of tomorrowFittings || []) {
    const name  = f.customers?.full_name || "Müşteri";
    const phone = f.customers?.phone;
    if (!phone) continue;
    const date = new Date(tomorrow + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
    const time = f.fitting_time?.slice(0, 5);
    const res = await sendSMS(phone, smsTemplates.provaHatirlatma(name, date, time));
    if (res.success) smsSent++;
    results.push(`Prova SMS → ${name}: ${res.success ? "✓" : res.error}`);
  }

  // ─── 3. Yarınki teslim hatırlatması ─────────────────────────────────────────
  const { data: tomorrowDeliveries } = await supabase
    .from("rentals")
    .select("*, customers(full_name, phone), products(name)")
    .eq("delivery_date", tomorrow)
    .in("status", ["planlandi", "rezerve"]);

  for (const r of tomorrowDeliveries || []) {
    const name  = r.customers?.full_name || "Müşteri";
    const phone = r.customers?.phone;
    const product = r.products?.name;
    if (!phone) continue;
    const date = new Date(tomorrow + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
    const msg = `Merhaba ${name}, ${product || "ürününüz"} teslimatı ${date} tarihinde planlanmıştır. MAUNA Couture sizi bekliyoruz.`;
    const res = await sendSMS(phone, msg);
    if (res.success) smsSent++;
    results.push(`Teslim SMS → ${name}: ${res.success ? "✓" : res.error}`);
  }

  // ─── 4. Bugünkü iade hatırlatması ───────────────────────────────────────────
  const { data: todayReturns } = await supabase
    .from("rentals")
    .select("*, customers(full_name, phone), products(name)")
    .eq("return_date", today)
    .in("status", ["aktif", "planlandi"]);

  for (const r of todayReturns || []) {
    const name  = r.customers?.full_name || "Müşteri";
    const phone = r.customers?.phone;
    const product = r.products?.name;
    if (!phone) continue;
    const res = await sendSMS(phone, smsTemplates.iadeHatirlatma(name, product));
    if (res.success) smsSent++;
    results.push(`İade SMS → ${name}: ${res.success ? "✓" : res.error}`);
  }

  // ─── 5. Geciken iade uyarısı ─────────────────────────────────────────────────
  const { data: overdueList } = await supabase
    .from("rentals")
    .select("*, customers(full_name, phone), products(name)")
    .eq("status", "gecikti");

  for (const r of overdueList || []) {
    const name  = r.customers?.full_name || "Müşteri";
    const phone = r.customers?.phone;
    const product = r.products?.name;
    if (!phone) continue;
    const msg = `Merhaba ${name}, MAUNA Couture'dan kiraladığınız ${product || "ürün"} için iade tarihiniz geçmiştir. Lütfen en kısa sürede iade yapınız.`;
    const res = await sendSMS(phone, msg);
    if (res.success) smsSent++;
    results.push(`Gecikme SMS → ${name}: ${res.success ? "✓" : res.error}`);
  }

  // ─── 6. Prova bildirimi kaydet ───────────────────────────────────────────────
  if (smsSent > 0) {
    await supabase.from("notifications").insert({
      type:    "cron_sms",
      channel: "sms",
      message: `Günlük cron: ${smsSent} SMS gönderildi`,
      status:  "gonderildi",
      sent_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    date: today,
    smsSent,
    results,
  });
}
