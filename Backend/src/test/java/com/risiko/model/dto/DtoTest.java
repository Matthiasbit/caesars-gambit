package com.risiko.model.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DtoTest {

    @Test
    void attackResultDto_getterSetterFunktionieren() {
        AttackResultDto dto = new AttackResultDto(
                List.of(6, 5), List.of(3, 2),
                1, 2,
                "Palatin", "Laterano", true, 5);

        assertThat(dto.getAttackerDice()).containsExactly(6, 5);
        assertThat(dto.getDefenderDice()).containsExactly(3, 2);
        assertThat(dto.getLostTroopsAttack()).isEqualTo(1);
        assertThat(dto.getLostTroopsDefense()).isEqualTo(2);
        assertThat(dto.getTerritoryFrom()).isEqualTo("Palatin");
        assertThat(dto.getTerritoryTo()).isEqualTo("Laterano");
        assertThat(dto.isTerritoryWon()).isTrue();
        assertThat(dto.getAttackerTroopsCount()).isEqualTo(5);

        dto.setAttackerDice(List.of(4));
        dto.setDefenderDice(List.of(2));
        dto.setLostTroopsAttack(0);
        dto.setLostTroopsDefense(1);
        dto.setTerritoryFrom("A");
        dto.setTerritoryTo("B");
        dto.setTerritoryWon(false);
        dto.setAttackerTroopsCount(3);

        assertThat(dto.getAttackerDice()).containsExactly(4);
        assertThat(dto.getDefenderDice()).containsExactly(2);
        assertThat(dto.getLostTroopsAttack()).isZero();
        assertThat(dto.getLostTroopsDefense()).isEqualTo(1);
        assertThat(dto.getTerritoryFrom()).isEqualTo("A");
        assertThat(dto.getTerritoryTo()).isEqualTo("B");
        assertThat(dto.isTerritoryWon()).isFalse();
        assertThat(dto.getAttackerTroopsCount()).isEqualTo(3);
    }

    @Test
    void chatMessageDto_getterSetterFunktionieren() {
        ChatMessageDto dto = new ChatMessageDto("alice", "Hallo!");
        assertThat(dto.getUsername()).isEqualTo("alice");
        assertThat(dto.getMessage()).isEqualTo("Hallo!");

        dto.setUsername("bob");
        dto.setMessage("Tschüss!");
        assertThat(dto.getUsername()).isEqualTo("bob");
        assertThat(dto.getMessage()).isEqualTo("Tschüss!");
    }

    @Test
    void chatMessageDto_standardKonstruktorFunktioniert() {
        ChatMessageDto dto = new ChatMessageDto();
        assertThat(dto.getUsername()).isNull();
        assertThat(dto.getMessage()).isNull();
    }

    @Test
    void continentConquered_getterSetterFunktionieren() {
        ContinentConquered dto = new ContinentConquered();
        dto.setPlayer("alice");
        dto.setContinent("Europa");
        assertThat(dto.getPlayer()).isEqualTo("alice");
        assertThat(dto.getContinent()).isEqualTo("Europa");
    }

    @Test
    void lobbyPlayerDto_getterSetterFunktionieren() {
        LobbyPlayerDto dto = new LobbyPlayerDto("alice", true);
        assertThat(dto.getUsername()).isEqualTo("alice");
        assertThat(dto.isHost()).isTrue();

        dto.setUsername("bob");
        dto.setHost(false);
        assertThat(dto.getUsername()).isEqualTo("bob");
        assertThat(dto.isHost()).isFalse();
    }

    @Test
    void lobbyPlayerDto_standardKonstruktorFunktioniert() {
        LobbyPlayerDto dto = new LobbyPlayerDto();
        assertThat(dto.getUsername()).isNull();
        assertThat(dto.isHost()).isFalse();
    }

    @Test
    void territoryStateDto_getterSetterFunktionieren() {
        TerritoryStateDto dto = new TerritoryStateDto("Palatin", "alice", 5);
        assertThat(dto.getTerritory()).isEqualTo("Palatin");
        assertThat(dto.getOwner()).isEqualTo("alice");
        assertThat(dto.getTroops()).isEqualTo(5);

        dto.setTerritory("Laterano");
        dto.setOwner("bob");
        dto.setTroops(3);
        assertThat(dto.getTerritory()).isEqualTo("Laterano");
        assertThat(dto.getOwner()).isEqualTo("bob");
        assertThat(dto.getTroops()).isEqualTo(3);
    }

    @Test
    void territoryStateDto_standardKonstruktorFunktioniert() {
        TerritoryStateDto dto = new TerritoryStateDto();
        assertThat(dto.getTerritory()).isNull();
        assertThat(dto.getOwner()).isNull();
        assertThat(dto.getTroops()).isZero();
    }

    @Test
    void userDto_getterSetterFunktionieren() {
        UserDto dto = new UserDto("alice");
        assertThat(dto.getUsername()).isEqualTo("alice");

        dto.setUsername("bob");
        assertThat(dto.getUsername()).isEqualTo("bob");
    }

    @Test
    void userDto_standardKonstruktorFunktioniert() {
        UserDto dto = new UserDto();
        assertThat(dto.getUsername()).isNull();
    }

    @Test
    void updateUsernameRequest_getterSetterFunktionieren() {
        UpdateUsernameRequest req = new UpdateUsernameRequest("newname");
        assertThat(req.getUsername()).isEqualTo("newname");

        req.setUsername("other");
        assertThat(req.getUsername()).isEqualTo("other");
    }

    @Test
    void updateUsernameRequest_standardKonstruktorFunktioniert() {
        UpdateUsernameRequest req = new UpdateUsernameRequest();
        assertThat(req.getUsername()).isNull();
    }
}
