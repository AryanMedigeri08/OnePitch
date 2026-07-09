import { describe, it, expect } from 'vitest';
import {
  cn,
  formatTime,
  formatDate,
  getDensityColor,
  getDensityLabel,
  sleep,
} from '../utils';

describe('cn (classname merger)', () => {
  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });
});

describe('getDensityColor', () => {
  it('returns green for density < 50%', () => {
    expect(getDensityColor(0)).toBe('#00E676');
    expect(getDensityColor(30)).toBe('#00E676');
    expect(getDensityColor(49)).toBe('#00E676');
  });

  it('returns yellow for density 50-69%', () => {
    expect(getDensityColor(50)).toBe('#FFD600');
    expect(getDensityColor(60)).toBe('#FFD600');
    expect(getDensityColor(69)).toBe('#FFD600');
  });

  it('returns orange for density 70-84%', () => {
    expect(getDensityColor(70)).toBe('#FF9100');
    expect(getDensityColor(80)).toBe('#FF9100');
    expect(getDensityColor(84)).toBe('#FF9100');
  });

  it('returns red for density >= 85%', () => {
    expect(getDensityColor(85)).toBe('#FF3D00');
    expect(getDensityColor(100)).toBe('#FF3D00');
  });
});

describe('getDensityLabel', () => {
  it('returns Normal for density < 50%', () => {
    expect(getDensityLabel(0)).toBe('Normal');
    expect(getDensityLabel(49)).toBe('Normal');
  });

  it('returns Moderate for density 50-69%', () => {
    expect(getDensityLabel(50)).toBe('Moderate');
    expect(getDensityLabel(69)).toBe('Moderate');
  });

  it('returns High for density 70-84%', () => {
    expect(getDensityLabel(70)).toBe('High');
    expect(getDensityLabel(84)).toBe('High');
  });

  it('returns Critical for density >= 85%', () => {
    expect(getDensityLabel(85)).toBe('Critical');
    expect(getDensityLabel(100)).toBe('Critical');
  });
});

describe('formatTime', () => {
  it('returns a formatted time string', () => {
    const result = formatTime('2026-06-14T19:00:00.000Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Should contain colons (HH:MM:SS format)
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatDate', () => {
  it('returns a formatted date string', () => {
    const result = formatDate('2026-06-14T19:00:00.000Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Should contain year
    expect(result).toContain('2026');
  });
});

describe('sleep', () => {
  it('resolves after the specified delay', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40); // Allow small timing variance
  });

  it('returns a promise', () => {
    const result = sleep(0);
    expect(result).toBeInstanceOf(Promise);
  });
});
