package com.risiko.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * Continents of the game map with their territories and bonus troops.
 * Bonus troop values can be adjusted via the BONUS_TROOPS field of each constant.
 */
public enum Continent {

    // NW island-like region (blue border)
    BLAUE_KUESTE(2,
            Territorries.PALATIN,
            Territorries.LATERANO,
            Territorries.FORUM_TRASTEVEVEE,
            Territorries.CAMPANIA_A_LAPPE),

    // Centre-left region (dark-red border)
    ANTIKENHERZ(5,
            Territorries.TOSCANA_UND_UNBURIA,
            Territorries.FLORENZZ,
            Territorries.FORUM_VATLKANSTADT,
            Territorries.VARENSIA,
            Territorries.PORRUGIERT,
            Territorries.SANDFELSEN,
            Territorries.APENINII_TAL,
            Territorries.PALERNO,
            Territorries.HAIRON,
            Territorries.MATTRA,
            Territorries.HORTHITAL,
            Territorries.FOROUZA),

    // Western coast (small green border)
    WESTKUESTE(3,
            Territorries.EICHENWALD,
            Territorries.PONRALMA,
            Territorries.NEAPEL,
            Territorries.TRENTAKUSTE,
            Territorries.DUENENSEE,
            Territorries.RENIAKUSTE,
            Territorries.JONISCHE_UFER,
            Territorries.STRUMICIACHE_UFER),

    // North-east region (large green border)
    NORDOSTEN(7,
            Territorries.AQUITANE,
            Territorries.MAURENIET,
            Territorries.TUSKULUM,
            Territorries.AUGUSTA_NEMETERS,
            Territorries.AGUALAINE,
            Territorries.FARNOVIA,
            Territorries.MONTEGRO,
            Territorries.MARSKEM,
            Territorries.LISITONE,
            Territorries.LAURIA,
            Territorries.TENUBRA,
            Territorries.PERGUGIA,
            Territorries.APPULLEN,
            Territorries.ERALDIS,
            Territorries.MENDRIA),

    // South-centre region (cyan border)
    SUEDMITTE(5,
            Territorries.SILBER_BUCHT,
            Territorries.APILION,
            Territorries.TUKU,
            Territorries.FELSDUENE,
            Territorries.SIZI_KUESTE,
            Territorries.SANDMEER,
            Territorries.HARI,
            Territorries.PALEMO,
            Territorries.FELSDUENE_2,
            Territorries.PONRALMA_UFER,
            Territorries.MOLASSNO,
            Territorries.LUCERRA,
            Territorries.SZULIONEN,
            Territorries.TREVOIA,
            Territorries.PATATRA),

    // South-east region (purple border)
    SUEDOSTEN(3,
            Territorries.ALABRE_KUSTE,
            Territorries.SIZILLEBT_ERGANSEKUR,
            Territorries.KRAILDUNE,
            Territorries.MAL_GOLF_TARENT,
            Territorries.MESSNO_ERKANSI,
            Territorries.MONTE_SKARNO);

    /** Bonus troops awarded for controlling this entire continent. Adjust as needed. */
    private final int bonusTroops;
    private final Set<Territorries> territories;

    Continent(int bonusTroops, Territorries... territories) {
        this.bonusTroops = bonusTroops;
        this.territories = Collections.unmodifiableSet(EnumSet.copyOf(Arrays.asList(territories)));
    }

    public int getBonusTroops() {
        return bonusTroops;
    }

    public Set<Territorries> getTerritories() {
        return territories;
    }

    public boolean isControlledBy(Player player) {
        return player.getTerritories().keySet().containsAll(territories);
    }
}
