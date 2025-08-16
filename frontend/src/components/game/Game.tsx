import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useGameStore, type Card } from '@/stores/gameStore'
import { PlayerStats } from './PlayerStats'
import { DragDropGameBoard } from './DragDropGameBoard'
import { Web3Actions } from './Web3Actions'
import { DeckBuilder } from './DeckBuilder'
import { CardsPage } from './CardsPage'
import { PlayPage } from './PlayPage'
import { ContractDebugPanel } from '@/components/debug/ContractDebugPanel'
import { PrivyDebugInfo } from '@/components/debug/PrivyDebugInfo'

export function Game() {
  const { logout, user } = usePrivy()
  const { 
    startGame, 
    nextPhase, 
    resetGame, 
    isGameActive, 
    currentPhase, 
    activePlayer,
    winner 
  } = useGameStore()
  
  const [showWeb3Panel, setShowWeb3Panel] = useState(false)
  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
  const [showCardsPage, setShowCardsPage] = useState(false)
  const [showPlayPage, setShowPlayPage] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<number | null>(null)
  const [customDeck, setCustomDeck] = useState<Card[] | null>(null)

  const handleStartGame = () => {
    startGame(user?.id || 'player1', 'player2')
  }

  const handleStartWithCustomDeck = () => {
    setShowDeckBuilder(true)
  }

  const handleDeckReady = (deck: Card[]) => {
    setCustomDeck(deck)
    setShowDeckBuilder(false)
    // Here you would modify the game store to use the custom deck
    // For now, we'll just start a regular game
    startGame(user?.id || 'player1', 'player2')
  }

  const handleNextPhase = () => {
    nextPhase()
  }

  const handleLogout = () => {
    resetGame()
    logout()
  }

  const handleOnchainGameStart = (gameId: number) => {
    setCurrentGameId(gameId)
    setShowPlayPage(false)
    // Here we would load the game state from the blockchain
    // and start the game with the decks from the smart contract
    startGame(user?.id || 'player1', 'player2')
  }

  return (
    <div className="min-h-screen bg-eth-dark flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Ethereum TCG</h1>
            <span className="text-sm text-gray-400">
              Welcome, {user?.email?.address || user?.wallet?.address?.slice(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCardsPage(true)}
              className="btn-secondary text-sm"
            >
              🃏 Cards
            </button>
            
            <button
              onClick={() => setShowWeb3Panel(!showWeb3Panel)}
              className="btn-secondary text-sm"
            >
              {showWeb3Panel ? 'Hide' : 'Show'} Web3 Panel
            </button>
            
            {!isGameActive ? (
              <>
                <button
                  onClick={() => setShowPlayPage(true)}
                  className="btn-primary"
                >
                  🎮 Play
                </button>
                <button
                  onClick={handleStartGame}
                  className="btn-secondary text-sm"
                >
                  Practice
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNextPhase}
                  className="btn-primary text-sm"
                  disabled={activePlayer !== 'player1'}
                >
                  Next Phase
                </button>
                <button
                  onClick={resetGame}
                  className="btn-secondary text-sm"
                >
                  Reset Game
                </button>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Game Status */}
      <PlayerStats />

      {/* Game Content */}
      <div className="flex-1 flex">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {!isGameActive && !winner ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">🃏</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Play?
                </h2>
                <p className="text-gray-400 mb-8 max-w-md">
                  Start a practice match to test your deck and learn the game mechanics.
                  You can use the default deck or build a custom one from your NFT cards.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleStartGame}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    🎮 Quick Start
                  </button>
                  <button
                    onClick={handleStartWithCustomDeck}
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    🃏 Custom Deck
                  </button>
                </div>
                {customDeck && (
                  <p className="text-sm text-eth-success mt-4">
                    ✓ Custom deck ready with {customDeck.length} cards
                  </p>
                )}
              </div>
            </div>
          ) : winner ? (
            // Game Over Screen
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">
                  {winner === 'player1' ? '🏆' : '💀'}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {winner === 'player1' ? 'Victory!' : 'Defeat!'}
                </h2>
                <p className="text-gray-400 mb-8">
                  {winner === 'player1' 
                    ? 'Congratulations! You defeated your opponent!' 
                    : 'Better luck next time. Your opponent emerged victorious.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleStartGame}
                    className="btn-primary"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="btn-secondary"
                  >
                    Back to Lobby
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Active Game
            <DragDropGameBoard />
          )}
        </div>

        {/* Web3 Actions Panel */}
        {showWeb3Panel && (
          <div className="w-80 border-l border-gray-700 bg-gray-900">
            <Web3Actions />
          </div>
        )}
      </div>

      {/* Phase Indicator */}
      {isGameActive && !winner && (
        <div className="fixed bottom-4 left-4 bg-eth-dark border border-gray-700 rounded-lg px-4 py-2">
          <div className="text-sm text-white">
            <div className="font-bold">{currentPhase.toUpperCase()} PHASE</div>
            <div className="text-gray-400 text-xs">
              {activePlayer === 'player1' ? 'Your turn' : "Opponent's turn"}
            </div>
          </div>
        </div>
      )}

      {/* Deck Builder Modal */}
      {showDeckBuilder && (
        <DeckBuilder
          onDeckReady={handleDeckReady}
          onClose={() => setShowDeckBuilder(false)}
        />
      )}

      {/* Cards Page Modal */}
      {showCardsPage && (
        <CardsPage onClose={() => setShowCardsPage(false)} />
      )}

      {/* Play Page Modal */}
      {showPlayPage && (
        <PlayPage 
          onClose={() => setShowPlayPage(false)} 
          onGameStart={handleOnchainGameStart}
        />
      )}

      {/* Debug Panels */}
      <PrivyDebugInfo />
      <ContractDebugPanel />
    </div>
  )
}