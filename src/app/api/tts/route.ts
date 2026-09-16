import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache to ensure instant, zero-latency audio playback for common phrases
const ttsCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 100;

function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  let remaining = trimmed;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    const slice = remaining.substring(0, maxLen);
    let splitIdx = Math.max(
      slice.lastIndexOf("।"),
      slice.lastIndexOf("."),
      slice.lastIndexOf("?"),
      slice.lastIndexOf("!"),
      slice.lastIndexOf(","),
      slice.lastIndexOf(";")
    );

    // If no punctuation found, split on last space
    if (splitIdx < 30) {
      splitIdx = slice.lastIndexOf(" ");
    }
    // Hard fallback if no spaces
    if (splitIdx < 20) {
      splitIdx = maxLen;
    }

    const chunk = remaining.substring(0, splitIdx + 1).trim();
    if (chunk) chunks.push(chunk);
    remaining = remaining.substring(splitIdx + 1).trim();
  }

  return chunks.length > 0 ? chunks : [trimmed.substring(0, maxLen)];
}

async function fetchAudioChunk(chunkText: string, lang: string): Promise<Buffer | null> {
  const endpoints = [
    (q: string, l: string) =>
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(l)}&client=tw-ob`,
    (q: string, l: string) =>
      `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(l)}&client=gtx`,
    (q: string, l: string) =>
      `https://translate.google.co.in/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(l)}&client=tw-ob`,
  ];

  for (const getUrl of endpoints) {
    try {
      const url = getUrl(chunkText, lang);
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "audio/mpeg, audio/*; q=0.9, */*; q=0.8",
        },
        // 4 second timeout per upstream attempt
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf.byteLength > 0) {
          return Buffer.from(arrayBuf);
        }
      }
    } catch (e) {
      // Try next endpoint
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text parameter is required" }, { status: 400 });
    }

    const cleanText = text.trim();
    const cacheKey = `${lang}:::${cleanText}`;

    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      return new NextResponse(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": cached.length.toString(),
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }

    // Split text cleanly into chunks of <= 160 characters
    const chunks = splitTextIntoChunks(cleanText, 160);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const buf = await fetchAudioChunk(chunk, lang);
      if (buf) {
        audioBuffers.push(buf);
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate speech audio stream across all providers" },
        { status: 502 }
      );
    }

    const fullAudioBuffer = Buffer.concat(audioBuffers);

    // Save to cache
    if (ttsCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, fullAudioBuffer);

    return new NextResponse(new Uint8Array(fullAudioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": fullAudioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: any) {
    console.error("TTS Generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
