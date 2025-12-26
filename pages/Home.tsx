
import React, { useEffect, useState, useCallback } from 'react';
import {
   Clock, Cloud, Search, CheckCircle, Flame, Droplets,
   Globe, Hash, MessageSquare, BookOpen, Quote,
   Settings, Battery, AlertCircle, RefreshCw,
   Code, Monitor, Zap, LayoutGrid, Calendar,
   Calculator, Scissors, Type, ShieldCheck, HardDrive,
   Smartphone, Copy, Check, X, GripVertical, TrendingUp, TrendingDown
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchWeather, fetchMarketData, getVisitorIpInfo } from '../services/api';
import { Shortcut, WeatherData, CryptoData, MarketData, VisitorInfo, Todo } from '../types';
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
   }, [todos, note]);

   useEffect(() => {
      let interval: any;
      if (isPomoActive && pomo > 0) {
         interval = setInterval(() => setPomo(p => p - 1), 1000);
      } else clearInterval(interval);
      return () => clearInterval(interval);
   }, [isPomoActive, pomo]);

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

   return (
      <div className="flex h-[calc(100-72px)] overflow-hidden">
         {/* 1. 사이드바 - 클릭 시 실제 모달 작동 */}
         <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6 space-y-8 overflow-y-auto">
            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">작업 공간</h4>
               <nav className="space-y-1">
                  <button onClick={() => setActiveModal(null)} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg transition-colors ${!activeModal ? 'text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutGrid size={18} /> 홈</button>
                  <button onClick={() => setActiveModal('json')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"><Code size={18} /> JSON 포맷터</button>
                  <button onClick={() => { setActiveModal('pw'); generatePassword(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"><ShieldCheck size={18} /> 비밀번호 생성기</button>
                  <button onClick={() => setActiveModal('word')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"><Type size={18} /> 글자수 세기</button>
               </nav>
            </div>

            <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">개인 루틴</h4>
               <nav className="space-y-1">
                  <button onClick={() => setIsPomoActive(!isPomoActive)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"><Flame size={18} /> {isPomoActive ? '타이머 중지' : '집중 모드 시작'}</button>
               </nav>
            </div>

            <div className="pt-8 mt-auto">
               <div className="p-4 bg-slate-900 rounded-2xl text-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">시스템 상태</div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[11px]"><span>배터리</span> <span>{batt}</span></div>
                     <div className="flex justify-between text-[11px]"><span>IP 주소</span> <span className="truncate ml-2">{visitor?.ip}</span></div>
                  </div>
               </div>
            </div>
         </aside>

         {/* 2. 메인 대시보드 */}
         <main className="flex-grow overflow-y-auto bg-[#f9f9fb] p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
               <div className="mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase mb-4">
                     <Zap size={12} fill="currentColor" /> {getKoreanGreeting()}
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
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
                        <div className="text-5xl font-black text-slate-900">{time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold">
                           <AlertCircle size={16} /> <span>오늘 할 일이 {todos.filter(t => !t.completed).length}건 남았습니다.</span>
                        </div>
                     </div>
                     <div className="hidden sm:block">
                        <Clock size={80} className="text-slate-100" />
                     </div>
                  </div>

                  {/* 시장 데이터 */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <h4 className="text-xs font-black uppercase text-slate-400">시장 데이터</h4>
                        <RefreshCw size={14} className="text-slate-300 animate-spin-slow" />
                     </div>
                     <div className="space-y-3 my-4">
                        {/* 달러/원 환율 */}
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-600">달러/원</span>
                              {marketData?.usd.isUp ? <TrendingUp size={12} className="text-red-500" /> : <TrendingDown size={12} className="text-blue-500" />}
                           </div>
                           <div className="text-lg font-black">{marketData?.usd.value || '---'}</div>
                        </div>
                        {/* 코스피 */}
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-blue-600">코스피</span>
                              {marketData?.kospi.isUp ? <TrendingUp size={12} className="text-red-500" /> : <TrendingDown size={12} className="text-blue-500" />}
                           </div>
                           <div className="text-lg font-black">{marketData?.kospi.value || '---'}</div>
                        </div>
                        {/* 비트코인 */}
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-orange-500">비트코인</span>
                           <div className="text-sm font-black">${marketData?.btc.priceUsd || '---'}</div>
                        </div>
                        {/* 이더리움 */}
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-indigo-500">이더리움</span>
                           <div className="text-sm font-black">${marketData?.eth.priceUsd || '---'}</div>
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
                  <div className="md:row-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
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
                        type="text" placeholder="입력 후 엔터..." className="w-full text-sm border-b pb-2 mb-4 outline-none focus:border-indigo-500 transition-colors"
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
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                     <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4">포모도로</h4>
                     <div className="text-4xl font-black text-slate-900 mb-4 font-mono">{formatPomo()}</div>
                     <div className="flex gap-2">
                        <button onClick={() => setIsPomoActive(!isPomoActive)} className="flex-grow py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-black transition-all">
                           {isPomoActive ? '정지' : '시작'}
                        </button>
                        <button onClick={() => { setPomo(1500); setIsPomoActive(false); }} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"><RefreshCw size={14} /></button>
                     </div>
                  </div>

                  {/* 퀵 메모 */}
                  <div className="md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                     <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4">퀵 메모</h4>
                     <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full h-24 text-sm resize-none outline-none text-slate-600 bg-slate-50 p-3 rounded-2xl"
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
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                     <div className="flex items-center gap-2 mb-4">
                        <Quote size={16} className="text-slate-300" />
                        <h4 className="text-[10px] font-black uppercase text-slate-400">오늘의 영감</h4>
                     </div>
                     <p className="text-[11px] italic text-slate-500 leading-relaxed font-medium">
                        "지속적인 성장은 불편함을 기꺼이 감수할 때 찾아온다."
                     </p>
                     <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                           <Globe size={12} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-400">{visitor?.country || '한국'}</span>
                        </div>
                        <div className="text-[10px] font-bold text-indigo-500">sia.kr</div>
                     </div>
                  </div>
               </div>
            </div>
         </main>

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
      </div>
   );
};

export default Home;
