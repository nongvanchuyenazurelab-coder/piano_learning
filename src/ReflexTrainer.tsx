import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// 1. ÂM THANH SYNTHESIZER (WEB AUDIO API)
// ==========================================
class ReflexSoundEngine {
  ctx: AudioContext | null = null;
  compressor: DynamicsCompressorNode | null = null;
  enabled: boolean = true;

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);
        this.compressor.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  scheduleNoteAt(midi: number, startTime: number, duration: number = 0.85, volume: number = 0.26) {
    if (!this.ctx) return;
    const freq = this.midiToFreq(midi);
    const dest = this.compressor || this.ctx.destination;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 5, 3600), startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.5, 450), startTime + duration);

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    filter.connect(masterGain);
    masterGain.connect(dest);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, startTime);
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.26, startTime);

    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2, startTime);
    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.08, startTime);
    osc3Gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.45);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    osc3.connect(osc3Gain);
    osc3Gain.connect(filter);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
    osc3.stop(startTime + duration + 0.05);
  }

  playNote(midi: number, duration: number = 0.85, volume: number = 0.26) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.scheduleNoteAt(midi, this.ctx.currentTime, duration, volume);
  }

  playChord(midiList: number[], staggerSec: number = 0.032, duration: number = 1.2) {
    if (!this.enabled || !midiList || midiList.length === 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const perNoteVolume = 0.28 / Math.sqrt(midiList.length);

    midiList.forEach((midi, idx) => {
      this.scheduleNoteAt(midi, now + idx * staggerSec, duration, perNoteVolume);
    });
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }
}

// ==========================================
// 2. LÝ THUYẾT ÂM NHẠC & TẠO CÂU HỎI
// ==========================================
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SOLFEGE: Record<string, string> = {
  C: 'Đô', D: 'Rê', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si'
};
const BASE_SEMITONES: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
};

interface ChordQuality {
  key: string;
  suffix: string;
  vnName: string;
  enName: string;
  intervals: number[];
  degreeOffsets: number[];
}

const CHORD_QUALITIES: Record<string, ChordQuality> = {
  major: { key: 'major', suffix: '', vnName: 'Trưởng', enName: 'Major', intervals: [0, 4, 7], degreeOffsets: [0, 2, 4] },
  minor: { key: 'minor', suffix: 'm', vnName: 'Thứ', enName: 'Minor', intervals: [0, 3, 7], degreeOffsets: [0, 2, 4] },
  dim: { key: 'dim', suffix: 'dim', vnName: 'Giảm', enName: 'Diminished', intervals: [0, 3, 6], degreeOffsets: [0, 2, 4] },
  aug: { key: 'aug', suffix: 'aug', vnName: 'Tăng', enName: 'Augmented', intervals: [0, 4, 8], degreeOffsets: [0, 2, 4] },
  dom7: { key: 'dom7', suffix: '7', vnName: 'Bảy át', enName: 'Dominant 7th', intervals: [0, 4, 7, 10], degreeOffsets: [0, 2, 4, 6] }
};

const NATURAL_ROOTS = [
  { letter: 'C', accidental: 0 },
  { letter: 'D', accidental: 0 },
  { letter: 'E', accidental: 0 },
  { letter: 'F', accidental: 0 },
  { letter: 'G', accidental: 0 },
  { letter: 'A', accidental: 0 },
  { letter: 'B', accidental: 0 }
];

const EXTENDED_EXTRA_ROOTS = [
  { letter: 'F', accidental: 1 },
  { letter: 'B', accidental: -1 },
  { letter: 'E', accidental: -1 },
  { letter: 'A', accidental: -1 }
];

export interface NoteQuestion {
  type: 'note';
  id: string;
  clef: 'treble' | 'bass';
  letter: string;
  octave: number;
  accidental: number;
  accSymbol: string;
  step: number;
  midi: number;
  pitchClass: number;
  vnName: string;
  enName: string;
  fullDisplay: string;
}

export interface ChordQuestion {
  type: 'chord';
  id: string;
  chordKey: string;
  clef: 'treble' | 'bass';
  rootLetter: string;
  rootAccidental: number;
  rootPitchClass: number;
  qualityKey: string;
  quality: ChordQuality;
  inversion: number;
  invLabel: string;
  notes: NoteQuestion[];
  midiList: number[];
  pitchClassSet: Set<number>;
  symbol: string;
  vnTitle: string;
  enName: string;
  vnName: string;
  fullDisplay: string;
  formulaDisplay: string;
}

export type QuestionItem = NoteQuestion | ChordQuestion;

function createNote(letter: string, octave: number, accidental: number = 0, clef: 'treble' | 'bass' = 'treble'): NoteQuestion {
  const letterIdx = LETTERS.indexOf(letter);
  const step = octave * 7 + letterIdx;
  const midi = (octave + 1) * 12 + BASE_SEMITONES[letter] + accidental;
  const pitchClass = ((midi % 12) + 12) % 12;
  const accSymbol = accidental === 1 ? '♯' : accidental === -1 ? '♭' : '';
  const vnName = `${SOLFEGE[letter]}${accSymbol}`;
  const enName = `${letter}${accSymbol}`;
  const id = `${clef}_${letter}${accSymbol}${octave}`;

  return {
    type: 'note',
    id,
    clef,
    letter,
    octave,
    accidental,
    accSymbol,
    step,
    midi,
    pitchClass,
    vnName,
    enName,
    fullDisplay: `${vnName} ${octave} (${enName}${octave})`
  };
}

function getNotePool(clef: 'treble' | 'bass', noteRange: 'basic' | 'extended', includeAccidentals: boolean): NoteQuestion[] {
  const notes: NoteQuestion[] = [];
  if (clef === 'treble') {
    if (noteRange === 'basic') {
      const list = [
        ['E', 4], ['F', 4], ['G', 4], ['A', 4], ['B', 4],
        ['C', 5], ['D', 5], ['E', 5], ['F', 5]
      ] as const;
      list.forEach(([l, o]) => notes.push(createNote(l, o, 0, 'treble')));

      if (includeAccidentals) {
        const accBasic = [
          ['F', 4, 1], ['G', 4, 1], ['A', 4, -1], ['B', 4, -1],
          ['C', 5, 1], ['D', 5, 1], ['E', 5, -1]
        ] as const;
        accBasic.forEach(([l, o, acc]) => notes.push(createNote(l, o, acc, 'treble')));
      }
    } else {
      const list = [
        ['A', 3], ['B', 3],
        ['C', 4], ['D', 4], ['E', 4], ['F', 4], ['G', 4], ['A', 4], ['B', 4],
        ['C', 5], ['D', 5], ['E', 5], ['F', 5], ['G', 5], ['A', 5], ['B', 5], ['C', 6]
      ] as const;
      list.forEach(([l, o]) => notes.push(createNote(l, o, 0, 'treble')));

      if (includeAccidentals) {
        const accidentals = [
          ['C', 4, 1], ['D', 4, 1], ['E', 4, -1], ['F', 4, 1], ['G', 4, 1],
          ['A', 4, -1], ['A', 4, 1], ['B', 4, -1],
          ['C', 5, 1], ['D', 5, -1], ['D', 5, 1], ['E', 5, -1], ['F', 5, 1],
          ['G', 5, 1], ['A', 5, -1], ['B', 5, -1]
        ] as const;
        accidentals.forEach(([l, o, acc]) => notes.push(createNote(l, o, acc, 'treble')));
      }
    }
  } else {
    if (noteRange === 'basic') {
      const list = [
        ['G', 2], ['A', 2], ['B', 2],
        ['C', 3], ['D', 3], ['E', 3], ['F', 3], ['G', 3], ['A', 3]
      ] as const;
      list.forEach(([l, o]) => notes.push(createNote(l, o, 0, 'bass')));

      if (includeAccidentals) {
        const accBasic = [
          ['G', 2, 1], ['A', 2, -1], ['B', 2, -1],
          ['C', 3, 1], ['D', 3, 1], ['E', 3, -1], ['F', 3, 1], ['G', 3, 1]
        ] as const;
        accBasic.forEach(([l, o, acc]) => notes.push(createNote(l, o, acc, 'bass')));
      }
    } else {
      const list = [
        ['C', 2], ['D', 2], ['E', 2], ['F', 2], ['G', 2], ['A', 2], ['B', 2],
        ['C', 3], ['D', 3], ['E', 3], ['F', 3], ['G', 3], ['A', 3], ['B', 3],
        ['C', 4], ['D', 4], ['E', 4]
      ] as const;
      list.forEach(([l, o]) => notes.push(createNote(l, o, 0, 'bass')));

      if (includeAccidentals) {
        const accidentals = [
          ['F', 2, 1], ['G', 2, 1], ['A', 2, -1], ['B', 2, -1],
          ['C', 3, 1], ['D', 3, 1], ['E', 3, -1], ['F', 3, 1], ['G', 3, 1],
          ['A', 3, -1], ['B', 3, -1], ['C', 4, 1], ['E', 4, -1]
        ] as const;
        accidentals.forEach(([l, o, acc]) => notes.push(createNote(l, o, acc, 'bass')));
      }
    }
  }
  return notes;
}

function createChord(rootLetter: string, rootAccidental: number, qualityKey: string, inversion: number = 0, clef: 'treble' | 'bass' = 'treble'): ChordQuestion | null {
  const quality = CHORD_QUALITIES[qualityKey];
  if (!quality) return null;

  const rootLetterIdx = LETTERS.indexOf(rootLetter);
  const rootBaseSemitone = (BASE_SEMITONES[rootLetter] + rootAccidental + 12) % 12;

  let baseOctave = clef === 'treble' ? 4 : 2;
  if (clef === 'treble' && ['A', 'B'].includes(rootLetter) && inversion > 0) {
    baseOctave = 3;
  }
  if (clef === 'bass' && ['C', 'D', 'E'].includes(rootLetter)) {
    baseOctave = 3;
  }

  const rawTones: NoteQuestion[] = [];
  for (let i = 0; i < quality.intervals.length; i++) {
    const degOffset = quality.degreeOffsets[i];
    const interval = quality.intervals[i];
    const targetLetterIdx = (rootLetterIdx + degOffset) % 7;
    const targetLetter = LETTERS[targetLetterIdx];
    const octaveShift = Math.floor((rootLetterIdx + degOffset) / 7);
    const noteOctave = baseOctave + octaveShift;

    const targetSemitone = (rootBaseSemitone + interval) % 12;
    const naturalSemitone = BASE_SEMITONES[targetLetter];

    let acc = targetSemitone - naturalSemitone;
    if (acc > 6) acc -= 12;
    if (acc < -6) acc += 12;

    if (Math.abs(acc) > 1) return null; // Không dùng thăng/giáng kép

    rawTones.push(createNote(targetLetter, noteOctave, acc, clef));
  }

  const invertedTones = rawTones.map(n => ({ ...n }));
  for (let inv = 0; inv < inversion; inv++) {
    const lowest = invertedTones.shift()!;
    const raised = createNote(lowest.letter, lowest.octave + 1, lowest.accidental, clef);
    invertedTones.push(raised);
  }
  invertedTones.sort((a, b) => a.midi - b.midi);

  const rootAccSymbol = rootAccidental === 1 ? '♯' : rootAccidental === -1 ? '♭' : '';
  const rootPitchClass = rootBaseSemitone;
  const chordKey = `${rootPitchClass}_${qualityKey}`;
  const symbol = `${rootLetter}${rootAccSymbol}${quality.suffix}`;
  const vnTitle = `${SOLFEGE[rootLetter]}${rootAccSymbol} ${quality.vnName}`;
  const invLabel = inversion === 0 ? 'Thế gốc' : `Thế đảo ${inversion}`;
  const spellingStr = rawTones.map(t => t.enName).join(' – ');
  const pitchClassSet = new Set(rawTones.map(t => t.pitchClass));

  return {
    type: 'chord',
    id: `${clef}_${symbol}_inv${inversion}`,
    chordKey,
    clef,
    rootLetter,
    rootAccidental,
    rootPitchClass,
    qualityKey,
    quality,
    inversion,
    invLabel,
    notes: invertedTones,
    midiList: invertedTones.map(n => n.midi),
    pitchClassSet,
    symbol,
    vnTitle,
    enName: symbol,
    vnName: vnTitle,
    fullDisplay: `${symbol} (${vnTitle})`,
    formulaDisplay: `${symbol} = ${spellingStr}`
  };
}

function getChordPool(settings: TrainerSettings): ChordQuestion[] {
  const chords: ChordQuestion[] = [];
  const roots = [...NATURAL_ROOTS];
  if (settings.chordRoots === 'extended') {
    roots.push(...EXTENDED_EXTRA_ROOTS);
  }
  const qualities = settings.chordQualities && settings.chordQualities.length > 0
    ? settings.chordQualities
    : ['major', 'minor'];
  const inversions = settings.chordInversions === 'inversions' ? [0, 1, 2] : [0];
  const clefs: ('treble' | 'bass')[] = settings.clef === 'both' ? ['treble', 'bass'] : [settings.clef];

  clefs.forEach(clef => {
    roots.forEach(r => {
      qualities.forEach(q => {
        inversions.forEach(inv => {
          const chord = createChord(r.letter, r.accidental, q, inv, clef);
          if (chord) chords.push(chord);
        });
      });
    });
  });

  return chords;
}

// ==========================================
// 3. SVG KHUÔNG NHẠC CHUẨN XÁC
// ==========================================
function renderStaffSvg(item: QuestionItem, state: 'normal' | 'correct' | 'wrong'): string {
  const lineColor = '#475569';
  const clefColor = '#e2e8f0';
  let noteColor = '#f8fafc';
  if (state === 'correct') noteColor = '#10b981';
  if (state === 'wrong') noteColor = '#ef4444';

  const lineSpacing = 18;
  const halfSpacing = 9;
  const middleLineY = 128;
  const staffLeft = 42;
  const staffRight = 418;
  const noteX = 265;

  const notes = item.type === 'chord' ? item.notes : [item];
  const clef = item.clef;
  const middleStep = clef === 'treble' ? 34 : 15;
  const bottomLineStep = middleStep - 4;
  const topLineStep = middleStep + 4;

  let staffLinesSvg = '';
  for (let i = -2; i <= 2; i++) {
    const y = middleLineY + i * lineSpacing;
    staffLinesSvg += `<line x1="${staffLeft}" y1="${y}" x2="${staffRight}" y2="${y}" stroke="${lineColor}" stroke-width="1.8" stroke-linecap="round" />`;
  }
  staffLinesSvg += `
    <line x1="${staffLeft}" y1="${middleLineY - 2 * lineSpacing}" x2="${staffLeft}" y2="${middleLineY + 2 * lineSpacing}" stroke="${clefColor}" stroke-width="2.4" />
    <line x1="${staffRight}" y1="${middleLineY - 2 * lineSpacing}" x2="${staffRight}" y2="${middleLineY + 2 * lineSpacing}" stroke="${lineColor}" stroke-width="1.8" />
  `;

  const clefSvg = clef === 'treble'
    ? `
      <g transform="translate(66, 54) scale(0.95)" fill="none" stroke="${clefColor}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 28 118
                 C 14 118, 8 106, 14 96
                 C 20 86, 36 88, 38 101
                 C 40 115, 24 126, 10 118
                 C -6 108, -4 84, 14 68
                 C 30 53, 38 38, 34 18
                 C 31 4, 22 2, 19 14
                 C 15 30, 25 88, 27 128
                 C 28 142, 20 150, 11 147
                 C 5 145, 4 137, 10 134
                 C 15 132, 19 137, 16 141"
              stroke-width="4.4" />
        <circle cx="12" cy="138" r="3.2" fill="${clefColor}" stroke="none" />
      </g>
    `
    : `
      <g fill="${clefColor}">
        <circle cx="82" cy="110" r="6.2" />
        <path d="M 78 110
                 C 78 93, 96 86, 108 95
                 C 120 104, 118 128, 99 143
                 C 91 149, 81 154, 73 156"
              fill="none" stroke="${clefColor}" stroke-width="5" stroke-linecap="round" />
        <circle cx="126" cy="101" r="3.4" />
        <circle cx="126" cy="119" r="3.4" />
      </g>
    `;

  const sortedNotes = [...notes].sort((a, b) => a.step - b.step);
  const layoutNotes = sortedNotes.map(n => ({
    ...n,
    y: middleLineY - (n.step - middleStep) * halfSpacing,
    dx: 0
  }));

  for (let i = 1; i < layoutNotes.length; i++) {
    if (layoutNotes[i].step - layoutNotes[i - 1].step === 1 && layoutNotes[i - 1].dx === 0) {
      layoutNotes[i].dx = 21;
    }
  }

  const ledgerMap = new Map<number, { minX: number; maxX: number }>();
  layoutNotes.forEach(ln => {
    const cx = noteX + ln.dx;
    if (ln.step <= bottomLineStep - 2) {
      for (let s = bottomLineStep - 2; s >= ln.step; s -= 2) {
        const prev = ledgerMap.get(s) || { minX: cx - 22, maxX: cx + 22 };
        ledgerMap.set(s, { minX: Math.min(prev.minX, cx - 22), maxX: Math.max(prev.maxX, cx + 22) });
      }
    } else if (ln.step >= topLineStep + 2) {
      for (let s = topLineStep + 2; s <= ln.step; s += 2) {
        const prev = ledgerMap.get(s) || { minX: cx - 22, maxX: cx + 22 };
        ledgerMap.set(s, { minX: Math.min(prev.minX, cx - 22), maxX: Math.max(prev.maxX, cx + 22) });
      }
    }
  });

  let ledgerLinesSvg = '';
  ledgerMap.forEach((span, step) => {
    const ly = middleLineY - (step - middleStep) * halfSpacing;
    ledgerLinesSvg += `<line x1="${span.minX}" y1="${ly}" x2="${span.maxX}" y2="${ly}" stroke="${clefColor}" stroke-width="2" stroke-linecap="round" />`;
  });

  const accidentalNotes = [...layoutNotes].filter(ln => ln.accidental !== 0).sort((a, b) => a.y - b.y);
  let accidentalsSvg = '';
  const placedAccs: { x: number; y: number }[] = [];
  accidentalNotes.forEach(an => {
    let accX = noteX - 28;
    while (placedAccs.some(p => Math.abs(p.y - an.y) < 25 && Math.abs(p.x - accX) < 14)) {
      accX -= 16;
    }
    placedAccs.push({ x: accX, y: an.y });

    if (an.accidental === 1) {
      accidentalsSvg += `
        <g stroke="${noteColor}" stroke-width="2.1" stroke-linecap="round">
          <line x1="${accX - 3.5}" y1="${an.y - 14}" x2="${accX - 3.5}" y2="${an.y + 14}" />
          <line x1="${accX + 3.5}" y1="${an.y - 16}" x2="${accX + 3.5}" y2="${an.y + 12}" />
          <line x1="${accX - 8}" y1="${an.y - 4}" x2="${accX + 8}" y2="${an.y - 7}" stroke-width="2.8" />
          <line x1="${accX - 8}" y1="${an.y + 6}" x2="${accX + 8}" y2="${an.y + 3}" stroke-width="2.8" />
        </g>
      `;
    } else if (an.accidental === -1) {
      accidentalsSvg += `
        <g fill="none" stroke="${noteColor}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="${accX - 4}" y1="${an.y - 18}" x2="${accX - 4}" y2="${an.y + 8}" />
          <path d="M ${accX - 4} ${an.y + 8} C ${accX + 5} ${an.y + 5}, ${accX + 7} ${an.y - 3}, ${accX - 4} ${an.y - 2}" />
        </g>
      `;
    }
  });

  const lowestNote = layoutNotes[0];
  const highestNote = layoutNotes[layoutNotes.length - 1];
  const maxDistBelow = middleStep - lowestNote.step;
  const maxDistAbove = highestNote.step - middleStep;
  const stemUp = maxDistBelow >= maxDistAbove;

  const stemLength = 54;
  const stemX = stemUp ? noteX + 10.5 : noteX - 10.5;
  const stemY1 = stemUp ? lowestNote.y : highestNote.y;
  const stemY2 = stemUp ? highestNote.y - stemLength : lowestNote.y + stemLength;

  const headsSvg = layoutNotes.map(ln => {
    const cx = noteX + ln.dx;
    return `
      <ellipse cx="${cx}" cy="${ln.y}" rx="12" ry="8.6"
        transform="rotate(-16 ${cx} ${ln.y})"
        fill="${noteColor}" />
    `;
  }).join('');

  const animClass = state === 'normal' ? 'note-enter' : '';

  return `
    ${staffLinesSvg}
    ${clefSvg}
    ${ledgerLinesSvg}
    <g class="${animClass}">
      ${accidentalsSvg}
      <line x1="${stemX}" y1="${stemY1}" x2="${stemX}" y2="${stemY2}" stroke="${noteColor}" stroke-width="2.5" stroke-linecap="round" />
      ${headsSvg}
    </g>
  `;
}

// ==========================================
// 4. INTERFACE VÀ STATE CHÍNH CỦA TRAINER
// ==========================================
export interface TrainerSettings {
  clef: 'treble' | 'bass' | 'both';
  noteRange: 'basic' | 'extended';
  noteAccidentals: boolean;
  chordQualities: string[];
  chordRoots: 'natural' | 'extended';
  chordInversions: 'root' | 'inversions';
  labelMode: 'both' | 'letter' | 'solfege';
  autoPlayPitch: boolean;
}

interface ItemStat {
  item: QuestionItem;
  attempts: number;
  mistakes: number;
  totalTimeMs: number;
  correctCount: number;
}

interface ReflexTrainerProps {
  midiInputEvent?: { statusByte: number; note: number; velocity: number; timestamp: number } | null;
  midiDevices?: string[];
  midiStatus?: string;
}

export const ReflexTrainer: React.FC<ReflexTrainerProps> = ({
  midiInputEvent,
  midiDevices = [],
  midiStatus = 'Chưa kết nối MIDI'
}) => {
  const soundRef = useRef<ReflexSoundEngine>(new ReflexSoundEngine());

  const [settings, setSettings] = useState<TrainerSettings>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sight_reading_settings_v2') || '{}');
      return {
        clef: saved.clef || 'treble',
        noteRange: saved.noteRange || 'basic',
        noteAccidentals: Boolean(saved.noteAccidentals),
        chordQualities: Array.isArray(saved.chordQualities) && saved.chordQualities.length > 0
          ? saved.chordQualities
          : ['major', 'minor'],
        chordRoots: saved.chordRoots || 'natural',
        chordInversions: saved.chordInversions || 'root',
        labelMode: saved.labelMode || 'both',
        autoPlayPitch: Boolean(saved.autoPlayPitch)
      };
    } catch {
      return {
        clef: 'treble',
        noteRange: 'basic',
        noteAccidentals: false,
        chordQualities: ['major', 'minor'],
        chordRoots: 'natural',
        chordInversions: 'root',
        labelMode: 'both',
        autoPlayPitch: false
      };
    }
  });

  const [practiceMode, setPracticeMode] = useState<'notes' | 'chords'>('notes');
  const [mode, setMode] = useState<'free' | 'timed'>('free');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem | null>(null);
  const [staffState, setStaffState] = useState<'normal' | 'correct' | 'wrong'>('normal');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasMissedCurrent, setHasMissedCurrent] = useState(false);
  const [noteShownTimestamp, setNoteShownTimestamp] = useState(performance.now());
  const [feedback, setFeedback] = useState<{ text: string; type: 'idle' | 'correct' | 'wrong' }>({
    text: 'Hãy chọn tên nốt nhạc hoặc nhấn phím đàn / thiết bị MIDI tương ứng bên dưới',
    type: 'idle'
  });

  const [selectedPianoPitches, setSelectedPianoPitches] = useState<Set<number>>(new Set());
  const [activeInputHighlights, setActiveInputHighlights] = useState<Record<number, 'correct' | 'wrong' | 'hint'>>({});

  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [highScores, setHighScores] = useState({
    notes: parseInt(localStorage.getItem('sight_reading_high_score_notes') || localStorage.getItem('sight_reading_high_score') || '0', 10),
    chords: parseInt(localStorage.getItem('sight_reading_high_score_chords') || '0', 10)
  });
  const [itemStats, setItemStats] = useState<Record<string, ItemStat>>({});
  const [weakDrillPool, setWeakDrillPool] = useState<QuestionItem[] | null>(null);

  // 60s Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const timerIntervalRef = useRef<any>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isTimedEnd, setIsTimedEnd] = useState(false);
  const [shake, setShake] = useState(false);

  // Lưu cài đặt vào localStorage
  const updateSettings = useCallback((newSettings: Partial<TrainerSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('sight_reading_settings_v2', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const playCurrentSound = useCallback((question?: QuestionItem | null) => {
    const q = question || currentQuestion;
    if (!q) return;
    if (q.type === 'chord') {
      soundRef.current.playChord(q.midiList, 0.032, 1.2);
    } else {
      soundRef.current.playNote(q.midi, 0.85, 0.28);
    }
  }, [currentQuestion]);

  // Sinh câu hỏi kế tiếp
  const nextQuestion = useCallback((shouldPlayAudio = true, customPool?: QuestionItem[] | null) => {
    setIsTransitioning(false);
    setHasMissedCurrent(false);
    setSelectedPianoPitches(new Set());
    setActiveInputHighlights({});
    setStaffState('normal');

    let pool: QuestionItem[] = [];
    if (customPool && customPool.length > 0) {
      pool = customPool;
    } else if (weakDrillPool && weakDrillPool.length > 0) {
      pool = weakDrillPool;
    } else if (practiceMode === 'notes') {
      const targetClef = settings.clef === 'both'
        ? (Math.random() < 0.5 ? 'treble' : 'bass')
        : settings.clef;
      pool = getNotePool(targetClef, settings.noteRange, settings.noteAccidentals);
    } else {
      pool = getChordPool(settings);
    }

    if (pool.length === 0) return;

    let candidate = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && currentQuestion) {
      let guard = 0;
      while (candidate.id === currentQuestion.id && guard < 12) {
        candidate = pool[Math.floor(Math.random() * pool.length)];
        guard++;
      }
    }

    setCurrentQuestion(candidate);
    setNoteShownTimestamp(performance.now());
    setFeedback({
      text: practiceMode === 'notes'
        ? 'Chọn tên nốt hoặc nhấn phím đàn / thiết bị MIDI tương ứng'
        : 'Chọn tên hợp âm hoặc bấm đủ các nốt cấu tạo trên đàn Piano / thiết bị MIDI',
      type: 'idle'
    });

    if (shouldPlayAudio && settings.autoPlayPitch) {
      playCurrentSound(candidate);
    }
  }, [weakDrillPool, practiceMode, settings, currentQuestion, playCurrentSound]);

  // Khởi tạo câu hỏi đầu tiên
  useEffect(() => {
    nextQuestion(false);
  }, [practiceMode, settings.clef, settings.noteRange, settings.noteAccidentals, settings.chordQualities, settings.chordRoots, settings.chordInversions]);

  // Bộ đếm thời gian 60s
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimedChallenge = useCallback(() => {
    stopTimer();
    setWeakDrillPool(null);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    setCorrectAnswers(0);
    setReactionTimes([]);
    setItemStats({});
    setTimeLeft(60);

    nextQuestion(settings.autoPlayPitch);

    const startTime = performance.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      const rem = Math.max(0, 60 - elapsed);
      setTimeLeft(rem);
      if (rem <= 0) {
        stopTimer();
        setIsTimedEnd(true);
        setIsSummaryOpen(true);
      }
    }, 50);
  }, [stopTimer, nextQuestion, settings.autoPlayPitch]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Đổi chế độ tự do / 60s
  const handleSetMode = (newMode: 'free' | 'timed') => {
    if (mode === newMode && newMode === 'free') return;
    setMode(newMode);
    if (newMode === 'free') {
      stopTimer();
      setScore(0);
      setStreak(0);
      setTotalAttempts(0);
      setCorrectAnswers(0);
      setReactionTimes([]);
      setItemStats({});
      nextQuestion(settings.autoPlayPitch);
    } else {
      startTimedChallenge();
    }
  };

  // Ghi nhận điểm & thống kê
  const recordSuccess = useCallback((reactionMs: number, q: QuestionItem) => {
    if (!hasMissedCurrent) {
      setTotalAttempts(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const nextStreak = prev + 1;
        setBestStreak(b => Math.max(b, nextStreak));
        return nextStreak;
      });
      setReactionTimes(prev => [...prev, reactionMs]);

      setItemStats(prev => {
        const existing = prev[q.id] || { item: q, attempts: 0, mistakes: 0, totalTimeMs: 0, correctCount: 0 };
        return {
          ...prev,
          [q.id]: {
            ...existing,
            attempts: existing.attempts + 1,
            correctCount: existing.correctCount + 1,
            totalTimeMs: existing.totalTimeMs + reactionMs
          }
        };
      });

      const multiplier = Math.min(4, 1 + Math.floor(streak / 5));
      const basePoints = practiceMode === 'chords' ? 15 : 10;
      const speedThreshold = practiceMode === 'chords' ? 2200 : 1100;
      const speedBonus = reactionMs < speedThreshold ? 5 : (reactionMs < speedThreshold * 1.6 ? 2 : 0);
      const points = (basePoints + speedBonus) * multiplier;

      setScore(prev => {
        const nextScore = prev + points;
        if (nextScore > highScores[practiceMode]) {
          setHighScores(h => ({ ...h, [practiceMode]: nextScore }));
          localStorage.setItem(`sight_reading_high_score_${practiceMode}`, String(nextScore));
        }
        return nextScore;
      });
    }
  }, [hasMissedCurrent, streak, practiceMode, highScores]);

  const recordMistake = useCallback((q: QuestionItem) => {
    if (!hasMissedCurrent) {
      setHasMissedCurrent(true);
      setTotalAttempts(prev => prev + 1);
      setStreak(0);

      setItemStats(prev => {
        const existing = prev[q.id] || { item: q, attempts: 0, mistakes: 0, totalTimeMs: 0, correctCount: 0 };
        return {
          ...prev,
          [q.id]: {
            ...existing,
            attempts: existing.attempts + 1,
            mistakes: existing.mistakes + 1
          }
        };
      });
    }
  }, [hasMissedCurrent]);

  const triggerShake = () => {
    setShake(false);
    setTimeout(() => setShake(true), 10);
    setTimeout(() => setShake(false), 400);
  };

  // Xử lý câu trả lời nốt đơn
  const handleSingleNoteAnswer = useCallback((pitchClass: number) => {
    if (!currentQuestion || isTransitioning || practiceMode !== 'notes') return;
    if (mode === 'timed' && timeLeft <= 0) return;

    const isCorrect = (pitchClass === (currentQuestion as NoteQuestion).pitchClass);
    const reactionMs = Math.max(80, performance.now() - noteShownTimestamp);

    if (isCorrect) {
      setIsTransitioning(true);
      soundRef.current.playNote((currentQuestion as NoteQuestion).midi, 0.75, 0.28);
      recordSuccess(reactionMs, currentQuestion);

      setStaffState('correct');
      setActiveInputHighlights({ [pitchClass]: 'correct' });
      setFeedback({
        text: `✓ Chính xác! ${(currentQuestion as NoteQuestion).fullDisplay} (${(reactionMs / 1000).toFixed(2)}s)`,
        type: 'correct'
      });

      setTimeout(() => {
        nextQuestion(settings.autoPlayPitch);
      }, 340);
    } else {
      soundRef.current.playError();
      recordMistake(currentQuestion);
      triggerShake();

      setStaffState('wrong');
      setActiveInputHighlights({
        [pitchClass]: 'wrong',
        [(currentQuestion as NoteQuestion).pitchClass]: 'hint'
      });
      setFeedback({
        text: `✕ Chưa đúng! Đáp án là: ${(currentQuestion as NoteQuestion).fullDisplay} — Hãy bấm phím đúng để tiếp tục`,
        type: 'wrong'
      });
    }
  }, [currentQuestion, isTransitioning, practiceMode, mode, timeLeft, noteShownTimestamp, recordSuccess, recordMistake, nextQuestion, settings.autoPlayPitch]);

  // Xử lý câu trả lời hợp âm
  const handleChordAnswer = useCallback((chordKey: string, fromPiano = false) => {
    if (!currentQuestion || isTransitioning || practiceMode !== 'chords') return;
    if (mode === 'timed' && timeLeft <= 0) return;

    const chordQ = currentQuestion as ChordQuestion;
    const isCorrect = (chordKey === chordQ.chordKey);
    const reactionMs = Math.max(80, performance.now() - noteShownTimestamp);

    if (isCorrect) {
      setIsTransitioning(true);
      soundRef.current.playChord(chordQ.midiList, 0.03, 1.2);
      recordSuccess(reactionMs, chordQ);

      setStaffState('correct');
      setFeedback({
        text: `✓ Chính xác! ${chordQ.formulaDisplay} · ${chordQ.invLabel} (${(reactionMs / 1000).toFixed(2)}s)`,
        type: 'correct'
      });

      setTimeout(() => {
        nextQuestion(settings.autoPlayPitch);
      }, fromPiano ? 580 : 480);
    } else {
      soundRef.current.playError();
      recordMistake(chordQ);
      triggerShake();

      setStaffState('wrong');
      setFeedback({
        text: `✕ Chưa đúng! Đáp án: ${chordQ.formulaDisplay} (${chordQ.invLabel})`,
        type: 'wrong'
      });
    }
  }, [currentQuestion, isTransitioning, practiceMode, mode, timeLeft, noteShownTimestamp, recordSuccess, recordMistake, nextQuestion, settings.autoPlayPitch]);

  // Xử lý khi nhấn phím đàn Piano (ảo hoặc qua MIDI)
  const handlePianoKeyClick = useCallback((pitchClass: number, midi: number) => {
    if (!currentQuestion || isTransitioning) return;
    if (mode === 'timed' && timeLeft <= 0) return;

    if (practiceMode === 'notes') {
      handleSingleNoteAnswer(pitchClass);
      return;
    }

    soundRef.current.playNote(midi, 0.65, 0.22);
    const chordQ = currentQuestion as ChordQuestion;

    setSelectedPianoPitches(prev => {
      const next = new Set(prev);
      if (next.has(pitchClass)) {
        next.delete(pitchClass);
      } else {
        next.add(pitchClass);
      }

      const requiredSize = chordQ.pitchClassSet.size;
      if (next.size === requiredSize) {
        let allMatch = true;
        for (const pc of chordQ.pitchClassSet) {
          if (!next.has(pc)) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) {
          setTimeout(() => handleChordAnswer(chordQ.chordKey, true), 10);
        } else {
          soundRef.current.playError();
          recordMistake(chordQ);
          triggerShake();
          setStaffState('wrong');
          setFeedback({
            text: `✕ Tổ hợp phím chưa khớp! Cần bấm: ${chordQ.formulaDisplay} (${chordQ.invLabel})`,
            type: 'wrong'
          });
          setTimeout(() => {
            setSelectedPianoPitches(new Set());
            setStaffState('normal');
          }, 550);
        }
      }
      return next;
    });
  }, [currentQuestion, isTransitioning, mode, timeLeft, practiceMode, handleSingleNoteAnswer, handleChordAnswer, recordMistake]);

  // ========================================================
  // TÍCH HỢP TOÀN DIỆN THIẾT BỊ MIDI (KEYBOARD / CONTROLLER)
  // ========================================================
  useEffect(() => {
    if (!midiInputEvent) return;
    const { statusByte, note, velocity } = midiInputEvent;
    const isNoteOn = ((statusByte & 0xF0) === 0x90 || statusByte === 144) && velocity > 0;

    if (isNoteOn) {
      const pitchClass = note % 12;
      handlePianoKeyClick(pitchClass, note);
    }
  }, [midiInputEvent, handlePianoKeyClick]);

  // Phím tắt bàn phím PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen || isSummaryOpen) return;
      if (e.repeat) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toUpperCase();
      if (e.code === 'Space') {
        e.preventDefault();
        playCurrentSound();
        return;
      }

      if (practiceMode !== 'notes') return;

      const blackKeyMap: Record<string, number> = { W: 1, E: 3, T: 6, Y: 8, U: 10 };
      if (blackKeyMap[key] !== undefined) {
        e.preventDefault();
        handleSingleNoteAnswer(blackKeyMap[key]);
        return;
      }

      const letterMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
      if (letterMap[key] !== undefined) {
        e.preventDefault();
        let pitch = letterMap[key];
        if (e.shiftKey && [0, 2, 5, 7, 9].includes(pitch)) {
          pitch = (pitch + 1) % 12;
        }
        handleSingleNoteAnswer(pitch);
        return;
      }

      const numMap: Record<string, number> = { '1': 0, '2': 2, '3': 4, '4': 5, '5': 7, '6': 9, '7': 11 };
      if (numMap[key] !== undefined) {
        e.preventDefault();
        handleSingleNoteAnswer(numMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isSummaryOpen, practiceMode, playCurrentSound, handleSingleNoteAnswer]);

  // Thông số thống kê
  const accuracy = totalAttempts === 0 ? 100 : Math.round((correctAnswers / totalAttempts) * 100);
  const avgReactionTime = reactionTimes.length > 0
    ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(2)
    : '--';
  const comboMultiplier = Math.min(4, 1 + Math.floor(streak / 5));

  // Dữ liệu nút bấm tự nhiên & dấu hóa
  const naturals = [
    { letter: 'C', solfege: 'Đô', pitchClass: 0, keyHint: 'C / 1' },
    { letter: 'D', solfege: 'Rê', pitchClass: 2, keyHint: 'D / 2' },
    { letter: 'E', solfege: 'Mi', pitchClass: 4, keyHint: 'E / 3' },
    { letter: 'F', solfege: 'Fa', pitchClass: 5, keyHint: 'F / 4' },
    { letter: 'G', solfege: 'Sol', pitchClass: 7, keyHint: 'G / 5' },
    { letter: 'A', solfege: 'La', pitchClass: 9, keyHint: 'A / 6' },
    { letter: 'B', solfege: 'Si', pitchClass: 11, keyHint: 'B / 7' }
  ];

  const accidentals = [
    { sharpEn: 'C♯', flatEn: 'D♭', sharpVn: 'Đô♯', flatVn: 'Rê♭', pitchClass: 1, keyHint: 'W' },
    { sharpEn: 'D♯', flatEn: 'E♭', sharpVn: 'Rê♯', flatVn: 'Mi♭', pitchClass: 3, keyHint: 'E' },
    { sharpEn: 'F♯', flatEn: 'G♭', sharpVn: 'Fa♯', flatVn: 'Sol♭', pitchClass: 6, keyHint: 'T' },
    { sharpEn: 'G♯', flatEn: 'A♭', sharpVn: 'Sol♯', flatVn: 'La♭', pitchClass: 8, keyHint: 'Y' },
    { sharpEn: 'A♯', flatEn: 'B♭', sharpVn: 'La♯', flatVn: 'Si♭', pitchClass: 10, keyHint: 'U' }
  ];

  // 14 phím trắng 2 quãng tám (C4 -> B5)
  const twoOctaveWhites = [
    ...naturals.map(n => ({ ...n, octave: 4, midi: 60 + n.pitchClass })),
    ...naturals.map(n => ({ ...n, octave: 5, midi: 72 + n.pitchClass }))
  ];

  // 10 phím đen
  const blackPattern = [
    { pitchClass: 1, whiteOffset: 0 },
    { pitchClass: 3, whiteOffset: 1 },
    { pitchClass: 6, whiteOffset: 3 },
    { pitchClass: 8, whiteOffset: 4 },
    { pitchClass: 10, whiteOffset: 5 }
  ];

  const rootsList = [...NATURAL_ROOTS, ...(settings.chordRoots === 'extended' ? EXTENDED_EXTRA_ROOTS : [])];

  // SVG Khuông nhạc
  const svgHtml = currentQuestion ? renderStaffSvg(currentQuestion, staffState) : '';

  return (
    <div style={{ width: '100%', maxWidth: '1080px', margin: '0 auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* 1. THANH ĐIỀU KHIỂN & CHẾ ĐỘ PHẢN XẠ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#131722', padding: '12px 18px', borderRadius: '16px', border: '1px solid #232c3f' }}>
        
        {/* Tab Đọc nốt đơn / Luyện hợp âm */}
        <div style={{ display: 'flex', background: '#0a0d14', padding: '4px', borderRadius: '10px', border: '1px solid #1e2638' }}>
          <button
            onClick={() => { setPracticeMode('notes'); setWeakDrillPool(null); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              background: practiceMode === 'notes' ? '#3b82f6' : 'transparent',
              color: practiceMode === 'notes' ? '#ffffff' : '#94a3b8',
              boxShadow: practiceMode === 'notes' ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🎵 Đọc Nốt Đơn
          </button>
          <button
            onClick={() => { setPracticeMode('chords'); setWeakDrillPool(null); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              background: practiceMode === 'chords' ? '#3b82f6' : 'transparent',
              color: practiceMode === 'chords' ? '#ffffff' : '#94a3b8',
              boxShadow: practiceMode === 'chords' ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🎹 Luyện Hợp Âm
          </button>
        </div>

        {/* Chế độ Tự do / 60s */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#0a0d14', padding: '3px', borderRadius: '8px', border: '1px solid #1e2638' }}>
            <button
              onClick={() => handleSetMode('free')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'free' ? '#1e293b' : 'transparent',
                color: mode === 'free' ? '#38bdf8' : '#94a3b8'
              }}
            >
              Tự do
            </button>
            <button
              onClick={() => handleSetMode('timed')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'timed' ? '#ef4444' : 'transparent',
                color: '#fff'
              }}
            >
              ⏱ 60s
            </button>
          </div>

          {/* Âm thanh toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundRef.current.enabled = next;
            }}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: soundEnabled ? '#1e293b' : '#0f172a',
              color: soundEnabled ? '#38bdf8' : '#64748b',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Nút Cài đặt */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#a5b4fc',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚙️</span>
            <span>Tùy chỉnh</span>
          </button>
        </div>
      </div>

      {/* 2. BẢNG THỐNG KÊ TRỰC TIẾP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        <div style={{ background: '#131722', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Điểm</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', background: comboMultiplier > 1 ? '#f59e0b' : '#334155', color: comboMultiplier > 1 ? '#000' : '#fff', padding: '1px 6px', borderRadius: '4px' }}>
              x{comboMultiplier}
            </span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginTop: '4px', fontFamily: 'monospace' }}>
            {score.toLocaleString('vi-VN')}
          </div>
        </div>

        <div style={{ background: '#131722', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Chuỗi đúng</span>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f59e0b', marginTop: '4px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🔥</span>
            <span>{streak}</span>
          </div>
        </div>

        <div style={{ background: '#131722', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Chính xác</span>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981', marginTop: '4px', fontFamily: 'monospace' }}>
            {accuracy}%
          </div>
        </div>

        <div style={{ background: '#131722', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Phản xạ TB</span>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px', fontFamily: 'monospace' }}>
            {avgReactionTime === '--' ? '--' : `${avgReactionTime}s`}
          </div>
        </div>

        <div style={{ background: '#131722', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1e2638' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Kỷ lục {practiceMode === 'notes' ? 'Nốt' : 'Hợp âm'}</span>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#c084fc', marginTop: '4px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🏆</span>
            <span>{highScores[practiceMode].toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* 3. THANH ĐẾM NGƯỢC 60S */}
      {mode === 'timed' && (
        <div style={{ background: '#131722', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f87171' }}>⏱ Thử thách tốc độ 60 giây</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: timeLeft <= 10 ? '#ef4444' : '#38bdf8', fontFamily: 'monospace' }}>
              {timeLeft.toFixed(1)}s
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(timeLeft / 60) * 100}%`, height: '100%', background: timeLeft <= 10 ? '#ef4444' : '#3b82f6', transition: 'width 0.1s linear' }} />
          </div>
        </div>
      )}

      {/* 4. KHUNG KHUÔNG NHẠC CHUẨN XÁC */}
      <div 
        className={shake ? 'animate-staff-shake' : ''}
        style={{
          background: '#111420',
          borderRadius: '20px',
          border: '2px solid #1e2638',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
      >
        {/* Info header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#93c5fd', background: 'rgba(30, 58, 138, 0.4)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
              {currentQuestion?.clef === 'treble' ? '𝄞 Khóa Sol' : '𝄢 Khóa Fa'}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8', background: '#1e2433', padding: '3px 10px', borderRadius: '8px' }}>
              {practiceMode === 'notes'
                ? `${settings.noteRange === 'basic' ? 'Cơ bản' : 'Mở rộng'}${settings.noteAccidentals ? ' · Có ♯/♭' : ''}`
                : `${(currentQuestion as ChordQuestion)?.invLabel || 'Thế gốc'} · ${(currentQuestion as ChordQuestion)?.notes?.length || 3} nốt`}
            </span>
            {weakDrillPool && (
              <span style={{ fontSize: '11px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                🎯 Ôn tập phần yếu
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* MIDI LIVE INDICATOR */}
            <div style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', background: midiDevices.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)', color: midiDevices.length > 0 ? '#34d399' : '#94a3b8', border: `1px solid ${midiDevices.length > 0 ? '#059669' : '#475569'}` }}>
              {midiDevices.length > 0 ? `🎹 MIDI Sẵn Sàng: ${midiDevices[0]}` : `⚪ ${midiStatus}`}
            </div>

            <button
              onClick={() => playCurrentSound()}
              style={{ padding: '4px 10px', borderRadius: '6px', background: '#1e2433', border: '1px solid #334155', color: '#cbd5e1', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
            >
              🔊 Nghe nốt (Space)
            </button>
            {mode === 'free' && (
              <button
                onClick={() => { setIsTimedEnd(false); setIsSummaryOpen(true); }}
                style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                📊 Tổng kết
              </button>
            )}
          </div>
        </div>

        {/* Khuôn SVG */}
        <div style={{ width: '100%', maxWidth: '520px', display: 'flex', justifyContent: 'center' }}>
          <svg
            viewBox="0 0 460 250"
            style={{ width: '100%', height: 'auto', userSelect: 'none' }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        </div>

        {/* Feedback message banner */}
        <div style={{
          marginTop: '6px',
          padding: '6px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 'bold',
          textAlign: 'center',
          background: feedback.type === 'correct' ? 'rgba(16, 185, 129, 0.2)' : (feedback.type === 'wrong' ? 'rgba(239, 68, 68, 0.2)' : '#181d2a'),
          color: feedback.type === 'correct' ? '#34d399' : (feedback.type === 'wrong' ? '#f87171' : '#94a3b8'),
          border: `1px solid ${feedback.type === 'correct' ? '#059669' : (feedback.type === 'wrong' ? '#dc2626' : '#232c3f')}`
        }}>
          {feedback.text}
        </div>
      </div>

      {/* 5. KHU VỰC NHẬP LIỆU PHẢN XẠ */}
      {practiceMode === 'notes' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Hàng dấu hóa (# / b) nếu có */}
          {settings.noteAccidentals && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {accidentals.map(a => {
                const highlight = activeInputHighlights[a.pitchClass];
                let bg = '#181b24';
                let border = '1px solid #334155';
                if (highlight === 'correct') { bg = '#10b981'; border = '1px solid #059669'; }
                if (highlight === 'wrong') { bg = '#ef4444'; border = '1px solid #dc2626'; }
                if (highlight === 'hint') { border = '2px solid #f59e0b'; }

                return (
                  <button
                    key={a.pitchClass}
                    onClick={() => handleSingleNoteAnswer(a.pitchClass)}
                    style={{
                      background: bg,
                      border,
                      color: '#fff',
                      padding: '10px 4px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: '0 3px 0 #000'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{settings.labelMode === 'solfege' ? `${a.sharpVn}/${a.flatVn}` : `${a.sharpEn}/${a.flatEn}`}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{a.keyHint}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Hàng 7 nốt tự nhiên */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {naturals.map(n => {
              const highlight = activeInputHighlights[n.pitchClass];
              let bg = '#1e2433';
              let border = '1px solid #334155';
              let textColor = '#fff';
              if (highlight === 'correct') { bg = '#10b981'; border = '1px solid #059669'; textColor = '#fff'; }
              if (highlight === 'wrong') { bg = '#ef4444'; border = '1px solid #dc2626'; textColor = '#fff'; }
              if (highlight === 'hint') { border = '2px solid #f59e0b'; }

              const primary = settings.labelMode === 'solfege' ? n.solfege : (settings.labelMode === 'letter' ? n.letter : n.solfege);
              const secondary = settings.labelMode === 'both' ? n.letter : '';

              return (
                <button
                  key={n.pitchClass}
                  onClick={() => handleSingleNoteAnswer(n.pitchClass)}
                  style={{
                    background: bg,
                    border,
                    color: textColor,
                    padding: '12px 4px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.4)',
                    transition: 'transform 0.08s ease'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{primary}</span>
                  {secondary && <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>{secondary}</span>}
                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{n.keyHint}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Lưới các nút Hợp âm */
        <div style={{ background: '#131722', padding: '14px', borderRadius: '16px', border: '1px solid #232c3f', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>
              ⚡ Chọn nhanh tên hợp âm hoặc bấm từng nốt trên đàn Piano / MIDI bên dưới:
            </span>
            <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
              + Thêm loại hợp âm
            </button>
          </div>

          {settings.chordQualities.map(qKey => {
            const quality = CHORD_QUALITIES[qKey];
            if (!quality) return null;

            return (
              <div key={qKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#818cf8', textTransform: 'uppercase' }}>
                  {quality.vnName} ({quality.enName})
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rootsList.length > 7 ? 'auto-fit' : 7}, minmax(42px, 1fr))`, gap: '6px' }}>
                  {rootsList.map(r => {
                    const accSym = r.accidental === 1 ? '♯' : r.accidental === -1 ? '♭' : '';
                    const rootPitchClass = (BASE_SEMITONES[r.letter] + r.accidental + 12) % 12;
                    const chordKey = `${rootPitchClass}_${qKey}`;
                    const symbol = `${r.letter}${accSym}${quality.suffix}`;
                    const vnSub = `${SOLFEGE[r.letter]}${accSym} ${quality.vnName}`;
                    const isTarget = currentQuestion && (currentQuestion as ChordQuestion).chordKey === chordKey;

                    return (
                      <button
                        key={chordKey}
                        onClick={() => handleChordAnswer(chordKey)}
                        style={{
                          background: isTarget && staffState === 'correct' ? '#10b981' : '#181d2a',
                          border: isTarget && staffState === 'wrong' ? '2px solid #ef4444' : '1px solid #232c3f',
                          color: '#fff',
                          padding: '8px 4px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          boxShadow: '0 2px 0 rgba(0,0,0,0.5)'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{symbol}</span>
                        <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px' }}>{vnSub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. BÀN PHÍM ĐÀN PIANO 2 QUÃNG TÁM (C4 -> B5) VỚI ĐỒNG BỘ MIDI */}
      <div style={{ background: '#131722', padding: '14px', borderRadius: '16px', border: '1px solid #232c3f', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>🎹 Bàn phím Piano 2 quãng tám:</span>
            {practiceMode === 'chords' && (
              <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                Đang chọn: {selectedPianoPitches.size}/{(currentQuestion as ChordQuestion)?.pitchClassSet?.size || 3} nốt
                {selectedPianoPitches.size > 0 && (
                  <button
                    onClick={() => setSelectedPianoPitches(new Set())}
                    style={{ marginLeft: '6px', background: '#38bdf8', border: 'none', borderRadius: '4px', color: '#000', fontSize: '10px', padding: '1px 4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Xóa
                  </button>
                )}
              </span>
            )}
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Tương thích trực tiếp phím đàn MIDI hoặc click chuột / gõ phím máy tính
          </span>
        </div>

        {/* Piano Container */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ position: 'relative', height: '140px', minWidth: '560px', width: '100%', maxWidth: '850px', margin: '0 auto', userSelect: 'none' }}>
            
            {/* 14 Phím Trắng */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '3px', height: '100%' }}>
              {twoOctaveWhites.map((k, idx) => {
                const isSelected = practiceMode === 'chords' && selectedPianoPitches.has(k.pitchClass);
                let bg = isSelected ? '#38bdf8' : '#ffffff';
                let textColor = isSelected ? '#000' : '#1e293b';

                return (
                  <button
                    key={idx}
                    onClick={() => handlePianoKeyClick(k.pitchClass, k.midi)}
                    style={{
                      height: '100%',
                      background: bg,
                      color: textColor,
                      border: '1px solid #94a3b8',
                      borderRadius: '0 0 6px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      paddingBottom: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 0 #cbd5e1',
                      transition: 'all 0.08s ease'
                    }}
                  >
                    <span>{k.letter}{k.octave}</span>
                  </button>
                );
              })}
            </div>

            {/* 10 Phím Đen */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', pointerEvents: 'none' }}>
              {[0, 1].map(octIdx => {
                const oct = 4 + octIdx;
                return blackPattern.map(b => {
                  const totalWhiteIdx = octIdx * 7 + b.whiteOffset;
                  const leftPct = ((totalWhiteIdx + 0.68) / 14) * 100;
                  const midi = (oct + 1) * 12 + b.pitchClass;
                  const isSelected = practiceMode === 'chords' && selectedPianoPitches.has(b.pitchClass);
                  let bg = isSelected ? '#0284c7' : '#181b24';

                  return (
                    <button
                      key={`${oct}_${b.pitchClass}`}
                      onClick={() => handlePianoKeyClick(b.pitchClass, midi)}
                      style={{
                        position: 'absolute',
                        left: `${leftPct.toFixed(2)}%`,
                        width: '4.6%',
                        height: '100%',
                        background: bg,
                        border: '1px solid #000',
                        borderRadius: '0 0 4px 4px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        boxShadow: '0 3px 0 #000'
                      }}
                    />
                  );
                });
              })}
            </div>

          </div>
        </div>
      </div>

      {/* ==================== MODAL TÙY CHỈNH (SETTINGS) ==================== */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#131722', width: '100%', maxWidth: '540px', borderRadius: '18px', border: '1px solid #232c3f', padding: '20px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e2638', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold' }}>⚙️ Tùy Chỉnh Luyện Phản Xạ</h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Khóa nhạc */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>1. Khóa nhạc</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                {(['treble', 'bass', 'both'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ clef: c })}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: settings.clef === c ? '2px solid #3b82f6' : '1px solid #334155',
                      background: settings.clef === c ? 'rgba(59, 130, 246, 0.2)' : '#1e2433',
                      color: settings.clef === c ? '#60a5fa' : '#cbd5e1',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {c === 'treble' ? '𝄞 Khóa Sol' : (c === 'bass' ? '𝄢 Khóa Fa' : '𝄞+𝄢 Cả hai')}
                  </button>
                ))}
              </div>
            </div>

            {/* Phạm vi nốt & Dấu hóa */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>2. Cài đặt nốt đơn</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => updateSettings({ noteRange: settings.noteRange === 'basic' ? 'extended' : 'basic' })}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#1e2433', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Phạm vi: {settings.noteRange === 'basic' ? 'Cơ bản (5 dòng)' : 'Mở rộng (dòng phụ)'}
                </button>
                <button
                  onClick={() => updateSettings({ noteAccidentals: !settings.noteAccidentals })}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#1e2433', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Dấu hóa: {settings.noteAccidentals ? 'Có ♯ & ♭' : 'Chỉ phím trắng'}
                </button>
              </div>
            </div>

            {/* Loại hợp âm */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>3. Loại hợp âm luyện tập</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                {Object.entries(CHORD_QUALITIES).map(([k, q]) => {
                  const active = settings.chordQualities.includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        const list = [...settings.chordQualities];
                        const idx = list.indexOf(k);
                        if (idx >= 0) {
                          if (list.length > 1) list.splice(idx, 1);
                        } else {
                          list.push(k);
                        }
                        updateSettings({ chordQualities: list });
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: active ? '2px solid #3b82f6' : '1px solid #334155',
                        background: active ? 'rgba(59, 130, 246, 0.2)' : '#1e2433',
                        color: active ? '#60a5fa' : '#94a3b8',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {q.vnName} {active ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thế đảo & Nốt gốc */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>4. Thế đảo & Nốt gốc</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => updateSettings({ chordInversions: settings.chordInversions === 'root' ? 'inversions' : 'root' })}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#1e2433', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Thế đảo: {settings.chordInversions === 'root' ? 'Thế gốc' : 'Bao gồm Đảo 1 & 2'}
                </button>
                <button
                  onClick={() => updateSettings({ chordRoots: settings.chordRoots === 'natural' ? 'extended' : 'natural' })}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #334155', background: '#1e2433', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Nốt gốc: {settings.chordRoots === 'natural' ? '7 bậc tự nhiên' : 'Mở rộng (F#, Bb...)'}
                </button>
              </div>
            </div>

            {/* Kiểu hiển thị tên */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>5. Kiểu hiển thị tên nốt & hợp âm</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                {(['both', 'letter', 'solfege'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => updateSettings({ labelMode: l })}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: settings.labelMode === l ? '2px solid #3b82f6' : '1px solid #334155',
                      background: settings.labelMode === l ? 'rgba(59, 130, 246, 0.2)' : '#1e2433',
                      color: settings.labelMode === l ? '#60a5fa' : '#94a3b8',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {l === 'both' ? 'C / Đô' : (l === 'letter' ? 'C, D, E' : 'Đô, Rê, Mi')}
                  </button>
                ))}
              </div>
            </div>

            {/* Nút đóng & áp dụng */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  nextQuestion(settings.autoPlayPitch);
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#3b82f6', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                Áp dụng & Luyện tập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL TỔNG KẾT (SUMMARY) ==================== */}
      {isSummaryOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#131722', width: '100%', maxWidth: '500px', borderRadius: '18px', border: '1px solid #232c3f', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', color: '#fff' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                {isTimedEnd ? `⏱ Hết Giờ Thử Thách 60s!` : `📊 Tổng Kết Phiên Luyện Tập`}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Báo cáo kết quả tốc độ và độ chuẩn xác của bạn
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ background: '#1e2433', padding: '10px 4px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>ĐIỂM</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>{score}</div>
              </div>
              <div style={{ background: '#1e2433', padding: '10px 4px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>CHÍNH XÁC</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>{accuracy}%</div>
              </div>
              <div style={{ background: '#1e2433', padding: '10px 4px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>PHẢN XẠ TB</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px' }}>{avgReactionTime}s</div>
              </div>
              <div style={{ background: '#1e2433', padding: '10px 4px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>CHUỖI MAX</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c084fc', marginTop: '2px' }}>{bestStreak}</div>
              </div>
            </div>

            {/* Phân tích phần yếu */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1' }}>🎯 Các nốt / hợp âm cần luyện thêm:</span>
              <div style={{ marginTop: '8px', maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.values(itemStats).filter(s => s.mistakes > 0).length === 0 ? (
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: '#34d399' }}>
                    🌟 Xuất sắc! Bạn không bị sai nốt nào trong phiên luyện tập này.
                  </div>
                ) : (
                  Object.values(itemStats).filter(s => s.mistakes > 0).map((st, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e2433', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>{st.item.fullDisplay}</span>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Sai {st.mistakes} lần</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Nút hành động */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {Object.values(itemStats).filter(s => s.mistakes > 0).length > 0 && (
                <button
                  onClick={() => {
                    const weakItems = Object.values(itemStats).filter(s => s.mistakes > 0).map(s => s.item);
                    setWeakDrillPool(weakItems);
                    setIsSummaryOpen(false);
                    nextQuestion(settings.autoPlayPitch, weakItems);
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#f59e0b', border: 'none', color: '#000', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  🎯 Luyện riêng phần yếu
                </button>
              )}
              <button
                onClick={() => {
                  setIsSummaryOpen(false);
                  if (mode === 'timed') startTimedChallenge();
                  else nextQuestion(settings.autoPlayPitch);
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#3b82f6', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                ↻ Luyện tập tiếp
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default ReflexTrainer;
