package com.risiko.contoller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.risiko.exception.GlobalExceptionHandler;
import com.risiko.model.Gamestate;
import com.risiko.model.Player;
import com.risiko.model.Room;
import com.risiko.model.Territorries;
import com.risiko.model.User;

import java.util.HashMap;
import java.util.List;
import com.risiko.services.AuthService;
import com.risiko.services.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class GameControllerTest {

    @Mock
    private RoomService roomService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private GameController gameController;

    @Mock
    private Room room;

    @Mock
    private Gamestate gamestate;

    @Mock
    private Player player;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(gameController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private void setupAuthenticatedCurrentPlayer() {
        User user = new User();
        user.setId(1L);
                lenient().when(authService.getUserFromAuth()).thenReturn(user);
                lenient().when(player.getUserId()).thenReturn(1L);
                lenient().when(room.getPlayers()).thenReturn(List.of(player));
                lenient().when(room.getGamestate()).thenReturn(gamestate);
                lenient().when(gamestate.getCurrentPlayer()).thenReturn(player);
    }

    @Nested
    class Move {

        @Test
        void gueltigeAnfrage_fuehrtMoveTroopsAus() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            when(player.hasTerritory(Territorries.PALATIN)).thenReturn(true);
            when(player.hasTerritory(Territorries.LATERANO)).thenReturn(true);
            Map<Territorries, Integer> territories = new HashMap<>();
            territories.put(Territorries.PALATIN, 5);
            when(player.getTerritories()).thenReturn(territories);

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isOk());

            verify(player).moveTroops(any(), any(), eq(3));
            verify(gamestate).sendGameStateUpdate();
        }

        @Test
        void nichtAktuellerSpieler_wirft404() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            Player otherPlayer = mock(Player.class);
            when(room.getPlayers()).thenReturn(List.of(otherPlayer));
            when(otherPlayer.getUserId()).thenReturn(1L);
            when(gamestate.getCurrentPlayer()).thenReturn(player);

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isNotFound());
        }

        @Test
        void quellgebietNichtImBesitz_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            when(player.hasTerritory(Territorries.PALATIN)).thenReturn(false);

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void zielgebietNichtImBesitz_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            when(player.hasTerritory(Territorries.PALATIN)).thenReturn(true);
            when(player.hasTerritory(Territorries.LATERANO)).thenReturn(false);

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void gebieteNichtBenachbart_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            when(player.hasTerritory(Territorries.PALATIN)).thenReturn(true);
            when(player.hasTerritory(Territorries.EICHENWALD)).thenReturn(true);

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Eichenwald", "sum", 3))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void nichtGenugTruppen_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            when(player.hasTerritory(Territorries.PALATIN)).thenReturn(true);
            when(player.hasTerritory(Territorries.LATERANO)).thenReturn(true);
            Map<Territorries, Integer> territories = new HashMap<>();
            territories.put(Territorries.PALATIN, 2);
            when(player.getTerritories()).thenReturn(territories);

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            when(roomService.getRoomById(99)).thenReturn(null);

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 99, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class Attack {

        @Test
        void gueltigeAnfrage_fuehrtAttackAus() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);

            mockMvc.perform(post("/api/game/attack")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 2))))
                    .andExpect(status().isOk());

            verify(gamestate).attack(any(), any(), eq(2));
            verify(gamestate).sendGameStateUpdate();
        }

        @Test
        void nichtAktuellerSpieler_wirft404() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            Player otherPlayer = mock(Player.class);
            when(room.getPlayers()).thenReturn(List.of(otherPlayer));
            when(otherPlayer.getUserId()).thenReturn(1L);
            when(gamestate.getCurrentPlayer()).thenReturn(player);

            mockMvc.perform(post("/api/game/attack")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 2))))
                    .andExpect(status().isNotFound());
        }

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            when(roomService.getRoomById(99)).thenReturn(null);

            mockMvc.perform(post("/api/game/attack")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 99, "from", "Palatin", "to", "Laterano", "sum", 2))))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class DistTroops {

        @Test
        void gueltigeAnfrage_verteiltTruppen() throws Exception {
            User user = new User();
            user.setId(7L);
            when(authService.getUserFromAuth()).thenReturn(user);
            when(roomService.getRoomById(1)).thenReturn(room);
            when(room.getGamestate()).thenReturn(gamestate);
            when(gamestate.getPlayerByUserId(7L)).thenReturn(player);

            mockMvc.perform(post("/api/game/distTroops")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", "1", "to", "Palatin", "sum", 5))))
                    .andExpect(status().isOk());

            verify(player).distTroops(any(), eq(5));
            verify(gamestate).sendGameStateUpdate();
        }
    }

    @Nested
    class Stream {

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            when(roomService.getRoomById(99)).thenReturn(null);

            mockMvc.perform(get("/api/game/stream/99"))
                    .andExpect(status().isNotFound());
        }
    }
}
