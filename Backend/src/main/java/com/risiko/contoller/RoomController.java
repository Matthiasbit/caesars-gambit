package com.risiko.contoller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

import com.risiko.exception.ForbiddenException;
import com.risiko.exception.NotFoundException;
import com.risiko.model.Room;
import com.risiko.repository.UserRepository;
import com.risiko.services.AuthService;
import com.risiko.services.RoomService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RoomController {

    @Autowired
    private RoomService roomService;
    private final GameController gameController;
    private final AuthService authService;

    @Autowired
    public RoomController(GameController gameController, UserRepository userRepository, AuthService authService) {
        this.gameController = gameController;
        this.authService = authService;
    }

    @PostMapping("/create")
    public int createRoom() {
        Room created = roomService.createRoom(gameController);
        return created.getRoomId();
    }

    @PostMapping("/join/{roomId}")
    public void joinRoom(@PathVariable("roomId") int roomId, @RequestBody(required = false) Map<String, Object> body) {
        boolean host = false;
        if (body != null && body.containsKey("host")) {
            Object hostObj = body.get("host");
            if (hostObj instanceof Boolean) host = (Boolean) hostObj;
            else host = Boolean.parseBoolean(hostObj.toString());
        }
        if (!roomService.joinRoom(roomId, authService.getUserFromAuth().getId(), host)) {
            throw new NotFoundException("Room not found");
        }
    }
    
    @PostMapping("/leave/{roomId}")
     public void leaveRoom(@PathVariable("roomId") int roomId) {
        if (!roomService.leaveRoom(roomId, authService.getUserFromAuth().getId())) {
            throw new NotFoundException("Room not found");
        }
    }

    @PostMapping("/message/{roomId}")
    public void sendMessage(@PathVariable("roomId") int roomId, @RequestBody Map<String, String> body) {
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Nachricht darf nicht leer sein.");
        }
        roomService.sendMessage(roomId, authService.getUserFromAuth().getId(), message);
    }

    @PostMapping("/start/{roomId}")
    public ResponseEntity<?> startGame(@PathVariable("roomId") int roomId, HttpServletRequest request) {
        Room room = roomService.getRoomById(roomId);
        if (room == null) throw new NotFoundException("Room not found");
        long userId = authService.getUserFromAuth().getId();
        boolean isHost = room.getPlayers().stream()
                .anyMatch(p -> p.getUserId() == userId && p.isHost());
        if (!isHost) throw new ForbiddenException("Nur der Host kann das Spiel starten.");
        roomService.startGame(roomId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<Room> listRooms() {
        return roomService.getAllRooms();
    }
}