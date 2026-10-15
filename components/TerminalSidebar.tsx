'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderKanban,
  Images,
  LayoutDashboard,
  Search,
  Sparkles,
  Clock,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SystemStatus } from '@/types';

export function TerminalSidebar({ systemStatus }: { systemStatus?: SystemStatus | null }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'OVERVIEW', href: '/' },
    { name: 'ALL MEMORIES', href: '/memories' },
    { name: 'SEARCH', href: '/search' },
    { name: 'SIMILAR IMAGES', href: '/similar' },
    { name: 'COLLECTIONS', href: '/collections' },
    { name: 'TIMELINE', href: '/timeline' },
  ];

  return (
    <aside className="w-56 shrink-0 flex flex-col border border-[#005522] bg-[#030804] text-[#00ff66] p-3 text-xs font-mono select-none">
      {/* ASCII Logo / Hex Brand */}
      <div className="flex flex-col items-center justify-center py-4 border-b border-[#005522]/80 mb-3">
        {/* Pixelated / Wireframe M Logo */}
        <pre className="text-[9px] leading-[10px] text-[#00ff66] terminal-glow mb-1 font-bold">
{` ███   ███ 
 ████ ████ 
 ██ ███ ██ 
 ██  █  ██ 
 ██     ██ `}
        </pre>
        <div className="text-center font-bold tracking-widest text-[#00ff66] text-sm">
          MEMENTO
        </div>
        <div className="text-[9px] text-[#00aa44] tracking-wider uppercase">
          VISUAL MEMORY
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 my-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 transition-all text-[11px] font-bold tracking-wider',
                isActive
                  ? 'bg-[#003311] text-[#00ff66] border-l-2 border-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                  : 'text-[#00aa44] hover:text-[#00ff66] hover:bg-[#00220a]'
              )}
            >
              <span>{isActive ? '>' : ' '}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Storage Gauge */}
      <div className="border-t border-[#005522] pt-3 pb-3">
        <div className="flex justify-between text-[10px] text-[#00aa44] mb-1 font-semibold">
          <span>STORAGE</span>
          <span className="text-[#00ff66]">2.4 GB / 25 GB</span>
        </div>
        <div className="h-1.5 w-full bg-[#00220a] border border-[#005522] overflow-hidden">
          <div className="h-full bg-[#00ff66] w-[18%] shadow-[0_0_5px_#00ff66]" />
        </div>
      </div>

      {/* Wireframe Globe / Scanner graphic */}
      <div className="flex flex-col items-center justify-center p-2 border border-[#005522] bg-[#020502] mb-3">
        <div className="relative h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#00aa44]/50 animate-spin" style={{ animationDuration: '18s' }} />
          <div className="absolute inset-1 rounded-full border border-dashed border-[#00ff66]/60 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-3 rounded-full border border-dotted border-[#00aa44]" />
          <div className="h-1 w-full bg-[#00ff66]/20 absolute animate-pulse" />
          <span className="text-[8px] text-[#00ff66] font-mono tracking-tighter">MEMENTO</span>
        </div>
      </div>

      {/* Operations list */}
      <div className="space-y-0.5 text-[9px] text-[#00aa44] border-t border-[#005522] pt-2 mb-2">
        <div className="hover:text-[#00ff66] cursor-pointer">+ SCAN</div>
        <div className="hover:text-[#00ff66] cursor-pointer">+ ANALYZE</div>
        <div className="hover:text-[#00ff66] cursor-pointer">+ INDEX</div>
        <div className="hover:text-[#00ff66] cursor-pointer">+ RECALL</div>
        <div className="hover:text-[#00ff66] cursor-pointer">+ VISUALIZE</div>
      </div>

      {/* Terminal prompt footer */}
      <div className="border-t border-[#005522] pt-2 text-[10px] text-[#00ff66] flex items-center gap-1 font-bold">
        <span>C:\MEMENTO&gt;</span>
        <span className="inline-block w-2 h-3.5 bg-[#00ff66] cursor-blink" />
      </div>
    </aside>
  );
}
