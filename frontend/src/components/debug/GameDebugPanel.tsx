import React, { useState } from 'react';
import { ChevronUp, Settings, RefreshCw, Database } from 'lucide-react';

interface GameDebugPanelProps {
  showWeb3Panel: boolean;
  onToggleWeb3Panel: () => void;
  onGetGameState: () => void;
  onResetGame: () => void;
}

export const GameDebugPanel: React.FC<GameDebugPanelProps> = ({
  showWeb3Panel,
  onToggleWeb3Panel,
  onGetGameState,
  onResetGame
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-0 right-24 z-40 bg-gray-900 border border-gray-700 shadow-xl transition-all duration-300 ${
      isOpen ? 'w-64 max-w-[60vw] rounded-t-lg' : 'w-20 h-8 rounded-tl-lg'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between hover:bg-gray-800 transition-colors ${
          isOpen ? 'p-3' : 'p-2'
        }`}
      >
        <div className="flex items-center gap-2">
          <Settings className={`text-orange-400 ${isOpen ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {isOpen && <span className="font-semibold text-white">Game Debug</span>}
        </div>
        {isOpen && (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-gray-700 p-3 space-y-2">
          <button
            onClick={onToggleWeb3Panel}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
              showWeb3Panel 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            {showWeb3Panel ? 'Hide' : 'Show'} Web3 Portal
          </button>
          
          <button
            onClick={onGetGameState}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors"
          >
            <Database className="w-4 h-4" />
            Get Game State
          </button>
          
          <button
            onClick={onResetGame}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
};