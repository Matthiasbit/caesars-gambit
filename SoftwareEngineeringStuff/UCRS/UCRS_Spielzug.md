# UCRS – Spielzug durchführen

## 1. Introduction

### 1.1 Purpose
Dieses Use-Case Realization Specification (UCRS) Dokument beschreibt die technische Realisierung des Use Cases **„Spielzug durchführen“** im Brettspiel *Risiko*.  
Der Use Case umfasst die Aktionen **Truppenverteilung**, **Angriff**, **Truppenverschiebung** und das **Beenden des Zuges**.  
Ziel ist die regelkonforme Abwicklung des Spielzuges sowie die sichere Synchronisierung des Spielzustandes zwischen allen Spielern.

### 1.2 Scope
Dieser Use Case ist zentral für die Spiellogik, da er:
- den eigentlichen Spielfortschritt steuert,
- Regelvalidierungen ausführt,
- Zustandsänderungen am Spielplan verwaltet.

Er beinhaltet Interaktionen zwischen **Frontend (Client, React + TS)**, **Backend (Spring Boot)** und der **Datenbank (PostgreSQL)** beim Durchführen eines Zuges.

### 1.3 Definitions, Acronyms, and Abbreviations
| Abkürzung | Bedeutung |
|------------|------------|
| UCRS | Use-Case Realization Specification |
| UI | User Interface |
| DB | Datenbank |
| REST | Representational State Transfer |
| TS | TypeScript |
| HTTPS | Hypertext Transfer Protocol Secure |
| JWT | JSON Web Token |
| GameState | Abbild des Spielzustands |

### 1.4 References
- **SRS-Dokument:** *Risiko – Software Requirements Specification*  
- **PostgreSQL Dokumentation**  
- **React & Spring Boot Dokumentation**  
- **OWASP Security Guidelines**  
- **IEEE830-1998 SRS Standard**  
- **Sequenzdiagramm:** `Spielzug-2025-10-14-112645.mmd`

### 1.5 Overview
Dieses Dokument beschreibt:
- die technische Umsetzung des Spielzugsprozesses,
- Interaktionen zwischen Client, Backend und Datenbank,
- die Abbildung des Spielzugsdiagramms in Backend-Funktionalität,
- funktionale und nicht-funktionale Anforderungen.

---

## 2. Flow of Events – Design

### 2.1 Ablaufphasen

1. **Truppenverteilung:**  
   Der Spieler setzt verfügbare neue Truppen auf eigene Territorien im Client.
2. **Aktion (Alternativen):**
   - **Angriff:** Angriff auf ein angrenzendes Territorium.
   - **Truppenverschiebung:** Bewegung eigener Einheiten zwischen verbundenen Territorien.
   - **Keine Aktion:** Direktes Beenden des Zuges.
3. **Zugabschluss:**  
   Übergabe des Spielrechts an den nächsten Spieler.

### 2.2 Systemkomponenten

| Komponente | Verantwortung |
|-------------|----------------|
| **Client (Frontend)** | Darstellung des Spielfeldes, Erfassung der Spielaktionen, Kommunikation mit dem Backend per REST. |
| **Backend (Spring Boot)** | Berechnung, Regelprüfung, Würfelergebnisse, GameState-Updates und Synchronisation der Spielzüge. |
| **Datenbank (PostgreSQL)** | Speicherung des Spielzustands inklusive Truppenanzahl, Besitz und Zughistorie. |

---

## 2.3 Sequence Diagram — Spielzug

```
sequenceDiagram
participant Game
participant Spieler
participant Spieler2

activate Game
activate Spieler
activate Spieler2

Game -->> Spieler: nextMove()
Spieler -->> Spieler: Truppenverteilung neuer Truppen im Client
Spieler -->> Spieler: Truppenverschiebung oder Angriff oder keine Aktion
alt wenn Angriff
Spieler -->> Game: angriff(Teritorium)
Game -->> Spieler2: has(Teritorium) return bool
Game -->> Game: dice()
Game -->> Spieler2: showResult(troupesLost, Teritorium) return troupesLeft
alt wenn troupesLeft = 0
Game -->> Spieler: newTeritorium(Teritorium)
end
Game -->> Spieler: showResult(troupesLost, Teritorium)
Spieler -->> Game: kann neue Aktion starten
else wenn Truppenverschiebung
Spieler -->> Spieler: moveTroupes(amount, T1, T2)
else keine Aktion
Spieler -->> Game: endMove()
Game -->> Game: nextMove()
end

deactivate Game
deactivate Spieler
deactivate Spieler2
```

---

## 2.4 Mapping Between Use Case Flow and Design Artifacts

| Use-Case Aktion | Entsprechende Implementierung | Beschreibung |
|-----------------|-------------------------------|---------------|
| nextMove() | REST `/move/start` | Start des Zuges eines Spielers |
| angriff() | REST `/attack` | Berechnet Würfelergebnisse und prüft Besitzverhältnisse |
| dice() | Backend `DiceService.roll()` | Simuliert Würfelergebnisse |
| showResult() | Frontend `BattleResultModal` | Zeigt Ergebnisse und Verluste |
| moveTroupes() | REST `/move` | Bewegt Einheiten zwischen Territorien |
| endMove() | REST `/move/end` | Schließt den Spielzug ab |
| nextMove() | Backend `GameService.nextPlayer()` | Nächster Spieler beginnt Zug |

---

## 2.5 Alternate and Exception Flows

- **Ungültiger Angriff:**  
  System sendet Fehler „Invalid Territory“ zurück, keine Änderung am GameState.
- **Server-Aktion fehlschlägt:**  
  Rollenbasierte Wiederherstellung des vorherigen GameStates.
- **Verbindungsverlust:**  
  Temporärer Spielspeicher sichert aktuellen Zustand zur Wiederaufnahme.

---

## 3. Derived Requirements

- **Konsistenz:** Alle Zustandsänderungen erfolgen transaktional.
- **Synchronität:** Jeder Client erhält unverzüglich aktualisierte Spielinformationen.
- **Sicherheit:** Nur der aktive Spieler darf Züge ausführen (JWT-Validierung).
- **Nachvollziehbarkeit:** Jede Zugaktion wird in einer Historie gespeichert.
- **Performance:** Antwortzeit pro Aktionen ≤ 300 ms.

---