import { AuthGate } from '@/components/auth/AuthGate'
import { Game } from '@/components/game/Game'
import { CardLoader } from '@/components/game/CardLoader'
import { DragProvider } from '@/lib/contexts/DragContext'
import { PrivyDebugInfo } from '@/components/debug/PrivyDebugInfo'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
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
  )
}

export default App
