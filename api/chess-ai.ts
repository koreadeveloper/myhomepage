import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { fen, color, validMoves, rating = 800 } = req.body;

    if (!fen || !color || !validMoves) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Adjust playing style based on rating
    const getRatingPrompt = (rating: number): string => {
        if (rating < 400) {
            return `You are a COMPLETE BEGINNER chess player (Elo ~${rating}). You should:
- Make random moves most of the time
- Often miss obvious captures
- Frequently leave pieces hanging (undefended)
- Move the same piece multiple times for no reason
- Ignore threats to your pieces
- Make obviously bad moves like moving the king into danger`;
        } else if (rating < 600) {
            return `You are a VERY WEAK amateur chess player (Elo ~${rating}). You should:
- Sometimes make random or weak moves
- Miss obvious tactics about 70% of the time
- Occasionally leave pieces undefended
- Not think ahead more than 1 move
- Make some basic blunders`;
        } else if (rating < 900) {
            return `You are a BEGINNER chess player (Elo ~${rating}). You should:
- Know basic rules but make tactical errors
- Miss some obvious captures
- Have inconsistent play quality
- Sometimes see 1-move threats but miss 2-move tactics
- Occasionally make positional mistakes`;
        } else if (rating < 1200) {
            return `You are an INTERMEDIATE chess player (Elo ~${rating}). You should:
- Play reasonably but make occasional mistakes
- See most 1-move tactics but miss some 2-move tactics
- Have decent piece development
- Sometimes miss the best move
- Play solid but not optimal chess`;
        } else if (rating < 1500) {
            return `You are a CLUB-LEVEL chess player (Elo ~${rating}). You should:
- Play solid positional chess
- See most tactical patterns
- Occasionally miss complex combinations
- Have good opening knowledge
- Make fewer blunders`;
        } else if (rating < 1800) {
            return `You are a STRONG CLUB chess player (Elo ~${rating}). You should:
- Play very strong chess with few mistakes
- See most tactics and positional ideas
- Have excellent piece coordination
- Only miss very deep combinations`;
        } else if (rating < 2100) {
            return `You are an EXPERT chess player (Elo ~${rating}). You should:
- Play near-optimal moves
- See deep tactics and positional nuances
- Have excellent endgame technique
- Rarely make mistakes`;
        } else {
            return `You are a MASTER-level chess player (Elo ~${rating}). You should:
- Play the BEST possible move in every position
- See all tactics and deep combinations
- Have perfect positional understanding
- Make no mistakes - play like a chess engine`;
        }
    };

    const ratingPrompt = getRatingPrompt(rating);

    const prompt = `${ratingPrompt}

Current position in FEN notation: "${fen}"
It is ${color}'s turn.

Available legal moves: ${validMoves}

Based on your skill level (${rating} Elo), choose an appropriate move. Remember to play at YOUR skill level, not perfectly if your rating is low.

Respond with ONLY the move in this exact format: "e2e4" (from square to square, no spaces, lowercase).`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: rating < 600 ? 1.0 : rating < 1200 ? 0.7 : rating < 1800 ? 0.4 : 0.2, maxOutputTokens: 10 }
            })
        });

        const data = await response.json();
        const moveText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

        if (moveText && moveText.length >= 4) {
            return res.status(200).json({ move: moveText.substring(0, 4) });
        } else {
            return res.status(200).json({ move: null, error: 'Invalid response from AI' });
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        return res.status(500).json({ error: 'Failed to call Gemini API' });
    }
}
