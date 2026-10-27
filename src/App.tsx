import { useEffect, useRef, useState, useCallback } from 'react';
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

const HandIcon = ({ isLeft, activeFingers, label }: { isLeft: boolean, activeFingers: Set<string>, label: string }) => {
  const getFill = (f: string) => activeFingers.has(f) ? '#ff5722' : '#ffccbc';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 20px' }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }}>
        {isLeft ? (
          <g>
            <rect x="15" y="45" width="70" height="50" rx="15" fill="#ffe0b2" />
            <rect x="15" y="15" width="12" height="40" rx="6" fill={getFill('5')} />
            <text x="21" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('5') ? '#fff' : '#555'}>5</text>
            <rect x="30" y="5" width="12" height="50" rx="6" fill={getFill('4')} />
            <text x="36" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('4') ? '#fff' : '#555'}>4</text>
            <rect x="45" y="0" width="12" height="55" rx="6" fill={getFill('3')} />
            <text x="51" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('3') ? '#fff' : '#555'}>3</text>
            <rect x="60" y="10" width="12" height="45" rx="6" fill={getFill('2')} />
            <text x="66" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('2') ? '#fff' : '#555'}>2</text>
            <g transform="translate(73, 30) rotate(25)">
              <rect x="0" y="0" width="14" height="35" rx="7" fill={getFill('1')} />
              <text x="7" y="25" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('1') ? '#fff' : '#555'} transform="rotate(-25, 7, 25)">1</text>
            </g>
          </g>
        ) : (
          <g>
            <rect x="15" y="45" width="70" height="50" rx="15" fill="#ffe0b2" />
            <g transform="translate(13, 20) rotate(-25)">
              <rect x="0" y="0" width="14" height="35" rx="7" fill={getFill('1')} />
              <text x="7" y="25" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('1') ? '#fff' : '#555'} transform="rotate(25, 7, 25)">1</text>
            </g>
            <rect x="28" y="10" width="12" height="45" rx="6" fill={getFill('2')} />
            <text x="34" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('2') ? '#fff' : '#555'}>2</text>
            <rect x="43" y="0" width="12" height="55" rx="6" fill={getFill('3')} />
            <text x="49" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('3') ? '#fff' : '#555'}>3</text>
            <rect x="58" y="5" width="12" height="50" rx="6" fill={getFill('4')} />
            <text x="64" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('4') ? '#fff' : '#555'}>4</text>
            <rect x="73" y="15" width="12" height="40" rx="6" fill={getFill('5')} />
            <text x="79" y="40" fontSize="12" fontWeight="bold" textAnchor="middle" fill={activeFingers.has('5') ? '#fff' : '#555'}>5</text>
          </g>
        )}
      </svg>
      <span style={{ fontSize: 14, fontWeight: 'bold', marginTop: 5, color: '#555' }}>{label}</span>
    </div>
  );
};

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [midiStatus, setMidiStatus] = useState<string>('Click vào màn hình để bắt đầu tải âm thanh piano...');
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

  // Âm lượng tổng (0% - 200%), mặc định 160% để âm thanh to, rõ ngang YouTube
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const notePositionsRef = useRef<number[]>([]);
  const keysUsedToAdvanceRef = useRef<Set<number>>(new Set());

  const [song, setSong] = useState<any[]>([]);

  // Khởi tạo chuỗi xử lý âm thanh Master (Gain Boost + Dynamic Limiter chống vỡ tiếng)
  const initAudioChain = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    if (!masterGainRef.current) {
      // Bộ Limiter / Compressor giữ âm thanh đầy đặn, ấm và không bị rè khi tăng âm lượng
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(20, ctx.currentTime);
      compressor.ratio.setValueAtTime(8, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.2, ctx.currentTime);
      compressor.connect(ctx.destination);
      compressorRef.current = compressor;

      // Master Gain cho phép khuếch đại âm thanh to hơn bình thường
      const masterGain = ctx.createGain();
      const gainVal = (volume / 100) * 1.5;
      masterGain.gain.setValueAtTime(gainVal, ctx.currentTime);
      masterGain.connect(compressor);
      masterGainRef.current = masterGain;
    }
    return masterGainRef.current;
  }, [volume]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      const gainVal = (newVol / 100) * 1.5;
      masterGainRef.current.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
    }
  }, []);

  const playMetronomeTick = useCallback((time: number, isDownbeat: boolean) => {
    if (!audioCtxRef.current) return null;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      if (masterGainRef.current) {
        gain.connect(masterGainRef.current);
      } else {
        gain.connect(ctx.destination);
      }

      const freq = isDownbeat ? 1400 : 900;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(isDownbeat ? 600 : 400, time + 0.03);

      const peakGain = isDownbeat ? 0.65 : 0.35;
      gain.gain.setValueAtTime(peakGain, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.038);

      osc.start(time);
      osc.stop(time + 0.04);

      return osc;
    } catch (e) {
      return null;
    }
  }, []);

  const playNoteSound = useCallback((midiNote: number, velocity: number = 80) => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    if (instrumentRef.current) {
      // Tăng lực nhấn phím để âm thanh dày và vang to hơn
      const gain = Math.min(1.5, (velocity / 80) * 1.2);
      instrumentRef.current.play(midiNote, audioCtxRef.current?.currentTime, { gain });
    }
  }, []);

  const loadSoundFont = useCallback(async () => {
    if (isLoaded && instrumentRef.current) return;
    
    const masterGain = initAudioChain();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    setMidiStatus('Đang tải âm thanh piano thật (vài MB)...');
    try {
      const inst = await Soundfont.instrument(ctx, 'acoustic_grand_piano', {
        destination: masterGain,
        gain: 1.5
      });
      instrumentRef.current = inst;
      setIsLoaded(true);
      setMidiStatus('Tải xong âm thanh! Hãy thử bấm phím.');
    } catch (e) {
      setMidiStatus('Lỗi khi tải âm thanh.');
    }
  }, [isLoaded, initAudioChain]);

  // Cập nhật màu sắc nốt nhạc trực tiếp trên SVG DOM mà không cần vẽ lại toàn bộ VexFlow
  const updateNoteHighlights = useCallback((activeIdx: number) => {
    if (!containerRef.current) return;
    song.forEach((_, idx) => {
      const color = idx < activeIdx ? '#4caf50' : (idx === activeIdx ? '#2196f3' : '#000000');
      const nodes = containerRef.current!.querySelectorAll(
        `[id*="vf-note-t-${idx}"], [id*="vf-note-b-${idx}"]`
      );
      nodes.forEach((el: any) => {
        el.style.fill = color;
        el.style.stroke = color;
        const children = el.querySelectorAll('path, text');
        children.forEach((c: any) => {
          c.style.fill = color;
          c.style.stroke = color;
        });
      });
    });
  }, [song]);

  const stopAutoPlay = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (instrumentRef.current) {
      try {
        instrumentRef.current.stop();
      } catch (e) {}
    }

    scheduledAudioNodesRef.current.forEach(node => {
      try { node?.stop?.(); } catch (e) {}
    });
    scheduledAudioNodesRef.current = [];

    scheduledMetronomeNodesRef.current.forEach(node => {
      try { node?.stop?.(); } catch (e) {}
    });
    scheduledMetronomeNodesRef.current = [];

    setPressedKeys(new Set());
    currentActiveIndexRef.current = -1;
    if (!isMetronomeOnRef.current) {
      setCurrentBeatInBar(-1);
    }
  }, []);

  const startAutoPlay = useCallback(async () => {
    if (!instrumentRef.current) {
      await loadSoundFont();
      if (!instrumentRef.current) {
        alert("Vui lòng click vào màn hình để bắt đầu tải âm thanh piano trước!");
        return;
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    stopAutoPlay();

    if (song.length === 0) return;

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
    const audioStartTime = audioCtxRef.current!.currentTime + 0.06; // 60ms lead time

    // Lên lịch phát âm thanh piano chuẩn xác 100% bằng đồng hồ phần cứng Web Audio
    const scheduledNodes: any[] = [];
    song.forEach((chordData, i) => {
      const noteStartTime = audioStartTime + timeRanges[i].startSec;
      const noteDur = timeRanges[i].durSec;
      // Giữ âm vang tự nhiên liền mạch 95% trường độ
      const soundDur = Math.max(0.2, noteDur * 0.95);

      chordData.midiNotes.forEach((midiNote: number) => {
        try {
          const node = instrumentRef.current.play(midiNote, noteStartTime, {
            gain: 1.25,
            duration: soundDur
          });
          if (node) scheduledNodes.push(node);
        } catch (e) {
          console.error("Lỗi phát nốt:", midiNote, e);
        }
      });
    });
    scheduledAudioNodesRef.current = scheduledNodes;

    // Nếu máy gõ phách đang bật, lên lịch gõ phách chuẩn xác theo nhịp bài hát
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

    // Vòng lặp 60fps đồng bộ giao diện người dùng (Playhead, bàn phím, bàn tay, sheet)
    currentActiveIndexRef.current = -1;

    const updatePlaybackFrame = () => {
      if (!isPlayingRef.current || !audioCtxRef.current) return;

      const now = audioCtxRef.current.currentTime;
      const elapsed = now - audioStartTime;

      if (elapsed >= totalDuration) {
        stopAutoPlay();
        setCurrentIndex(0);
        updateNoteHighlights(0);
        if (notePositionsRef.current.length > 0) {
          setPlayheadX(notePositionsRef.current[0]);
        }
        return;
      }

      if (elapsed >= 0) {
        // Tìm nốt tương ứng với thời điểm hiện tại
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

        // Chuyển động Playhead mượt mà 60fps qua các nốt
        const curRange = timeRanges[activeIdx];
        const progress = Math.max(0, Math.min(1, (elapsed - curRange.startSec) / curRange.durSec));
        const curX = notePositionsRef.current[activeIdx] ?? 0;
        const nextX = (activeIdx + 1 < notePositionsRef.current.length)
                      ? notePositionsRef.current[activeIdx + 1]
                      : curX + 45;
        const smoothX = curX + (nextX - curX) * progress;
        setPlayheadX(smoothX);

        // Nhấp nháy đèn phách theo thời gian thực nếu máy chạy phách đang bật
        if (isMetronomeOnRef.current) {
          const beatsPerMeasure = parseInt(timeSig.split('/')[0], 10) || 4;
          const beat = Math.floor(elapsed / secondsPerBeat) % beatsPerMeasure;
          setCurrentBeatInBar(beat);
        }

        // Khi chuyển sang nốt mới: cập nhật màu nốt, phím đàn ảo và cuộn trang
        if (activeIdx !== currentActiveIndexRef.current) {
          currentActiveIndexRef.current = activeIdx;
          setCurrentIndex(activeIdx);
          setPressedKeys(new Set(song[activeIdx].midiNotes));
          updateNoteHighlights(activeIdx);

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
  }, [song, bpm, timeSig, loadSoundFont, stopAutoPlay, updateNoteHighlights, playMetronomeTick]);

  const resetToStart = useCallback(() => {
    stopAutoPlay();
    setCurrentIndex(0);
    keysUsedToAdvanceRef.current = new Set();
    updateNoteHighlights(0);
    if (notePositionsRef.current.length > 0) {
      setPlayheadX(notePositionsRef.current[0]);
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    if (!isMetronomeOnRef.current) {
      setCurrentBeatInBar(-1);
    }
  }, [stopAutoPlay, updateNoteHighlights]);

  // Bộ gõ nhịp độc lập (khi không chạy Auto Play)
  useEffect(() => {
    if (!isMetronomeOn || isPlaying) {
      if (!isPlaying) setCurrentBeatInBar(-1);
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
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
    }, 25);

    return () => {
      clearInterval(intervalId);
      if (!isPlayingRef.current) {
        setCurrentBeatInBar(-1);
      }
    };
  }, [isMetronomeOn, isPlaying, bpm, timeSig, playMetronomeTick]);

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
          bassData.push({ vexKey, isSharp, isFlat, solfege, finger });
        } else {
          trebleData.push({ vexKey, isSharp, isFlat, solfege, finger });
        }
      }

      const isTrebleGhost = trebleData.length === 0;
      const isBassGhost = bassData.length === 0;
      if (isTrebleGhost) trebleData.push({ vexKey: 'b/4', isSharp: false, isFlat: false, solfege: '', finger: null });
      if (isBassGhost) bassData.push({ vexKey: 'd/3', isSharp: false, isFlat: false, solfege: '', finger: null });

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
    } else {
      alert('Không nhận diện được hợp âm nào! Vui lòng nhập đúng định dạng, ví dụ: C4+E4+G4:h');
    }
  };

  // Parse bản nhạc mặc định lúc mới tải trang
  useEffect(() => {
    loadCustomSheet(EXERCISES[0].sheet);
    loadSoundFont();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopAutoPlay();
    };
  }, [stopAutoPlay]);

  // Đồng bộ keysUsedToAdvanceRef với pressedKeys để dọn dẹp các phím đã nhả
  useEffect(() => {
    const keysToKeep = new Set<number>();
    keysUsedToAdvanceRef.current.forEach(k => {
      if (pressedKeys.has(k)) keysToKeep.add(k);
    });
    keysUsedToAdvanceRef.current = keysToKeep;
  }, [pressedKeys]);

  // Logic kiểm tra bấm phím thủ công (khi tập tự do)
  useEffect(() => {
    if (isPlaying) return; // Nếu đang chạy tự động thì không check phím thủ công

    if (currentIndex < song.length) {
      const currentChord = song[currentIndex].midiNotes;
      const isChordSatisfied = currentChord.every((note: number) => pressedKeys.has(note));
      
      if (isChordSatisfied) {
        const isUsingOldPress = currentChord.every((note: number) => keysUsedToAdvanceRef.current.has(note));
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

  // Khởi tạo VexFlow để vẽ bản nhạc - CHỈ vẽ lại khi bản nhạc (song) hoặc số nhịp (timeSig) thay đổi
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; // Xóa trước khi vẽ lại

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    const staveWidth = Math.max(550, song.length * 55 + 80); 
    renderer.resize(staveWidth + 50, 250); 
    const context = renderer.getContext();
    context.setFont('Arial', 10, '').setBackgroundFillStyle('#eed');

    // Tạo khóa Sol (Treble)
    const trebleStave = new Stave(10, 20, staveWidth);
    trebleStave.addClef('treble').addTimeSignature(timeSig);
    trebleStave.setContext(context).draw();

    // Tạo khóa Fa (Bass)
    const bassStave = new Stave(10, 100, staveWidth);
    bassStave.addClef('bass').addTimeSignature(timeSig);
    bassStave.setContext(context).draw();

    // Nối 2 khóa bằng dấu ngoặc
    const brace = new StaveConnector(trebleStave, bassStave).setType(3);
    const lineLeft = new StaveConnector(trebleStave, bassStave).setType(1);
    const lineRight = new StaveConnector(trebleStave, bassStave).setType(6);
    brace.setContext(context).draw();
    lineLeft.setContext(context).draw();
    lineRight.setContext(context).draw();

    const trebleNotes: any[] = [];
    const bassNotes: any[] = [];

    song.forEach((chordData, index) => {
      // Tạo StaveNote cho khóa Sol
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

      // Tạo StaveNote cho khóa Fa
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

      // Nốt đầu tiên đánh dấu màu xanh, còn lại màu đen
      let color = index === 0 ? '#2196f3' : 'black';
      if (!chordData.isTrebleGhost) tNote.setStyle({ fillStyle: color, strokeStyle: color });
      if (!chordData.isBassGhost) bNote.setStyle({ fillStyle: color, strokeStyle: color });

      trebleNotes.push(tNote);
      bassNotes.push(bNote);
    });

    if (trebleNotes.length > 0) {
      Formatter.FormatAndDraw(context, trebleStave, trebleNotes);
    }
    if (bassNotes.length > 0) {
      Formatter.FormatAndDraw(context, bassStave, bassNotes);
    }

    // Lấy toạ độ X của từng nốt để làm playhead và vẽ vạch nhịp
    const positions: number[] = [];
    const svgEl = containerRef.current.querySelector('svg');

    trebleNotes.forEach((tNote, i) => {
      const x = tNote.getAbsoluteX();
      positions.push(x);

      // Vẽ vạch nhịp thực sự trên khuông nhạc nếu có đánh dấu vạch nhịp sau nốt này
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

    // Cập nhật vị trí playhead cho nốt đầu tiên
    if (positions.length > 0) {
      setPlayheadX(positions[0]);
    }
    updateNoteHighlights(0);
  }, [song, timeSig, updateNoteHighlights]);

  // Scroll tự động chạy theo nốt hiện tại khi tập đàn thủ công
  useEffect(() => {
    if (!isPlaying && notePositionsRef.current[currentIndex] !== undefined && scrollContainerRef.current) {
      const targetX = notePositionsRef.current[currentIndex];
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, targetX - scrollContainerRef.current.clientWidth / 3),
        behavior: 'smooth'
      });
    }
  }, [currentIndex, isPlaying]);



  // Handler MIDI Message
  const handleMidiMessage = useCallback((statusByte: number, note: number, velocity: number) => {
    const messageType = statusByte & 0xF0; // Bỏ qua channel (nhận mọi kênh 1 - 16)
    const isNoteOn = (messageType === 0x90 || statusByte === 144) && velocity > 0;
    const isNoteOff = messageType === 0x80 || statusByte === 128 || ((messageType === 0x90 || statusByte === 144) && velocity === 0);

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = noteNames[note % 12];
    const octave = Math.floor(note / 12) - 1;

    if (isNoteOn) {
      setLastMidiEvent(`${noteName}${octave} (Mã MIDI: ${note}, Lực: ${velocity})`);
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
      setMidiStatus('Trình duyệt của bạn không hỗ trợ Web MIDI API.');
    }

    function onMIDISuccess(midiAccess: any) {
      const attachListeners = () => {
        const devices: string[] = [];
        for (let input of midiAccess.inputs.values()) {
          devices.push(input.name || 'Thiết bị MIDI không tên');
          input.onmidimessage = handleGlobalMidi;
        }
        setMidiDevices(devices);
        if (devices.length > 0) {
          setMidiStatus(`Đã kết nối: ${devices.join(', ')}`);
        }
      };

      // Gắn bộ lắng nghe ngay lập tức khi mở trang (sửa lỗi thiết bị cắm sẵn không nhận tín hiệu)
      attachListeners();

      // Lắng nghe sự kiện cắm/rút thiết bị sau đó
      midiAccess.onstatechange = () => {
        attachListeners();
      };
    }

    function onMIDIFailure() {
      setMidiStatus('Không thể truy cập thiết bị MIDI. Hãy kiểm tra quyền trên trình duyệt.');
    }
  }, [handleGlobalMidi]);

  // Map PC keyboard keys to MIDI notes
  const keyToMidi: Record<string, number> = {
    // Octave 3
    'z': 48, 's': 49, 'x': 50, 'd': 51, 'c': 52, 'v': 53, 'g': 54, 'b': 55, 'h': 56, 'n': 57, 'j': 58, 'm': 59,
    // Octave 4
    'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71, 'i': 72, '9': 73, 'o': 74, '0': 75, 'p': 76,
  };
  const midiToKey: Record<number, string> = {};
  Object.entries(keyToMidi).forEach(([k, v]) => { midiToKey[v] = k; });

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

  // Tạo mảng 88 phím đàn piano (từ MIDI 21 đến 108)
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keys = [];
  for (let note = 21; note <= 108; note++) {
    const octave = Math.floor(note / 12) - 1;
    const nameIndex = note % 12;
    const name = noteNames[nameIndex];
    const isBlack = name.includes('#');
    keys.push({
      note,
      label: `${name}${octave}`,
      isBlack,
    });
  }

  // Tự động cuộn đến phím C4 (giữa đàn) khi tải trang
  const keyboardScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (keyboardScrollRef.current) {
      // Chiều rộng phím trắng là 30px. C4 là phím thứ 40 (trắng 24).
      keyboardScrollRef.current.scrollLeft = 500;
    }
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }} onClick={loadSoundFont}>
      <h1>Piano Practice Clone</h1>
      
      <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
        <strong>Trạng thái MIDI:</strong> <span style={{ color: 'green' }}>{midiStatus}</span>
        <br />
        <strong>Thiết bị kết nối:</strong>
        {midiDevices.length > 0 ? (
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {midiDevices.map((dev, idx) => <li key={idx}>🎹 {dev}</li>)}
          </ul>
        ) : (
          <span style={{ color: 'gray', marginLeft: '5px' }}>Chưa tìm thấy đàn MIDI nào (Vẫn có thể dùng chuột).</span>
        )}
        {lastMidiEvent && (
          <div style={{ marginTop: '8px', padding: '6px 10px', background: '#e8f5e9', borderRadius: '4px', color: '#2e7d32', fontWeight: 'bold', display: 'block' }}>
            📡 Tín hiệu phím đàn vừa nhận: {lastMidiEvent}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 15 }}>
        <h3>Chọn bài tập từ giáo trình:</h3>
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
          style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {EXERCISES.map((ex, index) => (
            <option key={index} value={index}>{ex.name} ({ex.timeSig})</option>
          ))}
        </select>

        <h3>Hoặc tự nhập bản nhạc của bạn:</h3>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
          <label><strong>Nhịp:</strong></label>
          <input 
            type="text" 
            value={timeSig}
            onChange={(e) => setTimeSig(e.target.value)}
            style={{ width: '50px', padding: '5px', fontSize: '14px', textAlign: 'center' }}
          />
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, padding: '8px', fontSize: '16px' }}
            placeholder="Ví dụ: C4:q D4:q E4:h | C4+E4+G4:w"
          />
          <button onClick={() => loadCustomSheet(inputText)} style={{ padding: '8px 15px', fontSize: '16px' }}>Tạo bản nhạc</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#e3f2fd', padding: '12px 16px', borderRadius: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label><strong>Tempo (BPM):</strong></label>
            <input 
              type="number" 
              value={bpm}
              min="30"
              max="240"
              onChange={(e) => {
                const val = parseInt(e.target.value) || 90;
                setBpm(val);
                if (isPlaying) {
                  stopAutoPlay();
                }
              }}
              style={{ width: '65px', padding: '6px', fontSize: '15px', textAlign: 'center', borderRadius: '4px', border: '1px solid #90caf9' }}
            />
          </div>

          {/* Thanh chỉnh âm lượng (Có chế độ khuếch đại Boost to ngang YouTube) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '5px 12px', borderRadius: '6px', border: '1px solid #90caf9' }}>
            <span style={{ fontSize: '16px' }}>{volume === 0 ? '🔇' : volume < 100 ? '🔉' : '🔊'}</span>
            <label style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Âm lượng:</label>
            <input 
              type="range"
              min="0"
              max="200"
              step="5"
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              style={{ width: '85px', cursor: 'pointer', accentColor: '#1976d2' }}
              title={`Âm lượng: ${volume}% (Kéo trên 100% để khuếch đại to ngang YouTube)`}
            />
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: volume > 100 ? '#e65100' : '#333', minWidth: '48px', whiteSpace: 'nowrap' }}>
              {volume}% {volume > 100 ? '⚡' : ''}
            </span>
          </div>

          {/* Máy chạy phách (Metronome) có nút Bật / Tắt và đèn LED phách */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '5px 12px', borderRadius: '6px', border: '1px solid #90caf9' }}>
            <button
              onClick={async () => {
                const willBeOn = !isMetronomeOn;
                if (willBeOn) {
                  if (!audioCtxRef.current) {
                    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                  }
                  if (audioCtxRef.current.state === 'suspended') {
                    await audioCtxRef.current.resume();
                  }
                } else {
                  scheduledMetronomeNodesRef.current.forEach(node => {
                    try { node?.stop?.(); } catch (e) {}
                  });
                  scheduledMetronomeNodesRef.current = [];
                  setCurrentBeatInBar(-1);
                }
                setIsMetronomeOn(willBeOn);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: isMetronomeOn ? '#ff9800' : '#eceff1',
                color: isMetronomeOn ? '#fff' : '#455a64',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s ease',
                boxShadow: isMetronomeOn ? '0 2px 4px rgba(255,152,0,0.3)' : 'none'
              }}
            >
              {isMetronomeOn ? '🔔 Máy gõ phách: BẬT' : '🔕 Máy gõ phách: TẮT'}
            </button>

            {/* Đèn LED nhấp nháy theo từng phách trong ô nhịp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {Array.from({ length: parseInt(timeSig.split('/')[0], 10) || 4 }).map((_, idx) => {
                const isCurrent = currentBeatInBar === idx;
                const isDownbeat = idx === 0;
                const activeColor = isDownbeat ? '#f44336' : '#2e7d32';
                return (
                  <div
                    key={idx}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent ? activeColor : (isMetronomeOn ? '#cfd8dc' : '#eceff1'),
                      color: isCurrent ? '#fff' : (isMetronomeOn ? '#37474f' : '#90a4ae'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: isCurrent ? `0 0 10px ${activeColor}` : 'none',
                      transform: isCurrent ? 'scale(1.25)' : 'scale(1)',
                      transition: 'all 0.08s ease'
                    }}
                    title={`Phách ${idx + 1} (${isDownbeat ? 'Phách mạnh - Ting' : 'Phách nhẹ - Tách'})`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                if (isPlaying) {
                  stopAutoPlay();
                } else {
                  startAutoPlay();
                }
              }} 
              style={{ 
                padding: '9px 20px', fontSize: '15px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: isPlaying ? '#d32f2f' : '#2e7d32', color: 'white', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}
            >
              {isPlaying ? '⏹ Dừng nghe thử' : '▶ Chạy mẫu theo nhịp (Auto Play)'}
            </button>

            <button
              onClick={resetToStart}
              style={{
                padding: '9px 15px', fontSize: '15px', border: '1px solid #90caf9', borderRadius: '6px',
                background: '#fff', color: '#1565c0', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              ⏮ Về đầu bài
            </button>
          </div>

          <span style={{ fontSize: '13px', color: '#555', fontStyle: 'italic', marginLeft: 'auto' }}>
            {isPlaying ? '⚡ Âm thanh Web Audio thời gian thực, nhịp phách liền mạch không trễ' : '💡 Bật máy gõ phách để tập giữ nhịp hoặc bấm Chạy mẫu để nghe giai điệu'}
          </span>
        </div>

        <details style={{ background: '#f9f9f9', padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', margin: '15px 0', cursor: 'pointer' }}>
          <summary style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
            📖 Xem hướng dẫn chi tiết cách tự gõ bản nhạc
          </summary>
          <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '1.6', color: '#444' }}>
            <p style={{ margin: '0 0 10px 0' }}>Hệ thống tự động phân chia nốt giữa tay trái (Khóa Fa) và tay phải (Khóa Sol) dựa vào độ cao. Nốt thấp hơn <strong>C4</strong> (Đô giữa) sẽ tự nhảy xuống Khóa Fa.</p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '6px' }}><strong>Nốt đơn:</strong> Gõ tên nốt kèm số quãng (C, D, E, F, G, A, B). Thêm <code>#</code> nếu là nốt thăng. <br/>Ví dụ: <code>C4</code> (Đô giữa), <code>F#4</code> (Fa thăng), <code>G3</code> (Sol thấp).
                <br/><em>Mẹo: Bạn có thể thêm số ngón tay trong ngoặc tròn, ví dụ: <code>C4(1)</code>, <code>F4(4)</code>. Tên nốt (Đô, Rê, Mi) sẽ luôn tự động hiển thị bên dưới!</em>
              </li>
              <li style={{ marginBottom: '6px' }}><strong>Hợp âm (đánh nhiều phím cùng lúc):</strong> Dùng dấu <code>+</code> để nối các nốt lại.<br/>Ví dụ: <code>C4+E4+G4</code> (Hợp âm Đô trưởng tay phải), <code>C3+G3+C4</code> (Tay trái).</li>
              <li style={{ marginBottom: '6px' }}><strong>Trường độ (độ dài của nốt/hợp âm):</strong> Thêm dấu <code>:</code> theo sau. Nếu không ghi, mặc định là nốt Đen.
                <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '5px' }}>
                  <li><code>:w</code> - Nốt tròn (Whole - 4 phách)</li>
                  <li><code>:h</code> - Nốt trắng (Half - 2 phách)</li>
                  <li><code>:q</code> - Nốt đen (Quarter - 1 phách)</li>
                  <li><code>:8</code> - Nốt móc đơn (Eighth - 1/2 phách)</li>
                  <li><code>:16</code> - Nốt móc kép (Sixteenth - 1/4 phách)</li>
                  <li><em>Mẹo: Thêm dấu chấm <code>.</code> (ví dụ <code>:h.</code>) để tăng độ dài thêm một nửa (nốt chấm dôi).</em></li>
                </ul>
              </li>
              <li><strong>Vạch nhịp:</strong> Gõ ký tự <code>|</code> (dấu gạch đứng) để vẽ vạch phân cách các ô nhịp.</li>
            </ul>
            <div style={{ background: '#fff', padding: '10px', borderLeft: '4px solid #2196f3', marginTop: '15px', borderRadius: '4px' }}>
              <strong>Ví dụ (bạn có thể copy paste thử):</strong><br/>
              <code>C3+C4:q C4:q G4:q G4:q | F3+A4:q A4:q C3+G4:h</code>
            </div>
          </div>
        </details>
      </div>

      <div 
        ref={scrollContainerRef}
        style={{ overflowX: 'auto', maxWidth: '100vw', position: 'relative' }}
      >
        <div ref={containerRef} style={{ border: '1px solid #ccc', display: 'inline-block', marginBottom: 20, background: '#fff' }} />
        {playheadX !== null && (
          <div 
            style={{
              position: 'absolute',
              top: 15,
              bottom: 35,
              left: playheadX,
              width: '2px',
              backgroundColor: '#f44336',
              boxShadow: '0 0 8px rgba(244, 67, 54, 0.8)',
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
              borderTop: '8px solid #f44336',
              marginLeft: '-4px'
            }} />
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0' }}>Bàn phím 88 phím (A0 - C8)</h3>
            <span style={{ fontSize: '13px', color: '#666' }}>
              {isPlaying ? '🎵 Đang chạy mẫu biểu diễn theo nhịp phách...' : 'Tập đánh phím theo nốt màu xanh trên khuông nhạc và phím gợi ý'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '30px', paddingRight: '20px' }}>
            <HandIcon isLeft={true} activeFingers={activeLeftFingers} label="Tay Trái" />
            <HandIcon isLeft={false} activeFingers={activeRightFingers} label="Tay Phải" />
          </div>
        </div>
        
        {/* Bọc trong một div có thanh cuộn ngang */}
        <div 
          ref={keyboardScrollRef}
          style={{ 
            width: '100%', 
            overflowX: 'auto', 
            paddingBottom: 20,
            whiteSpace: 'nowrap',
            display: 'block'
          }}
        >
          <div style={{ display: 'inline-flex', position: 'relative', height: 150 }}>
            {keys.map((k) => (
              <div
                key={k.note}
                onMouseDown={() => {
                  handleMidiMessage(144, k.note, 80);
                }}
                onMouseUp={() => {
                  handleMidiMessage(128, k.note, 0);
                }}
                onMouseLeave={() => {
                  handleMidiMessage(128, k.note, 0);
                }}
                style={{
                  width: k.isBlack ? 20 : 30, // Chỉnh nhỏ lại một chút
                  height: k.isBlack ? 90 : 150,
                  background: pressedKeys.has(k.note) ? '#4caf50' : (targetNotes.includes(k.note) ? (k.isBlack ? '#f57c00' : '#ffcc80') : (k.isBlack ? '#333' : '#fff')),
                  border: '1px solid #333',
                  marginLeft: k.isBlack ? -10 : 0,
                  marginRight: k.isBlack ? -10 : 0,
                  zIndex: k.isBlack ? 1 : 0,
                  color: k.isBlack ? '#fff' : '#000',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 5,
                  cursor: 'pointer',
                  borderRadius: '0 0 4px 4px',
                  userSelect: 'none',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: (k.label.includes('C') || targetNotes.includes(k.note)) ? 1 : 0 }}>
                  {currentFingeringMap[k.note] && (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ff5722', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>
                      {currentFingeringMap[k.note]}
                    </div>
                  )}
                  {targetNotes.includes(k.note) && !currentFingeringMap[k.note] && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'red', marginBottom: 2 }} />}
                  <span style={{ fontSize: 10 }}>{k.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
