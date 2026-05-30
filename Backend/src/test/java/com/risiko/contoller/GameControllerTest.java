package com.risiko.contoller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.risiko.exception.GlobalExceptionHandler;
import com.risiko.model.Gamestate;
import com.risiko.model.Player;
import com.risiko.model.Room;
import com.risiko.model.Territorries;
import com.risiko.model.User;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import com.risiko.exception.AppException;
import org.springframework.http.HttpStatus;
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

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isOk());

            verify(player).moveTroops(Territorries.PALATIN, Territorries.LATERANO, 3);
            verify(gamestate).sendGameStateUpdate();
        }

        @Test
        void nichtAktuellerSpieler_wirft409() throws Exception {
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
                    .andExpect(status().isConflict());
        }

        @Test
        void quellgebietNichtImBesitz_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            doThrow(new IllegalArgumentException("Das Quellgebiet geh\u00f6rt nicht dem aktuellen Spieler."))
                    .when(player).moveTroops(any(), any(), anyInt());

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
            doThrow(new IllegalArgumentException("Das Zielgebiet geh\u00f6rt nicht dem aktuellen Spieler."))
                    .when(player).moveTroops(any(), any(), anyInt());

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
            doThrow(new IllegalArgumentException("Die Gebiete sind nicht benachbart."))
                    .when(player).moveTroops(any(), any(), anyInt());

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
            doThrow(new IllegalArgumentException("Nicht genug Truppen zum Verschieben."))
                    .when(player).moveTroops(any(), any(), anyInt());

            mockMvc.perform(post("/api/game/move")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 3))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            when(roomService.getRoomById(99)).thenThrow(new AppException(HttpStatus.NOT_FOUND, "Room not found"));

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
        void nichtAktuellerSpieler_wirft409() throws Exception {
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
                    .andExpect(status().isConflict());
        }

        @Test
        void angriffsgebietNichtImBesitz_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            doThrow(new IllegalArgumentException("Das Angriffsgebiet geh\u00f6rt nicht dem aktuellen Spieler."))
                    .when(gamestate).attack(any(), any(), anyInt());

            mockMvc.perform(post("/api/game/attack")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 2))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void zielgebietGehoertBereitsAngreifer_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            doThrow(new IllegalArgumentException("Das Zielgebiet geh\u00f6rt bereits dem angreifenden Spieler."))
                    .when(gamestate).attack(any(), any(), anyInt());

            mockMvc.perform(post("/api/game/attack")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 2))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void gebieteNichtBenachbart_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            doThrow(new IllegalArgumentException("Die Gebiete sind nicht benachbart."))
                    .when(gamestate).attack(any(), any(), anyInt());

            mockMvc.perform(post("/api/game/attack")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Eichenwald", "sum", 2))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void nichtGenugTruppen_wirft400() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            doThrow(new IllegalArgumentException("Nicht genug Truppen f\u00fcr diesen Angriff."))
                    .when(gamestate).attack(any(), any(), anyInt());

            mockMvc.perform(post("/api/game/attack")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", 1, "from", "Palatin", "to", "Laterano", "sum", 2))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            when(roomService.getRoomById(99)).thenThrow(new AppException(HttpStatus.NOT_FOUND, "Room not found"));

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
            when(roomService.getRoomById(99)).thenThrow(new AppException(HttpStatus.NOT_FOUND, "Room not found"));

            mockMvc.perform(get("/api/game/stream/99"))
                    .andExpect(status().isNotFound());
        }

        @Test
        void spielerNichtImRaum_wirft404() throws Exception {
            when(roomService.getRoomById(1)).thenReturn(room);
            when(room.getPlayers()).thenReturn(List.of());

            mockMvc.perform(get("/api/game/stream/1"))
                    .andExpect(status().isNotFound());
        }

        @Test
        void erfolgreich_spielNichtGestartet_erstelltEmitter() {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            when(room.isGameStarted()).thenReturn(false);

            SseEmitter emitter = gameController.stream("1", null, null);

            assertThat(emitter).isNotNull();
        }

        @Test
        void erfolgreich_spielGestartet_sendetGameState() {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            when(room.isGameStarted()).thenReturn(true);
            when(player.getUsername()).thenReturn("TestUser");

            gameController.stream("1", null, null);

            verify(gamestate).sendGameStateUpdate();
            verify(player).askDistTroops();
        }
    }

    @Nested
    class BroadcastEvent {

        @Test
        void mitEmitter_sendetEreignis() throws IOException {
            SseEmitter emitter = mock(SseEmitter.class);

            gameController.broadcastEvent(List.of(emitter), "test", "data");

            verify(emitter).send(any(Set.class));
        }

        @Test
        void ioException_ruftCompleteWithErrorAuf() throws IOException {
            SseEmitter emitter = mock(SseEmitter.class);
            doThrow(new IOException("io error")).when(emitter).send(any(Set.class));

            gameController.broadcastEvent(List.of(emitter), "test", "data");

            verify(emitter).completeWithError(any(IOException.class));
        }
    }

    @Nested
    class EndTurn {

        @Test
        void gueltigeAnfrage_beendetZug() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);

            mockMvc.perform(post("/api/game/endTurn")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", "1"))))
                    .andExpect(status().isOk());

            verify(gamestate).endMove();
            verify(gamestate).sendGameStateUpdate();
        }

        @Test
        void nichtAktuellerSpieler_wirft409() throws Exception {
            setupAuthenticatedCurrentPlayer();
            when(roomService.getRoomById(1)).thenReturn(room);
            Player otherPlayer = mock(Player.class);
            when(room.getPlayers()).thenReturn(List.of(otherPlayer));
            when(otherPlayer.getUserId()).thenReturn(1L);
            when(gamestate.getCurrentPlayer()).thenReturn(player);

            mockMvc.perform(post("/api/game/endTurn")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", "1"))))
                    .andExpect(status().isConflict());
        }

        @Test
        void raumNichtGefunden_wirft404() throws Exception {
            when(roomService.getRoomById(99)).thenThrow(new AppException(HttpStatus.NOT_FOUND, "Room not found"));

            mockMvc.perform(post("/api/game/endTurn")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(
                            Map.of("roomId", "99"))))
                    .andExpect(status().isNotFound());
        }
    }
}
