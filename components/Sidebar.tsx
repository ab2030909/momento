'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Images,
  FolderKanban,
  Clock,
  Sparkles,
  Settings,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SystemStatus } from '@/types';

interface SidebarProps {
  systemStatus?: SystemStatus | null;
}

export function Sidebar({ systemStatus }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const navigation = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'All Memories', href: '/memories', icon: Images },
    { name: 'Collections', href: '/collections', icon: FolderKanban },
    { name: 'Visual Timeline', href: '/timeline', icon: Clock },
    { name: 'Similar Explorer', href: '/similar', icon: Sparkles },
    { name: 'Settings & Status', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-800/80 bg-[#0b1120] transition-all duration-300 ease-in-out z-30 select-none min-h-screen',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-lg">Memento</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-cyan-400">
                Visual Memory
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tagline / Spotlight Note */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
            <p className="font-medium text-slate-200 mb-1">Cloudinary DevJams</p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              "Your files remember where they are. Memento remembers what they contain."
            </p>
          </div>
        </div>
      )}

      {/* Footer Cloudinary / Storage Status */}
      <div className="border-t border-slate-800/80 p-3 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-sky-400">
            <Cloud className="h-4 w-4" />
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full',
                systemStatus?.cloudinaryConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              )}
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-slate-200 truncate">
                {systemStatus?.cloudinaryConfigured ? systemStatus.cloudName : 'Demo Pipeline'}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {systemStatus?.cloudinaryConfigured ? 'Cloudinary Signed' : 'Local / Demo Mode'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
