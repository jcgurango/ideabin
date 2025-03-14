"use client"; // If you're on Next.js 13+ with the app router

import React, { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Chord, Note, RomanNumeral, Scale } from "tonal";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toRoman } from "@javascript-packages/roman-numerals";

const getCommonness = (name: string) => {
  return (name.endsWith("major") ? 2 : 0) + (name.endsWith("minor") ? 1 : 0);
};

const toChords = (degrees = [0, 2, 4], scale: Scale.Scale) =>
  scale.notes.map((note: string, i: number) => {
    const detected = Chord.detect(
      degrees.map((n) => n + i).map((n) => scale.notes[n % scale.notes.length])
    );

    if (detected.length) {
      const [chordName] = detected;
      const chord = Chord.get(chordName);

      return <TableCell key={note}>{chord.symbol}</TableCell>;
    }

    return <TableCell key={note} />;
  });

export default function ScaleMatcher() {
  const [chords, setChords] = useState("");
  const [notes, setNotes] = useState("");
  const { noteNames, invalid } = useMemo(() => {
    const noteNames = [];
    const invalid = [];

    if (notes) {
      for (let note of notes.split(" ")) {
        if (note) {
          const foundNote = Note.get(note);

          if (foundNote.empty) {
            invalid.push(`note ${note}`);
          } else {
            noteNames.push(foundNote.name);
          }
        }
      }
    }

    if (chords) {
      for (let chord of chords.split(" ")) {
        if (chord) {
          const foundChord = Chord.get(chord);

          if (foundChord.empty) {
            invalid.push(`chord ${chord}`);
          } else {
            noteNames.push(...foundChord.notes);
          }
        }
      }
    }

    return {
      noteNames: noteNames.reduce<string[]>((current, next) => {
        if (!current.includes(next)) {
          return current.concat(next);
        }

        return current;
      }, []),
      invalid,
    };
  }, [chords, notes]);

  const matchingScales = useMemo(() => {
    if (!noteNames.length) {
      const noteNames = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
      ];

      return [
        ...noteNames.map((name) => ({
          name: `${name} major`,
          sortOrder: 2,
        })),
        ...noteNames.map((name) => ({
          name: `${name} minor`,
          exact: true,
          sortOrder: 1,
        })),
      ];
    }

    const matches: { name: string; sortOrder: number }[] = [];

    noteNames.forEach((noteName) => {
      matches.push(
        ...Scale.detect(noteNames, { tonic: noteName })
          .filter((name) => !matches.find(({ name: n }) => n === name))
          .map((name) => ({
            name,
            sortOrder: getCommonness(name),
          }))
      );
    });

    matches.sort((a, b) => b.sortOrder - a.sortOrder);

    return matches.filter(({ name }) => !name.endsWith("chromatic"));
  }, [noteNames]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Scale Matcher</h1>
      <p className="mb-2">Enter chords or notes separated by commas.</p>
      <Input
        className="mb-1"
        value={chords}
        onChange={(e) => setChords(e.target.value)}
        placeholder="Chords (e.x. C Cm Gmaj7)"
      />
      <Input
        className="mb-1"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (e.x. C C# Db)"
      />
      {noteNames.length || invalid.length ? (
        <div className="mb-1 text-gray-600 text-sm">
          Notes: {noteNames.join(", ")}
          {invalid.length
            ? `${noteNames.length ? " " : ""}(Invalid: ${invalid.join(", ")})`
            : null}
        </div>
      ) : null}

      <div className="mt-6">
        {matchingScales.map((match) => {
          const scale = Scale.get(match.name);

          return (
            <Card key={match.name} className="mb-2 py-3 gap-2">
              <CardHeader className="font-bold px-3">{match.name}</CardHeader>
              <CardContent className="px-3">
                <Table className="mb-2">
                  <TableCaption>Notes</TableCaption>
                  <TableHeader>
                    <TableRow>
                      {scale.notes.map((_, index) => (
                        <TableHead key={index}>{toRoman(index + 1)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {scale.notes.map((note) => (
                        <TableCell key={note}>{note}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
                <Table className="mb-2">
                  <TableCaption>Chords</TableCaption>
                  <TableHeader>
                    <TableRow>
                      {scale.notes.map((_, index) => (
                        <TableHead key={index}>{toRoman(index + 1)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>{toChords([0, 2, 4], scale)}</TableRow>
                    <TableRow>{toChords([0, 2, 4, 6], scale)}</TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
