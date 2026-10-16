import React from 'react';
import { SystemStatus } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';

export function TerminalHeader({
  systemStatus,
  onOpenUpload,
  isMobileMenuOpen,
  onToggleMobileMenu,
}: {
  systemStatus?: SystemStatus | null;
  onOpenUpload: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}) {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).toUpperCase()
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#005522] bg-[#020602] px-2 sm:px-4 py-2 text-[10px] sm:text-[11px] font-mono text-[#00ff66] select-none">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-2">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] px-2 py-1 text-xs font-bold transition-all"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? '[✕]' : '[☰]'}
          </button>
        )}
        <span className="font-bold tracking-wider text-[#00ff66] terminal-glow truncate max-w-[200px] sm:max-w-none">
          MEMENTO.EXE <span className="hidden sm:inline">- VISUAL-MEMORY-SYSTEM v1.0.0</span>
        </span>
      </div>

      {/* Status Badges, User Auth & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px]">
        <div className="hidden lg:block">
          [ CLOUDINARY: <span className={systemStatus?.cloudinaryConfigured ? "text-[#00ff66] font-bold" : "text-amber-400 font-bold"}>
            {systemStatus?.cloudinaryConfigured ? "ONLINE" : "OFFLINE"}
          </span> ]
        </div>

        <div className="hidden lg:block">
          [ AI ENGINE: <span className={systemStatus?.aiConfigured ? "text-[#00ff66] font-bold" : "text-amber-400 font-bold"}>
            {systemStatus?.aiConfigured ? "ONLINE" : "STANDBY"}
          </span> ]
        </div>

        {/* User Account / Google Auth Status */}
        {user ? (
          <div className="flex items-center gap-1.5 border border-[#005522] bg-[#010401] px-1.5 sm:px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
            <span className="text-[#00ff66] font-bold truncate max-w-[80px] sm:max-w-[120px]">{user.name}</span>
            <button
              onClick={logout}
              className="text-[#ff6666] hover:underline font-bold ml-0.5"
              title="Sign out of private vault"
            >
              [OUT]
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] text-[#00ff66] px-1.5 sm:px-2 py-0.5 font-bold"
          >
            [ LOGIN ]
          </Link>
        )}

        <div className="hidden xl:block text-[#00aa44]">
          {currentTime || 'OCT 17 2026'}
        </div>

        <button
          onClick={onOpenUpload}
          className="border border-[#00ff66] bg-[#00220a] hover:bg-[#004414] text-[#00ff66] px-2 sm:px-2.5 py-1 sm:py-0.5 font-bold transition-all hover:shadow-[0_0_8px_#00ff66]"
        >
          [ + UPLOAD ]
        </button>
      </div>
    </header>
  );
}
