export function getDeadlineContext(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay();
  const hour = kst.getUTCHours();
  const minute = kst.getUTCMinutes();

  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const deadlineMinutesFromMidnight = 23 * 60;
  const currentMinutesFromMidnight = hour * 60 + minute;

  let totalMinutesLeft: number;
  if (daysUntilSunday === 0) {
    totalMinutesLeft = deadlineMinutesFromMidnight - currentMinutesFromMidnight;
    if (totalMinutesLeft < 0) totalMinutesLeft += 7 * 24 * 60;
  } else {
    totalMinutesLeft = daysUntilSunday * 24 * 60 - currentMinutesFromMidnight + deadlineMinutesFromMidnight;
  }

  const daysLeft = Math.floor(totalMinutesLeft / (24 * 60));
  const hoursLeft = Math.floor((totalMinutesLeft % (24 * 60)) / 60);
  const minutesLeft = totalMinutesLeft % 60;

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const todayName = dayNames[day];
  const kstTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  let urgency = '';
  if (daysLeft === 0 && hoursLeft < 3) {
    urgency = '🚨 마감 3시간 이내!! 현금도 전부 투입, 손실 종목 전량 손절, 지금 당장 올인!';
  } else if (daysLeft === 0) {
    urgency = '🔥 오늘 마감! 손실 종목 즉시 정리하고 반등 가능 종목에 최대한 베팅!';
  } else if (daysLeft <= 2) {
    urgency = '⚠️ 마감 임박! 수익 종목 유지, 손실 종목 정리, 추가 수익 기회 적극 탐색!';
  } else {
    urgency = '📅 시간 있음. 전략적으로 수익을 누적하세요.';
  }

  return `현재 한국 시간: ${todayName}요일 ${kstTimeStr}
실적 평가 마감: 매주 일요일 23:00
마감까지: ${daysLeft}일 ${hoursLeft}시간 ${minutesLeft}분
${urgency}`;
}
