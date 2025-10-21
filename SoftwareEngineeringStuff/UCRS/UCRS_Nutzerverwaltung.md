
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

## 2. Flow of Events — Design
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

### 2.3 Primary Interactions  

| Komponente | Verantwortung |
|-------------|----------------|
| **Client (Frontend)** | Darstellung der Benutzeroberfläche für Registrierung, Login und Profilbearbeitung; sendet HTTPS-Anfragen an das Backend. |
| **Backend (Spring Boot)** | Übernimmt Authentifizierung, Passwort-Hashing, SessionToken-Erzeugung (JWT) und Fehlerbehandlung. |
| **Database (PostgreSQL)** | Persistente Speicherung der Benutzerdaten (E-Mail, Benutzername, Passwort-Hash). |

### 2.4 Flow Description

#### Registration
1. Der Benutzer gibt E-Mail, Nutzernamen und Passwort ein.  
2. Der Client sendet `register(email, nutzername, hashedPW)` an das Backend.  
3. Das Backend legt einen neuen Benutzereintrag in der Datenbank an.  
4. Nach erfolgreicher Speicherung wird ein **SessionToken (JWT)** erstellt und an den Client gesendet.  

#### Login
1. Der Client sendet `login(email, hashedPW)` an das Backend.  
2. Das Backend ruft den gespeicherten Passwort-Hash aus der Datenbank ab.  
3. Die Eingabe wird geprüft; bei Übereinstimmung wird ein **SessionToken** erzeugt.  
4. Der Client erhält das Token oder eine Fehlermeldung (z. B. bei ungültigen Daten).  

#### Edit Profile
1. Der Client sendet `editUser(sessionToken, email, nutzername, hashedPW)` an das Backend.  
2. Das Backend überprüft den Token auf Gültigkeit.  
3. Bei gültigem Token werden die geänderten Daten in der Datenbank aktualisiert.  
4. Das Backend bestätigt die erfolgreiche Aktualisierung.

### 2.5 Alternate and Exception Flows  

| Szenario | Behandlung |
|-----------|------------|
| **E-Mail bereits vorhanden (bei Registrierung)** | Backend gibt HTTP 409 (Conflict) zurück; UI zeigt Fehlermeldung. |
| **Falsches Passwort (bei Login)** | Backend gibt HTTP 401 (Unauthorized) zurück. |
| **Ungültiger oder abgelaufener Token (bei Profiländerung)** | Backend verweigert Zugriff und fordert den Benutzer zum erneuten Login auf. |
| **Ungültige Eingabe (Frontend)** | Eingaben werden vor dem Absenden validiert; Benutzer erhält direkte Rückmeldung. |

## 3. Derived Requirements(planned state of 21.10.25)

### 3.1 Functional Requirements  
- Registrierung neuer Benutzer mit Validierung und Passwort-Hashing.  
- Authentifizierung bestehender Benutzer über E-Mail und Passwort.  
- Ausgabe eines SessionTokens (JWT) für sichere Sitzungen.  
- Möglichkeit zur Bearbeitung und Speicherung von Profildaten.  
- HTTPS-API-Kommunikation zwischen Client und Server.  

### 3.2 Non-Functional Requirements  

| Kategorie | Anforderung |
|------------|--------------|
| **Security** | Passwörter werden ausschließlich gehasht gespeichert; Kommunikation erfolgt ausschließlich über HTTPS. |
| **Reliability** | Systemverfügbarkeit 99,9 %; Wiederherstellungszeit (MTTR) < 1 h. |
| **Performance** | Maximale Antwortzeit 500 ms pro Anfrage. |
| **Usability** | Intuitive UI mit klaren Fehlermeldungen und Eingabevalidierung. |
| **Maintainability** | Saubere Code-Struktur nach MVC-Prinzip; modulare Schichtenarchitektur. |
| **Extensibility** | Möglichkeit zur späteren Integration von OAuth2/Social-Login. |

### 3.3 Mapping to Design Artifacts  

| Artefakt | Beschreibung |
|-----------|--------------|
| **UserController** | Stellt REST-Endpunkte `/register`, `/login`, `/user/edit` bereit. |
| **UserService** | Implementiert Logik für Registrierung, Login, Tokenverwaltung. |
| **UserRepository** | Schnittstelle zur PostgreSQL-Datenbank (CRUD-Operationen). |
| **SessionToken (JWT)** | Dient zur sicheren Authentifizierung und Autorisierung. |

### 3.4 Legal and Licensing Requirements  
- Es dürfen ausschließlich Bibliotheken mit **MIT**- oder **Apache 2.0**-Lizenz verwendet werden.  
- Verarbeitung personenbezogener Daten erfolgt gemäß **DSGVO** (Datenschutz-Grundverordnung).  

## 4. Summary  
Der Use Case **„Nutzerverwaltung“** bildet die Grundlage für Authentifizierung und Benutzermanagement im Spiel *Caesar’s Gambit*.  
Durch sichere Passwortspeicherung, Token-basierte Sitzungen und strikte Trennung der Systemschichten wird eine robuste, wartbare und skalierbare Benutzerverwaltung gewährleistet.  
Sie stellt sicher, dass nur verifizierte Spieler Zugriff auf Spielräume, Spielzüge und persönliche Profile erhalten.

