'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { apiFetch } from '@/lib/api';
import { Shirt, Bookmark, Droplets, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ items: 0, outfits: 0, distribution: {} as Record<string, number> });
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, itemsData] = await Promise.all([
          apiFetch('/wardrobe/stats'),
          apiFetch('/wardrobe/items')
        ]);
        
        setStats({
          items: statsData.items || 0,
          outfits: statsData.outfits || 0,
          distribution: statsData.distribution || {}
        });
        setRecentItems((itemsData.items || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // For the distribution chart
  const totalItems = stats.items || 1; // avoid division by zero
  const sortedDistribution = Object.entries(stats.distribution).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-2">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-zinc-400">Here's what's happening with your digital wardrobe today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Wardrobe Items</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {loading ? <span className="text-zinc-700 animate-pulse">--</span> : stats.items}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Saved Outfits</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {loading ? <span className="text-zinc-700 animate-pulse">--</span> : stats.outfits}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-zinc-100">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/outfits/new" className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white transition-all group-hover:scale-110">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-medium">Generate Outfit</h3>
                <p className="text-sm text-zinc-400 mt-1">Let AI style you based on weather</p>
              </div>
            </Link>

            <Link href="/wardrobe/upload" className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white transition-all group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-medium">Add to Wardrobe</h3>
                <p className="text-sm text-zinc-400 mt-1">Upload a photo to categorize</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-zinc-100">Wardrobe Breakdown</h2>
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm space-y-6">
            {!loading && sortedDistribution.length === 0 && (
              <p className="text-sm text-zinc-500 italic">Upload clothes to see stats.</p>
            )}
            {sortedDistribution.map(([category, count]) => {
              const percent = Math.round((count / totalItems) * 100);
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300 capitalize">{category}</span>
                    <span className="text-zinc-500">{percent}%</span>
                  </div>
                  <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500/80 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-zinc-100">Recent Uploads</h2>
          <Link href="/wardrobe" className="text-emerald-500 hover:text-emerald-400 text-sm">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            [1,2,3,4].map(i => <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800"></div>)
          ) : recentItems.length === 0 ? (
            <p className="col-span-full text-zinc-500 text-sm">No items uploaded yet.</p>
          ) : (
            recentItems.map(item => (
              <div key={item.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-white text-sm font-medium capitalize">{item.category}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

  );
}
