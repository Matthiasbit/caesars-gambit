package com.risiko.model;

import java.util.Map;

public class Player {
    private final String username;
    private final int playerId;
    private Map<String, Integer> territories;

    public Player() {
        this.username = "Datenbank Connection";
        this.playerId = "Datenbank Connection".hashCode();
    }

    public void distTroops(String territory, int sum) {}

    public void moveTroops(String from, String to, int sum) {}

    public boolean hasTerritory(String territory) {
        return territories.containsKey(territory);
    }

    public void endMove() {}

    public int defend(String territory) {
        return 0;
    }

    public void getTerritory(String territory) {}

}
