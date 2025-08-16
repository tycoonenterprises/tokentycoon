import { AuthGate } from '@/components/auth/AuthGate'
import { Game } from '@/components/game/Game'
import { CardLoader } from '@/components/game/CardLoader'

function App() {
  return (
    <div className="min-h-screen bg-eth-dark">
      <AuthGate>
        <CardLoader />
        <Game />
      </AuthGate>
    </div>
  )
}

export default App
