
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Slider } from "@/components/ui/slider"

export function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [compressedFileSize, setCompressedFileSize] = useState<number | null>(null);
  const [quality, setQuality] = useState(80);
  const [fileName, setFileName] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload an image file.',
        });
        return;
      }

      setFileName(file.name.split('.')[0]);
      setOriginalFileSize(file.size);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setOriginalImage(imageUrl);
        compressImage(imageUrl, quality, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (imageUrl: string, qualityValue: number, imageType: string) => {
    setIsCompressing(true);
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);

      // Get compressed image data
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedFileSize(blob.size);
            const compressedUrl = URL.createObjectURL(blob);
            setCompressedImage(compressedUrl);
          }
          setIsCompressing(false);
        },
        imageType,
        qualityValue / 100
      );
    };
  };

  const handleQualityChange = (value: number[]) => {
    setQuality(value[0]);
    if (originalImage && originalFileSize) {
        const fileType = originalImage.substring(originalImage.indexOf(':') + 1, originalImage.indexOf(';'));
        compressImage(originalImage, value[0], fileType);
    }
  };

  const handleDownload = () => {
    if (!compressedImage) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = compressedImage;
    downloadLink.download = `${fileName}-compressed.jpg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast({
      title: 'Image Downloaded',
      description: 'The compressed image has been saved.',
    });
  };

  const handleReset = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalFileSize(null);
    setCompressedFileSize(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return 'N/A';
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Card className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(200,223,242,0.2),rgba(0,0,255,0.0))] dark:bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(200,223,242,0.1),rgba(0,0,0,0.0))]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Image Compressor</CardTitle>
        <CardDescription>Upload an image to compress its file size.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-2 space-y-6">
        {!originalImage ? (
            <div className="flex flex-col items-center justify-center space-y-4">
                 <div 
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
                </div>
                <Input
                    id="image-upload-compressor"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                />
            </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-2 text-center">
                    <Label>Original</Label>
                    <div className="relative w-full aspect-square rounded-md border bg-muted/20 overflow-hidden">
                        <Image src={originalImage} alt="Original" layout="fill" objectFit="contain" />
                    </div>
                    <p className="text-sm font-medium">{formatFileSize(originalFileSize)}</p>
                </div>
                <div className="space-y-2 text-center">
                    <Label>Compressed</Label>
                     <div className="relative w-full aspect-square rounded-md border bg-muted/20 overflow-hidden">
                        {isCompressing ? (
                             <div className="flex items-center justify-center h-full"><RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : compressedImage ? (
                             <Image src={compressedImage} alt="Compressed" layout="fill" objectFit="contain" />
                        ) : (
                            <div className="flex items-center justify-center h-full"><ImageIcon className="w-8 h-8 text-muted-foreground" /></div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-500">{formatFileSize(compressedFileSize)}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="quality">Quality</Label>
                        <span className="text-sm font-medium">{quality}%</span>
                    </div>
                    <Slider id="quality" value={[quality]} onValueChange={handleQualityChange} max={100} step={1} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button onClick={handleDownload} disabled={!compressedImage || isCompressing}>
                        <Download className="mr-2" />
                        Download
                    </Button>
                     <Button onClick={handleReset} variant="outline">
                        <RefreshCw className="mr-2" />
                        Reset
                    </Button>
                </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
