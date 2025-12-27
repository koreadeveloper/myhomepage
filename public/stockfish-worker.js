// Stockfish Web Worker - Using wasmThreadsSupported check
// This version handles both WASM and fallback JS modes

let engine = null;
let messageQueue = [];
let isEngineReady = false;

// Load stockfish from jsdelivr with proper initialization
const script = 'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js';

try {
    importScripts(script);
} catch (e) {
    console.error('Failed to import stockfish script:', e);
}

// stockfish.js 10.0.2 creates a global STOCKFISH function
// It returns an object with postMessage and onmessage
function initEngine() {
    if (typeof STOCKFISH === 'function') {
        console.log('STOCKFISH function found, creating engine...');

        engine = STOCKFISH();

        if (engine) {
            // Set up message handler
            engine.onmessage = function (event) {
                const line = typeof event === 'string' ? event : (event.data || String(event));
                console.log('Engine output:', line);
                postMessage(line);

                // Check if engine is ready
                if (line === 'uciok' || line.includes('uciok')) {
                    isEngineReady = true;
                    // Process queued messages
                    while (messageQueue.length > 0) {
                        const msg = messageQueue.shift();
                        engine.postMessage(msg);
                    }
                }
            };

            // Send UCI init command
            engine.postMessage('uci');
            console.log('UCI command sent');
            return true;
        }
    }
    return false;
}

// Try to initialize
if (!initEngine()) {
    // Fallback: maybe STOCKFISH is defined differently
    console.log('Trying alternative initialization...');

    // Some builds expose it on self
    if (typeof self.STOCKFISH === 'function') {
        engine = self.STOCKFISH();
    } else if (typeof self.Stockfish === 'function') {
        engine = self.Stockfish();
    } else if (typeof Module !== 'undefined' && Module.ccall) {
        // Emscripten module pattern
        console.log('Module pattern detected');
    }

    if (engine && engine.postMessage) {
        engine.onmessage = function (event) {
            const line = typeof event === 'string' ? event : (event.data || String(event));
            postMessage(line);
        };
        engine.postMessage('uci');
    }
}

// Handle messages from main thread
onmessage = function (e) {
    const data = e.data;
    console.log('Worker received:', data);

    if (engine && engine.postMessage) {
        if (isEngineReady) {
            engine.postMessage(data);
        } else {
            // Queue the message until engine is ready
            messageQueue.push(data);
            console.log('Message queued, engine not ready yet');
        }
    } else {
        console.error('No engine available');
    }
};

// Output that worker loaded
postMessage('worker_loaded');
