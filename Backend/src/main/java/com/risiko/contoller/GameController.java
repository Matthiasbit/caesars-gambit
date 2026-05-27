package com.risiko.contoller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.risiko.model.Player;
import com.risiko.model.Room;
import com.risiko.model.Territorries;
import com.risiko.services.AuthService;
import com.risiko.services.RoomService;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {
    private final RoomService roomService;
    private final AuthService authService;

    @Autowired
    public GameController(RoomService roomService, AuthService authService) {
        this.roomService = roomService;
        this.authService = authService;
    }

    @GetMapping("/stream/{roomId}")
    public SseEmitter stream(@PathVariable("roomId") String roomId, @RequestParam(value = "token", required = false) String tokenParam, HttpServletRequest request) {
              
        Room room = roomService.getRoomById(Integer.parseInt(roomId));
        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        SseEmitter emitter = new SseEmitter(0L);
        
        Player player = room.getPlayers().stream()
            .filter(p -> authService.getUserFromAuth().getId() == p.getUserId())
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Player not found in room"));

        player.setEmitter(emitter);
        emitter.onCompletion(() -> player.setEmitter(null));
        emitter.onTimeout(() -> player.setEmitter(null));
        emitter.onError(e -> player.setEmitter(null));

        try {
            emitter.send(SseEmitter.event().name("init").data(room.getLobbyData()).build());
            if(room.isGameStarted()) {
                room.getGamestate().sendGameStateUpdate();
                player.askDistTroops();
            }
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    @PostMapping("/move")
    public void move(@RequestBody Map<String, Object> request) {
        Room room = roomService.getRoomById(Integer.parseInt(request.get("roomId").toString()));
        if (room == null) {
            throw new RuntimeException("Room not found");
        }
        Territorries from = Territorries.getTerritorryByDisplayName((String) request.get("from"));
        Territorries to = Territorries.getTerritorryByDisplayName((String) request.get("to"));
        int sum = ((Number) request.get("sum")).intValue();
        Player current = room.getGamestate().getCurrentPlayer();
        if (sum <= 0) {
            throw new IllegalArgumentException("Die Anzahl der zu verschiebenden Truppen muss positiv sein.");
        }
        if (!current.hasTerritory(from)) {
            throw new IllegalArgumentException("Das Quellgebiet gehört nicht dem aktuellen Spieler.");
        }
        if (!current.hasTerritory(to)) {
            throw new IllegalArgumentException("Das Zielgebiet gehört nicht dem aktuellen Spieler.");
        }
        if (!from.isAdjacentTo(to)) {
            throw new IllegalArgumentException("Die Gebiete sind nicht benachbart.");
        }
        if (current.getTerritories().get(from) <= sum) {
            throw new IllegalArgumentException("Nicht genug Truppen zum Verschieben.");
        }
        current.moveTroops(from, to, sum);
        room.getGamestate().sendGameStateUpdate();
    }
                    
    @PostMapping("/attack")
    public void attack(@RequestBody Map<String, Object> request) {
        Room room = roomService.getRoomById(Integer.parseInt(request.get("roomId").toString()));
        if (room == null) {
            throw new RuntimeException("Room not found");
        }
        room.getGamestate().attack(Territorries.getTerritorryByDisplayName((String) request.get("from")), Territorries.getTerritorryByDisplayName((String) request.get("to")), (Integer) request.get("sum"));
        room.getGamestate().sendGameStateUpdate();
    }

    @PostMapping("/distTroops")
    public void distTroops(@RequestBody Map<String, Object> request) {
        Room room = roomService.getRoomById(Integer.parseInt((String) request.get("roomId")));
        if (room == null) {
            throw new RuntimeException("Room not found");
        }
        String to = (String) request.get("to");
        int sum = ((Number) request.get("sum")).intValue();
        room.getGamestate().getPlayerByUserId(authService.getUserFromAuth().getId()).distTroops(Territorries.getTerritorryByDisplayName(to), sum);
        room.getGamestate().sendGameStateUpdate();
    }

    @PostMapping("/endTurn")
    public void endTurn(@RequestBody Map<String, Object> request) {
        Room room = roomService.getRoomById(Integer.parseInt((String) request.get("roomId")));
        if (room == null) {
            throw new RuntimeException("Room not found");
        }
        room.getGamestate().endMove();
        room.getGamestate().sendGameStateUpdate();
    }

    public void broadcastEvent(List<SseEmitter> emitters, String eventName, Object data) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data).build());
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        }
    }
}