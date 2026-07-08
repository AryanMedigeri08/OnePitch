import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDensityColor(pct: number): string {
  if (pct < 50) return '#00E676';   // green
  if (pct < 70) return '#FFD600';   // yellow
  if (pct < 85) return '#FF9100';   // orange
  return '#FF3D00';                 // red
}

export function getDensityLabel(pct: number): string {
  if (pct < 50) return 'Normal';
  if (pct < 70) return 'Moderate';
  if (pct < 85) return 'High';
  return 'Critical';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
