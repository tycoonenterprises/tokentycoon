import { create } from 'zustand';

export interface TransactionRecord {
  id: string;
  functionName: string;
  args: any[];
  hash: string;
  gasUsed: bigint;
  gasPrice: bigint;
  totalCost: bigint;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

interface TransactionStore {
  transactions: TransactionRecord[];
  addTransaction: (transaction: TransactionRecord) => void;
  updateTransaction: (id: string, updates: Partial<TransactionRecord>) => void;
  clearTransactions: () => void;
  getTotalGasCost: () => bigint;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  
  addTransaction: (transaction) => 
    set((state) => ({ 
      transactions: [transaction, ...state.transactions] 
    })),
  
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map(tx => 
        tx.id === id ? { ...tx, ...updates } : tx
      )
    })),
  
  clearTransactions: () => 
    set({ transactions: [] }),
  
  getTotalGasCost: () => {
    const state = get();
    return state.transactions
      .filter(tx => tx.status === 'success')
      .reduce((total, tx) => total + tx.totalCost, 0n);
  }
}));