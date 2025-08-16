import { AuthGate } from '@/components/auth/AuthGate'
import { Game } from '@/components/game/Game'
import { CardLoader } from '@/components/game/CardLoader'
import { DragProvider } from '@/lib/contexts/DragContext'
import { PrivyDebugInfo } from '@/components/debug/PrivyDebugInfo'

function App() {
  return (
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
  )
}

export default App
