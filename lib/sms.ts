// Netgsm SMS Entegrasyonu
// .env.local dosyasına ekle:
// NETGSM_USERCODE=kullanici_kodunuz
// NETGSM_PASSWORD=sifreniz
// NETGSM_MSGHEADER=ZÜLFİYE CANBOLAT (İYS'de kayıtlı başlık)

export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const msgheader = process.env.NETGSM_MSGHEADER || "ZÜLFİYE CANBOLAT";

  if (!usercode || !password) {
    console.warn("Netgsm credentials eksik, SMS gönderilemedi.");
    return { success: false, error: "SMS credentials eksik" };
  }

  // Telefon numarasını formatla (905xxxxxxxxx)
  const digits = phone.replace(/\D/g, "");
  const cleanPhone = digits.startsWith("90") ? digits : digits.startsWith("0") ? `90${digits.slice(1)}` : digits.length === 10 ? `90${digits}` : digits;

  if (cleanPhone.length !== 12) {
    return { success: false, error: "Geçersiz telefon numarası" };
  }

  try {
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <company dil="TR">Netgsm</company>
    <usercode>${usercode}</usercode>
    <password>${password}</password>
    <type>1:n</type>
    <msgheader>${msgheader}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>${cleanPhone}</no>
  </body>
</mainbody>`;

    const response = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlBody,
    });

    const text = await response.text();

    // Netgsm başarı kodları: 00, 01, 02
    const code = text.trim().split(" ")[0];
    if (["00", "01", "02"].includes(code)) {
      return { success: true };
    } else {
      return { success: false, error: `Netgsm hata kodu: ${code}` };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Hazır mesaj şablonları
export const smsTemplates = {
  provaHatirlatma: (name: string, date: string, time?: string) =>
    `Merhaba ${name}, Zülfiye Canbolat Gelinlik prova randevunuz ${date}${time ? ` saat ${time}` : ""} olarak planlanmıştır. Sizi bekliyoruz.`,

  teslimHazir: (name: string, productName?: string) =>
    `Merhaba ${name}, ${productName || "ürününüz"} teslim için hazırdır. Detay için bizi arayabilirsiniz. Zülfiye Canbolat Gelinlik`,

  iadeHatirlatma: (name: string, productName?: string) =>
    `Merhaba ${name}, Zülfiye Canbolat Gelinlik'dan kiraladığınız ${productName || "ürün"} için iade tarihiniz bugündür. Bilginize sunarız.`,

  kalanOdeme: (name: string, amount: number) =>
    `Merhaba ${name}, Zülfiye Canbolat Gelinlik işleminiz için ${amount.toLocaleString("tr-TR")} TL kalan ödemeniz bulunmaktadır. Bilginize sunarız.`,

  tesekkur: (name: string) =>
    `Merhaba ${name}, Zülfiye Canbolat Gelinlik'u tercih ettiğiniz için teşekkür ederiz. Güzel günler dileriz! Google yorumunuz için: g.page/zulfiyecouture`,
};
