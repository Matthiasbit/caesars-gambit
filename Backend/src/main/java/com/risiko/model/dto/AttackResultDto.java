package com.risiko.model.dto;

import java.util.List;

public class AttackResultDto {
    private List<Integer> attackerDice;
    private List<Integer> defenderDice;
    private int lostTroopsAttack;
    private int lostTroopsDefense;
    private String territoryFrom;
    private String territoryTo;
    private boolean territoryWon;

    public AttackResultDto(List<Integer> attackerDice, List<Integer> defenderDice, 
                           int lostTroopsAttack, int lostTroopsDefense, 
                           String territoryFrom, String territoryTo, boolean territoryWon) {
        this.attackerDice = attackerDice;
        this.defenderDice = defenderDice;
        this.lostTroopsAttack = lostTroopsAttack;
        this.lostTroopsDefense = lostTroopsDefense;
        this.territoryFrom = territoryFrom;
        this.territoryTo = territoryTo;
        this.territoryWon = territoryWon;
    }

    public List<Integer> getAttackerDice() {
        return attackerDice;
    }

    public void setAttackerDice(List<Integer> attackerDice) {
        this.attackerDice = attackerDice;
    }

    public List<Integer> getDefenderDice() {
        return defenderDice;
    }

    public void setDefenderDice(List<Integer> defenderDice) {
        this.defenderDice = defenderDice;
    }

    public int getLostTroopsAttack() {
        return lostTroopsAttack;
    }

    public void setLostTroopsAttack(int lostTroopsAttack) {
        this.lostTroopsAttack = lostTroopsAttack;
    }

    public int getLostTroopsDefense() {
        return lostTroopsDefense;
    }

    public void setLostTroopsDefense(int lostTroopsDefense) {
        this.lostTroopsDefense = lostTroopsDefense;
    }

    public String getTerritoryFrom() {
        return territoryFrom;
    }

    public void setTerritoryFrom(String territoryFrom) {
        this.territoryFrom = territoryFrom;
    }

    public String getTerritoryTo() {
        return territoryTo;
    }

    public void setTerritoryTo(String territoryTo) {
        this.territoryTo = territoryTo;
    }

    public boolean isTerritoryWon() {
        return territoryWon;
    }

    public void setTerritoryWon(boolean territoryWon) {
        this.territoryWon = territoryWon;
    }
}
