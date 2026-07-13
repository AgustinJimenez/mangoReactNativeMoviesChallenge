import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Text, View } from 'react-native';

import { i18next } from '@/i18n';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

// Class component: getDerivedStateFromError/componentDidCatch have no hooks
// equivalent yet. This is the outermost provider (see AppProviders), placed
// above I18nextProvider so it can catch errors thrown anywhere else in the
// tree — including inside the providers themselves. Because of that, the
// fallback below can't rely on the I18nextProvider React context (it may not
// be mounted), so it reads directly from the i18next singleton instead of
// using the useTranslation hook.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled render error', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      // Deliberately not ui/molecules/ErrorState: that component calls
      // useTranslation(), which needs I18nextProvider mounted — this
      // boundary sits above it specifically to catch errors from inside
      // the providers themselves, so its fallback can't depend on any of
      // them being up. Reads the i18next singleton directly instead (see
      // the class comment above).
      return (
        <View className="flex-1 items-center justify-center gap-4 bg-slate-900 p-6">
          <Text className="text-center text-lg font-bold text-white">
            {i18next.t('errorBoundary.title')}
          </Text>
          <Text onPress={this.handleReset} className="text-base font-semibold text-blue-400">
            {i18next.t('retry')}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
