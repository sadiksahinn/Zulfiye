"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const LOGIN_BUILD_VERSION = "login-auth-v2";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Giriş başarısız");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#f7f0e7] px-5 py-10 text-[#211b16]">
      <div className="mx-auto max-w-md">
        
        <div className="mb-6 flex justify-end">
          <div className="rounded-full border border-[#eadfce] bg-white p-1 shadow-lg">
            <button className="rounded-full bg-[#b69463] px-5 py-2 font-bold text-white">
              TR
            </button>
            <button className="rounded-full px-5 py-2 font-bold text-[#7d6c58]">
              EN
            </button>
          </div>
        </div>

        <section className="rounded-[2rem] border border-[#eadfce] bg-white p-8 shadow-2xl">
          
          <div className="flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-xl">
              <Image
                src="/mauna-logo.png"
                alt="MAUNA"
                width={90}
                height={90}
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <h1 className="text-5xl font-black tracking-[-0.05em]">
              Hoş Geldiniz
            </h1>

            <p className="mt-4 text-lg leading-8 text-[#7d6c58]">
              MAUNA Couture yönetim sistemine giriş yapın.
            </p>
          </div>

          <div className="mt-10 grid gap-5">
            <div>
              <label className="mb-2 block font-semibold text-[#6d6256]">
                E-posta
              </label>

              <input
                type="email"
                placeholder="ornek@mauna.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-3xl border border-[#eadfce] bg-[#fcfaf7] px-6 py-5 text-lg outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-[#6d6256]">
                Şifre
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-3xl border border-[#eadfce] bg-[#fcfaf7] px-6 py-5 text-lg outline-none"
              />
            </div>
          </div>

          <button
            onClick={login}
            className="mt-8 w-full rounded-3xl bg-[#b69463] py-5 text-xl font-black text-white shadow-xl transition hover:scale-[1.01]"
          >
            Giriş Yap
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href="/forgot-password"
              className="rounded-2xl border border-[#eadfce] bg-[#fcfaf7] py-4 text-center font-bold text-[#6d6256]"
            >
              Şifremi Unuttum
            </a>

            <a
              href="/register"
              className="rounded-2xl border border-[#eadfce] bg-[#fcfaf7] py-4 text-center font-bold text-[#6d6256]"
            >
              Kayıt Ol
            </a>
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-[#8a7f72]">
            <span>MAUNA Couture ERP v1</span>
            <span>Güvenli Giriş</span>
          </div>
        </section>

        <p className="mt-8 text-center text-sm text-[#8a7f72]">
          © 2026 MAUNA Couture
        </p>
      </div>
    </main>
  );
}