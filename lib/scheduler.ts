import { isMarketOpen } from './market';
import { runAgent } from './runAgent';
import { runScalper } from './runScalper';

function kstTimeStr(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace('T', ' ').slice(0, 19) + ' KST';
}

let wasOpen = false;
let aiTimer: ReturnType<typeof setInterval> | null = null;
let scalperTimer: ReturnType<typeof setInterval> | null = null;
let watchTimer: ReturnType<typeof setInterval> | null = null;

function stopAgents() {
  if (aiTimer) { clearInterval(aiTimer); aiTimer = null; }
  if (scalperTimer) { clearInterval(scalperTimer); scalperTimer = null; }
  console.log(`[scheduler] ${kstTimeStr()} — 장 마감, 에이전트 정지`);
}

async function startAgents() {
  console.log(`[scheduler] ${kstTimeStr()} — 장 시작, 에이전트 가동`);

  // 즉시 1회 실행
  runAgent()
    .then(r => console.log(`[scheduler] AI에이전트: ${JSON.stringify(r)}`))
    .catch(e => console.error('[scheduler] AI에이전트 오류:', e));
  runScalper()
    .then(r => console.log(`[scheduler] 단타봇: ${JSON.stringify(r)}`))
    .catch(e => console.error('[scheduler] 단타봇 오류:', e));

  // AI 에이전트: 5분마다
  aiTimer = setInterval(() => {
    if (!isMarketOpen()) return;
    runAgent()
      .then(r => console.log(`[scheduler] AI에이전트: ${JSON.stringify(r)}`))
      .catch(e => console.error('[scheduler] AI에이전트 오류:', e));
  }, 5 * 60 * 1000);

  // 단타봇: 2분마다
  scalperTimer = setInterval(() => {
    if (!isMarketOpen()) return;
    runScalper()
      .then(r => console.log(`[scheduler] 단타봇: ${JSON.stringify(r)}`))
      .catch(e => console.error('[scheduler] 단타봇 오류:', e));
  }, 2 * 60 * 1000);
}

export function startScheduler() {
  if (watchTimer) return; // 중복 실행 방지

  wasOpen = isMarketOpen();
  // 서버가 장중에 재시작된 경우 즉시 가동
  if (wasOpen) startAgents();

  // 1분마다 장 시작/마감 감지
  watchTimer = setInterval(() => {
    const nowOpen = isMarketOpen();

    if (nowOpen && !wasOpen) {
      wasOpen = true;
      startAgents();
    }

    if (!nowOpen && wasOpen) {
      wasOpen = false;
      stopAgents();
    }
  }, 60 * 1000);

  console.log(`[scheduler] ${kstTimeStr()} — 마켓 스케줄러 시작 (현재 장: ${wasOpen ? '열림' : '닫힘'})`);
}
