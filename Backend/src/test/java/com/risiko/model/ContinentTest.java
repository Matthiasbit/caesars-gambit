package com.risiko.model;

import com.risiko.contoller.GameController;
import com.risiko.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContinentTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameController gameController;

    @Test
    void getBonusTroops_gibtKorrektenWertZurueck() {
        assertThat(Continent.BLAUE_KUESTE.getBonusTroops()).isEqualTo(2);
        assertThat(Continent.NORDOSTEN.getBonusTroops()).isEqualTo(7);
        assertThat(Continent.WESTKUESTE.getBonusTroops()).isEqualTo(3);
    }

    @Test
    void getTerritories_gibtKorrekteMengeZurueck() {
        assertThat(Continent.BLAUE_KUESTE.getTerritories()).containsExactlyInAnyOrder(
                Territorries.PALATIN, Territorries.LATERANO,
                Territorries.FORUM_TRASTEVEVEE, Territorries.CAMPANIA_A_LAPPE);
    }

    @Test
    void isControlledBy_alleTerritories_gibtTrueZurueck() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        Player player = new Player(1L, userRepository, gameController);
        player.setTerritories(List.of(
                Territorries.PALATIN, Territorries.LATERANO,
                Territorries.FORUM_TRASTEVEVEE, Territorries.CAMPANIA_A_LAPPE));

        assertThat(Continent.BLAUE_KUESTE.isControlledBy(player)).isTrue();
    }

    @Test
    void isControlledBy_nichtAlleTerritorien_gibtFalseZurueck() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        Player player = new Player(1L, userRepository, gameController);
        player.setTerritories(List.of(Territorries.PALATIN, Territorries.LATERANO));

        assertThat(Continent.BLAUE_KUESTE.isControlledBy(player)).isFalse();
    }

    @Test
    void isControlledBy_keineTerritorien_gibtFalseZurueck() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        Player player = new Player(1L, userRepository, gameController);

        assertThat(Continent.BLAUE_KUESTE.isControlledBy(player)).isFalse();
    }
}
