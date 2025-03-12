"use client"; // If on Next.js 13+ app router, to ensure client-side rendering

import React, { useState, useRef, useEffect } from "react";
import Histogram from "./histogram";
import { useWakeLock } from "react-screen-wake-lock";

/**
 * Encode an AudioBuffer as a 16-bit PCM WAV Blob.
 * This is a minimal encoder to demonstrate normalization -> WAV.
 */
function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const data = new Float32Array(length * numberOfChannels);

  // Interleave channels
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i * numberOfChannels + channel] = channelData[i];
    }
  }

  // Convert to 16-bit PCM
  const buffer = new ArrayBuffer(44 + data.length * 2);
  const view = new DataView(buffer);

  // Write WAV header
  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* file length */
  view.setUint32(4, 36 + data.length * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* number of channels */
  view.setUint16(22, numberOfChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numberOfChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, data.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    // clamping
    const s = Math.max(-1, Math.min(1, data[i]));
    // scale to 16-bit signed int
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/**
 * Normalize a recorded audio Blob: decodes it, finds peak amplitude,
 * applies gain so that peak == 1.0, then re-encodes as WAV.
 */
async function normalizeAudioBlob(
  blob: Blob
): Promise<{ data: Blob; gain: number }> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // Find peak amplitude
  let peak = 0;
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < channelData.length; i++) {
      const val = Math.abs(channelData[i]);
      if (val > peak) {
        peak = val;
      }
    }
  }
  if (peak < 1e-8) {
    // If there's essentially no signal, return the original or set gain=1
    peak = 1;
  }
  const gain = 1 / peak; // so that new peak will be 1.0

  // Render offline with gain applied
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = gain;

  source.connect(gainNode).connect(offlineCtx.destination);
  source.start();

  const normalizedBuffer = await offlineCtx.startRendering();
  audioCtx.close();

  // Encode as WAV
  return {
    data: encodeWav(normalizedBuffer),
    gain,
  };
}

export default function AudioRecorder({
  recording = false,
  onRecorded = () => {},
}: {
  recording?: boolean;
  onRecorded?: (audioUrl: string, amplitudeData: number[]) => void;
}) {
  // (Try to) keep the screen awake while recording.
  const {
    isSupported,
    released,
    request: requestWakeLock,
    release: releaseWakeLock,
  } = useWakeLock({
    onRequest: () => console.log("Screen Wake Lock: requested!"),
    onError: (e) => console.log("An error happened 💥", e),
    onRelease: () => console.log("Screen Wake Lock: released!"),
  });

  useEffect(() => {
    if (recording && isSupported) {
      requestWakeLock();

      return () => {
        releaseWakeLock();
      };
    }
  }, [isSupported, recording]);

  // Playback/Recording
  const [amplitudeData, setAmplitudeData] = useState<number[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [releaseReady, setReleaseReady] = useState(false);

  // ────────────── Refs ──────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // RMS histogram data
  const recordingRafRef = useRef<number | null>(null);

  // ────────────────────────────────────────────────────────────────────────────
  //  Recording
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (recording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [recording]);

  async function startRecording() {
    if (!navigator?.mediaDevices) {
      alert("Media devices not available (SSR environment?)");
      return;
    }

    try {
      setAmplitudeData([]);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Combine the recorded chunks
        const rawBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Normalize the audio offline, then re-encode as WAV
        const { data: normalizedBlob, gain } = await normalizeAudioBlob(
          rawBlob
        );

        const url = URL.createObjectURL(normalizedBlob);
        setAmplitudeData((data) => data.map((n) => n * gain));
        setAudioUrl(url);
        setReleaseReady(true);
      };

      mediaRecorderRef.current.start();

      // Setup for real-time RMS
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;

      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      startRecordingVisualization();
    } catch (error) {
      console.error(error);
      alert("Could not access microphone.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();

    stopRecordingVisualization();

    // Disconnect
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  Recording Visualization (RMS Histogram)
  // ────────────────────────────────────────────────────────────────────────────
  function startRecordingVisualization() {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.fftSize);

    const draw = () => {
      recordingRafRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      // Compute RMS amplitude
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128.0;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAmplitudeData((data) => data.concat(rms));
    };

    draw();
  }

  function stopRecordingVisualization() {
    if (recordingRafRef.current) {
      cancelAnimationFrame(recordingRafRef.current);
      recordingRafRef.current = null;
    }
  }

  useEffect(() => {
    if (audioUrl && releaseReady) {
      onRecorded(audioUrl, amplitudeData);
      setReleaseReady(false);
    }
  }, [releaseReady, audioUrl, amplitudeData]);

  // ────────────────────────────────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────────────────────────────────
  return <Histogram amplitudeData={amplitudeData} />;
}
