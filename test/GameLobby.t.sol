// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/GameLobby.sol";

contract GameLobbyTest is Test {
    GameLobby public lobby;
    address public player1 = address(0x1);
    address public player2 = address(0x2);
    address public player3 = address(0x3);

    event GameCreated(uint256 indexed gameId, address indexed creator);
    event GameJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId, address indexed player1, address indexed player2);

    function setUp() public {
        lobby = new GameLobby();
    }

    function testCreateGame() public {
        vm.prank(player1);
        vm.expectEmit(true, true, false, true);
        emit GameCreated(0, player1);
        uint256 gameId = lobby.createGame();
        
        assertEq(gameId, 0);
        
        GameLobby.Game memory game = lobby.getGame(gameId);
        assertEq(game.player1, player1);
        assertEq(game.player2, address(0));
        assertEq(game.isStarted, false);
        assertEq(game.isFinished, false);
    }

    function testJoinGame() public {
        vm.prank(player1);
        uint256 gameId = lobby.createGame();
        
        vm.prank(player2);
        vm.expectEmit(true, true, false, true);
        emit GameJoined(gameId, player2);
        lobby.joinGame(gameId);
        
        GameLobby.Game memory game = lobby.getGame(gameId);
        assertEq(game.player2, player2);
    }

    function testCannotJoinFullGame() public {
        vm.prank(player1);
        uint256 gameId = lobby.createGame();
        
        vm.prank(player2);
        lobby.joinGame(gameId);
        
        vm.prank(player3);
        vm.expectRevert(GameLobby.GameFull.selector);
        lobby.joinGame(gameId);
    }

    function testCannotJoinOwnGame() public {
        vm.prank(player1);
        uint256 gameId = lobby.createGame();
        
        vm.prank(player1);
        vm.expectRevert(GameLobby.AlreadyInGame.selector);
        lobby.joinGame(gameId);
    }

    function testStartGame() public {
        vm.prank(player1);
        uint256 gameId = lobby.createGame();
        
        vm.prank(player2);
        lobby.joinGame(gameId);
        
        vm.prank(player1);
        vm.expectEmit(true, true, true, true);
        emit GameStarted(gameId, player1, player2);
        lobby.startGame(gameId);
        
        GameLobby.Game memory game = lobby.getGame(gameId);
        assertEq(game.isStarted, true);
        assertGt(game.startedAt, 0);
    }

    function testCannotStartGameWithoutSecondPlayer() public {
        vm.prank(player1);
        uint256 gameId = lobby.createGame();
        
        vm.prank(player1);
        vm.expectRevert(GameLobby.GameFull.selector);
        lobby.startGame(gameId);
    }

    function testCannotStartGameTwice() public {
        vm.prank(player1);
        uint256 gameId = lobby.createGame();
        
        vm.prank(player2);
        lobby.joinGame(gameId);
        
        vm.prank(player1);
        lobby.startGame(gameId);
        
        vm.prank(player1);
        vm.expectRevert(GameLobby.GameAlreadyStarted.selector);
        lobby.startGame(gameId);
    }

    function testGetOpenGames() public {
        vm.prank(player1);
        uint256 gameId1 = lobby.createGame();
        
        vm.prank(player2);
        uint256 gameId2 = lobby.createGame();
        
        vm.prank(player3);
        uint256 gameId3 = lobby.createGame();
        
        vm.prank(player1);
        lobby.joinGame(gameId2);
        
        uint256[] memory openGames = lobby.getOpenGames();
        assertEq(openGames.length, 2);
        assertEq(openGames[0], gameId1);
        assertEq(openGames[1], gameId3);
    }

    function testGetOpenGamesExcludesStartedGames() public {
        vm.prank(player1);
        uint256 gameId1 = lobby.createGame();
        
        vm.prank(player2);
        uint256 gameId2 = lobby.createGame();
        
        vm.prank(player3);
        lobby.joinGame(gameId1);
        
        vm.prank(player1);
        lobby.startGame(gameId1);
        
        uint256[] memory openGames = lobby.getOpenGames();
        assertEq(openGames.length, 1);
        assertEq(openGames[0], gameId2);
    }

    function testGetPlayerGames() public {
        vm.prank(player1);
        uint256 gameId1 = lobby.createGame();
        
        vm.prank(player2);
        uint256 gameId2 = lobby.createGame();
        
        vm.prank(player1);
        lobby.joinGame(gameId2);
        
        uint256[] memory player1Games = lobby.getPlayerGames(player1);
        assertEq(player1Games.length, 2);
        assertEq(player1Games[0], gameId1);
        assertEq(player1Games[1], gameId2);
        
        uint256[] memory player2Games = lobby.getPlayerGames(player2);
        assertEq(player2Games.length, 1);
        assertEq(player2Games[0], gameId2);
    }
}