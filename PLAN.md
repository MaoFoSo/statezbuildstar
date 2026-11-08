# PLAN – Bodensee Builder

Kurzer technischer Plan zur Spezifikation in [`PROMPT.md`](PROMPT.md).

## Architektur

- **`index.html`**: HTML, CSS und JS inline, keine Abhängigkeiten. Später kommen `manifest.json`, `sw.js` und Icons dazu (PWA, Meilenstein 5).
- Das JS ist in feste Abschnitte gegliedert:
  1. **CONFIG**: alle Spielwerte (Kosten, Zeiten, Multiplikatoren, Farben, Kartenlayouts)
  2. **Utils**: Zahlenformat (deutsch), Mathe, Geometrie
  3. **State**: der aktuelle, serialisierbare Spielstand plus die daraus abgeleitete Laufzeit-Welt
  4. **Simulation**: fester Tick mit 10 Hz
  5. **Rendering**: Canvas 2D, `requestAnimationFrame`
  6. **Input**: Pointer Events (Pan, Pinch, Tap), Mausrad
  7. **UI**: HTML-Overlays (Topbar, Bottom-Bar, Bottom-Sheet, Dialoge, Toasts)
  8. **Save/Load**: `localStorage`, Versionierung, Migrationen, Export/Import

## Raster (4.8.8, abgestumpfte Quadrat-Parkettierung)

Geometrie mit Kantenlänge `s`:

- Achteck-Breite (Kante zu Kante) `W = s·(1+√2)`
- Achteck `(col,row)` hat den Mittelpunkt `(col·W, row·W)`. Seine Ecken liegen bei `(±W/2, ±s/2)` und `(±s/2, ±W/2)`.
- Quadrat `(col+0.5,row+0.5)` hat den Mittelpunkt `((col+0.5)·W, (row+0.5)·W)`. Es steht auf der Spitze, die halbe Diagonale ist `s/√2`.
- So passen Achtecke und Quadrate lückenlos zusammen: Die schräge Achteckkante ist zugleich die Quadratkante.

```js
// Achteckfeld (Bau-/Produktionsfeld)
Oct = {
  id, col, row,          // Gitterkoordinate
  type,                  // 'forest' | 'gravel' | 'pasture' | 'plot' | 'town' | 'water' …
  unlocked: bool,        // Nebel ja/nein   (persistiert)
  building: null | { kind, level, progress, … }   // ab Meilenstein 2 (persistiert)
  // Laufzeit (nicht persistiert):
  nOct: [N,E,S,W],       // Nachbar-Achtecke (oder null)
  nSq:  [NE,SE,SW,NW],   // Nachbar-Quadrate (oder null)
  poly: [[x,y]…8],       // Welt-Polygon für Hit-Test und Rendering
}
// Quadratfeld (Verbindung: Weg, Straße, Gleis, Steg, Boje)
Sq = {
  key: "c,r",            // liegt bei (c+0.5, r+0.5)
  nOct: [NW,NE,SE,SW],   // die vier umliegenden Achtecke (oder null)
  kind,                  // abgeleitet: 'fog' | 'path' | 'road' | 'pier' | 'buoy' | später 'bonus'
}
```

- Lookup über `Map` mit dem Schlüssel `"col,row"`. Bei 30–60 Feldern ist das schnell genug.
- Die Kartenlayouts stehen als ASCII-Raster in CONFIG (ein Zeichen pro Achteck, `.` = kein Feld).
- Quadrate gibt es nur dort, wo mindestens 2 der 4 umliegenden Achtecke existieren.
- **Hit-Test**: Bildschirm → Welt umrechnen (Kamera und Neigung invertieren). Dann das nächste Achteck per `round(x/W)` bestimmen und Punkt-im-Polygon prüfen. Sonst das Quadrat bei `floor(x/W)` per Punkt-im-Polygon prüfen.
- **2,5D**: Die Welt-y-Achse wird mit `TILT` (≈0,72) gestaucht. Jedes Achteck bekommt eine Extrusion entlang seiner unteren Kanten (Tiefe in Pixeln). Gezeichnet wird so:
  1. zuerst alle Quadrate auf Bodenhöhe,
  2. dann die Achtecke zeilenweise von oben nach unten (Painter's Algorithm).

## Kamera & Input

- `camera = { x, y, zoom }`. Der Mittelpunkt liegt im projizierten Weltraum. Die Kamera wird auf die Kartengrenzen und den Zoombereich begrenzt.
- **Pointer Events** mit einer Map aktiver Pointer:
  - 1 Pointer: Bewegung über 8 px wird zum Pan (mit Trägheit), sonst gilt `pointerup` als Tap.
  - 2 Pointer: Pinch-Zoom um den Mittelpunkt, gleichzeitig Pan.
  - Mausrad: Zoom um die Cursorposition.
- iOS: `touch-action: none` auf dem Canvas, `user-scalable=no` im Viewport-Meta, und `gesturestart`/`dblclick` werden per `preventDefault` unterdrückt.

## Simulationsschleife

- `requestAnimationFrame` treibt das Rendering an. Die Simulation läuft über einen Akkumulator mit festem Schritt `dt = 1/10 s`. Pro Frame laufen höchstens N Ticks, danach wird abgeschnitten (Spiral-of-Death-Schutz).
- `simTick(dt)` erledigt:
  - Produktionsfortschritt
  - Lagerbewegungen und Verkäufe
  - Event-Timer
  - Transportpunkte
- Rendering liest nur den State und interpoliert Animationen über `performance.now()`.
- **Offline-Ertrag** (Meilenstein 2): Beim Laden wird `Δt = now − lastSeen` auf `offlineCap` begrenzt. Bei großen Δt wird nicht Tick für Tick simuliert, sondern über die analytische Rate gerechnet (Einnahmen pro Sekunde im eingeschwungenen Zustand × Δt). Danach erscheint der Dialog.
- Bei verstecktem Tab pausiert das Rendering. Die Zeit wird über `lastSeen` nachgeholt.

## Speicherformat

`localStorage['bodenseeBuilder.save']` enthält:

```json
{
  "saveVersion": 1,
  "lastSeen": 1731050000000,
  "regionIndex": 0,
  "coins": 0, "pearls": 0,
  "fields": { "3,4": { "u": 1, "b": null } },
  "settings": { "sound": true, "dialect": false },
  "camera": { "x": 0, "y": 0, "zoom": 1 },
  "stats": { "unlocks": 0 }
}
```

Ab M2/M3 kommen dazu:

- `globalUpgrades`
- `market: {sellToggle}`
- `inventory`
- `goals`
- `balloons`

Regeln:

- **Migrationen**: `MIGRATIONS[v] = save => save'` werden der Reihe nach angewandt, bis `CONFIG.saveVersion` erreicht ist.
- **Export/Import**: `btoa(unescape(encodeURIComponent(JSON)))` als Base64-Text.
- **Autosave** alle 10 s, bei `visibilitychange → hidden` und bei `pagehide`.

## Meilensteine

| # | Inhalt | Status |
|---|--------|--------|
| 1 | Raster & Steuerung: 4.8.8-Rendering, Pan/Pinch/Tap, exakter Hit-Test, Felder freischalten mit Nebel und Animation, Grund-UI (Topbar, Bottom-Bar, Bottom-Sheet), einfaches Speichern der freigeschalteten Felder | ✅ in Arbeit |
| 2 | Wirtschaft MVP: Oberschwaben mit 3 Ketten (Holz → Bretter → Möbel, Kies → Beton, Milch → Butter), 6 Ausbaustufen, Lager/Verkauf mit Schalter, Transportpunkte auf Wegen, Speichern/Laden/Export/Import, Offline-Ertrag mit Dialog | – |
| 3 | Meta: globale Upgrades, Seeperlen, Ballonstation, Ziele/Tutorial, Lieferketten-Übersicht | – |
| 4 | Luftschiff & Regionswechsel (Prestige), Region 2 Nordufer mit Wasser, Fähre, Booten | – |
| 5+ | Regionen 3–6, Events (Föhn, Herbstnebel, Feste), Quadrat-Bonusfelder, Pfahlbauten, Dialekt, PWA (Manifest, Service Worker, Icons) | – |

### Hinweise zu Meilenstein 1

- Damit man das Freischalten testen kann, gibt es ein **vorläufiges Einkommen**: `CONFIG.m1.incomePerField` Münzen pro Sekunde je freiem Feld. Dazu kommt in den Einstellungen ein Debug-Button „+1.000 Münzen“. Beides wird in Meilenstein 2 durch die echte Wirtschaft ersetzt.
- Freischaltbar sind nur Felder, die über eine gerade Kante (N/O/S/W) an ein freies Feld grenzen.
- Kosten: `CONFIG.unlock.base × CONFIG.unlock.growth^(freigeschaltet − Startfelder)`.
