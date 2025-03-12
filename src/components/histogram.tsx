"use client";

import { useEffect, useRef } from "react";

export default function Histogram({
  amplitudeData,
  onSeek = () => {},
  duration = 0,
  currentTime = 0,
}: {
  amplitudeData: number[];
  onSeek?: (time: number) => void;
  duration?: number;
  currentTime?: number;
}) {
  // Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = clickX / canvas.clientWidth;

    const newTime = fraction * duration;
    onSeek(newTime);
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  Drawing the Histogram & the Playback Line
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    redrawHistogram();
    drawPlaybackLine();
  }, [canvasRef, currentTime, amplitudeData]);

  function redrawHistogram() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const amps = amplitudeData;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    if (!amps.length) return;

    // Draw each RMS value as a vertical bar
    const barWidth = width / amps.length;

    ctx.beginPath();
    for (let i = 0; i < amps.length; i++) {
      const barHeight = amps[i] * height; // no extra normalization, just raw RMS
      const x = i * barWidth;
      const y = height - barHeight;
      ctx.rect(x, y, barWidth, barHeight);
    }
    ctx.stroke();
  }

  function drawPlaybackLine() {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || !duration) return;

    const fraction = currentTime / duration;
    const x = fraction * canvas.width;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  return (
    <canvas
      ref={canvasRef}
      width="600"
      height={150}
      style={{
        border: "1px solid #000",
        cursor: "pointer",
        width: "100%",
        height: "150px",
      }}
      onClick={handleCanvasClick}
    />
  );
}
