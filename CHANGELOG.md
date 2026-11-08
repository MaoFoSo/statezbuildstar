# Changelog

## [0.1.0] – Meilenstein 1: Raster & Steuerung

### Neu
- `PROMPT.md` (Spezifikation) und `PLAN.md` (technischer Plan) hinzugefügt
- `index.html`: Spiel in einer Datei, ohne Abhängigkeiten
  - 4.8.8-Parkettierung: Achtecke sind Baufelder, auf der Spitze stehende Quadrate sind Verbindungsfelder (Weg, Straße, Boje)
  - 2,5D-Darstellung: geneigte Karte, Plattentiefe, prozedurale Low-Poly-Deko (Wald, Kiesgrube, Weide, Bauplatz, Altstadt, See) und Alpenpanorama
  - Region Oberschwaben mit 46 Feldern als ASCII-Layout im zentralen `CONFIG`
  - Steuerung:
    - Ein-Finger-Pan mit Trägheit, Pinch-Zoom um den Fingermittelpunkt, Tap
    - am Desktop: Maus-Drag und Mausrad-Zoom
    - iOS-Doppeltipp- und Gesten-Zoom unterdrückt
  - Exakter Hit-Test per Punkt-im-Polygon auf Achteck und Quadrat
  - Nebel über gesperrten Feldern mit Kosten-Plakette:
    - Freischalten nur angrenzend an freie Felder
    - Kosten: `base × growth^n`
    - Animation, bei der der Nebel wegzieht
  - UI:
    - Topbar mit Münzen, Seeperlen und Einkommen/s
    - Bottom-Bar
    - Bottom-Sheet für Felder
    - Einstellungen: Ton, Dialekt-Schalter (vorbereitet), Reset mit Bestätigung
  - Feedback: Münz-Popups, prozeduraler WebAudio-„Pling“, Vibration
  - Feste Simulation mit 10 Hz, entkoppelt vom Rendering
  - Speichern in `localStorage`:
    - mit `saveVersion` und Migrationsgerüst
    - Autosave alle 10 s und bei `visibilitychange`/`pagehide`
  - Deutsches Zahlenformat (`1.250`, `12,4 Tsd.`, `3,1 Mio.` …)

### Vorläufig (wird in Meilenstein 2 ersetzt)
- Platzhalter-Einkommen: 1 Münze/s pro freiem Feld
- Debug-Button „+1.000 Münzen“ in den Einstellungen
