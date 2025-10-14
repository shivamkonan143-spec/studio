
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, RefreshCcw, Loader2, Image as ImageIcon, ArrowRight, X, Clipboard, Youtube, Sparkles } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormMessage, FormItem } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { cn } from '@/lib/utils';
import { editThumbnail } from '@/ai/flows/edit-thumbnail-flow';
import { Textarea } from '@/components/ui/textarea';


const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type Step = 'input' | 'preview';
type ThumbnailQuality = 'maxresdefault' | 'hqdefault';

interface OembedResponse {
    title: string;
}

function getYouTubeVideoId(url: string): { id: string | null; isShort: boolean } {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return { id: urlObj.pathname.slice(1).split('?')[0], isShort: false };
    }
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      if (urlObj.pathname === '/watch') {
        return { id: urlObj.searchParams.get('v'), isShort: false };
      }
      if (urlObj.pathname.startsWith('/shorts/')) {
        return { id: urlObj.pathname.split('/shorts/')[1].split('?')[0], isShort: true };
      }
    }
  } catch (e) {
    console.error('Invalid URL for video ID extraction', e);
    return { id: null, isShort: false };
  }
  return { id: null, isShort: false };
}

function AiEditDialog({ thumbnail, onDownload }: { thumbnail: string | null, onDownload: (url: string) => void }) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editedThumbnail, setEditedThumbnail] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!prompt || !thumbnail) return;
        setIsGenerating(true);
        setEditedThumbnail(null);
        try {
            const result = await editThumbnail({ image: thumbnail, prompt });
            if (result.editedImage) {
                setEditedThumbnail(result.editedImage);
            } else {
                throw new Error("AI did not return an image.");
            }
        } catch (error) {
            console.error("AI editing failed:", error);
            toast({
                variant: 'destructive',
                title: "Editing Failed",
                description: "The AI could not process your request. Please try a different prompt.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Edit with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Thumbnail with AI</DialogTitle>
                    <DialogDescription>
                        Describe the changes you want to make to the thumbnail. For example, "make it more vibrant" or "add the text 'New Video!' at the bottom".
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        {isGenerating && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                        <Image
                            src={editedThumbnail || thumbnail || ''}
                            alt="Thumbnail"
                            layout="fill"
                            objectFit="contain"
                        />
                    </div>
                    <Textarea
                        placeholder="e.g., increase brightness, add a red border, crop to a square"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isGenerating}
                    />
                </div>
                <DialogFooter>
                    {editedThumbnail && (
                         <Button onClick={() => onDownload(editedThumbnail)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Edited
                        </Button>
                    )}
                    <Button onClick={handleGenerate} disabled={isGenerating || !prompt}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function YoutubeTool() {
  const [step, setStep] = useState<Step>('input');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState<ThumbnailQuality>('maxresdefault');
  const [isShort, setIsShort] = useState<boolean>(false);
  const { locale } = useLanguage();
  const t = translations[locale];

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
    setVideoTitle('');
    const { id: extractedVideoId, isShort: isShortVideo } = getYouTubeVideoId(values.url);
    setIsShort(isShortVideo);

    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      const initialQuality = 'maxresdefault';
      setQuality(initialQuality);
      updateThumbnailUrl(extractedVideoId, initialQuality);
      
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${extractedVideoId}&format=json`;
        const response = await fetch(oembedUrl);
        if(response.ok) {
            const data: OembedResponse = await response.json();
            setVideoTitle(data.title);
        }
      } catch (error) {
        console.error("Failed to fetch video title", error);
      }

      setStep('preview');
    } else {
      toast({
        variant: 'destructive',
        title: t.videoDownloader.invalidUrlTitle,
        description: t.videoDownloader.invalidUrlDescription,
      });
      setThumbnailUrl(null);
      setVideoId(null);
    }
    setIsGenerating(false);
  };
  
  const handleCopyTitle = () => {
    navigator.clipboard.writeText(videoTitle);
    toast({
        title: t.videoDownloader.titleCopied,
    });
  }

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

    const downloadImageFromUrl = async (url: string, fileName: string) => {
        try {
            // For data URIs, we need to convert them to a blob first
            if (url.startsWith('data:')) {
                const response = await fetch(url);
                const blob = await response.blob();
                triggerDownload(blob, fileName);
            } else {
                // For regular URLs, fetch and create a blob
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok.');
                const blob = await response.blob();
                triggerDownload(blob, fileName);
            }
        } catch (error) {
            console.error('Download error:', error);
            toast({
                variant: 'destructive',
                title: "Download Failed",
                description: "Could not download the edited image.",
            });
        }
    };

  const cropAndDownloadImage = (imageUrl: string, fileName: string) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const originalWidth = img.width;
        const originalHeight = img.height;
        
        const targetAspectRatio = 9 / 16;
        let newWidth = originalWidth;
        let newHeight = originalHeight;
        let sx = 0;
        let sy = 0;

        if (originalWidth / originalHeight > targetAspectRatio) {
            newWidth = originalHeight * targetAspectRatio;
            sx = (originalWidth - newWidth) / 2;
        } else {
            newHeight = originalWidth / targetAspectRatio;
            sy = (originalHeight - newHeight) / 2;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(img, sx, sy, newWidth, newHeight, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
            if (blob) {
                triggerDownload(blob, fileName);
            }
        }, 'image/jpeg', 0.95);
    };
    img.onerror = () => {
        toast({
            variant: 'destructive',
            title: t.videoDownloader.downloadFailedTitle,
            description: t.videoDownloader.downloadErrorDescription,
        });
    };
};

  const handleDownloadThumbnail = async () => {
    if (!thumbnailUrl || !videoId) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: 'Thumbnail URL not found.'
      });
      return;
    }
  
    const fileName = `${videoId}_${quality}_thumbnail.jpg`;

    if (isShort) {
        // Since the source image might not be directly available for fetch due to CORS,
        // we pass the URL to the cropping function which loads it into an Image object.
        cropAndDownloadImage(thumbnailUrl, fileName);
    } else {
      try {
        const response = await fetch(thumbnailUrl);
        if (!response.ok) {
          if (quality === 'maxresdefault') {
              toast({
                  variant: 'destructive',
                  title: t.videoDownloader.downloadFailedTitle,
                  description: t.videoDownloader.downloadFailedDescription,
              });
              return;
          }
          throw new Error('Failed to fetch thumbnail image.');
        }
        
        const blob = await response.blob();
        triggerDownload(blob, fileName);
    
      } catch (error: any) {
        console.error('Download error:', error);
        toast({
          variant: 'destructive',
          title: t.videoDownloader.downloadFailedTitle,
          description: t.videoDownloader.downloadErrorDescription,
        });
      }
    }
  };

  const handleReset = () => {
    setStep('input');
    setThumbnailUrl(null);
    setVideoId(null);
    setVideoTitle('');
    setIsGenerating(false);
    setIsShort(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(223,200,242,0.2),rgba(255,0,0,0.0))] dark:bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(223,200,242,0.1),rgba(255,0,0,0.0))]">
        <CardContent className="p-8 pt-12 text-center">
            <div className="inline-flex items-center justify-center bg-primary rounded-xl p-3 mb-6 shadow-lg shadow-primary/20">
                <Youtube className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                Enter <span className="text-primary">YouTube</span> video URL
            </h2>
            
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder={t.videoDownloader.urlPlaceholder}
                          {...field}
                          disabled={step !== 'input'}
                          className="h-12 w-full rounded-lg border-2 bg-white/50 dark:bg-card pr-10 text-base shadow-inner-white transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus-visible:ring-offset-0"
                        />
                      </FormControl>
                      {field.value && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => form.reset({ url: '' })}
                          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                size="lg"
                disabled={step !== 'input' || isGenerating}
              >
                 {isGenerating ? <Loader2 className="animate-spin" /> : <><Download /> {t.videoDownloader.getThumbnail}</>}
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
              <span>{t.videoDownloader.previewTitle}</span>
            </CardTitle>
            <CardDescription>{t.videoDownloader.previewDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {thumbnailUrl ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div className={cn(
                      "relative mb-4 w-full cursor-zoom-in overflow-hidden rounded-lg border",
                      isShort ? "aspect-[9/16] max-h-[70vh] mx-auto max-w-[300px]" : "aspect-video"
                  )}>
                    <Image src={thumbnailUrl} alt="Video thumbnail" layout="fill" objectFit="cover" className="mx-auto"
                      onError={() => {
                        if (quality === 'maxresdefault' && videoId) {
                          setQuality('hqdefault');
                          updateThumbnailUrl(videoId, 'hqdefault');
                          toast({
                              variant: 'default',
                              title: t.videoDownloader.qualityUnavailableTitle,
                              description: t.videoDownloader.qualityUnavailableDescription,
                          })
                        }
                      }}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-2 sm:p-4">
                  <DialogHeader>
                    <DialogTitle>{t.videoDownloader.previewTitle}</DialogTitle>
                  </DialogHeader>
                  {thumbnailUrl && 
                    <div className="relative aspect-video w-full">
                        <Image src={thumbnailUrl} alt="Video thumbnail zoomed" layout="fill" objectFit="contain" className="mx-auto rounded-md" />
                    </div>
                  }
                </DialogContent>
              </Dialog>
            ) : (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>{t.videoDownloader.loadingThumbnail}</span>
                    </div>
                </div>
            )}
            
            {videoTitle && (
                <div className="space-y-2">
                    <Label>{t.videoDownloader.videoTitle}</Label>
                    <div className="relative">
                        <Input value={videoTitle} readOnly className="pr-12 bg-muted/40"/>
                        <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={handleCopyTitle}>
                            <Clipboard className="h-4 w-4"/>
                            <span className="sr-only">{t.videoDownloader.copyTitle}</span>
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid w-full gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quality">{t.videoDownloader.quality}</Label>
                <Select onValueChange={(v) => handleQualityChange(v as ThumbnailQuality)} defaultValue={quality} value={quality}>
                    <SelectTrigger id="quality">
                        <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="maxresdefault">{t.videoDownloader.qualityHigh}</SelectItem>
                        <SelectItem value="hqdefault">{t.videoDownloader.qualityHigh360}</SelectItem>
                    </SelectContent>
                </Select>
              </div>
               <div className="space-y-2 self-end grid grid-cols-2 gap-2">
                    <AiEditDialog thumbnail={thumbnailUrl} onDownload={(url) => downloadImageFromUrl(url, `${videoId}_edited_thumbnail.png`)} />
                    <Button onClick={handleDownloadThumbnail}>
                        <Download className="mr-2 h-4 w-4" />
                        {t.videoDownloader.downloadThumbnail}
                    </Button>
               </div>
            </div>

            <Button onClick={handleReset} className="w-full" size="lg" variant="outline" disabled={isGenerating}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              <span>{t.videoDownloader.tryAnother}</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    