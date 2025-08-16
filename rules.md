**Game Flow**
1. Draw a card - Action a player takes to start the turn
2. Upkeep - Automatically done after draw a card. Player does not trigger this it just passes through this phase and onto play automatically after the card is drawn. 
*     Gain 1 ETH
3. Play - The game sits in this phase and the player is allowed to play cards from their hand, move ETH on or off cards that allow staking, or move ETH to their cold storage. 
4. End Turn - After the player has performed all the actions they want to take they click end turn. Then the game switches turn to the other player and the other player must click Draw a Card to start their own turn. 

**Playing Cards**
* DeFi cards can be played on a chain or on the battlefield by themself. If they are not placed on a chain they cost 1 more, as they are played on mainnet. Mainnet could be the main section of the battlefield. 
* You can only play cards or move ETH during the play phase
* First player doesn't draw on first turn. When the game is started it immediately goes through the upkeep phase of the first player doing all actions (game never stops in upkeep phase) and then goes to their play phase. 

**Smart Contracts**

* All state and gameplay is done via smart contracts, the frontend should merely be reading and writing to the smart contracts, make sure no gameplay related state is ever stored in the frontend. The frontend should continually read the latest state from the smart contracts and update accordingly. 