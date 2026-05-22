"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    setSuccess(true);
  }

  return (
    <main className="min-h-screen bg-[#f7f3ee] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-2xl border border-[#eadfce]">
        
        <h1 className="text-3xl font-semibold text-[#1f1b16]">
          Şifremi Unuttum
        </h1>

        <p className="mt-3 text-[#6d6256]">
          E-posta adresinizi girin, size şifre yenileme bağlantısı gönderelim.
        </p>

        <div className="mt-8">
          <input
            type="email"
            placeholder="ornek@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#e6dbcf] px-5 py-4 outline-none focus:border-[#b69463]"
          />
        </div>

        <button
          onClick={handleReset}
          className="mt-5 w-full rounded-2xl bg-[#b69463] py-4 text-white font-semibold"
        >
          Şifre Yenileme Linki Gönder
        </button>

        {success && (
          <div className="mt-5 rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            Şifre yenileme bağlantısı gönderildi.
          </div>
        )}
      </div>
    </main>
  );
}