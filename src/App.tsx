import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Renderer, Stave, StaveNote, Formatter, Accidental, StaveConnector, Dot, Annotation } from 'vexflow';
// @ts-ignore
import Soundfont from 'soundfont-player';

const EXERCISES = [
  {
    name: "Bài tập 1 (Mức độ 1) - Tách tay",
    timeSig: "4/4",
    bpm: 90,
    sheet: "E4(3):q E4(3):q F4(4):q G4(5):q | G4(5):q F4(4):q E4(3):q D4(2):q | C4(1):q C4(1):q D4(2):q E4(3):q | E4(3):h D4(2):h | E3(3):q E3(3):q F3(2):q G3(1):q | G3(1):q F3(2):q E3(3):q D3(4):q | C3(5):q C3(5):q D3(4):q E3(3):q | D3(4):h C3(5):h"
  },
  {
    name: "Bài tập 2 (Mức độ 1) - Tách tay có nhịp lẻ",
    timeSig: "4/4",
    bpm: 90,
    sheet: "C3(5):q C3(5):q F3(2):h | F3(2):q G3(1):q C5(5):q A4(1):q | E4(3):q E4(3):q D4(4):h | E4(3):8 D4(2):8 C4(1):q C4(1):8 C4(1):8 C4(1):8 C4(1):8 | D4(2):q E4(3):q D4(2):h | E4(3):q D4(2):8 C4(1):8 C4(1):h | C4(1):8 C4(1):8 C4(1):8 C4(1):8 D4(2):q E4(3):q | D4(2):h C4(1):h"
  },
  {
    name: "Bài tập 3 (Mức độ 2) - Nối 2 tay (Nhịp 3/4)",
    timeSig: "3/4",
    bpm: 90,
    sheet: "G3(3):q G3(3):q A3(2):q | G3(3):h C5(1):q | B3(2):h. | G4(3):q G4(3):q A4(4):q | G4(3):h D5(2):q | C5(1):h. | G4(3):q E4(2):q C4(1):q | B3(2):h A3(3):q | F3(4):q F3(4):q E4(3):q | C5(5):q D5(4):q C5(5):h"
  },
  {
    name: "Bài tập 4 (Mức độ 2) - Giai điệu luân phiên",
    timeSig: "4/4",
    bpm: 90,
    sheet: "C3(5):q G3(1):q C4(5):q E4(3):q | G2(5):q D3(1):q G3(5):q B3(3):q | A2(5):q E3(1):q A3(5):q C4(3):q | E2(5):q B2(1):q E3(5):q G3(3):q | F2(5):q C3(1):q F3(5):q A3(3):q | C3(5):q G3(1):q C4(5):q E4(3):q | F2(5):q C3(1):q F3(5):q A3(3):q | G2(5):q D3(1):q G3(5):q B3(3):q | C3(5):w"
  },
  {
    name: "Bài tập 5 (Mức độ 3) - Luân phiên nhanh",
    timeSig: "4/4",
    bpm: 95,
    sheet: "C4(1):q D4(2):q E4(3):q C4(1):q | E4(3):q F4(4):q G4(5):h | C5(1):q D5(2):q E5(3):q C5(1):q | E5(3):q F5(4):q G5(5):h | G4(5):q F4(4):q E4(3):q C4(1):q | C4(1):q C4(1):q C4(1):q C4(1):q | G3(1):q F3(2):q E3(3):q C3(5):q | G3(1):q G3(1):q G3(1):q G3(1):q"
  },
  {
    name: "Bài tùy chọn (Nhập bên dưới)",
    timeSig: "4/4",
    bpm: 90,
    sheet: "C3+C4(1):q C4(2):q G4(5):q G4(5):q | F3+A4(4):q A4(4):q C3+G4(5):h | F4(4):q F4(4):q C3+E4(3):q E4(3):q | G3+D4(2):q D4(2):q C3+C4(1):h"
  },
  {
    name: "Romance (Đoạn 1 - Bản luyện ghép tay)",
    timeSig: "3/4",
    bpm: 85,
    sheet: "D3+F3+A3+A4(5):q A4(5):q A4(5):q | D3+F3+A3+A4(5):q G4(4):q F4(3):q | D3+F3+A3+F4(3):q E4(2):q D4(1):q | D3+F3+A3+D4(1):q F4(3):q A4(5):q | G2+Bb2+D3+D5(5):q D5(5):q D5(5):q | A2+C#3+E3+D5(5):q C5(4):q Bb4(3):q | D3+F3+A3+Bb4(3):q A4(2):q G4(1):q | D3+F3+A3+G4(1):q A4(2):q Bb4(3):q | A2+C#3+E3+A4(4):q G4(3):q F4(2):q | A2+C#3+E3+C#5(5):q D5(5):q E5(5):q | D3+F3+A3+D5(5):q D5(5):q D5(5):q | D3+F3+A3+D5(5):q C5(4):q Bb4(3):q | A2+C#3+E3+Bb4(3):q A4(2):q G4(1):q | D3+F3+A3+F4(3):q E4(2):q D4(1):q | A2+C#3+E3+E4(2):q F4(3):q E4(2):q | D3+F3+A3+D4(1):h."
  },
  {
    name: "Romance (Đoạn 1 - Rải Arpeggio chuẩn theo Sheet)",
    timeSig: "3/4",
    bpm: 85,
    sheet: "D3+A4(5):8 F3:8 A3+A4(5):8 D3:8 F3+A4(5):8 A3:8 | D3+A4(5):8 F3:8 A3+G4(4):8 D3:8 F3+F4(3):8 A3:8 | D3+F4(3):8 F3:8 A3+E4(2):8 D3:8 F3+D4(1):8 A3:8 | D3+D4(1):8 F3:8 A3+F4(3):8 D3:8 F3+A4(5):8 A3:8 | G2+D5(5):8 Bb2:8 D3+D5(5):8 G2:8 Bb2+D5(5):8 D3:8 | A2+D5(5):8 C#3:8 E3+C5(4):8 A2:8 C#3+Bb4(3):8 E3:8 | D3+Bb4(3):8 F3:8 A3+A4(2):8 D3:8 F3+G4(1):8 A3:8 | D3+G4(1):8 F3:8 A3+A4(2):8 D3:8 F3+Bb4(3):8 A3:8 | A2+A4(4):8 C#3:8 E3+G4(3):8 A2:8 C#3+F4(2):8 E3:8 | A2+C#5(5):8 C#3:8 E3+D5(5):8 A2:8 C#3+E5(5):8 E3:8 | D3+D5(5):8 F3:8 A3+D5(5):8 D3:8 F3+D5(5):8 A3:8 | D3+D5(5):8 F3:8 A3+C5(4):8 D3:8 F3+Bb4(3):8 A3:8 | A2+Bb4(3):8 C#3:8 E3+A4(2):8 A2:8 C#3+G4(1):8 E3:8 | D3+F4(3):8 F3:8 A3+E4(2):8 D3:8 F3+D4(1):8 A3:8 | A2+E4(2):8 C#3:8 E3+F4(3):8 A2:8 C#3+E4(2):8 E3:8 | D3+D4(1):h."
  },
  {
    name: "Romance (Đoạn 2 - Rê trưởng - Trang 2)",
    timeSig: "3/4",
    bpm: 85,
    sheet: "D3+F#3+A3+F#4(3):q F#4(3):q F#4(3):q | D3+F#3+A3+F#4(3):q E4(2):q D4(1):q | G2+B2+D3+D4(1):q C#4(2):q B3(1):q | E2+G#2+B2+B3(1):q A#3(1):q B3(1):q | G2+B2+D3+B4(5):q B4(5):q B4(5):q | G2+B2+D3+B4(5):q D5(5):q B4(5):q | D3+F#3+A3+B4(5):q A4(4):q G4(3):q | D3+F#3+A3+G4(3):q F#4(2):q E4(1):q | D3+F#3+A3+F#4(2):q F#4(2):q F#4(2):q | D3+F#3+A3+F#4(2):q E4(1):q C4(1):q | G2+B2+D3+B3(1):q C#4(2):q D4(3):q | G2+B2+D3+D4(3):q E4(4):q F#4(5):q | D3+F#3+A3+F#4(3):q E4(2):q D4(1):q | G2+B2+D3+D4(1):q C#4(2):q B3(1):q | A2+C#3+E3+A3(1):q C#4(2):q E4(3):q | D3+F#3+A3+D4(1):h."
  },
  {
    name: "Triệu Triệu Bông Hồng - Đoạn 1: Phiên khúc (Tuấn Lưu Piano)",
    timeSig: "2/4",
    bpm: 85,
    sheet: "A2+E4(1):8 E3:8 A3+F4(2):8 E3+E4(1):8 | A2+A4(3):8 E3:8 A3+B4(4):8 E3+A4(3):8 | A2+C5(5):8 E3:8 A3:8 E3:8 | A2+C5(5):8 E3:8 A3:8 E3:8 | A2+E4(1):8 E3:8 A3+A4(3):8 E3+C5(5):8 | A2+E5(5):8 E3:8 A3+D5(4):8 E3+B4(2):8 | E2+B4(2):8 B2:8 E3:8 B2:8 | E2+B4(2):8 B2:8 E3:8 B2:8 | E2+E4(1):8 B2:8 E3+F4(2):8 B2+E4(1):8 | E2+G#4(3):8 B2:8 E3+A4(4):8 B2+G#4(3):8 | E2+B4(5):8 B2:8 E3:8 B2:8 | E2+B4(5):8 B2:8 E3:8 B2:8 | E2+E4(1):8 B2:8 E3+G#4(2):8 B2+B4(3):8 | E2+D5(4):8 B2:8 E3+C5(3):8 B2+B4(2):8 | A2+A4(1):8 E3:8 A3:8 E3:8 | A2+A4(1):8 E3:8 A3:8 E3:8"
  },
  {
    name: "Triệu Triệu Bông Hồng - Đoạn 2: Điệp khúc (Tuấn Lưu Piano)",
    timeSig: "2/4",
    bpm: 85,
    sheet: "A2+C5(1):16 E3+C5(1):16 A3+C5(1):16 E3+D5(2):16 | A2+E5(3):8 E3:8 A3+F5(4):8 E3+E5(3):8 | D3+D5(2):8 A3:8 D4:8 A3:8 | D3+D5(2):8 A3:8 D4:8 A3:8 | G2+B4(1):16 D3+B4(1):16 G3+B4(1):16 D3+C5(2):16 | C3+D5(3):8 G3:8 C4+E5(4):8 G3+D5(3):8 | C3+C5(2):8 G3:8 C4:8 G3:8 | C3+C5(2):8 G3:8 C4:8 G3:8 | A2+A4(1):16 E3+A4(1):16 A3+A4(1):16 E3+B4(2):16 | A2+C5(3):8 E3:8 A3+D5(4):8 E3+C5(3):8 | D3+B4(2):8 A3:8 D4:8 A3:8 | D3+B4(2):8 A3:8 D4:8 A3:8 | B2+D5(4):16 F3+D5(4):16 B3+D5(4):16 F3+C5(3):16 | E2+B4(2):8 B2+B4(2):8 E3+C5(3):8 B2+B4(2):8 | A2+A4(1):8 E3:8 A3:8 E3:8 | A2+A4(1):8 E3:8 A3:8 E3:8 | A2+E3+A3+C4+E4+A4:h"
  },
  {
    name: "Triệu Triệu Bông Hồng - Ghép tay cơ bản dễ tập (Tuấn Lưu Piano)",
    timeSig: "2/4",
    bpm: 80,
    sheet: "A2+E3+A3+E4(1):q F4(2):8 E4(1):8 | A2+E3+A3+A4(3):q B4(4):8 A4(3):8 | A2+E3+A3+C5(5):h | A2+E3+A3+C5(5):h | A2+E3+A3+E4(1):q A4(3):8 C5(5):8 | A2+E3+A3+E5(5):q D5(4):8 B4(2):8 | E2+B2+E3+B4(2):h | E2+B2+E3+B4(2):h | E2+B2+E3+E4(1):q F4(2):8 E4(1):8 | E2+B2+E3+G#4(3):q A4(4):8 G#4(3):8 | E2+B2+E3+B4(5):h | E2+B2+E3+B4(5):h | E2+B2+E3+E4(1):q G#4(2):8 B4(3):8 | E2+B2+E3+D5(4):q C5(3):8 B4(2):8 | A2+E3+A3+A4(1):h | A2+E3+A3+A4(1):h | A2+E3+A3+C5(1):8 C5(1):8 D5(2):8 D5(2):8 | A2+E3+A3+E5(3):q F5(4):8 E5(3):8 | D3+A3+D4+D5(2):h | D3+A3+D4+D5(2):h | G2+D3+G3+B4(1):8 B4(1):8 C5(2):8 C5(2):8 | C3+G3+C4+D5(3):q E5(4):8 D5(3):8 | C3+G3+C4+C5(2):h | C3+G3+C4+C5(2):h | A2+E3+A3+A4(1):8 A4(1):8 B4(2):8 B4(2):8 | A2+E3+A3+C5(3):q D5(4):8 C5(3):8 | D3+A3+D4+B4(2):h | D3+A3+D4+B4(2):h | B2+F3+B3+D5(4):8 D5(4):8 C5(3):8 C5(3):8 | E2+B2+E3+B4(2):8 B4(2):8 C5(3):8 B4(2):8 | A2+E3+A3+A4(1):h | A2+E3+A3+A4(1):h | A2+E3+A3+C4+E4+A4:h"
  },
  {
    name: "River Flows in You - Phần 1: Phiên khúc & Intro (Tuấn Lưu Piano)",
    timeSig: "4/4",
    bpm: 68,
    sheet: "F#2+A5(5):16 G#5(4):16 C#3+A5(5):8 F#3+G#5(4):8 C#3+A5(5):8 A3+E5(2):8 F#3+A5(5):8 C#3+D5(1):8 | D3+C#5(2):8 A3+D5(3):8 D4+E5(4):8 A3+C#5(2):8 D3+B4(1):h | A2+A4(1):8 E3+G#4(1):8 A3+A4(1):q E3+B4(2):8 A3+C#5(3):8 A2+C#5(3):q | E2+C#5(3):8 B2+D5(4):8 E3+E5(5):8 B2+D5(4):8 E2+C#5(3):8 B2+B4(2):8 E3:q | F#2+A5(5):16 G#5(4):16 C#3+A5(5):8 F#3+G#5(4):8 C#3+A5(5):8 A3+E5(2):8 F#3+A5(5):8 C#3+D5(1):8 | D3+C#5(2):8 A3+D5(3):8 D4+E5(4):8 A3+C#5(2):8 D3+B4(1):h | A2+A4(1):8 E3+G#4(1):8 A3+A4(1):q E3+B4(2):8 A3+C#5(3):8 A2+C#5(3):q | E2+C#5(3):8 B2+D5(4):8 E3+E5(5):8 B2+D5(4):8 E2+C#5(3):8 B2+B4(2):8 E3+A4(1):q"
  },
  {
    name: "River Flows in You - Phần 2: Điệp khúc Cao trào (Tuấn Lưu Piano)",
    timeSig: "4/4",
    bpm: 68,
    sheet: "F#2+A5(4):8 C#3+B5(5):8 F#3+A5(4):8 C#3+G#5(3):8 A3+A5(4):8 F#3+E5(2):8 C#3+A5(4):8 F#2+D5(1):8 | D3+C#5(2):8 A3+D5(3):8 D4+E5(4):8 A3+C#5(2):8 D3+B4(1):h | A2+A5(4):8 E3+B5(5):8 A3+C#6(5):8 E3+D6(5):8 A2+E6(5):8 E3+C#6(3):8 A3+B5(2):8 E3+A5(1):8 | E2+G#5(1):8 B2+A5(2):8 E3+B5(3):8 B2+A5(2):8 E2+G#5(1):8 B2+E5(1):8 E3:q | F#2+C#5(1):8 C#3+D5(2):8 F#3+E5(3):8 C#3+F#5(4):8 A3+E5(3):8 F#3+D5(2):8 C#3+C#5(1):8 F#2+B4(1):8 | D3+A4(1):8 A3+B4(2):8 D4+C#5(3):8 A3+D5(4):8 D3+C#5(3):8 A3+B4(2):8 D4+A4(1):8 A3+G#4(1):8 | A2+A4(1):8 E3+B4(2):8 A3+C#5(3):8 E3+E5(4):8 A2+C#5(3):8 E3+B4(2):8 A3+A4(1):q | E2+B2+E3+A4(1):w"
  },
  {
    name: "River Flows in You - Ghép tay cơ bản dễ tập (Tuấn Lưu Piano)",
    timeSig: "4/4",
    bpm: 65,
    sheet: "F#2+C#3+F#3+A5(5):16 G#5(4):16 A5(5):8 G#5(4):8 A5(5):8 E5(2):8 A5(5):8 D5(1):8 | D3+A3+D4+C#5(2):8 D5(3):8 E5(4):8 C#5(2):8 B4(1):h | A2+E3+A3+A4(1):8 G#4(1):8 A4(1):q B4(2):8 C#5(3):8 C#5(3):q | E2+B2+E3+C#5(3):8 D5(4):8 E5(5):8 D5(4):8 C#5(3):8 B4(2):8 E4:q | F#2+C#3+F#3+A5(5):16 G#5(4):16 A5(5):8 G#5(4):8 A5(5):8 E5(2):8 A5(5):8 D5(1):8 | D3+A3+D4+C#5(2):8 D5(3):8 E5(4):8 C#5(2):8 B4(1):h | A2+E3+A3+A4(1):8 G#4(1):8 A4(1):q B4(2):8 C#5(3):8 C#5(3):q | E2+B2+E3+C#5(3):8 D5(4):8 E5(5):8 D5(4):8 C#5(3):8 B4(2):8 A4(1):q | F#2+C#3+F#3+A5(4):8 B5(5):8 A5(4):8 G#5(3):8 A5(4):8 E5(2):8 A5(4):8 D5(1):8 | D3+A3+D4+C#5(2):8 D5(3):8 E5(4):8 C#5(2):8 B4(1):h | A2+E3+A3+A5(4):8 B5(5):8 C#6(5):8 D6(5):8 E6(5):8 C#6(3):8 B5(2):8 A5(1):8 | E2+B2+E3+G#5(1):8 A5(2):8 B5(3):8 A5(2):8 G#5(1):8 E5(1):8 E4:q | F#2+C#3+F#3+C#5(1):8 D5(2):8 E5(3):8 F#5(4):8 E5(3):8 D5(2):8 C#5(1):8 B4(1):8 | D3+A3+D4+A4(1):8 B4(2):8 C#5(3):8 D5(4):8 C#5(3):8 B4(2):8 A4(1):q | A2+E3+A3+A4(1):8 B4(2):8 C#5(3):8 E5(4):8 C#5(3):8 B4(2):8 A4(1):q | A2+E3+A3+C#4+E4+A4:w"
  }
];

// Định nghĩa thông số hình học cho 88 phím đàn & Falling Notes
const WHITE_KEY_WIDTH = 30;
const BLACK_KEY_WIDTH = 18;
const WATERFALL_HEIGHT = 340;
const HIT_LINE_Y = 328;
const PIXELS_PER_BEAT = 110;
const TOTAL_KEYBOARD_WIDTH = 52 * WHITE_KEY_WIDTH; // 1560px

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface KeyGeometry {
  note: number;
  label: string;
  name: string;
  octave: number;
  isBlack: boolean;
  isLeft: boolean;
  isMiddleC: boolean;
  x: number;
  width: number;
}

const buildKeyLayout = (): { map: Record<number, KeyGeometry>; list: KeyGeometry[] } => {
  const map: Record<number, KeyGeometry> = {};
  const list: KeyGeometry[] = [];
  let whiteCount = 0;

  for (let note = 21; note <= 108; note++) {
    const octave = Math.floor(note / 12) - 1;
    const nameIndex = note % 12;
    const name = NOTE_NAMES[nameIndex];
    const isBlack = name.includes('#');
    const isLeft = note < 60;
    const isMiddleC = note === 60;

    let x = 0;
    let width = 0;
    if (!isBlack) {
      x = whiteCount * WHITE_KEY_WIDTH;
      width = WHITE_KEY_WIDTH;
      whiteCount++;
    } else {
      x = whiteCount * WHITE_KEY_WIDTH - (BLACK_KEY_WIDTH / 2);
      width = BLACK_KEY_WIDTH;
    }

    const item: KeyGeometry = {
      note,
      label: `${name}${octave}`,
      name,
      octave,
      isBlack,
      isLeft,
      isMiddleC,
      x,
      width
    };
    map[note] = item;
    list.push(item);
  }
  return { map, list };
};

const { map: KEY_MAP, list: ALL_KEYS } = buildKeyLayout();
const WHITE_KEYS = ALL_KEYS.filter(k => !k.isBlack);
const BLACK_KEYS = ALL_KEYS.filter(k => k.isBlack);

interface FallingNote {
  id: string;
  midiNote: number;
  startBeat: number;
  durationBeats: number;
  endBeat: number;
  isLeft: boolean;
  finger?: string | null;
  solfege?: string;
  label: string;
  stepIndex: number;
}

const HandIcon = ({ isLeft, activeFingers, label }: { isLeft: boolean, activeFingers: Set<string>, label: string }) => {
  const getFill = (f: string) => {
    if (activeFingers.has(f)) {
      return isLeft ? '#1976d2' : '#e65100';
    }
    return isLeft ? '#90caf9' : '#ffccbc';
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="68" height="68" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}>
        {isLeft ? (
          <g>
            <rect x="15" y="45" width="70" height="50" rx="15" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="15" y="15" width="12" height="40" rx="6" fill={getFill('5')} />
            <text x="21" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('5') ? '#fff' : '#94a3b8'}>5</text>
            <rect x="30" y="5" width="12" height="50" rx="6" fill={getFill('4')} />
            <text x="36" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('4') ? '#fff' : '#94a3b8'}>4</text>
            <rect x="45" y="0" width="12" height="55" rx="6" fill={getFill('3')} />
            <text x="51" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('3') ? '#fff' : '#94a3b8'}>3</text>
            <rect x="60" y="10" width="12" height="45" rx="6" fill={getFill('2')} />
            <text x="66" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('2') ? '#fff' : '#94a3b8'}>2</text>
            <g transform="translate(73, 30) rotate(25)">
              <rect x="0" y="0" width="14" height="35" rx="7" fill={getFill('1')} />
              <text x="7" y="25" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('1') ? '#fff' : '#94a3b8'} transform="rotate(-25, 7, 25)">1</text>
            </g>
          </g>
        ) : (
          <g>
            <rect x="15" y="45" width="70" height="50" rx="15" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <g transform="translate(13, 20) rotate(-25)">
              <rect x="0" y="0" width="14" height="35" rx="7" fill={getFill('1')} />
              <text x="7" y="25" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('1') ? '#fff' : '#94a3b8'} transform="rotate(25, 7, 25)">1</text>
            </g>
            <rect x="28" y="10" width="12" height="45" rx="6" fill={getFill('2')} />
            <text x="34" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('2') ? '#fff' : '#94a3b8'}>2</text>
            <rect x="43" y="0" width="12" height="55" rx="6" fill={getFill('3')} />
            <text x="49" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('3') ? '#fff' : '#94a3b8'}>3</text>
            <rect x="58" y="5" width="12" height="50" rx="6" fill={getFill('4')} />
            <text x="64" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('4') ? '#fff' : '#94a3b8'}>4</text>
            <rect x="73" y="15" width="12" height="40" rx="6" fill={getFill('5')} />
            <text x="79" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('5') ? '#fff' : '#94a3b8'}>5</text>
          </g>
        )}
      </svg>
      <span style={{ fontSize: 11, fontWeight: 'bold', marginTop: 3, color: isLeft ? '#60a5fa' : '#fb923c' }}>
        {isLeft ? '🔵' : '🟠'} {label}
      </span>
    </div>
  );
};

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainStageScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'split' | 'waterfall' | 'sheet'>('split');
  const [midiStatus, setMidiStatus] = useState<string>('Bấm vào màn hình để bật âm thanh');
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  
  const instrumentRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [lastMidiEvent, setLastMidiEvent] = useState<string>('');
  
  const [selectedExercise, setSelectedExercise] = useState(0);
  const [timeSig, setTimeSig] = useState(EXERCISES[0].timeSig);
  const [inputText, setInputText] = useState(EXERCISES[0].sheet);
  const [bpm, setBpm] = useState(EXERCISES[0].bpm || 90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadX, setPlayheadX] = useState<number | null>(null);

  // Âm lượng tổng (0% - 200%)
  const [volume, setVolume] = useState<number>(160);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [currentBeatInBar, setCurrentBeatInBar] = useState<number>(-1);
  const scheduledMetronomeNodesRef = useRef<any[]>([]);
  const isMetronomeOnRef = useRef(false);
  isMetronomeOnRef.current = isMetronomeOn;

  const isPlayingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const scheduledAudioNodesRef = useRef<any[]>([]);
  const currentActiveIndexRef = useRef(-1);
  const notePositionsRef = useRef<number[]>([]);
  const keysUsedToAdvanceRef = useRef<Set<number>>(new Set());

  const [song, setSong] = useState<any[]>([]);
  const currentBeatRef = useRef<number>(0);

  // Khởi tạo chuỗi âm thanh Master
  const initAudioChain = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    if (!masterGainRef.current) {
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(20, ctx.currentTime);
      compressor.ratio.setValueAtTime(8, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.2, ctx.currentTime);
      compressor.connect(ctx.destination);
      compressorRef.current = compressor;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume / 100, ctx.currentTime);
      masterGain.connect(compressor);
      masterGainRef.current = masterGain;
    }
    return ctx;
  }, [volume]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const playMetronomeTick = useCallback((scheduledTime: number, isDownbeat: boolean) => {
    if (!audioCtxRef.current || !masterGainRef.current) return null;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDownbeat ? 1400 : 900, scheduledTime);
    osc.frequency.exponentialRampToValueAtTime(300, scheduledTime + 0.045);

    const tickGain = isDownbeat ? 0.35 : 0.2;
    gain.gain.setValueAtTime(tickGain, scheduledTime);
    gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.045);

    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.start(scheduledTime);
    osc.stop(scheduledTime + 0.05);
    return osc;
  }, []);

  const playNoteSound = useCallback((midiNote: number, velocity: number = 80) => {
    if (instrumentRef.current && audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      try {
        const gainVal = Math.min(1.0, (velocity / 127) * 1.25);
        return instrumentRef.current.play(midiNote, audioCtxRef.current.currentTime, {
          gain: gainVal,
          duration: 2.5
        });
      } catch (err) {
        console.error(err);
      }
    }
    return null;
  }, []);

  const loadSoundFont = useCallback(async () => {
    if (isLoaded) return;
    try {
      setMidiStatus('Đang tải bộ âm thanh Grand Piano...');
      const ctx = initAudioChain();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const inst = await Soundfont.instrument(ctx, 'acoustic_grand_piano', {
        soundfont: 'MusyngKite',
        destination: masterGainRef.current || ctx.destination
      });
      instrumentRef.current = inst;
      setIsLoaded(true);
      setMidiStatus('Tải xong âm thanh! Hãy bấm phím đàn.');
    } catch (e) {
      setMidiStatus('Lỗi khi tải âm thanh.');
    }
  }, [isLoaded, initAudioChain]);

  // Cập nhật màu nốt nhạc trên khuông VexFlow
  const updateNoteHighlights = useCallback((activeIdx: number) => {
    if (!containerRef.current) return;
    song.forEach((chordData, idx) => {
      const isPast = idx < activeIdx;
      const isActive = idx === activeIdx;

      const trebleColor = isPast ? '#4caf50' : (isActive ? '#e65100' : '#000000');
      const bassColor = isPast ? '#4caf50' : (isActive ? '#1976d2' : '#000000');

      const tNode = containerRef.current!.querySelector(`[id*="vf-note-t-${idx}"]`) as SVGElement | null;
      if (tNode) {
        if (chordData.isTrebleGhost) {
          tNode.style.display = 'none';
          tNode.style.opacity = '0';
          tNode.style.visibility = 'hidden';
          tNode.style.pointerEvents = 'none';
        } else {
          tNode.style.display = '';
          tNode.style.opacity = '1';
          tNode.style.visibility = 'visible';
          tNode.style.fill = trebleColor;
          tNode.style.stroke = trebleColor;
          tNode.querySelectorAll('path, text').forEach((c: any) => {
            c.style.fill = trebleColor;
            c.style.stroke = trebleColor;
          });
        }
      }

      const bNode = containerRef.current!.querySelector(`[id*="vf-note-b-${idx}"]`) as SVGElement | null;
      if (bNode) {
        if (chordData.isBassGhost) {
          bNode.style.display = 'none';
          bNode.style.opacity = '0';
          bNode.style.visibility = 'hidden';
          bNode.style.pointerEvents = 'none';
        } else {
          bNode.style.display = '';
          bNode.style.opacity = '1';
          bNode.style.visibility = 'visible';
          bNode.style.fill = bassColor;
          bNode.style.stroke = bassColor;
          bNode.querySelectorAll('path, text').forEach((c: any) => {
            c.style.fill = bassColor;
            c.style.stroke = bassColor;
          });
        }
      }
    });
  }, [song]);

  const stopAutoPlay = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    scheduledAudioNodesRef.current.forEach((n) => {
      try { n.stop(); } catch (e) {}
    });
    scheduledAudioNodesRef.current = [];
    scheduledMetronomeNodesRef.current.forEach((n) => {
      try { n.stop(); } catch (e) {}
    });
    scheduledMetronomeNodesRef.current = [];
    setPressedKeys(new Set());
    if (!isMetronomeOnRef.current) {
      setCurrentBeatInBar(-1);
    }
  }, []);

  // Tính toán danh sách nốt thác nước Falling Notes
  const fallingNotes = useMemo<FallingNote[]>(() => {
    const list: FallingNote[] = [];
    let currentBeat = 0;

    song.forEach((chordData, stepIndex) => {
      const chordBeats = chordData.beats || 1;

      if (!chordData.isTrebleGhost && chordData.trebleData) {
        chordData.trebleData.forEach((d: any) => {
          if (d.midiNote) {
            list.push({
              id: `fn-t-${stepIndex}-${d.midiNote}`,
              midiNote: d.midiNote,
              startBeat: currentBeat,
              durationBeats: chordBeats,
              endBeat: currentBeat + chordBeats,
              isLeft: false,
              finger: d.finger,
              solfege: d.solfege,
              label: d.vexKey,
              stepIndex
            });
          }
        });
      }

      if (!chordData.isBassGhost && chordData.bassData) {
        chordData.bassData.forEach((d: any) => {
          if (d.midiNote) {
            list.push({
              id: `fn-b-${stepIndex}-${d.midiNote}`,
              midiNote: d.midiNote,
              startBeat: currentBeat,
              durationBeats: chordBeats,
              endBeat: currentBeat + chordBeats,
              isLeft: true,
              finger: d.finger,
              solfege: d.solfege,
              label: d.vexKey,
              stepIndex
            });
          }
        });
      }

      currentBeat += chordBeats;
    });

    return list;
  }, [song]);

  const songStepsWithBeats = useMemo(() => {
    let accumulated = 0;
    return song.map((step) => {
      const startBeat = accumulated;
      accumulated += step.beats || 1;
      return { ...step, startBeat, endBeat: accumulated };
    });
  }, [song]);

  // Vẽ Thác nước Falling Notes lên Canvas
  const drawWaterfall = useCallback((playbackBeat: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = TOTAL_KEYBOARD_WIDTH;
    const H = WATERFALL_HEIGHT;
    const hitY = HIT_LINE_Y;

    // 1. Nền canvas tối sang trọng
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a0c13');
    bgGrad.addColorStop(1, '#111420');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Làn phím (Piano lanes)
    ALL_KEYS.forEach((k) => {
      if (k.isBlack) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(k.x, 0, k.width, hitY);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.fillRect(k.x, 0, k.width, hitY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(k.x, 0);
        ctx.lineTo(k.x, hitY);
        ctx.stroke();
      }
    });

    // 3. Đường phân cách ô nhịp
    const beatsPerMeasure = parseInt(timeSig.split('/')[0], 10) || 4;
    const minVisibleBeat = Math.max(0, playbackBeat - 0.5);
    const maxVisibleBeat = playbackBeat + (hitY / PIXELS_PER_BEAT) + 1;
    const startMeasure = Math.floor(minVisibleBeat / beatsPerMeasure);
    const endMeasure = Math.ceil(maxVisibleBeat / beatsPerMeasure);

    for (let m = startMeasure; m <= endMeasure; m++) {
      const mBeat = m * beatsPerMeasure;
      const lineY = hitY - (mBeat - playbackBeat) * PIXELS_PER_BEAT;
      if (lineY >= 0 && lineY <= hitY) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(W, lineY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`Ô nhịp ${m + 1}`, 15, lineY - 3);
      }
    }

    // 4. Các nốt nhạc đang rơi
    fallingNotes.forEach((fn) => {
      const k = KEY_MAP[fn.midiNote];
      if (!k) return;

      let barBottom = hitY - (fn.startBeat - playbackBeat) * PIXELS_PER_BEAT;
      let barTop = hitY - (fn.endBeat - playbackBeat) * PIXELS_PER_BEAT;
      const isCurrentlyPlaying = playbackBeat >= fn.startBeat && playbackBeat <= fn.endBeat;

      if (isCurrentlyPlaying) {
        barBottom = hitY;
      }

      if (barBottom < 0 || barTop > hitY) return;

      const barHeight = Math.max(10, barBottom - barTop);
      const barX = k.x + (k.isBlack ? 2 : 2);
      const barW = k.width - (k.isBlack ? 4 : 4);

      ctx.save();
      const grad = ctx.createLinearGradient(0, barTop, 0, barBottom);
      if (fn.isLeft) {
        // Tay Trái: Xanh Dương
        grad.addColorStop(0, '#42a5f5');
        grad.addColorStop(1, '#1565c0');
        ctx.strokeStyle = '#90caf9';
        ctx.shadowColor = isCurrentlyPlaying ? '#00e5ff' : 'rgba(33, 150, 243, 0.4)';
      } else {
        // Tay Phải: Cam
        grad.addColorStop(0, '#ffa726');
        grad.addColorStop(1, '#e65100');
        ctx.strokeStyle = '#ffe082';
        ctx.shadowColor = isCurrentlyPlaying ? '#ff9100' : 'rgba(255, 152, 0, 0.4)';
      }

      ctx.shadowBlur = isCurrentlyPlaying ? 22 : 6;
      ctx.fillStyle = grad;
      ctx.lineWidth = 1.5;

      const radius = Math.min(6, barW / 2, barHeight / 2);
      ctx.beginPath();
      ctx.roundRect(barX, barTop, barW, barHeight, radius);
      ctx.fill();
      ctx.stroke();

      // Số ngón tay / tên nốt bên trong
      if (barHeight >= 18) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayLabel = fn.finger ? `${fn.finger}` : (fn.solfege || k.label);
        ctx.fillText(displayLabel, barX + barW / 2, barBottom - Math.min(barHeight / 2, 14));
      }

      // Vệt sáng pháo hoa khi nốt chạm phím đàn
      if (isCurrentlyPlaying) {
        const splashRadius = 26;
        const splashGrad = ctx.createRadialGradient(
          barX + barW / 2, hitY, 3,
          barX + barW / 2, hitY, splashRadius
        );
        splashGrad.addColorStop(0, fn.isLeft ? 'rgba(0, 229, 255, 0.95)' : 'rgba(255, 171, 0, 0.95)');
        splashGrad.addColorStop(0.5, fn.isLeft ? 'rgba(33, 150, 243, 0.5)' : 'rgba(255, 109, 0, 0.5)');
        splashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = splashGrad;
        ctx.beginPath();
        ctx.arc(barX + barW / 2, hitY, splashRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // 5. Vạch laser tiếp xúc phím (Hit Line)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(W, hitY);
    ctx.stroke();
    ctx.restore();
  }, [fallingNotes, timeSig]);

  // Cuộn tự động theo nốt đang đàn
  const centerStageOnNotes = useCallback((midiNotes: number[], smooth = true) => {
    if (!mainStageScrollRef.current || !midiNotes || midiNotes.length === 0) return;
    const avgX = midiNotes.reduce((sum, n) => sum + (KEY_MAP[n]?.x || 780), 0) / midiNotes.length;
    const containerW = mainStageScrollRef.current.clientWidth;
    mainStageScrollRef.current.scrollTo({
      left: Math.max(0, avgX - containerW / 2),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // Bắt đầu chạy mẫu Auto Play
  const startAutoPlay = useCallback(() => {
    if (song.length === 0) return;
    const ctx = initAudioChain();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopAutoPlay();
    isPlayingRef.current = true;
    setIsPlaying(true);

    const secondsPerBeat = 60 / bpm;
    let accumulatedSec = 0;
    const timeRanges = song.map((chordData) => {
      const durSec = chordData.beats * secondsPerBeat;
      const startSec = accumulatedSec;
      const endSec = startSec + durSec;
      accumulatedSec = endSec;
      return { startSec, endSec, durSec };
    });

    const totalDuration = accumulatedSec;
    const audioStartTime = audioCtxRef.current!.currentTime + 0.06;

    // Lên lịch phát âm thanh
    if (instrumentRef.current) {
      timeRanges.forEach((range, idx) => {
        const chordData = song[idx];
        if (chordData.midiNotes && chordData.midiNotes.length > 0) {
          const noteTime = audioStartTime + range.startSec;
          const noteDur = range.durSec * 0.96;
          chordData.midiNotes.forEach((midi: number) => {
            try {
              const audioNode = instrumentRef.current.play(midi, noteTime, {
                gain: 0.95,
                duration: noteDur
              });
              if (audioNode) {
                scheduledAudioNodesRef.current.push(audioNode);
              }
            } catch (err) {
              console.error(err);
            }
          });
        }
      });
    }

    // Lên lịch máy gõ phách
    if (isMetronomeOnRef.current) {
      const beatsPerMeasure = parseInt(timeSig.split('/')[0], 10) || 4;
      const totalBeats = Math.ceil(totalDuration / secondsPerBeat);
      for (let b = 0; b < totalBeats; b++) {
        const tickTime = audioStartTime + b * secondsPerBeat;
        const isDownbeat = (b % beatsPerMeasure) === 0;
        const osc = playMetronomeTick(tickTime, isDownbeat);
        if (osc) scheduledMetronomeNodesRef.current.push(osc);
      }
    }

    currentActiveIndexRef.current = -1;

    // Vòng lặp 60fps mượt mà
    const updatePlaybackFrame = () => {
      if (!isPlayingRef.current || !audioCtxRef.current) return;

      const now = audioCtxRef.current.currentTime;
      const elapsed = now - audioStartTime;

      if (elapsed >= totalDuration) {
        stopAutoPlay();
        setCurrentIndex(0);
        updateNoteHighlights(0);
        drawWaterfall(0);
        if (notePositionsRef.current.length > 0) {
          setPlayheadX(notePositionsRef.current[0]);
        }
        return;
      }

      if (elapsed >= 0) {
        let activeIdx = 0;
        for (let i = 0; i < timeRanges.length; i++) {
          if (elapsed >= timeRanges[i].startSec && elapsed < timeRanges[i].endSec) {
            activeIdx = i;
            break;
          }
          if (elapsed >= timeRanges[i].endSec) {
            activeIdx = i + 1;
          }
        }
        activeIdx = Math.min(activeIdx, song.length - 1);

        // Cập nhật nốt rơi Falling Notes
        const curBeat = elapsed / secondsPerBeat;
        currentBeatRef.current = curBeat;
        drawWaterfall(curBeat);

        // Cập nhật Playhead khuông nhạc
        const curRange = timeRanges[activeIdx];
        const progress = Math.max(0, Math.min(1, (elapsed - curRange.startSec) / curRange.durSec));
        const curX = notePositionsRef.current[activeIdx] ?? 0;
        const nextX = (activeIdx + 1 < notePositionsRef.current.length)
                      ? notePositionsRef.current[activeIdx + 1]
                      : curX + 45;
        const smoothX = curX + (nextX - curX) * progress;
        setPlayheadX(smoothX);

        // Đèn phách
        if (isMetronomeOnRef.current) {
          const beatsPerMeasure = parseInt(timeSig.split('/')[0], 10) || 4;
          const beat = Math.floor(elapsed / secondsPerBeat) % beatsPerMeasure;
          setCurrentBeatInBar(beat);
        }

        // Đổi nốt mới
        if (activeIdx !== currentActiveIndexRef.current) {
          currentActiveIndexRef.current = activeIdx;
          setCurrentIndex(activeIdx);
          setPressedKeys(new Set(song[activeIdx].midiNotes));
          updateNoteHighlights(activeIdx);
          centerStageOnNotes(song[activeIdx].midiNotes, false);

          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              left: Math.max(0, curX - scrollContainerRef.current.clientWidth / 3),
              behavior: 'smooth'
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(updatePlaybackFrame);
    };

    animFrameRef.current = requestAnimationFrame(updatePlaybackFrame);
  }, [song, bpm, timeSig, initAudioChain, stopAutoPlay, playMetronomeTick, updateNoteHighlights, drawWaterfall, centerStageOnNotes]);

  const resetToStart = useCallback(() => {
    stopAutoPlay();
    setCurrentIndex(0);
    keysUsedToAdvanceRef.current = new Set();
    updateNoteHighlights(0);
    drawWaterfall(0);
    centerStageOnNotes(song[0]?.midiNotes || [60]);
    if (notePositionsRef.current.length > 0) {
      setPlayheadX(notePositionsRef.current[0]);
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    if (!isMetronomeOnRef.current) {
      setCurrentBeatInBar(-1);
    }
  }, [stopAutoPlay, updateNoteHighlights, drawWaterfall, centerStageOnNotes, song]);

  // Máy gõ phách độc lập khi không auto-play
  useEffect(() => {
    if (!isMetronomeOn || isPlaying) return;
    const ctx = initAudioChain();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const beatsPerMeasure = parseInt(timeSig.split('/')[0], 10) || 4;
    const secondsPerBeat = 60 / bpm;
    let nextTime = ctx.currentTime + 0.05;
    let beatCount = 0;

    const intervalId = setInterval(() => {
      const currentTime = ctx.currentTime;
      while (nextTime < currentTime + 0.12) {
        const beat = beatCount % beatsPerMeasure;
        const isDownbeat = beat === 0;
        playMetronomeTick(nextTime, isDownbeat);

        const delayMs = Math.max(0, (nextTime - currentTime) * 1000);
        setTimeout(() => {
          if (isMetronomeOnRef.current && !isPlayingRef.current) {
            setCurrentBeatInBar(beat);
          }
        }, delayMs);

        nextTime += secondsPerBeat;
        beatCount++;
      }
    }, 40);

    return () => {
      clearInterval(intervalId);
      if (!isPlayingRef.current) {
        setCurrentBeatInBar(-1);
      }
    };
  }, [isMetronomeOn, isPlaying, bpm, timeSig, playMetronomeTick, initAudioChain]);

  // Phân tích cú pháp sheet nhạc
  const loadCustomSheet = (textToParseInput?: any, timeSignature = timeSig) => {
    stopAutoPlay();
    const textToParse: string = typeof textToParseInput === 'string' ? textToParseInput : inputText;
    
    const tokens: string[] = textToParse.trim().split(/\s+/);
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    const solfegeMap: Record<string, string> = {
      'C': 'Đô', 'C#': 'Đô#', 'Db': 'Rê♭',
      'D': 'Rê', 'D#': 'Rê#', 'Eb': 'Mi♭',
      'E': 'Mi',
      'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Sol♭',
      'G': 'Sol', 'G#': 'Sol#', 'Ab': 'La♭',
      'A': 'La', 'A#': 'La#', 'Bb': 'Si♭',
      'B': 'Si'
    };
    
    const parsedSong: any[] = [];
    let pendingBarline = false;

    tokens.forEach((token: string) => {
      if (token === '|') {
        if (parsedSong.length > 0) {
          parsedSong[parsedSong.length - 1].hasBarlineAfter = true;
        } else {
          pendingBarline = true;
        }
        return;
      }

      let durationStr = 'q';
      let hasDot = false;
      let notesStr = token;
      if (token.includes(':')) {
        const parts = token.split(':');
        notesStr = parts[0];
        durationStr = parts[1];
        if (durationStr.includes('.')) {
          hasDot = true;
          durationStr = durationStr.replace('.', '');
        }
      }

      const notesInChord = notesStr.split('+');
      
      const parsedChordNotes = notesInChord.map((n: string) => {
        const match = n.match(/^([a-gA-G][#b]?)(\d)(?:\((\d+)\))?$/);
        if (!match) return null;
        const letter = match[1][0].toUpperCase();
        const acc = match[1].slice(1).toLowerCase();
        const noteName = letter + (acc === '#' ? '#' : acc === 'b' ? 'b' : '');
        const octave = parseInt(match[2], 10);
        const midiNote = 12 * (octave + 1) + noteMap[noteName];
        const vexKey = `${noteName.toLowerCase()}/${octave}`;
        const isSharp = acc === '#';
        const isFlat = acc === 'b';
        const solfege = solfegeMap[noteName];
        const finger = match[3] || null;
        return { midiNote, vexKey, isSharp, isFlat, solfege, finger };
      });

      if (parsedChordNotes.some(n => n === null) || parsedChordNotes.length === 0) {
        return;
      }

      parsedChordNotes.sort((a, b) => (a?.midiNote ?? 0) - (b?.midiNote ?? 0));

      const trebleData: any[] = [];
      const bassData: any[] = [];
      const midiNotes: number[] = [];
      const fingerings: Record<number, string> = {};

      for (const nData of parsedChordNotes) {
        const { midiNote, vexKey, isSharp, isFlat, solfege, finger } = nData!;
        midiNotes.push(midiNote);
        if (finger) fingerings[midiNote] = finger;
        
        if (midiNote < 60) {
          bassData.push({ midiNote, vexKey, isSharp, isFlat, solfege, finger });
        } else {
          trebleData.push({ midiNote, vexKey, isSharp, isFlat, solfege, finger });
        }
      }

      const isTrebleGhost = trebleData.length === 0;
      const isBassGhost = bassData.length === 0;
      if (isTrebleGhost) trebleData.push({ midiNote: 71, vexKey: 'b/4', isSharp: false, isFlat: false, solfege: '', finger: null });
      if (isBassGhost) bassData.push({ midiNote: 50, vexKey: 'd/3', isSharp: false, isFlat: false, solfege: '', finger: null });

      const durationMap: Record<string, number> = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25 };
      let beats = durationMap[durationStr] || 1;
      if (hasDot) beats *= 1.5;

      parsedSong.push({
        trebleData,
        bassData,
        isTrebleGhost,
        isBassGhost,
        midiNotes,
        duration: durationStr,
        hasDot,
        beats,
        fingerings,
        hasBarlineBefore: pendingBarline,
        hasBarlineAfter: false
      });
      pendingBarline = false;
    });

    if (parsedSong.length > 0) {
      setSong(parsedSong);
      setTimeSig(timeSignature);
      setCurrentIndex(0);
      setPressedKeys(new Set());
      keysUsedToAdvanceRef.current = new Set();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    loadCustomSheet(EXERCISES[0].sheet, EXERCISES[0].timeSig);
  }, []);

  // Luyện tập thủ công: kiểm tra phím bấm để chuyển nốt
  useEffect(() => {
    if (isPlaying) return;
    if (song.length > 0 && currentIndex < song.length) {
      const currentChord = song[currentIndex].midiNotes;
      const isMatch = currentChord.every((n: number) => pressedKeys.has(n));
      
      if (isMatch && currentChord.length > 0) {
        const isUsingOldPress = currentChord.some((n: number) => keysUsedToAdvanceRef.current.has(n));
        if (!isUsingOldPress) {
          currentChord.forEach((n: number) => keysUsedToAdvanceRef.current.add(n));
          const nextIdx = currentIndex + 1;
          setCurrentIndex(nextIdx);
          updateNoteHighlights(nextIdx);

          if (nextIdx < notePositionsRef.current.length) {
            setPlayheadX(notePositionsRef.current[nextIdx]);
          }
        }
      }
    }
  }, [pressedKeys, currentIndex, song, isPlaying, updateNoteHighlights]);

  // Cập nhật thác nước khi thay đổi nốt trong chế độ thủ công
  useEffect(() => {
    if (!isPlaying) {
      const targetBeat = songStepsWithBeats[currentIndex]?.startBeat ?? 0;
      currentBeatRef.current = targetBeat;
      drawWaterfall(targetBeat);

      if (song[currentIndex]?.midiNotes?.length > 0) {
        centerStageOnNotes(song[currentIndex].midiNotes);
      }
    }
  }, [currentIndex, isPlaying, songStepsWithBeats, song, drawWaterfall, centerStageOnNotes]);

  // Vẽ khuông nhạc VexFlow
  useEffect(() => {
    if (!containerRef.current || song.length === 0) return;
    containerRef.current.innerHTML = '';

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    const staveWidth = Math.max(550, song.length * 55 + 80); 
    renderer.resize(staveWidth + 50, 250); 
    const context = renderer.getContext();
    context.setFont('Arial', 10, '').setBackgroundFillStyle('#eed');

    // Khóa Sol
    const trebleStave = new Stave(10, 20, staveWidth);
    trebleStave.addClef('treble').addTimeSignature(timeSig);
    trebleStave.setContext(context).draw();

    // Khóa Fa
    const bassStave = new Stave(10, 100, staveWidth);
    bassStave.addClef('bass').addTimeSignature(timeSig);
    bassStave.setContext(context).draw();

    // Nối 2 khóa
    const brace = new StaveConnector(trebleStave, bassStave).setType(3);
    const lineLeft = new StaveConnector(trebleStave, bassStave).setType(1);
    const lineRight = new StaveConnector(trebleStave, bassStave).setType(6);
    brace.setContext(context).draw();
    lineLeft.setContext(context).draw();
    lineRight.setContext(context).draw();

    const trebleNotes: any[] = [];
    const bassNotes: any[] = [];

    song.forEach((chordData, index) => {
      const tNote = new StaveNote({ clef: 'treble', keys: chordData.trebleData.map((d: any) => d.vexKey), duration: chordData.duration + (chordData.hasDot ? 'd' : '') });
      tNote.setAttribute('id', `vf-note-t-${index}`);
      
      chordData.trebleData.forEach((d: any, i: number) => {
        if (d.isSharp) tNote.addModifier(new Accidental('#'), i);
        if (d.isFlat) tNote.addModifier(new Accidental('b'), i);
        if (d.solfege) {
          tNote.addModifier(new Annotation(d.solfege).setFont('Arial', 10, '').setVerticalJustification(Annotation.VerticalJustify.BOTTOM), i);
        }
        if (d.finger) {
          tNote.addModifier(new Annotation(d.finger).setFont('Arial', 11, 'bold').setVerticalJustification(Annotation.VerticalJustify.TOP), i);
        }
      });
      if (chordData.hasDot) tNote.addModifier(new Dot(), 0);
      if (chordData.isTrebleGhost) {
        tNote.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
      }

      const bNote = new StaveNote({ clef: 'bass', keys: chordData.bassData.map((d: any) => d.vexKey), duration: chordData.duration + (chordData.hasDot ? 'd' : '') });
      bNote.setAttribute('id', `vf-note-b-${index}`);

      chordData.bassData.forEach((d: any, i: number) => {
        if (d.isSharp) bNote.addModifier(new Accidental('#'), i);
        if (d.isFlat) bNote.addModifier(new Accidental('b'), i);
        if (d.finger) {
          bNote.addModifier(new Annotation(d.finger).setFont('Arial', 11, 'bold').setVerticalJustification(Annotation.VerticalJustify.BOTTOM), i);
        }
        if (d.solfege) {
          bNote.addModifier(new Annotation(d.solfege).setFont('Arial', 10, '').setVerticalJustification(Annotation.VerticalJustify.BOTTOM), i);
        }
      });
      if (chordData.hasDot) bNote.addModifier(new Dot(), 0);
      if (chordData.isBassGhost) {
        bNote.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
      }

      if (!chordData.isTrebleGhost) {
        const c = index === 0 ? '#e65100' : 'black';
        tNote.setStyle({ fillStyle: c, strokeStyle: c });
      }
      if (!chordData.isBassGhost) {
        const c = index === 0 ? '#1976d2' : 'black';
        bNote.setStyle({ fillStyle: c, strokeStyle: c });
      }

      trebleNotes.push(tNote);
      bassNotes.push(bNote);
    });

    if (trebleNotes.length > 0) {
      Formatter.FormatAndDraw(context, trebleStave, trebleNotes);
    }
    if (bassNotes.length > 0) {
      Formatter.FormatAndDraw(context, bassStave, bassNotes);
    }

    // Ẩn nốt ghost để tách biệt 2 khóa
    song.forEach((chordData, i) => {
      if (chordData.isTrebleGhost) {
        const el = containerRef.current?.querySelector(`[id*="vf-note-t-${i}"]`) as SVGElement | null;
        if (el) {
          el.style.display = 'none';
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
        }
      }
      if (chordData.isBassGhost) {
        const el = containerRef.current?.querySelector(`[id*="vf-note-b-${i}"]`) as SVGElement | null;
        if (el) {
          el.style.display = 'none';
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
        }
      }
    });

    const positions: number[] = [];
    const svgEl = containerRef.current.querySelector('svg');

    if (svgEl) {
      const trebleLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      trebleLabel.setAttribute('x', '35');
      trebleLabel.setAttribute('y', '14');
      trebleLabel.setAttribute('fill', '#e65100');
      trebleLabel.setAttribute('font-size', '11');
      trebleLabel.setAttribute('font-weight', 'bold');
      trebleLabel.setAttribute('font-family', 'Arial, sans-serif');
      trebleLabel.textContent = '🟠 Tay Phải (Khóa Sol)';
      svgEl.appendChild(trebleLabel);

      const bassLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      bassLabel.setAttribute('x', '35');
      bassLabel.setAttribute('y', '94');
      bassLabel.setAttribute('fill', '#1565c0');
      bassLabel.setAttribute('font-size', '11');
      bassLabel.setAttribute('font-weight', 'bold');
      bassLabel.setAttribute('font-family', 'Arial, sans-serif');
      bassLabel.textContent = '🔵 Tay Trái (Khóa Fa)';
      svgEl.appendChild(bassLabel);
    }

    trebleNotes.forEach((tNote, i) => {
      const x = tNote.getAbsoluteX();
      positions.push(x);

      if (song[i]?.hasBarlineAfter && svgEl) {
        const nextX = (i + 1 < trebleNotes.length) ? trebleNotes[i + 1].getAbsoluteX() : x + 40;
        const barX = (x + nextX) / 2;
        const topY = trebleStave.getYForLine(0);
        const bottomY = bassStave.getYForLine(4);

        const barLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        barLine.setAttribute('x1', barX.toFixed(1));
        barLine.setAttribute('y1', topY.toFixed(1));
        barLine.setAttribute('x2', barX.toFixed(1));
        barLine.setAttribute('y2', bottomY.toFixed(1));
        barLine.setAttribute('stroke', '#666');
        barLine.setAttribute('stroke-width', '1.5');
        svgEl.appendChild(barLine);
      }
    });

    notePositionsRef.current = positions;

    if (positions.length > 0) {
      setPlayheadX(positions[0]);
    }
    updateNoteHighlights(0);
    drawWaterfall(0);
  }, [song, timeSig, updateNoteHighlights, drawWaterfall]);

  // Handler MIDI Message
  const handleMidiMessage = useCallback((statusByte: number, note: number, velocity: number) => {
    const messageType = statusByte & 0xF0;
    const isNoteOn = (messageType === 0x90 || statusByte === 144) && velocity > 0;
    const isNoteOff = messageType === 0x80 || statusByte === 128 || ((messageType === 0x90 || statusByte === 144) && velocity === 0);

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = noteNames[note % 12];
    const octave = Math.floor(note / 12) - 1;

    if (isNoteOn) {
      setLastMidiEvent(`${noteName}${octave} (MIDI: ${note})`);
      setPressedKeys(prev => new Set(prev).add(note));
      playNoteSound(note, velocity);
    } else if (isNoteOff) {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }
  }, [playNoteSound]);

  const handleGlobalMidi = useCallback((e: any) => {
    if (!e || !e.data || e.data.length < 2) return;
    const command = e.data[0];
    const note = e.data[1];
    const velocity = (e.data.length > 2) ? e.data[2] : 0;
    handleMidiMessage(command, note, velocity);
  }, [handleMidiMessage]);

  // Web MIDI API
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      setMidiStatus('Trình duyệt chưa hỗ trợ Web MIDI API.');
    }

    function onMIDISuccess(midiAccess: any) {
      const attachListeners = () => {
        const devices: string[] = [];
        for (let input of midiAccess.inputs.values()) {
          devices.push(input.name || 'Thiết bị MIDI');
          input.onmidimessage = handleGlobalMidi;
        }
        setMidiDevices(devices);
        if (devices.length > 0) {
          setMidiStatus(`Đã kết nối: ${devices.join(', ')}`);
        }
      };

      attachListeners();
      midiAccess.onstatechange = () => attachListeners();
    }

    function onMIDIFailure() {
      setMidiStatus('Chưa có quyền MIDI.');
    }
  }, [handleGlobalMidi]);

  // Bàn phím máy tính PC Keyboard
  const keyToMidi: Record<string, number> = {
    'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
    'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71, 'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyToMidi[key] !== undefined) {
        handleMidiMessage(144, keyToMidi[key], 80);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyToMidi[key] !== undefined) {
        handleMidiMessage(128, keyToMidi[key], 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMidiMessage]);

  const targetNotes = (currentIndex < song.length && song[currentIndex]) 
                      ? song[currentIndex].midiNotes 
                      : [];

  const activeLeftFingers = new Set<string>();
  const activeRightFingers = new Set<string>();
  const currentFingeringMap: Record<number, string> = {};

  if (currentIndex < song.length && song[currentIndex]) {
    const item = song[currentIndex];
    if (item.fingerings) {
      Object.entries(item.fingerings).forEach(([midiStr, finger]) => {
        const midi = parseInt(midiStr, 10);
        currentFingeringMap[midi] = finger as string;
        if (midi < 60) activeLeftFingers.add(finger as string);
        else activeRightFingers.add(finger as string);
      });
    }
  }

  // Khởi tạo vị trí cuộn ban đầu căn giữa C4
  useEffect(() => {
    if (mainStageScrollRef.current) {
      const containerW = mainStageScrollRef.current.clientWidth;
      mainStageScrollRef.current.scrollLeft = Math.max(0, KEY_MAP[60].x - containerW / 2);
    }
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0d0f15', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }} onClick={loadSoundFont}>
      
      {/* 1. TOP HEADER & STUDIO CONTROLS (Full-Width, Sleek Dark Studio) */}
      <header style={{ background: '#131722', borderBottom: '1px solid #232938', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', position: 'sticky', top: 0, zIndex: 100 }}>
        
        {/* Logo & Song Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px', color: '#fff', letterSpacing: '-0.5px' }}>
            <span style={{ fontSize: '24px' }}>🎹</span>
            <span>PIANO STUDIO</span>
            <span style={{ fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pro</span>
          </div>

          <select 
            value={selectedExercise}
            onChange={(e) => {
              const idx = parseInt(e.target.value);
              setSelectedExercise(idx);
              setInputText(EXERCISES[idx].sheet);
              setTimeSig(EXERCISES[idx].timeSig);
              const exerciseBpm = EXERCISES[idx].bpm || 90;
              setBpm(exerciseBpm);
              loadCustomSheet(EXERCISES[idx].sheet, EXERCISES[idx].timeSig);
            }}
            style={{ 
              background: '#1e2433', 
              color: '#f8fafc', 
              border: '1px solid #334155', 
              padding: '8px 14px', 
              fontSize: '14px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 500,
              maxWidth: '380px',
              outline: 'none'
            }}
          >
            {EXERCISES.map((ex, index) => (
              <option key={index} value={index}>{ex.name} ({ex.timeSig})</option>
            ))}
          </select>
        </div>

        {/* Playback & Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Play/Pause Button */}
          <button 
            onClick={isPlaying ? stopAutoPlay : startAutoPlay}
            style={{ 
              padding: '8px 18px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              borderRadius: '6px', 
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isPlaying ? '#ef4444' : '#10b981',
              color: '#fff',
              boxShadow: isPlaying ? '0 0 12px rgba(239,68,68,0.5)' : '0 0 12px rgba(16,185,129,0.5)',
              transition: 'all 0.15s ease'
            }}
          >
            {isPlaying ? '⏸ Dừng lại' : '▶ Chạy mẫu (Auto Play)'}
          </button>

          {/* Reset Button */}
          <button 
            onClick={resetToStart}
            style={{ 
              padding: '8px 14px', 
              fontSize: '13px', 
              borderRadius: '6px', 
              border: '1px solid #334155',
              background: '#1e2433', 
              color: '#94a3b8', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px'
            }}
          >
            ⏮ Về đầu
          </button>

          {/* Metronome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e2433', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155' }}>
            <button
              onClick={() => setIsMetronomeOn(prev => !prev)}
              style={{
                background: isMetronomeOn ? '#f59e0b' : 'transparent',
                color: isMetronomeOn ? '#000' : '#94a3b8',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ⏱ {isMetronomeOn ? 'Phách: BẬT' : 'Phách: TẮT'}
            </button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: parseInt(timeSig.split('/')[0], 10) || 4 }).map((_, idx) => {
                const isCurrent = currentBeatInBar === idx;
                const isDownbeat = idx === 0;
                return (
                  <div
                    key={idx}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? (isDownbeat ? '#ef4444' : '#10b981') : '#334155',
                      boxShadow: isCurrent ? `0 0 8px ${isDownbeat ? '#ef4444' : '#10b981'}` : 'none',
                      transition: 'all 0.08s ease'
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* BPM */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e2433', padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>BPM:</span>
            <input 
              type="number" 
              value={bpm}
              min="30"
              max="240"
              onChange={(e) => {
                const val = parseInt(e.target.value) || 90;
                setBpm(val);
                if (isPlaying) stopAutoPlay();
              }}
              style={{ width: '45px', background: '#0f172a', border: '1px solid #334155', color: '#fff', textAlign: 'center', borderRadius: '4px', padding: '3px', fontSize: '13px', fontWeight: 'bold' }}
            />
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e2433', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '13px' }}>🔊</span>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              style={{ width: '70px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', minWidth: '36px' }}>{volume}%</span>
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: '#0f172a', padding: '3px', borderRadius: '6px', border: '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('waterfall')}
              style={{
                background: viewMode === 'waterfall' ? '#3b82f6' : 'transparent',
                color: viewMode === 'waterfall' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🌊 Thác nước
            </button>
            <button
              onClick={() => setViewMode('sheet')}
              style={{
                background: viewMode === 'sheet' ? '#3b82f6' : 'transparent',
                color: viewMode === 'sheet' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🎼 Khuông nhạc
            </button>
            <button
              onClick={() => setViewMode('split')}
              style={{
                background: viewMode === 'split' ? '#3b82f6' : 'transparent',
                color: viewMode === 'split' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ⚡ Cả hai
            </button>
          </div>

          {/* MIDI status badge */}
          <div 
            title={midiStatus}
            style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            padding: '5px 10px', 
            borderRadius: '14px', 
            background: midiDevices.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)',
            color: midiDevices.length > 0 ? '#34d399' : '#94a3b8',
            border: `1px solid ${midiDevices.length > 0 ? '#059669' : '#475569'}`
          }}>
            {midiDevices.length > 0 ? `🎹 ${midiDevices[0]}` : `⚪ ${midiStatus}`}
          </div>

        </div>
      </header>

      {/* 2. SECONDARY INFO & HAND STATUS BAR */}
      <div style={{ background: '#10141f', borderBottom: '1px solid #1e2638', padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        
        {/* Color Code Legend */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 58, 138, 0.35)', padding: '4px 10px', borderRadius: '14px', border: '1px solid #1e40af' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block', boxShadow: '0 0 6px #3b82f6' }}></span>
            <span style={{ color: '#93c5fd', fontWeight: 'bold' }}>Tay Trái (Khóa Fa / &lt; C4): Thác nước &amp; Phím màu Xanh 🔵</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(124, 45, 18, 0.35)', padding: '4px 10px', borderRadius: '14px', border: '1px solid #9a3412' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block', boxShadow: '0 0 6px #f97316' }}></span>
            <span style={{ color: '#fdba74', fontWeight: 'bold' }}>Tay Phải (Khóa Sol / &ge; C4): Thác nước &amp; Phím màu Cam 🟠</span>
          </div>
          {lastMidiEvent && (
            <span style={{ color: '#4ade80', fontSize: '12px', background: 'rgba(74, 222, 128, 0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
              📡 {lastMidiEvent}
            </span>
          )}
        </div>

        {/* Hand Icons with active finger highlights */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <HandIcon isLeft={true} activeFingers={activeLeftFingers} label="Tay Trái" />
          <HandIcon isLeft={false} activeFingers={activeRightFingers} label="Tay Phải" />
        </div>
      </div>

      {/* 3. SHEET MUSIC SECTION (Conditional) */}
      {(viewMode === 'sheet' || viewMode === 'split') && (
        <section style={{ background: '#131722', borderBottom: '1px solid #1e2638', padding: '12px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>🎼 Bản nhạc 2 tay chuẩn VexFlow:</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isPlaying ? '🎵 Đang chạy mẫu biểu diễn đồng bộ 60fps...' : 'Tập đàn theo nốt phát sáng trên khuông nhạc'}
            </span>
          </div>

          <div 
            ref={scrollContainerRef}
            style={{ overflowX: 'auto', width: '100%', position: 'relative', background: '#fff', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            <div ref={containerRef} style={{ display: 'inline-block', padding: '5px' }} />
            {playheadX !== null && (
              <div 
                style={{
                  position: 'absolute',
                  top: 15,
                  bottom: 35,
                  left: playheadX,
                  width: '2px',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.9)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  transition: isPlaying ? 'none' : 'left 0.1s ease-out'
                }}
              >
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '8px solid #ef4444',
                  marginLeft: '-4px'
                }} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. MAIN FALLING NOTES WATERFALL & 88-KEY PIANO STAGE (Full-Width, Edge-to-Edge) */}
      {(viewMode === 'waterfall' || viewMode === 'split') && (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0c12' }}>
          
          <div 
            ref={mainStageScrollRef}
            style={{ 
              width: '100%', 
              overflowX: 'auto', 
              paddingTop: '15px', 
              paddingBottom: '25px',
              background: '#0a0c12',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ width: TOTAL_KEYBOARD_WIDTH, position: 'relative', boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
              
              {/* Thác nước Canvas */}
              <canvas 
                ref={canvasRef} 
                width={TOTAL_KEYBOARD_WIDTH} 
                height={WATERFALL_HEIGHT} 
                style={{ 
                  display: 'block', 
                  background: '#0a0c12',
                  borderTop: '1px solid #1e2638',
                  borderLeft: '1px solid #1e2638',
                  borderRight: '1px solid #1e2638'
                }} 
              />

              {/* Bàn phím 88 phím đàn Piano ghép nối trực tiếp bên dưới thác nước */}
              <div style={{ 
                position: 'relative', 
                width: TOTAL_KEYBOARD_WIDTH, 
                height: 145, 
                background: '#0a0c12',
                userSelect: 'none',
                borderLeft: '1px solid #1e2638',
                borderRight: '1px solid #1e2638',
                borderBottom: '2px solid #000'
              }}>
                
                {/* 1. Lớp phím Trắng (Nằm dưới) */}
                {WHITE_KEYS.map((k) => {
                  const isPressed = pressedKeys.has(k.note);
                  const isTarget = targetNotes.includes(k.note);

                  let bg = '#ffffff';
                  let border = '1px solid #232733';
                  let textColor = '#1e293b';
                  let boxShadow = 'none';

                  if (isPressed) {
                    bg = k.isLeft ? '#2563eb' : '#ea580c';
                    textColor = '#ffffff';
                    boxShadow = k.isLeft ? '0 0 16px rgba(37, 99, 235, 0.95)' : '0 0 16px rgba(234, 88, 12, 0.95)';
                    border = k.isLeft ? '2px solid #1d4ed8' : '2px solid #c2410c';
                  } else if (isTarget) {
                    bg = k.isLeft ? '#bfdbfe' : '#fed7aa';
                    textColor = k.isLeft ? '#1d4ed8' : '#c2410c';
                    border = k.isLeft ? '1.5px solid #3b82f6' : '1.5px solid #f97316';
                  }

                  return (
                    <div
                      key={k.note}
                      onMouseDown={() => handleMidiMessage(144, k.note, 80)}
                      onMouseUp={() => handleMidiMessage(128, k.note, 0)}
                      onMouseLeave={() => handleMidiMessage(128, k.note, 0)}
                      style={{
                        position: 'absolute',
                        left: k.x,
                        width: k.width,
                        height: 140,
                        background: bg,
                        borderTop: border,
                        borderLeft: border,
                        borderRight: border,
                        borderBottom: isPressed ? (k.isLeft ? '5px solid #1e3a8a' : '5px solid #7c2d12') : '5px solid #94a3b8',
                        borderRadius: '0 0 5px 5px',
                        zIndex: isPressed ? 3 : 1,
                        color: textColor,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '6px',
                        cursor: 'pointer',
                        boxShadow,
                        transition: 'background 0.08s ease, transform 0.05s ease'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: (k.label.includes('C') || isTarget || isPressed) ? 1 : 0 }}>
                        {currentFingeringMap[k.note] && (
                          <div style={{
                            width: 15,
                            height: 15,
                            borderRadius: '50%',
                            backgroundColor: k.isLeft ? '#1d4ed8' : '#c2410c',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 'bold',
                            marginBottom: 2,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            border: '1px solid #fff'
                          }}>
                            {currentFingeringMap[k.note]}
                          </div>
                        )}
                        {isTarget && !currentFingeringMap[k.note] && (
                          <div style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: k.isLeft ? '#1d4ed8' : '#c2410c',
                            marginBottom: 3
                          }} />
                        )}
                        <span style={{
                          fontSize: k.isMiddleC ? 11 : 10,
                          fontWeight: k.isMiddleC ? 'bold' : 'normal',
                          color: k.isMiddleC && !isPressed && !isTarget ? '#dc2626' : 'inherit'
                        }}>
                          {k.label}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Lớp phím Đen (Nằm đè lên trên) */}
                {BLACK_KEYS.map((k) => {
                  const isPressed = pressedKeys.has(k.note);
                  const isTarget = targetNotes.includes(k.note);

                  let bg = '#181b24';
                  let border = '1px solid #000';
                  let textColor = '#ffffff';
                  let boxShadow = 'none';

                  if (isPressed) {
                    bg = k.isLeft ? '#1d4ed8' : '#c2410c';
                    boxShadow = k.isLeft ? '0 0 16px rgba(29, 78, 216, 0.95)' : '0 0 16px rgba(194, 65, 12, 0.95)';
                    border = k.isLeft ? '2px solid #60a5fa' : '2px solid #fb923c';
                  } else if (isTarget) {
                    bg = k.isLeft ? '#1e40af' : '#9a3412';
                    border = k.isLeft ? '1.5px solid #93c5fd' : '1.5px solid #fdba74';
                  }

                  return (
                    <div
                      key={k.note}
                      onMouseDown={() => handleMidiMessage(144, k.note, 80)}
                      onMouseUp={() => handleMidiMessage(128, k.note, 0)}
                      onMouseLeave={() => handleMidiMessage(128, k.note, 0)}
                      style={{
                        position: 'absolute',
                        left: k.x,
                        width: k.width,
                        height: 86,
                        background: bg,
                        borderTop: border,
                        borderLeft: border,
                        borderRight: border,
                        borderBottom: isPressed ? (k.isLeft ? '4px solid #1e3a8a' : '4px solid #7c2d12') : '4px solid #000',
                        borderRadius: '0 0 4px 4px',
                        zIndex: 2,
                        color: textColor,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '5px',
                        cursor: 'pointer',
                        boxShadow,
                        transition: 'background 0.08s ease, transform 0.05s ease'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: (isTarget || isPressed) ? 1 : 0 }}>
                        {currentFingeringMap[k.note] && (
                          <div style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: k.isLeft ? '#3b82f6' : '#f97316',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            fontWeight: 'bold',
                            marginBottom: 2
                          }}>
                            {currentFingeringMap[k.note]}
                          </div>
                        )}
                        <span style={{ fontSize: 9 }}>{k.label}</span>
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>
          </div>

        </main>
      )}

      {/* 5. FOOTER COLLAPSIBLE: TỰ GÕ BẢN NHẠC */}
      <footer style={{ background: '#11141f', borderTop: '1px solid #1e2638', padding: '12px 24px' }}>
        <details style={{ background: '#181d2a', padding: '10px 15px', borderRadius: '6px', border: '1px solid #232c3f', cursor: 'pointer' }}>
          <summary style={{ fontWeight: 'bold', fontSize: '14px', color: '#cbd5e1' }}>
            ✏️ Tự soạn bản nhạc hoặc chỉnh sửa mã nốt nhạc
          </summary>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8' }}>Nhịp:</label>
            <input 
              type="text" 
              value={timeSig}
              onChange={(e) => setTimeSig(e.target.value)}
              style={{ width: '45px', padding: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', textAlign: 'center', borderRadius: '4px', fontSize: '13px' }}
            />
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ flex: 1, minWidth: '280px', padding: '6px 12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '13px' }}
              placeholder="Ví dụ: C4:q D4:q E4:h | C4+E4+G4:w"
            />
            <button 
              onClick={() => loadCustomSheet(inputText)} 
              style={{ padding: '6px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              Áp dụng bản nhạc
            </button>
          </div>
        </details>
      </footer>

    </div>
  );
}

export default App;
