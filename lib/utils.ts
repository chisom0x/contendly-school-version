import { ActivityStatus } from '@/lib/types';

const lagosZone = 'Africa/Lagos';

export function formatStatusDate(iso: string): string {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: lagosZone
  }).format(date);
  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: lagosZone
  }).format(date);

  return `${datePart.replace(' ', ' ')} · ${timePart}`;
}

export function formatOpenDateLine(iso: string): string {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: lagosZone
  }).format(date);
  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: lagosZone
  }).format(date);

  return `${datePart} · ${timePart}`;
}

export function formatSessionDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: lagosZone
  })
    .format(new Date(iso))
    .toUpperCase();
}

export function formatTimeRange(iso: string, durationMinutes = 90): string {
  const startDate = new Date(iso);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: lagosZone
    }).format(date);

  return `${formatTime(startDate)} - ${formatTime(endDate)} WAT`;
}

export function formatCompletionDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: lagosZone
  }).format(new Date(iso));
}

export function getCountdownParts(targetIso: string) {
  const now = Date.now();
  const target = new Date(targetIso).getTime();
  const diff = Math.max(target - now, 0);

  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    isLive: diff <= 0,
    days,
    hours,
    minutes
  };
}

export function isActivityAccessible(status: ActivityStatus): boolean {
  return status === 'completed' || status === 'in_progress' || status === 'open';
}
