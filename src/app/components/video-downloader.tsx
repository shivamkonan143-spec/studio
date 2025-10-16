
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, RefreshCcw, Loader2, Image as ImageIcon, ArrowRight, X, Clipboard, Sparkles, SlidersHorizontal, Trash2, ImagePlus, Crop, Sepia } from 'lucide-react';
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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useLanguage } from '@/app/context/language-context';
import { translations } from '@/app/locales/translations';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider"
import { AdPlaceholder } from '@/app/components/ad-placeholder';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RatingDialog, checkIfRatingGiven } from '@/app/components/rating-dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';


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

export function YoutubeDownloaderInput({ onGetThumbnail }: { onGetThumbnail: (id: string, isShort: boolean) => void }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const { locale } = useLanguage();
    const t = translations[locale];
    const { toast } = useToast();
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      setShowAd(true);

      setIsGenerating(true);
      const { id: extractedVideoId, isShort: isShortVideo } = getYouTubeVideoId(values.url);
  
      if (extractedVideoId) {
        onGetThumbnail(extractedVideoId, isShortVideo);
      } else {
        toast({
          variant: 'destructive',
          title: t.videoDownloader.invalidUrlTitle,
          description: t.videoDownloader.invalidUrlDescription,
        });
      }
      setIsGenerating(false);
    };
  
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: { url: '' },
    });
  
    return (
        <Card className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(223,200,242,0.2),rgba(255,0,0,0.0))] dark:bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(22_3,200,242,0.1),rgba(255,0,0,0.0))]">
            <CardContent className="p-8 pt-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                    {t.title}
                </h2>
                <p className="text-muted-foreground mb-6">{t.videoDownloader.pasteUrl}</p>
                
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
                 <AdPlaceholder showAd={showAd} />
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
  const [isOpen, setIsOpen] = useState(false);
  // Filter states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [invert, setInvert] = useState(0);


  const filters = `
    brightness(${brightness}%) 
    contrast(${contrast}%) 
    saturate(${saturate}%) 
    grayscale(${grayscale}%) 
    invert(${invert}%)
  `;

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setGrayscale(0);
    setInvert(0);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-6">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Customize Thumbnail</DialogTitle>
            <DialogDescription>
              Apply filters to your image.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 rounded-lg">
                <div className="relative w-full max-w-lg aspect-video">
                    {thumbnail && (
                      <Image
                        src={thumbnail}
                        alt="Thumbnail preview"
                        fill
                        objectFit="cover"
                        style={{ filter: filters }}
                        unoptimized
                      />
                    )}
                </div>
            </div>
            <div className="w-full md:w-64 space-y-4">
                <h3 className="font-semibold">Filters</h3>
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
                    <Label className="text-xs">Grayscale ({grayscale}%)</Label>
                    <Slider value={[grayscale]} onValueChange={(v) => setGrayscale(v[0])} max={100} step={1} />
                </div>
                 <div className="space-y-2">
                    <Label className="text-xs">Invert ({invert}%)</Label>
                    <Slider value={[invert]} onValueChange={(v) => setInvert(v[0])} max={100} step={1} />
                </div>

                <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">Reset Filters</Button>
                    <Button size="sm" onClick={() => { if (thumbnail) { onDownload(thumbnail, filters); setIsOpen(false); } }} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export function YoutubeDownloaderPreview({ videoId, isShort, onTryAnother }: { videoId: string, isShort: boolean, onTryAnother: () => void }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isTitleLoading, setIsTitleLoading] = useState(true);
  const [quality, setQuality] = useState<ThumbnailQuality>('maxresdefault');
  const { locale } = useLanguage();
  const t = translations[locale];
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!videoId) return;

    if (previewRef.current) {
        previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    const initialQuality = 'maxresdefault';
    setQuality(initialQuality);
    updateThumbnailUrl(videoId, initialQuality);
    
    setIsTitleLoading(true);
    setVideoTitle('');
    const fetchVideoInfo = async () => {
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oembedUrl);
            if(response.ok) {
                const data: OembedResponse = await response.json();
                setVideoTitle(data.title);
            } else {
                setVideoTitle('Title not available');
            }
        } catch (error) {
            console.error("Failed to fetch video title", error);
            setVideoTitle('Title not available');
        } finally {
            setIsTitleLoading(false);
        }
    };
    
    fetchVideoInfo();

  }, [videoId]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [videoTitle])
  
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
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(videoTitle)
            .then(() => {
                toast({ title: t.videoDownloader.titleCopied });
            })
            .catch(err => {
                console.warn('Clipboard API failed, falling back.', err);
                fallbackCopyTextToClipboard(videoTitle);
            });
    } else {
        fallbackCopyTextToClipboard(videoTitle);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make the textarea invisible
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            toast({ title: t.videoDownloader.titleCopied });
        } else {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
        toast({
            variant: 'destructive',
            title: t.common.error,
            description: 'Could not copy text.',
        });
    }

    document.body.removeChild(textArea);
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

    if (!checkIfRatingGiven()) {
      setTimeout(() => setIsRatingOpen(true), 1000);
    }
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
    img.src = imageUrl.split('?t=')[0] + `?t=${new Date().getTime()}`;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.filter = filters || '';
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                triggerDownload(blob, fileName);
            }
        }, 'image/png');
    };
    img.onerror = () => {
        // Fallback for CORS issues: try fetching through a proxy if available, or just download original
        // For simplicity, we'll try to download the original via our fetch-based downloader.
        downloadFromUrl(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`, fileName);
    };
  };

  const cropAndDownloadImage = (imageUrl: string, fileName: string, aspect?: number) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl.split('?t=')[0] + `?t=${new Date().getTime()}`;
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
  
    const uniqueTimestamp = new Date().getTime();
    const fileName = `${videoId}_${quality}_thumbnail_${uniqueTimestamp}.jpg`;

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

  if (!thumbnailUrl) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                    <span>{t.videoDownloader.loadingThumbnail}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
  }
    
  return (
    <>
      <Card ref={previewRef}>
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
                  <ImageIcon className="h-8 w-8" />
                  <span>{t.videoDownloader.loadingThumbnail}</span>
                  </div>
              </div>
          )}

          <div className="grid grid-cols-1 gap-4">
              <AdvancedEditDialog
                  thumbnail={thumbnailUrl}
                  onDownload={(url, filters) => downloadEditedImage(url, filters!, `${videoId}_custom_edited_thumbnail_${new Date().getTime()}.png`)}
              />
          </div>
          
          <div className="space-y-2">
              <Label>{t.videoDownloader.videoTitle}</Label>
              <div className="relative flex items-start gap-2">
                  <Textarea
                      ref={textareaRef}
                      value={isTitleLoading ? t.common.loading : videoTitle}
                      readOnly
                      className="pr-12 bg-muted/40 resize-none overflow-hidden min-h-[40px]"
                      rows={2}
                  />
                  <Button onClick={handleCopyTitle} size="icon" variant="outline" className="shrink-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white border-0" disabled={isTitleLoading}>
                      {isTitleLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Clipboard className="h-4 w-4" />}
                      <span className="sr-only">{t.videoDownloader.copyTitle}</span>
                  </Button>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="quality">{t.videoDownloader.quality}</Label>                  <Select onValueChange={(v) => handleQualityChange(v as ThumbnailQuality)} defaultValue={quality} value={quality}>
                      <SelectTrigger id="quality">
                          <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="maxresdefault">{t.videoDownloader.qualityHigh}</SelectItem>
                          <SelectItem value="hqdefault">{t.videoDownloader.qualityLow}</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>
          
          
          <Button onClick={handleDownloadThumbnail} variant="destructive" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {t.videoDownloader.downloadThumbnail}
          </Button>


          <Button onClick={onTryAnother} className="w-full" size="lg" variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" />
              <span>{t.videoDownloader.tryAnother}</span>
          </Button>
          <AdPlaceholder showAd={true} />
          </CardContent>
      </Card>
      <RatingDialog isOpen={isRatingOpen} onOpenChange={setIsRatingOpen} />
    </>
  );
}
