'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Youtube, Download, RefreshCcw, Loader2, ArrowRight, Clipboard, Check } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { generateVideoScript } from '../actions';

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

export function YoutubeTool() {
  const [step, setStep] = useState<Step>('input');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    setScript(null);
    const extractedVideoId = getYouTubeVideoId(values.url);
    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      setThumbnailUrl(`https://img.youtube.com/vi/${extractedVideoId}/maxresdefault.jpg`);
      setStep('preview');

      try {
        const formData = new FormData();
        formData.append('url', values.url);
        const result = await generateVideoScript(formData);
        if (result.success) {
          setScript(result.data.script);
        } else {
          toast({
            variant: 'destructive',
            title: 'Script Generation Failed',
            description: result.error,
          });
          setScript('Could not generate script for this video.');
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred while generating the script.',
        });
        setScript('Could not generate script for this video.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Could not extract a YouTube video ID from the URL. Please try another link.',
      });
      setThumbnailUrl(null);
      setVideoId(null);
      setIsGenerating(false);
    }
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

  const handleCopyScript = () => {
    if (script) {
      navigator.clipboard.writeText(script);
      setIsCopied(true);
      toast({ title: 'Script Copied!', description: 'The script has been copied to your clipboard.' });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setStep('input');
    setThumbnailUrl(null);
    setVideoId(null);
    setScript(null);
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
          <CardDescription>Paste the URL of the YouTube video to download its thumbnail and generate a script.</CardDescription>
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
                 {isGenerating ? <Loader2 className="animate-spin" /> : <span>Generate</span>}
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
              <span>Results</span>
            </CardTitle>
            <CardDescription>Download the thumbnail and copy the generated script below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {thumbnailUrl && (
              <div>
                <h3 className="mb-2 text-lg font-semibold">Thumbnail</h3>
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border">
                  <Image src={thumbnailUrl} alt="Video thumbnail" layout="fill" objectFit="cover" 
                    onError={() => {
                      if (videoId) setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
                    }}
                  />
                </div>
                <Button onClick={handleDownloadThumbnail} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Thumbnail
                </Button>
              </div>
            )}
            
            <div>
              <h3 className="mb-2 text-lg font-semibold">Generated Script</h3>
              {isGenerating ? (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>Generating script...</span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Textarea
                    readOnly
                    value={script || ''}
                    placeholder="Script will appear here..."
                    className="min-h-[200px] w-full"
                  />
                  {script && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={handleCopyScript}
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              )}
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
