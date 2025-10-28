package com.risiko.model;

import java.util.List;

public class Gamestate {
    private final List<Player> players;
    private final int roomId;

    public Gamestate(int roomId, List<Player> players) {
        this.roomId = roomId;
        this.players = players;
    }

    public void start() {}

    public void nextMove() {}

    public void attack(String territory) {}

}
