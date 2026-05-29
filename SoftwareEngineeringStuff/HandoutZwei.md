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
| Backend-Tests             |  9 h       | Justin   |
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


| Workflow                     | Stunden Pro Workflow
|------------------------------|---------------------|
| Requirements                 | 20 h                | 
| Analysis & Design            | 40 h                | 
| Implementations              | 75 h                | 
| Test                         |  0 h                |
| Deployment                   |  5 h                | 
| Configuration & Change Mgmt  |  5 h                | 
| Project Management           | 10 h                | 
| Environment                  | 10 h                | 


| Phase         | Stunden Pro Phase |
|---------------|-------------------|
| Inception     | 45 h              |
| Elaboration   | 85 h              |
| Construction  | 245 h             |
| Transition    | 70 h              |


## Highlights der Demo



## Highlights des Projekts



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

- 

## Testing

- 

## Metriken

- 

## CI/CD

- 

## worauf sind wir noch stolz?

- 