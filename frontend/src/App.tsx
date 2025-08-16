import { AuthGate } from '@/components/auth/AuthGate'
import { CardLoader } from '@/components/game/CardLoader'
import { DragProvider } from '@/lib/contexts/DragContext'
import { PrivyDebugInfo } from '@/components/debug/PrivyDebugInfo'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BrowserRouter } from 'react-router-dom'
import { Game } from '@/components/game/Game'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-eth-dark">
          <AuthGate>
            <div className="p-4">
              <PrivyDebugInfo />
            </div>
            <DragProvider>
              <CardLoader />
              <Game />
            </DragProvider>
          </AuthGate>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
