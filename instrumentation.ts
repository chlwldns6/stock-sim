export async function register() {
  // Node.js 런타임에서만 스케줄러 실행 (Edge 런타임 제외)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('./lib/scheduler');
    startScheduler();
  }
}
