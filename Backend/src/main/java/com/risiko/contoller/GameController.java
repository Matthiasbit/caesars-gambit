package com.risiko.contoller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.risiko.exception.AppException;
import com.risiko.model.Player;
import com.risiko.model.Room;
import com.risiko.model.Territorries;
import com.risiko.services.AuthService;
import com.risiko.services.RoomService;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Collections;

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
    public SseEmitter stream(@PathVariable("roomId") String roomId,
            @RequestParam(value = "token", required = false) String tokenParam, HttpServletRequest request) {

        Room room = roomService.getRoomById(Integer.parseInt(roomId));

        SseEmitter emitter = new SseEmitter(0L);

        Player player = room.getPlayers().stream()
                .filter(p -> authService.getUserFromAuth().getId() == p.getUserId())
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Player not found in room"));

        if (player.emitter != null) {
            player.emitter.complete();
        }

        player.setEmitter(emitter);
        emitter.onCompletion(() -> System.out.println("SSE connection completed for player " + player.getUsername()));
        emitter.onTimeout(() -> player.setEmitter(null));
        emitter.onError(e -> player.setEmitter(null));

        try {
            emitter.send(SseEmitter.event().name("init").data(room.getLobbyData()).build());
            if (room.isGameStarted()) {
                room.getGamestate().sendGameStateUpdate();
                player.askDistTroops();
                broadcastEvent(Collections.singletonList(emitter), "currentPlayer",
                        room.getGamestate().getCurrentPlayer().getUsername());
                broadcastEvent(Collections.singletonList(emitter), "initialPhase", room.getGamestate().isInitialPhase());
                broadcastEvent(Collections.singletonList(emitter), "gameStarted", true);
            }
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        return emitter;
    }

    @PostMapping("/move")
    public void move(@RequestBody Map<String, Object> request) {
        Room room = roomService.getRoomById(Integer.parseInt(request.get("roomId").toString()));
        if (room.getGamestate().isInitialPhase()) {
            throw new AppException(HttpStatus.CONFLICT, "Cannot move during initial setup phase");
        }
        Player player = room.getPlayers().stream()
                .filter(p -> authService.getUserFromAuth().getId() == p.getUserId())
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Player not found in room"));
        if (player != room.getGamestate().getCurrentPlayer()) {
            throw new AppException(HttpStatus.CONFLICT, "It's not the current player's turn");
        }
        Territorries from = Territorries.getTerritorryByDisplayName((String) request.get("from"));
        Territorries to = Territorries.getTerritorryByDisplayName((String) request.get("to"));
        int sum = ((Number) request.get("sum")).intValue();
        player.moveTroops(from, to, sum);
        room.getGamestate().sendGameStateUpdate();
    }

    @PostMapping("/attack")
    public void attack(@RequestBody Map<String, Object> request) throws InterruptedException {
        Room room = roomService.getRoomById(Integer.parseInt(request.get("roomId").toString()));
        if (room.getGamestate().isInitialPhase()) {
            throw new AppException(HttpStatus.CONFLICT, "Cannot attack during initial setup phase");
        }
        Player player = room.getPlayers().stream()
                .filter(p -> authService.getUserFromAuth().getId() == p.getUserId())
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Player not found in room"));
        if (player != room.getGamestate().getCurrentPlayer()) {
            throw new AppException(HttpStatus.CONFLICT, "It's not the current player's turn");
        }
        room.getGamestate().attack(Territorries.getTerritorryByDisplayName((String) request.get("from")),
                Territorries.getTerritorryByDisplayName((String) request.get("to")), ((Number) request.get("sum")).intValue());
        room.getGamestate().sendGameStateUpdate();
    }

    @PostMapping("/distTroops")
    public void distTroops(@RequestBody Map<String, Object> request) {
        Room room = roomService.getRoomById(Integer.parseInt((String) request.get("roomId")));
        String to = (String) request.get("to");
        int sum = ((Number) request.get("sum")).intValue();
        room.getGamestate().getPlayerByUserId(authService.getUserFromAuth().getId())
                .distTroops(Territorries.getTerritorryByDisplayName(to), sum);
        room.getGamestate().checkInitialPhase();
        room.getGamestate().sendGameStateUpdate();
    }

    @PostMapping("/endTurn")
    public void endTurn(@RequestBody Map<String, Object> request) {
        Room room = roomService.getRoomById(Integer.parseInt((String) request.get("roomId")));
        if (room.getGamestate().isInitialPhase()) {
            throw new AppException(HttpStatus.CONFLICT, "Cannot end turn during initial setup phase");
        }
        Player player = room.getPlayers().stream()
                .filter(p -> authService.getUserFromAuth().getId() == p.getUserId())
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Player not found in room"));
        if (player != room.getGamestate().getCurrentPlayer()) {
            throw new AppException(HttpStatus.CONFLICT, "It's not the current player's turn");
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