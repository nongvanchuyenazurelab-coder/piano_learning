import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer, Stave, StaveNote, Formatter, Accidental, StaveConnector, Dot, Annotation } from 'vexflow';
// @ts-ignore
import Soundfont from 'soundfont-player';


const EXERCISES = [
  {
    name: "Bài tập 1 (Mức độ 1) - Tách tay",
    timeSig: "4/4",
    sheet: "E4(3):q E4(3):q F4(4):q G4(5):q | G4(5):q F4(4):q E4(3):q D4(2):q | C4(1):q C4(1):q D4(2):q E4(3):q | E4(3):h D4(2):h | E3(3):q E3(3):q F3(2):q G3(1):q | G3(1):q F3(2):q E3(3):q D3(4):q | C3(5):q C3(5):q D3(4):q E3(3):q | D3(4):h C3(5):h"
  },
  {
    name: "Bài tập 2 (Mức độ 1) - Tách tay có nhịp lẻ",
    timeSig: "4/4",
    sheet: "C3(5):q C3(5):q F3(2):h | F3(2):q G3(1):q C5(5):q A4(1):q | E4(3):q E4(3):q D4(4):h | E4(3):8 D4(2):8 C4(1):q C4(1):8 C4(1):8 C4(1):8 C4(1):8 | D4(2):q E4(3):q D4(2):h | E4(3):q D4(2):8 C4(1):8 C4(1):h | C4(1):8 C4(1):8 C4(1):8 C4(1):8 D4(2):q E4(3):q | D4(2):h C4(1):h"
  },
  {
    name: "Bài tập 3 (Mức độ 2) - Nối 2 tay (Nhịp 3/4)",
    timeSig: "3/4",
    sheet: "G3(3):q G3(3):q A3(2):q | G3(3):h C5(1):q | B3(2):h. | G4(3):q G4(3):q A4(4):q | G4(3):h D5(2):q | C5(1):h. | G4(3):q E4(2):q C4(1):q | B3(2):h A3(3):q | F3(4):q F3(4):q E4(3):q | C5(5):q D5(4):q C5(5):h"
  },
  {
    name: "Bài tập 4 (Mức độ 2) - Giai điệu luân phiên",
    timeSig: "4/4",
    sheet: "C3(5):q G3(1):q C4(5):q E4(3):q | G2(5):q D3(1):q G3(5):q B3(3):q | A2(5):q E3(1):q A3(5):q C4(3):q | E2(5):q B2(1):q E3(5):q G3(3):q | F2(5):q C3(1):q F3(5):q A3(3):q | C3(5):q G3(1):q C4(5):q E4(3):q | F2(5):q C3(1):q F3(5):q A3(3):q | G2(5):q D3(1):q G3(5):q B3(3):q | C3(5):w"
  },
  {
    name: "Bài tập 5 (Mức độ 3) - Luân phiên nhanh",
    timeSig: "4/4",
    sheet: "C4(1):q D4(2):q E4(3):q C4(1):q | E4(3):q F4(4):q G4(5):h | C5(1):q D5(2):q E5(3):q C5(1):q | E5(3):q F5(4):q G5(5):h | G4(5):q F4(4):q E4(3):q C4(1):q | C4(1):q C4(1):q C4(1):q C4(1):q | G3(1):q F3(2):q E3(3):q C3(5):q | G3(1):q G3(1):q G3(1):q G3(1):q"
  },
  {
    name: "Bài tùy chọn (Nhập bên dưới)",
    timeSig: "4/4",
    sheet: "C3+C4(1):q C4(2):q G4(5):q G4(5):q | F3+A4(4):q A4(4):q C3+G4(5):h | F4(4):q F4(4):q C3+E4(3):q E4(3):q | G3+D4(2):q D4(2):q C3+C4(1):h"
  },
  {
    name: "Romance (Đoạn 1 - Bản luyện ghép tay)",
    timeSig: "3/4",
    sheet: "D3+F3+A3+A4(5):q A4(5):q A4(5):q | D3+F3+A3+A4(5):q G4(4):q F4(3):q | D3+F3+A3+F4(3):q E4(2):q D4(1):q | D3+F3+A3+D4(1):q F4(3):q A4(5):q | G2+Bb2+D3+D5(5):q D5(5):q D5(5):q | A2+C#3+E3+D5(5):q C5(4):q Bb4(3):q | D3+F3+A3+Bb4(3):q A4(2):q G4(1):q | D3+F3+A3+G4(1):q A4(2):q Bb4(3):q | A2+C#3+E3+A4(4):q G4(3):q F4(2):q | A2+C#3+E3+C#5(5):q D5(5):q E5(5):q | D3+F3+A3+D5(5):q D5(5):q D5(5):q | D3+F3+A3+D5(5):q C5(4):q Bb4(3):q | A2+C#3+E3+Bb4(3):q A4(2):q G4(1):q | D3+F3+A3+F4(3):q E4(2):q D4(1):q | A2+C#3+E3+E4(2):q F4(3):q E4(2):q | D3+F3+A3+D4(1):h."
  },
  {
    name: "Romance (Đoạn 1 - Rải Arpeggio chuẩn theo Sheet)",
    timeSig: "3/4",
    sheet: "D3+A4(5):8 F3:8 A3+A4(5):8 D3:8 F3+A4(5):8 A3:8 | D3+A4(5):8 F3:8 A3+G4(4):8 D3:8 F3+F4(3):8 A3:8 | D3+F4(3):8 F3:8 A3+E4(2):8 D3:8 F3+D4(1):8 A3:8 | D3+D4(1):8 F3:8 A3+F4(3):8 D3:8 F3+A4(5):8 A3:8 | G2+D5(5):8 Bb2:8 D3+D5(5):8 G2:8 Bb2+D5(5):8 D3:8 | A2+D5(5):8 C#3:8 E3+C5(4):8 A2:8 C#3+Bb4(3):8 E3:8 | D3+Bb4(3):8 F3:8 A3+A4(2):8 D3:8 F3+G4(1):8 A3:8 | D3+G4(1):8 F3:8 A3+A4(2):8 D3:8 F3+Bb4(3):8 A3:8 | A2+A4(4):8 C#3:8 E3+G4(3):8 A2:8 C#3+F4(2):8 E3:8 | A2+C#5(5):8 C#3:8 E3+D5(5):8 A2:8 C#3+E5(5):8 E3:8 | D3+D5(5):8 F3:8 A3+D5(5):8 D3:8 F3+D5(5):8 A3:8 | D3+D5(5):8 F3:8 A3+C5(4):8 D3:8 F3+Bb4(3):8 A3:8 | A2+Bb4(3):8 C#3:8 E3+A4(2):8 A2:8 C#3+G4(1):8 E3:8 | D3+F4(3):8 F3:8 A3+E4(2):8 D3:8 F3+D4(1):8 A3:8 | A2+E4(2):8 C#3:8 E3+F4(3):8 A2:8 C#3+E4(2):8 E3:8 | D3+D4(1):h."
  },
  {
    name: "Romance (Đoạn 2 - Rê trưởng - Trang 2)",
    timeSig: "3/4",
    sheet: "D3+F#3+A3+F#4(3):q F#4(3):q F#4(3):q | D3+F#3+A3+F#4(3):q E4(2):q D4(1):q | G2+B2+D3+D4(1):q C#4(2):q B3(1):q | E2+G#2+B2+B3(1):q A#3(1):q B3(1):q | G2+B2+D3+B4(5):q B4(5):q B4(5):q | G2+B2+D3+B4(5):q D5(5):q B4(5):q | D3+F#3+A3+B4(5):q A4(4):q G4(3):q | D3+F#3+A3+G4(3):q F#4(2):q E4(1):q | D3+F#3+A3+F#4(2):q F#4(2):q F#4(2):q | D3+F#3+A3+F#4(2):q E4(1):q C4(1):q | G2+B2+D3+B3(1):q C#4(2):q D4(3):q | G2+B2+D3+D4(3):q E4(4):q F#4(5):q | D3+F#3+A3+F#4(3):q E4(2):q D4(1):q | G2+B2+D3+D4(1):q C#4(2):q B3(1):q | A2+C#3+E3+A3(1):q C#4(2):q E4(3):q | D3+F#3+A3+D4(1):h."
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
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadX, setPlayheadX] = useState<number | null>(null);
  const lastPlayedIndexRef = useRef(-1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const notePositionsRef = useRef<number[]>([]);
  const keysUsedToAdvanceRef = useRef<Set<number>>(new Set());

  const [song, setSong] = useState<any[]>([]);

  const playNoteSound = useCallback((midiNote: number, velocity: number = 80) => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    if (instrumentRef.current) {
      const gain = velocity / 127;
      instrumentRef.current.play(midiNote, audioCtxRef.current?.currentTime, { gain });
    }
  }, []);

  const loadSoundFont = useCallback(async () => {
    if (isLoaded) return;
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    setMidiStatus('Đang tải âm thanh piano thật (vài MB)...');
    try {
      const inst = await Soundfont.instrument(audioCtxRef.current, 'acoustic_grand_piano');
      instrumentRef.current = inst;
      setIsLoaded(true);
      setMidiStatus('Tải xong âm thanh! Hãy thử bấm phím.');
    } catch (e) {
      setMidiStatus('Lỗi khi tải âm thanh.');
    }
  }, [isLoaded]);

  const loadCustomSheet = (textToParseInput?: any, timeSignature = timeSig) => {
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
    
    let validNotes = 0;
    const parsedSong = tokens.map((token: string) => {
      if (token === '|') return { isBarline: true };

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
        return null;
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

      validNotes++;

      return {
        trebleData, bassData,
        isTrebleGhost, isBassGhost, midiNotes, duration: durationStr, hasDot, fingerings
      };
    }).filter(Boolean);

    if (validNotes > 0) {
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

  // Logic Auto Play
  useEffect(() => {
    if (!isPlaying) {
      lastPlayedIndexRef.current = -1;
      return;
    }
    
    if (currentIndex >= song.length) {
      setIsPlaying(false); // Chạy hết bài thì dừng
      setPressedKeys(new Set()); // Xoá phím khi chạy xong
      return;
    }

    const currentItem = song[currentIndex];
    let waitTime = 0;

    if (currentItem.isBarline) {
      waitTime = 10; // Bỏ qua vạch nhịp thật nhanh
    } else {
      // Đảm bảo không phát lặp lại nốt hiện tại khi re-render
      if (lastPlayedIndexRef.current !== currentIndex) {
        setPressedKeys(new Set(currentItem.midiNotes)); // Đổi màu phím ảo
        currentItem.midiNotes.forEach((note: number) => {
          playNoteSound(note, 80);
        });
        lastPlayedIndexRef.current = currentIndex;
      }

      // Tính thời gian chờ (ms) dựa trên tempo
      const durationMap: Record<string, number> = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25 };
      let beats = durationMap[currentItem.duration] || 1;
      if (currentItem.hasDot) beats *= 1.5;
      waitTime = beats * (60000 / bpm);
    }

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, waitTime);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, song, bpm, playNoteSound]);

  // Đồng bộ keysUsedToAdvanceRef với pressedKeys để dọn dẹp các phím đã nhả
  useEffect(() => {
    const keysToKeep = new Set<number>();
    keysUsedToAdvanceRef.current.forEach(k => {
      if (pressedKeys.has(k)) keysToKeep.add(k);
    });
    keysUsedToAdvanceRef.current = keysToKeep;
  }, [pressedKeys]);

  // Logic kiểm tra bấm phím thủ công
  useEffect(() => {
    if (isPlaying) return; // Nếu đang chạy tự động thì không check phím thủ công

    if (currentIndex < song.length) {
      if (song[currentIndex].isBarline) {
        setCurrentIndex(prev => prev + 1);
        return;
      }
      
      const currentChord = song[currentIndex].midiNotes;
      const isChordSatisfied = currentChord.every((note: number) => pressedKeys.has(note));
      
      if (isChordSatisfied) {
        const isUsingOldPress = currentChord.every((note: number) => keysUsedToAdvanceRef.current.has(note));
        if (!isUsingOldPress) {
          currentChord.forEach((n: number) => keysUsedToAdvanceRef.current.add(n));
          setCurrentIndex(prev => prev + 1);
        }
      }
    }
  }, [pressedKeys, currentIndex, song, isPlaying]);

  // Khởi tạo VexFlow để vẽ bản nhạc, nó sẽ chạy lại mỗi khi currentIndex hoặc song thay đổi
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ''; // Xóa trước khi vẽ lại

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    const staveWidth = Math.max(550, song.length * 50 + 50); 
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
      if (chordData.isBarline) {
        // VexFlow 4 không hỗ trợ BarNote trực tiếp trong Formatter.FormatAndDraw
        // Nên tạm thời ta bỏ qua không vẽ vạch nhịp, hệ thống vẫn xử lý đúng nhịp điệu
        return;
      }

      // Tạo StaveNote cho khóa Sol
      const tNote = new StaveNote({ clef: 'treble', keys: chordData.trebleData.map((d: any) => d.vexKey), duration: chordData.duration + (chordData.hasDot ? 'd' : '') });
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
      
      // Đổi màu tùy theo trạng thái
      let color = 'black';
      if (index < currentIndex) color = '#4caf50';
      else if (index === currentIndex) color = '#2196f3';
      
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

    // Lấy toạ độ X của từng nốt để làm playhead
    const positions: number[] = [];
    let tIndex = 0;
    song.forEach((chordData) => {
      if (chordData.isBarline) {
        positions.push(tIndex > 0 ? trebleNotes[tIndex - 1].getAbsoluteX() + 30 : 0);
      } else {
        if (trebleNotes[tIndex]) {
          positions.push(trebleNotes[tIndex].getAbsoluteX());
        } else {
          positions.push(0);
        }
        tIndex++;
      }
    });
    notePositionsRef.current = positions;
    
    // Cập nhật ngay vị trí playhead cho nốt hiện tại
    if (currentIndex < positions.length) {
      setPlayheadX(positions[currentIndex]);
    }
  }, [currentIndex, song, timeSig]);

  // Scroll tự động chạy theo playhead
  useEffect(() => {
    if (playheadX !== null && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, playheadX - scrollContainerRef.current.clientWidth / 3),
        behavior: 'smooth'
      });
    }
  }, [playheadX]);



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

  const targetNotes = (!isPlaying && currentIndex < song.length && !song[currentIndex]?.isBarline) 
                      ? song[currentIndex].midiNotes 
                      : [];

  const activeLeftFingers = new Set<string>();
  const activeRightFingers = new Set<string>();
  const currentFingeringMap: Record<number, string> = {};

  if (!isPlaying && currentIndex < song.length && !song[currentIndex]?.isBarline) {
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
      // Chiều rộng phím trắng là 30px (ví dụ thế). C4 là phím thứ 40 (trắng 24).
      // Nhưng ta có thể dùng scrollLeft một cách tương đối
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#e3f2fd', padding: '10px', borderRadius: '8px' }}>
          <label><strong>Tempo (BPM):</strong></label>
          <input 
            type="number" 
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
            style={{ width: '60px', padding: '5px', fontSize: '14px', textAlign: 'center' }}
          />
          <button 
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
                setPressedKeys(new Set()); // Tắt màu phím khi dừng
              } else {
                if (!instrumentRef.current) {
                  alert("Vui lòng tải âm thanh piano trước!");
                  return;
                }
                setCurrentIndex(0);
                setIsPlaying(true);
              }
            }} 
            style={{ 
              padding: '8px 15px', fontSize: '16px', border: 'none', borderRadius: '4px', cursor: 'pointer',
              background: isPlaying ? '#f44336' : '#4caf50', color: 'white', fontWeight: 'bold'
            }}
          >
            {isPlaying ? '⏹ Dừng phát' : '▶ Chạy mẫu (Auto Play)'}
          </button>
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
              top: 20,
              bottom: 40,
              left: playheadX,
              width: '2px',
              backgroundColor: 'rgba(255, 0, 0, 0.6)',
              boxShadow: '0 0 8px rgba(255, 0, 0, 0.8)',
              transition: 'left 0.1s linear',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <h3>Bàn phím 88 phím (A0 - C8)</h3>
          {!isPlaying && (
            <div style={{ display: 'flex', gap: '40px', paddingRight: '20px' }}>
              <HandIcon isLeft={true} activeFingers={activeLeftFingers} label="Tay Trái" />
              <HandIcon isLeft={false} activeFingers={activeRightFingers} label="Tay Phải" />
            </div>
          )}
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
