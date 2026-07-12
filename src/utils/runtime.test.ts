import { formatRuntime } from '@/utils/runtime';

describe('formatRuntime', () => {
  it('formats hours and minutes together', () => {
    expect(formatRuntime(112)).toBe('1h 52m');
  });

  it('formats an exact hour with no trailing minutes', () => {
    expect(formatRuntime(120)).toBe('2h');
  });

  it('formats under an hour as minutes only', () => {
    expect(formatRuntime(45)).toBe('45m');
  });

  it('formats zero minutes', () => {
    expect(formatRuntime(0)).toBe('0m');
  });
});
