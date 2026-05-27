package com.risiko.services;

import com.risiko.exception.AppException;
import org.springframework.http.HttpStatus;
import com.risiko.contoller.GameController;
import com.risiko.model.Room;
import com.risiko.repository.UserRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameController gameController;

    @InjectMocks
    private RoomService roomService;

    @Nested
    class GetAllRooms {

        @Test
        void anfangsLeer() {
            assertThat(roomService.getAllRooms()).isEmpty();
        }

        @Test
        void gibtAlleErstelltenRaeumeZurueck() {
            roomService.createRoom(gameController);
            roomService.createRoom(gameController);

            assertThat(roomService.getAllRooms()).hasSize(2);
        }
    }

    @Nested
    class CreateRoom {

        @Test
        void erstelltRaumMitInkrementierterID() {
            Room room1 = roomService.createRoom(gameController);
            Room room2 = roomService.createRoom(gameController);

            assertThat(room1.getRoomId()).isEqualTo(1);
            assertThat(room2.getRoomId()).isEqualTo(2);
        }

        @Test
        void raumIstAnschliessendAbrufbar() {
            Room created = roomService.createRoom(gameController);

            assertThat(roomService.getRoomById(created.getRoomId())).isNotNull();
        }
    }

    @Nested
    class GetRoomById {

        @Test
        void vorhandenerRaum_gibtRaumZurueck() {
            Room created = roomService.createRoom(gameController);

            Room found = roomService.getRoomById(created.getRoomId());

            assertThat(found).isNotNull();
            assertThat(found.getRoomId()).isEqualTo(created.getRoomId());
        }

        @Test
        void nichtVorhandenerRaum_wirftAppException() {
            assertThatThrownBy(() -> roomService.getRoomById(999))
                    .isInstanceOf(AppException.class)
                    .hasMessage("Room not found");
        }
    }

    @Nested
    class JoinRoom {

        @Test
        void vorhandenerRaum_gibtTrueZurueck() {
            Room room = roomService.createRoom(gameController);

            assertThat(roomService.joinRoom(room.getRoomId(), 42L, false)).isTrue();
        }

        @Test
        void nichtVorhandenerRaum_gibtFalseZurueck() {
            assertThat(roomService.joinRoom(999, 42L, false)).isFalse();
        }

        @Test
        void spielerWirdZurPlayerlisteHinzugefuegt() {
            Room room = roomService.createRoom(gameController);

            roomService.joinRoom(room.getRoomId(), 42L, false);

            assertThat(room.getPlayers()).hasSize(1);
        }

        @Test
        void alsHost_setzHostFlag() {
            Room room = roomService.createRoom(gameController);

            roomService.joinRoom(room.getRoomId(), 42L, true);

            assertThat(room.getPlayers().get(0).isHost()).isTrue();
        }

        @Test
        void nichtAlsHost_hostFlagBleibtFalse() {
            Room room = roomService.createRoom(gameController);

            roomService.joinRoom(room.getRoomId(), 42L, false);

            assertThat(room.getPlayers().get(0).isHost()).isFalse();
        }
    }

    @Nested
    class LeaveRoom {

        @Test
        void vorhandenerRaum_gibtTrueZurueck() {
            Room room = roomService.createRoom(gameController);
            roomService.joinRoom(room.getRoomId(), 42L, false);

            assertThat(roomService.leaveRoom(room.getRoomId(), 42L)).isTrue();
        }

        @Test
        void nichtVorhandenerRaum_gibtFalseZurueck() {
            assertThat(roomService.leaveRoom(999, 42L)).isFalse();
        }

        @Test
        void spielerWirdAusPlayerlisteEntfernt() {
            Room room = roomService.createRoom(gameController);
            roomService.joinRoom(room.getRoomId(), 42L, false);

            roomService.leaveRoom(room.getRoomId(), 42L);

            assertThat(room.getPlayers()).isEmpty();
        }
    }

    @Nested
    class RemoveRoom {

        @Test
        void raumNichtMehrPerIdAbrufbar() {
            Room room = roomService.createRoom(gameController);

            roomService.removeRoom(room.getRoomId());

            assertThat(roomService.getRoomById(room.getRoomId())).isNull();
        }

        @Test
        void raumNichtMehrInGetAllRooms() {
            Room room = roomService.createRoom(gameController);

            roomService.removeRoom(room.getRoomId());

            assertThat(roomService.getAllRooms()).isEmpty();
        }
    }

    @Nested
    class SendMessage {

        @Test
        void userNichtImRaum_wirftException() {
            Room room = roomService.createRoom(gameController);

            assertThatThrownBy(() -> roomService.sendMessage(room.getRoomId(), 42L, "Hallo"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("User not in room");
        }

        @Test
        void userImRaum_wirftKeineException() {
            Room room = roomService.createRoom(gameController);
            roomService.joinRoom(room.getRoomId(), 42L, false);

            assertThatCode(() -> roomService.sendMessage(room.getRoomId(), 42L, "Hallo"))
                    .doesNotThrowAnyException();
        }
    }

    @Nested
    class StartGame {

        @Test
        void nichtVorhandenerRaum_wirftException() {
            assertThatThrownBy(() -> roomService.startGame(999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Room not found");
        }
    }
}
