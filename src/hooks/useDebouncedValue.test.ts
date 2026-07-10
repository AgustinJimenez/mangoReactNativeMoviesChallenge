import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  it('updates to the latest value after the delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: '' } },
    );

    expect(result.current).toBe('');

    act(() => {
      rerender({ value: 'fight' });
    });

    expect(result.current).toBe('');

    await waitFor(() => expect(result.current).toBe('fight'));
  });
});
