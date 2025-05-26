#!/bin/bash

# Optimize avatar-portrait.mp4 to 140px x 140px with iOS compatibility
ffmpeg -i src/assets/avatar-portrait.mp4 \
  -vf "scale=140:140:force_original_aspect_ratio=decrease,pad=140:140:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 \
  -profile:v baseline \
  -level 3.0 \
  -pix_fmt yuv420p \
  -crf 23 \
  -preset slow \
  -movflags +faststart \
  src/assets/avatar-portrait-140.mp4