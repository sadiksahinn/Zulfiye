"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, Package, RotateCcw, ShoppingBag, TrendingUp, Users, Wallet } from "lucide-react";

const MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const COLORS = ["#b69463","#211b16","#d8bd84","#8a7058","#6d5a46","#c4a47a"];

function money(v: any) { return `${Number(v||0).toLocaleString("tr-TR")} ₺`; }

export default function ReportsPage() {
  const [rentals,  setRentals]  = useState<any[]>([]);
  const [sales,    setSales]    = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers,setCustomers]= useState<any[]>([]);
  const [fittings, setFittings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("all");

  async function load() {
    const [r,s,p,c,f,e] = await Promise.all([
      supabase.from("rentals").select("*, customers(full_name,phone), products(name,category)").order("created_at",{ascending:false}),
      supabase.from("sales").select("*, customers(full_name,phone), products(name,category)").order("created_at",{ascending:false}),
      supabase.from("products").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("fittings").select("*"),
      supabase.from("expenses").select("*").order("expense_date",{ascending:false}),
    ]);
    setRentals(r.data||[]); setSales(s.data||[]); setProducts(p.data||[]);
    setCustomers(c.data||[]); setFittings(f.data||[]); setExpenses(e.data||[]);
  }

  useEffect(()=>{ load(); },[]);

  const thisYear = new Date().getFullYear().toString();

  const filteredRentals = useMemo(()=>{
    if(filterMonth==="all") return rentals;
    return rentals.filter(r => r.created_at?.slice(0,7) === filterMonth);
  },[rentals,filterMonth]);

  const filteredSales = useMemo(()=>{
    if(filterMonth==="all") return sales;
    return sales.filter(s => s.created_at?.slice(0,7) === filterMonth);
  },[sales,filterMonth]);

  const metrics = useMemo(()=>{
    const rentalTotal   = filteredRentals.reduce((s,x)=>s+Number(x.total_amount||0),0);
    const saleTotal     = filteredSales.reduce((s,x)=>s+Number(x.total_amount||0),0);
    const total         = rentalTotal + saleTotal;
    const rentalPaid    = filteredRentals.reduce((s,x)=>s+Number(x.deposit_amount||0),0);
    const salePaid      = filteredSales.reduce((s,x)=>s+Number(x.paid_amount||0),0);
    const paid          = rentalPaid + salePaid;
    const remaining     = total - paid;
    const expenseTotal  = expenses.filter(e=> filterMonth==="all" || e.expense_date?.slice(0,7)===filterMonth).reduce((s,x)=>s+Number(x.amount||0),0);
    const netProfit     = paid - expenseTotal;
    const stock         = products.filter(x=>x.status==="stokta").length;
    const rented        = products.filter(x=>x.status==="kirada"||x.status==="rezerve").length;
    const sold          = products.filter(x=>x.status==="satildi").length;
    const overdue       = rentals.filter(x=>x.return_date < new Date().toISOString().slice(0,10) && !["tamamlandi","iptal"].includes(x.status)).length;
    return { total, rentalTotal, saleTotal, paid, remaining, expenseTotal, netProfit, stock, rented, sold, overdue };
  },[filteredRentals,filteredSales,expenses,products,rentals,filterMonth]);

  // Aylık ciro grafiği
  const monthlyData = useMemo(()=>{
    const map: Record<string, {rental:number;sale:number;expense:number}> = {};
    rentals.filter(r=>r.created_at?.startsWith(thisYear)).forEach(r=>{
      const m = r.created_at.slice(5,7);
      if(!map[m]) map[m]={rental:0,sale:0,expense:0};
      map[m].rental += Number(r.total_amount||0);
    });
    sales.filter(s=>s.created_at?.startsWith(thisYear)).forEach(s=>{
      const m = s.created_at.slice(5,7);
      if(!map[m]) map[m]={rental:0,sale:0,expense:0};
      map[m].sale += Number(s.total_amount||0);
    });
    expenses.filter(e=>e.expense_date?.startsWith(thisYear)).forEach(e=>{
      const m = e.expense_date.slice(5,7);
      if(!map[m]) map[m]={rental:0,sale:0,expense:0};
      map[m].expense += Number(e.amount||0);
    });
    return Array.from({length:12},(_,i)=>{
      const key = String(i+1).padStart(2,"0");
      return { month: MONTHS[i], rental: map[key]?.rental||0, sale: map[key]?.sale||0, expense: map[key]?.expense||0 };
    });
  },[rentals,sales,expenses,thisYear]);

  // Kategori dağılımı
  const categoryData = useMemo(()=>{
    const map: Record<string,number> = {};
    products.forEach(p=>{ map[p.category] = (map[p.category]||0)+1; });
    return Object.entries(map).map(([name,value])=>({name,value}));
  },[products]);

  // Borçlu müşteriler
  const debtors = useMemo(()=>{
    const map: Record<string,{name:string;phone:string;debt:number;id:string}> = {};
    [...filteredRentals,...filteredSales].forEach(x=>{
      const rem = Number(x.remaining_amount||0);
      if(rem<=0) return;
      const cid = x.customer_id;
      if(!map[cid]) map[cid]={ name: x.customers?.full_name||"—", phone: x.customers?.phone||"", debt:0, id:cid };
      map[cid].debt += rem;
    });
    return Object.values(map).sort((a,b)=>b.debt-a.debt);
  },[filteredRentals,filteredSales]);

  // Ay seçenekleri
  const monthOptions = useMemo(()=>{
    const set = new Set<string>();
    [...rentals,...sales].forEach(x=>{ if(x.created_at) set.add(x.created_at.slice(0,7)); });
    return Array.from(set).sort().reverse();
  },[rentals,sales]);

  return (
    <AppShell title="Raporlar">
      <div className="space-y-5 pb-24 lg:pb-0">

        {/* Header */}
        <div className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d8bd84]">ZÜLFİYE CANBOLAT Raporlama</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] lg:text-5xl">İşletme Özeti</h1>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:max-w-lg">
            {[["Toplam Ciro",money(metrics.total)],["Tahsil Edilen",money(metrics.paid)],["Bekleyen",money(metrics.remaining)],["Net Kâr",money(metrics.netProfit)]].map(([l,v])=>(
              <div key={l} className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{l}</div>
                <div className="mt-1 text-sm font-black text-white">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtre */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-[#9d8b74]">Dönem:</label>
          <select
            value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
            className="rounded-full border border-[#eadfce] bg-white/80 px-4 py-2.5 text-sm font-bold text-[#211b16] outline-none">
            <option value="all">Tüm zamanlar</option>
            {monthOptions.map(m=>{
              const [y,mo] = m.split("-");
              return <option key={m} value={m}>{MONTHS[Number(mo)-1]} {y}</option>;
            })}
          </select>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
          {[
            { title:"Ürün",    value:products.length, sub:`${metrics.stock} stokta`,  icon:<Package size={18}/>,     danger:false },
            { title:"Müşteri", value:customers.length,sub:"Kayıtlı",                  icon:<Users size={18}/>,       danger:false },
            { title:"Kiralama",value:filteredRentals.length,sub:"İşlem",             icon:<TrendingUp size={18}/>,  danger:false },
            { title:"Satış",   value:filteredSales.length,sub:`${metrics.sold} ürün`, icon:<ShoppingBag size={18}/>, danger:false },
            { title:"Kirada",  value:metrics.rented,  sub:"Aktif+Rezerve",           icon:<RotateCcw size={18}/>,   danger:false },
            { title:"Geciken", value:metrics.overdue, sub:"İade bekleniyor",          icon:<AlertTriangle size={18}/>,danger:metrics.overdue>0 },
          ].map(m=>(
            <div key={m.title} className={`premium-card p-4 ${m.danger?"border-red-200":""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-[#9d8b74]">{m.title}</p>
                  <h3 className={`mt-1.5 text-3xl font-black ${m.danger?"text-red-600":"text-[#211b16]"}`}>{m.value}</h3>
                  <p className={`text-xs font-bold ${m.danger?"text-red-500":"text-[#9d8b74]"}`}>{m.sub}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${m.danger?"bg-red-100 text-red-600":"bg-[#b69463]/15 text-[#b69463]"}`}>{m.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Aylık ciro grafiği */}
        <div className="premium-card p-5 lg:p-7">
          <h2 className="mb-1 text-xl font-black text-[#1f1b16]">{thisYear} Yılı Aylık Ciro</h2>
          <p className="mb-5 text-sm text-[#9d8b74]">Kiralama, satış ve gider karşılaştırması</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{top:0,right:0,left:0,bottom:0}}>
              <XAxis dataKey="month" tick={{fontSize:11,fontWeight:700,fill:"#9d8b74"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:"#9d8b74"}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/>
              <Tooltip
                formatter={(v:any) => money(v)}
                contentStyle={{borderRadius:12,border:"1px solid #eadfce",fontSize:12,fontWeight:700}}/>
              <Bar dataKey="rental"  fill="#b69463" radius={[4,4,0,0]} name="rental"/>
              <Bar dataKey="sale"    fill="#211b16" radius={[4,4,0,0]} name="sale"/>
              <Bar dataKey="expense" fill="#e4c4a0" radius={[4,4,0,0]} name="expense"/>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-4 justify-center">
            {[["#b69463","Kiralama"],["#211b16","Satış"],["#e4c4a0","Gider"]].map(([c,l])=>(
              <div key={l} className="flex items-center gap-1.5 text-xs font-bold text-[#9d8b74]">
                <div className="h-3 w-3 rounded-full" style={{background:c}}/>
                {l}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* Kategori pasta grafiği */}
          <div className="premium-card p-5 lg:p-7">
            <h2 className="mb-1 text-xl font-black text-[#1f1b16]">Ürün Kategori Dağılımı</h2>
            <p className="mb-4 text-sm text-[#9d8b74]">Toplam {products.length} ürün</p>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                    {categoryData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((c,i)=>(
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                      <span className="text-sm font-bold text-[#6d6256]">{c.name}</span>
                    </div>
                    <span className="text-sm font-black text-[#211b16]">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Finans özeti */}
          <div className="premium-card p-5 lg:p-7">
            <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Finans Özeti</h2>
            <div className="space-y-2">
              {[
                ["Kiralama Cirosu",  money(metrics.rentalTotal), false],
                ["Satış Cirosu",     money(metrics.saleTotal),   false],
                ["Toplam Ciro",      money(metrics.total),       false],
                ["Tahsil Edilen",    money(metrics.paid),        false],
                ["Bekleyen Ödeme",   money(metrics.remaining),   metrics.remaining>0],
                ["Toplam Gider",     money(metrics.expenseTotal),false],
                ["Net Kâr",          money(metrics.netProfit),   metrics.netProfit<0],
              ].map(([l,v,danger])=>(
                <div key={l as string} className={`flex items-center justify-between rounded-full border px-4 py-3 ${danger?"border-red-200 bg-red-50":"border-[#eadfce] bg-white/60"}`}>
                  <span className={`text-sm font-bold ${danger?"text-red-700":"text-[#6d6256]"}`}>{l as string}</span>
                  <span className={`text-sm font-black ${danger?"text-red-700":"text-[#211b16]"}`}>{v as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Borçlu müşteriler */}
        {debtors.length > 0 && (
          <div className="premium-card p-5 lg:p-7">
            <h2 className="mb-1 text-xl font-black text-[#1f1b16]">Borçlu Müşteriler</h2>
            <p className="mb-4 text-sm text-[#9d8b74]">{debtors.length} müşteri · Toplam {money(debtors.reduce((s,d)=>s+d.debt,0))}</p>
            <div className="space-y-2">
              {debtors.map(d=>(
                <div key={d.id} className="flex items-center justify-between rounded-full border border-orange-200 bg-orange-50 px-4 py-3">
                  <div>
                    <div className="font-black text-[#211b16]">{d.name}</div>
                    <div className="text-xs text-[#9d8b74]">{d.phone}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-red-600">{money(d.debt)}</span>
                    {d.phone && (
                      <a href={`https://wa.me/${d.phone.replace(/\D/g,"").replace(/^0/,"90")}?text=${encodeURIComponent(`Merhaba ${d.name}, Zülfiye Canbolat Gelinlik işleminiz için kalan ödemeniz ${money(d.debt)}'dir.`)}`}
                        target="_blank"
                        className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-black text-white">WA</a>
                    )}
                    <Link href={`/customers/${d.id}`} className="rounded-full bg-[#211b16] px-3 py-1.5 text-xs font-black text-white">Kart</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Son işlemler */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="premium-card p-5">
            <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Son Kiralamalar</h2>
            {filteredRentals.slice(0,6).map(r=>(
              <div key={r.id} className="mb-2 flex items-center justify-between rounded-full border border-[#eadfce] bg-white/70 px-4 py-3">
                <div>
                  <div className="text-sm font-black text-[#211b16]">{r.customers?.full_name||"—"}</div>
                  <div className="text-xs text-[#9d8b74]">{r.products?.name||"—"} · {r.created_at?.slice(0,10)}</div>
                </div>
                <span className="text-sm font-black text-[#b69463]">{money(r.total_amount)}</span>
              </div>
            ))}
            {filteredRentals.length===0 && <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-6 text-center text-sm text-[#9d8b74]">Kayıt yok</div>}
          </div>

          <div className="premium-card p-5">
            <h2 className="mb-4 text-xl font-black text-[#1f1b16]">Son Satışlar</h2>
            {filteredSales.slice(0,6).map(s=>(
              <div key={s.id} className="mb-2 flex items-center justify-between rounded-full border border-[#eadfce] bg-white/70 px-4 py-3">
                <div>
                  <div className="text-sm font-black text-[#211b16]">{s.customers?.full_name||"—"}</div>
                  <div className="text-xs text-[#9d8b74]">{s.products?.name||"—"} · {s.sale_date||s.created_at?.slice(0,10)}</div>
                </div>
                <span className="text-sm font-black text-[#b69463]">{money(s.total_amount)}</span>
              </div>
            ))}
            {filteredSales.length===0 && <div className="rounded-2xl border border-dashed border-[#d9c9b5] p-6 text-center text-sm text-[#9d8b74]">Kayıt yok</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
