package com.risiko.model;

import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.risiko.contoller.GameController;
import com.risiko.repository.UserRepository;

public class Player {
    public final String username;
    private final long userId;
    private Map<Territorries, Integer> territories;
    public SseEmitter emitter;
    private boolean host;
    private int troopstoDist;
    private final GameController gameController;

    public Player(long userId, UserRepository userRepository, GameController gameController) {
        this.userId = userId;
        this.gameController = gameController;
        Optional<User> user = userRepository.findById(userId);
        this.username = user.isPresent() ? user.get().getUsername() : "Unknown";
    }

    public void setTerritories(List<Territorries> territories) {
        this.territories = new HashMap<>();
        for (Territorries t : territories) {
            this.territories.put(t, 1);
            this.troopstoDist -= 1;
        }
    }

    public java.util.Map<Territorries, Integer> getTerritories() {
        return territories == null ? Collections.emptyMap() : territories;
    }

    public void distTroops(Territorries territory, int sum) {
        if (troopstoDist - sum < 0) {
            throw new IllegalArgumentException("Cannot distribute more troops than available");
        }
        if (sum < 0 ) {
            throw new IllegalArgumentException("Cannot distribute negative troops");
        }
        troopstoDist -= sum;
        territories.put(territory, territories.get(territory) + sum);
    }

    public void moveTroops(Territorries from, Territorries to, int sum) {
        territories.put(from, territories.get(from) - sum);
        territories.put(to, territories.get(to) + sum);
    }

    public boolean hasTerritory(Territorries territory) {
        return territories.containsKey(territory);
    }

    public int defend(Territorries territory, int lostTroops) {
        if (territories.get(territory) <= lostTroops) {
            territories.remove(territory);
            return 0;
        }
        return territories.get(territory) - lostTroops;
    }

    public void getTerritory(Territorries territory) {
        territories.put(territory, 0);
    }

    public void askDistTroops() {
        if (troopstoDist == 0) {
            return;
        }
        gameController.broadcastEvent(Collections.singletonList(emitter), "askDistTroops", troopstoDist);
    }

    public void setEmitter(SseEmitter emitter) {
        this.emitter = emitter;
    }

    public long getUserId() {
        return userId;
    }

    public boolean isHost() {
        return host;
    }

    public void setHost(boolean host) {
        this.host = host;
    }

    public void setTroopstoDist(int troopstoDist) {
        this.troopstoDist += troopstoDist;
    }

    public int getTroopstoDist() {
        return troopstoDist;
    }
}
