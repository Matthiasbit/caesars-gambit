package com.risiko.model;

import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.risiko.contoller.GameController;
import com.risiko.repository.UserRepository;

class DiceCountTest {

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
        attacker.getTerritories().put(Territorries.PALATIN, 10); // Plenty of troops

        defender.setTerritories(new ArrayList<>(List.of(Territorries.FORUM_TRASTEVEVEE)));
        defender.getTerritories().put(Territorries.FORUM_TRASTEVEVEE, 1); // Only 1 troop

        gamestate = new Gamestate(room, new ArrayList<>(List.of(attacker, defender)), gameController);
        org.springframework.test.util.ReflectionTestUtils.setField(gamestate, "currentPlayer", attacker);
    }

    @Test
    void testDefenderDiceCount_1Troop() throws InterruptedException {
        // Attacker attacks with 3 troops
        gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 3);
        
        // We can't easily see the local defenderRolls variable, but we can check if only one comparison was made
        // or we can check the resultDto sent via broadcastEvent.
        
        verify(gameController).broadcastEvent(any(), eq("attackResult"), argThat(argument -> {
            if (argument instanceof com.risiko.model.dto.AttackResultDto) {
                com.risiko.model.dto.AttackResultDto result = (com.risiko.model.dto.AttackResultDto) argument;
                return result.getDefenderDice().size() == 1;
            }
            return false;
        }));
    }

    @Test
    void testDefenderDiceCount_2Troops() throws InterruptedException {
        defender.getTerritories().put(Territorries.FORUM_TRASTEVEVEE, 2);
        gamestate.attack(Territorries.PALATIN, Territorries.FORUM_TRASTEVEVEE, 3);
        
        verify(gameController).broadcastEvent(any(), eq("attackResult"), argThat(argument -> {
            if (argument instanceof com.risiko.model.dto.AttackResultDto) {
                com.risiko.model.dto.AttackResultDto result = (com.risiko.model.dto.AttackResultDto) argument;
                return result.getDefenderDice().size() == 2;
            }
            return false;
        }));
    }
}
