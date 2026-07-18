# Travel Tracker

Web-App zum Tracken aller bereisten Länder: interaktive Weltkarte, Länderverwaltung
mit mehreren Besuchen pro Land, Statistik-Dashboard mit Achievements. Gebaut nach
[travel-tracker-prompt.md](./travel-tracker-prompt.md).

## Tech-Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL** (lokal via `prisma dev`, produktiv via Vercel Postgres/Neon)
- **react-simple-maps** für die SVG-Weltkarte (Daten: [world-atlas](https://unpkg.com/world-atlas@2/countries-110m.json))
- **recharts** für die Statistik-Charts
- **jose** für signierte Session-Cookies (Passwortschutz)
- **world-countries** als Datenquelle für alle 250 Länder (inkl. deutscher Übersetzungen)

## Setup

```bash
npm install
cp .env.example .env   # DATABASE_URL, APP_PASSWORD, SESSION_SECRET eintragen
npx prisma migrate deploy   # Schema anlegen
npx prisma db seed          # alle Länder importieren
npm run dev
```

`npm install` führt automatisch `prisma generate` aus (`postinstall`-Skript).

### Lokale Datenbank ohne eigenen Postgres-Server

Prisma bringt einen eingebauten lokalen Postgres-Server mit (kein Docker nötig):

```bash
npx prisma dev
```

Der Befehl gibt eine `DATABASE_URL` aus, die du in `.env` einträgst. Dieses Setup wurde
für die lokale Entwicklung in diesem Projekt verwendet.

### Environment-Variablen

| Variable | Beschreibung |
|---|---|
| `DATABASE_URL` | Postgres-Connection-String |
| `APP_PASSWORD` | Passwort für den Single-User-Login |
| `SESSION_SECRET` | Zufälliger Secret-String zum Signieren der Session-Cookies (`openssl rand -base64 32`) |

## Deployment auf Vercel

1. Repo mit Vercel verbinden (GitHub-Integration → automatische Preview-Deployments pro Branch).
2. Vercel Postgres (oder Neon) als Datenbank hinzufügen → `DATABASE_URL` wird automatisch gesetzt.
3. `APP_PASSWORD` und `SESSION_SECRET` als Environment-Variablen in den Projekteinstellungen ergänzen.
4. Vor dem ersten Deploy einmalig gegen die Produktions-DB laufen lassen:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   (lokal mit der Produktions-`DATABASE_URL`, oder via `vercel env pull`).
5. Push auf den verbundenen Branch löst den Build/Deploy aus.

## Architektur-Entscheidungen

Der Prompt hat mir bei einigen Punkten bewusst Spielraum gelassen ("bitte im Zweifel
selbst sinnvoll entscheiden"). Getroffene Entscheidungen:

- **Auth:** Single-User-Passwortschutz per signiertem Cookie (`src/proxy.ts`, ehemals
  "Middleware" — in Next.js 16 umbenannt). Kein Multi-Tenant-Unterbau, da explizit
  nicht gefordert und für ein persönliches Projekt unnötige Komplexität.
- **Fotos:** Nur externe Bild-URLs (`coverImageUrl`), kein Upload. Vercel Blob Storage
  lässt sich später einfach ergänzen, falls gewünscht.
- **CSV-Import:** Nicht implementiert — die App wird beim Setup bereits mit allen 250
  Ländern geseedet, ein Import wäre redundant. Besuche trägt man ohnehin laufend einzeln ein.
- **Datenmodell:** `Country.wishlist: Boolean` aus dem Vorschlag wurde zu
  `Country.planningStatus: NONE | WISHLIST | PLANNED` erweitert, damit die Karte wie
  gefordert 4 Status (besucht/geplant/Wunschliste/nicht besucht) statt nur 3 abbilden kann.
- **Weltflächen- statt Weltbevölkerungs-Abdeckung:** `world-countries` liefert keine
  Bevölkerungsdaten. Statt einer fragilen Zusatzquelle (Namens-Matching-Risiko) zeigt
  die App nur die Flächen-Abdeckung (`areaKm2`), die zuverlässig aus denselben Daten
  wie alles andere stammt.
- **Sprache:** UI sowie Länder-/Kontinentnamen sind auf Deutsch (aus den
  `world-countries`-Übersetzungen), passend zum Rest des Prompts.
- **Nice-to-haves:** Umgesetzt wurden Achievements/Badges (inkl. der drei im Prompt
  genannten Beispiele), die Jahres-Heatmap und Nachbarland-Vorschläge. "Personal Travel
  Score" und "On this day" wurden ausgelassen, um den Umfang nicht ausufern zu lassen.

## Datenbank

Prisma 7 nutzt für Postgres einen Driver-Adapter (`@prisma/adapter-pg`) statt einer
`url` in `schema.prisma` — die Connection-URL wird zur Laufzeit in
`src/lib/prisma.ts` bzw. für die CLI in `prisma.config.ts` aus `DATABASE_URL` gelesen.
Der generierte Client liegt (bewusst nicht committed, siehe `.gitignore`) unter
`src/generated/prisma` und wird bei jedem `npm install` neu erzeugt.

## Scripts

```bash
npm run dev      # Dev-Server (Turbopack)
npm run build    # Production-Build
npm run start    # Production-Server
npm run lint     # ESLint
npx prisma studio        # DB-GUI
npx prisma db seed       # Länder (neu) einspielen
npx prisma migrate dev   # neue Migration bei Schema-Änderungen (lokal)
npx prisma migrate deploy # Migrationen produktiv ausrollen
```
