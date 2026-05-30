"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setMessage("");

    if (!email.trim()) {
      setMessage("E-posta adresi zorunludur.");
      return;
    }

    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Şifre yenileme bağlantısı e-posta adresinize gönderildi.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f0e7] px-5 py-8 text-[#211b16]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.96),transparent_38%),linear-gradient(135deg,#fbf7ef_0%,#f4eadc_100%)]" />

      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-[#eadfce] bg-white/85 p-8 shadow-[0_40px_110px_rgba(118,93,60,.18)] backdrop-blur-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b69463]/15 text-[#b69463]">
            <KeyRound size={24} />
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-[#211b16]">
            Şifremi Unuttum
          </h1>

          <p className="mt-3 text-sm font-semibold leading-6 text-[#6d6256]">
            E-posta adresinizi girin, şifre yenileme bağlantısını gönderelim.
          </p>

          <div className="mt-7">
            <label className="mb-2 block text-sm font-black text-[#6d6256]">
              E-posta
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white/75 px-4 py-4 shadow-inner">
              <Mail size={18} className="text-[#9d8b74]" />
              <input
                type="email"
                placeholder="ornek@mauna.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[#a79b8d]"
              />
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-[#eadfce] bg-[#f7f0e7] p-4 text-sm font-bold text-[#6d6256]">
              {message}
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#211b16] py-4 font-black text-white disabled:opacity-60"
          >
            <Send size={18} /> {loading ? "Gönderiliyor..." : "Link Gönder"}
          </button>

          <Link href="/" className="mt-5 block text-center text-sm font-bold text-[#b69463]">
            Giriş ekranına dön
          </Link>
        </div>
      </section>
    </main>
  );
}
