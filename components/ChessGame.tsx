// ChessGame component using chess.js library
import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { StockfishEngine } from '../lib/StockfishEngine';

const ChessGame: React.FC = () => {
    // Image paths for pieces
    const PIECE_IMAGES: { [key: string]: string } = {
        'R': '/chess1/imgi_51_wr.png', 'N': '/chess1/imgi_52_wn.png', 'B': '/chess1/imgi_53_wb.png',
        'Q': '/chess1/imgi_55_wq (1).png', 'K': '/chess1/imgi_54_wk.png', 'P': '/chess1/imgi_50_wp.png',
        'r': '/chess1/imgi_44_br.png', 'n': '/chess1/imgi_45_bn.png', 'b': '/chess1/imgi_46_bb.png',
        'q': '/chess1/imgi_48_bq.png', 'k': '/chess1/imgi_47_bk.png', 'p': '/chess1/imgi_49_bp.png',
    };

    const [game, setGame] = useState<Chess>(() => new Chess());
    const [selected, setSelected] = useState<Square | null>(null);
    const [validMoves, setValidMoves] = useState<Square[]>([]);
    const [thinking, setThinking] = useState(false);
    const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
    const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
    const [dragging, setDragging] = useState<Square | null>(null);
    const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
    const [moveHistory, setMoveHistory] = useState<{ white: string; black: string }[]>([]);
    const [aiMode, setAiMode] = useState<'simple' | 'gemini' | 'stockfish' | null>(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [aiRating, setAiRating] = useState(800);

    // Stockfish engine ref
    const stockfishRef = useRef<StockfishEngine | null>(null);

    const getPieceImage = (piece: { type: string; color: 'w' | 'b' } | null) => {
        if (!piece) return null;
        const code = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        return PIECE_IMAGES[code] || null;
    };

    const getStatus = () => {
        if (game.isCheckmate()) return 'checkmate';
        if (game.isStalemate()) return 'stalemate';
        if (game.isInsufficientMaterial()) return 'insufficient';
        if (game.isDraw()) return 'draw';
        if (game.isCheck()) return 'check';
        return 'playing';
    };

    const getStatusText = () => {
        const status = getStatus();
        if (status === 'checkmate') return game.turn() === playerColor ? '체크메이트! AI 승리' : '체크메이트! 당신이 이겼습니다!';
        if (status === 'stalemate') return '스테일메이트! 무승부';
        if (status === 'insufficient') return '기물부족! 무승부';
        if (status === 'draw') return '무승부!';
        if (thinking) return 'AI가 생각 중...';
        if (status === 'check') return game.turn() === playerColor ? '체크! 당신의 차례' : '체크!';
        return game.turn() === playerColor ? `당신의 차례 (${playerColor === 'w' ? '백' : '흑'})` : `AI 차례 (${playerColor === 'w' ? '흑' : '백'})`;
    };

    const handleClick = (square: Square) => {
        if (!playerColor || game.turn() !== playerColor || thinking || game.isGameOver()) return;

        const piece = game.get(square);

        if (selected) {
            const move = validMoves.find(m => m === square);
            if (move) {
                makeMove(selected, square);
            } else if (piece && piece.color === playerColor) {
                setSelected(square);
                setValidMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
            } else {
                setSelected(null);
                setValidMoves([]);
            }
        } else if (piece && piece.color === playerColor) {
            setSelected(square);
            setValidMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
        }
    };

    const makeMove = (from: Square, to: Square) => {
        try {
            const move = game.move({ from, to, promotion: 'q' });
            if (move) {
                // Record captured piece
                if (move.captured) {
                    const capturedPiece = move.color === 'w' ? move.captured.toLowerCase() : move.captured.toUpperCase();
                    if (move.color === 'w') {
                        setCapturedBlack(prev => [...prev, capturedPiece]);
                    } else {
                        setCapturedWhite(prev => [...prev, capturedPiece]);
                    }
                }

                // Record move in history
                const san = move.san;
                if (move.color === 'w') {
                    setMoveHistory(prev => [...prev, { white: san, black: '' }]);
                } else {
                    setMoveHistory(prev => {
                        const updated = [...prev];
                        if (updated.length > 0) {
                            updated[updated.length - 1] = { ...updated[updated.length - 1], black: san };
                        }
                        return updated;
                    });
                }

                setGame(new Chess(game.fen()));
                setSelected(null);
                setValidMoves([]);
            }
        } catch (e) {
            console.error('Invalid move:', e);
        }
    };

    const handleDragStart = (square: Square) => {
        if (!playerColor || game.turn() !== playerColor || thinking || game.isGameOver()) return;
        const piece = game.get(square);
        if (piece && piece.color === playerColor) {
            setDragging(square);
            setSelected(square);
            setValidMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
        }
    };

    const handleDragEnd = () => setDragging(null);

    const handleDrop = (square: Square) => {
        if (dragging && validMoves.includes(square)) {
            makeMove(dragging, square);
        }
        setDragging(null);
    };

    // AI Move
    useEffect(() => {
        if (!playerColor || !gameStarted || game.isGameOver()) return;
        const aiColor = playerColor === 'w' ? 'b' : 'w';
        if (game.turn() === aiColor) {
            setThinking(true);

            const executeAiMove = async () => {
                const moves = game.moves({ verbose: true });
                if (moves.length === 0) return;

                let bestMove: Move;

                if (aiMode === 'stockfish') {
                    // Use Stockfish engine
                    if (!stockfishRef.current) {
                        console.log('Creating new Stockfish engine with rating:', aiRating);
                        stockfishRef.current = new StockfishEngine();
                        stockfishRef.current.setDifficulty(aiRating);
                        // Wait for engine to initialize
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    try {
                        console.log('Requesting move from Stockfish, FEN:', game.fen());
                        const moveStr = await stockfishRef.current.getBestMove(game.fen());
                        console.log('Stockfish returned:', moveStr);
                        if (moveStr && moveStr.length >= 4) {
                            const from = moveStr.substring(0, 2) as Square;
                            const to = moveStr.substring(2, 4) as Square;
                            const promotion = moveStr.length > 4 ? moveStr[4] : undefined;
                            const found = moves.find(m => m.from === from && m.to === to);
                            if (found) {
                                console.log('Valid move found:', found);
                                bestMove = found;
                            } else {
                                console.log('Move not found in legal moves, using random');
                                bestMove = moves[Math.floor(Math.random() * moves.length)];
                            }
                        } else {
                            console.log('Invalid move from Stockfish, using random');
                            bestMove = moves[Math.floor(Math.random() * moves.length)];
                        }
                    } catch (err) {
                        console.error('Stockfish error:', err);
                        bestMove = moves[Math.floor(Math.random() * moves.length)];
                    }
                } else if (aiMode === 'gemini') {
                    // Call Gemini API
                    const validMovesStr = moves.map(m => m.from + m.to).join(', ');
                    try {
                        const response = await fetch('/api/chess-ai', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fen: game.fen(),
                                color: aiColor === 'w' ? 'white' : 'black',
                                validMoves: validMovesStr,
                                rating: aiRating
                            })
                        });
                        const data = await response.json();
                        const moveStr = data?.move;
                        if (moveStr && moveStr.length >= 4) {
                            const from = moveStr.substring(0, 2) as Square;
                            const to = moveStr.substring(2, 4) as Square;
                            const found = moves.find(m => m.from === from && m.to === to);
                            if (found) {
                                bestMove = found;
                            } else {
                                bestMove = moves[Math.floor(Math.random() * moves.length)];
                            }
                        } else {
                            bestMove = moves[Math.floor(Math.random() * moves.length)];
                        }
                    } catch {
                        bestMove = moves[Math.floor(Math.random() * moves.length)];
                    }
                } else {
                    // Simple AI: prioritize captures
                    const captures = moves.filter(m => m.captured);
                    if (captures.length > 0) {
                        const pieceValues: { [key: string]: number } = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
                        captures.sort((a, b) => pieceValues[b.captured!] - pieceValues[a.captured!]);
                        bestMove = captures[0];
                    } else {
                        bestMove = moves[Math.floor(Math.random() * moves.length)];
                    }
                }

                // Execute the move
                const move = game.move(bestMove);
                if (move) {
                    if (move.captured) {
                        const capturedPiece = move.color === 'w' ? move.captured.toLowerCase() : move.captured.toUpperCase();
                        if (move.color === 'w') {
                            setCapturedBlack(prev => [...prev, capturedPiece]);
                        } else {
                            setCapturedWhite(prev => [...prev, capturedPiece]);
                        }
                    }

                    const san = move.san;
                    if (move.color === 'w') {
                        setMoveHistory(prev => [...prev, { white: san, black: '' }]);
                    } else {
                        setMoveHistory(prev => {
                            const updated = [...prev];
                            if (updated.length > 0) {
                                updated[updated.length - 1] = { ...updated[updated.length - 1], black: san };
                            } else {
                                updated.push({ white: '', black: san });
                            }
                            return updated;
                        });
                    }

                    setGame(new Chess(game.fen()));
                }
                setThinking(false);
            };

            const timer = setTimeout(executeAiMove, aiMode === 'gemini' ? 100 : 500);
            return () => clearTimeout(timer);
        }
    }, [game, playerColor, gameStarted, aiMode, aiRating]);

    const resetGame = () => {
        setGame(new Chess());
        setSelected(null);
        setValidMoves([]);
        setThinking(false);
        setCapturedWhite([]);
        setCapturedBlack([]);
        setDragging(null);
        setPlayerColor(null);
        setMoveHistory([]);
        setAiMode(null);
        setGameStarted(false);
        setAiRating(800);
        // Terminate Stockfish engine if exists
        if (stockfishRef.current) {
            stockfishRef.current.terminate();
            stockfishRef.current = null;
        }
    };

    const selectAiMode = (mode: 'simple' | 'gemini' | 'stockfish') => setAiMode(mode);

    const startGame = (color: 'w' | 'b') => {
        setPlayerColor(color);
        setGameStarted(true);
    };

    // ESC key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { /* handled by parent */ }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const board = game.board();
    const status = getStatus();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center w-full h-full p-2 lg:p-4 gap-2 lg:gap-4">
            {/* AI Mode Selection */}
            {!aiMode && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl text-center mx-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4 lg:mb-6">AI 모드 선택</h2>
                        <div className="flex flex-col gap-3 lg:gap-4">
                            <button onClick={() => selectAiMode('simple')} className="flex items-center gap-3 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border-2 border-transparent hover:border-blue-500">
                                <span className="text-3xl">🤖</span>
                                <div className="text-left">
                                    <span className="font-bold text-slate-700 dark:text-white text-sm lg:text-base block">간단한 AI</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">기본 규칙 기반 AI</span>
                                </div>
                            </button>
                            <button onClick={() => selectAiMode('gemini')} className="flex items-center gap-3 p-4 lg:p-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-colors border-2 border-transparent hover:border-white">
                                <span className="text-3xl">✨</span>
                                <div className="text-left">
                                    <span className="font-bold text-white text-sm lg:text-base block">Gemini AI</span>
                                    <span className="text-xs text-blue-100">Google AI 기반</span>
                                </div>
                            </button>
                            <button onClick={() => selectAiMode('stockfish')} className="flex items-center gap-3 p-4 lg:p-5 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl hover:from-green-600 hover:to-teal-700 transition-colors border-2 border-transparent hover:border-white">
                                <span className="text-3xl">🐟</span>
                                <div className="text-left">
                                    <span className="font-bold text-white text-sm lg:text-base block">Stockfish AI</span>
                                    <span className="text-xs text-green-100">세계 최강 체스 엔진</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gemini Rating Selection */}
            {aiMode === 'gemini' && !playerColor && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl text-center mx-4 w-80 lg:w-96">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">✨ Gemini AI</div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">난이도 선택</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Chess.com 레이팅 기준</p>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">{aiRating}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {aiRating < 400 ? '🐣 완전 초보' : aiRating < 600 ? '🐥 입문자' : aiRating < 900 ? '🎮 초급' : aiRating < 1200 ? '♟️ 중급' : aiRating < 1500 ? '🏆 클럽 수준' : aiRating < 1800 ? '⚔️ 강한 클럽' : aiRating < 2100 ? '🎯 전문가' : '👑 마스터'}
                                </span>
                            </div>
                            <input type="range" min="300" max="2500" step="100" value={aiRating} onChange={(e) => setAiRating(Number(e.target.value))} className="w-full h-3 rounded-lg appearance-none cursor-pointer" style={{ background: 'linear-gradient(to right, #4ade80 0%, #facc15 33%, #fb923c 66%, #ef4444 100%)' }} />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>300</span><span>1000</span><span>1800</span><span>2500</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">색상 선택</h3>
                        <div className="flex gap-3 lg:gap-4 justify-center">
                            <button onClick={() => startGame('w')} className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_54_wk.png" alt="White" className="w-10 h-10 lg:w-12 lg:h-12" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm">백</span>
                            </button>
                            <button onClick={() => startGame('b')} className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_47_bk.png" alt="Black" className="w-10 h-10 lg:w-12 lg:h-12" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm">흑</span>
                            </button>
                        </div>
                        <button onClick={() => setAiMode(null)} className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">← AI 모드 다시 선택</button>
                    </div>
                </div>
            )}

            {/* Stockfish Rating Selection */}
            {aiMode === 'stockfish' && !playerColor && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl text-center mx-4 w-80 lg:w-96">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">🐟 Stockfish AI</div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">난이도 선택</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">세계 최강 체스 엔진 Elo 설정</p>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">{aiRating}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {aiRating < 400 ? '🐣 완전 초보' : aiRating < 600 ? '🐥 입문자' : aiRating < 900 ? '🎮 초급' : aiRating < 1200 ? '♟️ 중급' : aiRating < 1500 ? '🏆 클럽 수준' : aiRating < 1800 ? '⚔️ 강한 클럽' : aiRating < 2100 ? '🎯 전문가' : aiRating < 2500 ? '👑 마스터' : '🤖 엔진 풀파워'}
                                </span>
                            </div>
                            <input type="range" min="300" max="3000" step="100" value={aiRating} onChange={(e) => setAiRating(Number(e.target.value))} className="w-full h-3 rounded-lg appearance-none cursor-pointer" style={{ background: 'linear-gradient(to right, #4ade80 0%, #2dd4bf 33%, #0d9488 66%, #14b8a6 100%)' }} />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>300</span><span>1200</span><span>2000</span><span>3000</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">색상 선택</h3>
                        <div className="flex gap-3 lg:gap-4 justify-center">
                            <button onClick={() => startGame('w')} className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-green-100 dark:hover:bg-green-900 transition-colors border-2 border-transparent hover:border-green-500">
                                <img src="/chess1/imgi_54_wk.png" alt="White" className="w-10 h-10 lg:w-12 lg:h-12" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm">백</span>
                            </button>
                            <button onClick={() => startGame('b')} className="flex flex-col items-center gap-2 p-4 lg:p-5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-green-100 dark:hover:bg-green-900 transition-colors border-2 border-transparent hover:border-green-500">
                                <img src="/chess1/imgi_47_bk.png" alt="Black" className="w-10 h-10 lg:w-12 lg:h-12" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm">흑</span>
                            </button>
                        </div>
                        <button onClick={() => setAiMode(null)} className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">← AI 모드 다시 선택</button>
                    </div>
                </div>
            )}

            {/* Simple AI Color Selection */}
            {aiMode === 'simple' && !playerColor && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl text-center mx-4">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">🤖 간단한 AI</div>
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-4 lg:mb-6">색상을 선택하세요</h2>
                        <div className="flex gap-3 lg:gap-4">
                            <button onClick={() => startGame('w')} className="flex flex-col items-center gap-2 p-4 lg:p-6 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_54_wk.png" alt="White" className="w-12 h-12 lg:w-16 lg:h-16" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm lg:text-base">백 (선공)</span>
                            </button>
                            <button onClick={() => startGame('b')} className="flex flex-col items-center gap-2 p-4 lg:p-6 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-lime-100 dark:hover:bg-lime-900 transition-colors border-2 border-transparent hover:border-lime-500">
                                <img src="/chess1/imgi_47_bk.png" alt="Black" className="w-12 h-12 lg:w-16 lg:h-16" />
                                <span className="font-bold text-slate-700 dark:text-white text-sm lg:text-base">흑 (후공)</span>
                            </button>
                        </div>
                        <button onClick={() => setAiMode(null)} className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">← AI 모드 다시 선택</button>
                    </div>
                </div>
            )}

            {/* Left Panel */}
            <div className="hidden lg:flex flex-col gap-3 items-center w-36">
                <button onClick={resetGame} className="w-full px-3 py-2 bg-lime-600 text-white rounded-lg font-bold text-sm hover:bg-lime-700 transition-colors shadow-lg">새 게임</button>
                <div className={`w-full px-2 py-1.5 rounded-lg font-bold text-xs text-center ${status === 'checkmate' ? 'bg-red-500 text-white' : status === 'check' ? 'bg-yellow-500 text-white' : thinking ? 'bg-purple-500 text-white animate-pulse' : 'bg-lime-600 text-white'}`}>
                    {playerColor ? getStatusText() : '색상 선택 대기'}
                </div>
                <div className="w-full bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">잡은 기물 (AI)</div>
                    <div className="flex flex-wrap gap-0.5 min-h-[20px]">
                        {(playerColor === 'w' ? capturedWhite : capturedBlack).map((p, i) => <img key={i} src={PIECE_IMAGES[p] || ''} alt="" className="w-5 h-5" />)}
                    </div>
                </div>
                <div className="w-full bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">잡은 기물 (나)</div>
                    <div className="flex flex-wrap gap-0.5 min-h-[20px]">
                        {(playerColor === 'w' ? capturedBlack : capturedWhite).map((p, i) => <img key={i} src={PIECE_IMAGES[p] || ''} alt="" className="w-5 h-5" />)}
                    </div>
                </div>
            </div>

            {/* Chess Board */}
            <div className="flex-shrink-0" style={{ width: 'min(calc(100vh - 100px), calc(100vw - 400px), 800px)', height: 'min(calc(100vh - 100px), calc(100vw - 400px), 800px)' }}>
                <div className="grid grid-cols-8 border-2 lg:border-4 border-lime-800 dark:border-lime-600 rounded-lg overflow-hidden shadow-2xl w-full h-full">
                    {(playerColor === 'b' ? [...board].reverse().map(row => [...row].reverse()) : board).map((row, displayR) => row.map((piece, displayC) => {
                        const r = playerColor === 'b' ? 7 - displayR : displayR;
                        const c = playerColor === 'b' ? 7 - displayC : displayC;
                        const square = (files[c] + ranks[r]) as Square;
                        const isLight = (r + c) % 2 === 0;
                        const isSelected = selected === square;
                        const isValidMove = validMoves.includes(square);
                        const hasEnemy = piece && piece.color !== playerColor && isValidMove;
                        const pieceImg = getPieceImage(piece);
                        const canDrag = piece && piece.color === playerColor && game.turn() === playerColor && !thinking;

                        return (
                            <div
                                key={square}
                                onClick={() => handleClick(square)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(square)}
                                className={`aspect-square flex items-center justify-center cursor-pointer relative
                                    ${isLight ? 'bg-[#ebecd0]' : 'bg-[#779556]'}
                                    ${isSelected ? 'ring-2 lg:ring-4 ring-yellow-400 ring-inset' : ''}
                                    ${hasEnemy ? 'ring-2 lg:ring-4 ring-red-500 ring-inset' : ''}`}
                            >
                                {isValidMove && !piece && <div className="absolute w-1/4 h-1/4 bg-black/20 rounded-full" />}
                                {pieceImg && (
                                    <img
                                        src={pieceImg}
                                        alt=""
                                        draggable={!!canDrag}
                                        onDragStart={() => handleDragStart(square)}
                                        onDragEnd={handleDragEnd}
                                        className={`w-[85%] h-[85%] object-contain select-none ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${dragging === square ? 'opacity-50' : ''}`}
                                    />
                                )}
                            </div>
                        );
                    }))}
                </div>
            </div>

            {/* Right Panel - Move History */}
            <div className="hidden lg:flex flex-col w-44" style={{ height: 'min(calc(100vh - 100px), 800px)' }}>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">기보</div>
                    <div className="flex-1 overflow-y-auto p-1">
                        {moveHistory.length === 0 ? (
                            <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">아직 수가 없습니다</div>
                        ) : (
                            <table className="w-full text-xs">
                                <tbody>
                                    {moveHistory.map((move, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800' : ''}>
                                            <td className="py-0.5 px-1 text-slate-400 dark:text-slate-500 w-6">{i + 1}.</td>
                                            <td className="py-0.5 px-1 text-slate-700 dark:text-slate-200 font-mono">{move.white}</td>
                                            <td className="py-0.5 px-1 text-slate-700 dark:text-slate-200 font-mono">{move.black}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 flex items-center justify-between gap-2 z-40">
                <button onClick={resetGame} className="px-4 py-2 bg-lime-600 text-white rounded-lg font-bold text-sm hover:bg-lime-700 transition-colors shadow-lg">새 게임</button>
                <div className={`flex-1 px-2 py-1.5 rounded-lg font-bold text-xs text-center ${status === 'checkmate' ? 'bg-red-500 text-white' : status === 'check' ? 'bg-yellow-500 text-white' : thinking ? 'bg-purple-500 text-white animate-pulse' : 'bg-lime-600 text-white'}`}>
                    {playerColor ? getStatusText() : '색상 선택'}
                </div>
                <div className="flex gap-1">
                    {(playerColor === 'w' ? capturedBlack : capturedWhite).slice(-3).map((p, i) => <img key={i} src={PIECE_IMAGES[p] || ''} alt="" className="w-6 h-6" />)}
                </div>
            </div>
        </div>
    );
};

export default ChessGame;
