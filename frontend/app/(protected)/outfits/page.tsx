'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Sparkles, Calendar, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SavedOutfit = {
  id: string;
  name: string;
  notes: string;
  created_at: string;
  is_favorite: boolean;
  items: Array<{
    id: string;
    wardrobe_item: any;
  }>;
};

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOutfits() {
      try {
        const data = await apiFetch('/saved-outfits');
        setOutfits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOutfits();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/saved-outfits/${id}`, { method: 'DELETE' });
      setOutfits(outfits.filter(o => o.id !== id));
    } catch(e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await apiFetch(`/saved-outfits/${id}`, { 
        method: 'PATCH',
        body: JSON.stringify({ is_favorite: !currentStatus })
      });
      setOutfits(outfits.map(o => o.id === id ? { ...o, is_favorite: !currentStatus } : o));
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Saved Outfits</h1>
          <p className="text-zinc-400">Your AI-curated looks ready to wear.</p>
        </div>
        <Link href="/outfits/new">
          <Button className="bg-white text-zinc-950 hover:bg-zinc-200">
            <Sparkles className="w-4 h-4 mr-2" /> Generate New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800"></div>
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <BookmarkIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No outfits saved yet</h2>
          <p className="text-zinc-400 max-w-sm mb-6">Let our AI generate the perfect outfit for you based on the weather and your wardrobe.</p>
          <Link href="/outfits/new">
            <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">
              Try the Stylist
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`hover:bg-zinc-800 ${outfit.is_favorite ? 'text-red-500 hover:text-red-600' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => handleToggleFavorite(outfit.id, outfit.is_favorite)}
                >
                  <Heart className={`w-5 h-5 ${outfit.is_favorite ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(outfit.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">{new Date(outfit.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 capitalize">{outfit.name || 'Casual Look'}</h3>
              <p className="text-sm text-zinc-400 mb-6 line-clamp-2">{outfit.notes}</p>
              
              <div className="flex -space-x-4 overflow-hidden">
                {outfit.items.slice(0, 4).map((item, idx) => (
                  <div key={item.id} className="inline-block h-20 w-20 rounded-full ring-4 ring-zinc-900 overflow-hidden bg-zinc-800 z-[idx]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.wardrobe_item.image_url} 
                      alt="outfit item" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {outfit.items.length > 4 && (
                  <div className="inline-flex h-20 w-20 rounded-full ring-4 ring-zinc-900 bg-zinc-800 items-center justify-center z-10">
                    <span className="text-xs font-medium text-white">+{outfit.items.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    </svg>
  )
}
