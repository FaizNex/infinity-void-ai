import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Infinity Void AI',
  description: 'Next-Gen Intelligence Workspace',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Infinity Void AI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#070a12" />
      </head>
      <body className={`${inter.className} bg-[#070a12] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}