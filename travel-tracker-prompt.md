# Projekt-Prompt: Travel Tracker

## Kontext
Baue eine Web-App, mit der ich alle Länder tracken kann, die ich bereits bereist habe. Die App soll auf Vercel gehostet werden.

## Tech Stack
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Datenbank:** Vercel Postgres + Prisma ORM (persönliches Projekt, aber Daten sollen geräteübergreifend verfügbar sein, kein LocalStorage)
- **Karte:** react-simple-maps (D3-basiert, SVG-Weltkarte mit GeoJSON, gut individualisierbar) oder alternativ eine Leaflet-Lösung mit Choropleth-Layer
- **Deployment:** Vercel (GitHub-Integration, automatische Preview-Deployments pro Branch)
- **Auth:** Einfacher Passwortschutz via Middleware reicht (Single-User-App, kein Multi-Tenant nötig)

## Kernfunktionen

### 1. Interaktive Weltkarte
- Länder einfärben nach Status: `besucht` / `geplant` / `Wunschliste` / `nicht besucht`
- Klick auf Land öffnet Detail-Panel (Sidebar oder Modal)
- Hover zeigt Tooltip mit Ländername + kurzer Info (z.B. Anzahl Besuche)
- Zoom/Pan auf der Karte

### 2. Länderverwaltung
- Liste aller Länder (durchsuchbar, filterbar nach Kontinent/Status)
- Pro Land: mehrere Besuche möglich (z.B. Spanien 2022 und 2026)
- Pro Besuch: Zeitraum (von/bis), Notizen, persönliche Bewertung (1-5 Sterne), optional Foto-Links/Cover-Bild

### 3. Statistik-Dashboard
- Anzahl besuchter Länder + % der Weltbevölkerung/Weltfläche abgedeckt
- Abdeckung pro Kontinent (Balken- oder Ringdiagramm)
- Zeitstrahl aller Reisen chronologisch
- Grob geschätzte Gesamt-Reisekilometer (Luftlinie zwischen Ländermittelpunkten, optional)

### 4. Extra-Ideen (nice-to-have, gerne auswählen was Sinn macht)
- **Achievements/Badges:** z.B. "Alle nordischen Länder", "3 Kontinente in einem Jahr", "Erstes Land außerhalb Europas"
- **Jahres-Heatmap:** wie viele neue Länder pro Jahr entdeckt (GitHub-Contribution-Graph-Style)
- **Personal Travel Score:** Gewichtung nach Fläche/Entfernung/Seltenheit des Ziels
- **"On this day"-Rückblick:** Startseite zeigt "vor X Jahren warst du in..."
- **Nachbarland-Vorschläge:** zeigt an Land angrenzende, noch nicht besuchte Länder als Inspiration

## Datenmodell (Vorschlag)

```
Country
- id, name, isoCode, continent, region

Visit
- id, countryId (FK), startDate, endDate?, notes?, rating?, coverImageUrl?

Status wird aus Visit-Einträgen abgeleitet:
kein Visit-Eintrag = "nicht besucht"
Visit vorhanden = "besucht"
zusätzliches Feld z.B. "wishlist" (boolean auf Country-Ebene) für Wunschliste/geplant
```

## Seitenstruktur
- `/` – Dashboard: Karte + Kern-Statistiken
- `/countries` – Länderliste mit Filter/Suche
- `/countries/[id]` – Detailansicht mit allen Besuchen zu diesem Land
- `/stats` – ausführliche Statistikseite

## Nicht-funktionale Anforderungen
- Mobile responsive (auch unterwegs nutzbar, z.B. auf Reisen direkt Einträge ergänzen)
- Dark Mode
- Schnelle Ladezeiten, Karte darf nicht zu schwer werden (SVG statt Rasterbilder)

## Offene Fragen an mich als Entwickler (bitte im Zweifel selbst sinnvoll entscheiden und kurz begründen)
- Reicht ein einzelner Nutzer/Passwortschutz oder soll später Multi-User möglich sein?
- Sollen Fotos direkt hochgeladen werden können (z.B. via Vercel Blob Storage) oder reichen externe Links?
- Soll es eine Import-Möglichkeit geben (z.B. Liste von Ländern per CSV einmalig einpflegen)?