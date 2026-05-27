"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, UserRound, Users } from "lucide-react";

const roles = [
  { value: "staff", label: "Personel" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

export default function StaffPage() {
  const { role } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message || "Personel listesi alınamadı.");
      return;
    }

    setProfiles(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return profiles;

    return profiles.filter((profile) =>
      [profile.full_name, profile.email, profile.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [profiles, search]);

  async function updateRole(id: string, nextRole: string) {
    setMessage("");

    if (role !== "super_admin") {
      setMessage("Rol güncelleme sadece Super Admin tarafından yapılabilir.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", id);

    if (error) {
      setMessage(error.message || "Rol güncellenemedi.");
      return;
    }

    setMessage("Personel rolü güncellendi.");
    load();
  }

  return (
    <AppShell title="Personel Yönetimi">
      <div className="space-y-5 pb-24 lg:space-y-8 lg:pb-0">
        <section className="rounded-[1.8rem] bg-gradient-to-r from-[#211b16] via-[#2b231c] to-[#b69463] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8bd84]">
            MAUNA Yetki Merkezi
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">
            Personel ve Roller
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Personel, admin ve super admin yetkilerini buradan yönetin.
          </p>
        </section>

        {message ? (
          <div className="premium-card p-4 text-sm font-black text-[#6d6256]">
            {message}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[.75fr_1.25fr]">
          <div className="premium-card p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                <ShieldCheck size={21} />
              </div>
              <div>
                <h2 className="premium-title text-xl">Rol Açıklaması</h2>
                <p className="premium-muted text-sm">Kullanıcı yetki seviyeleri</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <RoleInfo title="Personel" text="Bugün, prova, müşteri, ürün, kiralama ve takvim işlemlerini kullanır." />
              <RoleInfo title="Admin" text="Operasyon ve temel yönetim alanlarına erişebilir." />
              <RoleInfo title="Super Admin" text="Muhasebe, raporlar, personel ve sistem ayarlarını yönetir." />
            </div>
          </div>

          <div className="premium-card p-5 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
                  <Users size={21} />
                </div>
                <div>
                  <h2 className="premium-title text-xl">Personel Listesi</h2>
                  <p className="premium-muted text-sm">{profiles.length} kullanıcı profili</p>
                </div>
              </div>

              <input
                className="input lg:max-w-sm"
                placeholder="Personel ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mt-5 space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#d9c9b5] p-10 text-center text-sm font-bold text-[#8a7f72]">
                  Personel profili bulunamadı.
                </div>
              ) : (
                filtered.map((profile) => (
                  <div key={profile.id} className="rounded-2xl border border-[#eadfce] bg-white/70 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#211b16] text-white">
                          <UserRound size={18} />
                        </div>
                        <div>
                          <h3 className="font-black text-[#211b16]">
                            {profile.full_name || "İsimsiz Kullanıcı"}
                          </h3>
                          <p className="mt-1 text-xs font-bold text-[#8a7f72]">
                            {[profile.email, profile.role].filter(Boolean).join(" • ") || profile.id}
                          </p>
                        </div>
                      </div>

                      <select
                        className="input lg:max-w-[220px]"
                        value={profile.role || "staff"}
                        onChange={(e) => updateRole(profile.id, e.target.value)}
                        disabled={role !== "super_admin"}
                      >
                        {roles.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RoleInfo({ title, text }: any) {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-white/60 p-4">
      <h3 className="font-black text-[#211b16]">{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#6d6256]">{text}</p>
    </div>
  );
}
