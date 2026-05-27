package com.risiko.contoller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.risiko.exception.AppException;
import com.risiko.exception.GlobalExceptionHandler;
import com.risiko.model.Room;
import com.risiko.model.User;
import com.risiko.services.AuthService;
import com.risiko.services.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RoomControllerTest {

    @Mock
    private RoomService roomService;

    @Mock
    private AuthService authService;

    @Mock
    private GameController gameController;

    private RoomController roomController;
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        roomController = new RoomController(gameController, null, authService);
        ReflectionTestUtils.setField(roomController, "roomService", roomService);
        mockMvc = MockMvcBuilders.standaloneSetup(roomController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    class CreateRoom {

        @Test
        void erstelltRaumUndGibtIdZurueck() throws Exception {
            Room room = mock(Room.class);
            when(room.getRoomId()).thenReturn(42);
            when(roomService.createRoom(gameController)).thenReturn(room);

            mockMvc.perform(post("/api/rooms/create"))
                    .andExpect(status().isOk())
                    .andExpect(content().string("42"));
        }
    }

    @Nested
    class JoinRoom {

        @Test
        void erfolgreich_gibt200Zurueck() throws Exception {
            User user = new User();
            user.setId(1L);
            when(authService.getUserFromAuth()).thenReturn(user);
            when(roomService.joinRoom(1, 1L, false)).thenReturn(true);

            mockMvc.perform(post("/api/rooms/join/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                    .andExpect(status().isOk());
        }

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            User user = new User();
            user.setId(1L);
            when(authService.getUserFromAuth()).thenReturn(user);
            when(roomService.joinRoom(anyInt(), anyLong(), anyBoolean())).thenReturn(false);

            mockMvc.perform(post("/api/rooms/join/99")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Room not found"));
        }

        @Test
        void mitHostFlag_trittAlsHostBei() throws Exception {
            User user = new User();
            user.setId(1L);
            when(authService.getUserFromAuth()).thenReturn(user);
            when(roomService.joinRoom(1, 1L, true)).thenReturn(true);

            mockMvc.perform(post("/api/rooms/join/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("host", true))))
                    .andExpect(status().isOk());

            verify(roomService).joinRoom(1, 1L, true);
        }
    }

    @Nested
    class LeaveRoom {

        @Test
        void erfolgreich_gibt200Zurueck() throws Exception {
            User user = new User();
            user.setId(1L);
            when(authService.getUserFromAuth()).thenReturn(user);
            when(roomService.leaveRoom(1, 1L)).thenReturn(true);

            mockMvc.perform(post("/api/rooms/leave/1"))
                    .andExpect(status().isOk());
        }

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            User user = new User();
            user.setId(1L);
            when(authService.getUserFromAuth()).thenReturn(user);
            when(roomService.leaveRoom(anyInt(), anyLong())).thenReturn(false);

            mockMvc.perform(post("/api/rooms/leave/99"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Room not found"));
        }
    }

    @Nested
    class SendMessage {

        @Test
        void erfolgreich_gibt200Zurueck() throws Exception {
            User user = new User();
            user.setId(1L);
            when(authService.getUserFromAuth()).thenReturn(user);

            mockMvc.perform(post("/api/rooms/message/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("message", "Hello"))))
                    .andExpect(status().isOk());

            verify(roomService).sendMessage(1, 1L, "Hello");
        }

        @Test
        void userNichtImRaum_wirft400() throws Exception {
            User user = new User();
            user.setId(1L);
            when(authService.getUserFromAuth()).thenReturn(user);
            doThrow(new IllegalArgumentException("User not in room"))
                    .when(roomService).sendMessage(anyInt(), anyLong(), anyString());

            mockMvc.perform(post("/api/rooms/message/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("message", "Hello"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("User not in room"));
        }
    }

    @Nested
    class StartGame {

        @Test
        void erfolgreich_gibt200Zurueck() throws Exception {
            mockMvc.perform(post("/api/rooms/start/1"))
                    .andExpect(status().isOk());

            verify(roomService).startGame(1);
        }

        @Test
        void fehler_gibt409Zurueck() throws Exception {
            doThrow(new AppException(HttpStatus.CONFLICT, "Game already started")).when(roomService).startGame(1);

            mockMvc.perform(post("/api/rooms/start/1"))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.error").value("Game already started"));
        }
    }

    @Nested
    class ListRooms {

        @Test
        void gibtAlleRaeumeZurueck() throws Exception {
            when(roomService.getAllRooms()).thenReturn(List.of());

            mockMvc.perform(get("/api/rooms"))
                    .andExpect(status().isOk())
                    .andExpect(content().json("[]"));

            verify(roomService).getAllRooms();
        }
    }
}
