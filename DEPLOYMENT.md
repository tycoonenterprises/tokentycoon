# Deployment Guide

## GitHub Pages Deployment

The frontend is automatically deployed to GitHub Pages when you push to the `main` branch.

### Prerequisites

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. **Set Repository Secrets** (optional):
   - `VITE_PRIVY_APP_ID`: Your Privy app ID for production
   - If not set, it will use a default value

3. **Ensure Contract Addresses are Updated**:
   - The file `base-sepolia-addresses.json` must contain the deployed contract addresses
   - These are automatically read during the build process

### Manual Deployment

You can also trigger deployment manually:
1. Go to Actions tab in your repository
2. Select "Deploy Frontend to GitHub Pages"
3. Click "Run workflow"

### Configuration

The deployment automatically:
- Uses Base Sepolia network (chain ID: 84532)
- Reads contract addresses from `base-sepolia-addresses.json`
- Updates the frontend configuration
- Builds and deploys to GitHub Pages

### Accessing the Deployed Site

Once deployed, your game will be available at:
```
https://[your-username].github.io/EthereumCardGame/
```

### Local Testing

To test the production build locally:

```bash
cd frontend
npm run build
npm run preview
```

## Base Sepolia Contract Addresses

Current deployed contracts (from `base-sepolia-addresses.json`):
- **CardRegistry**: 0x8f0c54b31077a505A98fCE72FBc2eeF247F40550
- **DeckRegistry**: 0x464636fAC3b95EB37B9C5e1CFDa13A1d5E382D64
- **GameEngine**: 0x947F43184d438d7C4D0ceBD9D28751e7C5296891

## Updating Contracts

If you redeploy contracts:
1. Update `base-sepolia-addresses.json` with new addresses
2. Push to main branch - GitHub Actions will automatically redeploy with new addresses

## Troubleshooting

### Build Failures
- Check that all contract addresses in `base-sepolia-addresses.json` are valid
- Ensure npm dependencies are up to date

### Runtime Issues
- Users need Base Sepolia ETH to play
- Get test ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Privy Configuration
- Make sure your Privy app is configured to allow the GitHub Pages domain
- Add `https://[your-username].github.io` to allowed domains in Privy dashboard