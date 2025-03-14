"use client"; // If you're on Next.js 13+ with the app router

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const NOTE_NAMES = [
  ["C"],
  ["C#", "Db"],
  ["D"],
  ["D#", "Eb"],
  ["E", "Fb"],
  ["F"],
  ["F#", "Gb"],
  ["G"],
  ["G#", "Ab"],
  ["A"],
  ["A#", "Bb"],
  ["B", "Cb"],
];

// Typescript definitions for chord and scale dictionaries.
// The array of numbers represents intervals in semitones above the root (which is 0).
export const CHORD_QUALITIES: Record<string, number[]> = {
  // Triads
  maj: [0, 4, 7], // e.g. C-E-G
  min: [0, 3, 7], // e.g. C-Eb-G
  m: [0, 3, 7], // e.g. C-Eb-G
  dim: [0, 3, 6], // e.g. C-Eb-Gb
  aug: [0, 4, 8], // e.g. C-E-G#

  // Seventh chords
  "7": [0, 4, 7, 10], // e.g. C-E-G-Bb
  maj7: [0, 4, 7, 11], // e.g. C-E-G-B
  min7: [0, 3, 7, 10], // e.g. C-Eb-G-Bb
  m7b5: [0, 3, 6, 10], // e.g. C-Eb-Gb-Bb (aka m7b5)
  dim7: [0, 3, 6, 9], // e.g. C-Eb-Gb-Bbb(A)

  // 9th chords
  "9": [0, 4, 7, 10, 14], // 1, 3, 5, ♭7, 9
  maj9: [0, 4, 7, 11, 14], // 1, 3, 5, 7, 9
  min9: [0, 3, 7, 10, 14], // 1, ♭3, 5, ♭7, 9

  // 11th chords (often includes the 9th too)
  "11": [0, 4, 7, 10, 14, 17], // 1, 3, 5, ♭7, 9, 11
  maj11: [0, 4, 7, 11, 14, 17], // 1, 3, 5, 7, 9, 11
  min11: [0, 3, 7, 10, 14, 17], // 1, ♭3, 5, ♭7, 9, 11

  // 13th chords (often includes 9th & 11th)
  "13": [0, 4, 7, 10, 14, 17, 21], // 1, 3, 5, ♭7, 9, 11, 13
  maj13: [0, 4, 7, 11, 14, 17, 21], // 1, 3, 5, 7, 9, 11, 13
  min13: [0, 3, 7, 10, 14, 17, 21], // 1, ♭3, 5, ♭7, 9, 11, 13

  // "add" chords (no 7th)
  add9: [0, 4, 7, 14], // 1, 3, 5, 9
  madd9: [0, 3, 7, 14], // 1, ♭3, 5, 9

  // Less common "add11" / "add13"
  add11: [0, 4, 7, 17], // 1, 3, 5, 11
  madd11: [0, 3, 7, 17], // 1, ♭3, 5, 11

  // "add13" is often just called a '6' chord, but if you need it:
  add13: [0, 4, 7, 21], // 1, 3, 5, 13 (no 7, 9, or 11)
  madd13: [0, 3, 7, 21], // 1, ♭3, 5, 13 (no 7, 9, or 11)
  maj6: [0, 4, 7, 21], // 1, 3, 5, 13 (no 7, 9, or 11)
  min6: [0, 3, 7, 21], // 1, ♭3, 5, 13 (no 7, 9, or 11)
};

export const SCALE_QUALITIES: Record<string, number[]> = {
  // Major & Minor
  Major: [0, 2, 4, 5, 7, 9, 11], // Ionian
  Minor: [0, 2, 3, 5, 7, 8, 10], // Aeolian

  /*
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11], // ascending melodic minor

  // Modes of the major scale
  Ionian: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  */

  // Pentatonic scales
  "Major Pentatonic": [0, 2, 4, 7, 9],
  "Minor Pentatonic": [0, 3, 5, 7, 10],

  // Blues scale (minor blues)
  Blues: [0, 3, 5, 6, 7, 10],
};

// Example chord dictionary (in a real app, expand as needed)
const CHORDS: Record<string, number[]> = NOTE_NAMES.reduce(
  (current, note, noteOffset) => {
    return {
      ...current,
      ...note.reduce((current, noteName) => {
        return {
          ...current,
          ...Object.keys(CHORD_QUALITIES).reduce((current, chordQuality) => {
            return {
              ...current,
              [`${noteName}${chordQuality}`]: CHORD_QUALITIES[chordQuality].map(
                (n) => (n + noteOffset) % 12
              ),
            };
          }, {}),
        };
      }, {}),
    };
  },
  {}
);

// Example scale definitions
// Each scale is an array of notes, typically 7 for diatonic, but you could have any collection of notes.
const SCALES: Record<string, number[]> = NOTE_NAMES.reduce(
  (current, note, noteOffset) => {
    return {
      ...current,
      ...Object.keys(SCALE_QUALITIES).reduce((current, chordQuality) => {
        return {
          ...current,
          [`${note.join("/")} ${chordQuality}`]: SCALE_QUALITIES[
            chordQuality
          ].map((n) => (n + noteOffset) % 12),
        };
      }, {}),
    };
  },
  {}
);

console.log(CHORDS, SCALES);

// Simple function to get the notes for a chord name if it exists in our dictionary
function getChordNotes(chordName: string): number[] | null {
  const normalized = chordName.trim();
  return CHORDS[normalized] || null;
}

// Normalizes input notes to a consistent notation, e.g. uppercase, strip whitespace
function normalizeNote(note: string): number {
  const noteName = note
    .trim()
    .replace(/(\w)b/g, (match) => match.toUpperCase()) // e.g. 'bb' => 'Bb'
    .replace(/(\w)#/g, (match) => match.toUpperCase()); // e.g. 'c#' => 'C#'

  return NOTE_NAMES.findIndex((note) => note.includes(noteName));
}

export default function ScaleMatcher() {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<
    { scaleName: string; matchCount: number; totalInputNotes: number }[]
  >([]);

  // Handler for the "Find Scales" button
  const handleFindScales = () => {
    // Split the input by commas to get chord/note tokens
    const rawTokens = inputValue.split(" ");
    let allInputNotes: number[] = [];

    rawTokens.forEach((token) => {
      const trimmedToken = token.trim();
      if (!trimmedToken) return;

      // Try to see if token is a chord we know
      const chordNotes = getChordNotes(trimmedToken);
      if (chordNotes) {
        // It's a chord, push chord notes
        allInputNotes.push(...chordNotes);
      } else {
        // Otherwise treat it as a single note
        const note = normalizeNote(trimmedToken);

        if (note > -1) {
          allInputNotes.push(note);
        }
      }
    });

    // Remove duplicates from allInputNotes (optional)
    allInputNotes = Array.from(new Set(allInputNotes));

    // Calculate matches
    const scaleMatches = Object.keys(SCALES).map((name) => {
      const notes = SCALES[name];
      const scaleNoteSet = new Set(notes);

      // Count how many of the input notes are in this scale
      let matchCount = 0;
      allInputNotes.forEach((note) => {
        if (scaleNoteSet.has(note)) {
          matchCount++;
        }
      });

      return {
        scaleName: name,
        matchCount,
        totalInputNotes: allInputNotes.length,
      };
    });

    // Sort by best match (descending by match percentage)
    scaleMatches.sort((a, b) => {
      const aPerc = a.matchCount / a.totalInputNotes;
      const bPerc = b.matchCount / b.totalInputNotes;
      return bPerc - aPerc;
    });

    setResults(scaleMatches);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Scale Matcher</h1>
      <p className="mb-2">
        Enter chords or notes separated by commas. For example: <br />
        <code>C Cm G Bb F# C7</code>
      </p>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button onClick={handleFindScales}>Find Scales</Button>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Possible Matches</h2>
          <ul className="space-y-2">
            {results.map((r) => {
              const matchPercent = (
                (r.matchCount / r.totalInputNotes) *
                100
              ).toFixed(1);

              return (
                <li
                  key={r.scaleName}
                  className="border border-gray-300 p-2 rounded"
                >
                  <div className="font-medium">{r.scaleName}</div>
                  <div className="text-sm text-gray-600">
                    Match: {r.matchCount}/{r.totalInputNotes} ({matchPercent}%)
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
