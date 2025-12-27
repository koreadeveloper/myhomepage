레트로 체스 게임 & AI 봇 구현

[목표]
기존 'Pixel Game Portal' 프로젝트에 추가할 **체스(Chess) 미니게임 컴포넌트(ChessGame)**를 작성해주세요.

[디자인 가이드라인]

Style: Retro Clean. 흰색 배경, 검은색 1px 테두리(border border-black), 직각 모서리(rounded-none), 픽셀 폰트(Silkscreen).

Layout: 메인 게임 목록에서 2x2 (col-span-2 row-span-2) 크기로 강조되어야 합니다.

[핵심 기능 요구사항: Chess vs Bot]

게임 모드:

Player (White) vs Computer AI (Black)

플레이어가 먼저 수를 두면, 컴퓨터가 자동으로 응수하는 턴제 시스템.

AI (Bot) 로직 (필수 구현):

외부 라이브러리(chess.js 등) 사용 금지. 순수 JavaScript로 로직을 구현하세요.

난이도: 초보자도 즐길 수 있는 수준 (예: 랜덤 이동과 기물 가치 판단을 섞은 간단한 알고리즘).

UX: 컴퓨터가 수를 생각하는 동안 "Thinking..." 상태를 표시하여 자연스러운 딜레이(500ms~1s)를 주세요.

체스 규칙 및 기능:

모든 기물(폰, 룩, 나이트, 비숍, 퀸, 킹)의 이동 규칙 구현.

기물 선택 시: 이동 가능한 위치를 보드 위에 점이나 색상으로 하이라이트 표시.

특수 규칙: 캐슬링, 앙파상, 프로모션은 복잡하다면 제외해도 좋으나, 기본 이동과 '잡기'는 완벽해야 함.

체크/체크메이트 판정 (가능하다면 구현).

UI/UX:

보드: 8x8 그리드. 흑/백 칸 색상은 레트로한 녹색/베이지 톤 권장.

기물: 유니코드(♔, ♕, ♖...) 또는 lucide-react 아이콘 사용.

상태창: 현재 누구 턴인지, 잡은 말, 또는 로그 표시.

[기술 제약]

React useState, useEffect를 사용한 상태 관리.

Tailwind CSS로 스타일링.

코드는 하나의 컴포넌트(ChessGame) 내에 작성하되 가독성 있게 구조화할 것.

체스 규칙 완벽 가이드 (The Complete Guide to Chess)

1. 개요 (Overview)

체스는 두 명의 플레이어가 가로세로 8칸(총 64칸)의 보드 위에서 기물을 움직여 상대방의 **킹(King)을 잡을 수 없는 상태(체크메이트)**로 만드는 것을 목표로 하는 전략 보드게임입니다.

**백(White)**과 흑(Black) 진영으로 나뉘며, 항상 백이 먼저 둡니다.

가로줄을 랭크(Rank, 1~8), 세로줄을 **파일(File, a~h)**이라고 부릅니다.

우측 하단 모서리 칸은 항상 흰색이어야 합니다. ("White on Right")

2. 기물의 이동 (Movement of Pieces)

♔ 킹 (King, 왕)

이동: 상, 하, 좌, 우, 대각선 모든 방향으로 1칸만 이동 가능합니다.

특징: 게임에서 가장 중요한 기물입니다. 킹이 잡히면 게임이 끝나는 것이 아니라, 잡힐 위기에 처하면 '체크', 피할 곳이 없으면 '체크메이트'로 게임이 종료됩니다. 킹은 스스로 체크가 되는(잡히는) 위치로 이동할 수 없습니다.

♕ 퀸 (Queen, 여왕)

이동: 상, 하, 좌, 우, 대각선 모든 방향으로 거리 제한 없이 이동 가능합니다.

특징: 룩과 비숍의 능력을 합친 가장 강력한 기물입니다.

♖ 룩 (Rook, 성)

이동: 상, 하, 좌, 우 직선 방향으로 거리 제한 없이 이동 가능합니다.

특징: 캐슬링(Castling)이라는 특수 규칙에 참여합니다.

♗ 비숍 (Bishop, 주교)

이동: 대각선 방향으로 거리 제한 없이 이동 가능합니다.

특징: 처음에 검은 칸에 있던 비숍은 검은 칸으로만, 흰 칸에 있던 비숍은 흰 칸으로만 다닐 수 있습니다.

♘ 나이트 (Knight, 기사)

이동: 'L'자 형태(직선 2칸 + 수직 1칸)로 이동합니다.

특징: 유일하게 다른 기물을 뛰어넘을 수 있습니다. 이동하려는 칸에 아군 기물이 없으면 어디든 갈 수 있습니다.

♙ 폰 (Pawn, 병사)

이동:

기본적으로 앞으로 1칸만 전진합니다. (후퇴 불가)

처음 움직일 때에 한해 앞으로 2칸 전진할 수 있습니다.

공격:

바로 앞의 기물은 잡을 수 없습니다 (길이 막힘).

대각선 앞 1칸에 있는 적 기물만 잡을 수 있습니다.

특수 규칙: 프로모션, 앙파상 (아래 설명 참조).

3. 특수 규칙 (Special Moves)

체스에는 기물의 기본 이동 규칙을 벗어나는 3가지 중요한 특수 규칙이 있습니다.

3.1 캐슬링 (Castling)

킹을 안전한 곳으로 옮기고 룩을 중앙으로 배치하기 위해 킹과 룩을 동시에 움직이는 규칙입니다.

킹사이드 캐슬링: 킹이 우측(킹 쪽)으로 2칸 이동하고, 룩이 킹의 왼쪽 바로 옆으로 건너옵니다.

퀸사이드 캐슬링: 킹이 좌측(퀸 쪽)으로 2칸 이동하고, 룩이 킹의 오른쪽 바로 옆으로 건너옵니다.

조건 (모두 충족해야 함):

킹과 해당 룩이 게임 시작 후 한 번도 움직이지 않았어야 합니다.

킹과 룩 사이에 다른 기물이 없어야 합니다.

현재 킹이 체크 상태가 아니어야 합니다.

킹이 이동하는 경로(2칸)나 도착하는 칸이 적의 공격을 받고 있지 않아야 합니다.

3.2 프로모션 (Promotion, 승격)

폰이 상대방 진영의 끝(8랭크 또는 1랭크)까지 도달하면, 즉시 퀸, 룩, 비숍, 나이트 중 하나로 변신합니다.

보통 가장 강력한 퀸으로 변신합니다.

잡혔던 기물만 부활하는 것이 아니라, 새로운 기물로 바뀌는 개념이므로 퀸이 2개 이상이 될 수도 있습니다.

3.3 앙파상 (En Passant)

'지나가다 잡는다'는 뜻의 프랑스어입니다.

상황: 적의 폰이 처음 움직일 때 2칸을 전진하여 내 폰의 바로 옆에 나란히 섰을 때 발생합니다.

행동: 내 폰은 마치 적 폰이 1칸만 움직였을 때 잡는 것처럼, 대각선 앞으로 이동하며 적 폰을 잡을 수 있습니다.

조건: 적 폰이 2칸 움직인 직후의 차례에만 가능합니다. 다음 턴으로 넘어가면 권한이 사라집니다.

4. 승패 및 종료 조건 (End Game Conditions)

4.1 승리 (Checkmate)

체크 (Check): 킹이 적 기물에게 공격받는 상태입니다. 플레이어는 반드시 이 상태를 벗어나야 합니다.

체크메이트 (Checkmate): 킹이 체크 상태인데, 어떠한 수로도 체크를 피할 수 없는 상태입니다. 이 경우 게임이 즉시 종료되며 체크메이트를 시킨 쪽이 승리합니다.

기권 (Resign): 불리한 상황에서 스스로 패배를 인정하고 게임을 끝낼 수 있습니다.

4.2 무승부 (Draw)

스테일메이트 (Stalemate): 킹이 현재 체크 상태는 아니지만, 킹을 포함한 어떤 기물도 규칙에 맞게 움직일 수 없는 상태입니다. (갇혀버린 상태)

기물 부족 (Insufficient Material): 양쪽 모두 체크메이트를 시킬 수 있는 기물이 없는 경우입니다. (예: K vs K, K+B vs K, K+N vs K)

3회 동형 반복 (Threefold Repetition): 보드 위의 기물 배치와 차례가 완벽히 동일한 상황이 3번 반복되면 무승부를 요청할 수 있습니다.

50수 규칙 (50-Move Rule): 50수 동안 폰의 이동이 없고, 기물을 잡는 행위가 없었다면 무승부를 요청할 수 있습니다.

합의 무승부: 양 플레이어가 서로 무승부에 동의하는 경우입니다.

---

## 5. Stockfish 체스 엔진 통합 계획 🐟

### 5.1 개요

Stockfish는 세계 최강의 오픈소스 체스 엔진으로, Elo 3500+ 수준의 플레이가 가능합니다. 웹 브라우저에서 WebAssembly(WASM)로 실행할 수 있어 서버 없이도 강력한 AI를 구현할 수 있습니다.

### 5.2 구현 방식

| 방식 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **stockfish.js (WASM)** | 브라우저에서 직접 실행 | 서버 불필요, 무료, 빠름 | 번들 +4MB, 초기 로딩 |
| **stockfish.online API** | 외부 API 호출 | 간단한 통합 | 외부 의존성, 레이트 제한 |
| **서버사이드 Stockfish** | 백엔드에서 실행 | 클라이언트 부담 없음 | 서버 비용, 지연 시간 |

**권장:** stockfish.js (WASM) + Web Worker

### 5.3 리소스 요구사항

#### GitHub/Vercel 영향
| 항목 | 크기/시간 | 제한 | 상태 |
|------|-----------|------|------|
| stockfish.js | ~1.5MB | 100MB/파일 | ✅ OK |
| stockfish.wasm | ~2.5MB | 100MB/파일 | ✅ OK |
| 빌드 시간 | +3-5초 | 45분 | ✅ OK |

#### 클라이언트 (브라우저) 영향
| 항목 | 수치 | 비고 |
|------|------|------|
| 초기 다운로드 | ~1.5MB (gzip) | 체스 선택 시 레이지 로딩 |
| WASM 초기화 | ~500ms | 첫 로드 시에만 |
| 메모리 사용 | 50-100MB | 탐색 중 |
| CPU 사용 | 30-100% | 탐색 중, Web Worker로 분리 |

### 5.4 난이도 조절 방법

Stockfish UCI 명령어를 통해 정확한 난이도 조절이 가능합니다:

```
setoption name Skill Level value 10        // 0-20 (0=매우 약함, 20=최강)
setoption name UCI_LimitStrength value true
setoption name UCI_Elo value 1200          // 직접 Elo 레이팅 설정
```

#### 레이팅별 설정 가이드
| 레이팅 | Skill Level | 탐색 깊이 | 시간 제한 | 설명 |
|--------|-------------|-----------|-----------|------|
| 300-600 | 0-3 | 1-3 | 50ms | 🐣 완전 초보 |
| 600-1000 | 4-8 | 4-6 | 100ms | 🐥 입문자 |
| 1000-1500 | 9-14 | 7-10 | 300ms | ♟️ 클럽 수준 |
| 1500-2000 | 15-18 | 11-15 | 500ms | ⚔️ 강한 클럽 |
| 2000+ | 19-20 | 16+ | 1000ms+ | 👑 마스터 |

### 5.5 구현 단계

1. **패키지 설치**
   ```bash
   npm install stockfish
   ```

2. **Web Worker 생성** (메인 스레드 블로킹 방지)
   ```typescript
   // public/stockfish-worker.js
   importScripts('https://cdn.jsdelivr.net/npm/stockfish@16/stockfish.js');
   ```

3. **Stockfish 래퍼 클래스**
   ```typescript
   class StockfishEngine {
     private worker: Worker;
     
     constructor() {
       this.worker = new Worker('/stockfish-worker.js');
       this.worker.postMessage('uci');
       this.worker.postMessage('isready');
     }
     
     setDifficulty(elo: number) {
       this.worker.postMessage(`setoption name UCI_LimitStrength value true`);
       this.worker.postMessage(`setoption name UCI_Elo value ${elo}`);
     }
     
     async getBestMove(fen: string, depth: number): Promise<string> {
       return new Promise((resolve) => {
         this.worker.onmessage = (e) => {
           if (e.data.startsWith('bestmove')) {
             resolve(e.data.split(' ')[1]);
           }
         };
         this.worker.postMessage(`position fen ${fen}`);
         this.worker.postMessage(`go depth ${depth}`);
       });
     }
   }
   ```

4. **레이지 로딩 적용** (체스 선택 시에만 로드)
   ```typescript
   const loadStockfish = async () => {
     const engine = await import('./StockfishEngine');
     return new engine.default();
   };
   ```

5. **chess.js와 통합**
   - FEN 위치 문자열 전달
   - bestmove 응답 수신
   - chess.js로 이동 실행

### 5.6 성능 최적화

```typescript
// 기기 성능에 따른 탐색 깊이 자동 조절
const getDepthByDevice = () => {
  const memory = navigator.deviceMemory || 4; // GB
  const cores = navigator.hardwareConcurrency || 4;
  
  if (memory < 2 || cores < 2) return 5;  // 저사양
  if (memory < 4 || cores < 4) return 10; // 중급
  return 15; // 고사양
};

// CDN에서 로드하여 번들 크기 절약
const worker = new Worker('https://cdn.jsdelivr.net/npm/stockfish@16/stockfish.js');
```

### 5.7 Gemini AI vs Stockfish 비교

| 항목 | Gemini AI | Stockfish |
|------|-----------|-----------|
| **정확도** | 낮음 (LLM 기반) | 매우 높음 (Elo 3500+) |
| **응답 속도** | 1-3초 (API 호출) | 즉시 (로컬 WASM) |
| **난이도 조절** | 프롬프트 기반 (부정확) | UCI Elo 설정 (정확) |
| **서버 의존성** | 있음 (API) | 없음 (클라이언트) |
| **비용** | API 호출 비용 | 무료 |
| **번들 크기** | 0MB | +4MB |
| **오프라인** | ❌ 불가 | ✅ 가능 |

### 5.8 예상 결과

Stockfish 통합 후:
- ✅ 정확한 Elo 레이팅 기반 난이도 조절 (300-2500+)
- ✅ 즉각적인 응답 (API 호출 지연 없음)
- ✅ 완벽한 체스 규칙 준수
- ✅ 오프라인 플레이 가능
- ⚠️ 초기 로딩 +1-2초
- ⚠️ 저사양 기기에서 탐색 깊이 제한 필요