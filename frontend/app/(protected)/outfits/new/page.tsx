'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Sparkles, Loader2, CloudSun, CheckCircle2 } from 'lucide-react';

type RecommendationResponse = {
  id: string;
  occasion: string;
  weather_snapshot: any;
  explanation: string;
  items: Array<{
    id: string;
    role: string;
    wardrobe_item: any;
  }>;
};

export default function GenerateOutfitPage() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [occasion, setOccasion] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !occasion) return;
    setGenerating(true);
    setResult(null);
    try {
      const data = await apiFetch('/recommendations', {
        method: 'POST',
        body: JSON.stringify({ location, occasion }),
      });
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await apiFetch('/saved-outfits', {
        method: 'POST',
        body: JSON.stringify({
          name: `${occasion} in ${location}`,
          notes: result.explanation,
          wardrobe_item_ids: result.items.map(i => i.wardrobe_item.id)
        }),
      });
      router.push('/outfits');
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      
      {!result ? (
        <div className="max-w-xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Style me for...</h1>
            <p className="text-zinc-400">Tell us where you're going. We'll check the weather and your wardrobe.</p>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
            
            <form onSubmit={handleGenerate}>
              <CardContent className="space-y-6 pt-8">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-zinc-300 font-medium">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      id="location" 
                      placeholder="e.g. New York, USA" 
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="bg-zinc-950/50 border-zinc-800 text-white pl-10 h-12 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasion" className="text-zinc-300 font-medium">Occasion</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      id="occasion" 
                      placeholder="e.g. Casual dinner, Office, Gym" 
                      value={occasion}
                      onChange={e => setOccasion(e.target.value)}
                      className="bg-zinc-950/50 border-zinc-800 text-white pl-10 h-12 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pb-8 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-200 text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                  disabled={!location || !occasion || generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" /> Generate Outfit
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Outfit is Ready</h1>
              <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800 w-fit">
                <CloudSun className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">{result.weather_snapshot?.temp_c}°C, {result.weather_snapshot?.condition}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-white" onClick={() => setResult(null)}>
                Regenerate
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" onClick={handleSave}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Save to Wardrobe
              </Button>
            </div>
          </div>

          <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl relative">
            <Sparkles className="absolute top-6 right-6 w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Stylist Notes</h3>
            <p className="text-zinc-300 leading-relaxed">{result.explanation}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {result.items.map((item) => (
              <div key={item.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.wardrobe_item.image_url} 
                  alt={item.wardrobe_item.category} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-xs uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 backdrop-blur-md border border-purple-500/30 inline-block mb-1">
                    {item.role}
                  </span>
                  <p className="text-white font-medium capitalize">{item.wardrobe_item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
