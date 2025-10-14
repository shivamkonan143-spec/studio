'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Youtube, Download, RefreshCcw, Loader2, ArrowRight, Image as ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

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

function ThumbnailDownloader() {
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
            <CardDescription>Click the button below to download the high-quality thumbnail.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border">
              <Image src={thumbnailUrl} alt="Video thumbnail" fill objectFit="cover" 
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

function VideoDownloader() {
  const [step, setStep] = useState<Step>('input');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [videoQuality, setVideoQuality] = useState('highest');
  const [audioQuality, setAudioQuality] = useState('highestaudio');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const extractedVideoId = getYouTubeVideoId(values.url);
    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      setVideoUrl(values.url);
      setStep('preview');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Could not extract a YouTube video ID from the URL. Please try another link.',
      });
      setVideoId(null);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setDownloadProgress(0);

    const quality = downloadType === 'video' ? videoQuality : audioQuality;
    const apiUrl = `/api/download?url=${encodeURIComponent(videoUrl)}&type=${downloadType}&quality=${quality}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok || !response.body) {
         const errorData = await response.json().catch(() => ({ error: 'Could not process video. Please try another one.' }));
         throw new Error(errorData.error);
      }
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const contentLength = response.headers.get('Content-Length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
      let loadedSize = 0;

      const reader = response.body.getReader();
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              loadedSize += value.length;
              if (totalSize > 0) {
                 setDownloadProgress(Math.round((loadedSize / totalSize) * 100));
              }
              controller.enqueue(value);
              push();
            });
          }
          push();
        },
      });

      const newResponse = new Response(stream);
      const blob = await newResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: 'Download Complete',
        description: `${filename} has been downloaded.`,
      });

    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error.message || 'Could not download the file. Please check the URL and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setVideoUrl('');
    setVideoId(null);
    form.reset();
    setDownloadProgress(0);
    setIsLoading(false);
  };
  
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            <span>Enter YouTube Video URL</span>
          </CardTitle>
          <CardDescription>Paste the URL of the YouTube video to download it.</CardDescription>
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
                 <span>Get Video</span>
                 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Download Options</CardTitle>
             <CardDescription>Choose your preferred format and quality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {thumbnailUrl && (
              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg border">
                <Image src={thumbnailUrl} alt="Video thumbnail" fill objectFit="cover" 
                  onError={(e: any) => {
                     if (videoId) e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                />
              </div>
            )}
            
            <RadioGroup defaultValue="video" onValueChange={(value: 'video' | 'audio') => setDownloadType(value)} className="flex gap-4">
                <FormItem className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <FormLabel htmlFor="video">Video</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="audio" />
                  <FormLabel htmlFor="audio">Audio</FormLabel>
                </FormItem>
            </RadioGroup>

            {downloadType === 'video' ? (
              <div className="space-y-2">
                  <Label>Video Quality</Label>
                   <Select onValueChange={setVideoQuality} defaultValue={videoQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highest">Highest</SelectItem>
                      <SelectItem value="1080">1080p</SelectItem>
                      <SelectItem value="720">720p</SelectItem>
                      <SelectItem value="480">480p</SelectItem>
                      <SelectItem value="360">360p</SelectItem>
                      <SelectItem value="lowest">Lowest</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            ) : (
              <div className="space-y-2">
                 <Label>Audio Quality</Label>
                   <Select onValueChange={setAudioQuality} defaultValue={audioQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highestaudio">Highest</SelectItem>
                      <SelectItem value="lowestaudio">Lowest</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            )}
            
            {isLoading && (
              <div className="space-y-2">
                <Label>Downloading...</Label>
                <Progress value={downloadProgress} />
                <p className="text-sm text-muted-foreground">{downloadProgress}% complete</p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleDownload} className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    <span>{isLoading ? 'Downloading...' : `Download ${downloadType}`}</span>
                </Button>
                <Button onClick={handleReset} className="w-full" size="lg" variant="outline" disabled={isLoading}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    <span>Try Another</span>
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

export function DownloaderTabs() {
  return (
    <Tabs defaultValue="video" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="video">
            <Video className="mr-2" />
            Video Downloader
        </TabsTrigger>
        <TabsTrigger value="thumbnail">
            <ImageIcon className="mr-2"/>
            Thumbnail Downloader
        </TabsTrigger>
      </TabsList>
      <TabsContent value="video">
        <VideoDownloader />
      </TabsContent>
      <TabsContent value="thumbnail">
        <ThumbnailDownloader />
      </TabsContent>
    </Tabs>
  )
}
