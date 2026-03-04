// app/layout.tsx

import './globals.css';
import { LeagueProvider } from '../contexts/LeagueContext'; // Adjust the import path as needed
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Football App',
  description: 'Football leagues and matches',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LeagueProvider>
          {children}
        </LeagueProvider>
        <Analytics />
      </body>
    </html>
  );
}