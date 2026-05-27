# 🏛️ Caesar's Gambit

[![CI/CD](https://github.com/dhbw-softwareengineering/caesars-gambit/actions/workflows/dockerbuild.yml/badge.svg?query=branch%3Amain)](https://github.com/dhbw-softwareengineering/caesars-gambit/actions/workflows/dockerbuild.yml?query=branch%3Amain)
![Java](https://img.shields.io/badge/Java-25-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)

Ein modernes, webbasiertes Strategiespiel inspiriert von Risiko, entwickelt mit einer robusten Fullstack-Architektur und einer automatisierten Deployment-Pipeline.

🌐 **Live-Demo:** [caesars-gambit.knoep.de](https://caesars-gambit.knoep.de)

---

## 🚀 Technologie-Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Sprache:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** React Query (TanStack Query)
- **Kommunikation:** REST API & SSE (Server-Sent Events) für Echtzeit-Updates

### Backend
- **Framework:** [Spring Boot 3](https://spring.io/projects/spring-boot)
- **Sprache:** Java 25
- **Datenbank:** PostgreSQL 15
- **Sicherheit:** JWT-basierte Authentifizierung
- **Build-Tool:** Maven

---

## 🛠️ Entwicklung & Lokaler Start

Voraussetzung: **Docker** und **Docker Compose**.

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/dhbw-softwareengineering/caesars-gambit.git
    cd caesars-gambit
    ```

2.  **Infrastruktur starten:**
    ```bash
    docker compose up --build
    ```
    - **Frontend:** [http://localhost:3000](http://localhost:3000)
    - **Backend API:** [http://localhost:8080](http://localhost:8080)
    - **Adminer (DB Management):** [http://localhost:8081](http://localhost:8081)

---

## 🏗️ CI/CD & Deployment

Das Projekt nutzt eine vollautomatisierte CI/CD-Pipeline, um höchste Codequalität und nahtlose Updates zu gewährleisten.

### 1. GitHub Actions (Continuous Integration & Delivery)
Bei jedem Push auf den `main`-Branch löst ein Workflow folgende Schritte aus:
- **Linting & Type-Checking:** Validierung des Frontend-Codes.
- **Testing:** Ausführung von Unit- und Integrationstests (JUnit & Vitest).
- **Docker Build:** Erstellung optimierter Multi-Stage Docker-Images für Frontend und Backend.
- **Push to GHCR:** Die Images werden in die [GitHub Container Registry](https://github.com/dhbw-softwareengineering/caesars-gambit/pkgs) gepusht.

### 2. Automatisches Deployment (CD)
Die produktive Umgebung auf `caesars-gambit.knoep.de` wird durch **Portainer** und **Watchtower** verwaltet:

- **Portainer Stack:** Das Deployment basiert auf der `docker-compose.prod.yml`, welche die aktuellsten Images aus der GHCR nutzt.
- **Watchtower:** Ein dedizierter Watchtower-Container überwacht die GitHub Container Registry auf neue Image-Versionen.
- **Auto-Update:** Sobald GitHub Actions ein neues Image mit dem Tag `:latest` pusht, erkennt Watchtower die Änderung, zieht das neue Image und startet die betroffenen Container (Backend & Frontend) automatisch neu.

### Deployment-Übersicht
| Komponente      | URL                                                        | Image                                                             |
| :-------------- | :--------------------------------------------------------- | :---------------------------------------------------------------- |
| **Frontend**    | [caesars-gambit.knoep.de](https://caesars-gambit.knoep.de) | `ghcr.io/dhbw-softwareengineering/caesars-gambit-frontend:latest` |
| **Backend API** | [cg-api.knoep.de](https://cg-api.knoep.de)                 | `ghcr.io/dhbw-softwareengineering/caesars-gambit-backend:latest`  |

---

## 📂 Projektstruktur

```text
caesars-gambit/
├── .github/workflows/    # CI/CD Definitionen
├── Backend/              # Spring Boot Anwendung
│   ├── src/              # Java Quellcode & Ressourcen
│   └── dockerfile        # Multi-stage JRE Image
├── Frontend/             # Next.js Anwendung
│   ├── app/              # App Router (Seiten & Layouts)
│   ├── components/       # UI & API Komponenten
│   └── dockerfile        # Optimierter Standalone Build
├── docker-compose.yml    # Lokales Setup
└── docker-compose.prod.yml # Produktions-Konfiguration
```

---

## 🛡️ Sicherheit & Umgebung
Sowohl lokal als auch in Produktion werden sensible Daten über Umgebungsvariablen gesteuert:
- `JWT_SECRET`: Schlüssel für die Token-Signierung.
- `NEXT_PUBLIC_API_URL`: Adresse der Backend-API für das Frontend.
- `CORS_ALLOWED_ORIGINS`: Erlaubte Origins für den API-Zugriff.

---
*Entwickelt im Rahmen des Software Engineering Moduls an der DHBW.*
