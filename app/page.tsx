"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6efe5] text-[#211b16]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,148,99,.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(33,27,22,.08),transparent_30%)]" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-14 lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#d9c9b5] bg-white/70 px-5 py-3 backdrop-blur-xl">
              <img src="/mauna-logo.png" className="h-10 w-10 object-contain" />
              <span className="text-xs font-black tracking-[0.35em] text-[#8c7b67]">
                MAUNA COUTURE ERP
              </span>
            </div>

            <div className="mt-16 max-w-xl">
              <h1 className="text-7xl font-black leading-[0.9] tracking-[-0.08em]">
                Luxury fashion
                <br />
                operating system
              </h1>

              <p className="mt-8 max-w-lg text-lg leading-8 text-[#6d6256]">
                Kiralama, satış, prova, müşteri ve couture operasyonlarını tek premium panelden yönetin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <div className="text-5xl font-black">500+</div>
              <div className="mt-2 text-sm font-bold text-[#8a7f72]">
                Aktif ürün yönetimi
              </div>
            </div>

            <div className="h-14 w-px bg-[#d9c9b5]" />

            <div>
              <div className="text-5xl font-black">24/7</div>
              <div className="mt-2 text-sm font-bold text-[#8a7f72]">
                Operasyon takibi
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center p-6 lg:p-10">
          <div className="absolute h-[520px] w-[520px] rounded-full bg-[#b69463]/10 blur-3xl" />

          <div className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/75 p-8 shadow-[0_35px_120px_rgba(33,27,22,.14)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,.55),transparent)]" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-full border border-[#eadfce] bg-[#f8f2ea] px-4 py-2 text-[10px] font-black uppercase tracking-[0.32em] text-[#8a7f72]">
                  Secure Access
                </div>

                <img
                  src="/mauna-logo.png"
                  className="h-14 w-14 rounded-2xl border border-[#eadfce] bg-white p-2 shadow-sm"
                />
              </div>

              <div className="mt-10">
                <h2 className="text-5xl font-black tracking-[-0.07em]">
                  Welcome
                </h2>

                <p className="mt-4 text-base leading-7 text-[#6d6256]">
                  MAUNA Couture yönetim sistemine güvenli giriş yapın.
                </p>
              </div>

              <div className="mt-10 grid gap-5">
                <label className="block">
                  <span className="mb-3 block text-sm font-black text-[#6d6256]">
                    E-posta
                  </span>

                  <div className="flex h-16 items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fcfaf8] px-5">
                    <Mail size={19} className="text-[#8a7f72]" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@mauna.com"
                      className="w-full bg-transparent text-[15px] font-bold outline-none placeholder:text-[#b1a08d]"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-3 block text-sm font-black text-[#6d6256]">
                    Şifre
                  </span>

                  <div className="flex h-16 items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fcfaf8] px-5">
                    <LockKeyhole size={19} className="text-[#8a7f72]" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-[15px] font-bold outline-none placeholder:text-[#b1a08d]"
                    />
                  </div>
                </label>
              </div>

              {message && (
                <div className="mt-5 rounded-2xl bg-[#f7f0e7] p-4 text-sm font-bold text-[#6d6256]">
                  {message}
                </div>
              )}

              <button
                onClick={login}
                disabled={loading}
                className="mt-8 flex h-16 w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#211b16] to-[#b69463] px-6 text-white shadow-[0_18px_40px_rgba(182,148,99,.22)] transition hover:scale-[1.01]"
              >
                <span className="text-[15px] font-black">
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </span>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <ArrowRight size={18} />
                </div>
              </button>

              <div className="mt-6 flex items-center justify-between text-sm font-bold">
                <Link href="/forgot-password" className="text-[#8a7f72]">
                  Şifremi Unuttum
                </Link>

                <Link href="/register" className="text-[#b69463]">
                  Kayıt Ol
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-[#eadfce] pt-6">
                <div>
                  <div className="text-xs font-black text-[#211b16]">
                    MAUNA Couture
                  </div>

                  <div className="mt-1 text-[11px] font-bold text-[#8a7f72]">
                    Luxury ERP Platform
                  </div>
                </div>

                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8a7f72]">
                  Secure Login
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
