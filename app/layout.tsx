import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PIM Mortgage Dashboard',
  description: 'Loan servicing dashboard and mortgage statement generator for PIM Income Fund',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50">{children}</div>
      </body>
    </html>
  );
}
