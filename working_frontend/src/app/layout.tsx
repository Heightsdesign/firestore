import './globals.css';

export const metadata = {
  title: 'Business Zone Finder',
  description: 'Find the best zones for your business',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}