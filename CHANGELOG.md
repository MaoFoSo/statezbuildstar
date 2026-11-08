# Changelog

## [0.5.0] – Meilenstein 5: Regionen 3–6

### Neu
- **Region 3: Allgäu & Lindau** (45 Felder + Luftschiffplatz, Inselhafen im Süden):
  - **Energie als neue Ressourcenart**: Wasserkraftwerke an Gebirgsbächen liefern Strom
    - Strom lässt sich nicht einlagern: kein Verkaufsschalter, was Betriebe, Ballon und Luftschiff nicht brauchen, geht sofort ins Netz
    - Strom fließt als leuchtender Funke über die Wege statt per Karren
  - Rohstoffe: Milch (Alpweide), Holz (Bergwald), Strom (Gebirgsbach)
  - Ketten: Milch + Strom → Bergkäse (Käserei) · Holz → Schindeln (Schindelmacher) → Holzbau (Zimmerei, braucht Strom) · Strom
  - Fährstationen am Inselhafen, eigene Ballon-Ladungen, 16 Ziele, Marktplatz-Faktor ×8
  - Luftschiff: 12 Holzbau, 30 Bergkäse, 40 Strom
  - neue prozedurale Grafik: Alpweiden mit Kühen und Glocken, Alphütte, Bach mit Wasserrad, Kraftwerk, Strommast, Staumauer; Leuchtturm und Löwe am Hafen
- Betriebe können **mehrere Eingangswaren** haben; Bauplatz-Auswahl, Status und Hinweise zeigen alle Eingänge
- Jede Region kann ein eigenes **Bergpanorama** (`mountains`) und ein **Wahrzeichen** der Hauptstadt (`landmark`) haben

### Geändert
- Balancing: Test-Bot braucht für das Allgäu ca. 43 min (Oberschwaben ca. 23, Nordufer ca. 34)

## [0.4.0] – Meilenstein 4: Luftschiff & Regionswechsel

### Neu
- **Luftschiffhalle**: Sind alle Felder einer Region frei, zieht der Nebel vom Luftschiffplatz und die Halle erscheint (Dialog mit der benötigten Ladung)
  - Das Luftschiff wird wie der Ballon aus dem Lager beladen (Umleiten an/aus); es steigt über der Halle auf, je voller es ist
  - Oberschwaben: 15 Möbel, 25 Beton, 30 Butter
- **Prestige / Regionswechsel**: Abflug mit Bestätigung, Flug-Animation über den See, Überblendung in die neue Region
  - Seeperlen, globale Upgrades, Einstellungen und Lebenszeit-Werte bleiben, plus Seeperlen-Belohnung (15)
  - Münzen, Felder, Gebäude, Waren, Ziele und Ballon beginnen von vorn; Startkapital-Upgrade wirkt jetzt
  - Willkommensdialog der neuen Region
- **Region 2: Nordufer & Hinterland** (47 Felder + Luftschiffplatz, See im Süden):
  - Rohstoffe: Hopfen (Hopfengarten), Trauben (Weinberg), Äpfel (Obstgarten), Felchen (Fischgrund auf dem See)
  - Ketten: Äpfel → Most (Mosterei) → Apfelbrand (Brennerei) · Hopfen → Bier (Brauerei) · Trauben → Wein (Weinkellerei) · Felchen → Räucherfisch (Räucherei)
  - **Fährstationen** auf offenem See (max. 3, 6 Stufen): neue Märkte, +6 % bis +25 % auf alle Verkaufspreise je Fähre
  - **Boote**: Transporte fahren über Fischgrund, offenen See und Bojen als Segelboote statt als Karren
  - eigene Ballon-Ladungen, 15 Ziele, eigener Marktplatz-Faktor (Kosten und Gebühren ×3)
  - neue prozedurale Grafik: Hopfenstangen, Rebzeilen, Apfelbäume, Fischerboote mit Netz und springenden Felchen, Fähre mit Steg, Halle mit Tonnendach, Luftschiff
- Ziel-Banner zeigt nach allen Zielen den Ladestand des Luftschiffs; antippen öffnet die Halle
- Debug (`#debug`): „Region abschließen“ (alle Felder frei, Luftschiff beladen)

### Geändert
- Spielstand `saveVersion` 4, mit Migration von Version 3; bereits erkundete Regionen bekommen die Halle beim Laden
- Oberschwaben hat einen Luftschiffplatz (zählt nicht zu den freischaltbaren Feldern)
- Gebäude können eine Höchstzahl pro Region haben (`max`, z. B. Ballonstation 1, Fähre 3)
- Offline-Ertrag: bei langer Abwesenheit gröbere Rechenschritte (höchstens 20.000), damit 8 h Nachtschicht auf dem Handy schnell bleiben
- Animationen mit Startzeit in der Zukunft verursachen keine Canvas-Fehler mehr
- Balancing: Test-Bot braucht für Oberschwaben ca. 22 min, für das Nordufer ca. 36 min

## [0.3.0] – Meilenstein 3: Meta

### Neu
- **Seeperlen** als Zweitwährung: aus Ballonstarts und Zielen, nur im Spiel verdienbar
- **Globale Upgrades** (Bottom-Bar „Upgrades“, bezahlt mit Seeperlen):
  - pro Ware „Tempo“ (+25 % je Stufe für alle Betriebe dieser Ware) und „Preis“ (+20 % Verkaufspreis je Stufe), je 5 Stufen
  - „Nachtschicht“: +1 h Offline-Ertrag je Stufe (bis 8 h)
  - „Großes Lager“: +50 Lagerplatz pro Ware je Stufe
  - „Startkapital“: mehr Münzen beim Start jeder Region (wirkt ab dem Regionswechsel in Meilenstein 4)
  - Upgrades bleiben über alle Regionen erhalten
- **Ballonstation** (Bauplatz, eine pro Region, 6 Stufen):
  - leitet Waren aus dem Lager in einen Heißluftballon um; die offene Ladung zählt zur Reserve und wird nicht verkauft
  - Umleiten lässt sich an- und ausschalten
  - jeder Start bringt Münzen, Seeperlen und deckt Nebelfelder kostenlos auf; die Ladung wechselt und wächst mit jedem Start
  - Ballon auf dem Startplatz bläht sich mit der Ladung auf; Flug-Animation über die aufgedeckten Felder
  - Bottom-Bar „Ballons“ öffnet die Station bzw. erklärt, wie man sie baut
- **Ziele & Tutorial**: 18 Ziele für Oberschwaben mit Tipps und Belohnungen (Münzen, Seeperlen)
  - Ziel-Banner über der Bottom-Bar zeigt das nächste Ziel mit Fortschritt; antippen holt die Belohnung ab
  - Liste unter „Ziele“ mit Fortschrittsbalken und „Abholen“
- **Lieferketten-Übersicht** (Lager → Reiter „Lieferketten“): Produktion und Bedarf pro Ware und Sekunde, Engpässe rot markiert
- Rote Hinweis-Punkte in der Bottom-Bar: Belohnung abholbar, Ballon startklar, Upgrade bezahlbar
- Debug (`#debug`): zusätzlich „+10 Seeperlen“
- Neue Werte zentral in `CONFIG.meta`, `CONFIG.balloon` und pro Region (`startCoins`, `unlock`, `buildings`, `chains`, `balloon`, `goals`)

### Geändert
- Spielstand `saveVersion` 3, mit Migration von Version 2
- Startmünzen und Freischaltkosten stehen jetzt pro Region in `CONFIG.regions`
- Bauplatz-Auswahl zeigt nur Betriebe, die in der Region verfügbar sind
- Lager zeigt nur die Waren der aktuellen Region
- Bottom-Sheet scrollt, wenn es höher als der Bildschirm ist
- Balancing: Ein effizienter Test-Bot braucht für Oberschwaben jetzt ca. 22 Minuten (ohne Upgrades und Ballons ca. 28)

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
