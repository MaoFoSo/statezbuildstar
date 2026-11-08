# Prompt für Claude Code: „Bodensee Builder“ – Idle-Aufbauspiel mit Achteck-Feldern

> Arbeitstitel: **Bodensee Builder** (alternativ: „SeeReich“, „Dreiländer Tycoon“). Kannst du gern ändern.

---

## Rolle & Ziel

Du bist ein erfahrener Spieleentwickler für Browser- und Mobile-Spiele. Baue ein **Idle-/Tycoon-Aufbauspiel mit Lieferketten**. Die Spielmechanik ist an Genre-Titel wie „States Builder“ angelehnt. Das Spiel spielt aber in einer **eigenen Welt rund um den Bodensee** (Deutschland, Österreich, Schweiz) und hat ein **eigenes Achteck-Raster**.

Wichtig: Übernimm **keine** Namen, Grafiken, Texte oder Assets von States Builder oder anderen Spielen. Alle Grafiken werden selbst erzeugt (SVG/Canvas, prozedural). Keine echten Markennamen oder Logos (z. B. kein „Ravensburger“, kein „ZF“, kein „Zeppelin NT“). Allgemeine Begriffe wie „Luftschiff“, „Fähre“ oder „Hopfen“ sind okay.

---

## Technischer Rahmen

- **Eine einzige `index.html`** mit HTML, CSS und JavaScript inline. Keine Build-Tools, keine externen Abhängigkeiten zur Laufzeit (kein CDN).
- **Mobile first, Hochformat.** Muss auf dem iPhone in Safari flüssig laufen (60 fps angestrebt). Läuft auch am Desktop.
- **PWA-fähig**: `manifest.json`, Service Worker für Offline-Betrieb, App-Icon (selbst erzeugtes SVG/PNG). Dafür dürfen zusätzlich zur `index.html` `manifest.json`, `sw.js` und Icons im Repo liegen.
- Rendering: **Canvas 2D** für die Karte (viele Felder, Pan/Zoom), HTML/CSS für UI-Overlays (Panels, Buttons, Dialoge).
- Steuerung: Ein-Finger-Pan, Pinch-Zoom, Tippen zum Auswählen. Am Desktop: Maus-Drag, Mausrad-Zoom.
- **Speichern** in `localStorage` (automatisch alle 10 s und bei `visibilitychange`). Dazu **Export/Import** des Spielstands als Base64-Text in den Einstellungen. Spielstand mit `saveVersion` versionieren und Migrationen vorsehen.
- **Offline-Ertrag**: Beim Zurückkehren wird die Abwesenheitszeit berechnet. Der Ertrag ist anfangs auf 2 h begrenzt, per Upgrade erweiterbar. Dazu ein Dialog „Während du weg warst …“.
- Zahlenformat deutsch: `1.250`, `12,4 Tsd.`, `3,1 Mio.`, `7,8 Mrd.` …
- Sprache der Oberfläche: **Deutsch**.
- Code sauber gegliedert (Abschnitte: Config/Daten, State, Simulation, Rendering, Input, UI, Save/Load). Alle Spielwerte (Kosten, Zeiten, Multiplikatoren) stehen **zentral in einem Config-Objekt**, damit sie leicht angepasst werden können.
- Keine echten In-App-Käufe, keine Werbung.

---

## Das Raster: 8-eckige Platten (Achteck-Kachelung)

Reguläre Achtecke allein füllen keine Fläche lückenlos. Verwende deshalb die **abgestumpfte Quadrat-Parkettierung (4.8.8)**:

- **Achtecke** sind die eigentlichen **Bau-/Produktionsfelder** (Wald, Mine, Feld, Fabrik, See …).
- In den Lücken zwischen je vier Achtecken liegen **kleine, auf der Spitze stehende Quadrate**. Das sind **Verbindungsfelder**: Wege, Straßen, Bahngleise, Stege oder Bojen auf dem Wasser. Sie werden automatisch passend zum Nachbarn gezeichnet und können später als **Bonusfelder** dienen (siehe unten).
- Koordinaten: Achteck `(col, row)` im regulären Gitter. Quadrat `(col+0.5, row+0.5)` zwischen den vier umliegenden Achtecken.
- Jedes Achteck hat **8 Nachbarn**: 4 Achtecke über die geraden Kanten (N/O/S/W) und 4 Quadrate über die schrägen Kanten.
- Achtecke leicht isometrisch/„2,5D“ darstellen: Kachel mit sichtbarer Seitenkante (Tiefe), Gebäude als einfache, freundliche Low-Poly-Formen in SVG/Canvas. Stil: hell, sauber, Pastellfarben, Bodensee-Blau, saftiges Allgäu-Grün.
- Hit-Testing präzise auf die Achteck-Form (Punkt-im-Polygon), nicht auf die Bounding-Box.

---

## Kern-Spielmechanik

1. **Felder freischalten:** Die Karte einer Region besteht aus 30–60 Achtecken, anfangs im Nebel (gesperrt). Freischalten kostet Münzen. Angrenzend an bereits freie Felder werden die Kosten pro Feld teurer. Unter jedem Feld liegt ein Rohstoff oder ein Bauplatz.
2. **Rohstoffe abbauen:** Rohstofffelder (Wald, Kiesgrube, Apfelplantage …) produzieren in Zyklen. Ein Fortschrittsring auf der Kachel zeigt den Zyklus. Fertige Ware wandert automatisch ins Lager bzw. wird verkauft.
3. **Weiterverarbeiten (Lieferketten):** Verarbeitungsbetriebe (Sägewerk, Mosterei …) verbrauchen Rohstoffe und erzeugen höherwertige Waren. Das dauert länger, bringt aber deutlich mehr Geld. Kleine animierte Transportpunkte (Karren, Lkw, Boote) laufen entlang der Quadrat-Wege von der Quelle zum Betrieb.
4. **Verkaufen:** Waren werden automatisch auf dem Markt verkauft (pro Ware an/aus schaltbar, damit man Rohstoffe für die Kette zurückhalten kann).
5. **Ausbaustufen:** Jedes Gebäude hat **6 Level**. Jedes Level steigert Produktivität und Gewinn und ändert die Optik sichtbar.
6. **Globale Upgrades (dauerhaft):** Pro Warenart kaufbar, z. B. „Holz +25 % Tempo“. Sie gelten für **alle** Felder dieser Warenart und **bleiben über alle Regionen hinweg erhalten**. Bezahlt wird mit der Zweitwährung.
7. **Erkundungsballons (Forschung):** Man leitet Waren an eine Ballonstation um und rüstet damit **Heißluftballons** aus. Jeder Start bringt Münzen- und **Seeperlen**-Boni und deckt einen Teil des Nebels kostenlos auf.
8. **Region abschließen – das Luftschiff:** Sind alle Felder einer Region freigeschaltet, erscheint eine **Luftschiffhalle**. Das Luftschiff wird mit festgelegten Warenmengen „beladen/betankt“. Danach fliegt es mit kurzer Animation über den See zur **nächsten Region**: neue Karte, neue Rohstoffe, Aufbau beginnt von vorn. Globale Upgrades und Seeperlen bleiben, Münzen und Gebäude werden zurückgesetzt (Prestige-Prinzip).

### Währungen
- **Münzen** – Hauptwährung, aus Verkäufen.
- **Seeperlen** – seltene Zweitwährung aus Ballonfahrten, Meilensteinen und Events. Wird für globale Upgrades ausgegeben. Nur im Spiel verdienbar.

### Ökonomie-Richtwerte (Startwerte, alle in Config)
- Kosten Ausbaustufe: `basisKosten × 1,9^(level-1)`
- Kosten Feld-Freischaltung: `basis × 1,22^(anzahlFreigeschaltet)`
- Verarbeitete Ware: ca. 3–5× Wert der eingesetzten Rohstoffe, ca. 2–3× Zykluszeit
- Zykluszeiten Rohstoffe 2–6 s, Verarbeitung 5–20 s
- Erste Region soll in ca. 30–45 Minuten aktivem Spiel abschließbar sein, spätere Regionen länger.

---

## Die Welt: Bodensee-Regionen (= Level)

Der **See selbst liegt als Wasser-Achtecke** auf den Karten der Uferregionen. Wasserfelder bieten Fischerei, Fährstationen und Bootstransport. Die Quadrate im Wasser werden zu Bojen und Stegen.

| # | Region | Orte/Flair | Neue Rohstoffe → Produkte |
|---|--------|-----------|---------------------------|
| 1 | **Oberschwaben** | Ravensburg (Türme, Altstadt), Weingarten (Basilika), Hügel, Wälder | Holz → Bretter → Möbel · Kies → Beton · Milch → Butter |
| 2 | **Nordufer & Hinterland** | Friedrichshafen (Luftschiffhalle, Hafen), Tettnang, Meersburg (Burg, Weinberge) | Hopfen → Bier · Trauben → Wein · Äpfel → Most → Apfelbrand · Felchen → Räucherfisch |
| 3 | **Allgäu & Lindau** | Lindau (Inselhafen, Leuchtturm, Löwe), Allgäuer Weiden, Westallgäu | Milch → Bergkäse · Holz → Holzbau/Schindeln · Wasserkraft → Strom (neue Ressourcenart: Energie) |
| 4 | **Vorarlberg** | Bregenz (Seebühne, Pfänder), Rheindelta | Stein → Werkstein · Wolle → Stoff · Strom → Maschinenteile |
| 5 | **Thurgau & St. Gallen** | Romanshorn, Arbon, Obstgärten („Mostindien“), Säntis im Hintergrund | Äpfel (Großplantagen) → Saftkonzentrat · Stoff → Stickerei/Spitze · Uhrenteile → Präzisionsmechanik |
| 6 | **Konstanz, Reichenau & Hegau** | Konstanzer Hafen, Gemüseinsel Reichenau, Blumeninsel, Hegau-Vulkankegel | Gemüse → Konserven · Blumen → Duftöl · Vulkanstein → Baustoffe · Finale: großes Luftschiff für die „Dreiländer-Rundfahrt“ (Endlos-/Prestige-Modus) |

Für jede Region gilt: eigene Farbpalette und Landschaftsdeko auf freien Flächen (Obstbäume, Hopfenstangen, Kühe, Segelboote, Alpenpanorama am Kartenrand).

### Bodensee-Eigenheiten als Spielelemente
- **Fähre Meersburg–Konstanz:** Fährstationen auf Wasserfeldern verbinden Ufer. Waren über die Fähre bekommen einen Verkaufsbonus von +X % (neue Märkte).
- **Föhn-Bonus:** Zufallsevent. Klare Sicht, die Alpen werden sichtbar, alle Ballonstarts geben für 60 s doppelte Boni.
- **Herbstnebel:** Kosmetisches Wetter-Event, Nebelschwaden über dem See. Optional reduziert er kurz die Bootsgeschwindigkeit.
- **Feste als Events** (zeitlich begrenzte Boni):
  - Rutenfest (Ravensburg): +50 % Verkaufspreise für Region 1
  - Seenachtfest (Konstanz): Feuerwerk-Animation, Seeperlen-Belohnung
  - Bregenzer Festspiele: Seebühne leuchtet, Stoff-Bonus
- **Pfahlbauten** (Unteruhldingen): Geheimes Bonusfeld am Ufer. Freischalten bringt einmalig viele Seeperlen.
- **Quadrat-Bonusfelder:** Ein Quadrat, das von 4 Gebäuden derselben Warenkette umgeben ist, wird zum Bonusfeld, z. B. „Marktplatz“ +10 % für alle vier Nachbarn. Das belohnt durchdachte Platzierung auf dem Achteck-Raster.
- **Optionaler Dialekt-Schalter** in den Einstellungen: Ausgewählte UI-Texte auf Schwäbisch/Alemannisch (z. B. „Schaffe, schaffe, Häusle baue“ als Ladebildschirm-Spruch, „Des goht“ statt „OK“).

---

## UI / Screens

- **Hauptansicht:** Karte (Canvas) im Vollbild.
  - Oben: Münzen, Seeperlen, Einkommen pro Sekunde.
  - Unten: Leiste mit „Upgrades“, „Ballons“, „Lager/Markt“, „Ziele“, „Einstellungen“.
- **Feld antippen** öffnet ein Bottom-Sheet: Name, Level (1–6, als Sterne/Balken), Produktion/s, Ein- und Ausgänge der Kette und ein großer Upgrade-Button mit Kosten. Ist der Button ausgegraut, wird angezeigt, wie viel noch fehlt.
- **Gesperrtes Feld antippen:** „Freischalten für X Münzen“. Eine kurze Animation lässt den Nebel wegziehen.
- **Lieferketten-Übersicht:** Einfacher Graph der Region (Rohstoff → Produkt), Engpässe rot markiert.
- **Ziele/Meilensteine:** Kleine Aufgaben („Baue 3 Sägewerke auf Level 3“) mit Seeperlen-Belohnung. Gleichzeitig ein sanftes Tutorial für die erste Region.
- **Haptik/Feedback:** Münz-Popups über Kacheln, kleines „Pling“ (WebAudio, prozedural erzeugt, abschaltbar), Vibration (`navigator.vibrate`, falls verfügbar) bei Level-ups.
- Einstellungen: Ton an/aus, Dialekt an/aus, Spielstand exportieren/importieren/zurücksetzen (mit Bestätigung).

---

## Vorgehen (bitte einhalten)

1. **Zuerst planen:** Lies diese Spezifikation und erstelle eine kurze `PLAN.md`:
   - Datenstrukturen für Achteck- und Quadratfelder
   - Simulationsschleife (fester Tick, z. B. 10 Hz, entkoppelt vom Rendering)
   - Speicherformat
   - Meilensteine

   Stelle Rückfragen nur, wenn etwas wirklich unklar ist.
2. **Meilenstein 1 – Raster & Steuerung:** 4.8.8-Kachelung rendern, Pan/Zoom/Tap auf dem iPhone, Felder freischalten mit Nebel.
3. **Meilenstein 2 – Wirtschaft MVP:** Region 1 (Oberschwaben) komplett spielbar:
   - 3 Ketten
   - 6 Ausbaustufen
   - Verkauf
   - Speichern/Laden
   - Offline-Ertrag
4. **Meilenstein 3 – Meta:** Globale Upgrades, Seeperlen, Ballonstation, Ziele/Tutorial.
5. **Meilenstein 4 – Luftschiff & Regionswechsel:** Prestige-Logik, Region 2 (Nordufer) mit Wasserfeldern, Fähre und Booten.
6. **Meilenstein 5+:** Regionen 3–6, Events (Föhn, Feste), Quadrat-Bonusfelder, Dialekt-Schalter, PWA-Feinschliff.

Nach jedem Meilenstein:
- Spiel lauffähig halten
- kurz testen (keine Konsolenfehler, Speichern/Laden funktioniert, Performance mit 60 Feldern auf Mobile)
- `CHANGELOG.md` aktualisieren
- committen

Halte die Spielwerte so, dass sich das Spielen von Anfang an belohnend anfühlt: in den ersten 30 Sekunden mindestens ein Upgrade möglich.

## Akzeptanzkriterien MVP (Meilenstein 1–2)
- [ ] Achtecke und Quadrate fügen sich lückenlos zusammen, Hit-Test exakt auf Achteck-Form
- [ ] Flüssiges Pan/Pinch-Zoom auf dem iPhone, keine Doppeltipp-Zoom-Probleme (`touch-action`, Viewport-Meta korrekt)
- [ ] Region 1 von Start bis „alle Felder frei“ durchspielbar
- [ ] Spielstand überlebt Neuladen und App-Wechsel, Offline-Ertrag wird korrekt angezeigt
- [ ] Alle Balancing-Werte im zentralen Config-Objekt
