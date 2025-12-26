
import React, { useEffect, useState, useCallback } from 'react';
import {
   Clock, Cloud, Search, CheckCircle, Flame, Droplets,
   Globe, Hash, MessageSquare, BookOpen, Quote,
   Settings, Battery, AlertCircle, RefreshCw,
   Code, Monitor, Zap, LayoutGrid, Calendar,
   Calculator, Scissors, Type, ShieldCheck, HardDrive,
   Smartphone, Copy, Check, X, GripVertical, TrendingUp, TrendingDown,
   Timer, Palette, FileCode, Link, Play, Pause, RotateCcw, Target, Plus, Trash2,
   Sun, Moon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, User, Menu
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchWeather, fetchMarketData, getVisitorIpInfo } from '../services/api';
import { Shortcut, WeatherData, CryptoData, MarketData, VisitorInfo, Todo, Dday, Habit, CodeSnippet } from '../types';
import Modal from '../components/Modal';

const ORIGINAL_SHORTCUTS: Shortcut[] = [
   { label: '네이버', url: 'https://www.naver.com', icon: 'https://www.google.com/s2/favicons?domain=naver.com&sz=64' },
   { label: '구글', url: 'https://www.google.com', icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64' },
   { label: '유튜브', url: 'https://www.youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
   { label: 'ChatGPT', url: 'https://chatgpt.com', icon: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64' },
   { label: 'Gemini', url: 'https://gemini.google.com', icon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64' },
   { label: 'Claude', url: 'https://claude.ai', icon: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64' },
   { label: 'Perplexity', url: 'https://www.perplexity.ai', icon: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64' },
   { label: '쿠팡', url: 'https://www.coupang.com', icon: 'https://www.google.com/s2/favicons?domain=coupang.com&sz=64' },
   { label: '심플노트', url: 'https://app.simplenote.com/login', icon: 'https://www.google.com/s2/favicons?domain=simplenote.com&sz=64' },
   { label: '노션', url: 'https://www.notion.so', icon: 'https://www.google.com/s2/favicons?domain=notion.so&sz=64' },
];

// Sortable Todo Item Component
interface SortableItemProps {
   todo: Todo;
   onToggle: (id: string) => void;
   onDelete: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ todo, onToggle, onDelete }) => {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
   } = useSortable({ id: todo.id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
   };

   return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2 group bg-white p-2 rounded-lg hover:bg-slate-50 transition-colors">
         <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none">
            <GripVertical size={16} />
         </button>
         <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
         />
         <span className={`flex-grow text-sm ${todo.completed ? 'line-through text-slate-300' : 'text-slate-600'}`}>
            {todo.text}
         </span>
         <button
            onClick={() => onDelete(todo.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
         >
            <X size={16} />
         </button>
      </div>
   );
};

const Home: React.FC = () => {
   const [time, setTime] = useState(new Date());
   const [weather, setWeather] = useState<{ seoul: WeatherData | null, busan: WeatherData | null }>({ seoul: null, busan: null });
   const [marketData, setMarketData] = useState<{ usd: MarketData, kospi: MarketData, btc: CryptoData, eth: CryptoData } | null>(null);
   const [visitor, setVisitor] = useState<VisitorInfo | null>(null);
   const [todos, setTodos] = useState<Todo[]>(() => JSON.parse(localStorage.getItem('todos') || '[]'));
   const [note, setNote] = useState(() => localStorage.getItem('quick_note') || '');
   const [pomo, setPomo] = useState(1500);
   const [isPomoActive, setIsPomoActive] = useState(false);
   const [activeModal, setActiveModal] = useState<string | null>(null);
   const [batt, setBatt] = useState<string>('...');

   // 도구 전용 상태
   const [jsonInput, setJsonInput] = useState('');
   const [pwResult, setPwResult] = useState('');
   const [wordInput, setWordInput] = useState('');
   const [calcInput, setCalcInput] = useState('');
   const [copied, setCopied] = useState(false);

   // 스톱워치 상태
   const [stopwatch, setStopwatch] = useState(0);
   const [isStopwatchActive, setIsStopwatchActive] = useState(false);
   const [laps, setLaps] = useState<number[]>([]);

   // D-day 상태
   const [ddays, setDdays] = useState<Dday[]>(() => JSON.parse(localStorage.getItem('ddays') || '[]'));
   const [newDdayTitle, setNewDdayTitle] = useState('');
   const [newDdayDate, setNewDdayDate] = useState('');

   // 색상 피커 상태
   const [pickerColor, setPickerColor] = useState('#7b68ee');
   const [savedColors, setSavedColors] = useState<string[]>(() => JSON.parse(localStorage.getItem('savedColors') || '[]'));

   // Base64 상태
   const [base64Input, setBase64Input] = useState('');
   const [base64Output, setBase64Output] = useState('');
   const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

   // URL 인코더 상태
   const [urlInput, setUrlInput] = useState('');
   const [urlOutput, setUrlOutput] = useState('');
   const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');

   // 코드 스니펫 상태
   const [snippets, setSnippets] = useState<CodeSnippet[]>(() => JSON.parse(localStorage.getItem('snippets') || '[]'));
   const [newSnippetTitle, setNewSnippetTitle] = useState('');
   const [newSnippetCode, setNewSnippetCode] = useState('');
   const [newSnippetLang, setNewSnippetLang] = useState('javascript');

   // 습관 트래커 상태
   const [habits, setHabits] = useState<Habit[]>(() => JSON.parse(localStorage.getItem('habits') || '[]'));
   const [newHabitName, setNewHabitName] = useState('');

   // 다크 모드 상태 (시간 기반 기본값 적용)
   const [isDarkMode, setIsDarkMode] = useState(() => {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return JSON.parse(saved);
      const hour = new Date().getHours();
      return hour >= 18 || hour < 6; // 저녁 6시 ~ 아침 6시는 다크 모드 기본
   });

   // 달력 상태
   const [calendarDate, setCalendarDate] = useState(new Date());

   // 방문자 카운터 상태
   const [visitorCount, setVisitorCount] = useState(() => {
      const today = new Date().toDateString();
      const stored = JSON.parse(localStorage.getItem('visitorData') || '{"today":0,"total":0,"lastDate":""}');
      if (stored.lastDate !== today) {
         return { today: 1, total: stored.total + 1, lastDate: today };
      }
      return stored;
   });

   // 스크롤 버튼 표시 상태
   const [showScrollBtn, setShowScrollBtn] = useState(false);

   // 모바일 사이드바 상태
   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

   // Drag and drop sensors
   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   );

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
         setTodos((items) => {
            const oldIndex = items.findIndex((t) => t.id === active.id);
            const newIndex = items.findIndex((t) => t.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
         });
      }
   };

   const deleteTodo = (id: string) => {
      setTodos(todos.filter(t => t.id !== id));
   };

   useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      fetchWeather('Seoul').then(d => setWeather(prev => ({ ...prev, seoul: d })));
      fetchWeather('Busan').then(d => setWeather(prev => ({ ...prev, busan: d })));
      fetchMarketData().then(setMarketData);
      getVisitorIpInfo().then(setVisitor);

      if ((navigator as any).getBattery) {
         (navigator as any).getBattery().then((b: any) => setBatt(`${Math.round(b.level * 100)}%`));
      }
      return () => clearInterval(timer);
   }, []);

   useEffect(() => {
      localStorage.setItem('todos', JSON.stringify(todos));
      localStorage.setItem('quick_note', note);
      localStorage.setItem('ddays', JSON.stringify(ddays));
      localStorage.setItem('savedColors', JSON.stringify(savedColors));
      localStorage.setItem('snippets', JSON.stringify(snippets));
      localStorage.setItem('habits', JSON.stringify(habits));
   }, [todos, note, ddays, savedColors, snippets, habits]);

   useEffect(() => {
      let interval: any;
      if (isPomoActive && pomo > 0) {
         interval = setInterval(() => setPomo(p => p - 1), 1000);
      } else clearInterval(interval);
      return () => clearInterval(interval);
   }, [isPomoActive, pomo]);

   // 스톱워치 타이머
   useEffect(() => {
      let interval: any;
      if (isStopwatchActive) {
         interval = setInterval(() => setStopwatch(s => s + 10), 10);
      }
      return () => clearInterval(interval);
   }, [isStopwatchActive]);

   // 다크 모드 적용 (DOM만 업데이트, 저장은 핸들러에서)
   useEffect(() => {
      if (isDarkMode) {
         document.documentElement.classList.add('dark');
      } else {
         document.documentElement.classList.remove('dark');
      }
   }, [isDarkMode]);

   // 방문자 카운터 저장
   useEffect(() => {
      localStorage.setItem('visitorData', JSON.stringify(visitorCount));
   }, [visitorCount]);

   // 스크롤 감지
   useEffect(() => {
      const handleScroll = () => {
         setShowScrollBtn(window.scrollY > 300);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   const formatPomo = () => {
      const m = Math.floor(pomo / 60);
      const s = pomo % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
   };

   const getKoreanGreeting = () => {
      const hour = time.getHours();
      if (hour < 6) return "평온한 새벽입니다";
      if (hour < 12) return "활기찬 아침입니다";
      if (hour < 18) return "여유로운 오후입니다";
      return "편안한 저녁입니다";
   };

   // 도구 로직 구현
   const handleJsonAction = (action: 'format' | 'minify') => {
      try {
         const obj = JSON.parse(jsonInput);
         setJsonInput(action === 'format' ? JSON.stringify(obj, null, 2) : JSON.stringify(obj));
      } catch (e) {
         alert('올바른 JSON 형식이 아닙니다.');
      }
   };

   const generatePassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let password = "";
      for (let i = 0; i < 16; i++) {
         password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setPwResult(password);
   };

   const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const calculate = () => {
      try {
         // 위험할 수 있는 eval 대신 간단한 사칙연산 처리 (여기서는 데모용으로 유지)
         // eslint-disable-next-line no-eval
         setCalcInput(eval(calcInput).toString());
      } catch {
         setCalcInput('Error');
      }
   };

   // 스톱워치 헬퍼
   const formatStopwatch = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const centiseconds = Math.floor((ms % 1000) / 10);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
   };

   const addLap = () => setLaps([...laps, stopwatch]);
   const resetStopwatch = () => { setStopwatch(0); setLaps([]); setIsStopwatchActive(false); };

   // D-day 헬퍼
   const addDday = () => {
      if (newDdayTitle && newDdayDate) {
         setDdays([...ddays, { id: Date.now().toString(), title: newDdayTitle, date: newDdayDate }]);
         setNewDdayTitle(''); setNewDdayDate('');
      }
   };
   const deleteDday = (id: string) => setDdays(ddays.filter(d => d.id !== id));
   const getDdayDiff = (dateStr: string) => {
      const target = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
   };

   // 색상 피커 헬퍼
   const saveColor = () => {
      if (!savedColors.includes(pickerColor)) {
         setSavedColors([...savedColors, pickerColor]);
      }
   };
   const deleteColor = (color: string) => setSavedColors(savedColors.filter(c => c !== color));
   const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : '';
   };

   // Base64 헬퍼
   const handleBase64 = () => {
      try {
         if (base64Mode === 'encode') {
            setBase64Output(btoa(unescape(encodeURIComponent(base64Input))));
         } else {
            setBase64Output(decodeURIComponent(escape(atob(base64Input))));
         }
      } catch { setBase64Output('오류: 유효하지 않은 입력'); }
   };

   // URL 인코더 헬퍼
   const handleUrl = () => {
      try {
         setUrlOutput(urlMode === 'encode' ? encodeURIComponent(urlInput) : decodeURIComponent(urlInput));
      } catch { setUrlOutput('오류: 유효하지 않은 입력'); }
   };

   // 코드 스니펫 헬퍼
   const addSnippet = () => {
      if (newSnippetTitle && newSnippetCode) {
         setSnippets([...snippets, { id: Date.now().toString(), title: newSnippetTitle, code: newSnippetCode, language: newSnippetLang }]);
         setNewSnippetTitle(''); setNewSnippetCode(''); setNewSnippetLang('javascript');
      }
   };
   const deleteSnippet = (id: string) => setSnippets(snippets.filter(s => s.id !== id));

   // 습관 트래커 헬퍼
   const addHabit = () => {
      if (newHabitName) {
         setHabits([...habits, { id: Date.now().toString(), name: newHabitName, streak: 0, lastChecked: null }]);
         setNewHabitName('');
      }
   };
   const deleteHabit = (id: string) => setHabits(habits.filter(h => h.id !== id));
   const checkHabit = (id: string) => {
      const today = new Date().toDateString();
      setHabits(habits.map(h => {
         if (h.id === id) {
            if (h.lastChecked === today) return h;
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const newStreak = h.lastChecked === yesterday ? h.streak + 1 : 1;
            return { ...h, streak: newStreak, lastChecked: today };
         }
         return h;
      }));
   };

   // 달력 헬퍼
   const getCalendarDays = () => {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days: (number | null)[] = [];
      for (let i = 0; i < firstDay; i++) days.push(null);
      for (let i = 1; i <= daysInMonth; i++) days.push(i);
      return days;
   };
   const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1));
   const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1));
   const isToday = (day: number) => {
      const today = new Date();
      return day === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear();
   };

   // 스크롤 함수
   const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
   const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

   return (
      <div className={`flex h-[calc(100-72px)] overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
         {/* 모바일 햄버거 버튼 */}
         <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden fixed top-20 left-4 z-40 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700"
         >
            <Menu size={20} className="text-slate-600 dark:text-slate-300" />
         </button>

         {/* 모바일 오버레이 */}
         {isMobileSidebarOpen && (
            <div
               onClick={() => setIsMobileSidebarOpen(false)}
               className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
         )}

         {/* 1. 사이드바 */}
         <aside className={`
            w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 
            flex flex-col p-6 space-y-6 overflow-y-auto z-50
            fixed lg:relative inset-y-0 left-0
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
         `}>
            {/* 모바일 닫기 버튼 */}
            <button
               onClick={() => setIsMobileSidebarOpen(false)}
               className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
               <X size={20} />
            </button>

            {/* 다크 모드 토글 */}
            <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400">테마</span>
               <button
                  onClick={() => {
                     const newMode = !isDarkMode;
                     setIsDarkMode(newMode);
                     localStorage.setItem('darkMode', JSON.stringify(newMode)); // 수동 변경 시 저장
                  }}
                  className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
               >
                  {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
               </button>
            </div>

            {/* 미니 프로필 */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white">
               <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={20} />
               </div>
               <div>
                  <div className="font-bold text-sm">운영자</div>
                  <div className="text-[10px] opacity-80">기록하는 개발자입니다</div>
               </div>
            </div>

            {/* 방문자 카운터 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
               <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">방문자</div>
               <div className="flex justify-between text-sm">
                  <div className="text-center">
                     <div className="font-black text-indigo-600 dark:text-indigo-400">{visitorCount.today}</div>
                     <div className="text-[10px] text-slate-400">Today</div>
                  </div>
                  <div className="w-px bg-slate-200 dark:bg-slate-600" />
                  <div className="text-center">
                     <div className="font-black text-slate-700 dark:text-slate-300">{visitorCount.total}</div>
                     <div className="text-[10px] text-slate-400">Total</div>
                  </div>
               </div>
            </div>

            <div>
               <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">작업 공간</h4>
               <nav className="space-y-1">
                  <button onClick={() => setActiveModal(null)} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg transition-colors ${!activeModal ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><LayoutGrid size={18} /> 홈</button>
                  <button onClick={() => setActiveModal('json')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Code size={18} /> JSON 포맷터</button>
                  <button onClick={() => { setActiveModal('pw'); generatePassword(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><ShieldCheck size={18} /> 비밀번호 생성기</button>
                  <button onClick={() => setActiveModal('word')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Type size={18} /> 글자수 세기</button>
                  <button onClick={() => setActiveModal('stopwatch')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Timer size={18} /> 스톱워치</button>
                  <button onClick={() => setActiveModal('dday')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Calendar size={18} /> D-day 카운터</button>
                  <button onClick={() => setActiveModal('color')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Palette size={18} /> 색상 피커</button>
                  <button onClick={() => setActiveModal('base64')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><FileCode size={18} /> Base64 변환</button>
                  <button onClick={() => setActiveModal('url')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Link size={18} /> URL 인코더</button>
                  <button onClick={() => setActiveModal('snippet')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Code size={18} /> 코드 스니펫</button>
               </nav>
            </div>

            <div>
               <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">개인 루틴</h4>
               <nav className="space-y-1">
                  <button onClick={() => setIsPomoActive(!isPomoActive)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Flame size={18} /> {isPomoActive ? '타이머 중지' : '집중 모드 시작'}</button>
               </nav>
            </div>

            <div className="pt-4 mt-auto">
               <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl text-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">시스템 상태</div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[11px]"><span>배터리</span> <span>{batt}</span></div>
                     <div className="flex justify-between text-[11px]"><span>IP 주소</span> <span className="truncate ml-2">{visitor?.ip}</span></div>
                  </div>
               </div>
            </div>
         </aside>

         {/* 2. 메인 대시보드 */}
         <main className="flex-grow overflow-y-auto bg-[#f9f9fb] dark:bg-slate-900 p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
               <div className="mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase mb-4 ml-14 lg:ml-0">
                     <Zap size={12} fill="currentColor" /> {getKoreanGreeting()}
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                     당신의 스마트한 공간 , <span className="text-transparent bg-clip-text clickup-gradient">sia.kr</span>
                  </h1>
               </div>

               <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">자주 가는 사이트</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                     {ORIGINAL_SHORTCUTS.map(s => (
                        <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-1 transition-all group">
                           <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                              <img src={s.icon} alt="" className="w-6 h-6" />
                           </div>
                           <span className="text-[11px] font-bold text-slate-600">{s.label}</span>
                        </a>
                     ))}
                  </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* 시계 위젯 */}
                  <div className="md:col-span-2 glass-card p-8 rounded-3xl flex justify-between items-center shadow-sm">
                     <div>
                        <div className="text-sm font-bold text-slate-400 mb-1">{time.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
                        <div className="text-5xl font-black text-slate-900 dark:text-white">{time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold">
                           <AlertCircle size={16} /> <span>오늘 할 일이 {todos.filter(t => !t.completed).length}건 남았습니다.</span>
                        </div>
                     </div>
                     <div className="hidden sm:block">
                        <Clock size={80} className="text-slate-100" />
                     </div>
                  </div>

                  {/* 시장 데이터 */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <h4 className="text-xs font-black uppercase text-slate-400">시장 데이터</h4>
                        <RefreshCw size={14} className="text-slate-300 dark:text-slate-600 animate-spin-slow" />
                     </div>
                     <div className="space-y-3 my-4">
                        {/* 달러/원 환율 */}
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-600">달러/원</span>
                              {marketData?.usd.isUp ? <TrendingUp size={12} className="text-red-500" /> : <TrendingDown size={12} className="text-blue-500" />}
                           </div>
                           <div className="text-lg font-black dark:text-white">{marketData?.usd.value || '---'}</div>
                        </div>
                        {/* 코스피 */}
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-blue-600">코스피</span>
                              {marketData?.kospi.isUp ? <TrendingUp size={12} className="text-red-500" /> : <TrendingDown size={12} className="text-blue-500" />}
                           </div>
                           <div className="text-lg font-black dark:text-white">{marketData?.kospi.value || '---'}</div>
                        </div>
                        {/* 비트코인 */}
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-orange-500">비트코인</span>
                           <div className="text-sm font-black dark:text-white">${marketData?.btc.priceUsd || '---'}</div>
                        </div>
                        {/* 이더리움 */}
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-indigo-500">이더리움</span>
                           <div className="text-sm font-black dark:text-white">${marketData?.eth.priceUsd || '---'}</div>
                        </div>
                     </div>
                     <div className="text-[10px] text-slate-400 font-medium">실시간 시세</div>
                  </div>

                  {/* 날씨 위젯 */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between overflow-hidden relative">
                     <Cloud size={100} className="absolute -right-8 -bottom-8 opacity-10" />
                     <div className="relative z-10">
                        <h4 className="text-[10px] font-black uppercase opacity-50 mb-4 tracking-widest">실시간 기온</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold">서울</span>
                              <span className="text-lg font-black">{weather.seoul?.temp}°C</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold">부산</span>
                              <span className="text-lg font-black">{weather.busan?.temp}°C</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* 할 일 목록 */}
                  <div className="md:row-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-black uppercase text-slate-400">내 할 일</h4>
                        <CheckCircle size={18} className="text-green-500" />
                     </div>
                     <input
                        onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value;
                              if (val) {
                                 setTodos([{ id: Date.now().toString(), text: val, completed: false }, ...todos]);
                                 (e.target as HTMLInputElement).value = '';
                              }
                           }
                        }}
                        type="text" placeholder="입력 후 엔터..." className="w-full text-sm border-b dark:border-slate-600 pb-2 mb-4 outline-none focus:border-indigo-500 transition-colors bg-transparent dark:text-white dark:placeholder:text-slate-500"
                     />
                     <div className="flex-grow space-y-1 overflow-y-auto pr-2 max-h-[300px]">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                           <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                              {todos.map(t => (
                                 <SortableItem
                                    key={t.id}
                                    todo={t}
                                    onToggle={(id) => setTodos(todos.map(td => td.id === id ? { ...td, completed: !td.completed } : td))}
                                    onDelete={deleteTodo}
                                 />
                              ))}
                           </SortableContext>
                        </DndContext>
                     </div>
                  </div>

                  {/* 집중 타이머 위젯 */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                     <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4">포모도로</h4>
                     <div className="text-4xl font-black text-slate-900 dark:text-white mb-4 font-mono">{formatPomo()}</div>
                     <div className="flex gap-2">
                        <button onClick={() => setIsPomoActive(!isPomoActive)} className="flex-grow py-2 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-black dark:hover:bg-indigo-700 transition-all">
                           {isPomoActive ? '정지' : '시작'}
                        </button>
                        <button onClick={() => { setPomo(1500); setIsPomoActive(false); }} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600"><RefreshCw size={14} /></button>
                     </div>
                  </div>

                  {/* 퀵 메모 */}
                  <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                     <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4">퀵 메모</h4>
                     <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full h-24 text-sm resize-none outline-none text-slate-600 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-3 rounded-2xl placeholder:text-slate-400"
                        placeholder="아이디어를 기록하세요..."
                     />
                  </div>

                  {/* 유틸리티 도구 위젯 */}
                  <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl">
                     <h4 className="text-[10px] font-black uppercase opacity-60 mb-6">빠른 도구</h4>
                     <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setActiveModal('sys')} className="p-3 bg-white/10 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/20 transition-all">
                           <Monitor size={16} /> <span className="text-[9px] font-bold">시스템</span>
                        </button>
                        <button onClick={() => setActiveModal('calc')} className="p-3 bg-white/10 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/20 transition-all">
                           <Calculator size={16} /> <span className="text-[9px] font-bold">계산기</span>
                        </button>
                     </div>
                  </div>

                  {/* 명언 위젯 */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                     <div className="flex items-center gap-2 mb-4">
                        <Quote size={16} className="text-slate-300 dark:text-slate-600" />
                        <h4 className="text-[10px] font-black uppercase text-slate-400">오늘의 영감</h4>
                     </div>
                     <p className="text-[11px] italic text-slate-500 dark:text-slate-300 leading-relaxed font-medium">
                        "지속적인 성장은 불편함을 기꺼이 감수할 때 찾아온다."
                     </p>
                     <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                           <Globe size={12} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-400">{visitor?.country || '한국'}</span>
                        </div>
                        <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">sia.kr</div>
                     </div>
                  </div>

                  {/* 습관 트래커 위젯 */}
                  <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-xl">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black uppercase opacity-80"><Target size={14} className="inline mr-1" /> 습관 트래커</h4>
                        <div className="flex items-center gap-2">
                           <input
                              type="text"
                              value={newHabitName}
                              onChange={(e) => setNewHabitName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                              placeholder="새 습관 추가..."
                              className="px-2 py-1 text-xs bg-white/20 rounded-lg outline-none placeholder-white/50 w-28"
                           />
                           <button onClick={addHabit} className="p-1 bg-white/20 rounded-lg hover:bg-white/30"><Plus size={14} /></button>
                        </div>
                     </div>
                     <div className="space-y-2 max-h-32 overflow-y-auto">
                        {habits.map(h => {
                           const isCheckedToday = h.lastChecked === new Date().toDateString();
                           return (
                              <div key={h.id} className="flex items-center justify-between bg-white/10 p-2 rounded-xl group">
                                 <div className="flex items-center gap-2">
                                    <button
                                       onClick={() => checkHabit(h.id)}
                                       className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCheckedToday ? 'bg-white border-white' : 'border-white/50'}`}
                                    >
                                       {isCheckedToday && <Check size={12} className="text-emerald-500" />}
                                    </button>
                                    <span className={`text-sm font-medium ${isCheckedToday ? 'opacity-60' : ''}`}>{h.name}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">🔥 {h.streak}일</span>
                                    <button onClick={() => deleteHabit(h.id)} className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-white"><X size={14} /></button>
                                 </div>
                              </div>
                           );
                        })}
                        {habits.length === 0 && <div className="text-center text-white/50 text-sm py-4">습관을 추가해보세요</div>}
                     </div>
                  </div>

                  {/* 달력 위젯 */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                     <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronLeft size={16} className="text-slate-400" /></button>
                        <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
                           {calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월
                        </h4>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronRight size={16} className="text-slate-400" /></button>
                     </div>
                     <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-2">
                        {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="font-bold">{d}</div>)}
                     </div>
                     <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {getCalendarDays().map((day, i) => (
                           <div
                              key={i}
                              className={`p-1.5 rounded-lg ${day === null ? '' : isToday(day) ? 'bg-indigo-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                           >
                              {day}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </main>

         {/* 플로팅 스크롤 버튼 */}
         {showScrollBtn && (
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
               <button
                  onClick={scrollToTop}
                  className="p-3 bg-slate-900 dark:bg-slate-700 text-white rounded-full shadow-lg hover:bg-black dark:hover:bg-slate-600 transition-all"
               >
                  <ChevronUp size={20} />
               </button>
               <button
                  onClick={scrollToBottom}
                  className="p-3 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-white rounded-full shadow-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-all"
               >
                  <ChevronDown size={20} />
               </button>
            </div>
         )}

         {/* 3. 유틸리티 모달들 */}

         {/* JSON 포맷터 */}
         <Modal isOpen={activeModal === 'json'} onClose={() => setActiveModal(null)} title="JSON 포맷터">
            <textarea
               value={jsonInput}
               onChange={(e) => setJsonInput(e.target.value)}
               className="w-full h-48 p-4 font-mono text-xs border border-slate-100 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-indigo-100 outline-none"
               placeholder="여기에 JSON 데이터를 입력하세요..."
            ></textarea>
            <div className="flex gap-2 mt-4">
               <button onClick={() => handleJsonAction('format')} className="flex-grow py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors">예쁘게 정렬</button>
               <button onClick={() => handleJsonAction('minify')} className="flex-grow py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">압축하기</button>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full mt-4 py-2 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors underline">닫기(나가기)</button>
         </Modal>

         {/* 비밀번호 생성기 */}
         <Modal isOpen={activeModal === 'pw'} onClose={() => setActiveModal(null)} title="보안 비밀번호 생성">
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 mb-4 text-center">
               <div className="text-2xl font-black text-slate-900 tracking-wider mb-2">{pwResult || '........'}</div>
               <button onClick={() => copyToClipboard(pwResult)} className="inline-flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-700">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? '복사됨!' : '클립보드에 복사'}
               </button>
            </div>
            <button onClick={generatePassword} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mb-2">새로 생성하기</button>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold">창 닫기</button>
         </Modal>

         {/* 글자수 세기 */}
         <Modal isOpen={activeModal === 'word'} onClose={() => setActiveModal(null)} title="글자수 세기">
            <textarea
               value={wordInput}
               onChange={(e) => setWordInput(e.target.value)}
               className="w-full h-40 p-4 text-sm border border-slate-100 rounded-2xl bg-slate-50 outline-none mb-4"
               placeholder="텍스트를 입력하면 글자수를 자동 계산합니다..."
            ></textarea>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase">공백 포함</div>
                  <div className="text-2xl font-black text-slate-900">{wordInput.length}</div>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase">공백 제외</div>
                  <div className="text-2xl font-black text-slate-900">{wordInput.replace(/\s/g, '').length}</div>
               </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">확인 완료 및 닫기</button>
         </Modal>

         {/* 계산기 */}
         <Modal isOpen={activeModal === 'calc'} onClose={() => setActiveModal(null)} title="심플 계산기">
            <div className="bg-slate-900 p-6 rounded-2xl mb-4">
               <input
                  type="text"
                  value={calcInput}
                  readOnly
                  className="w-full bg-transparent text-right text-3xl font-black text-white outline-none"
               />
            </div>
            <div className="grid grid-cols-4 gap-2">
               {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(btn => (
                  <button
                     key={btn}
                     onClick={() => btn === '=' ? calculate() : setCalcInput(p => p + btn)}
                     className={`p-4 rounded-xl font-bold ${btn === '=' ? 'bg-indigo-500 text-white col-span-2' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                     {btn}
                  </button>
               ))}
               <button onClick={() => setCalcInput('')} className="col-span-2 p-4 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100">C (초기화)</button>
               <button onClick={() => setActiveModal(null)} className="col-span-2 p-4 bg-slate-100 text-slate-400 rounded-xl font-bold hover:bg-slate-200">닫기</button>
            </div>
         </Modal>

         {/* 시스템 정보 */}
         <Modal isOpen={activeModal === 'sys'} onClose={() => setActiveModal(null)} title="시스템 상세 정보">
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <HardDrive className="text-indigo-500" />
                  <div>
                     <div className="text-xs font-bold text-slate-400 uppercase">IP 주소</div>
                     <div className="text-sm font-black text-slate-900">{visitor?.ip}</div>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <Smartphone className="text-indigo-500" />
                  <div>
                     <div className="text-xs font-bold text-slate-400 uppercase">사용자 환경</div>
                     <div className="text-[10px] font-medium text-slate-600 truncate max-w-[250px]">{navigator.userAgent}</div>
                  </div>
               </div>
               <button onClick={() => setActiveModal(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mt-2">확인 완료</button>
            </div>
         </Modal>

         {/* 스톱워치 */}
         <Modal isOpen={activeModal === 'stopwatch'} onClose={() => setActiveModal(null)} title="스톱워치">
            <div className="text-center mb-6">
               <div className="text-5xl font-black text-slate-900 font-mono mb-4">{formatStopwatch(stopwatch)}</div>
               <div className="flex gap-2 justify-center">
                  <button onClick={() => setIsStopwatchActive(!isStopwatchActive)} className={`px-6 py-3 rounded-xl font-bold ${isStopwatchActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                     {isStopwatchActive ? <><Pause size={16} className="inline mr-2" />정지</> : <><Play size={16} className="inline mr-2" />시작</>}
                  </button>
                  <button onClick={addLap} disabled={!isStopwatchActive} className="px-4 py-3 bg-indigo-500 text-white rounded-xl font-bold disabled:opacity-50">랩</button>
                  <button onClick={resetStopwatch} className="px-4 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold"><RotateCcw size={16} /></button>
               </div>
            </div>
            {laps.length > 0 && (
               <div className="max-h-40 overflow-y-auto space-y-1">
                  {laps.map((lap, i) => (
                     <div key={i} className="flex justify-between text-sm p-2 bg-slate-50 rounded-lg">
                        <span className="font-bold text-slate-500">랩 {i + 1}</span>
                        <span className="font-mono">{formatStopwatch(lap)}</span>
                     </div>
                  ))}
               </div>
            )}
         </Modal>

         {/* D-day 카운터 */}
         <Modal isOpen={activeModal === 'dday'} onClose={() => setActiveModal(null)} title="D-day 카운터">
            <div className="flex gap-2 mb-4">
               <input type="text" value={newDdayTitle} onChange={(e) => setNewDdayTitle(e.target.value)} placeholder="제목" className="flex-grow px-3 py-2 border rounded-lg text-sm" />
               <input type="date" value={newDdayDate} onChange={(e) => setNewDdayDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
               <button onClick={addDday} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold"><Plus size={16} /></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
               {ddays.map(d => {
                  const diff = getDdayDiff(d.date);
                  return (
                     <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                        <div>
                           <div className="font-bold text-slate-700">{d.title}</div>
                           <div className="text-xs text-slate-400">{d.date}</div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`text-lg font-black ${diff === 0 ? 'text-green-500' : diff < 0 ? 'text-slate-400' : 'text-indigo-600'}`}>
                              {diff === 0 ? 'D-Day!' : diff < 0 ? `D+${Math.abs(diff)}` : `D-${diff}`}
                           </span>
                           <button onClick={() => deleteDday(d.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><X size={16} /></button>
                        </div>
                     </div>
                  );
               })}
               {ddays.length === 0 && <div className="text-center text-slate-400 py-4">D-day를 추가하세요</div>}
            </div>
         </Modal>

         {/* 색상 피커 */}
         <Modal isOpen={activeModal === 'color'} onClose={() => setActiveModal(null)} title="색상 피커">
            <div className="flex items-center gap-4 mb-4">
               <input type="color" value={pickerColor} onChange={(e) => setPickerColor(e.target.value)} className="w-16 h-16 rounded-xl cursor-pointer border-0" />
               <div className="flex-grow">
                  <div className="text-sm font-bold text-slate-600 mb-1">HEX: <span className="font-mono">{pickerColor}</span></div>
                  <div className="text-sm font-bold text-slate-600">RGB: <span className="font-mono">{hexToRgb(pickerColor)}</span></div>
               </div>
            </div>
            <div className="flex gap-2 mb-4">
               <button onClick={() => copyToClipboard(pickerColor)} className="flex-grow py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">HEX 복사</button>
               <button onClick={() => copyToClipboard(hexToRgb(pickerColor))} className="flex-grow py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">RGB 복사</button>
               <button onClick={saveColor} className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold"><Plus size={16} /></button>
            </div>
            {savedColors.length > 0 && (
               <div className="flex flex-wrap gap-2">
                  {savedColors.map((c, i) => (
                     <div key={i} className="relative group">
                        <div onClick={() => setPickerColor(c)} style={{ backgroundColor: c }} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-md hover:scale-110 transition-transform" />
                        <button onClick={() => deleteColor(c)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 text-xs">×</button>
                     </div>
                  ))}
               </div>
            )}
         </Modal>

         {/* Base64 변환 */}
         <Modal isOpen={activeModal === 'base64'} onClose={() => setActiveModal(null)} title="Base64 인코더/디코더">
            <div className="flex gap-2 mb-4">
               <button onClick={() => setBase64Mode('encode')} className={`flex-grow py-2 rounded-lg font-bold text-sm ${base64Mode === 'encode' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>인코딩</button>
               <button onClick={() => setBase64Mode('decode')} className={`flex-grow py-2 rounded-lg font-bold text-sm ${base64Mode === 'decode' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>디코딩</button>
            </div>
            <textarea value={base64Input} onChange={(e) => setBase64Input(e.target.value)} placeholder={base64Mode === 'encode' ? '인코딩할 텍스트 입력...' : 'Base64 문자열 입력...'} className="w-full h-24 p-3 border rounded-xl text-sm mb-2 resize-none" />
            <button onClick={handleBase64} className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold mb-2">변환</button>
            {base64Output && (
               <div className="relative">
                  <textarea value={base64Output} readOnly className="w-full h-24 p-3 bg-slate-50 border rounded-xl text-sm resize-none font-mono" />
                  <button onClick={() => copyToClipboard(base64Output)} className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:bg-slate-100"><Copy size={14} /></button>
               </div>
            )}
         </Modal>

         {/* URL 인코더 */}
         <Modal isOpen={activeModal === 'url'} onClose={() => setActiveModal(null)} title="URL 인코더/디코더">
            <div className="flex gap-2 mb-4">
               <button onClick={() => setUrlMode('encode')} className={`flex-grow py-2 rounded-lg font-bold text-sm ${urlMode === 'encode' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>인코딩</button>
               <button onClick={() => setUrlMode('decode')} className={`flex-grow py-2 rounded-lg font-bold text-sm ${urlMode === 'decode' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>디코딩</button>
            </div>
            <textarea value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder={urlMode === 'encode' ? 'URL 인코딩할 텍스트...' : '디코딩할 URL...'} className="w-full h-20 p-3 border rounded-xl text-sm mb-2 resize-none" />
            <button onClick={handleUrl} className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold mb-2">변환</button>
            {urlOutput && (
               <div className="relative">
                  <textarea value={urlOutput} readOnly className="w-full h-20 p-3 bg-slate-50 border rounded-xl text-sm resize-none font-mono break-all" />
                  <button onClick={() => copyToClipboard(urlOutput)} className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:bg-slate-100"><Copy size={14} /></button>
               </div>
            )}
         </Modal>

         {/* 코드 스니펫 */}
         <Modal isOpen={activeModal === 'snippet'} onClose={() => setActiveModal(null)} title="코드 스니펫 저장소">
            <div className="space-y-2 mb-4">
               <input type="text" value={newSnippetTitle} onChange={(e) => setNewSnippetTitle(e.target.value)} placeholder="스니펫 제목" className="w-full px-3 py-2 border rounded-lg text-sm" />
               <select value={newSnippetLang} onChange={(e) => setNewSnippetLang(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="sql">SQL</option>
               </select>
               <textarea value={newSnippetCode} onChange={(e) => setNewSnippetCode(e.target.value)} placeholder="코드 입력..." className="w-full h-24 p-3 border rounded-xl text-sm font-mono resize-none" />
               <button onClick={addSnippet} className="w-full py-2 bg-indigo-500 text-white rounded-xl font-bold">스니펫 저장</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
               {snippets.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-xl group">
                     <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-slate-700">{s.title}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-xs px-2 py-1 bg-slate-200 rounded">{s.language}</span>
                           <button onClick={() => copyToClipboard(s.code)} className="text-slate-400 hover:text-indigo-500"><Copy size={14} /></button>
                           <button onClick={() => deleteSnippet(s.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                     </div>
                     <pre className="text-xs bg-slate-900 text-green-400 p-2 rounded-lg overflow-x-auto">{s.code.slice(0, 100)}{s.code.length > 100 ? '...' : ''}</pre>
                  </div>
               ))}
               {snippets.length === 0 && <div className="text-center text-slate-400 py-4">저장된 스니펫이 없습니다</div>}
            </div>
         </Modal>
      </div>
   );
};

export default Home;
