import { renderWithProviders } from '@/testUtils';
import { ListBody } from '@/ui/organisms/ListBody';

const noop = () => {};

describe('ListBody', () => {
  it('shows the loading state while isLoading', () => {
    const { getByText } = renderWithProviders(
      <ListBody
        data={undefined}
        keyExtractor={() => ''}
        renderItem={() => null}
        isLoading
        isFetching={false}
        isError={false}
        onRetry={noop}
        emptyMessage="No results"
        hasNextPage={false}
      />,
    );

    expect(getByText('Loading…')).toBeTruthy();
  });

  it('shows the error state when isError and there is no data', () => {
    const { getByText } = renderWithProviders(
      <ListBody
        data={undefined}
        keyExtractor={() => ''}
        renderItem={() => null}
        isLoading={false}
        isFetching={false}
        isError
        onRetry={noop}
        emptyMessage="No results"
        hasNextPage={false}
      />,
    );

    expect(getByText("We couldn't load this content")).toBeTruthy();
  });

  it('shows the empty message when there is no data and no error', () => {
    const { getByText } = renderWithProviders(
      <ListBody
        data={[]}
        keyExtractor={() => ''}
        renderItem={() => null}
        isLoading={false}
        isFetching={false}
        isError={false}
        onRetry={noop}
        emptyMessage="No results"
        hasNextPage={false}
      />,
    );

    expect(getByText('No results')).toBeTruthy();
  });

  it('renders the results FlatList when there is data', () => {
    const { getByTestId } = renderWithProviders(
      <ListBody
        data={['a', 'b']}
        keyExtractor={(item) => item}
        renderItem={() => null}
        isLoading={false}
        isFetching={false}
        isError={false}
        onRetry={noop}
        emptyMessage="No results"
        hasNextPage={false}
      />,
    );

    expect(getByTestId('media-list')).toBeTruthy();
  });
});
