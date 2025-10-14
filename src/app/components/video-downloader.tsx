
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, RefreshCcw, Loader2, Image as ImageIcon, ArrowRight, X, Clipboard, Youtube, Sparkles, SlidersHorizontal, Trash2, ImagePlus, Crop } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


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
    const [clickCount, setClickCount] = useState(0);
    const [showAd, setShowAd] = useState(false);
    const { locale } = useLanguage();
    const t = translations[locale];
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const subscriptionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'subscriptions', 'main');
    }, [firestore, user]);

    const { data: subscription } = useDoc(subscriptionRef);
    const isSubscribed = subscription?.active === true;
  
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      if (!isSubscribed) {
        setClickCount(prev => prev + 1);
        setShowAd(true);
      }

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
  
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { url: '' },
    });
  
    return (
        <Card className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(223,200,242,0.2),rgba(255,0,0,0.0))] dark:bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(223,200,242,0.1),rgba(255,0,0,0.0))]">
            <CardContent className="p-8 pt-12 text-center">
                <div className="inline-flex items-center justify-center rounded-xl mb-6">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="8" fill="url(#paint0_linear_1_2)"/>
                        <path d="M26.25 23.125V26.25H13.75V23.125H26.25ZM25 18.125L20 23.125L15 18.125H18.125V13.75H21.875V18.125H25Z" fill="white"/>
                        <defs>
                        <linearGradient id="paint0_linear_1_2" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#F43F5E"/>
                        <stop offset="1" stopColor="#E11D48"/>
                        </linearGradient>
                        </defs>
                    </svg>
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
                 <AdPlaceholder showAd={showAd && !isSubscribed} />
            </CardContent>
        </Card>
    );
}

function AdvancedEditDialog({
  thumbnail,
  onDownload,
  onCropAndDownload
}: {
  thumbnail: string | null;
  onDownload: (url: string, filters?: React.CSSProperties['filter']) => void;
  onCropAndDownload: (url: string, aspect: number) => void;
}) {
  // Filter states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [invert, setInvert] = useState(0);

  // Crop states
  const [cropAspect, setCropAspect] = useState<number | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const filters = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`;

  useEffect(() => {
    if (!thumbnail) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = thumbnail;
    img.onload = () => {
        let { width: w, height: h, sx, sy } = getCropDimensions(img.width, img.height, cropAspect);
        canvas.width = w;
        canvas.height = h;

        ctx.filter = filters;
        ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
    };
  }, [thumbnail, filters, cropAspect]);

  const getCropDimensions = (imgWidth: number, imgHeight: number, aspect: number | null) => {
    if (aspect === null) {
      return { width: imgWidth, height: imgHeight, sx: 0, sy: 0 };
    }

    const imgAspect = imgWidth / imgHeight;
    let width = imgWidth;
    let height = imgHeight;
    let sx = 0;
    let sy = 0;

    if (imgAspect > aspect) { // Image is wider than target
      width = imgHeight * aspect;
      sx = (imgWidth - width) / 2;
    } else { // Image is taller than or equal to target
      height = imgWidth / aspect;
      sy = (imgHeight - height) / 2;
    }
    return { width, height, sx, sy };
  }

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setSepia(0);
    setGrayscale(0);
    setInvert(0);
  };
  
  const handleDownloadCropped = () => {
    if (thumbnail && cropAspect) {
        onCropAndDownload(thumbnail, cropAspect);
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
          <DialogTitle>Customize Thumbnail</DialogTitle>
          <DialogDescription>
            Apply filters or crop your image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <div className="relative mx-auto w-full max-w-lg aspect-video bg-muted/20 rounded-lg overflow-hidden border">
                    <canvas ref={previewCanvasRef} className="absolute top-0 left-0 w-full h-full" />
                </div>
            </div>
            <div className="w-full md:w-64 space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Filters</h3>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label className="text-xs">Brightness ({brightness}%)</Label>
                            <Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} max={200} step={1} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Contrast ({contrast}%)</Label>
                            <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} max={200} step={1} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Saturation ({saturate}%)</Label>
                            <Slider value={[saturate]} onValueChange={(v) => setSaturate(v[0])} max={200} step={1} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Sepia ({sepia}%)</Label>
                            <Slider value={[sepia]} onValueChange={(v) => setSepia(v[0])} max={100} step={1} />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">Reset Filters</Button>
                        <Button size="sm" onClick={() => thumbnail && onDownload(thumbnail, filters)} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Crop</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant={cropAspect === 16/9 ? 'secondary' : 'outline'} onClick={() => setCropAspect(16/9)}>16:9</Button>
                        <Button variant={cropAspect === 9/16 ? 'secondary' : 'outline'} onClick={() => setCropAspect(9/16)}>9:16</Button>
                        <Button variant={cropAspect === 1/1 ? 'secondary' : 'outline'} onClick={() => setCropAspect(1/1)}>1:1</Button>
                    </div>
                    <Button 
                        onClick={handleDownloadCropped}
                        disabled={!cropAspect}
                        className="w-full mt-4"
                    >
                        <Crop className="mr-2 h-4 w-4" />
                        Download Cropped Image
                    </Button>
                     <Button variant="link" size="sm" onClick={() => setCropAspect(null)}>Remove Crop</Button>
                </div>
            </div>
        </div>
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
  const { user } = useUser();
  const firestore = useFirestore();

  const subscriptionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'subscriptions', 'main');
  }, [firestore, user]);

  const { data: subscription } = useDoc(subscriptionRef);
  const isSubscribed = subscription?.active === true;


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

  const cropAndDownloadImage = (imageUrl: string, fileName: string, aspect?: number) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const originalWidth = img.width;
        const originalHeight = img.height;
        
        const targetAspectRatio = aspect || (9 / 16);
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

  if (isGenerating || !thumbnailUrl) {
    return (
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
    )
  }
    
  return (
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

        <div className="grid grid-cols-1 gap-4">
            <AdvancedEditDialog
                thumbnail={thumbnailUrl}
                onDownload={(url, filters) => downloadEditedImage(url, filters!, `${videoId}_custom_edited_thumbnail.png`)}
                onCropAndDownload={(url, aspect) => cropAndDownloadImage(url, `${videoId}_cropped_thumbnail.jpg`, aspect)}
            />
        </div>
        
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

        <div className="grid grid-cols-1 gap-4">
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
        {!isSubscribed && <AdPlaceholder showAd={true} />}
        </CardContent>
    </Card>
  );
}

    