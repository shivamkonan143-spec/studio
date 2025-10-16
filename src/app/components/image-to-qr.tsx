
'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ImageToQr() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      if (file.size > 2 * 1024) { // 2KB limit
        toast({
            variant: 'destructive',
            title: 'File too large',
            description: 'Please upload an image smaller than 2KB.',
        });
        setIsLoading(false);
        return;
      }
      setFileName(file.name.split('.')[0]);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageBase64(e.target?.result as string);
        setIsLoading(false);
      };
      reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Error reading file',
            description: 'There was an issue reading your image file.',
        });
        setIsLoading(false);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('QRCode');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${fileName}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
       toast({
        title: 'QR Code Downloaded',
        description: 'The QR code has been saved to your device.',
      });
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  
  const handleRemoveImage = () => {
    setImageBase64(null);
    setFileName('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <Card className="overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(200,242,223,0.2),rgba(0,255,0,0.0))] dark:bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(200,242,223,0.1),rgba(0,0,0,0.0))]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Image to QR Code</CardTitle>
        <CardDescription>Upload an image to generate a QR code that contains it.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-2 space-y-6">
        {!imageBase64 ? (
            <div className="flex flex-col items-center justify-center space-y-4">
                 <div 
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 2KB</p>
                </div>
                <Input
                    id="image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                />
            </div>
        ) : (
          <div className="space-y-6 flex flex-col items-center">
            <div className="relative w-full max-w-[256px] bg-white p-4 rounded-lg border shadow-sm">
                <QRCode
                    id="QRCode"
                    value={imageBase64}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                />
            </div>
            
            <div className="relative w-40 h-40 border rounded-md overflow-hidden">
                <Image src={imageBase64} alt="Uploaded preview" layout="fill" objectFit="cover" />
                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={handleRemoveImage}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <Button onClick={handleDownload} className="w-full" size="lg">
                    <Download className="mr-2" />
                    Download QR Code
                </Button>
                 <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline">
                    <Upload className="mr-2" />
                    Upload Another Image
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
