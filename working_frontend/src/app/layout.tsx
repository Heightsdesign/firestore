import './globals.css';
import NavBar from '@/components/NavBar';

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
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}