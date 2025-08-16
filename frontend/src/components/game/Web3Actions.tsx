import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance, useAccount } from 'wagmi'
import { mockContract, getMockContractState } from '@/lib/contracts/mockContract'

interface ActionButtonProps {
  onClick: () => void
  loading: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

function ActionButton({ onClick, loading, disabled = false, children, className = '' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full px-4 py-2 rounded-lg transition-colors ${
        loading || disabled
          ? 'bg-gray-600 cursor-not-allowed'
          : 'btn-primary'
      } ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export function Web3Actions() {
  const { user, signMessage, sendTransaction } = usePrivy()
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  
  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [isSendingTx, setIsSendingTx] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isQueryingContract, setIsQueryingContract] = useState(false)
  
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')
  const [contractData, setContractData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const clearError = () => setError('')

  const handleSignMessage = async () => {
    if (!user) return
    
    setIsSigningMessage(true)
    setError('')
    
    try {
      const message = `Welcome to Ethereum TCG!\n\nTimestamp: ${new Date().toISOString()}\nUser: ${user.id}`
      const signature = await signMessage(message)
      setSignedMessage(signature)
    } catch (err: any) {
      setError(`Message signing failed: ${err.message}`)
    } finally {
      setIsSigningMessage(false)
    }
  }

  const handleSendTransaction = async () => {
    if (!address) return
    
    setIsSendingTx(true)
    setError('')
    
    try {
      // Send a small test transaction (0.001 ETH) to self
      const txResponse = await sendTransaction({
        to: address,
        value: '1000000000000000', // 0.001 ETH in wei
      })
      setTxHash(txResponse)
    } catch (err: any) {
      setError(`Transaction failed: ${err.message}`)
    } finally {
      setIsSendingTx(false)
    }
  }

  const handleMintCards = async () => {
    if (!address) return
    
    setIsMinting(true)
    setError('')
    
    try {
      // Use mock contract for local development
      const tokenIds = await mockContract.mintStarterPack(address)
      console.log('Minted cards with token IDs:', tokenIds)
      
      // Update contract data display
      await handleQueryContract()
    } catch (err: any) {
      setError(`Card minting failed: ${err.message}`)
    } finally {
      setIsMinting(false)
    }
  }

  const handleQueryContract = async () => {
    if (!address) return
    
    setIsQueryingContract(true)
    setError('')
    
    try {
      // Query mock contract data
      const balance = await mockContract.balanceOf(address)
      const totalSupply = await mockContract.totalSupply()
      const userCards = await mockContract.getAllCardsForOwner(address)
      
      setContractData({
        balance,
        totalSupply,
        userCards,
        contractState: getMockContractState()
      })
    } catch (err: any) {
      setError(`Contract query failed: ${err.message}`)
    } finally {
      setIsQueryingContract(false)
    }
  }

  if (!isConnected || !address) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-400 text-sm">
            Connect your wallet to interact with Web3 features
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Web3 Actions</h2>
        <p className="text-sm text-gray-400">
          Interact with the blockchain and smart contracts
        </p>
      </div>

      {/* Wallet Info */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-white mb-3">Wallet Info</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Address:</span>
            <div className="text-white font-mono text-xs break-all">
              {address}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Chain:</span>
            <span className="text-white ml-2">{chain?.name || 'Unknown'} ({chain?.id})</span>
          </div>
          <div>
            <span className="text-gray-400">Balance:</span>
            <span className="text-white ml-2">
              {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-eth-danger/20 border border-eth-danger rounded-lg p-3 mb-4">
          <div className="flex items-start justify-between">
            <div className="text-sm text-eth-danger">{error}</div>
            <button
              onClick={clearError}
              className="text-eth-danger hover:text-red-300 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        {/* Message Signing */}
        <div className="card p-4">
          <h4 className="font-medium text-white mb-3">Message Signing</h4>
          <ActionButton
            onClick={handleSignMessage}
            loading={isSigningMessage}
          >
            Sign Welcome Message
          </ActionButton>
          {signedMessage && (
            <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-gray-300 break-all">
              <div className="text-eth-success mb-1">✓ Message signed:</div>
              {signedMessage.slice(0, 100)}...
            </div>
          )}
        </div>

        {/* Test Transaction */}
        <div className="card p-4">
          <h4 className="font-medium text-white mb-3">Test Transaction</h4>
          <ActionButton
            onClick={handleSendTransaction}
            loading={isSendingTx}
          >
            Send 0.001 ETH to Self
          </ActionButton>
          {txHash && (
            <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-gray-300 break-all">
              <div className="text-eth-success mb-1">✓ Transaction sent:</div>
              {txHash}
            </div>
          )}
        </div>

        {/* Card Contract */}
        <div className="card p-4">
          <h4 className="font-medium text-white mb-3">NFT Cards (Mock)</h4>
          <div className="space-y-2">
            <ActionButton
              onClick={handleMintCards}
              loading={isMinting}
            >
              Mint Starter Pack (5 Cards)
            </ActionButton>
            
            <ActionButton
              onClick={handleQueryContract}
              loading={isQueryingContract}
              className="btn-secondary"
            >
              Query Card Balance
            </ActionButton>
          </div>
          
          {contractData && (
            <div className="mt-3 p-3 bg-gray-800 rounded text-xs">
              <div className="text-white font-medium mb-2">Contract Data:</div>
              <div className="space-y-1 text-gray-300">
                <div>Your Cards: {contractData.balance}</div>
                <div>Total Supply: {contractData.totalSupply}</div>
                <div>Your Card Collection:</div>
                <div className="pl-2 space-y-1 max-h-32 overflow-y-auto">
                  {contractData.userCards.map((card: any) => (
                    <div key={card.tokenId} className="text-xs">
                      #{card.tokenId}: {card.name} ({card.cardType})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Network Status */}
        <div className="card p-4">
          <h4 className="font-medium text-white mb-3">Network Status</h4>
          <div className="text-sm space-y-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-eth-success rounded-full mr-2"></div>
              <span className="text-gray-300">Local Network Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-eth-success rounded-full mr-2"></div>
              <span className="text-gray-300">Mock Contracts Loaded</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              💡 This is using mock data for local development.
              Deploy real contracts to localhost:8545 for full integration.
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <div className="card p-4">
          <h4 className="font-medium text-white mb-3">Development Tools</h4>
          <div className="space-y-2">
            <button
              onClick={() => mockContract.reset()}
              className="btn-secondary w-full text-sm"
            >
              Reset Mock Contract State
            </button>
            <button
              onClick={() => console.log('Contract State:', getMockContractState())}
              className="btn-secondary w-full text-sm"
            >
              Log Contract State to Console
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}