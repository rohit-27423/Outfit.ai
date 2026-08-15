'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type WardrobeItem = {
  id: string;
  image_url: string;
  category: string;
  color: string;
  sub_category?: string;
  tags?: string[];
  season?: string[];
};

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await apiFetch('/wardrobe/items');
        // The API returns { items: [], ... } for paginated responses based on our wardrobe.py router
        setItems(data.items || []);
      } catch (err) {
        console.error("Failed to load wardrobe", err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiFetch(`/wardrobe/items/${id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.category?.toLowerCase().includes(search.toLowerCase()) || 
                          item.color?.toLowerCase().includes(search.toLowerCase()) ||
                          item.sub_category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Wardrobe</h1>
          <p className="text-zinc-400">Manage your digitized clothing items.</p>
        </div>
        <Link href="/wardrobe/upload">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by color or type..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:max-w-xs"
        />
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:max-w-xs appearance-none"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Your wardrobe is empty</h2>
          <p className="text-zinc-400 max-w-sm mb-6">Start digitizing your closet by uploading photos of your clothes. Our AI will automatically categorize them.</p>
          <Link href="/wardrobe/upload">
            <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">
              Upload First Item
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer">
              {/* Actions Overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                <Link href={`/wardrobe/${item.id}/edit`}>
                  <Button size="icon" variant="secondary" className="w-8 h-8 bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-sm border border-zinc-700">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="icon" variant="destructive" className="w-8 h-8 bg-red-900/80 hover:bg-red-800 text-white backdrop-blur-sm border border-red-700" onClick={(e) => { e.preventDefault(); handleDelete(item.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.image_url} 
                alt={item.category} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 backdrop-blur-md border border-emerald-500/30">
                    {item.category}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-zinc-800/80 text-zinc-300 backdrop-blur-md border border-zinc-700">
                    {item.color}
                  </span>
                </div>
                {item.sub_category && (
                  <p className="text-white font-medium text-sm capitalize">{item.sub_category}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
