# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fully onchain trading card game built with Solidity smart contracts using the Foundry framework. The game features a lobby system, card registry, deck management, and turn-based gameplay with resource management.

## Critical Rules

**NEVER modify cards.json or decks.json files without explicit user request** - These are game balance files that should only be changed when specifically asked.

## Build and Development Commands

```bash
# Development
make dev                # Start local Anvil blockchain and deploy all contracts
make build             # Build smart contracts
make clean             # Clean build artifacts

# Testing
forge test             # Run all tests
forge test -vv         # Run tests with verbose output
forge test -vvv        # Run tests with very verbose output
forge test --match-test testName -vv  # Run specific test
forge test --match-contract ContractName  # Run tests for specific contract

# Deployment
make deploy-all        # Deploy contracts and initialize cards/decks
node scripts/deployAll.js  # Alternative deployment command
```

## Architecture

### Smart Contracts (`src/`)

**GameEngine.sol** - Core game logic consolidating all gameplay:
- Turn management with three-phase system (Draw, Upkeep, Play)
- ETH resource system for playing cards
- Battlefield state management
- Card staking functionality for DeFi cards
- Yield calculation based on staked ETH

**CardRegistry.sol** - Onchain card storage:
- Card definitions with abilities stored as key-value pairs
- CardType enum: Chain, DeFi, EOA, Action
- Ability system supporting income, yield, and draw effects

**DeckRegistry.sol** - Pre-configured deck management:
- Links to CardRegistry for validation
- Expands deck definitions into full card arrays

### Game Phases

Each player's turn automatically executes:
1. **Draw Phase** - Draw 1 card (skipped on first turn of game)
2. **Upkeep Phase** - Gain 1 ETH, trigger upkeep abilities
3. **Play Phase** - Player plays cards and manages resources

### Key Game Mechanics

- **ETH Resources**: Players start with 3 ETH, gain 1 per turn
- **Staking**: DeFi cards can have ETH staked on them for yield
- **Yield**: Returns `stakedETH * yieldAmount` each upkeep
- **Card Types**: 
  - Chain: Permanent cards with ongoing effects
  - DeFi: Can stake ETH for yield returns
  - EOA: Permanent cards with abilities
  - Action: One-time effects, don't stay on battlefield

### Data Files (`data/`)

- `cards.json`: Card definitions (DO NOT MODIFY without explicit request)
- `decks.json`: Pre-built deck configurations (DO NOT MODIFY without explicit request)

### Deployment Scripts (`scripts/`)

- `deployAll.js`: Main deployment script for all contracts and data
- `deployCards.js`: Initialize cards from JSON
- `deployDecks.js`: Initialize decks from JSON

## Testing Approach

Tests use Foundry's forge-std testing framework. Key test patterns:
- Use `vm.prank()` to simulate different players
- Use `vm.expectRevert()` for error condition testing
- Use `vm.expectEmit()` for event verification
- Random hands require conditional testing (check if card exists before testing)

## Configuration

**foundry.toml**: Optimizer enabled with `via_ir = true` to handle stack depth issues

## Common Issues

- **Stack too deep**: Enable optimizer with via-ir in foundry.toml
- **Chain ID errors**: Use custom Anvil chain definition in deployment scripts
- **Random hands in tests**: Use conditional checks since hands are shuffled
- Before you make a commit, always update relevant CLAUDE.md files with information about what you've just built so a future claude instance can easily understand the current state of the system.
- when you start remember to source /Users/chad/.zshenv so forge will work
- never run scripts/deployAll.  if you think hyou need that, use "make dev".  Never update contract addresses unless you're explicitly asked
- alwayws make good git commits attributed to me after all meaningful changes
- never make changes that cause the front end to implement functionality that the smart contracts are supposed to implement.