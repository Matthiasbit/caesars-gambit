package com.risiko.model;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Enum of territories. Enum constant names are sanitized (Java identifier
 * safe).
 * Use {@link #getDisplayName()} to get the original label as shown in the SVG.
 */
public enum Territorries {
    PALATIN("Palatin"),
    LATERANO("Laterano"),
    FORUM_TRASTEVEVEE("Forum Trastevevee"),
    CAMPANIA_A_LAPPE("Campania a Lappe"),
    EICHENWALD("Eichenwald"),
    PONRALMA("Ponralma"),
    NEAPEL("Neapel"),
    TRENTAKUSTE("Trentakuste"),
    DUENENSEE("Dünensee"),
    RENIAKUSTE("Reniakuste"),
    JONISCHE_UFER("Jonische-Ufer"),
    STRUMICIACHE_UFER("Strumiciache Ufer"),
    TOSCANA_UND_UNBURIA("Toscana + Unburia"),
    FLORENZZ("Florenzz"),
    FORUM_VATLKANSTADT("Forum Vatlkanstadt"),
    VARENSIA("Varensia"),
    PORRUGIERT("Porrugiert"),
    SANDFELSEN("Sandfelsen"),
    APENINII_TAL("ApeniniiTal"),
    SILBER_BUCHT("Silber-Bucht"),
    PALERNO("Palerno"),
    HAIRON("Hairon"),
    MATTRA("Mattra"),
    HORTHITAL("Horthital"),
    FOROUZA("Forouza"),
    APILION("Apilion"),
    MENDRIA("Mendria"),
    PERGUGIA("Pergugia"),
    FARNOVIA("Farnovia"),
    LISITONE("Lisitone"),
    MARSKEM("Marskem"),
    APPULLEN("Appullen"),
    TUKU("Tuku"),
    ERALDIS("Eraldis"),
    AUGUSTA_NEMETERS("Augusta Nemeters"),
    AQUITANE("Aquitane"),
    MAURENIET("Maureniet"),
    TUSKULUM("Tuskulum"),
    MONTEGRO("Montegro"),
    AGUALAINE("Agualaine"),
    LAURIA("Lauria"),
    TENUBRA("Tenubra"),
    FELSDUENE("Felsdüne"),
    SIZI_KUESTE("Sizi Küste"),
    SANDMEER("Sandmeer"),
    HARI("Hari"),
    PALEMO("Palemo"),
    FELSDUENE_2("Felsdüne2"),
    PONRALMA_UFER("Ponralma Ufer"),
    MOLASSNO("Molassno"),
    LUCERRA("Lucerra"),
    SZULIONEN("Szulionen"),
    TREVOIA("Trevoia"),
    PATATRA("Patatra"),
    ALABRE_KUSTE("Alabre Kuste"),
    SIZILLEBT_ERGANSEKUR("Sizillebt Ergansekur"),
    KRAILDUNE("Kraildune"),
    MAL_GOLF_TARENT("Mal Golf Tarent"),
    MESSNO_ERKANSI("Messno Erkansi"),
    MONTE_SKARNO("Monte Skarno");

    private final String displayName;
    private final Set<Territorries> neighbors = new HashSet<>();

    Territorries(String displayName) {
        this.displayName = displayName;
    }

    public boolean isAdjacentTo(Territorries other) {
        return neighbors.contains(other);
    }

    public Set<Territorries> getNeighbors() {
        return Collections.unmodifiableSet(neighbors);
    }

    private static void connect(Territorries a, Territorries b) {
        a.neighbors.add(b);
        b.neighbors.add(a);
    }

    static {
        connect(AGUALAINE, AUGUSTA_NEMETERS);
        connect(AGUALAINE, FARNOVIA);
        connect(AGUALAINE, LISITONE);
        connect(AGUALAINE, MONTEGRO);
        connect(AGUALAINE, TUSKULUM);
        connect(ALABRE_KUSTE, HARI);
        connect(ALABRE_KUSTE, KRAILDUNE);
        connect(ALABRE_KUSTE, SIZILLEBT_ERGANSEKUR);
        connect(ALABRE_KUSTE, TUKU);
        connect(APENINII_TAL, PORRUGIERT);
        connect(APENINII_TAL, SANDMEER);
        connect(APENINII_TAL, VARENSIA);
        connect(APENINII_TAL, SILBER_BUCHT);
        connect(APILION, FELSDUENE);
        connect(APILION, HARI);
        connect(APILION, MENDRIA);
        connect(APILION, PALERNO);
        connect(APILION, TUKU);
        connect(APPULLEN, ERALDIS);
        connect(APPULLEN, LISITONE);
        connect(APPULLEN, MENDRIA);
        connect(APPULLEN, PERGUGIA);
        connect(APPULLEN, EICHENWALD);
        connect(AQUITANE, AUGUSTA_NEMETERS);
        connect(AQUITANE, MAURENIET);
        connect(AUGUSTA_NEMETERS, FARNOVIA);
        connect(AUGUSTA_NEMETERS, FOROUZA);
        connect(AUGUSTA_NEMETERS, MAURENIET);
        connect(CAMPANIA_A_LAPPE, EICHENWALD);
        connect(CAMPANIA_A_LAPPE, FORUM_TRASTEVEVEE);
        connect(CAMPANIA_A_LAPPE, FORUM_VATLKANSTADT);
        connect(DUENENSEE, JONISCHE_UFER);
        connect(DUENENSEE, NEAPEL);
        connect(DUENENSEE, PONRALMA);
        connect(DUENENSEE, RENIAKUSTE);
        connect(EICHENWALD, NEAPEL);
        connect(EICHENWALD, PONRALMA);
        connect(ERALDIS, MENDRIA);
        connect(ERALDIS, TUKU);
        connect(FARNOVIA, FOROUZA);
        connect(FARNOVIA, LISITONE);
        connect(FARNOVIA, MATTRA);
        connect(FARNOVIA, PERGUGIA);
        connect(FELSDUENE, HARI);
        connect(FELSDUENE, SANDMEER);
        connect(FELSDUENE_2, MOLASSNO);
        connect(FELSDUENE_2, PALEMO);
        connect(FELSDUENE_2, PONRALMA_UFER);
        connect(FELSDUENE_2, SIZI_KUESTE);
        connect(FLORENZZ, FORUM_VATLKANSTADT);
        connect(FLORENZZ, PORRUGIERT);
        connect(FLORENZZ, SANDFELSEN);
        connect(FLORENZZ, TOSCANA_UND_UNBURIA);
        connect(FLORENZZ, VARENSIA);
        connect(FOROUZA, HORTHITAL);
        connect(FOROUZA, MATTRA);
        connect(FOROUZA, TOSCANA_UND_UNBURIA);
        connect(FORUM_TRASTEVEVEE, PALATIN);
        connect(FORUM_VATLKANSTADT, PORRUGIERT);
        connect(HAIRON, MATTRA);
        connect(HAIRON, MENDRIA);
        connect(HAIRON, PERGUGIA);
        connect(HAIRON, SANDFELSEN);
        connect(HAIRON, SILBER_BUCHT);
        connect(HARI, LUCERRA);
        connect(HARI, SANDMEER);
        connect(HARI, TUKU);
        connect(HORTHITAL, MATTRA);
        connect(HORTHITAL, SANDFELSEN);
        connect(HORTHITAL, SILBER_BUCHT);
        connect(HORTHITAL, TOSCANA_UND_UNBURIA);
        connect(JONISCHE_UFER, RENIAKUSTE);
        connect(KRAILDUNE, MAL_GOLF_TARENT);
        connect(KRAILDUNE, SIZILLEBT_ERGANSEKUR);
        connect(LATERANO, PALATIN);
        connect(LATERANO, TOSCANA_UND_UNBURIA);
        connect(LAURIA, MONTEGRO);
        connect(LAURIA, TENUBRA);
        connect(LISITONE, MARSKEM);
        connect(LISITONE, MONTEGRO);
        connect(LISITONE, PERGUGIA);
        connect(LUCERRA, MOLASSNO);
        connect(LUCERRA, PALEMO);
        connect(LUCERRA, SANDMEER);
        connect(LUCERRA, SZULIONEN);
        connect(MAL_GOLF_TARENT, MESSNO_ERKANSI);
        connect(MAL_GOLF_TARENT, MONTE_SKARNO);
        connect(MAL_GOLF_TARENT, SIZILLEBT_ERGANSEKUR);
        connect(MARSKEM, MONTEGRO);
        connect(MATTRA, PERGUGIA);
        connect(MATTRA, SANDFELSEN);
        connect(MATTRA, SILBER_BUCHT);
        connect(MAURENIET, TUSKULUM);
        connect(MENDRIA, PALERNO);
        connect(MENDRIA, PERGUGIA);
        connect(MENDRIA, TUKU);
        connect(MESSNO_ERKANSI, MONTE_SKARNO);
        connect(MESSNO_ERKANSI, PATATRA);
        connect(MOLASSNO, PALEMO);
        connect(MOLASSNO, SZULIONEN);
        connect(MOLASSNO, TREVOIA);
        connect(MONTE_SKARNO, PATATRA);
        connect(MONTE_SKARNO, SIZILLEBT_ERGANSEKUR);
        connect(MONTEGRO, TUSKULUM);
        connect(NEAPEL, PONRALMA);
        connect(NEAPEL, RENIAKUSTE);
        connect(NEAPEL, PORRUGIERT);
        connect(PALEMO, SANDMEER);
        connect(PALEMO, SIZI_KUESTE);
        connect(PALEMO, SZULIONEN);
        connect(PALERNO, SILBER_BUCHT);
        connect(PALERNO, APENINII_TAL);
        connect(PATATRA, TREVOIA);
        connect(PONRALMA, RENIAKUSTE);
        connect(PONRALMA, TRENTAKUSTE);
        connect(PORRUGIERT, VARENSIA);
        connect(RENIAKUSTE, STRUMICIACHE_UFER);
        connect(RENIAKUSTE, TRENTAKUSTE);
        connect(STRUMICIACHE_UFER, JONISCHE_UFER);
        connect(SANDFELSEN, SILBER_BUCHT);
        connect(SANDFELSEN, TOSCANA_UND_UNBURIA);
        connect(SANDFELSEN, VARENSIA);
        connect(SANDMEER, SIZI_KUESTE);
        connect(DUENENSEE, SIZI_KUESTE);
        connect(SANDMEER, SZULIONEN);
        connect(SILBER_BUCHT, VARENSIA);
        connect(SZULIONEN, TREVOIA);
        connect(TOSCANA_UND_UNBURIA, VARENSIA);
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Territorries getTerritorryByDisplayName(String displayName) {
        for (Territorries t : Territorries.values()) {
            if (t.getDisplayName().equals(displayName)) {
                return t;
            }
        }
        return null;
    }

    public static boolean findWayIfPossible(Territorries from, Territorries to, Set<Territorries> visited, Player player) {
        if (from == to) {
            return true;
        }
        visited.add(from);
        for (Territorries neighbor : from.getNeighbors()) {
            if (player.getTerritories().containsKey(neighbor)) {
                if (!visited.contains(neighbor)) {
                    if (findWayIfPossible(neighbor, to, visited, player)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
