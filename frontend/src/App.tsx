import { AuthGate } from '@/components/auth/AuthGate'
import { AppRouter } from './AppRouter'
import { CardLoader } from '@/components/game/CardLoader'
import { DragProvider } from '@/lib/contexts/DragContext'

function App() {
  return (
    <div className="min-h-screen bg-eth-dark">
      <AuthGate>
        <DragProvider>
          <CardLoader />
          <AppRouter />
        </DragProvider>
      </AuthGate>
    </div>
  )
}

export default App
