import React, { useState, useEffect, useRef } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { GameEngineABI } from '@/lib/contracts/GameEngineABI';
import { formatEther } from 'viem';
import { ChevronDown, ChevronUp, Activity, AlertCircle, CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';
import { useGameEngine } from '@/lib/hooks/useGameEngine';

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
  const [filter, setFilter] = useState<'all' | 'events' | 'functions' | 'errors' | 'transactions'>('all');
  const [activeTab, setActiveTab] = useState<'events' | 'transactions'>('transactions');
  const publicClient = usePublicClient();
  const eventIdCounter = useRef(0);
  
  // Get transaction data from useGameEngine hook
  const { transactions, totalGasUsed, clearTransactions } = useGameEngine();

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

  const formatGas = (value: bigint) => {
    const ethValue = formatEther(value);
    return `${ethValue} ETH`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`fixed bottom-0 right-0 z-40 bg-gray-900 border border-gray-700 shadow-xl transition-all duration-300 ${
      isOpen ? 'w-96 max-w-[90vw] rounded-t-lg' : 'w-24 h-8 rounded-tl-lg'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between hover:bg-gray-800 transition-colors ${
          isOpen ? 'p-3' : 'p-2'
        }`}
      >
          <div className="flex items-center gap-2">
            <Activity className={`text-cyan-400 ${isOpen ? 'w-5 h-5' : 'w-4 h-4'}`} />
            {isOpen && <span className="font-semibold text-white">Contract Debug</span>}
            {isOpen && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">({transactions.length} tx)</span>
                {totalGasUsed > 0n && (
                  <span className="text-xs text-cyan-400 font-mono">
                    {totalGasUsed.toLocaleString()} gas
                  </span>
                )}
              </div>
            )}
            {!isOpen && transactions.length > 0 && (
              <div className="text-xs text-cyan-400 font-mono">
                {transactions.length}
              </div>
            )}
          </div>
          {isOpen && (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isOpen && (
          <div className="border-t border-gray-700">
            {/* Tab buttons */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'transactions'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Transactions ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'events'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Events ({events.length})
              </button>
            </div>

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <>
                {/* Summary */}
                <div className="p-3 bg-gray-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">Total Gas Used:</span>
                    <span className="text-sm font-mono text-cyan-400">
                      {totalGasUsed.toLocaleString()} gas
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Transactions:</span>
                    <div className="flex gap-2">
                      <span className="text-xs text-green-400">
                        {transactions.filter(tx => tx.status === 'success').length} success
                      </span>
                      <span className="text-xs text-red-400">
                        {transactions.filter(tx => tx.status === 'failed').length} failed
                      </span>
                      <span className="text-xs text-yellow-400">
                        {transactions.filter(tx => tx.status === 'pending').length} pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clear button */}
                {transactions.length > 0 && (
                  <div className="p-2 border-b border-gray-700">
                    <button
                      onClick={clearTransactions}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Transactions
                    </button>
                  </div>
                )}

                {/* Transaction list */}
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {transactions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No transactions yet
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-2 bg-gray-800/30 rounded border border-gray-700/50 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {getTransactionStatusIcon(tx.status)}
                              <span className="text-white font-medium">
                                {tx.functionName}
                              </span>
                            </div>
                            <span className="text-gray-500">
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-gray-400">
                            <div>
                              <span className="text-gray-500">Hash:</span> {truncateHash(tx.hash)}
                            </div>
                            
                            {tx.args.length > 0 && (
                              <div>
                                <span className="text-gray-500">Args:</span> {formatArgs(tx.args)}
                              </div>
                            )}
                            
                            {tx.status === 'success' && tx.gasUsed > 0n && (
                              <div className="flex justify-between">
                                <span>
                                  <span className="text-gray-500">Gas:</span> {tx.gasUsed.toLocaleString()}
                                </span>
                                <span className="text-gray-500 text-[10px]">
                                  ({formatGas(tx.totalCost)})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <>
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
              </>
            )}
          </div>
        )}
    </div>
  );
};