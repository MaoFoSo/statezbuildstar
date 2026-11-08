# Changelog

## [0.2.0] – Meilenstein 2: Wirtschaft MVP

### Neu
- Oberschwaben ist von Start bis „alle Felder frei“ spielbar (ein effizienter Test-Bot braucht ca. 27 Minuten)
- Drei Lieferketten:
  - Holz → Bretter (Sägewerk) → Möbel (Schreinerei)
  - Kies → Beton (Betonwerk)
  - Milch → Butter (Molkerei)
- Rohstofffelder (Wald, Kiesgrube, Weide) bekommen beim Freischalten automatisch einen Betrieb auf Stufe 1
- Auf Bauplätzen baut man Verarbeitungsbetriebe. Jeder weitere Betrieb derselben Art kostet ×1,5
- Die Altstadt ist der **Marktplatz**: Marktgebühren als Grundeinkommen und ein Verkaufsbonus auf alle Waren (bis +75 %)
- **6 Ausbaustufen** für jedes Gebäude:
  - jede Stufe bringt mehr Tempo und mehr Einheiten pro Zyklus
  - Kosten `upBase × 1,9^(Stufe−1)`
  - die Optik ändert sich sichtbar: mehr Bäume und Kühe, Anbau, Schornstein mit Rauch, goldene Fahne auf Stufe 6
- Auf den Kacheln:
  - Fortschrittsring für den Produktionszyklus
  - Punkte für die Stufe
  - Hinweise „wartet auf Rohstoff“ (…) und „Lager voll“ (■)
- **Lager & Markt** (Bottom-Bar „Lager“):
  - Verkauf pro Ware an/aus
  - bei aktivem Verkauf wird nur der Überschuss verkauft: was die Betriebe für ihre nächste Charge brauchen, bleibt als Reserve im Lager
  - ausgeschaltet wird eingelagert, max. 100 pro Ware
- Transport-Karren fahren über die Quadrat-Wege von der Quelle zum Verarbeitungsbetrieb (Weg per Breitensuche, gecacht)
- Feld-Sheets:
  - Rohstoff- und Verarbeitungsbetriebe: Ein-/Ausgänge, Produktion/s, Wert/s, Vorschau auf die nächste Stufe, Status, Ausbau-Button mit „Es fehlen noch …“
  - Bauplätze: Auswahl der Betriebe mit Hinweis, wenn noch kein Lieferant existiert
- Die Kamera schiebt das angetippte Feld sanft über das Bottom-Sheet
- Einkommensanzeige ist jetzt das tatsächliche, geglättete Einkommen pro Sekunde
- **Offline-Ertrag**:
  - Abwesenheit wird beim Start und bei der Rückkehr in den Tab nachgerechnet, begrenzt auf 2 h (`CONFIG.offline.capHours`)
  - Dialog „Während du weg warst …“ mit Münzen und produzierten Waren
- **Export/Import** des Spielstands als Base64-Text in den Einstellungen, mit Prüfung und Fehlermeldung
- Dialog, wenn die Region komplett erkundet ist (Luftschiff folgt in Meilenstein 4)
- Alle neuen Werte zentral in `CONFIG`:
  - `goods`, `buildings`, `levels`, `buildGrowth`
  - `storage`, `market`, `offline`, `transport`

### Geändert
- Spielstand `saveVersion` 2, mit Migration von Version 1: Inventar und Markt werden ergänzt, Rohstofffelder bekommen ihre Betriebe
- Das Platzhalter-Einkommen aus Meilenstein 1 ist entfernt
- Der Debug-Button „+1.000 Münzen“ erscheint nur noch mit `#debug` in der URL
- „Spielstand zurücksetzen“ fragt jetzt im Spiel nach statt über `confirm()`, das in eingebetteten Ansichten gesperrt ist

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
