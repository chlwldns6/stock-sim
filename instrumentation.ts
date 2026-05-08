export async function register() {
  // Vercel에서는 Cron이 에이전트를 직접 호출하므로 setInterval 스케줄러 불필요
  if (process.env.VERCEL) return;
  // 로컬 dev: Edge 런타임 제외하고 스케줄러 실행
  if (process.env.NEXT_RUNTIME !== 'edge') {
    const { startScheduler } = await import('./lib/scheduler');
    startScheduler();
  }
}
