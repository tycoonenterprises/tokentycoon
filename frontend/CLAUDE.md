# Ethereum Trading Card Game - Frontend Application Specification

## Project Overview

This is a React-based frontend application for an Ethereum Trading Card Game (TCG) that integrates blockchain functionality through Privy authentication and Wagmi for Web3 interactions. The application features a card-based game interface with on-chain capabilities for NFT cards and blockchain transactions.

## Architecture & Technology Stack

### Core Framework
- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom Ethereum-themed colors

### Web3 Integration
- **Privy** (`@privy-io/react-auth v2.21.2`) - Authentication & wallet management
- **Wagmi** (`v2.16.3`) - Ethereum React hooks
- **Viem** (`v2.33.3`) - TypeScript interface for Ethereum
- **Base & Base Sepolia** networks support

### State Management & UI
- **Zustand** (`v5.0.7`) - Global state management
- **Tanstack React Query** (`v5.85.3`) - Server state management
- **Framer Motion** (`v11.18.2`) - Animations
- **DnD Kit** - Drag & drop functionality

### Additional Libraries
- **Colyseus** (`v0.15.25`) - Real-time multiplayer (future integration)
- **PixiJS** (`v8.11.0`) - 2D graphics rendering (future integration)

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── AuthGate.tsx           # Authentication wrapper component
│   └── game/
│       ├── Game.tsx               # Main game container
│       ├── GameBoard.tsx          # Game battlefield display
│       ├── Hand.tsx               # Player's hand of cards
│       ├── PlayerStats.tsx        # Player statistics UI
│       └── Web3Actions.tsx        # Blockchain interaction panel
├── lib/
│   ├── contracts/
│   │   └── CardRegistryABI.ts     # Smart contract ABI definition
│   └── web3/
│       └── config.ts              # Web3 and Privy configuration
├── stores/
│   └── gameStore.ts               # Zustand game state management
├── App.tsx                        # Main application component
└── main.tsx                       # Application entry point
```

## Authentication System

### Privy Configuration
- **App ID**: Uses environment variable `VITE_PRIVY_APP_ID`
- **Login Methods**: Email, wallet, Discord, Farcaster
- **Theme**: Dark mode with Ethereum blue accent (`#627eea`)
- **Embedded Wallets**: Creates wallets for users without existing ones

### Authentication Flow
1. `AuthGate` component wraps the entire application
2. Shows loading state while Privy initializes
3. Displays login interface for unauthenticated users
4. Renders main application once authenticated

## Game System Architecture

### Game State Management (Zustand Store)

#### Core Data Types
```typescript
interface Card {
  id: string
  name: string
  type: 'unit' | 'spell' | 'upgrade' | 'resource'
  cost: { gas?: number; collateral?: number }
  power?: number        // For unit cards
  toughness?: number   // For unit cards
  text: string         // Card description/ability
}

interface PlayerState {
  id: string
  balance: number      // Player's life/health
  gas: number         // Current available gas
  maxGas: number      // Maximum gas per turn
  hand: Card[]        // Cards in hand
  board: Card[]       // Cards on battlefield
}
```

#### Game State
- **Match Management**: Match ID, turn tracking, phase management
- **Player Data**: Support for 2 players with individual states
- **Turn System**: Turn-based gameplay with phase progression
- **Mock Data**: Includes sample cards for testing

### Game Components

#### Game.tsx
- Main game container with matchmaking and gameplay modes
- Toggleable Web3 actions panel
- Turn management controls
- Practice match initialization

#### GameBoard.tsx
- Battlefield visualization with opponent and player sides
- Visual separator between board areas
- Card display on battlefield
- Drag/drop zones for card placement

#### Hand.tsx
- Player's hand display at bottom of screen
- Interactive card previews with hover effects
- Cost display (gas requirements)
- Power/toughness display for units

#### PlayerStats.tsx
- Header UI showing both players' stats
- Balance and gas resource tracking
- Turn indicator with visual feedback
- Phase and turn number display

## Blockchain Integration

### Web3 Configuration
- **Networks**: Base Mainnet (8453) and Base Sepolia testnet
- **Transport**: HTTP providers for both networks
- **Wagmi Integration**: Full React hooks support

### Smart Contract Interface

#### CardRegistryABI
Defines interface for NFT card contract:
- `mintStarterPack(address to)` - Mint new card pack
- `balanceOf(address owner)` - Get player's card count
- `totalSupply()` - Get total cards minted
- `getCard(uint256 tokenId)` - Get card metadata

### Web3Actions Component Features

#### Wallet Operations
- **Message Signing**: Welcome message with timestamp
- **ETH Transactions**: Test transactions (0.001 ETH)
- **Balance Queries**: Real-time balance checking
- **Network Switching**: Switch to Base network

#### Contract Interactions
- **Mock Card Minting**: Placeholder for actual NFT minting
- **Contract Data Display**: Shows balance and total supply
- **Error Handling**: User-friendly error messages

#### UI Features
- **Loading States**: Per-action loading indicators
- **Transaction Tracking**: Hash display for completed transactions
- **Error Display**: Clear error messaging
- **Wallet Info**: Address and chain ID display

## Environment Configuration

### Required Environment Variables
```bash
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_APP_SECRET=your_privy_app_secret  # For server-side operations
```

### Optional Environment Variables
```bash
VITE_OPENAI_API_KEY=your_openai_key      # For AI features
VITE_ANTHROPIC_API_KEY=your_anthropic_key # For AI features
```

## Styling & Theme

### Custom Tailwind Colors
```javascript
colors: {
  'eth-dark': '#1c1c1e',      // Dark background
  'eth-primary': '#627eea',    // Ethereum blue
  'eth-secondary': '#f7931a',  // Bitcoin orange
  'eth-success': '#4ade80',    // Success green
  'eth-danger': '#ef4444',     // Error red
}
```

### Design System
- **Dark Theme**: Primary dark background with contrast elements
- **Card Design**: Gradient backgrounds with glowing borders
- **Interactive Elements**: Hover effects and smooth transitions
- **Responsive Layout**: Mobile-friendly card and UI layouts

## Development Setup

### Package Scripts
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint checking
npm run preview  # Preview production build
```

### Development Dependencies
- **TypeScript**: Strict typing with React types
- **ESLint**: Code quality and React-specific rules
- **PostCSS**: CSS processing with Tailwind
- **Vite**: Fast development server and building

## Future Enhancements

### Planned Integrations
2. **PixiJS Rendering**: Enhanced graphics and animations
3. **Smart Contract Deployment**: Actual NFT minting and trading
4. **Tournament System**: Competitive gameplay modes

### Scalability Considerations
- **Component Architecture**: Modular, reusable components
- **State Management**: Centralized with Zustand
- **Type Safety**: Full TypeScript coverage
- **Performance**: React 19 optimizations and lazy loading

## Implementation Guidelines for Developers

### Key Implementation Steps
1. **Environment Setup**: Configure Privy app and environment variables
2. **Smart Contract Deployment**: Deploy CardRegistry contract to Base network
3. **Contract Integration**: Update contract address in Web3Actions
4. **Authentication Testing**: Verify Privy login methods work
5. **Game Logic Enhancement**: Implement actual card gameplay mechanics
6. **Multiplayer Integration**: Add Colyseus real-time features

### Best Practices
- **Security**: Never commit API keys or secrets to version control
- **Error Handling**: Comprehensive error states for Web3 operations
- **User Experience**: Loading states and transaction feedback
- **Testing**: Unit tests for game logic and Web3 interactions
- **Performance**: Optimize rendering for card animations and effects

### Development Workflow
1. **Local Development**: Use `npm run dev` with mock data
2. **Blockchain Testing**: Test on Base Sepolia testnet first
3. **Production Deployment**: Deploy to Base Mainnet with real contracts
4. **Continuous Integration**: Implement automated testing and deployment

