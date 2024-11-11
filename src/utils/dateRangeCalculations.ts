import { DailyLog } from '../types';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  daysInPeriod: number;
  daysLeft: number;
  daysWithLogs: number;
  remainingDaysForLogs: number;
}

export function calculateDateRange(range: 'week' | 'month'): DateRange {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);

  if (range === 'week') {
    // Get Monday of current week
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    // Set to next Sunday
    endDate.setDate(startDate.getDate() + 6);
  } else {
    // Set to first day of current month
    startDate.setDate(1);
    // Set to last day of current month
    endDate.setMonth(endDate.getMonth() + 1, 0);
  }

  // Set time to start/end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
    daysInPeriod: range === 'week' ? 7 : endDate.getDate(),
    daysLeft: 0, // Will be calculated with logs
    daysWithLogs: 0, // Will be calculated with logs
    remainingDaysForLogs: 0 // Will be calculated with logs
  };
}

export function updateDateRangeWithLogs(
  dateRange: DateRange,
  logs: DailyLog[]
): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const uniqueDates = new Set<string>();

  // Count days with logs
  logs.forEach(log => {
    const logDate = new Date(log.date);
    uniqueDates.add(logDate.toISOString().split('T')[0]);
  });

  // Calculate remaining days excluding today if it has a log
  const hasLogToday = uniqueDates.has(today.toISOString().split('T')[0]);
  const endDate = new Date(dateRange.endDate);
  let daysLeft = 0;
  let currentDate = hasLogToday ? new Date(today.setDate(today.getDate() + 1)) : today;

  while (currentDate <= endDate) {
    daysLeft++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    ...dateRange,
    daysLeft,
    daysWithLogs: uniqueDates.size,
    remainingDaysForLogs: daysLeft
  };
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

export function hasLogForDate(logs: DailyLog[], date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return logs.some(log => new Date(log.date).toISOString().split('T')[0] === dateStr);
}