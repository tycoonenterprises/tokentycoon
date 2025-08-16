import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance, useAccount } from 'wagmi'
import { useCardRegistry } from '@/lib/hooks/useCardRegistry'
import { useDeckRegistry } from '@/lib/hooks/useDeckRegistry'
import { useGameEngine } from '@/lib/hooks/useGameEngine'

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
  const { user, signMessage, sendTransaction, authenticated, ready, connectWallet, createWallet } = usePrivy()
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  
  // Real contract hooks
  const { cards, cardCount, isInitialized: cardsInitialized, isLoadingCards } = useCardRegistry()
  const { decks, deckCount, isInitialized: decksInitialized, isLoadingDecks } = useDeckRegistry()
  const { sessionCount, availableGames, myGames } = useGameEngine()
  
  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [isSendingTx, setIsSendingTx] = useState(false)
  const [isQueryingContract, setIsQueryingContract] = useState(false)
  
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')
  const [contractData, setContractData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const clearError = () => setError('')

  // Debug user state changes
  useEffect(() => {
    console.log('=== USER STATE CHANGE ===')
    console.log('authenticated:', authenticated)
    console.log('ready:', ready)
    if (user) {
      console.log('user.id:', user.id)
      console.log('user.linkedAccounts:', user.linkedAccounts)
      console.log('wallet accounts:', user.linkedAccounts?.filter(acc => acc.type === 'wallet'))
    }
    console.log('wagmi address:', address)
    console.log('wagmi isConnected:', isConnected)
    console.log('=== END USER STATE ===')
  }, [user, authenticated, ready, address, isConnected])

  const handleSignMessage = async () => {
    if (!user || !authenticated || !ready) {
      setError('User not properly authenticated')
      return
    }
    
    setIsSigningMessage(true)
    setError('')
    
    try {
      console.log('=== PRIVY WALLET DEBUG ===')
      console.log('User authenticated:', authenticated)
      console.log('User ready:', ready)
      console.log('User object:', user)
      console.log('User linkedAccounts:', user.linkedAccounts)
      console.log('Address from wagmi:', address)
      console.log('Is connected from wagmi:', isConnected)
      
      // Check wallets in detail
      const walletAccounts = user.linkedAccounts?.filter(account => account.type === 'wallet') || []
      console.log('Wallet accounts:', walletAccounts)
      
      const embeddedWallets = walletAccounts.filter(account => 
        account.walletClient === 'privy' || account.walletClientType === 'privy'
      )
      console.log('Embedded wallets:', embeddedWallets)
      
      const connectedWallets = walletAccounts.filter(account => 
        account.walletClient !== 'privy' && account.walletClientType !== 'privy'
      )
      console.log('Connected wallets:', connectedWallets)
      
      // If no wallets at all, try to create one
      if (walletAccounts.length === 0) {
        console.log('No wallets found, creating embedded wallet...')
        try {
          const createdWallet = await createWallet()
          console.log('Embedded wallet created:', createdWallet)
          
          // Wait a moment for the wallet to be registered
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Refresh user data
          console.log('Updated user linkedAccounts:', user.linkedAccounts)
        } catch (createErr: any) {
          console.error('Failed to create embedded wallet:', createErr)
          setError(`Failed to create wallet: ${createErr.message}`)
          return
        }
      }
      
      // If still no embedded wallet but has connected wallet, try to connect it
      if (embeddedWallets.length === 0 && connectedWallets.length === 0) {
        console.log('No wallets available, trying to connect...')
        try {
          await connectWallet()
          console.log('Wallet connected successfully')
        } catch (connectErr: any) {
          console.error('Failed to connect wallet:', connectErr)
          setError(`Failed to connect wallet: ${connectErr.message}`)
          return
        }
      }
      
      const message = `Welcome to Ethereum TCG!\n\nTimestamp: ${new Date().toISOString()}\nUser: ${user.id}`
      
      console.log('Attempting to sign message:', message)
      const signResult = await signMessage({ message })
      setSignedMessage(signResult.signature)
      console.log('Message signed successfully:', signResult)
      console.log('=== END DEBUG ===')
    } catch (err: any) {
      console.error('Message signing error:', err)
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code
      })
      setError(`Message signing failed: ${err.message || err}`)
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
      setTxHash(txResponse.hash)
    } catch (err: any) {
      setError(`Transaction failed: ${err.message}`)
    } finally {
      setIsSendingTx(false)
    }
  }

  const handleQueryContract = async () => {
    if (!address) return
    
    setIsQueryingContract(true)
    setError('')
    
    try {
      // Query real contract data
      setContractData({
        cardRegistry: {
          totalCards: cardCount || 0,
          isInitialized: cardsInitialized || false,
          cards: cards || []
        },
        deckRegistry: {
          totalDecks: deckCount || 0,
          isInitialized: decksInitialized || false,
          decks: decks || []
        },
        gameEngine: {
          totalSessions: sessionCount || 0,
          availableGames: availableGames || [],
          myGames: myGames || []
        }
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

        {/* Real Contract Data */}
        <div className="card p-4">
          <h4 className="font-medium text-white mb-3">Smart Contract Registry</h4>
          <div className="space-y-2">
            <ActionButton
              onClick={handleQueryContract}
              loading={isQueryingContract}
              className="btn-primary"
            >
              Query Contract Data
            </ActionButton>
          </div>
          
          {contractData && (
            <div className="mt-3 p-3 bg-gray-800 rounded text-xs">
              <div className="text-white font-medium mb-2">Live Contract Data:</div>
              <div className="space-y-3 text-gray-300">
                
                {/* Card Registry */}
                <div>
                  <div className="text-eth-primary font-medium">📋 Card Registry:</div>
                  <div className="pl-2 space-y-1">
                    <div>Total Cards: {contractData.cardRegistry.totalCards}</div>
                    <div>Initialized: {contractData.cardRegistry.isInitialized ? '✅' : '❌'}</div>
                    {contractData.cardRegistry.cards.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <div>Available Cards:</div>
                        <div className="pl-2 space-y-1 max-h-20 overflow-y-auto">
                          {contractData.cardRegistry.cards.map((card: any, idx: number) => (
                            <div key={idx} className="text-xs">
                              {card.name} (Type: {card.cardType}, Cost: {card.cost})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deck Registry */}
                <div>
                  <div className="text-eth-secondary font-medium">🃏 Deck Registry:</div>
                  <div className="pl-2 space-y-1">
                    <div>Total Decks: {contractData.deckRegistry.totalDecks}</div>
                    <div>Initialized: {contractData.deckRegistry.isInitialized ? '✅' : '❌'}</div>
                    {contractData.deckRegistry.decks.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <div>Available Decks:</div>
                        <div className="pl-2 space-y-1 max-h-20 overflow-y-auto">
                          {contractData.deckRegistry.decks.map((deck: any, idx: number) => (
                            <div key={idx} className="text-xs">
                              {deck.name}: {deck.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Engine */}
                <div>
                  <div className="text-eth-success font-medium">🎮 Game Engine:</div>
                  <div className="pl-2 space-y-1">
                    <div>Total Sessions: {contractData.gameEngine.totalSessions}</div>
                    <div>Available Games: {contractData.gameEngine.availableGames.length}</div>
                    <div>My Games: {contractData.gameEngine.myGames.length}</div>
                  </div>
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
              <span className="text-gray-300">Local Anvil Network (Chain ID: 31337)</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-eth-success rounded-full mr-2"></div>
              <span className="text-gray-300">Smart Contracts Deployed</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${cardsInitialized ? 'bg-eth-success' : 'bg-gray-500'}`}></div>
              <span className="text-gray-300">Cards Initialized: {cardsInitialized ? 'Yes' : 'Loading...'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${decksInitialized ? 'bg-eth-success' : 'bg-gray-500'}`}></div>
              <span className="text-gray-300">Decks Initialized: {decksInitialized ? 'Yes' : 'Loading...'}</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              🎉 Using real smart contracts deployed to localhost:8545!
              <br />
              All card and game data is stored on the blockchain.
            </div>
          </div>
        </div>

        {/* Contract Addresses */}
        <div className="card p-4">
          <h4 className="font-medium text-white mb-3">Contract Addresses</h4>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-gray-400">CardRegistry:</span>
              <div className="text-eth-primary break-all">0x5FbDB2315678afecb367f032d93F642f64180aa3</div>
            </div>
            <div>
              <span className="text-gray-400">DeckRegistry:</span>
              <div className="text-eth-secondary break-all">0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</div>
            </div>
            <div>
              <span className="text-gray-400">GameEngine:</span>
              <div className="text-eth-success break-all">0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}