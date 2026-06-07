import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { phone, message } = await request.json();

  const usercode = process.env.NETGSM_USERCODE;
  const password = process.env.NETGSM_PASSWORD;
  const msgheader = process.env.NETGSM_MSGHEADER || "ZÜLFİYE CANBOLAT";

  if (!usercode || !password) {
    return NextResponse.json({ success: false, error: "Netgsm credentials tanımlı değil." });
  }

  const digits = String(phone).replace(/\D/g, "");
  const cleanPhone = digits.startsWith("90") ? digits
    : digits.startsWith("0") ? `90${digits.slice(1)}`
    : digits.length === 10 ? `90${digits}` : digits;

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

  try {
    const response = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlBody,
    });
    const text = await response.text();
    const code = text.trim().split(" ")[0];
    if (["00", "01", "02"].includes(code)) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: `Netgsm kod: ${code}` });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
