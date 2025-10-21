
# UCRS
## 1. Introduction
### 1.1 Purpose
Dieses Use-Case Realization Specification (UCRS) Dokument beschreibt die technische Realisierung des Use Cases **„Nutzerverwaltung“** im Spiel *Caesar’s Gambit*.  
Der Use Case beinhaltet die **Registrierung**, **Anmeldung (Login)** und **Profilverwaltung (Bearbeitung der Benutzerdaten)** von Spielern.  
Ziel ist es, die sichere Identifikation und Verwaltung der Nutzerkonten zu gewährleisten und den Zugang zum Spielsystem zu ermöglichen.

### 1.2 Scope
Dieser Use Case ist ein zentraler Bestandteil der gesamten Anwendung, da er:
- den Einstiegspunkt für jeden Spieler darstellt,  
- die Authentifizierung für Spielaktionen kontrolliert,  
- die Verwaltung von Benutzerinformationen und Sessions ermöglicht.  

Er umfasst alle Interaktionen zwischen **Client (Frontend)**, **Backend (Spring Boot)** und der **Datenbank (PostgreSQL)** im Rahmen der Benutzerverwaltung. 


### 1.3 Definitions, Acronyms, and Abbreviations
| Abkürzung | Bedeutung |
|------------|------------|
| UCRS | Use-Case Realization Specification |
| UI | User Interface (Benutzeroberfläche) |
| DB | Datenbank |
| REST | Representational State Transfer |
| TS | TypeScript |
| HTTPS | Hypertext Transfer Protocol Secure |
| PW | Passwort |
| JWT | JSON Web Token (SessionToken) |

### 1.4 References
- **SRS-Dokument:** *Caesar’s Gambit – Software Requirements Specification*  
- **PostgreSQL Dokumentation**  
- **React & Spring Boot Offizielle Dokumentation**  
- **OWASP Security Guidelines**  
- **IEEE830-1998 SRS Standard**  
- **Mockup-Link:** [Figma Mockup v1.0 (GitHub)](https://github.com/Matthiasbit/Risiko/blob/cfd9ecfe9df2ef198c8016261d3e5bfd2a1d46d2/SoftwareEngineeringStuff/FigmaVersions/Version1.0.pdf)


### 1.5 Overview
Dieses Dokument beschreibt:
- die technische Realisierung der Nutzerverwaltung,  
- die beteiligten Komponenten und deren Interaktionen,  
- die zugehörigen Sequenzdiagramme,
- die abgeleiteten funktionalen und nicht-funktionalen Anforderungen.

#### 2. Flow of Events — Design
Die **Nutzerverwaltung** besteht aus drei Hauptfunktionen:

1. **Registrierung:** Erstellen eines neuen Benutzerkontos.  
2. **Login:** Authentifizierung eines bestehenden Benutzers.  
3. **Profilverwaltung:** Bearbeiten der eigenen Kontoinformationen.

Der Ablauf erfolgt nach dem **Client-Server-Modell**:  
- Das **Frontend (React + TypeScript)** stellt Eingabemasken bereit und sendet Anfragen über HTTPS.  
- Das **Backend (Spring Boot)** verarbeitet Logik, Authentifizierung und Kommunikation mit der Datenbank.  
- Die **Datenbank (PostgreSQL)** speichert Benutzerinformationen und Passwort-Hashes.  

Alle Passwörter werden ausschließlich **gehasht** gespeichert, und Tokens sichern jede Sitzung gegen unbefugten Zugriff ab.

### 2.2 Sequenzdiagramm – Nutzerverwaltung
Liegt momentan noch im Folder: Sequenzdiagramme


 Komponente | Verantwortung |
|-------------|----------------|
| **Client (Frontend)** | Darstellung der Benutzeroberfläche für Registrierung, Login und Profilbearbeitung; sendet REST-Anfragen an das Backend. |
| **Backend (Spring Boot)** | Übernimmt Authentifizierung, Passwort-Hashing, SessionToken-Erzeugung (JWT) und Fehlerbehandlung. |
| **Datenbank (PostgreSQL)** | Persistente Speicherung der Benutzerdaten (E-Mail, Benutzername, Passwort-Hash). |


  - [Short narrative summarizing the realization strategy]
- Primary interactions (sequence/communication)
  - [List the main collaborating objects and their responsibilities]
- Diagrams referenced
  - Sequence diagrams:
    - [Filename or link — brief description of purpose]
  - Collaboration/communication diagrams:
    - [Filename or link — brief description of purpose]
  - Activity diagrams:
    - [Filename or link — brief description of purpose]
- Mapping between flows and design artifacts
  - [Explain how each step/use-case flow maps to objects, operations, and interactions]
- Alternate and exception flows
  - [Describe how alternate flows are realized and how exceptions are handled in the design]

#### 3. Derived Requirements
[A textual description that collects all requirements, such as non-functional requirements, on the use-case realizations not considered in the design model, but that need to be taken care of during implementation.]
