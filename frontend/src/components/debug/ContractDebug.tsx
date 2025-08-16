import React, { useState } from 'react';
import { formatEther } from 'viem';
import { useGameEngine } from '@/lib/hooks/useGameEngine';
import { ChevronDown, ChevronUp, Trash2, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

export const ContractDebug: React.FC = () => {
  const { transactions, totalGasCost, clearTransactions } = useGameEngine();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatGas = (value: bigint) => {
    const ethValue = formatEther(value);
    return `${ethValue} ETH`;
  };

  const formatArgs = (args: any[]) => {
    return args.map(arg => {
      if (typeof arg === 'bigint') {
        return arg.toString();
      }
      return JSON.stringify(arg);
    }).join(', ');
  };

  const getStatusIcon = (status: string) => {
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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-w-md">
        {/* Header */}
        <div 
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-medium text-sm">Contract Debug</span>
            <span className="text-xs text-gray-400">({transactions.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {totalGasCost > 0n && (
              <span className="text-xs text-cyan-400 font-mono">
                {formatGas(totalGasCost)}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="border-t border-gray-700">
            {/* Summary */}
            <div className="p-3 bg-gray-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Total Gas Cost:</span>
                <span className="text-sm font-mono text-cyan-400">
                  {formatGas(totalGasCost)}
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
                          {getStatusIcon(tx.status)}
                          <span className="text-white font-medium">
                            {tx.functionName}
                          </span>
                        </div>
                        <span className="text-gray-500">
                          {formatTimestamp(tx.timestamp)}
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
                              <span className="text-gray-500">Gas:</span> {tx.gasUsed.toString()}
                            </span>
                            <span className="text-cyan-400 font-mono">
                              {formatGas(tx.totalCost)}
                            </span>
                          </div>
                        )}
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