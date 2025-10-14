
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, RefreshCcw, Loader2, Image as ImageIcon, ArrowRight, X, Clipboard, Youtube, Sparkles, SlidersHorizontal, Trash2, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormMessage, FormItem } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider"
import { AdPlaceholder } from '@/app/components/ad-placeholder';
import { editThumbnail } from '@/ai/flows/edit-thumbnail-flow';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

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

export function YoutubeDownloaderInput() {
    const [isGenerating, setIsGenerating] = useState(false);
    const { locale } = useLanguage();
    const t = translations[locale];
    const router = useRouter();
    const { toast } = useToast();
  
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { url: '' },
    });
  
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      setIsGenerating(true);
      const { id: extractedVideoId, isShort: isShortVideo } = getYouTubeVideoId(values.url);
  
      if (extractedVideoId) {
        router.push(`/preview?id=${extractedVideoId}&isShort=${isShortVideo}`);
      } else {
        toast({
          variant: 'destructive',
          title: t.videoDownloader.invalidUrlTitle,
          description: t.videoDownloader.invalidUrlDescription,
        });
        setIsGenerating(false);
      }
    };
  
    return (
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
                                disabled={isGenerating}
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
                    disabled={isGenerating}
                    >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <><Download /> {t.videoDownloader.getThumbnail}</>}
                    </Button>
                </form>
                </Form>
                 <AdPlaceholder />
            </CardContent>
        </Card>
    );
}

function AdvancedEditDialog({
    thumbnail,
    onDownload,
  }: {
    thumbnail: string | null;
    onDownload: (url: string, filters?: React.CSSProperties['filter']) => void;
  }) {
    // Filter states
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturate, setSaturate] = useState(100);
    const [sepia, setSepia] = useState(0);
    const [grayscale, setGrayscale] = useState(0);
    const [invert, setInvert] = useState(0);
    
    // AI Edit states
    const [isRemovingObject, setIsRemovingObject] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const filters = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`;
  
    const resetFilters = () => {
      setBrightness(100);
      setContrast(100);
      setSaturate(100);
      setSepia(0);
      setGrayscale(0);
      setInvert(0);
    };

    const handleAddImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // TODO: Implement logic to add the image to the canvas
            console.log("Image selected:", file.name);
        }
    };
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Customize
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Advanced Thumbnail Editor</DialogTitle>
            <DialogDescription>
              Use filters for basic adjustments or AI tools for advanced editing.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="ai">AI Edit</TabsTrigger>
            </TabsList>
            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border">
                {/* This will be replaced by a canvas for interactive editing */}
                <Image
                    src={thumbnail || ''}
                    alt="Thumbnail"
                    layout="fill"
                    objectFit="contain"
                    style={{ filter: filters }}
                />
            </div>
            <TabsContent value="filters">
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                        <Label>Brightness ({brightness}%)</Label>
                        <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} max={200} step={1} />
                    </div>
                    <div className="space-y-2">
                        <Label>Contrast ({contrast}%)</Label>
                        <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} max={200} step={1} />
                    </div>
                    <div className="space-y-2">
                        <Label>Saturation ({saturate}%)</Label>
                        <Slider value={[saturate]} onValueChange={(v) => setSaturate(v[0])} max={200} step={1} />
                    </div>
                    <div className="space-y-2">
                        <Label>Sepia ({sepia}%)</Label>
                        <Slider value={[sepia]} onValueChange={(v) => setSepia(v[0])} max={100} step={1} />
                    </div>
                    <div className="space-y-2">
                        <Label>Grayscale ({grayscale}%)</Label>
                        <Slider value={[grayscale]} onValueChange={(v) => setGrayscale(v[0])} max={100} step={1} />
                    </div>
                    <div className="space-y-2">
                        <Label>Invert ({invert}%)</Label>
                        <Slider value={[invert]} onValueChange={(v) => setInvert(v[0])} max={100} step={1} />
                    </div>
                </div>
                 <DialogFooter className="pt-6">
                    <Button variant="outline" onClick={resetFilters}>Reset</Button>
                    <Button onClick={() => thumbnail && onDownload(thumbnail, filters)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download with Filters
                    </Button>
                </DialogFooter>
            </TabsContent>
            <TabsContent value="ai">
                 <div className="flex justify-center gap-2 pt-4">
                    <Button variant={isRemovingObject ? "destructive" : "outline"} onClick={() => setIsRemovingObject(!isRemovingObject)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isRemovingObject ? "Cancel" : "Remove Object"}
                    </Button>
                    <Button variant="outline" onClick={handleAddImageClick}>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Add Image
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                    {isRemovingObject ? "Tap on the object you want to remove." : "Use AI to make advanced edits."}
                </p>
                <DialogFooter className="pt-6">
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Download AI Edited Image
                    </Button>
                </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

export function YoutubeDownloaderPreview({ videoId, isShort }: { videoId: string, isShort: boolean }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [quality, setQuality] = useState<ThumbnailQuality>('maxresdefault');
  const { locale } = useLanguage();
  const t = translations[locale];

  const { toast } = useToast();

  useEffect(() => {
    if (!videoId) return;
    
    setIsGenerating(true);
    const initialQuality = 'maxresdefault';
    setQuality(initialQuality);
    updateThumbnailUrl(videoId, initialQuality);
    
    const fetchVideoInfo = async () => {
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oembedUrl);
            if(response.ok) {
                const data: OembedResponse = await response.json();
                setVideoTitle(data.title);
            }
        } catch (error) {
            console.error("Failed to fetch video title", error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    fetchVideoInfo();

  }, [videoId]);
  
  const updateThumbnailUrl = (id: string, newQuality: ThumbnailQuality) => {
    // Add a timestamp to bypass browser cache
    setThumbnailUrl(`https://img.youtube.com/vi/${id}/${newQuality}.jpg?t=${new Date().getTime()}`);
  };

  const handleQualityChange = (newQuality: ThumbnailQuality) => {
      if (videoId) {
          setQuality(newQuality);
          updateThumbnailUrl(videoId, newQuality);
      }
  }
  
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

  const downloadFromUrl = async (url: string, fileName: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok.');
        const blob = await response.blob();
        triggerDownload(blob, fileName);
    } catch (error) {
        console.error("Download from URL failed:", error);
        toast({
            variant: "destructive",
            title: "Download Failed",
            description: "Could not fetch the image for download.",
        });
    }
  };

  const downloadEditedImage = (imageUrl: string, filters: React.CSSProperties['filter'], fileName: string) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = filters || '';
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                triggerDownload(blob, fileName);
            }
        }, 'image/png');
    };
    img.onerror = () => {
        toast({
            variant: 'destructive',
            title: "Download Failed",
            description: "Could not download the edited image.",
        });
    };
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
        // Use a proxy to fetch the image to avoid CORS issues if any
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

  return (
    <>
      {isGenerating || !thumbnailUrl ? (
        <Card>
            <CardContent className="pt-6">
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>{t.videoDownloader.loadingThumbnail}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      ) : (
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
                      "relative w-full cursor-zoom-in overflow-hidden rounded-lg border",
                      isShort ? "aspect-[9/16] max-h-[70vh] mx-auto max-w-[300px]" : "aspect-video"
                  )}>
                    <Image src={thumbnailUrl} alt="Video thumbnail" layout="fill" objectFit="cover" className="mx-auto"
                      unoptimized
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
                        <Image src={thumbnailUrl} alt="Video thumbnail zoomed" layout="fill" objectFit="contain" className="mx-auto rounded-md" unoptimized />
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
            
            <AdvancedEditDialog
                thumbnail={thumbnailUrl}
                onDownload={(url, filters) => downloadEditedImage(url, filters!, `${videoId}_custom_edited_thumbnail.png`)}
            />

            {videoTitle && (
                <div className="space-y-2">
                    <Label>{t.videoDownloader.videoTitle}</Label>
                    <div className="relative flex items-center gap-2">
                        <Input value={videoTitle} readOnly className="pr-12 bg-muted/40"/>
                        <Button onClick={handleCopyTitle} size="icon" variant="outline" className="shrink-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white border-0">
                            <Clipboard className="h-4 w-4" />
                            <span className="sr-only">{t.videoDownloader.copyTitle}</span>
                        </Button>
                    </div>
                </div>
            )}

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
            
            <Button onClick={handleDownloadThumbnail} variant="destructive" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {t.videoDownloader.downloadThumbnail}
            </Button>


            <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    <span>{t.videoDownloader.tryAnother}</span>
                </Link>
            </Button>
            <AdPlaceholder />
          </CardContent>
        </Card>
      )}
    </>
  );
}
