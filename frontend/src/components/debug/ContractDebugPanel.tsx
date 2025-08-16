import React, { useState, useEffect, useRef } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { GameEngineABI } from '@/lib/contracts/GameEngineABI';
import { formatEther } from 'viem';
import { ChevronDown, ChevronUp, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DebugEvent {
  id: string;
  timestamp: Date;
  type: 'event' | 'function' | 'error';
  name: string;
  args?: any;
  transactionHash?: string;
  blockNumber?: bigint;
  error?: string;
}

interface ContractDebugPanelProps {
  contractAddress?: `0x${string}`;
  gameId?: number;
}

export const ContractDebugPanel: React.FC<ContractDebugPanelProps> = ({ 
  contractAddress = '0x0000000000000000000000000000000000000000',
  gameId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'events' | 'functions' | 'errors'>('all');
  const publicClient = usePublicClient();
  const eventIdCounter = useRef(0);

  const addEvent = (event: Omit<DebugEvent, 'id' | 'timestamp'>) => {
    const newEvent: DebugEvent = {
      ...event,
      id: `event-${eventIdCounter.current++}`,
      timestamp: new Date()
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
  };

  // Watch for GameCreated events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'GameCreated',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'GameCreated',
          args: { gameId: log.args.gameId, creator: log.args.creator, deckId: log.args.deckId },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for GameJoined events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'GameJoined',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'GameJoined',
          args: { gameId: log.args.gameId, player: log.args.player, deckId: log.args.deckId },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for GameStarted events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'GameStarted',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'GameStarted',
          args: { gameId: log.args.gameId, player1: log.args.player1, player2: log.args.player2 },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for TurnStarted events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'TurnStarted',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'TurnStarted',
          args: { gameId: log.args.gameId, player: log.args.player, turnNumber: log.args.turnNumber },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for CardDrawn events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'CardDrawn',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'CardDrawn',
          args: { gameId: log.args.gameId, player: log.args.player, cardId: log.args.cardId },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for CardPlayed events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'CardPlayed',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'CardPlayed',
          args: { 
            gameId: log.args.gameId, 
            player: log.args.player, 
            cardId: log.args.cardId,
            instanceId: log.args.instanceId 
          },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for TurnEnded events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'TurnEnded',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'TurnEnded',
          args: { gameId: log.args.gameId, player: log.args.player },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for ResourcesGained events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'ResourcesGained',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'ResourcesGained',
          args: { gameId: log.args.gameId, player: log.args.player, amount: log.args.amount },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for UpkeepTriggered events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'UpkeepTriggered',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'UpkeepTriggered',
          args: { 
            gameId: log.args.gameId, 
            cardInstanceId: log.args.cardInstanceId,
            abilityName: log.args.abilityName 
          },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Watch for ETHStaked events
  useWatchContractEvent({
    address: contractAddress,
    abi: GameEngineABI,
    eventName: 'ETHStaked',
    onLogs(logs) {
      logs.forEach(log => {
        addEvent({
          type: 'event',
          name: 'ETHStaked',
          args: { 
            gameId: log.args.gameId, 
            player: log.args.player,
            cardInstanceId: log.args.cardInstanceId,
            amount: log.args.amount
          },
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber
        });
      });
    }
  });

  // Intercept contract function calls and errors
  useEffect(() => {
    if (!publicClient || !contractAddress) return;

    const interceptFunctionCall = (functionName: string, args: any) => {
      addEvent({
        type: 'function',
        name: functionName,
        args
      });
    };

    const interceptError = (functionName: string, error: any, args?: any) => {
      let errorMessage = 'Unknown error';
      
      // Parse custom errors from the ABI
      if (error?.data?.errorName) {
        errorMessage = error.data.errorName;
      } else if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      addEvent({
        type: 'error',
        name: functionName,
        error: errorMessage,
        args: args
      });
    };

    // Store original methods
    const originalMethods: { [key: string]: any } = {};
    
    // List of functions to intercept
    const functionsToIntercept = [
      'createGame', 'joinGame', 'startGame', 'playCard', 'endTurn',
      'getGameState', 'getPlayerHand', 'getPlayerBattlefield', 'stakeETH'
    ];

    // Note: In a real implementation, you'd intercept at the wagmi hook level
    // For now, we'll add a global handler that components can call
    (window as any).__debugContractCall = interceptFunctionCall;
    (window as any).__debugContractError = interceptError;

    return () => {
      delete (window as any).__debugContractCall;
      delete (window as any).__debugContractError;
    };
  }, [publicClient, contractAddress]);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'events') return event.type === 'event';
    if (filter === 'functions') return event.type === 'function';
    if (filter === 'errors') return event.type === 'error';
    return true;
  });

  const getEventIcon = (type: DebugEvent['type']) => {
    switch (type) {
      case 'event':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'function':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const formatArgs = (args: any) => {
    if (!args) return '';
    return Object.entries(args)
      .map(([key, value]) => {
        if (typeof value === 'bigint') {
          return `${key}: ${value.toString()}`;
        }
        if (typeof value === 'string' && value.startsWith('0x')) {
          return `${key}: ${value.slice(0, 6)}...${value.slice(-4)}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join(', ');
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[90vw]">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-white">Contract Debug</span>
            <span className="text-xs text-gray-400">({events.length} events)</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isOpen && (
          <div className="border-t border-gray-700">
            <div className="p-3 flex gap-2 border-b border-gray-700">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 text-xs rounded ${
                  filter === 'all' 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('events')}
                className={`px-2 py-1 text-xs rounded ${
                  filter === 'events' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setFilter('functions')}
                className={`px-2 py-1 text-xs rounded ${
                  filter === 'functions' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Functions
              </button>
              <button
                onClick={() => setFilter('errors')}
                className={`px-2 py-1 text-xs rounded ${
                  filter === 'errors' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Errors
              </button>
              <button
                onClick={() => setEvents([])}
                className="ml-auto px-2 py-1 text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 rounded"
              >
                Clear
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No events captured yet
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredEvents.map(event => (
                    <div key={event.id} className="p-2 hover:bg-gray-800/50 text-xs">
                      <div className="flex items-start gap-2">
                        {getEventIcon(event.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{event.name}</span>
                            <span className="text-gray-500">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {event.args && (
                            <div className="mt-1 text-gray-400 break-all">
                              {formatArgs(event.args)}
                            </div>
                          )}
                          {event.transactionHash && (
                            <div className="mt-1 text-gray-500">
                              tx: {event.transactionHash.slice(0, 10)}...
                            </div>
                          )}
                          {event.error && (
                            <div className="mt-1 text-red-400">
                              Error: {event.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};