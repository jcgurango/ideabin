/**
 * Decodes an audio Blob/File, chunks the first channel in `chunkSize` frames,
 * and for each chunk, computes RMS amplitude *as if* it came from an AnalyserNode's
 * time-domain byte data.
 */
export async function getAmplitudeDataFromFile(file: Blob, chunkSize = 2048) {
  // 1) Decode the audio data into a float buffer.
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // 2) Grab the first channel's float samples ([-1..1]).
  const channelData = audioBuffer.getChannelData(0);
  const totalSamples = channelData.length;

  // 3) Chunk the data in frames of `chunkSize`.
  const amplitudeData = [];
  for (let start = 0; start < totalSamples; start += chunkSize) {
    const end = Math.min(start + chunkSize, totalSamples);

    // 4) Compute RMS amplitude for this chunk,
    //    replicating the AnalyserNode logic: (byte - 128) / 128
    let sum = 0;
    const frameLength = end - start;

    for (let i = start; i < end; i++) {
      const floatVal = channelData[i];

      // Convert [-1..1] -> [0..255], clamp to avoid out-of-range
      let byteVal = floatVal * 128 + 128;
      if (byteVal < 0) byteVal = 0;
      if (byteVal > 255) byteVal = 255;

      // Then compute (byteVal - 128)/128 to get [-1..1] offset
      const val = (byteVal - 128) / 128.0;
      sum += val * val;
    }

    const rms = Math.sqrt(sum / frameLength);
    amplitudeData.push(rms);
  }

  return amplitudeData;
}
