import { renderWithProviders } from '@/testUtils';
import { ListTemplate } from '@/ui/templates/ListTemplate';

const noop = () => {};

describe('ListTemplate', () => {
  it('renders the title and subtitle in the header', () => {
    const { getByText } = renderWithProviders(
      <ListTemplate
        data={[]}
        keyExtractor={() => ''}
        renderItem={() => null}
        isLoading={false}
        isFetching={false}
        isError={false}
        onRetry={noop}
        emptyMessage="No results"
        title="Movies"
        subtitle="Discover popular movies"
      />,
    );

    expect(getByText('Movies')).toBeTruthy();
    expect(getByText('Discover popular movies')).toBeTruthy();
  });

  it('omits the search bar when onSearchChange is not provided', () => {
    const { queryByPlaceholderText } = renderWithProviders(
      <ListTemplate
        data={[]}
        keyExtractor={() => ''}
        renderItem={() => null}
        isLoading={false}
        isFetching={false}
        isError={false}
        onRetry={noop}
        emptyMessage="No results"
      />,
    );

    expect(queryByPlaceholderText('Search…')).toBeNull();
  });

  it('shows the stale-data notice when isError and there is cached data', () => {
    const { getByText } = renderWithProviders(
      <ListTemplate
        data={['a']}
        keyExtractor={(item) => item}
        renderItem={() => null}
        isLoading={false}
        isFetching={false}
        isError
        onRetry={noop}
        emptyMessage="No results"
      />,
    );

    expect(getByText("Couldn't refresh, showing saved data")).toBeTruthy();
  });
});
