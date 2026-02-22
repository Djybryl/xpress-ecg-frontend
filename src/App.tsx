import { AuthProvider } from '@/providers/AuthProvider';
import { AppRouter } from '@/router';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
