import './globals.css';

export const metadata = {
  title: 'Firestore - Find the perfect spot for your endeavour',
  description: 'Find the best zones for your business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}