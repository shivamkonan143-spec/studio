'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Youtube, Download, RefreshCcw, Loader2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
});

type Step = 'input' | 'preview';
type ThumbnailQuality = 'maxresdefault' | 'sddefault' | 'hqdefault' | 'mqdefault' | 'default';

const qualityLabels: Record<ThumbnailQuality, string> = {
    maxresdefault: 'Maximum',
    sddefault: 'HD (720p)',
    hqdefault: 'SD (480p)',
    mqdefault: 'High (360p)',
    default: 'Medium (120p)',
};

function getYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1).split('?')[0];
    }
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      if (urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      }
    }
  } catch (e) {
    console.error('Invalid URL for video ID extraction', e);
    return null;
  }
  return null;
}

export function YoutubeTool() {
  const [step, setStep] = useState<Step>('input');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState<ThumbnailQuality>('maxresdefault');


  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });
  
  const updateThumbnailUrl = (id: string, newQuality: ThumbnailQuality) => {
    setThumbnailUrl(`https://img.youtube.com/vi/${id}/${newQuality}.jpg`);
  };

  const handleQualityChange = (newQuality: ThumbnailQuality) => {
      if (videoId) {
          setQuality(newQuality);
          updateThumbnailUrl(videoId, newQuality);
      }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    const extractedVideoId = getYouTubeVideoId(values.url);
    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      const initialQuality = 'maxresdefault';
      setQuality(initialQuality);
      updateThumbnailUrl(extractedVideoId, initialQuality);
      setStep('preview');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Could not extract a YouTube video ID from the URL. Please try another link.',
      });
      setThumbnailUrl(null);
      setVideoId(null);
    }
    setIsGenerating(false);
  };

  const handleDownloadThumbnail = async () => {
    if (!thumbnailUrl || !videoId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Thumbnail URL not found.'
      });
      return;
    }
  
    try {
      const response = await fetch(thumbnailUrl);
      if (!response.ok) {
        // Fallback for maxresdefault if it doesn't exist
        if (quality === 'maxresdefault') {
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: 'Maximum quality is not available. Please select another quality.',
            });
            return;
        }
        throw new Error('Failed to fetch thumbnail image.');
      }
      
      const blob = await response.blob();
      triggerDownload(blob, `${videoId}_${quality}_thumbnail.jpg`);
  
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not download the thumbnail. The selected quality may not be available.',
      });
    }
  };

  const triggerDownload = (blob: Blob, fileName: string) => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  const handleReset = () => {
    setStep('input');
    setThumbnailUrl(null);
    setVideoId(null);
    setIsGenerating(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            <span>Enter YouTube Video URL</span>
          </CardTitle>
          <CardDescription>Paste the URL of the YouTube video to download its thumbnail.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-start gap-4 sm:flex-row">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="sr-only">YouTube Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.youtube.com/watch?v=..." {...field} disabled={step !== 'input'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={step !== 'input' || isGenerating}>
                 {isGenerating ? <Loader2 className="animate-spin" /> : <span>Get Thumbnail</span>}
                 {!isGenerating && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <span>Thumbnail Preview</span>
            </CardTitle>
            <CardDescription>Click the image to zoom. Select quality and download.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {thumbnailUrl ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative mb-4 aspect-video w-full cursor-zoom-in overflow-hidden rounded-lg border">
                    <Image src={thumbnailUrl} alt="Video thumbnail" layout="fill" objectFit="cover" 
                      onError={() => {
                        // If maxres fails, fall back to hq
                        if (quality === 'maxresdefault' && videoId) {
                          setQuality('hqdefault');
                          updateThumbnailUrl(videoId, 'hqdefault');
                          toast({
                              variant: 'default',
                              title: 'Quality not available',
                              description: "Maximum quality isn't available for this video. Switched to SD quality.",
                          })
                        }
                      }}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Thumbnail Preview</DialogTitle>
                  </DialogHeader>
                  <div className="relative aspect-video w-full">
                    <Image src={thumbnailUrl} alt="Video thumbnail zoomed" layout="fill" objectFit="contain" />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>Loading thumbnail...</span>
                    </div>
                </div>
            )}
            
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quality">Quality</Label>
                <Select onValueChange={(v) => handleQualityChange(v as ThumbnailQuality)} defaultValue={quality} value={quality}>
                    <SelectTrigger id="quality">
                        <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(qualityLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
               <div className="space-y-2 self-end">
                 <Button onClick={handleDownloadThumbnail} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Thumbnail
                </Button>
               </div>
            </div>

            <Button onClick={handleReset} className="w-full" size="lg" variant="outline" disabled={isGenerating}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              <span>Try Another</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
