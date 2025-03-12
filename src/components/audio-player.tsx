"use client";
import { useRef, useState } from "react";
import Histogram from "./histogram";
import { Button } from "./ui/button";
import { FastForward, Pause, Play, Rewind } from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────
//  Formatting the Time Display
// ────────────────────────────────────────────────────────────────────────────
function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return "00:00";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function AudioPlayer({
  amplitudeData = [],
  audioUrl,
}: {
  amplitudeData?: number[];
  audioUrl: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ────────────────────────────────────────────────────────────────────────────
  //  Playback (custom controls, no default UI)
  // ────────────────────────────────────────────────────────────────────────────
  function handlePlayPauseClick() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }

  function handleRewindClick() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
  }

  function handleForwardClick() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = audioRef.current?.duration - 0.001;
  }

  function onLoadedMetadata() {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setCurrentTime(0);
    }
  }

  function onPlay() {
    setIsPlaying(true);
    updateTimeFromAudioRef();
  }

  function onPause() {
    setIsPlaying(false);
    updateTimeFromAudioRef();
  }

  function onEnded() {
    setIsPlaying(false);
    setCurrentTime(0);
  }

  function onTimeUpdate() {
    updateTimeFromAudioRef();
  }

  function updateTimeFromAudioRef() {
    setCurrentTime(audioRef.current?.currentTime || 0);
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  Seeking via Click on the Histogram
  // ────────────────────────────────────────────────────────────────────────────
  function onSeek(newTime: number) {
    if (!audioRef.current || !audioUrl) return;

    audioRef.current.currentTime = newTime;

    // If paused, reflect the new line position
    if (!isPlaying) {
      setCurrentTime(newTime);
    }
  }

  // Hidden audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <>
      <div className="mt-2">
        <Histogram
          onSeek={onSeek}
          amplitudeData={amplitudeData}
          duration={duration}
          currentTime={currentTime}
        />
      </div>
      <audio
        ref={audioRef}
        style={{ display: "none" }}
        src={audioUrl}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
      />
      <div className="mt-1 flex flex-row justify-between items-center">
        <div>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="grid gap-x-1 grid-cols-3">
          <Button onClick={handleRewindClick}>
            <Rewind />
          </Button>
          <Button onClick={handlePlayPauseClick}>
            {isPlaying ? (
              <>
                <Pause />
                <span className="hidden md:inline">Pause</span>
              </>
            ) : (
              <>
                <Play />
                <span className="hidden md:inline">Play</span>
              </>
            )}
          </Button>
          <Button onClick={handleForwardClick}>
            <FastForward />
          </Button>
        </div>
      </div>
    </>
  );
}
