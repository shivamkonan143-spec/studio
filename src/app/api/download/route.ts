import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { PassThrough } from 'stream';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const quality = searchParams.get('quality') || 'highest';
  const type = searchParams.get('type') || 'video'; // 'video' or 'audio'

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid or missing YouTube URL' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, "") || 'download';

    let format;
    let fileExtension;
    let mimeType;

    if (type === 'audio') {
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
       format = ytdl.chooseFormat(audioFormats, { 
        quality: quality === 'highest' ? 'highestaudio' : 'lowestaudio',
      });
      fileExtension = 'mp3';
      mimeType = 'audio/mpeg';
    } else {
      let videoFormats = ytdl.filterFormats(info.formats, (f) => f.container === 'mp4' && f.hasAudio && f.hasVideo);
      
      if (videoFormats.length === 0) {
        // Fallback to formats with video but maybe not audio
        videoFormats = ytdl.filterFormats(info.formats, 'video');
      }

      format = ytdl.chooseFormat(videoFormats, { quality: quality });
      
      if (!format) {
        format = ytdl.chooseFormat(videoFormats, { quality: 'highest' });
      }
      
      fileExtension = 'mp4';
      mimeType = 'video/mp4';
    }

    if (!format) {
      return NextResponse.json({ error: 'Could not find a suitable format.' }, { status: 400 });
    }
    
    const videoStream = ytdl(url, { format });
    const passthrough = new PassThrough();
    
    let contentLength = '0';
    if(format.contentLength) {
        contentLength = format.contentLength;
    }

    videoStream.pipe(passthrough);

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Disposition', `attachment; filename="${title}.${fileExtension}"`);
    headers.set('Content-Length', contentLength);

    return new NextResponse(passthrough as any, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('ytdl error:', error);
    return NextResponse.json({ error: 'Could not process video. Please try another one.' }, { status: 500 });
  }
}
