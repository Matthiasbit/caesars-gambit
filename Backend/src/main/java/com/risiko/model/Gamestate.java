package com.risiko.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.risiko.contoller.GameController;
import com.risiko.model.dto.TerritoryStateDto;

public class Gamestate {
    private final List<Player> players;
    private static final int INITIAL_TROOPS = 40;
    private Player currentPlayer;
    private final GameController gameController;
    private final Room room;

    public Gamestate(Room room, List<Player> players, GameController gameController) {
        this.players = players;
        this.gameController = gameController;
        this.room = room;
    }

    public void start() {
        Collections.shuffle(players);
        List<Territorries> territoryList = new ArrayList<>(Arrays.asList(Territorries.values()));
        Collections.shuffle(territoryList);
        int territoriesPerPlayer = territoryList.size() / players.size();
        List<List<Territorries>> distributedTerritories = new ArrayList<>();
        for (int i = 0; i < players.size(); i++) {
            List<Territorries> playerTerritories = territoryList.subList(
                    i * territoriesPerPlayer,
                    (i + 1) * territoriesPerPlayer);
            distributedTerritories.add(playerTerritories);
        }
        int remaining = territoryList.size() % players.size();
        if (remaining > 0) {
            for (int i = 0; i < remaining; i++) {
                int territoryIndex = (players.size() * territoriesPerPlayer) + i;
                distributedTerritories.get(i).add(territoryList.get(territoryIndex));
            }
        }
        for (int i = 0; i < players.size(); i++) {
            players.get(i).setTerritories(distributedTerritories.get(i));
            players.get(i).setTroopstoDist(INITIAL_TROOPS);
            players.get(i).askDistTroops();
            
        }
        gameController.broadcastEvent(
                players.stream()
                        .map(p -> p.emitter)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList()),
                "gameStarted",
                "The game has started!");
        currentPlayer = players.get(0);
        nextMove();
    }

    public void nextMove() {
        sendGameStateUpdate();
        List<SseEmitter> emitters = players.stream()
                .map(p -> p.emitter)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        gameController.broadcastEvent(emitters, "currentPlayer", currentPlayer.username);
        currentPlayer.setTroopstoDist(calculateReinforcements(currentPlayer));
        currentPlayer.askDistTroops();
    }

    public int calculateReinforcements(Player player) {
        int territoryCount = player.getTerritories().size();
        int continentBonus = 0;
        for (Continent continent : Continent.values()) {
            if (continent.isControlledBy(player)) {
                continentBonus += continent.getBonusTroops();
            }
        }
        return Math.max(3, territoryCount / 3) + continentBonus;
    }

    public void endMove() {
        int currentIndex = players.indexOf(currentPlayer);
        int nextIndex = (currentIndex + 1) % players.size();
        currentPlayer = players.get(nextIndex);
        nextMove();
    }

    public void checkIfGameEnded() {
        List<Player> activePlayers = players.stream()
                .filter(p -> p.getTerritories().size() > 0)
                .collect(Collectors.toList());
        if (activePlayers.size() == 1) {
            Player winner = activePlayers.get(0);
            List<SseEmitter> emitters = players.stream()
                    .map(p -> p.emitter)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            gameController.broadcastEvent(emitters, "gameEnded", "Player " + winner.username + " has won the game!");
            room.endGame();
        }
    }

    public void attack(Territorries fromTerritory, Territorries toTerritory, int sum) {
        if (sum <= 0) {
            throw new IllegalArgumentException("Die Anzahl der angreifenden Truppen muss positiv sein.");
        }
        if (!currentPlayer.hasTerritory(fromTerritory)) {
            throw new IllegalArgumentException("Das Angriffsgebiet gehört nicht dem aktuellen Spieler.");
        }
        if (!fromTerritory.isAdjacentTo(toTerritory)) {
            throw new IllegalArgumentException("Die Gebiete sind nicht benachbart.");
        }
        if (currentPlayer.hasTerritory(toTerritory)) {
            throw new IllegalArgumentException("Das Zielgebiet gehört bereits dem angreifenden Spieler.");
        }
        if (currentPlayer.getTerritories().get(fromTerritory) <= sum) {
            throw new IllegalArgumentException("Nicht genug Truppen für diesen Angriff.");
        }
        for (Player p : players) {
            if (p.hasTerritory(toTerritory)) {
                List<Integer> attackerRolls = dice(Math.min(sum, 3), Math.min(p.getTerritories().get(toTerritory), 2));
                List<Integer> defenderRolls = dice(Math.min(p.getTerritories().get(toTerritory),2), Math.min(p.getTerritories().get(toTerritory), 2));
                int comparisons = Math.min(attackerRolls.size(), defenderRolls.size());
                int lostTroopsDefence = 0;
                int lostTroopsAttack = 0;
                for (int i = 0; i < comparisons; i++) {
                    if (attackerRolls.get(i) > defenderRolls.get(i)) {
                        lostTroopsDefence++;
                    } else {
                        lostTroopsAttack++;
                    }
                }
                if (p.defend(toTerritory, lostTroopsDefence) == 0) {
                    currentPlayer.getTerritory(toTerritory);
                    currentPlayer.getTerritories().put(fromTerritory, currentPlayer.getTerritories().get(fromTerritory) - lostTroopsAttack);
                    currentPlayer.moveTroops(fromTerritory, toTerritory, 1);
                    List<SseEmitter> emitters = new ArrayList<>();
                    emitters.add(currentPlayer.emitter);
                    gameController.broadcastEvent(emitters, "winTerritory", toTerritory + " " + currentPlayer.username);
                    List<SseEmitter> allEmitters = players.stream()
                            .map(pl -> pl.emitter)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                    for (Continent continent : Continent.values()) {
                        if (continent.getTerritories().contains(toTerritory)
                                && continent.isControlledBy(currentPlayer)) {
                            gameController.broadcastEvent(allEmitters, "continentConquered",
                                    continent.name() + " " + currentPlayer.username);
                        }
                    }
                } else {
                    p.getTerritories().put(toTerritory, p.getTerritories().get(toTerritory) - lostTroopsDefence);
                    currentPlayer.getTerritories().put(fromTerritory,
                            currentPlayer.getTerritories().get(fromTerritory) - lostTroopsAttack);
                }
            }
        }

        gameController.broadcastEvent(
                players.stream()
                        .map(pl -> pl.emitter)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList()),
                "attackResult",
                "Attack from " + fromTerritory + " to " + toTerritory + " completed."); // TODO: lost troops hier noch
                                                                                        // einfügen für ui ux nur
                                                                                        // relevant wenn gebiet nicht
                                                                                        // gewonnen wurde
        checkIfGameEnded();
    }

    public static List<Integer> dice(int rollCount, int returnCount) {
        if (rollCount <= 0 || returnCount <= 0) {
            return new ArrayList<>();
        }
        if (returnCount > rollCount) {
            returnCount = rollCount;
        }

        List<Integer> rolls = new ArrayList<>(rollCount);
        for (int i = 0; i < rollCount; i++) {
            rolls.add(java.util.concurrent.ThreadLocalRandom.current().nextInt(1, 7));
        }

        rolls.sort(Collections.reverseOrder());
        return new ArrayList<>(rolls.subList(0, returnCount));
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    public void sendGameStateUpdate() {
        List<TerritoryStateDto> state = new ArrayList<>();
        Territorries[] all = Territorries.values();
        for (Territorries t : all) {
            String display = t.getDisplayName();
            String owner = null;
            int troops = 0;
            for (Player p : players) {
                Map<Territorries, Integer> map = p.getTerritories();
                if (map != null && map.containsKey(t)) {
                    owner = p.username;
                    Integer val = map.get(t);
                    troops = val == null ? 0 : val;
                    break;
                }
            }
            state.add(new TerritoryStateDto(display, owner, troops));
        }
        List<SseEmitter> emitters = players.stream()
                .map(p -> p.emitter)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        gameController.broadcastEvent(emitters, "gameStateUpdate", state);
    }

    public Player getPlayerByUserId(long userId) {
        for (Player p : players) {
            if (p.getUserId() == userId) {
                return p;
            }
        }
        return null;
    }
}
