package com.risiko.model;

import com.risiko.contoller.GameController;
import com.risiko.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlayerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameController gameController;

    private Player player;

    @BeforeEach
    void setUp() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        player = new Player(1L, userRepository, gameController);
        player.setTroopstoDist(2);
        player.setTerritories(List.of(Territorries.PALATIN, Territorries.NEAPEL));
    }

    @Nested
    class UsernameFromRepository {

        @Test
        void userNichtInDatenbank_setztnameAufUnknown() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            Player p = new Player(99L, userRepository, gameController);

            assertThat(p.username).isEqualTo("Unknown");
        }

        @Test
        void userInDatenbank_setztnameAufBenutzernamen() {
            User u = new User();
            u.setUsername("testUser");
            when(userRepository.findById(99L)).thenReturn(Optional.of(u));

            Player p = new Player(99L, userRepository, gameController);

            assertThat(p.username).isEqualTo("testUser");
        }
    }

    @Nested
    class HasTerritory {

        @Test
        void vorhandenesTerritoty_gibtTrueZurueck() {
            assertThat(player.hasTerritory(Territorries.PALATIN)).isTrue();
        }

        @Test
        void nichtVorhandenesTerritoty_gibtFalseZurueck() {
            assertThat(player.hasTerritory(Territorries.EICHENWALD)).isFalse();
        }
    }

    @Nested
    class SetTerritories {

        @Test
        void alleTerritorienMitEinsTruppenInitialisiert() {
            player.setTerritories(List.of(Territorries.PALATIN, Territorries.NEAPEL));

            assertThat(player.getTerritories().get(Territorries.PALATIN)).isEqualTo(1);
            assertThat(player.getTerritories().get(Territorries.NEAPEL)).isEqualTo(1);
        }

        @Test
        void neuSetzen_ueberschreibtAlteTerritorien() {
            player.setTerritories(List.of(Territorries.EICHENWALD));

            assertThat(player.hasTerritory(Territorries.PALATIN)).isFalse();
            assertThat(player.hasTerritory(Territorries.EICHENWALD)).isTrue();
        }
    }

    @Nested
    class DistTroops {

        @Test
        void erhoehtTruppenanzahl() {
            player.setTroopstoDist(3);
            player.distTroops(Territorries.PALATIN, 3);

            assertThat(player.getTerritories().get(Territorries.PALATIN)).isEqualTo(4);
        }
    }

    @Nested
    class MoveTroops {

        @Test
        void verringertTruppenImQuellgebiet() {
            player.moveTroops(Territorries.PALATIN, Territorries.NEAPEL, 1);

            assertThat(player.getTerritories().get(Territorries.PALATIN)).isEqualTo(0);
        }

        @Test
        void erhoehtTruppenImZielgebiet() {
            player.moveTroops(Territorries.PALATIN, Territorries.NEAPEL, 1);

            assertThat(player.getTerritories().get(Territorries.NEAPEL)).isEqualTo(2);
        }
    }

    @Nested
    class Defend {

        @Test
        void verlierteAlleVerteidiger_entferntGebiet() {
            int result = player.defend(Territorries.PALATIN, 1);

            assertThat(result).isEqualTo(0);
            assertThat(player.hasTerritory(Territorries.PALATIN)).isFalse();
        }

        @Test
        void verlierteWenigerAlsVorhanden_behaeltGebiet() {
            player.setTroopstoDist(3);
            player.distTroops(Territorries.PALATIN, 3); 

            assertThat(player.getTerritories().get(Territorries.PALATIN)).isEqualTo(4);
            
            int result = player.defend(Territorries.PALATIN, 2);
            
            assertThat(result).isEqualTo(2);
        }

        @Test
        void verlierteGenaueAnzahl_entferntGebiet() {
            player.setTroopstoDist(2);
            player.distTroops(Territorries.PALATIN, 1); // now 2 troops

            int result = player.defend(Territorries.PALATIN, 2);

            assertThat(result).isEqualTo(0);
            assertThat(player.hasTerritory(Territorries.PALATIN)).isFalse();
        }
    }

    @Nested
    class GetTerritory {

        @Test
        void nichtVorhandenesTerritoryWirdHinzugefuegt() {
            player.getTerritory(Territorries.EICHENWALD);

            assertThat(player.hasTerritory(Territorries.EICHENWALD)).isTrue();
        }

        @Test
        void neuesGebietHatNullTruppen() {
            player.getTerritory(Territorries.EICHENWALD);

            assertThat(player.getTerritories().get(Territorries.EICHENWALD)).isEqualTo(0);
        }
    }

    @Nested
    class GetTerritories {

        @Test
        void ohneGebiete_gibtLeereMapZurueck() {
            when(userRepository.findById(2L)).thenReturn(Optional.empty());
            Player p = new Player(2L, userRepository, gameController);

            assertThat(p.getTerritories()).isEmpty();
        }
    }

    @Nested
    class GetUserId {

        @Test
        void gibtKorrekteUserIdZurueck() {
            assertThat(player.getUserId()).isEqualTo(1L);
        }
    }

    @Nested
    class HostFlag {

        @Test
        void standardmaessigNichtHost() {
            assertThat(player.isHost()).isFalse();
        }

        @Test
        void setHost_setzHostAufTrue() {
            player.setHost(true);

            assertThat(player.isHost()).isTrue();
        }

        @Test
        void setHost_setzHostAufFalse() {
            player.setHost(true);
            player.setHost(false);

            assertThat(player.isHost()).isFalse();
        }
    }
}
