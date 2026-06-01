package com.risiko.model;

import com.risiko.contoller.GameController;
import com.risiko.repository.UserRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.mockito.MockedStatic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GamestateTest {

    @Mock
    private GameController gameController;

    @Mock
    private Room room;

    private Player makePlayer(long id) {
        UserRepository userRepo = mock(UserRepository.class);
        when(userRepo.findById(id)).thenReturn(Optional.empty());
        return new Player(id, userRepo, gameController);
    }

    @Nested
    class Dice {

        @Test
        void anzahlRueckgabewerteKorrekt() {
            List<Integer> result = Gamestate.dice(3);

            assertThat(result).hasSize(3);
        }

        @Test
        void alleWerteZwischenEinsUndSechs() {
            List<Integer> result = Gamestate.dice(10);

            assertThat(result).allMatch(v -> v >= 1 && v <= 6);
        }

        @Test
        void ergebnisseAbsteigendSortiert() {
            List<Integer> result = Gamestate.dice(5);

            for (int i = 0; i < result.size() - 1; i++) {
                assertThat(result.get(i)).isGreaterThanOrEqualTo(result.get(i + 1));
            }
        }

        @Test
        void rollCountNullGibtLeereListeZurueck() {
            assertThat(Gamestate.dice(0)).isEmpty();
        }

        @Test
        void returnCountGroesserAlsRollCount_wirdAufRollCountBegrenzt() {
            List<Integer> result = Gamestate.dice(2);

            assertThat(result).hasSize(2);
        }

        @Test
        void einWurf_gibtEinenWertZurueck() {
            assertThat(Gamestate.dice(1)).hasSize(1);
        }

        @Test
        void negativerRollCount_gibtLeereListeZurueck() {
            assertThat(Gamestate.dice(-1)).isEmpty();
        }
    }

    @Nested
    class GetPlayerByUserId {

        @Test
        void vorhandenerSpieler_gibtSpielerZurueck() {
            Player player = makePlayer(1L);
            Gamestate gamestate = new Gamestate(null, List.of(player), gameController);

            assertThat(gamestate.getPlayerByUserId(1L)).isEqualTo(player);
        }

        @Test
        void nichtVorhandenerSpieler_gibtNullZurueck() {
            Player player = makePlayer(1L);
            Gamestate gamestate = new Gamestate(null, List.of(player), gameController);

            assertThat(gamestate.getPlayerByUserId(99L)).isNull();
        }

        @Test
        void leereSpielerListe_gibtNullZurueck() {
            Gamestate gamestate = new Gamestate(null, List.of(), gameController);

            assertThat(gamestate.getPlayerByUserId(1L)).isNull();
        }
    }

    @Nested
    class EndMove {

        @Test
        void wechseltZumNaechstenSpieler() {
            Player p1 = makePlayer(1L);
            Player p2 = makePlayer(2L);
            java.util.List<Player> players = new java.util.ArrayList<>(List.of(p1, p2));
            Gamestate gamestate = new Gamestate(null, players, gameController);
            gamestate.start();
            org.springframework.test.util.ReflectionTestUtils.setField(gamestate, "currentPlayer", p1);

            gamestate.endMove();

            assertThat(gamestate.getCurrentPlayer()).isEqualTo(p2);
        }

        @Test
        void letzterSpieler_wechseltZumErstenSpieler() {
            Player p1 = makePlayer(1L);
            Player p2 = makePlayer(2L);
            java.util.List<Player> players = new java.util.ArrayList<>(List.of(p1, p2));
            Gamestate gamestate = new Gamestate(null, players, gameController);
            gamestate.start();
            org.springframework.test.util.ReflectionTestUtils.setField(gamestate, "currentPlayer", p2);

            gamestate.endMove();

            assertThat(gamestate.getCurrentPlayer()).isEqualTo(p1);
        }
    }

    @Nested
    class CalculateReinforcements {

        @Test
        void wenigeTerritorien_gibtMindestens3() {
            Player player = makePlayer(1L);
            player.setTerritories(List.of(Territorries.PALATIN)); 
            Gamestate gamestate = new Gamestate(null, List.of(player), gameController);

            assertThat(gamestate.calculateReinforcements(player)).isEqualTo(3);
        }

        @Test
        void vieleTerritorien_berechnetKorrekteAnzahl() {
            Player player = makePlayer(1L);
            player.setTerritories(List.of(
                    Territorries.AQUITANE, Territorries.MAURENIET, Territorries.TUSKULUM,
                    Territorries.AUGUSTA_NEMETERS, Territorries.AGUALAINE, Territorries.FARNOVIA,
                    Territorries.MONTEGRO, Territorries.MARSKEM, Territorries.LISITONE,
                    Territorries.LAURIA, Territorries.TENUBRA, Territorries.PERGUGIA));
            Gamestate gamestate = new Gamestate(null, List.of(player), gameController);

            assertThat(gamestate.calculateReinforcements(player)).isEqualTo(4);
        }

        @Test
        void mitKontinentBonus_addiertBonusTruppen() {
            Player player = makePlayer(1L);
            player.setTerritories(List.of(
                    Territorries.PALATIN, Territorries.LATERANO,
                    Territorries.FORUM_TRASTEVEVEE, Territorries.CAMPANIA_A_LAPPE));
            Gamestate gamestate = new Gamestate(null, List.of(player), gameController);

            assertThat(gamestate.calculateReinforcements(player)).isEqualTo(5);
        }
    }

    @Nested
    class CheckIfGameEnded {

        @Test
        void einAktiverSpieler_beendetDasSpiel() {
            Player winner = makePlayer(1L);
            winner.setTerritories(List.of(Territorries.PALATIN));
            Player loser = makePlayer(2L); 
            Gamestate gamestate = new Gamestate(room, List.of(winner, loser), gameController);

            gamestate.checkIfGameEnded();

            verify(room).endGame();
        }

        @Test
        void mehrereAktiveSpieler_beendetSpielNicht() {
            Player p1 = makePlayer(1L);
            p1.setTerritories(List.of(Territorries.PALATIN));
            Player p2 = makePlayer(2L);
            p2.setTerritories(List.of(Territorries.LATERANO));
            Gamestate gamestate = new Gamestate(room, List.of(p1, p2), gameController);

            gamestate.checkIfGameEnded();

            verify(room, never()).endGame();
        }
    }

    @Nested
    class Attack {

        private Player attacker;
        private Player defender;
        private Gamestate gamestate;

        @BeforeEach
        void setUp() {
            attacker = makePlayer(1L);
            attacker.setTerritories(List.of(Territorries.PALATIN, Territorries.LATERANO));
            attacker.setTroopstoDist(7);
            attacker.distTroops(Territorries.PALATIN, 5); 

            defender = makePlayer(2L);
            defender.setTerritories(List.of(Territorries.FORUM_TRASTEVEVEE));

            gamestate = new Gamestate(room, new ArrayList<>(List.of(attacker, defender)), gameController);
            ReflectionTestUtils.setField(gamestate, "currentPlayer", attacker);
            gamestate.getPlayers().forEach(p -> p.setTroopstoDist(0));
        }

        @Test
        void sumNullOderNegativ_wirftException() {
            assertThatThrownBy(() -> gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 0))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Die Anzahl der angreifenden Truppen muss positiv sein.");
        }

        @Test
        void angriffsgebietNichtImBesitz_wirftException() {
            assertThatThrownBy(() -> gamestate.attack(Territorries.EICHENWALD, Territorries.FORUM_TRASTEVEVEE, 2))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Das Angriffsgebiet geh\u00f6rt nicht dem aktuellen Spieler.");
        }

        @Test
        void gebieteNichtBenachbart_wirftException() {
            assertThatThrownBy(() -> gamestate.attack(Territorries.PALATIN, Territorries.EICHENWALD, 2))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Die Gebiete sind nicht benachbart.");
        }

        @Test
        void zielgebietGehoertBereitsAngreifer_wirftException() {
            assertThatThrownBy(() -> gamestate.attack(Territorries.PALATIN, Territorries.LATERANO, 2))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Das Zielgebiet geh\u00f6rt bereits dem angreifenden Spieler.");
        }

        @Test
        void nichtGenugTruppen_wirftException() {
            assertThatThrownBy(() -> gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 6))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Nicht genug Truppen f\u00fcr diesen Angriff.");
        }

        @Test
        void gueltigerAngriff_gebietNichtGewonnen() throws InterruptedException {
            try (MockedStatic<Gamestate> mockedDice = mockStatic(Gamestate.class)) {
                mockedDice.when(() -> Gamestate.dice(anyInt())).thenReturn(List.of(3));
                gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 1);
            }

            assertThat(defender.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isTrue();
            assertThat(attacker.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isFalse();
        }

        @Test
        void gueltigerAngriff_gebietGewonnen() throws InterruptedException {
            try (MockedStatic<Gamestate> mockedDice = mockStatic(Gamestate.class)) {
                mockedDice.when(() -> Gamestate.dice(2)).thenReturn(List.of(6, 5));
                mockedDice.when(() -> Gamestate.dice(1)).thenReturn(List.of(1));
                gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 2);
            }

            assertThat(attacker.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isTrue();
            assertThat(defender.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isFalse();
        }

        @Test
        void kontinentNachAngriffErobert_decktZweigAb() throws InterruptedException {
            Player a = makePlayer(1L);
            a.setTerritories(List.of(Territorries.PALATIN, Territorries.LATERANO, Territorries.FORUM_TRASTEVEVEE));
            a.setTroopstoDist(10);
            a.distTroops(Territorries.FORUM_TRASTEVEVEE, 5); 

            Player d = makePlayer(2L);
            d.setTerritories(List.of(Territorries.CAMPANIA_A_LAPPE));

            a.setTroopstoDist(0);
            d.setTroopstoDist(0);
            Gamestate gs = new Gamestate(room, new java.util.ArrayList<>(List.of(a, d)), gameController);
            ReflectionTestUtils.setField(gs, "currentPlayer", a);
            ReflectionTestUtils.setField(a, "troopstoDist", 0);
            ReflectionTestUtils.setField(d, "troopstoDist", 0);

            try (MockedStatic<Gamestate> mockedDice = mockStatic(Gamestate.class)) {
                mockedDice.when(() -> Gamestate.dice(2)).thenReturn(List.of(6, 5));
                mockedDice.when(() -> Gamestate.dice(1)).thenReturn(List.of(1));
                gs.attack(Territorries.FORUM_TRASTEVEVEE, Territorries.CAMPANIA_A_LAPPE, 2);
            }

            assertThat(a.hasTerritory(Territorries.CAMPANIA_A_LAPPE)).isTrue();
        }
    }
}
