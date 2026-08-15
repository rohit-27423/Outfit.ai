'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiFetch('/wardrobe/items', {
        method: 'POST',
        // Do not set Content-Type header here, browser will set it to multipart/form-data with boundary
        body: formData,
      });
      router.push('/wardrobe');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload item. Make sure backend Cloudinary/Gemini keys are set.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Digitize an Item</h1>
        <p className="text-zinc-400">Upload a photo of your clothing. Gemini AI will automatically detect the category, color, and style.</p>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-md shadow-xl relative overflow-hidden">
        {/* Subtle gradient behind */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!preview ? (
          <div 
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:text-emerald-400 transition-all mb-4 shadow-lg">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">Click to upload</h3>
            <p className="text-sm text-zinc-500">SVG, PNG, JPG or GIF (max. 10MB)</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
              
              {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-emerald-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-emerald-400 font-medium animate-pulse">Gemini AI is analyzing...</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 border-zinc-700 hover:bg-zinc-800 text-white"
                onClick={() => { setFile(null); setPreview(null); }}
                disabled={uploading}
              >
                Choose Another
              </Button>
              <Button 
                className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                  </>
                ) : (
                  'Upload & Analyze'
                )}
              </Button>
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  )
}
