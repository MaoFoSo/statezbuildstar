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
- **Offline-Ertrag** (Meilenstein 2): Beim Laden und bei der Rückkehr in den Tab wird `Δt = now − lastSeen` auf `offline.capHours` begrenzt. Danach erscheint der Dialog.
  - Abweichung vom ursprünglichen Plan: Statt einer analytischen Rate läuft dieselbe `simTick`-Funktion im stillen Modus mit groben Schritten (`offline.stepSeconds` = 0,5 s).
  - Das bildet Lieferketten, Reserven und volle Lager exakt ab.
  - Kosten bei 2 h: 14.400 Schritte × ca. 46 Felder, also wenige Millisekunden.
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

Seit M2 (`saveVersion` 2):

- `fields[k].b = { k: Gebäudeart, l: Stufe 1–6, p: Fortschritt 0–1, a: laufende Chargengröße (Verarbeitung) }`
- `inventory: { ware: menge }`
- `market: { sell: { ware: bool } }`
- `stats: { unlocks, earned, produced: { ware: menge }, regionDone }`

Seit M3 (`saveVersion` 3):

- `globalUpgrades: { "speed:wood": 2, "price:planks": 1, "offline": 1, "storage": 0, "startCoins": 0 }` (bleibt beim Regionswechsel)
- `goals: { claimed: ["oberschwaben:0", …] }` (pro Region)
- `balloon: { fill: { ware: menge }, launches, load, t }` (pro Region)
- `lifetime: { earned, pearls, launches, regions }` (bleibt)

Seit M4 (`saveVersion` 4):

- `airship: { fill, load, t }` (pro Region)
- beim Regionswechsel: `newState(neueRegion, alterState)` übernimmt `pearls`, `globalUpgrades`, `settings`, `lifetime`

Seit M5 (`saveVersion` 5):

- `tour`: Anzahl abgeschlossener Dreiländer-Rundfahrten (bleibt beim Regionswechsel)

Regeln:

- **Migrationen**: `MIGRATIONS[v] = save => save'` werden der Reihe nach angewandt, bis `CONFIG.saveVersion` erreicht ist.
- **Export/Import**: `btoa(unescape(encodeURIComponent(JSON)))` als Base64-Text.
- **Autosave** alle 10 s, bei `visibilitychange → hidden` und bei `pagehide`.

## Meilensteine

| # | Inhalt | Status |
|---|--------|--------|
| 1 | Raster & Steuerung: 4.8.8-Rendering, Pan/Pinch/Tap, exakter Hit-Test, Felder freischalten mit Nebel und Animation, Grund-UI (Topbar, Bottom-Bar, Bottom-Sheet), einfaches Speichern der freigeschalteten Felder | ✅ fertig |
| 2 | Wirtschaft MVP: Oberschwaben mit 3 Ketten (Holz → Bretter → Möbel, Kies → Beton, Milch → Butter), 6 Ausbaustufen, Lager/Verkauf mit Schalter, Transportpunkte auf Wegen, Speichern/Laden/Export/Import, Offline-Ertrag mit Dialog | ✅ fertig |
| 3 | Meta: globale Upgrades, Seeperlen, Ballonstation, Ziele/Tutorial, Lieferketten-Übersicht | ✅ fertig |
| 4 | Luftschiff & Regionswechsel (Prestige), Region 2 Nordufer mit Wasser, Fähre, Booten | ✅ fertig |
| 5a | Regionen 3–6 (Allgäu & Lindau mit Energie, Vorarlberg, Thurgau & St. Gallen, Konstanz/Reichenau/Hegau), Finale Dreiländer-Rundfahrt | ✅ fertig |
| 5b | **als Nächstes:** Events (Föhn, Herbstnebel, Feste), Quadrat-Bonusfelder, Pfahlbauten, Dialekt-Texte, PWA (Manifest, Service Worker, Icons) | – |

### Hinweise zu Meilenstein 1

- Damit man das Freischalten testen kann, gibt es ein **vorläufiges Einkommen**: `CONFIG.m1.incomePerField` Münzen pro Sekunde je freiem Feld. Dazu kommt in den Einstellungen ein Debug-Button „+1.000 Münzen“. Beides wird in Meilenstein 2 durch die echte Wirtschaft ersetzt.
- Freischaltbar sind nur Felder, die über eine gerade Kante (N/O/S/W) an ein freies Feld grenzen.
- Kosten: `CONFIG.unlock.base × CONFIG.unlock.growth^(freigeschaltet − Startfelder)`.

### Wirtschaftsmodell (Meilenstein 2)

- **Rohstoffbetriebe** (Holzfäller, Kieswerk, Milchhof) entstehen beim Freischalten automatisch. Pro Zyklus liefern sie `levels.yield[L]` Einheiten, die Zykluszeit ist `cycle / levels.speed[L]`.
- **Verarbeitungsbetriebe** stehen auf Bauplätzen. Sie starten eine Charge mit bis zu `levels.yield[L]` Einheiten, sobald genug Eingangsware im Lager liegt.
- **Marktplatz** (Altstadt): Gebühren-Einkommen `market.tax[L]` und Verkaufsbonus `market.bonus[L]` auf alle Preise.
- **Lager:** ein globaler Bestand pro Ware.
  - Verkauf an: Alles über der **Reserve** wird sofort verkauft. Die Reserve ist die Summe der maximalen Chargen aller Abnehmer.
  - Verkauf aus: Es wird bis `storage.cap` eingelagert. Ist das Lager voll, hält der Erzeuger an.
- **Tick-Reihenfolge:**
  1. Verarbeiter starten bzw. schließen Chargen ab.
  2. Rohstoffbetriebe liefern.
  3. Überschüsse werden verkauft.
- **Balancing:** Ein gieriger Bot, der per Playwright direkt `simTick` antreibt, braucht für Oberschwaben ca. 27 Minuten. Das erste Upgrade ist direkt nach der ersten Freischaltung möglich.

### Meta (Meilenstein 3)

- **Globale Upgrades** (`CONFIG.meta`): Schlüssel `speed:<ware>`, `price:<ware>` und Spezial-Upgrades. Kosten in Seeperlen: `base × growth^Stufe`.
  - Tempo wirkt in `cycleTime()`, Preis in `sellPrice()`, Lager in `storageCap()`, Nachtschicht in `offlineCapHours()`, Startkapital in `newState()`.
- **Ladungen** (Ballon, ab M4 auch Luftschiff): `{ fill, load, t }`. `loadCargo()` zieht pro Tick mit `rate` Einheiten/s je Ware aus dem Lager.
  - Die offene Ladung zählt zur Reserve (`updateReserve()` zu Beginn jedes Ticks), damit sie nicht verkauft wird.
- **Ballon**: Ladung = `region.balloon[launches % n] × needGrowth^launches` (gedeckelt auf den Lagerplatz). Belohnung hängt von Warenwert und Stationsstufe ab. Aufgedeckte Felder kosten nichts, zählen aber zu den freigeschalteten Feldern.
- **Ziele**: datengetrieben in `region.goals` mit Typ `unlock|all|level|build|produce|earn|launch|gup`. `goalProgress()` liefert `[ist, soll]`. Das erste offene Ziel steht im Banner (Tutorial).
- **Balancing**: Test-Bot (kauft jeweils das Günstigste, startet Ballons, holt Ziele ab, kauft das billigste globale Upgrade) braucht ca. 22 min für Oberschwaben, ohne Meta ca. 28 min. Menschen spielen deutlich langsamer, so bleibt das Ziel von 30–45 min realistisch.

### Luftschiff & Regionen (Meilenstein 4)

- **Luftschiffplatz** `L` im Kartenlayout: Feldtyp `hangar`, nicht freischaltbar und nicht in den Feldzählungen (`unlockedCount`, `fieldCount`). `checkRegionComplete()` deckt ihn auf, sobald alle anderen Felder frei sind, und stellt das Gebäude `hangar` hin.
- **Luftschiff-Ladung**: `region.airship.need` über dieselbe Ladungslogik wie der Ballon (`loadCargo`, Reserve). Geladen wird nur, wenn es eine nächste Region gibt (`airshipLoading()`).
- **Abflug** (`tryLaunchAirship`): Animation `fx.flight`; danach `startRegion()`, abgeschlossen per rAF oder Timer (falls der Tab im Hintergrund ist). Seeperlen werden erst bei der Ankunft gutgeschrieben, damit ein Reload während des Flugs nichts doppelt.
- **Regionen-Config**: `map`, `startCoins`, `unlock`, `market` (Kosten-/Gebührenfaktor), `buildings` (baubar), `chains` (Lager, Upgrades, Lieferketten), `balloon`, `goals`, `airship`, `intro`.
- **Wasser**: Feldtypen mit `water: true` (See, Fischgrund). Quadrate mit ≥ 2 Wasser-Nachbarn sind Bojen. Pfadpunkte tragen ein Wasser-Flag, Segmente zwischen zwei Wasserpunkten werden als Boot gezeichnet.
- **Fähre**: Gebäude auf `water`, `max: 3`. `world.ferryMult = 1 + Σ bonus[Stufe]` wirkt in `sellPrice()`.
- **Balancing Nordufer**: Freischalten `50 × 1,22^n`, Startkapital 150, Marktplatz ×3. Test-Bot: ca. 36 min (Oberschwaben ca. 22 min), also wie gewünscht länger.

### Regionen 3–6 (Meilenstein 5a)

- **Energie**: Waren mit `energy: true` (Strom). `sellOn(g)` ist für sie immer wahr: Sie werden nie eingelagert, alles über der Reserve geht ins Netz, und ein volles Lager hält den Erzeuger nie an. Reserve (Verarbeiter, Ballon, Luftschiff) funktioniert wie bei jeder Ware. Transporte werden als Funke gezeichnet.
- **Mehrere Eingänge**: `in` kann mehrere Waren enthalten (z. B. Käserei `{ milk: 3, power: 1 }`). `tryStart` nimmt die kleinste mögliche Charge, Reserve und Wege gelten je Ware.
- **Gebirgsbach** (`river`) ist Land (kein `water`), damit Transporte dort Karren bleiben.
- **Regionen-Config** zusätzlich: `landmark` (Wahrzeichen der Hauptstadt: `lighthouse`, `stage`, `harbor`, `minster`) und `mountains` (`hts` an festen Stützstellen, `color`).
- **Finale**: `airship.finale` in der letzten Region. `nextRegionIndex()` liefert dann 0; beim Abflug zählt `state.tour` hoch. `tourMult()` = 1 + `CONFIG.tour.priceBonus` × `tour` wirkt in `sellPrice()`.
- **Balancing** (Test-Bot, spielt alle Regionen nacheinander und nimmt Seeperlen und Upgrades mit): Allgäu ca. 43 min, Vorarlberg ca. 54, Thurgau & St. Gallen ca. 62, Konstanz ca. 71. Stellschrauben je Region: `startCoins`, `unlock.base`, `market.cost/tax`, Gebäudekosten und Warenpreise.

### Nächste Schritte (Meilenstein 5b)

- Events: Föhn (doppelte Ballonboni), Herbstnebel, Feste
- Quadrat-Bonusfelder, Pfahlbauten, Dialekt-Texte
- PWA: `manifest.json`, `sw.js`, Icons
