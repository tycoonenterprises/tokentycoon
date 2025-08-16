import { AuthGate } from '@/components/auth/AuthGate'
import { Game } from '@/components/game/Game'

function App() {
  return (
    <div className="min-h-screen bg-eth-dark">
      <AuthGate>
        <Game />
      </AuthGate>
    </div>
  )
}

export default App
