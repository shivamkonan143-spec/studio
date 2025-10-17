
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/app/components/theme-provider';
import { LanguageProvider, LayoutProvider } from '@/app/context/layout-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SubscriptionProvider } from '@/hooks/use-subscription';
import { LayoutWrapper } from '@/app/components/layout-wrapper';


export const metadata: Metadata = {
  title: 'Thumbnail Downloader',
  description: 'Download thumbnails from any video.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0D0D0D" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
         <LayoutProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <FirebaseClientProvider>
                <SubscriptionProvider>
                  <LayoutWrapper>{children}</LayoutWrapper>
                </SubscriptionProvider>
              </FirebaseClientProvider>
              <Toaster />
            </ThemeProvider>
          </LayoutProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
