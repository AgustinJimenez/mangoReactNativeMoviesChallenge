import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Text, View } from 'react-native';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

// Class component: getDerivedStateFromError/componentDidCatch have no hooks
// equivalent yet. This is the outermost provider (see AppProviders) so it can
// catch errors thrown anywhere else in the tree, including in the providers
// themselves.
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
      // TODO(step 8): swap this inline fallback for ui/molecules/ErrorState once it exists.
      return (
        <View className="flex-1 items-center justify-center gap-4 bg-slate-900 p-6">
          <Text className="text-center text-lg font-bold text-white">Algo salió mal</Text>
          <Text onPress={this.handleReset} className="text-base font-semibold text-blue-400">
            Reintentar
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
