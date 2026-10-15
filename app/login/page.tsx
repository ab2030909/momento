'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const { user, loginWithGoogleCredential, loginWithGoogleSimulated } = useAuth();
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleClientReady, setGoogleClientReady] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [showSimulatedInput, setShowSimulatedInput] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Load Google Identity Services (GSI) script dynamically
  useEffect(() => {
    const scriptId = 'google-gsi-client';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleClientReady(true);
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      setGoogleClientReady(true);
    }
  }, []);

  // Initialize official Google OAuth Button
  useEffect(() => {
    if (googleClientReady && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1088481234567-placeholder.apps.googleusercontent.com';

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              loginWithGoogleCredential(response.credential);
              router.push('/');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render standard professional Google button
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 340,
        });
      } catch (err) {
        console.warn('Google GSI button initialization:', err);
      }
    }
  }, [googleClientReady, loginWithGoogleCredential, router]);

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithGoogleSimulated(simulatedEmail || 'user@gmail.com');
    router.push('/');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 font-mono text-xs text-[#00ff66]">
      <div className="relative w-full max-w-md border-2 border-[#00ff66] bg-[#020502] p-6 shadow-[0_0_30px_rgba(0,255,102,0.25)] space-y-6">
        {/* Terminal Header */}
        <div className="border-b border-[#005522] pb-4 text-center">
          <pre className="text-[10px] leading-[11px] text-[#00ff66] terminal-glow mb-2 font-bold inline-block text-left">
{` ███   ███ 
 ████ ████ 
 ██ ███ ██ 
 ██  █  ██ 
 ██     ██ `}
          </pre>
          <h1 className="text-base font-bold tracking-widest text-[#00ff66]">
            MEMENTO.EXE - AUTH_GATEWAY
          </h1>
          <p className="text-[10px] text-[#00aa44] mt-1">
            // SECURE GOOGLE SSO OAUTH 2.0 PROTOCOL
          </p>
        </div>

        {/* Security Notice */}
        <div className="border border-[#005522] bg-[#010401] p-3 text-[10px] text-[#00aa44] space-y-1.5">
          <div className="flex items-center gap-2 text-[#00ff66] font-bold">
            <Lock className="h-3.5 w-3.5" />
            <span>VAULT ISOLATION PROTOCOL</span>
          </div>
          <p className="leading-relaxed">
            • Demo visual memories remain visible to all users.
          </p>
          <p className="leading-relaxed">
            • All personal memories, screenshots, or receipts you upload are tied strictly to your Google account. <strong>No other user can inspect, view, or search your personal files.</strong>
          </p>
        </div>

        {/* Official Google OAuth Container */}
        <div className="space-y-4 pt-1">
          <div className="text-[10px] text-[#00ff66] font-bold text-center tracking-wider">
            [ AUTHENTICATE WITH GOOGLE IDENTITY SERVICE ]
          </div>

          <div className="flex flex-col items-center justify-center py-1">
            {/* Real Google GSI Button Mount */}
            <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />

            {/* Direct Google Popup Trigger Button */}
            <button
              type="button"
              onClick={() => {
                if (window.google?.accounts?.id) {
                  window.google.accounts.id.prompt();
                } else {
                  setShowSimulatedInput(true);
                }
              }}
              className="mt-3 group flex w-full items-center justify-center gap-3 border-2 border-[#00ff66] bg-[#00220a] hover:bg-[#004414] py-3 text-xs font-bold text-[#00ff66] tracking-wider transition-all hover:shadow-[0_0_15px_#00ff66]"
            >
              {/* Google SVG Icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>
          </div>

          {/* Quick manual / dev override toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowSimulatedInput(!showSimulatedInput)}
              className="text-[9px] text-[#00aa44] hover:text-[#00ff66] underline w-full text-center"
            >
              {showSimulatedInput ? '[-] HIDE MANUAL GOOGLE EMAIL' : '[+] TEST WITH SPECIFIC GOOGLE EMAIL (LOCAL DEV)'}
            </button>

            {showSimulatedInput && (
              <form onSubmit={handleSimulatedSubmit} className="mt-2 space-y-2 border border-[#005522] bg-[#010401] p-3">
                <label className="block text-[9px] text-[#00aa44]">ENTER GOOGLE EMAIL:</label>
                <input
                  type="email"
                  value={simulatedEmail}
                  onChange={(e) => setSimulatedEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full border border-[#005522] bg-[#020502] px-2 py-1 text-xs text-[#00ff66] focus:border-[#00ff66] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] py-1 font-bold text-[#00ff66]"
                >
                  [ SIGN IN AS THIS USER ]
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#005522] pt-3 text-center text-[9px] text-[#007733]">
          MEMENTO.EXE v1.0.0 // OAUTH 2.0 ENCRYPTED TUNNEL
        </div>
      </div>
    </div>
  );
}
