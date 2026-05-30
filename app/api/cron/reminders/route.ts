import { NextResponse } from "next/server";

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

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const results: string[] = [];

  const { data: overdueRentals } = await supabase
    .from("rentals").select("id")
    .in("status", ["aktif", "planlandi"]).lt("return_date", today);

  if (overdueRentals?.length) {
    await supabase.from("rentals").update({ status: "gecikti" }).in("id", overdueRentals.map((r) => r.id));
    results.push(`${overdueRentals.length} kiralama gecikti yapıldı`);
  }

  const { data: tomorrowFittings } = await supabase
    .from("fittings").select("id, customer_name")
    .eq("fitting_date", tomorrow).eq("status", "bekliyor");

  if (tomorrowFittings?.length) results.push(`${tomorrowFittings.length} prova yarın`);

  const { data: tomorrowDeliveries } = await supabase
    .from("rentals").select("id, customer_name")
    .eq("delivery_date", tomorrow).in("status", ["planlandi", "rezerve"]);

  if (tomorrowDeliveries?.length) results.push(`${tomorrowDeliveries.length} teslim yarın`);

  return NextResponse.json({ success: true, date: today, results });
}
