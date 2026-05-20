package com.risiko.model;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.risiko.exception.ConflictException;
import com.risiko.contoller.GameController;
import com.risiko.model.dto.ChatMessageDto;
import com.risiko.model.dto.LobbyPlayerDto;
import com.risiko.repository.UserRepository;

public class Room {
    private final int roomId;
    private List<Player> players;
    private boolean gameStarted;
    private Gamestate gamestate;
    private final GameController gameController;
    private final UserRepository userRepository;

    public Room(int roomId, GameController gameController, UserRepository userRepository) {
        this.roomId = roomId;
        this.gameController = gameController;
        this.userRepository = userRepository;
        players = new ArrayList<>();
        gameStarted = false;
    }

    public void joinRoom(long userId, boolean host) {
        if (gameStarted) {
            throw new ConflictException("Das Spiel läuft bereits.");
        }
        Player player = new Player(userId, userRepository);
        players.add(player);
        player.setHost(host);
        List<SseEmitter> emitters = players.stream()
            .map(p -> p.emitter)
            .filter(e -> e != null)
            .collect(Collectors.toList());
        gameController.broadcastEvent(emitters, "playerJoined", getLobbyData());
    }

    public void leaveRoom(long userId) {
        if (gameStarted) {
            throw new ConflictException("Das Spiel läuft bereits.");
        }
        players = players.stream()
            .filter(p -> p.getUserId() != userId)
            .collect(Collectors.toList());
        List<SseEmitter> emitters = players.stream()
            .map(p -> p.emitter)
            .filter(e -> e != null)
            .collect(Collectors.toList());
        gameController.broadcastEvent(emitters, "playerLeft", getLobbyData());
    }

    public List<LobbyPlayerDto> getLobbyData() {
        return players.stream()
            .map(p -> new LobbyPlayerDto(p.username, p.isHost()))
            .collect(Collectors.toList());
    }

    public void startGame() {
        if (gameStarted) {
            throw new IllegalStateException("Game already started");
        }
        gameStarted = true;
        gamestate = new Gamestate(this, players, gameController);
        gamestate.start();
    }

    public void endGame() {
        gameStarted = false;
        gamestate = null;
    }

    public int getRoomId() {
        return roomId;
    }

    public Gamestate getGamestate() {
        return gamestate;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public boolean isGameStarted() {
        return gameStarted;
    }

    public void sendMessage(long userId, String message) {
        Player sender = players.stream()
            .filter(p -> p.getUserId() == userId)
            .findFirst()
            .orElse(null);
        if (sender == null) {
            throw new IllegalArgumentException("User not in room");
        }
        ChatMessageDto formattedMessage = new ChatMessageDto(sender.username, message);
        List<SseEmitter> emitters = players.stream()
            .map(p -> p.emitter)
            .filter(e -> e != null)
            .collect(Collectors.toList());
        gameController.broadcastEvent(emitters, "chatMessage", formattedMessage);
    }

}
