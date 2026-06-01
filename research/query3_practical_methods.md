# Research: What are the best methods to create professional marketing videos using only open-source and API-based tools? Specifically: 1) How to use ffmpeg for video compositing, transitions, text overlays, and Ken Burns effects on still images. 2) How to use Remotion (React-based video framework) for programmatic video generation with templates. 3) Best practices for combining AI-generated images (Flux, Stable Diffusion) with text-to-speech (edge-tts, ElevenLabs) and background music into cohesive video ads. 4) How to achieve professional-quality results without Premiere Pro or After Effects. 5) Specific ffmpeg command patterns for creating slideshow videos with zoom/pan effects, crossfade transitions, and synchronized audio. Include real command examples and technical specifications.

# Professional Marketing Video Production: Open-Source Pipeline Guide

## 1. FFmpeg Advanced Compositing & Effects

### Ken Burns Effect (Zoom & Pan on Stills)

```bash
# Basic Ken Burns: zoom in while panning
ffmpeg -loop 1 -i image.jpg \
  -vf "scale=3840:2160,zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080" \
  -c:v libx264 -preset slow -crf 18 \
  -t 10 -pix_fmt yuv420p output.mp4
```

**Command breakdown:**
- `zoompan` parameters: `z=` zoom speed, `x=`/`y=` pan coordinates, `d=` duration (frames), `s=` output size
- `min(zoom+0.0015,1.5)` = smooth zoom acceleration capped at 1.5x

### Professional Crossfade Transitions Between Images

```bash
# 10-image slideshow with 1-second crossfades
ffmpeg -i image%01d.jpg -filter_complex \
  "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,
   split=10[v0][v1][v2][v3][v4][v5][v6][v7][v8][v9];
   [v0]setpts=PTS+0/TB[i0];
   [v1]setpts=PTS+4/TB[i1];
   [v2]setpts=PTS+8/TB[i2];
   [v3]setpts=PTS+12/TB[i3];
   [v4]setpts=PTS+16/TB[i4];
   [v5]setpts=PTS+20/TB[i5];
   [v6]setpts=PTS+24/TB[i6];
   [v7]setpts=PTS+28/TB[i7];
   [v8]setpts=PTS+32/TB[i8];
   [v9]setpts=PTS+36/TB[i9];
   [i0][i1]xfade=transition=fade:duration=1:offset=4[out1];
   [out1][i2]xfade=transition=fade:duration=1:offset=8[out2];
   [out2][i3]xfade=transition=fade:duration=1:offset=12[out3];
   [out3][i4]xfade=transition=fade:duration=1:offset=16[out4];
   [out4][i5]xfade=transition=fade:duration=1:offset=20[out5];
   [out5][i6]xfade=transition=fade:duration=1:offset=24[out6];
   [out6][i7]xfade=transition=fade:duration=1:offset=28[out7];
   [out7][i8]xfade=transition=fade:duration=1:offset=32[out8];
   [out8][i9]xfade=transition=fade:duration=1:offset=36" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -framerate 30 output.mp4
```

**Pro tip:** Replace `fade` with: `dissolve`, `pixelize`, `slidedown`, `slideleft`, `wipeup`, `wipeleft` for different transitions.

### Dynamic Text Overlays with Animation

```bash
# Animated text with fade-in/out (3-second duration)
ffmpeg -i input.mp4 -vf \
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:
   text='SPECIAL OFFER':fontsize=72:fontcolor=white:
   x='(w-text_w)/2':y='h/4':
   enable='between(t\,0.5\,3.5)':
   alpha='if(lt(t\,1)\,t\,if(lt(t\,3)\,1\,if(lt(t\,3.5)\,5-t*2\,0)))'" \
  -c:v libx264 -preset slow -crf 18 output.mp4
```

### Animated Title Card with Background & Text

```bash
# 4-second title card with color background
ffmpeg -f lavfi -i color=c=0x2c3e50:s=1920x1080:d=4 \
  -vf "
  drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:
  text='YOUR PRODUCT NAME':fontsize=96:fontcolor=white:
  x='(w-text_w)/2':y='(h-text_h)/2-100':
  alpha='if(lt(t\,0.5)\,t*2\,if(lt(t\,3.5)\,1\,4-t))';
  drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:
  text='Transform Your Business Today':fontsize=48:fontcolor=gold:
  x='(w-text_w)/2':y='(h-text_h)/2+100':
  alpha='if(lt(t\,1)\,(t-0.5)*2\,if(lt(t\,3.5)\,1\,4-t))'" \
  -c:v libx264 -preset slow -crf 18 title.mp4
```

### Ken Burns + Text Overlay Combination

```bash
# Still image with Ken Burns zoom + animated text
ffmpeg -loop 1 -i product.jpg \
  -vf "
  scale=3840:2160,
  zoompan=z='min(zoom+0.001,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080,
  drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:
  text='LIMITED TIME OFFER':fontsize=80:fontcolor=white:
  x='(w-text_w)/2':y='h-200':shadowx=3:shadowy=3:
  shadowcolor=black@0.5:
  enable='between(t\,1\,9)':
  alpha='if(lt(t\,1.5)\,(t-1)*2\,if(lt(t\,8.5)\,1\,10-t))'" \
  -c:v libx264 -preset slow -crf 18 -t 10 output.mp4
```

## 2. Remotion: Programmatic Video Generation

### Project Setup

```bash
npx create-remotion@latest marketing-video
cd marketing-video
npm install @remotion/bundler @remotion/renderer remotion
```

### Core Video Component Template

```jsx
// src/MyComposition.tsx
import { AbsoluteFill, Img, Sequence, interpolate, spring, Easing } from 'remotion';
import React from 'react';

interface VideoProps {
  title: string;
  imageUrls: string[];
  duration: number;
}

export const MarketingVideo: React.FC<VideoProps> = ({ 
  title, 
  imageUrls, 
  duration 
}) => {
  const imageDurationFrames = Math.floor(duration * 25 / imageUrls.length); // 25 fps

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {imageUrls.map((imageUrl, index) => {
        const startFrame = index * imageDurationFrames;
        const opacityStart = startFrame + 5;
        const opacityEnd = startFrame + imageDurationFrames - 5;

        return (
          <Sequence from={startFrame} durationInFrames={imageDurationFrames} key={index}>
            <AbsoluteFill>
              <Img
                src={imageUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: interpolate(
                    Math.max(0, Math.min(duration * 25, Date.now() / 16.67)),
                    [opacityStart, opacityStart + 10, opacityEnd - 10, opacityEnd],
                    [0, 1, 1, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                  ),
                }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      
      <TitleOverlay text={title} />
    </AbsoluteFill>
  );
};

// Title component with spring animation
const TitleOverlay: React.FC<{ text: string }> = ({ text }) => {
  const frame = 0; // Use context for frame tracking in production
  
  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 96,
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {text}
    </AbsoluteFill>
  );
};
```

### Advanced Slideshow with Ken Burns & Text

```jsx
// src/AdvancedSlideshow.tsx
import React, { useState } from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  useFrame,
  spring,
} from 'remotion';

interface SlideProps {
  imageUrl: string;
  text: string;
  startFrame: number;
  durationFrames: number;
}

const KenBurnsSlide: React.FC<SlideProps> = ({
  imageUrl,
  text,
  startFrame,
  durationFrames,
}) => {
  return (
    <Sequence from={startFrame} durationInFrames={durationFrames}>
      <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
        {/* Ken Burns Effect */}
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <KenBurnsImage imageUrl={imageUrl} durationFrames={durationFrames} />
        </div>

        {/* Text Overlay */}
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            padding: '60px',
            backgroundImage:
              'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          }}
        >
          <TextAnimation text={text} durationFrames={durationFrames} />
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};

const KenBurnsImage: React.FC<{
  imageUrl: string;
  durationFrames: number;
}> = ({ imageUrl, durationFrames }) => {
  const { frame } = useFrame();
  
  const scale = interpolate(
    frame,
    [0, durationFrames],
    [1, 1.3],
    { extrapolateRight: 'clamp' }
  );

  const translateX = interpolate(
    frame,
    [0, durationFrames],
    [0, 50],
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [0, durationFrames],
    [0, -30],
    { extrapolateRight: 'clamp' }
  );

  return (
    <Img
      src={imageUrl}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
      }}
    />
  );
};

const TextAnimation: React.FC<{
  text: string;
  durationFrames: number;
}> = ({ text, durationFrames }) => {
  const { frame } = useFrame();

  const opacity = interpolate(
    frame,
    [0, 15, durationFrames - 15, durationFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        fontSize: 64,
        fontWeight: 'bold',
        color: 'white',
        opacity,
        textShadow: '0 4px 12px rgba(0,0,0,0.9)',
        maxWidth: '70%',
      }}
    >
      {text}
    </div>
  );
};

export default KenBurnsSlide;
```

### Rendering Remotion Videos

```typescript
// render.ts
import { bundle } from '@remotion/bundler';
import { renderMedia } from '@remotion/renderer';
import path from 'path';

export const renderVideo = async (
  videoProps: Record<string, unknown>,
  outputPath: string
) => {
  const bundled = await bundle(
    path.join(process.cwd(), 'src/index.ts'),
    () => undefined,
    {
      webpackOverride: (config) => config,
    }
  );

  await renderMedia({
    composition: 'MarketingVideo',
    serveUrl: bundled,
    codec: 'h264',
    crf: 18,
    pixelFormat: 'yuv420p',
    outputLocation: outputPath,
    inputProps: videoProps,
    concurrency: 4,
  });

  console.log(`✓ Video rendered: ${outputPath}`);
};
```

## 3. AI Image + TTS + Music Integration

### Generating Images with Stable Diffusion (API)

```bash
# Using stability.ai API (requires API key)
curl --request POST \
  --url https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image \
  --header "authorization: Bearer $STABILITY_API_KEY" \
  --header "content-type: application/json" \
  --data '{
    "steps": 50,
    "width": 1024,
    "height": 1024,
    "seed": 0,
    "cfg_scale": 7.5,
    "samples": 1,
    "text_prompts": [
      {
        "text": "professional marketing photo of product in studio setting",
        "weight": 1
      }
    ]
  }' > response.json

# Extract base64 and decode
jq -r '.artifacts[0].base64' response.json | base64 -d > product_image.png
```

### Text-to-Speech with Edge-TTS (Free, No API Key)

```bash
# Install edge-tts
pip install edge-tts

# Generate speech
edge-tts --voice "en-US-AriaNeural" \
  --text "Your amazing product is now available at 50% off" \
  --write-media output_audio.mp3 \
  --rate=+10%
```

### Python Script: AI Image + TTS + Music Pipeline

```python
# generate_marketing_assets.py
import requests
import subprocess
import json
from pathlib import Path
from pydub import AudioSegment

class MarketingAssetGenerator:
    def __init__(self, api_key: str, output_dir: str = "assets"):
        self.api_key = api_key
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def generate_image(self, prompt: str, name: str) -> str:
        """Generate image using Stability AI"""
        url = "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image"
        
        headers = {
            "authorization": f"Bearer {self.api_key}",
            "content-type": "application/json",
        }
        
        payload = {
            "steps": 50,
            "width": 1920,
            "height": 1080,
            "cfg_scale": 7.5,
            "samples": 1,
            "text_prompts": [{"text": prompt, "weight": 1}],
        }
        
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        
        image_path = self.output_dir / f"{name}.png"
        with open(image_path, "wb") as f:
            f.write(bytes(data["artifacts"][0]["base64"], "utf-8").decode("base64"))
        
        return str(image_path)

    def generate_speech(self, text: str, name: str, voice: str = "en-US-AriaNeural") -> str:
        """Generate speech using Edge-TTS"""
        output_path = self.output_dir / f"{name}.mp3"
        
        subprocess.run([
            "edge-tts",
            "--voice", voice,
            "--text", text,
            "--write-media", str(output_path),
            "--rate", "+10%"
        ], check=True)
        
        return str(output_path)

    def combine_audio(self, speech_path: str, music_path: str, output_name: str) -> str:
        """Mix speech with background music"""
        speech = AudioSegment.from_mp3(speech_path)
        music = AudioSegment.from_mp3(music_path)
        
        # Reduce music volume and loop if necessary
        music_reduced = music - 12  # 12dB reduction
        
        if len(music_reduced) < len(speech):
            repetitions = (len(speech) // len(music_reduced)) + 1
            music_reduced = music_reduced * repetitions
        
        # Mix speech over music
        combined = music_reduced[:len(speech)].overlay(speech, loop=False)
        
        output_path = self.output_dir / f"{output_name}.mp3"
        combined.export(str(output_path), format="mp3")
        
        return str(output_path)

# Usage example
generator = MarketingAssetGenerator(api_key="your_stability_key")

# Generate assets
images = [
    generator.generate_image("professional product photo, studio lighting", "product_1"),
    generator.generate_image("happy customers using the product", "customers"),
]

speech = generator.generate_speech(
    "Introducing our revolutionary product. Get 50% off today!",
    "voiceover"
)

# Combine with background music (you provide the music file)
final_audio = generator.combine_audio(
    speech, 
    "background_music.mp3", 
    "final_audio"
)

print(f"Generated images: {images}")
print(f"Generated audio: {final_audio}")
```

## 4. Professional-Quality FFmpeg Output Specs

### H.264 Codec (Universal Compatibility)

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -c:a aac -b:a 192k \
  -pix_fmt yuv420p \
  -movflags +faststart \
  output_h264.mp4
```

**Parameters:**
- `-preset slow` = high quality (fast, medium, slow, slower options)
- `-crf 18` = quality (0-51, lower=better; 18 is visually lossless)
- `-pix_fmt yuv420p` = compatibility with all devices
- `-movflags +faststart` = web streaming optimization

### H.265 (HEVC) for Modern Platforms (Instagram, TikTok)

```bash
ffmpeg -i input.mp4 \
  -c:v libx265 \
  -preset slow \
  -crf 20 \
  -c:a aac -b:a 128k \
  -pix_fmt yuv420p \
  -tag:v hvc1 \
  output_h265.mp4
```

### High-Quality Mezzanine File (Archival)

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset veryslow \
  -crf 12 \
  -c:a flac \
  -pix_fmt yuv420p \
  output_mezzanine.mov
```

### 4K Output with Color Grading

```bash
ffmpeg -i input.mp4 \
  -vf "
  scale=3840:2160:flags=lanczos,
  colorspace=bt709:iall=bt601:fast=1,
  eq=contrast=1.1:brightness=0.05:saturation=1.15" \
  -c:v libx264 \
  -preset slow \
  -crf 17 \
  -c:a aac -b:a 256k \
  output_4k.mp4
```

## 5. Complete Slideshow Workflow with Synchronized Audio

### Detect Audio Duration and Auto-Generate Slideshow

```bash
#!/bin/bash
# create_synced_slideshow.sh

AUDIO_FILE="$1"
IMAGES_DIR="$2"
OUTPUT_FILE="$3"

# Get audio duration in seconds
DURATION=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1:noinvert=1 "$AUDIO_FILE")

# Count images
IMAGE_COUNT=$(ls "$IMAGES_DIR"/image*.jpg | wc -l)

# Calculate duration per image
DURATION_PER_IMAGE=$(echo "scale=2; $DURATION / $IMAGE_COUNT" | bc)

# Generate filter_complex for crossfades
FILTER=""
for ((i=0; i<$IMAGE_COUNT; i++)); do
  IMAGE_FILE="$IMAGES_DIR/image$(printf "%02d" $i).jpg"
  
  if [ $i -eq 0 ]; then
    FILTER+="[${i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setpts=PTS+$((i * DURATION_PER_IMAGE))/TB[v${i}];"
  else
    PREV_OFFSET=$((i * DURATION_PER_IMAGE))
    FILTER+="[${i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setpts=PTS+${PREV_OFFSET}/TB[v${i}];"
  fi
done

# Build xfade chain
FADE_CHAIN="[v0]"
for ((i=1; i<$IMAGE_COUNT; i++)); do
  FADE_CHAIN+="[v${i}]xfade=transition=fade:duration=1:offset=$((i * DURATION_PER_IMAGE - 1))"
  if [ $i -lt $((IMAGE_COUNT - 1)) ]; then
    FADE_CHAIN+="[out${i}];[out${i}]"
  fi
done

# Create input list
INPUT_ARGS=""
for ((i=0; i<$IMAGE_COUNT; i++)); do
  IMAGE_FILE="$IMAGES_DIR/image$(printf "%02d" $i).jpg"
  INPUT_ARGS+="-loop 1 -i '$IMAGE_FILE' "
done

# Render video with audio
eval "ffmpeg $INPUT_ARGS \
  -i '$AUDIO_FILE' \
  -filter_complex \"$FILTER$FADE_CHAIN\" \
  -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 192k \
  -pix_fmt yuv420p \
  -shortest \
  '$OUTPUT_FILE'"
```

**Usage:**
```bash
bash create_synced_slideshow.sh voiceover.mp3 ./images/ output_video.mp4
```

### Advanced: Multi-Image Sequence with Ken Burns

```python
# generate_slideshow_advanced.py
import subprocess
import os
from pathlib import Path

class SlideshowGenerator:
    def __init__(self, fps=30):
        self.fps = fps

    def create_ken_burns_slideshow(
        self,
        image_dir: str,
        audio_file: str,
        output_file: str,
        transition_type: str = "fade",
        transition_duration: float = 1.0,
        image_duration: float = 4.0
    ):
        """
        Create slideshow with Ken Burns effect, crossfades, and synced audio
        """
        images = sorted(Path(image_dir).glob("*.jpg"))
        if not images:
            raise ValueError(f"No JPEG images found in {image_dir}")

        # Calculate total duration from audio
        duration_cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:noinvert=1",
            audio_file
        ]
        result = subprocess.run(duration_cmd, capture_output=True, text=True)
        total_duration = float(result.stdout.strip())

        # Build FFmpeg filter graph
        filter_parts = []
        input_count = len(images)
        
        # Scale and Ken Burns for each image
        for i, img in enumerate(images):
            # Ken Burns zoom parameters
            filter_parts.append(
                f"[{i}:v]scale=3840:2160,"
                f"zoompan=z='min(zoom+0.0015,1.5)':"
                f"x='iw/2-(iw/zoom/2)':"
                f"y='ih/2-(ih/zoom/2)':"
                f"d={int(self.fps * image_duration)}:s=1920x1080,"
                f"setpts=PTS+{i * image_duration}/TB[v{i}];"
            )

        # Concatenate with xfade transitions
        concat_filter = "[v0]"
        for i in range(1, input_count):
            concat_filter += f"[v{i}]xfade=transition={transition_type}:duration={transition_duration}:offset={i * image_duration - transition_duration}"
            if i < input_count - 1:
                concat_filter += "[out];[out]"

        filter_graph = "".join(filter_parts) + concat_filter

        # Build FFmpeg command
        cmd = ["ffmpeg"]
        
        # Add image inputs
        for img in images:
            cmd.extend(["-loop", "1", "-i", str(img)])
        
        # Add audio input
        cmd.extend(["-i", audio_file])
        
        # Apply filters
        cmd.extend([
            "-filter_complex", filter_graph,
            "-c:v", "libx264",
            "-preset", "slow",
            "-crf", "18",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-shortest",
            output_file
        ])

        print(f"Rendering slideshow with {len(images)} images...")
        print(f"Total duration: {total_duration:.1f}s")
        
        subprocess.run(cmd, check=True)
        print(f"✓ Slideshow saved: {output_file}")

# Usage
generator = SlideshowGenerator(fps=30)
generator.create_ken_burns_slideshow(
    image_dir="./marketing_images",
    audio_file="voiceover_with_music.mp3",
    output_file="final_marketing_video.mp4",
    transition_type="dissolve",
    transition_duration=1.5,
    image_duration=4.5
)
```

## 6. Complete Production Workflow

### Project Structure

```
marketing-video-pipeline/
├── src/
│   ├── remotion/
│   │   ├── index.ts
│   │   ├── MyComposition.tsx
│   │   └── components/
│   ├── scripts/
│   │   ├── generate_assets.py
│   │   ├── create_slideshow.sh
│   │   └── render_video.ts
│   └── config/
│       └── ffmpeg_presets.json
├── assets/
│   ├── images/
│   ├── audio/
│   └── music/
├── output/
├── package.json
├── tsconfig.json
└── README.md
```

### FFmpeg Presets Config

```json
{
  "presets": {
    "instagram_feed": {
      "resolution": "1080x1350",
      "codec": "h264",
      "crf": 18,
      "audio_bitrate": "128k"
    },
    "tiktok": {
      "resolution": "1080x1920",
      "codec": "h265",
      "crf": 20,
      "audio_bitrate": "128k"
    },
    "youtube": {
      "resolution": "1920x1080",
      "codec": "h264",
      "crf": 17,
      "audio_bitrate": "192k"
    },
    "4k_archive": {
      "resolution": "3840x2160",
      "codec": "h264",
      "crf": 14,
      "audio_bitrate": "256k"
    }
  }
}
```

### Master Render Script

```bash
#!/bin/bash
# render_all_formats.sh

INPUT_VIDEO="$1"
OUTPUT_DIR="${2:-./"output"}"

mkdir -p "$OUTPUT_DIR"

# Instagram
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale=1080:1350:force_original_aspect_ratio=decrease,pad=1080:1350:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 128k \
  "$OUTPUT_DIR/instagram_feed.mp4"

# TikTok
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx265 -preset slow -crf 20 \
  -c:a aac -b:a 128k \
  "$OUTPUT_DIR/tiktok.mp4"

# YouTube
ffmpeg -i "$INPUT_VIDEO" \
  -c:v libx264 -preset slow -crf 17 \
  -c:a aac -b:a 192k \
  -pix_fmt yuv420p \
  "$OUTPUT_DIR/youtube_1080p.mp4"

# 4K Archive
ffmpeg -i "$INPUT_VIDEO" \
  -vf "scale=3840:2160:flags=lanczos" \
  -c:v libx264 -preset veryslow -crf 14 \
  -c:a flac \
  "$OUTPUT_DIR/archive_4k.mov"

echo "✓ All formats rendered to $OUTPUT_DIR"
```

## Key Takeaways

| Task | Tool | Command |
|------|------|---------|
| Ken Burns on stills | FFmpeg | `zoompan` filter |
| Crossfade transitions | FFmpeg | `xfade` filter |
| Dynamic text animation | FFmpeg | `drawtext` + `enable` |
| Programmatic generation | Remotion | React component + renderer |
| AI image generation | Stability API | REST endpoint |
| Text-to-speech | Edge-TTS | `edge-tts` CLI |
| Audio mixing | PyDub | Python overlay/reduce |
| Format export | FFmpeg | Platform-specific presets |

This entire pipeline eliminates the need for Premiere/After Effects by combining FFmpeg's raw power with Remotion's programmatic flexibility. Professional results depend on: proper color grading, consistent audio levels (target -23 LUFS), and thoughtful pacing.