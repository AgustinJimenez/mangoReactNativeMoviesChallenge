import { renderWithProviders } from '@/testUtils';
import type { CastMember } from '@/types/media';
import { CastList } from '@/ui/organisms/CastList';

const CAST: CastMember[] = [
  { id: 1, name: 'Edward Norton', character: 'The Narrator', profilePath: '/norton.jpg' },
  { id: 2, name: 'Brad Pitt', character: 'Tyler Durden', profilePath: null },
];

describe('CastList', () => {
  it('renders nothing when there is no cast data', () => {
    const { toJSON } = renderWithProviders(<CastList cast={[]} />);

    expect(toJSON()).toBeNull();
  });

  it('renders each cast member with their character name', () => {
    const { getByText } = renderWithProviders(<CastList cast={CAST} />);

    expect(getByText('Edward Norton')).toBeTruthy();
    expect(getByText('The Narrator')).toBeTruthy();
    expect(getByText('Brad Pitt')).toBeTruthy();
    expect(getByText('Tyler Durden')).toBeTruthy();
  });

  it('falls back to a name-initial avatar when profilePath is missing', () => {
    const { getByText } = renderWithProviders(<CastList cast={CAST} />);

    // Brad Pitt has no profilePath in the fixture above.
    expect(getByText('B')).toBeTruthy();
  });
});
