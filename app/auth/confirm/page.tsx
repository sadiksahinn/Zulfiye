"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function handleConfirm() {
      // Supabase detectSessionInUrl ile hash'i işliyor, getSession ile oturumu alıyoruz
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus("success");
      } else {
        // Hash henüz işlenmemişse onAuthStateChange ile bekle
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
          if (s) {
            setStatus("success");
            subscription.unsubscribe();
          } else {
            setStatus("error");
            subscription.unsubscribe();
          }
        });

        // 5 saniye sonra hâlâ session yoksa hata göster
        setTimeout(() => {
          setStatus((prev) => prev === "loading" ? "error" : prev);
        }, 5000);
      }
    }

    handleConfirm();
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    if (countdown === 0) {
      router.replace("/today");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f0e7] px-5 py-8 text-[#211b16]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.96),transparent_38%),linear-gradient(135deg,#fbf7ef_0%,#f4eadc_100%)]" />

      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-[#eadfce] bg-white/85 p-10 text-center shadow-[0_40px_110px_rgba(118,93,60,.18)] backdrop-blur-2xl">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_18px_45px_rgba(118,93,60,.15)]">
            <Image src="/mauna-logo.png" alt="MAUNA" width={56} height={56} className="object-contain" />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#b69463]">
            MAUNA Couture
          </p>

          {status === "loading" && (
            <>
              <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#211b16]">
                Doğrulanıyor...
              </h1>
              <p className="mt-3 text-sm text-[#7d6c58]">
                Hesabınız kontrol ediliyor, lütfen bekleyin.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#eadfce] border-t-[#b69463]" />
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mt-4 flex justify-center text-[#b69463]">
                <CheckCircle2 size={52} strokeWidth={1.8} />
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#211b16]">
                Hesabınız Doğrulandı
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#7d6c58]">
                Hoş geldiniz! MAUNA Couture sistemine başarıyla kaydoldunuz.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b69463]/10 text-xl font-black text-[#b69463]">
                  {countdown}
                </div>
                <p className="text-xs font-bold text-[#9d8b74]">
                  saniye içinde sisteme yönlendiriliyorsunuz...
                </p>
              </div>
              <button
                onClick={() => router.replace("/today")}
                className="mt-6 w-full rounded-2xl bg-[#211b16] py-4 font-black text-white"
              >
                Hemen Giriş Yap
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#211b16]">
                Doğrulama Başarısız
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#7d6c58]">
                Bağlantı süresi dolmuş veya geçersiz. Lütfen tekrar kayıt olmayı deneyin.
              </p>
              <button
                onClick={() => router.replace("/")}
                className="mt-8 w-full rounded-2xl bg-[#211b16] py-4 font-black text-white"
              >
                Giriş Ekranına Dön
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
