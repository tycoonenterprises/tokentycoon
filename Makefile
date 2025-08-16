.PHONY: help anvil deploy deploy-local stop test build clean

# Default Anvil private key for testing (account #0)
ANVIL_PRIVATE_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

anvil: ## Start Anvil local blockchain
	@echo "Starting Anvil..."
	@anvil --host 0.0.0.0 --port 8545

anvil-background: ## Start Anvil in background
	@echo "Starting Anvil in background..."
	@anvil --host 0.0.0.0 --port 8545 > anvil.log 2>&1 &
	@echo "Anvil started. Check anvil.log for output"
	@sleep 2

deploy-contracts: ## Deploy only the smart contracts
	@echo "Deploying contracts to local Anvil..."
	@PRIVATE_KEY=$(ANVIL_PRIVATE_KEY) forge script script/Deploy.s.sol:Deploy \
		--rpc-url http://localhost:8545 \
		--broadcast \
		-vvv

deploy-cards: ## Initialize cards from JSON (requires CARD_REGISTRY_ADDRESS)
	@echo "Initializing cards from JSON..."
	@npm install
	@node scripts/deployCards.js $(CARD_REGISTRY_ADDRESS)

deploy-decks: ## Initialize decks from JSON (requires DECK_REGISTRY_ADDRESS)
	@echo "Initializing decks from JSON..."
	@npm install
	@node scripts/deployDecks.js $(DECK_REGISTRY_ADDRESS)

deploy-all: ## Deploy all contracts and initialize cards/decks
	@echo "Deploying all contracts and initializing data..."
	@npm install
	@node scripts/deployAll.js

deploy-local: ## Deploy contracts and initialize cards
	@echo "Deploying contracts and initializing cards..."
	@npm install
	@node scripts/deploy.js

deploy: anvil-background deploy-all ## Start Anvil and deploy everything
	@echo "Deployment complete!"

stop: ## Stop Anvil if running in background
	@echo "Stopping Anvil..."
	@pkill anvil || true
	@echo "Anvil stopped"

test: ## Run all tests
	@echo "Running tests..."
	@forge test -vv

test-lobby: ## Run GameLobby tests only
	@echo "Running GameLobby tests..."
	@forge test --match-contract GameLobbyTest -vv

test-cards: ## Run CardRegistry tests only
	@echo "Running CardRegistry tests..."
	@forge test --match-contract CardRegistryTest -vv

build: ## Build contracts
	@echo "Building contracts..."
	@forge build

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@forge clean
	@rm -f anvil.log

install: ## Install dependencies
	@echo "Installing dependencies..."
	@forge install

# Development workflow commands
dev: ## Start Anvil and deploy (keeps Anvil in foreground)
	@echo "Starting development environment..."
	@npm install
	@make build
	@echo "Starting Anvil (press Ctrl+C to stop)..."
	@trap 'echo "\nStopping Anvil..."; exit 0' INT; \
	anvil --host 0.0.0.0 --port 8545 & ANVIL_PID=$$!; \
	sleep 2; \
	echo "Deploying contracts, cards, and decks..."; \
	node scripts/deployAll.js; \
	wait $$ANVIL_PID

verify-deployment: ## Verify contract deployment on localhost
	@echo "Verifying deployment..."
	@cast code $$(forge script script/DeployGameLobby.s.sol:DeployGameLobby --rpc-url http://localhost:8545 --dry-run --silent | grep "GameLobby deployed at:" | awk '{print $$4}') --rpc-url http://localhost:8545 | head -c 100