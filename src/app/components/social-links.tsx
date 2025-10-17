
'use client';

import { Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SocialLinks() {
  return (
    <div className="text-center">
      <p className="mb-4 text-sm font-medium text-muted-foreground">Follow us on</p>
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="https://www.instagram.com/lootbuy_india?igsh=MTk5Ynd1OW82ejY2ag==" target="_blank" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </Link>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <Link href="https://youtube.com/@onlyp4x" target="_blank" aria-label="YouTube">
            <Youtube className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
