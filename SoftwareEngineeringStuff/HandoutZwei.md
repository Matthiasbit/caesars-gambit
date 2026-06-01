# Caesar's Gambit

## Statistik Aufwendungen 


| Person   |Stunden|
|----------|-------|
| Svenja   |    85|
| David    |    90|
| Justin   |    90|
| Matthias |    85|
| Simon    |    95|


| Hauptbeitrag              | Stunden    | Person   |
|---------------------------|------------|----------|
| Metriken                  |  8 h       | Svenja   |
| Frontend-Tests            |  8 h       | David    |
| Backend-Tests             | 10 h       | Justin   |
| Raum-/ Spiellogik Backend | 50 h       | Matthias |
| Deployment                |  9 h       | Simon    |


| Workflow                     | Stunden Pro Workflow |
|------------------------------|----------------------|
| Requirements                 | 20 h                 |
| Analysis & Design            | 40 h                 |
| Implementations              | 140 h                |
| Test                         | 40 h                 |
| Deployment                   | 10 h                 |
| Configuration & Change Mgmt  | 10 h                 |
| Project Management           | 178 h                |
| Environment                  | 7 h                  |


| Phase         | Stunden Pro Phase |
|---------------|-------------------|
| Inception     | 45 h              |
| Elaboration   | 85 h              |
| Construction  | 245 h             |
| Transition    | 70 h              |


## Highlights der Demo

Das Spiel beeindruckt durch **Echtzeit-Multiplayer mit Live-Synchronisation**, bei dem mehrere Spieler parallel spielen können. Server-Sent Events pushen Zustandsänderungen in Echtzeit, sodass alle Spieler sofort Angriffe, Truppenbewegungen und Eroberungen sehen. Die **interaktive SVG-Weltkarte** bietet klickbare Territorien mit intuitiven Hover-Effekten und einer visuellen Hervorhebung eigener versus gegnerischer Gebiete durch konsistente Farbcodierung nach Spieler. Zusätzlich ermöglicht der **Live-Chat während des Spiels** strategische Diskussionen zwischen den Spielern und verbessert die Gesamtimmersion des Spielerlebnisses.

## Highlights des Projekts

Zentrales Highlight des Projekts sind die Server-Sent Events (SSE): Sie liefern einen skalierbaren, einseitig gerichteten Event-Stream vom Server an alle Clients, der Spielzustandsänderungen effizient pusht, Polling überflüssig macht und durch Delta‑Updates Bandbreite spart. Die SSE‑Architektur erleichtert Wiederverbindungen und Event‑Rekonstruktion und lässt sich nahtlos in unser Next.js/Spring‑Boot‑Setup integrieren, wodurch Performance, Konsistenz und die Echtzeit‑Benutzererfahrung deutlich verbessert werden.

## Architekturstiele/-entscheidungen
Unsere Architektur kombiniert ein Next.js/React-Frontend mit einem Spring-Boot-Backend, einer klaren Schichtenstruktur und einer PostgreSQL-Datenbank, um eine performante und gut wartbare Spielplattform bereitzustellen. Das Frontend übernimmt UI und Spiellogik in klaren Komponenten und nutzt TypeScript, um Fehler frühzeitig durch statische Typprüfung zu erkennen. Im Backend validiert Spring Boot alle Spielzüge in einer Controller‑Service‑Repository‑Schichtenarchitektur, sodass Regeln zentral durchgesetzt werden und Manipulationen auf Client-Seite verhindert werden. Über Server-Sent Events werden Zustandsänderungen effizient vom Server an alle Clients gepusht, sodass alle Spieler synchron bleiben, ohne dass die Clients ständig pollen müssen. Persistente Userdaten werden in PostgreSQL verwaltet, während ein SVG-Overlay im Frontend präzise klickbare Regionen ermöglicht, was die UI flexibel erweiterbar macht und die Einführung neuer Einheiten oder Regeln deutlich vereinfacht.


## Software Tools/Plattforms

- VS code 
- Docker
- Portainer
- DockerHub
- GitHub 
- Fork
- Jira
- Google Chrome
- SonarQube
- Ck Metrics
- PostgresSQL

## Libraries

- React
- JJWT
- Jackson

## Frameworks

- Next.js
- Spring Boot
- Tailwind CSS
- vitest
- JUnit

## Datenbank Design
Die Datenbank beinhaltet nur die Nutzerdaten, es ist möglich dort in Zukunft noch Meta Daten zu erfassen. Auf der Nutzertabelle haben wir gewisse Standardfelder, die befüllt werden und z.T. manipuliert werden können

## Testing

Das Testkonzept des Projekts ist mehrschichtig und bildet sowohl Backend- als auch Frontend‑Ebene ab. Im Backend werden Unittests mit JUnit und Mockito verwendet (Tests für Controller, Services, Security‑Utilities und Modelklassen). JaCoCo erfasst die Coverage.

Im Frontend kommen Vitest und React Testing Library zum Einsatz (Komponententests unter `Frontend/components` und Unit‑Tests in `Frontend/lib`), wobei `EventSource`/SSE‑Interaktionen gemockt werden, um State‑Updates der UI (SVG‑Map, Chat, Spielphasen) deterministisch zu prüfen. Die bestehende Coverage‑Ordnerstruktur und die Snapshot‑Tests sichern visuelle Regressionen ab.


## Metriken

- 

## CI/CD

- 

## worauf sind wir noch stolz?
Wir sind stolz darauf, dass wir einfach gut als Team funktionieren, uns gegenseitig helfen und dabei der Spaß nicht zu kurz kommt.