import React from 'react';
import { useAccount } from 'wagmi';
import { Users, Crown, Clock, Loader2, Check } from 'lucide-react';

interface GameLobbyProps {
  gameId: number;
  gameState: any;
  availableDecks: any[];
  onStartGame: () => void;
  onBack: () => void;
  isHost: boolean;
  isStartingGame: boolean;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  gameId,
  gameState,
  availableDecks,
  onStartGame,
  onBack,
  isHost,
  isStartingGame
}) => {
  const { address } = useAccount();

  const getDeckName = (deckId: number) => {
    const deck = availableDecks.find(d => d.id === deckId);
    return deck?.name || `Deck #${deckId}`;
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') {
      return 'Waiting for player...';
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isReady = gameState?.player2 && gameState.player2 !== '0x0000000000000000000000000000000000000000';

  return (
    <div className="space-y-6">
      {/* Game Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Game #{gameId}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isReady ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
          }`}>
            {isReady ? 'Ready to Start' : 'Waiting for Player'}
          </span>
        </div>
        {!isReady && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Waiting for an opponent to join...</span>
          </div>
        )}
      </div>

      {/* Players */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Players</h4>
        
        {/* Player 1 (Host) */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-600/20 rounded-full">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    {gameState?.creator === address ? 'You' : 'Player 1'}
                  </span>
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-500">(Host)</span>
                </div>
                <div className="text-sm text-gray-400">
                  {formatAddress(gameState?.creator || '')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Deck</div>
              <div className="text-white font-medium">
                {getDeckName(gameState?.deckIds?.player1 || 1)}
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 */}
        <div className={`rounded-lg p-4 border-2 ${
          isReady ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800 border-dashed'
        }`}>
          {isReady ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-full">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {gameState?.player2 === address ? 'You' : 'Player 2'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatAddress(gameState?.player2 || '')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Deck</div>
                <div className="text-white font-medium">
                  {getDeckName(gameState?.deckIds?.player2 || 1)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              <div className="text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Waiting for player to join...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-600/30 rounded-full mt-0.5">
            <Check className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm text-blue-300">
            {isHost ? (
              <>
                {isReady ? (
                  <p>Both players have joined! You can now start the game.</p>
                ) : (
                  <p>Share this game ID with your opponent: <span className="font-mono font-bold">#{gameId}</span></p>
                )}
              </>
            ) : (
              <p>Waiting for the host to start the game...</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Leave Lobby
        </button>
        
        {isHost && (
          <button
            onClick={onStartGame}
            disabled={!isReady || isStartingGame}
            className={`flex items-center gap-2 ${
              isReady 
                ? 'btn-primary' 
                : 'px-6 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed'
            }`}
          >
            {isStartingGame && <Loader2 className="w-4 h-4 animate-spin" />}
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};