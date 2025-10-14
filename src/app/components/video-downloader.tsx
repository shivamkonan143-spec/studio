'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Youtube, Sparkles, Download, Check, Clapperboard, RefreshCcw, Loader2, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { AutomaticDownloadToolSelectionOutput } from '@/ai/flows/automatic-download-tool-selection';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid YouTube URL.' }),
});

type Step = 'input' | 'quality' | 'downloading' | 'complete';
const VIDEO_QUALITIES = ['1080p', '720p', '480p'];

const defaultAiResponse: AutomaticDownloadToolSelectionOutput = {
  downloadTool: 'youtube-dl',
  reasoning: 'This tool is recommended for all YouTube video downloads for best compatibility.'
};

export function VideoDownloader() {
  const [step, setStep] = useState<Step>('input');
  const [aiResponse, setAiResponse] = useState<AutomaticDownloadToolSelectionOutput | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '' },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Skip analysis and go directly to quality selection
    setAiResponse(defaultAiResponse);
    setStep('quality');
  };

  const handleDownload = async () => {
    if (!selectedQuality) {
      toast({ variant: 'destructive', title: 'Selection Required', description: "Please select a video quality." });
      return;
    }
    
    setStep('downloading');
    setDownloadProgress(0);

    const url = form.getValues('url');

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&quality=${selectedQuality}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start download.');
      }
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'video.mp4';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      // This is a rough simulation, as we don't have real progress from this method
      setDownloadProgress(50);
      setTimeout(() => {
        setDownloadProgress(100);
        setStep('complete');
      }, 500);


    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error.message || 'Could not download the video. Please try again.',
      });
      handleReset();
    }
  };

  const handleReset = () => {
    setStep('input');
    setAiResponse(null);
    setSelectedQuality(null);
    setDownloadProgress(0);
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
          <CardDescription>Paste the URL of the YouTube video you want to download.</CardDescription>
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
                 <span>Get Download Options</span>
                 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {aiResponse && (step === 'quality' || step === 'downloading' || step === 'complete') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span>Automated Tool Selection</span>
            </CardTitle>
            <CardDescription>Our system has selected the best tool for YouTube.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">Recommended Tool: <span className="font-mono rounded bg-muted px-2 py-1 text-sm">{aiResponse.downloadTool}</span></p>
            <p className="text-sm text-muted-foreground">{aiResponse.reasoning}</p>
          </CardContent>
        </Card>
      )}

      {step === 'quality' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clapperboard className="h-5 w-5" />
              <span>Select Video Quality</span>
            </CardTitle>
            <CardDescription>Choose your desired resolution for the download.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup onValueChange={setSelectedQuality} value={selectedQuality || ''} className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {VIDEO_QUALITIES.map((quality) => (
                <Label key={quality} htmlFor={quality} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/20 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                  <RadioGroupItem value={quality} id={quality} className="sr-only" />
                  <span className="text-lg font-bold">{quality}</span>
                  <span className="text-xs text-muted-foreground">{quality === '1080p' ? 'Full HD' : quality === '720p' ? 'HD' : 'Standard'}</span>
                </Label>
              ))}
            </RadioGroup>
            <Button onClick={handleDownload} disabled={!selectedQuality || isPending} className="mt-6 w-full" size="lg" variant="default">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {isPending ? 'Preparing Download...' : 'Download Video'}
            </Button>
          </CardContent>
        </Card>
      )}

      {(step === 'downloading' || step === 'complete') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 'downloading' ? <Download className="h-5 w-5" /> : <Check className="h-5 w-5 text-green-500" />}
              <span>{step === 'downloading' ? 'Downloading...' : 'Download Complete'}</span>
            </CardTitle>
            {step === 'downloading' && <CardDescription>Your video is being downloaded. Please wait.</CardDescription>}
            {step === 'complete' && <CardDescription>Your video has been saved to your device's downloads folder!</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={downloadProgress} className="w-full" />
            <p className="text-center text-sm font-medium">{Math.round(downloadProgress)}%</p>
            {step === 'complete' && (
              <Button onClick={handleReset} className="w-full" variant="secondary">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Download Another Video
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
