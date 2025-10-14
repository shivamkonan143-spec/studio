'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Youtube, Download, RefreshCcw, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
});

type Step = 'input' | 'preview';

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

export function VideoDownloader() {
  const [step, setStep] = useState<Step>('input');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const extractedVideoId = getYouTubeVideoId(values.url);
    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      setThumbnailUrl(`https://img.youtube.com/vi/${extractedVideoId}/maxresdefault.jpg`);
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
  };

  const handleDownload = async () => {
    if (!thumbnailUrl || !videoId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Thumbnail URL not found.'
      });
      return;
    }
  
    try {
      // Fetch the image as a blob
      const response = await fetch(thumbnailUrl);
      if (!response.ok) {
        // Fallback to hqdefault if maxresdefault fails
        const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (!fallbackResponse.ok) throw new Error('Failed to fetch thumbnail image.');
        
        const blob = await fallbackResponse.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${videoId}_thumbnail.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoId}_thumbnail_hd.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
  
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not download the thumbnail. Please check the URL and try again.',
      });
    }
  };

  const handleReset = () => {
    setStep('input');
    setThumbnailUrl(null);
    setVideoId(null);
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
              <Button type="submit" className="w-full sm:w-auto" disabled={step !== 'input'}>
                 <span>Get Thumbnail</span>
                 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {step === 'preview' && thumbnailUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Thumbnail Preview</span>
            </CardTitle>
            <CardDescription>Click the button below to download the thumbnail.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border">
              <Image src={thumbnailUrl} alt="Video thumbnail" layout="fill" objectFit="cover" 
                onError={() => {
                  if (videoId) setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
                }}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download Thumbnail
              </Button>
              <Button onClick={handleReset} className="w-full" size="lg" variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
