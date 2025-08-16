import { AuthGate } from '@/components/auth/AuthGate'
import { Game } from '@/components/game/Game'
import { CardLoader } from '@/components/game/CardLoader'
import { DragProvider } from '@/lib/contexts/DragContext'

function App() {
  return (
    <div className="min-h-screen bg-eth-dark">
      <AuthGate>
        <DragProvider>
          <CardLoader />
          <Game />
        </DragProvider>
      </AuthGate>
    </div>
  )
}

export default App
