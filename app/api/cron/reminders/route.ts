import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const results: string[] = [];

  // 1. Gecikmiş kiralamaları otomatik "gecikti" yap
  const { data: overdueRentals } = await supabase
    .from("rentals")
    .select("id")
    .in("status", ["aktif", "planlandi"])
    .lt("return_date", today);

  if (overdueRentals && overdueRentals.length > 0) {
    await supabase.from("rentals").update({ status: "gecikti" }).in("id", overdueRentals.map((r) => r.id));
    results.push(`${overdueRentals.length} kiralama gecikti yapıldı`);
  }

  // 2. Yarınki provalar
  const { data: tomorrowFittings } = await supabase
    .from("fittings")
    .select("id, customer_name, fitting_time")
    .eq("fitting_date", tomorrow)
    .eq("status", "bekliyor");

  if (tomorrowFittings && tomorrowFittings.length > 0) {
    results.push(`${tomorrowFittings.length} prova yarın`);
  }

  // 3. Yarınki teslimler
  const { data: tomorrowDeliveries } = await supabase
    .from("rentals")
    .select("id, customer_name, product_name")
    .eq("delivery_date", tomorrow)
    .in("status", ["planlandi", "rezerve"]);

  if (tomorrowDeliveries && tomorrowDeliveries.length > 0) {
    results.push(`${tomorrowDeliveries.length} teslim yarın`);
  }

  // 4. Bugün iadesi beklenenler
  const { data: todayReturns } = await supabase
    .from("rentals")
    .select("id, customer_name")
    .eq("return_date", today)
    .eq("status", "aktif");

  if (todayReturns && todayReturns.length > 0) {
    results.push(`${todayReturns.length} iade bugün bekleniyor`);
  }

  return NextResponse.json({ success: true, date: today, results });
}
