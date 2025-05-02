// app/api/email-report/route.ts
import { NextResponse } from 'next/server';
import * as sg from '@sendgrid/mail';

sg.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, pdfBase64 } = await req.json();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    await sg.send({
      to: email,
      from: {
        email: process.env.FROM_EMAIL!,
        name : process.env.FROM_NAME  || 'Firestore Reports',
      },
      subject: 'Your Firestore location report',
      text   : 'Thanks for using Firestore. Your PDF report is attached.',
      attachments: [
        {
          content     : pdfBase64,
          filename    : 'firestore-report.pdf',
          type        : 'application/pdf',
          disposition : 'attachment',
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('SendGrid error:', err);
    return NextResponse.json({ error: 'Mail failed' }, { status: 500 });
  }
}
