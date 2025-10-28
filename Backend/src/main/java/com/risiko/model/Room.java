package com.risiko.model;

import java.util.List;

public class Room {
    private final int roomId;
    private List<Player> players;
    private boolean gameStarted;

    public Room() {
        this.roomId = (int)Math.random();
    }

    public void joinRoom() {}

    public void leaveRoom() {}

    public void startGame() {}

    public void endGame() {}
}
