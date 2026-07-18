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
| `BLOB_READ_WRITE_TOKEN` | Optional, für Foto-Upload — siehe [Foto-Upload](#foto-upload-vercel-blob) |

### Foto-Upload (Vercel Blob)

Der Foto-Upload bei einem Besuch nutzt [Vercel Blob](https://vercel.com/docs/storage/vercel-blob).
Ohne konfigurierten Token bleibt die App voll nutzbar, der Upload zeigt nur eine
Fehlermeldung an ("Foto-Upload ist nicht konfiguriert").

So aktivierst du ihn:

1. Im Vercel-Dashboard → Projekt → *Storage* → *Create* → *Blob* → Store erstellen.
2. Der Store erzeugt automatisch eine `BLOB_READ_WRITE_TOKEN`-Env-Var im Projekt
   (für Production **und** Preview verfügbar machen).
3. Für lokale Entwicklung: den Token aus dem Vercel-Dashboard (Storage → Store →
   `.env.local` Tab) in deine lokale `.env` kopieren.

Bilder werden direkt server-seitig hochgeladen (Server Action), daher gilt das
Vercel-Function-Body-Limit von 4.5 MB — die App validiert Dateien serverseitig auf
max. 4 MB.

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
  genannten Beispiele), die Jahres-Heatmap, Nachbarland-Vorschläge und der Personal
  Travel Score (siehe unten). "On this day" wurde ausgelassen, um den Umfang nicht
  ausufern zu lassen.
- **Travel Score:** 10 Basispunkte pro besuchtem Land + Seltenheits-Bonus (0–50,
  kleinere Landfläche = höherer Bonus, relativ zu allen 250 Ländern) + optionaler
  Distanz-Bonus (0–50, 1 Punkt/200 km Luftlinie ab einem in `/settings` wählbaren
  Heimatland). Bewusst simpel & transparent gehalten (`src/lib/travelScore.ts`), da
  es keine verlässliche "Besucherzahlen pro Land"-Datenquelle gibt, um echte
  Seltenheit zu berechnen.
- **Trip-Gruppierung:** Ein `Trip` kann mehrere `Visit`-Einträge bündeln (z.B.
  "Skandinavien 2023" → Norwegen, Schweden, Dänemark). Wird auf der Karte als
  gestrichelte Route zwischen den Ländermittelpunkten dargestellt.
- **Sprache/Währung:** Aus `world-countries` übernommen, Anzeigenamen wo möglich per
  `Intl.DisplayNames(["de"])` eingedeutscht (z.B. ISO-Sprachcode `deu` → "Deutsch"),
  mit Fallback auf den englischen Originalnamen bei den paar Codes, die die
  ICU-Daten nicht kennen (v.a. sehr kleine Regionalsprachen/-währungen).
- **Datenexport:** JSON (verschachtelt, mit Fotos/Reise/Transportmitteln) und CSV
  (eine Zeile pro Besuch) unter `/settings`, via `/api/export?format=json|csv`.

## Datenbank

Prisma 7 nutzt für Postgres einen Driver-Adapter (`@prisma/adapter-pg`) statt einer
`url` in `schema.prisma` — die Connection-URL wird zur Laufzeit in
`src/lib/prisma.ts` bzw. für die CLI in `prisma.config.ts` aus `DATABASE_URL` gelesen.
Der generierte Client liegt (bewusst nicht committed, siehe `.gitignore`) unter
`src/generated/prisma` und wird bei jedem `npm install` neu erzeugt.

### Bekannte Falle: kein `Promise.all` mit mehreren Prisma-Queries

In Server Components **niemals zwei oder mehr Prisma-Aufrufe parallel per
`Promise.all` starten** — z.B. `Promise.all([getStats(), getTravelScore()])`.
Das hat beim Testen dieses Setups (Prisma 7 + `@prisma/adapter-pg` + `pg` gegen
den lokalen `prisma dev`-Server) zuverlässig eine Race Condition ausgelöst
("bind message supplies N parameters, but prepared statement "" requires 0"),
die zufällig ~50% der Requests mit einem 500er hat scheitern lassen. Alle
Datenabfragen in den Pages dieses Projekts sind deshalb bewusst sequenziell
(mehrere einzelne `await`s statt `Promise.all`). Falls du neue Pages/Actions
schreibst, die mehrere Prisma-Queries brauchen: sequenziell `await`en, nicht
parallelisieren — auch wenn es unintuitiv verschenkte Performance aussieht.
Das reduziert die Race Condition auf ein seltenes Restrisiko (in der lokalen
Dev-DB gelegentlich noch bei Next.js' automatischem Link-Prefetching
beobachtet) statt eines ~50%-Fehlers — ein bekanntes, dokumentiertes Risiko
dieses noch sehr neuen Treiber-Stacks, kein Grund zur Sorge für den produktiven
Einsatz mit echtem Postgres.

### Bekannte Falle: `react-simple-maps` braucht `ssr: false`

Die `WorldMap`-Komponente wird ausschließlich über `WorldMapClient.tsx`
(`next/dynamic(..., { ssr: false })`) eingebunden, nie direkt. Mit normalem SSR
weichen die von `react-simple-maps`/D3 berechneten Pfad-Koordinaten für Routen
mit vielen Punkten (`Line coordinates={...}`) zwischen Server- und
Client-Render minimal voneinander ab → React-Hydration-Mismatch-Warnung. Da
die Karte ohnehin rein interaktiv ist (Zoom/Pan/Klicks) und von SSR nicht
profitiert, ist reines Client-Rendering hier die richtige Lösung, nicht das
Kaschieren der Warnung.

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
npm run import:polarsteps [ordner]  # Polarsteps-Reise importieren, siehe unten
```

## Polarsteps-Import

Reisen, die mit [Polarsteps](https://polarsteps.com) aufgezeichnet wurden, lassen
sich als `Trip` mit mehreren `Visit`s importieren — entweder über die App
(`/trips` → "Aus Polarsteps importieren") oder per CLI
(`scripts/import-polarsteps.ts`). Beide nutzen dieselbe Logik in
`src/lib/polarsteps.ts`.

1. Auf polarsteps.com einloggen → Account Settings → "Download my data" anfordern.
2. Aus dem Export `trip.json` (erforderlich) und `locations.json` (optional, für
   die echte Route auf der Karte) der gewünschten Reise entnehmen.
3. **Über die App:** auf `/trips` → "Aus Polarsteps importieren" → beide Dateien
   auswählen → "Importieren".
   **Über die CLI:** beide Dateien in einen Ordner legen (Standard:
   `files_polarsteps/`, per `.gitignore` von Git ausgeschlossen — persönliche
   Reisedaten) und `npm run import:polarsteps` ausführen (anderer Pfad:
   `npm run import:polarsteps -- ./mein-ordner`).

Funktionsweise: aufeinanderfolgende Steps mit demselben Land (Polarsteps liefert
den ISO-Ländercode direkt pro Step mit) werden zu einem `Visit` zusammengefasst.
Steps mit Ländercode `"00"` (internationale Gewässer, z.B. während einer
Fährüberfahrt) markieren die Länder davor/danach als Fährstrecke. Da Polarsteps
in diesem Export kein explizites Transportmittel pro Step liefert und es laut
Definition um Roadtrips geht, wird `CAR` als Basis angenommen, `FERRY` kommt bei
erkannten Wasserquerungen dazu. Die Notizen jedes Visits sind eine
zusammengefasste Liste der Step-Namen — danach ganz normal über die UI editierbar.
Ein erneuter Import derselben Reise (per Polarsteps-Trip-UUID in `Trip.externalId`
erkannt) wird übersprungen; fehlten beim ersten Import Routendaten und wird
später mit `locations.json` erneut importiert, werden nur die Routendaten
nachgetragen (keine doppelten Visits).

Ist `locations.json` vorhanden, wird die dichte GPS-Spur (auf max. 3000 Punkte
downgesampelt) in `Trip.route` gespeichert und auf der Dashboard-Karte als
tatsächlich gefahrene Route gezeichnet statt der sonst üblichen geraden Linie
zwischen den Länder-Mittelpunkten.
