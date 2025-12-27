// Stockfish Web Worker - Single-threaded version (no SharedArrayBuffer required)
// Uses stockfish.js that works in all browsers

let engine = null;
let isReady = false;

// Use the older JS version that doesn't require SharedArrayBuffer
importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');

if (typeof STOCKFISH === 'function') {
    engine = STOCKFISH();

    // The older stockfish.js uses a print callback
    engine.print = function (line) {
        postMessage(line);
    };

    // Also handle onmessage style
    engine.onmessage = function (event) {
        const line = typeof event === 'string' ? event : (event.data || event);
        postMessage(line);
    };

    // Send UCI initialization
    engine.postMessage('uci');

    console.log('Stockfish engine created successfully');
} else {
    console.error('STOCKFISH function not found');
}

// Handle messages from main thread
onmessage = function (e) {
    if (engine && engine.postMessage) {
        console.log('Sending to Stockfish:', e.data);
        engine.postMessage(e.data);
    } else {
        console.error('Engine not ready, message dropped:', e.data);
    }
};
