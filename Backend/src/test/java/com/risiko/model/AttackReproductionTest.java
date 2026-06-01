package com.risiko.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import com.risiko.contoller.GameController;
import com.risiko.repository.UserRepository;

class AttackReproductionTest {

    private Player attacker;
    private Player defender;
    private Gamestate gamestate;
    private GameController gameController;
    private Room room;
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        gameController = mock(GameController.class);
        userRepository = mock(UserRepository.class);
        room = mock(Room.class);

        User attackerUser = new User();
        attackerUser.setUsername("Attacker");
        attackerUser.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(attackerUser));

        User defenderUser = new User();
        defenderUser.setUsername("Defender");
        defenderUser.setId(2L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(defenderUser));

        attacker = new Player(1L, userRepository, gameController);
        defender = new Player(2L, userRepository, gameController);

        attacker.setTerritories(new ArrayList<>(List.of(Territorries.PALATIN)));
        // setTerritories sets troops to 1. Manually adjust for tests.
        attacker.getTerritories().put(Territorries.PALATIN, 2); 

        defender.setTerritories(new ArrayList<>(List.of(Territorries.FORUM_TRASTEVEVEE)));
        defender.getTerritories().put(Territorries.FORUM_TRASTEVEVEE, 1);

        gamestate = new Gamestate(room, new ArrayList<>(List.of(attacker, defender)), gameController);
        org.springframework.test.util.ReflectionTestUtils.setField(gamestate, "currentPlayer", attacker);
    }

    @Test
    void testAttack2vs1_AttackerWins() throws InterruptedException {
        // Attacker has 2 total, attacks with 1.
        // Defender has 1 total.
        
        try (MockedStatic<Gamestate> mockedDice = mockStatic(Gamestate.class)) {
            // dice(rollCount) is static. 
            // Attacker rolls 1 die (Math.min(1, 3)) -> 6
            // Defender rolls 1 die (Math.min(1, 2)) -> 1
            mockedDice.when(() -> Gamestate.dice(1)).thenReturn(List.of(6)).thenReturn(List.of(1));
            
            gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 1);
        }

        assertThat(attacker.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isTrue();
        assertThat(attacker.getTroopsOnTerritory(Territorries.FORUM_TRASTEVEVEE)).isEqualTo(1);
        assertThat(attacker.getTroopsOnTerritory(Territorries.PALATIN)).isEqualTo(1);
        assertThat(defender.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isFalse();
    }

    @Test
    void testAttack2vs1_AttackerLoses() throws InterruptedException {
        // Attacker has 2 total, attacks with 1.
        // Defender has 1 total.
        
        try (MockedStatic<Gamestate> mockedDice = mockStatic(Gamestate.class)) {
            // Attacker rolls 1, Defender rolls 6
            mockedDice.when(() -> Gamestate.dice(1)).thenReturn(List.of(1)).thenReturn(List.of(6));
            
            gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 1);
        }

        assertThat(attacker.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isFalse();
        assertThat(attacker.getTroopsOnTerritory(Territorries.PALATIN)).isEqualTo(1);
        assertThat(defender.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isTrue();
        assertThat(defender.getTroopsOnTerritory(Territorries.FORUM_TRASTEVEVEE)).isEqualTo(1);
    }

    @Test
    void testAttack2vs1_InvalidCommitCount() {
        // Attacker has 2 total, tries to attack with 2. 
        // This should fail because 1 must stay.
        assertThatThrownBy(() -> gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Nicht genug Truppen für diesen Angriff.");
    }

    @Test
    void testDefense_NegativeTroopSafety() {
        // Defender has 1 troop. If we simulate 100 lost troops, it should remove territory and return 0, not -99.
        int remaining = defender.defend(Territorries.FORUM_TRASTEVEVEE, 100);
        assertThat(remaining).isEqualTo(0);
        assertThat(defender.hasTerritory(Territorries.FORUM_TRASTEVEVEE)).isFalse();
    }
}
