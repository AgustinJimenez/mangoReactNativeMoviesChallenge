import { i18next } from '@/i18n';
import { resolveGenreNames } from '@/utils/genres';

const t = i18next.getFixedT('en');

describe('resolveGenreNames', () => {
  it('resolves movie genre ids to localized names', () => {
    expect(resolveGenreNames([18, 53], 'movie', t)).toEqual(['Drama', 'Thriller']);
  });

  it('resolves tv genre ids to localized names, using the tv-specific map', () => {
    // 10765 (Sci-Fi & Fantasy) only exists in the tv map; 18 (Drama) is shared.
    expect(resolveGenreNames([18, 10765], 'tv', t)).toEqual(['Drama', 'Sci-Fi & Fantasy']);
  });

  it('drops unknown genre ids instead of throwing', () => {
    expect(resolveGenreNames([18, 999999], 'movie', t)).toEqual(['Drama']);
  });

  it('returns an empty array for an empty input', () => {
    expect(resolveGenreNames([], 'movie', t)).toEqual([]);
  });
});
