import type { Metadata } from 'next';
import './globals.css';
import { ClientAppShell } from '@/components/ClientAppShell';
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata: Metadata = {
  title: 'MEMENTO.EXE - VISUAL-MEMORY-SYSTEM v1.0.0',
  description: 'Cyberpunk terminal interface for visual memory search powered by Cloudinary and Groq AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark crt">
      <body className="antialiased bg-[#030603] text-[#00ff66] font-mono selection:bg-[#00ff66]/20 selection:text-[#00ff66]">
        <AuthProvider>
          <ClientAppShell>{children}</ClientAppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
