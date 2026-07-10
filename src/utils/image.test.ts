import { buildPosterTransitionTag, buildPosterUrl } from '@/utils/image';

describe('buildPosterUrl', () => {
  it('joins the TMDB image CDN base, size, and path', () => {
    expect(buildPosterUrl('/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'w342')).toBe(
      'https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    );
  });

  it('uses the requested size, not a hardcoded one', () => {
    const path = '/poster.jpg';
    expect(buildPosterUrl(path, 'original')).toBe('https://image.tmdb.org/t/p/original/poster.jpg');
  });
});

describe('buildPosterTransitionTag', () => {
  it('builds a tag from mediaType and id', () => {
    expect(buildPosterTransitionTag('movie', 550)).toBe('poster-movie-550');
    expect(buildPosterTransitionTag('tv', 1399)).toBe('poster-tv-1399');
  });

  it('produces different tags for a movie and a tv show sharing the same id', () => {
    expect(buildPosterTransitionTag('movie', 1)).not.toBe(buildPosterTransitionTag('tv', 1));
  });
});
