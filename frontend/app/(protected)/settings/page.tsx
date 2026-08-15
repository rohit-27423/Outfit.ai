'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/store/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    default_location: '',
    preferred_style: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadPreferences() {
      try {
        const data = await apiFetch('/preferences');
        setPreferences({
          default_location: data.default_location || '',
          preferred_style: data.preferred_style || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiFetch('/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      });
      setMessage('Preferences saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-zinc-800 rounded-xl">
          <SettingsIcon className="w-6 h-6 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400">Manage your account preferences</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium">Default Location</Label>
            <p className="text-xs text-zinc-500 mb-2">Used to automatically fetch local weather when generating outfits.</p>
            <Input 
              placeholder="e.g. New York, US"
              value={preferences.default_location} 
              onChange={e => setPreferences({...preferences, default_location: e.target.value})}
              className="bg-zinc-900/80 border-zinc-700 text-white focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm font-medium">Preferred Style</Label>
            <p className="text-xs text-zinc-500 mb-2">Hints for the AI stylist (e.g. minimalist, streetwear, business casual).</p>
            <Input 
              placeholder="e.g. Minimalist"
              value={preferences.preferred_style} 
              onChange={e => setPreferences({...preferences, preferred_style: e.target.value})}
              className="bg-zinc-900/80 border-zinc-700 text-white focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <p className={`text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
              {message}
            </p>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[120px]" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
