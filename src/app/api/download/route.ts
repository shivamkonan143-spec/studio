import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { PassThrough } from 'stream';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const quality = searchParams.get('quality') || 'highest';

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid or missing YouTube URL' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, ""); // Sanitize title

    let format = ytdl.chooseFormat(info.formats, { 
      quality: 'highestvideo',
      filter: (format) => format.container === 'mp4' && format.hasAudio,
    });
    
    // Fallback if no combined format is found
    if (!format) {
      format = ytdl.chooseFormat(info.formats, { 
        quality: 'highest',
        filter: (format) => format.container === 'mp4',
       });
    }

    if (!format) {
      return NextResponse.json({ error: 'Could not find a suitable video format.' }, { status: 400 });
    }

    const videoStream = ytdl(url, { format });
    const passthrough = new PassThrough();
    videoStream.pipe(passthrough);

    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', `attachment; filename="${title}.mp4"`);

    return new NextResponse(passthrough as any, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('ytdl error:', error);
    return NextResponse.json({ error: 'Failed to fetch video information. The video may be private, region-locked, or deleted.' }, { status: 500 });
  }
}
