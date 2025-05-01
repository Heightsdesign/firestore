// app/api/email-report/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// configure env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
});

export async function POST(request: Request) {
  const { email, pdfBase64 } = await request.json();

  try {
    await transporter.sendMail({
      from: '"Firestore Reports" <no-reply@firestore.ai>',
      to: email,
      subject: 'Your location analysis report',
      text: 'Attached is the PDF report you requested.',
      attachments: [
        { filename: 'report.pdf', content: pdfBase64, encoding: 'base64' },
      ],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
