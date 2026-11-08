# Bodensee Builder

Ein Idle-/Tycoon-Aufbauspiel rund um den Bodensee, gespielt auf einem Raster aus Achtecken und Quadraten (4.8.8). Alles steckt in einer einzigen `index.html`, ohne Abhängigkeiten.

- Spezifikation: [`PROMPT.md`](PROMPT.md)
- Plan: [`PLAN.md`](PLAN.md)
- Änderungen: [`CHANGELOG.md`](CHANGELOG.md)

## Starten
`index.html` im Browser öffnen oder einen lokalen Server starten, z. B. `python3 -m http.server`.

Über http/https ist das Spiel eine **PWA**: Auf dem iPhone in Safari „Teilen → Zum Home-Bildschirm“, auf Android „App installieren“. Nach dem ersten Laden läuft es auch offline.

## Spielen
- Neblige Felder antippen und freischalten. Rohstofffelder (z. B. Wald, Kiesgrube, Weide) produzieren sofort.
- Auf Bauplätzen Verarbeitungsbetriebe bauen (Sägewerk, Schreinerei, Betonwerk, Molkerei) und alle Gebäude bis Stufe 6 ausbauen.
- Unter „Lager“ legst du fest, welche Waren automatisch verkauft werden. Der Reiter „Lieferketten“ zeigt Engpässe.
- Eine Ballonstation belädt Heißluftballons mit Waren. Starts bringen Seeperlen und decken Nebel auf.
- Seeperlen gibst du unter „Upgrades“ für dauerhafte, globale Verbesserungen aus.
- „Ziele“ führen durch die Region und bringen Belohnungen.
- Ist eine Region ganz erkundet, erscheint die Luftschiffhalle. Belade das Luftschiff und fliege zur nächsten Region. Seeperlen und globale Upgrades nimmst du mit.
- Sechs Regionen: Oberschwaben → Nordufer & Hinterland (See, Fischerei, Fähren, Boote) → Allgäu & Lindau (Strom aus Wasserkraft) → Vorarlberg → Thurgau & St. Gallen → Konstanz, Reichenau & Hegau.
- Strom ist Energie: Er lässt sich nicht einlagern, was nicht gebraucht wird, geht ins Netz.
- Finale: Das große Luftschiff startet zur Dreiländer-Rundfahrt. Danach beginnt die Reise in Oberschwaben von vorn, mit dauerhaft +25 % auf alle Verkaufspreise je Rundfahrt.
- Zufalls-Events: Föhn (Ballonstarts doppelt), Herbstnebel und ein Fest je Region (z. B. Rutenfest +50 % auf alle Preise, Seenachtfest mit Feuerwerk und Seeperlen).
- Zunftplätze: Umgeben vier Betriebe derselben Lieferkette ein Quadrat, arbeiten alle vier 10 % schneller. Plane deine Bauplätze!
- Am Ufer verstecken sich Pfahlbauten – wer sie aufdeckt, bekommt Seeperlen.
- In den Optionen gibt es einen Dialekt-Schalter (Schwäbisch/Alemannisch).
- Debug: `index.html#debug` öffnen, dann Einstellungen → „+1.000 Münzen“, „+10 Seeperlen“, „Region abschließen“ oder „nächstes Event starten“.

## Werkzeuge
- `tools/balance.sh index.html 10`: Balancing-Bot über 10 Seeds (braucht Node und Playwright mit Chromium)
- `node tools/make-icons.js`: PNG-Icons aus `icons/icon.svg` erzeugen
