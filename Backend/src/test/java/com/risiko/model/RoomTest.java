package com.risiko.model;

import com.risiko.contoller.GameController;
import com.risiko.exception.AppException;
import com.risiko.model.dto.LobbyPlayerDto;
import com.risiko.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomTest {

    @Mock
    private GameController gameController;

    @Mock
    private UserRepository userRepository;

    private Room room;

    @BeforeEach
    void setUp() {
        room = new Room(1, gameController, userRepository);
    }

    @Nested
    class Initialisierung {

        @Test
        void neuerRaum_hatKorrektId() {
            assertThat(room.getRoomId()).isEqualTo(1);
        }

        @Test
        void neuerRaum_istNichtGestartet() {
            assertThat(room.isGameStarted()).isFalse();
        }

        @Test
        void neuerRaum_hatLeereSpielerListe() {
            assertThat(room.getPlayers()).isEmpty();
        }

        @Test
        void neuerRaum_hatKeinenGamestate() {
            assertThat(room.getGamestate()).isNull();
        }
    }

    @Nested
    class EndGame {

        @Test
        void setzGameStartedAufFalse() {
            ReflectionTestUtils.setField(room, "gameStarted", true);

            room.endGame();

            assertThat(room.isGameStarted()).isFalse();
        }

        @Test
        void setzGamestateAufNull() {
            Gamestate mockGamestate = Mockito.mock(Gamestate.class);
            ReflectionTestUtils.setField((Object) room, "gamestate", mockGamestate);

            room.endGame();

            assertThat(room.getGamestate()).isNull();
        }
    }

    @Nested
    class GetLobbyData {

        @Test
        void leereSpielerListe_gibtLeereListeZurueck() {
            assertThat(room.getLobbyData()).isEmpty();
        }

        @Test
        void spielerImRaum_gibtKorrektenUsernameZurueck() {
            User u = new User();
            u.setUsername("alice");
            when(userRepository.findById(1L)).thenReturn(Optional.of(u));
            room.joinRoom(1L, false);

            List<LobbyPlayerDto> data = room.getLobbyData();

            assertThat(data).hasSize(1);
            assertThat(data.get(0).getUsername()).isEqualTo("alice");
        }

        @Test
        void hostSpieler_wirdAlsHostMarkiert() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            room.joinRoom(1L, true);

            List<LobbyPlayerDto> data = room.getLobbyData();

            assertThat(data.get(0).isHost()).isTrue();
        }

        @Test
        void nichtHostSpieler_wirdNichtAlsHostMarkiert() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            room.joinRoom(1L, false);

            List<LobbyPlayerDto> data = room.getLobbyData();

            assertThat(data.get(0).isHost()).isFalse();
        }

        @Test
        void mehrereSpiele_alleSindInLobbyData() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            when(userRepository.findById(2L)).thenReturn(Optional.empty());
            room.joinRoom(1L, false);
            room.joinRoom(2L, false);

            assertThat(room.getLobbyData()).hasSize(2);
        }
    }

    @Nested
    class StartGame {

        @Test
        void bereitsGestartet_wirftException() {
            ReflectionTestUtils.setField(room, "gameStarted", true);

            assertThatThrownBy(() -> room.startGame())
                    .isInstanceOf(AppException.class)
                    .hasMessage("Game already started");
        }
    }

    @Nested
    class LeaveRoom {

        @Test
        void spielerWirdAusListeEntfernt() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            room.joinRoom(1L, false);

            room.leaveRoom(1L);

            assertThat(room.getPlayers()).isEmpty();
        }

        @Test
        void andererSpielerBleibtInListe() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            when(userRepository.findById(2L)).thenReturn(Optional.empty());
            room.joinRoom(1L, false);
            room.joinRoom(2L, false);

            room.leaveRoom(1L);

            assertThat(room.getPlayers()).hasSize(1);
            assertThat(room.getPlayers().get(0).getUserId()).isEqualTo(2L);
        }

        @Test
        void wennSpielGestartet_entferntTrotzdemSpieler() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            room.joinRoom(1L, false);
            ReflectionTestUtils.setField(room, "gameStarted", true);

            room.leaveRoom(1L);

            assertThat(room.getPlayers()).isEmpty();
        }
    }

    @Nested
    class JoinRoom {

        @Test
        void wennSpielGestartet_trittTrotzdemBei() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            ReflectionTestUtils.setField(room, "gameStarted", true);

            room.joinRoom(1L, false);

            assertThat(room.getPlayers()).hasSize(1);
        }
    }

    @Nested
    class SendMessage {

        @Test
        void userNichtImRaum_wirftException() {
            assertThatThrownBy(() -> room.sendMessage(99L, "Hallo"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("User not in room");
        }

        @Test
        void userImRaum_wirftKeineException() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            room.joinRoom(1L, false);

            assertThatCode(() -> room.sendMessage(1L, "Hallo"))
                    .doesNotThrowAnyException();
        }
    }
}
