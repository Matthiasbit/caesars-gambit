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
import com.risiko.model.dto.AttackResultDto;
import com.risiko.model.dto.ContinentConquered;
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
        currentPlayer.setMoved(false);
        int currentIndex = players.indexOf(currentPlayer);
        int nextIndex = (currentIndex + 1) % players.size();
        if (checkIfGameEnded()) {
            return;
        }
        while (players.get(nextIndex).getTerritories().size() == 0) {
            nextIndex = (nextIndex + 1) % players.size();
        }
        currentPlayer = players.get(nextIndex);
        nextMove();
    }

    public boolean checkIfGameEnded() {
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
            return true;
        }
        return false;
    }

    public void attack(Territorries fromTerritory, Territorries toTerritory, int sum) throws InterruptedException {
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
        if (currentPlayer.isMoved()) {
            throw new IllegalArgumentException("Nachdem Truppen verschoben wurden, ist kein Angriff mehr möglich.");
        }
        if (players.stream().anyMatch(p -> p.getTroopstoDist() > 0)) {
            throw new IllegalArgumentException("Ein Spieler hat noch Truppen zu verteilen. Alle Spieler müssen ihre Truppen verteilen, bevor ein Angriff möglich ist.");
        }

        List<Integer> attackerRolls = null;
        List<Integer> defenderRolls = null;
        int lostTroopsAttack = 0;
        int lostTroopsDefence = 0;
        boolean territoryWon = false;

        for (Player p : players) {
            if (p.hasTerritory(toTerritory)) {
                int defenderTroops = p.getTroopsOnTerritory(toTerritory);
                attackerRolls = dice(Math.min(sum, 3));
                defenderRolls = dice(Math.min(defenderTroops, 2));
                lostTroopsDefence = 0;
                lostTroopsAttack = 0;
                for (int i = 0; i < Math.min(Math.min(defenderTroops, 2), sum); i++) {
                    if (attackerRolls.get(i) > defenderRolls.get(i)) {
                        lostTroopsDefence++;
                    } else {
                        lostTroopsAttack++;
                    }
                }
                if (p.defend(toTerritory, lostTroopsDefence) == 0) {
                    territoryWon = true;
                    currentPlayer.getTerritory(toTerritory);
                    currentPlayer.removeTroopsFromTerritory(fromTerritory, lostTroopsAttack);
                    currentPlayer.moveTroops(fromTerritory, toTerritory, sum - lostTroopsAttack);
                    currentPlayer.setMoved(false);
                } else {
                    territoryWon = false;
                    p.removeTroopsFromTerritory(toTerritory, lostTroopsDefence);
                    currentPlayer.removeTroopsFromTerritory(fromTerritory, lostTroopsAttack);
                }
                break;
            }
        }

        AttackResultDto resultDto = new AttackResultDto(
                attackerRolls,
                defenderRolls,
                lostTroopsAttack,
                lostTroopsDefence,
                fromTerritory.getDisplayName(),
                toTerritory.getDisplayName(),
                territoryWon);

        List<SseEmitter> emitters = players.stream()
                .map(pl -> pl.emitter)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        gameController.broadcastEvent(
                emitters,
                "attackResult",
                resultDto);

        Thread.sleep(100);

        for (Continent continent : Continent.values()) {
            if (continent.getTerritories().contains(toTerritory)
                    && continent.isControlledBy(currentPlayer)) {
                ContinentConquered event = new ContinentConquered();
                event.setPlayer(currentPlayer.username);
                event.setContinent(continent.name());
                gameController.broadcastEvent(emitters, "continentConquered", event);
            }
        }

        checkIfGameEnded();
    }

    public static List<Integer> dice(int rollCount) {
        if (rollCount <= 0) {
            return Collections.emptyList();
        }
        List<Integer> rolls = new ArrayList<>(rollCount);
        for (int i = 0; i < rollCount; i++) {
            rolls.add(java.util.concurrent.ThreadLocalRandom.current().nextInt(1, 7));
        }

        rolls.sort(Collections.reverseOrder());
        return rolls;
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

    public List<Player> getPlayers() {
        return players;
    }
}
