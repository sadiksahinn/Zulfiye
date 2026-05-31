"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"tr" | "en">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mauna_lang");
      if (saved === "en") return "en";
    }
    return "tr";
  });

  const copy = {
    tr: {
      title: "Hoş Geldiniz",
      subtitle: "MAUNA Couture yönetim sistemine güvenli giriş yapın.",
      email: "E-posta",
      emailPlaceholder: "ornek@mauna.com",
      password: "Şifre",
      login: "Giriş Yap",
      loading: "Giriş yapılıyor...",
      forgot: "Şifremi Unuttum",
      register: "Kayıt Ol",
      error: "Giriş başarısız. E-posta veya şifreyi kontrol edin.",
      secure: "Güvenli Giriş",
      footer: "MAUNA Couture - Yazılım VALKEA",
    },
    en: {
      title: "Welcome",
      subtitle: "Sign in securely to the MAUNA Couture management system.",
      email: "Email",
      emailPlaceholder: "example@mauna.com",
      password: "Password",
      login: "Sign In",
      loading: "Signing in...",
      forgot: "Forgot Password",
      register: "Register",
      error: "Login failed. Please check your email or password.",
      secure: "Secure Login",
      footer: "MAUNA Couture - Software by VALKEA",
    },
  }[lang];

  async function login() {
    setMessage("");
    setLoading(true);

    if (!email.trim() || !password) {
      setMessage("E-posta ve şifre zorunludur.");
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("SUPABASE LOGIN ERROR:", error);
      setMessage(error.message || copy.error);
      return;
    }

    if (!data.session) {
      setMessage("Oturum oluşturulamadı. Supabase email provider ve kullanıcı şifresini kontrol edin.");
      return;
    }

    setMessage("Giriş başarılı. Yönlendiriliyorsunuz...");

    await supabase.auth.getSession();
    router.replace("/today");

    setTimeout(() => {
      window.location.assign("/dashboard");
    }, 350);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f0e7] px-5 py-7 text-[#211b16]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.98),transparent_34%),radial-gradient(circle_at_80%_100%,rgba(182,148,99,.18),transparent_36%)]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-[360px] flex-col justify-center">
        <div className="rounded-[2rem] border border-[#eadfce] bg-white/82 px-5 pb-6 pt-6 shadow-[0_28px_90px_rgba(118,93,60,.16)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="relative -mt-12 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-[0_24px_70px_rgba(118,93,60,.18)]">
              <div className="absolute inset-2 rounded-full border border-[#eadfce]" />
              <Image src="/mauna-logo.png" alt="MAUNA Couture" width={96} height={96} priority className="object-contain" />
            </div>

            <div className="mt-1 rounded-full border border-[#eadfce] bg-white/75 p-1 shadow-sm backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("mauna_lang", "tr");
                  setLang("tr");
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${lang === "tr" ? "bg-[#b69463] text-white" : "text-[#7d6c58]"}`}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("mauna_lang", "en");
                  setLang("en");
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${lang === "en" ? "bg-[#b69463] text-white" : "text-[#7d6c58]"}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#b69463]">MAUNA Couture v1</p>
            <h1 className="mt-3 text-[2.25rem] font-black leading-none tracking-[-0.055em] text-[#211b16]">{copy.title}</h1>
            <p className="mx-auto mt-3 max-w-[265px] text-[14px] leading-6 text-[#7d6c58]">{copy.subtitle}</p>
          </div>

          <div className="mt-6 grid gap-3.5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#6d6256]">{copy.email}</span>
              <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#eadfce] bg-[#fcfaf7] px-4 py-3">
                <Mail size={20} className="text-[#8a7f72]" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={copy.emailPlaceholder} className="w-full bg-transparent text-[16px] font-semibold outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#6d6256]">{copy.password}</span>
              <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#eadfce] bg-[#fcfaf7] px-4 py-3">
                <LockKeyhole size={20} className="text-[#8a7f72]" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-transparent text-[16px] font-semibold outline-none" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>
          </div>

          {message && <div className="mt-4 rounded-full border border-[#eadfce] bg-[#fcfaf7] px-4 py-3 text-sm font-bold text-[#7d6c58]">{message}</div>}

          <button onClick={login} disabled={loading} className="mt-5 flex w-full items-center justify-between rounded-[1.35rem] bg-gradient-to-r from-[#b69463] to-[#d8bd84] py-3 pl-5 pr-3 text-base font-black text-white shadow-[0_22px_55px_rgba(182,148,99,.30)] disabled:opacity-60">
            <span>{loading ? copy.loading : copy.login}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#b69463] shadow-lg">
              <ShieldCheck size={22} />
            </span>
          </button>

          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            <a href="/forgot-password" className="flex items-center justify-center gap-2 rounded-[1.1rem] border border-[#eadfce] bg-white/70 px-2.5 py-2.5 text-center text-[13px] font-black text-[#6d6256] shadow-sm">
              <KeyRound size={18} /> {copy.forgot}
            </a>

            <a href="/register" className="flex items-center justify-center gap-2 rounded-[1.1rem] border border-[#eadfce] bg-white/70 px-2.5 py-2.5 text-center text-[13px] font-black text-[#6d6256] shadow-sm">
              <UserPlus size={18} /> {copy.register}
            </a>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#8a7f72]">
            <span>MAUNA Couture v1</span>
            <span>{copy.secure}</span>
          </div>
        </div>

        <p className="mt-5 text-center text-sm font-semibold text-[#8a7f72]">{copy.footer}</p>
      </section>
    </main>
  );
}