"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = {
    tr: {
      badge: "MAUNA Couture ERP",
      title: "Gelinlik Yönetim Sistemi",
      description:
        "Gelinlik kiralama, prova takibi, barkod sistemi, müşteri yönetimi ve satış operasyonlarını tek panelden yönetin.",
      welcome: "Hoş Geldiniz",
      loginText: "MAUNA Couture yönetim sistemine giriş yapın.",
      email: "E-posta",
      password: "Şifre",
      login: "Giriş Yap",
      loading: "Giriş yapılıyor...",
      error: "E-posta veya şifre hatalı.",
      secure: "Güvenli Giriş",
      barcode: "Barkod",
      fitting: "Prova",
      rental: "Kiralama",
    },
    en: {
      badge: "MAUNA Couture ERP",
      title: "Bridal Management System",
      description:
        "Manage bridal rentals, fittings, barcode systems, customer operations and sales from a single platform.",
      welcome: "Welcome",
      loginText: "Sign in to the MAUNA Couture management system.",
      email: "Email",
      password: "Password",
      login: "Sign In",
      loading: "Signing in...",
      error: "Email or password is incorrect.",
      secure: "Secure Access",
      barcode: "Barcode",
      fitting: "Fitting",
      rental: "Rental",
    },
  };

  const current = t[language];

  async function handleLogin() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(current.error);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#efe3d3_0%,transparent_40%)]" />

      <div
        className="absolute inset-0 opacity-[0.08] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1525258946800-98cfd641d0de?q=80&w=1600&auto=format&fit=crop')",
        }}
      />

      <section className="relative z-10 min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-16">
          <div>
            <div className="text-sm tracking-[0.45em] uppercase text-[#b69463]">
              {current.badge}
            </div>

            <h1 className="mt-8 text-6xl leading-[1.1] font-semibold text-[#1f1b16]">
              {current.title}
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#6d6256]">
              {current.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[current.barcode, current.fitting, current.rental].map((item) => (
              <div
                key={item}
                className="rounded-3xl bg-white/60 backdrop-blur-xl border border-[#e9dfd2] p-5 shadow-lg"
              >
                <div className="text-[#b69463] text-2xl font-bold">✦</div>
                <div className="mt-2 text-sm text-[#5b5147]">{item}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-5 flex justify-end">
              <div className="flex rounded-full border border-[#e7d9ca] bg-white/70 p-1 backdrop-blur-xl shadow-lg">
                <button
                  onClick={() => setLanguage("tr")}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    language === "tr"
                      ? "bg-[#b69463] text-white"
                      : "text-[#7a6f63]"
                  }`}
                >
                  TR
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    language === "en"
                      ? "bg-[#b69463] text-white"
                      : "text-[#7a6f63]"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-[#eadfce] bg-white/70 backdrop-blur-2xl p-10 shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-white shadow-2xl flex items-center justify-center p-5">
                  <img
                    src="/mauna-logo.png"
                    alt="MAUNA"
                    className="object-contain h-full w-full"
                  />
                </div>

                <h2 className="mt-8 text-4xl font-semibold text-[#1f1b16]">
                  {current.welcome}
                </h2>

                <p className="mt-3 text-center text-[#7c7166]">
                  {current.loginText}
                </p>
              </div>

              <div className="mt-10 space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-[#6f655b]">
                    {current.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mauna.com"
                    className="w-full rounded-2xl border border-[#e6dbcf] bg-white/80 px-5 py-4 outline-none transition focus:border-[#b69463]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#6f655b]">
                    {current.password}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#e6dbcf] bg-white/80 px-5 py-4 outline-none transition focus:border-[#b69463]"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#b69463] py-4 text-white font-semibold transition hover:opacity-90 shadow-xl disabled:opacity-60"
                >
                  {loading ? current.loading : current.login}
                </button>
              </div>

              <div className="mt-8 flex items-center justify-between text-xs text-[#8b8177]">
                <span>MAUNA Couture ERP v1</span>
                <span>{current.secure}</span>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-[#8b8177]">
              © 2026 MAUNA Couture. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}