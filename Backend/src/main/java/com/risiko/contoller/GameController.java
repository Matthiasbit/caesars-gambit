package com.risiko.contoller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.risiko.exception.ForbiddenException;
import com.risiko.exception.NotFoundException;
import com.risiko.model.Player;
import com.risiko.model.User;
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
            throw new NotFoundException("Room not found");
        }

        SseEmitter emitter = new SseEmitter(0L);
        
        Player player = room.getPlayers().stream()
            .filter(p -> authService.getUserFromAuth().getId() == p.getUserId())
            .findFirst()
            .orElseThrow(() -> new NotFoundException("Player not found in room"));

        player.setEmitter(emitter);
        emitter.onCompletion(() -> player.setEmitter(null));
        emitter.onTimeout(() -> player.setEmitter(null));
        emitter.onError(e -> player.setEmitter(null));

        try {
            emitter.send(SseEmitter.event().name("init").data(room.getLobbyData()).build());
            if(room.isGameStarted()) {
                room.getGamestate().sendGameStateUpdate();
            }
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    @PostMapping("/move")
    public void move(@RequestBody Map<String, Object> request) {
        Object roomIdObj = request.get("roomId");
        if (roomIdObj == null) throw new IllegalArgumentException("roomId fehlt.");
        Room room = roomService.getRoomById(Integer.parseInt(roomIdObj.toString()));
        if (room == null) throw new NotFoundException("Room not found");
        Object fromObj = request.get("from");
        Object toObj = request.get("to");
        Object sumObj = request.get("sum");
        if (fromObj == null || toObj == null || sumObj == null) {
            throw new IllegalArgumentException("from, to und sum sind erforderlich.");
        }
        User caller = authService.getUserFromAuth();
        Player current = room.getGamestate().getCurrentPlayer();
        if (current.getUserId() != caller.getId()) {
            throw new ForbiddenException("Nicht dein Zug.");
        }
        Territorries from = Territorries.getTerritorryByDisplayName((String) fromObj);
        Territorries to = Territorries.getTerritorryByDisplayName((String) toObj);
        if (from == null || to == null) throw new IllegalArgumentException("Unbekanntes Gebiet.");
        int sum = ((Number) sumObj).intValue();
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
        Object roomIdObj = request.get("roomId");
        if (roomIdObj == null) throw new IllegalArgumentException("roomId fehlt.");
        Room room = roomService.getRoomById(Integer.parseInt(roomIdObj.toString()));
        if (room == null) throw new NotFoundException("Room not found");
        Object fromObj = request.get("from");
        Object toObj = request.get("to");
        Object sumObj = request.get("sum");
        if (fromObj == null || toObj == null || sumObj == null) {
            throw new IllegalArgumentException("from, to und sum sind erforderlich.");
        }
        User caller = authService.getUserFromAuth();
        Player current = room.getGamestate().getCurrentPlayer();
        if (current.getUserId() != caller.getId()) {
            throw new ForbiddenException("Nicht dein Zug.");
        }
        Territorries from = Territorries.getTerritorryByDisplayName((String) fromObj);
        Territorries to = Territorries.getTerritorryByDisplayName((String) toObj);
        if (from == null || to == null) throw new IllegalArgumentException("Unbekanntes Gebiet.");
        room.getGamestate().attack(from, to, ((Number) sumObj).intValue());
        room.getGamestate().sendGameStateUpdate();
    }

    @PostMapping("/distTroops")
    public void distTroops(@RequestBody Map<String, Object> request) {
        Object roomIdObj = request.get("roomId");
        if (roomIdObj == null) throw new IllegalArgumentException("roomId fehlt.");
        Room room = roomService.getRoomById(Integer.parseInt(roomIdObj.toString()));
        if (room == null) throw new NotFoundException("Room not found");
        Object toObj = request.get("to");
        Object sumObj = request.get("sum");
        if (toObj == null || sumObj == null) throw new IllegalArgumentException("to und sum sind erforderlich.");
        User caller = authService.getUserFromAuth();
        Player player = room.getGamestate().getPlayerByUserId(caller.getId());
        if (player == null) throw new NotFoundException("Player not found in room");
        Territorries to = Territorries.getTerritorryByDisplayName((String) toObj);
        if (to == null) throw new IllegalArgumentException("Unbekanntes Gebiet.");
        player.distTroops(to, ((Number) sumObj).intValue());
        room.getGamestate().sendGameStateUpdate();
    }

    @PostMapping("/endTurn")
    public void endTurn(@RequestBody Map<String, Object> request) {
        Object roomIdObj = request.get("roomId");
        if (roomIdObj == null) throw new IllegalArgumentException("roomId fehlt.");
        Room room = roomService.getRoomById(Integer.parseInt(roomIdObj.toString()));
        if (room == null) throw new NotFoundException("Room not found");
        User caller = authService.getUserFromAuth();
        Player current = room.getGamestate().getCurrentPlayer();
        if (current.getUserId() != caller.getId()) {
            throw new ForbiddenException("Nicht dein Zug.");
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