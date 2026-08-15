'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { LayoutDashboard, Shirt, PlusCircle, Bookmark, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Wardrobe', href: '/wardrobe', icon: Shirt },
    { name: 'Upload Item', href: '/wardrobe/upload', icon: PlusCircle },
    { name: 'Generate Outfit', href: '/outfits/new', icon: PlusCircle }, // Use different icon?
    { name: 'Saved Outfits', href: '/outfits', icon: Bookmark },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 h-screen z-20">
        <div className="h-14 flex items-center px-6 border-b border-zinc-800">
          <Link href="/dashboard" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            Outfit.ai
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-800 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-900 flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.full_name}</span>
              <span className="text-xs text-zinc-500 truncate">{user?.email}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-h-screen">
        {/* Subtle background gradient overlay for the main content */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        {/* Page Content */}
        <div className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
