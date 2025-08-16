import { useEffect } from 'react';

export const useContractDebug = (functionName: string, args?: any) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__debugContractCall) {
      (window as any).__debugContractCall(functionName, args);
    }
  }, [functionName, args]);
};

export const logContractCall = (functionName: string, args?: any) => {
  if (typeof window !== 'undefined' && (window as any).__debugContractCall) {
    (window as any).__debugContractCall(functionName, args);
  }
};

export const logContractError = (functionName: string, error: any, args?: any) => {
  if (typeof window !== 'undefined' && (window as any).__debugContractError) {
    (window as any).__debugContractError(functionName, error, args);
  }
};