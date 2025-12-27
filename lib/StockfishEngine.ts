// Stockfish Engine Wrapper
// Uses stockfish.js directly as a Web Worker

export interface StockfishOptions {
    skillLevel?: number;  // 0-20
    elo?: number;         // 300-3000
    depth?: number;       // search depth
    moveTime?: number;    // time limit in ms
}

export class StockfishEngine {
    private worker: Worker | null = null;
    private isReady: boolean = false;
    private pendingResolve: ((move: string) => void) | null = null;
    private messageQueue: string[] = [];
    private options: StockfishOptions = {
        skillLevel: 10,
        elo: 1200,
        depth: 10,
        moveTime: 1000
    };

    constructor() {
        this.initWorker();
    }

    private initWorker(): void {
        try {
            // Use locally hosted stockfish.js as worker
            this.worker = new Worker('/stockfish.js');

            this.worker.onmessage = (e: MessageEvent) => {
                const message = typeof e.data === 'string' ? e.data : String(e.data);

                console.log('Stockfish:', message);

                if (message === 'uciok') {
                    console.log('Stockfish UCI ready, applying options...');
                    this.isReady = true;
                    this.applyOptions();
                    // Process any queued messages
                    this.processQueue();
                } else if (message === 'readyok') {
                    console.log('Stockfish ready!');
                } else if (message.startsWith('bestmove')) {
                    const parts = message.split(' ');
                    const move = parts[1];
                    console.log('Stockfish bestmove:', move);
                    if (this.pendingResolve && move && move !== '(none)') {
                        this.pendingResolve(move);
                        this.pendingResolve = null;
                    }
                }
            };

            this.worker.onerror = (error) => {
                console.error('Stockfish worker error:', error);
            };

            // Send UCI init command
            this.worker.postMessage('uci');
            console.log('Stockfish worker created, UCI command sent');

        } catch (error) {
            console.error('Failed to initialize Stockfish:', error);
        }
    }

    private processQueue(): void {
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (msg && this.worker) {
                this.worker.postMessage(msg);
            }
        }
    }

    private sendMessage(msg: string): void {
        if (this.worker) {
            if (this.isReady) {
                this.worker.postMessage(msg);
            } else {
                this.messageQueue.push(msg);
            }
        }
    }

    private applyOptions(): void {
        if (!this.worker) return;

        // Note: stockfish.js 10.0.2 may not support all UCI options
        // Skill Level is the most reliable way to adjust difficulty
        this.sendMessage(`setoption name Skill Level value ${this.options.skillLevel}`);
        this.sendMessage('isready');
    }

    public setDifficulty(elo: number): void {
        this.options.elo = Math.max(300, Math.min(3000, elo));

        // Map Elo to Skill Level (0-20)
        if (elo < 600) {
            this.options.skillLevel = Math.floor((elo - 300) / 75);  // 0-3
            this.options.depth = 3;
            this.options.moveTime = 100;
        } else if (elo < 1000) {
            this.options.skillLevel = Math.floor((elo - 600) / 100) + 4;  // 4-7
            this.options.depth = 6;
            this.options.moveTime = 200;
        } else if (elo < 1500) {
            this.options.skillLevel = Math.floor((elo - 1000) / 100) + 8;  // 8-12
            this.options.depth = 10;
            this.options.moveTime = 500;
        } else if (elo < 2000) {
            this.options.skillLevel = Math.floor((elo - 1500) / 100) + 13;  // 13-17
            this.options.depth = 15;
            this.options.moveTime = 1000;
        } else {
            this.options.skillLevel = Math.min(20, Math.floor((elo - 2000) / 100) + 18);  // 18-20
            this.options.depth = 20;
            this.options.moveTime = 2000;
        }

        // Apply immediately if ready
        if (this.isReady) {
            this.applyOptions();
        }
    }

    public async getBestMove(fen: string): Promise<string | null> {
        if (!this.worker) {
            console.error('Stockfish worker not initialized');
            return null;
        }

        console.log('getBestMove called with depth:', this.options.depth, 'movetime:', this.options.moveTime);

        return new Promise((resolve) => {
            this.pendingResolve = resolve;

            this.sendMessage(`position fen ${fen}`);
            this.sendMessage(`go depth ${this.options.depth} movetime ${this.options.moveTime}`);

            // Timeout fallback - give it more time
            const timeout = Math.max(5000, (this.options.moveTime || 1000) * 2 + 2000);
            setTimeout(() => {
                if (this.pendingResolve) {
                    console.warn('Stockfish timeout after', timeout, 'ms');
                    this.pendingResolve = null;
                    resolve(null);
                }
            }, timeout);
        });
    }

    public stop(): void {
        if (this.worker) {
            this.sendMessage('stop');
        }
    }

    public terminate(): void {
        if (this.worker) {
            this.worker.postMessage('quit');
            this.worker.terminate();
            this.worker = null;
        }
    }

    public isInitialized(): boolean {
        return this.isReady;
    }
}

// Singleton instance
let stockfishInstance: StockfishEngine | null = null;

export const getStockfishEngine = (): StockfishEngine => {
    if (!stockfishInstance) {
        stockfishInstance = new StockfishEngine();
    }
    return stockfishInstance;
};

export const terminateStockfish = (): void => {
    if (stockfishInstance) {
        stockfishInstance.terminate();
        stockfishInstance = null;
    }
};
