"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const t = {
    tr: {
      welcome: "Hoş Geldiniz",
      desc: "MAUNA Couture yönetim sistemine giriş yapın.",
      email: "E-posta",
      password: "Şifre",
      login: "Giriş Yap",
      forgot: "Şifremi Unuttum",
      register: "Kayıt Ol",
      secure: "Güvenli Giriş",
      version: "MAUNA Couture ERP v1",
      placeholder: "ornek@mauna.com",
      error: "Giriş başarısız. Bilgileri kontrol edin.",
    },
    en: {
      welcome: "Welcome",
      desc: "Sign in to MAUNA Couture management system.",
      email: "Email",
      password: "Password",
      login: "Sign In",
      forgot: "Forgot Password",
      register: "Create Account",
      secure: "Secure Login",
      version: "MAUNA Couture ERP v1",
      placeholder: "example@mauna.com",
      error: "Login failed. Check your information.",
    },
  }[lang];

  async function login() {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(t.error);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#f7f0e7] bg-[radial-gradient(circle_at_top,rgba(255,255,255,.95),transparent_35%),radial-gradient(circle_at_bottom,rgba(182,148,99,.18),transparent_35%)] px-5 py-8 text-[#211b16]">
      <div className="mx-auto flex w-full max-w-md justify-end">
        <div className="rounded-full border border-[#eadfce] bg-white/70 p-1 shadow-xl backdrop-blur-xl">
          <button
            onClick={() => setLang("tr")}
            className={`rounded-full px-5 py-2 font-bold ${lang === "tr" ? "bg-[#b69463] text-white" : "text-[#7a6d5e]"}`}
          >
            TR
          </button>
          <button
            onClick={() => setLang("en")}
            className={`rounded-full px-5 py-2 font-bold ${lang === "en" ? "bg-[#b69463] text-white" : "text-[#7a6d5e]"}`}
          >
            EN
          </button>
        </div>
      </div>

      <section className="mx-auto mt-8 w-full max-w-md rounded-[2.4rem] border border-[#eadfce] bg-white/78 p-8 shadow-[0_30px_100px_rgba(118,93,60,.16)] backdrop-blur-2xl">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-2xl">
          <Image src="/mauna-logo.png" alt="MAUNA" width={105} height={105} className="object-contain" />
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-4xl font-black tracking-[-0.05em]">{t.welcome}</h1>
          <p className="mt-4 text-lg leading-8 text-[#7a6d5e]">{t.desc}</p>
        </div>

        <div className="mt-8 grid gap-5">
          <label>
            <span className="mb-2 block font-semibold text-[#6d6256]">{t.email}</span>
            <input
              className="input"
              type="email"
              placeholder={t.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            <span className="mb-2 block font-semibold text-[#6d6256]">{t.password}</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        <button onClick={login} className="premium-button mt-7 w-full py-4 text-lg">
          {t.login}
        </button>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a href="/forgot-password" className="rounded-2xl border border-[#eadfce] bg-white/70 py-4 text-center font-bold text-[#6d6256]">
            {t.forgot}
          </a>
          <a href="/register" className="rounded-2xl border border-[#eadfce] bg-white/70 py-4 text-center font-bold text-[#6d6256]">
            {t.register}
          </a>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-[#8b8177]">
          <span>{t.version}</span>
          <span>{t.secure}</span>
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-[#8b8177]">
        © 2026 MAUNA Couture. All rights reserved.
      </p>
    </main>
  );
}
