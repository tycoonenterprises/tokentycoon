import { AuthGate } from '@/components/auth/AuthGate'
import { CardLoader } from '@/components/game/CardLoader'
import { DragProvider } from '@/lib/contexts/DragContext'
import { PrivyDebugInfo } from '@/components/debug/PrivyDebugInfo'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppRouter } from '@/AppRouter'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-eth-dark">
        <AuthGate>
          <DragProvider>
            <CardLoader />
            <AppRouter />
          </DragProvider>
        </AuthGate>
      </div>
    </ErrorBoundary>
  )
}

export default App
