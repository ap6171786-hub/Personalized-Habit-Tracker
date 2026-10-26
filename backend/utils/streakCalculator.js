export function calculateStreak(dates) {
  const sortedDates = [...new Set(dates)].sort();
  let longestStreak = 0;
  let run = 0;
  let previousDate;

  for (const date of sortedDates) {
    const currentDate = new Date(`${date}T00:00:00.000Z`);
    const isConsecutive =
      previousDate &&
      (currentDate.getTime() - previousDate.getTime()) / 86_400_000 === 1;
    run = isConsecutive ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previousDate = currentDate;
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  let currentStreak = 0;
  let expectedDate = sortedDates.includes(today) ? today : yesterday;

  for (let index = sortedDates.length - 1; index >= 0; index -= 1) {
    if (sortedDates[index] !== expectedDate) break;
    currentStreak += 1;
    expectedDate = new Date(
      new Date(`${expectedDate}T00:00:00.000Z`).getTime() - 86_400_000,
    )
      .toISOString()
      .slice(0, 10);
  }

  return { currentStreak, longestStreak };
}
