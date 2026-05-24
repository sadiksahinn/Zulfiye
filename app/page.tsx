"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f6efe5] flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl border border-[#eadfce]">
        <h1 className="text-4xl font-black text-[#211b16]">MAUNA</h1>
        <p className="mt-2 text-sm font-semibold text-[#7a6f63]">
          Yönetim paneline giriş yap.
        </p>

        <div className="mt-8 grid gap-4">
          <input className="input" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {message && (
          <div className="mt-5 rounded-2xl bg-[#f7f0e7] p-4 text-sm font-bold text-[#6d6256]">
            {message}
          </div>
        )}

        <button onClick={login} className="mt-6 w-full rounded-2xl bg-[#211b16] py-4 font-black text-white">
          Giriş Yap
        </button>

        <div className="mt-5 flex justify-between text-sm font-bold">
          <Link href="/forgot-password" className="text-[#8a7f72]">Şifremi unuttum</Link>
          <Link href="/register" className="text-[#b69463]">Kayıt ol</Link>
        </div>
      </div>
    </main>
  );
}
