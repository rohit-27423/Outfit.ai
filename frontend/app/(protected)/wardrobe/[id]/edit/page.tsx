'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function EditWardrobeItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await apiFetch(`/wardrobe/items/${params.id}`);
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/wardrobe/items/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          category: item.category,
          sub_category: item.sub_category,
          color: item.color,
          formality: item.formality,
        }),
      });
      router.push('/wardrobe');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>;
  if (!item) return <div className="text-center py-12 text-zinc-400">Item not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Item Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt="Item" className="w-full rounded-2xl border border-zinc-800" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-zinc-300">Category</Label>
            <Input 
              value={item.category || ''} 
              onChange={e => setItem({...item, category: e.target.value})}
              className="bg-zinc-900/50 border-zinc-800 text-white"
            />
          </div>
          <div>
            <Label className="text-zinc-300">Sub Category</Label>
            <Input 
              value={item.sub_category || ''} 
              onChange={e => setItem({...item, sub_category: e.target.value})}
              className="bg-zinc-900/50 border-zinc-800 text-white"
            />
          </div>
          <div>
            <Label className="text-zinc-300">Primary Color</Label>
            <Input 
              value={item.color || ''} 
              onChange={e => setItem({...item, color: e.target.value})}
              className="bg-zinc-900/50 border-zinc-800 text-white"
            />
          </div>
          <div>
            <Label className="text-zinc-300">Formality</Label>
            <Input 
              value={item.formality || ''} 
              onChange={e => setItem({...item, formality: e.target.value})}
              className="bg-zinc-900/50 border-zinc-800 text-white"
            />
          </div>
          <div className="pt-4 flex gap-4">
            <Button type="button" variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-white" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
