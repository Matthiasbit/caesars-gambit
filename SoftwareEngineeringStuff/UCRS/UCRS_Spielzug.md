# UCRS – Spielzug durchführen

## 1. Introduction

### 1.1 Purpose
Dieses Use-Case Realization Specification (UCRS) Dokument beschreibt die technische Realisierung des Use Cases **„Spielzug durchführen“** im Spiel *Caesar’s Gambit*.  
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
- **Sequenzdiagramm:** [Sequenzdiagramm Spielzug](https://github.com/Matthiasbit/caesars-gambit/blob/main/SoftwareEngineeringStuff/Sequenzdiagramme/Spielzug-2025-10-14-112645.mmd)

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

## 2.3 Flow Description

1. Der Client zeigt verfügbare Truppen zur Verteilung an.  
2. Der Spieler verteilt Truppen über das UI.  
3. Der Spieler entscheidet sich für eine Aktion: Angriff, Truppenverschiebung oder Zug beenden.  
4. Bei Angriff wird eine REST-Anfrage mit Zielterritorium an das Backend gesendet. Backend prüft Besitz, führt Würfelwurf aus und aktualisiert State.  
5. Bei Truppenverschiebung sendet der Client die Einheitenbewegung an das Backend zur Validierung und Speicherung.  
6. Bei Zugende wird der nächste Spieler aktiviert und informiert.

---

## 2.4 Sequenzdiagramm – Spielzug

![Sequenzdiagram Spielzug](https://github.com/Matthiasbit/caesars-gambit/blob/main/SoftwareEngineeringStuff/Sequenzdiagramme/Spielzug-2025-10-14-112645.mmd.png?raw=true)

---

## 2.5 Primary Interactions

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

## 2.6 Alternate and Exception Flows

| Szenario | Behandlung |
|----------|------------|
| **Ungültiger Angriff** | System sendet Fehler „Invalid Territory“ zurück; GameState bleibt unverändert. |
| **Serverfehler bei Aktion** | Rollback auf vorherigen Spielzustand; Fehlermeldung an Client. |
| **Verbindungsverlust** | Temporäre Speicherung des Spielzustands; Wiederanbindung ohne Datenverlust möglich. |

---

## 3. Derived Requirements (planned state of 21.10.25)

### 3.1 Functional Requirements
- Durchführung eines vollständigen Spielzugs bestehend aus Verteilung, Angriff, Bewegung und Zugabschluss.  
- Regelprüfung und Konfliktvalidierung für alle Angriffe.  
- Würfelmechanismus zur Angriffsauswertung.  
- Aktualisierung des Spielzustands und Synchronisierung mit allen Clients.  
- Speicherung des Spielverlaufs in der Datenbank.

### 3.2 Non-Functional Requirements

| Kategorie | Anforderung |
|------------|--------------|
| **Security** | Nur autorisierter Spieler mit gültigem JWT darf Aktionen ausführen. |
| **Reliability** | Änderungen am Spielzustand werden transaktional ausgeführt. |
| **Performance** | Antwortzeit pro Zug ≤ 300 ms; Würfelergebnis in Echtzeit. |
| **Consistency** | GameState bleibt nach jeder Aktion konsistent über alle Clients hinweg. |
| **Usability** | Klare Rückmeldungen über Angriffsresultate und Spielstatusänderungen. |
| **Scalability** | Unterstützung mehrerer paralleler Spiele-Sessions. |

---

*Datei erstellt für Systemdesign Caesar’s Gambit / Risiko – Oktober 2025*
