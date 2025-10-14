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
    let fileExtension = 'mp4';
    let mimeType = 'video/mp4';

    if (type === 'audio') {
      format = ytdl.chooseFormat(info.formats, { 
        quality: quality === 'highest' ? 'highestaudio' : 'lowestaudio',
        filter: 'audioonly' 
      });
      fileExtension = 'mp3';
      mimeType = 'audio/mpeg';
    } else {
      // Video download logic
      format = ytdl.chooseFormat(info.formats, {
        quality: quality,
        filter: (f) => f.container === 'mp4' && f.hasAudio && f.hasVideo,
      });

      // Fallback to highest quality if the selected quality is not available with audio
      if (!format) {
        format = ytdl.chooseFormat(info.formats, {
            quality: 'highest',
            filter: (f) => f.container === 'mp4' && f.hasAudio && f.hasVideo,
        });
      }

      if (format) {
        fileExtension = format.container || 'mp4';
        mimeType = format.mimeType || 'video/mp4';
      }
    }


    if (!format) {
      return NextResponse.json({ error: 'Could not find a suitable format for this video.' }, { status: 400 });
    }

    const videoStream = ytdl(url, { format });
    const passthrough = new PassThrough();
    videoStream.pipe(passthrough);

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Disposition', `attachment; filename="${title}.${fileExtension}"`);

    return new NextResponse(passthrough as any, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('ytdl error:', error);
    return NextResponse.json({ error: 'Failed to fetch video information. The video may be private, region-locked, or deleted.' }, { status: 500 });
  }
}
