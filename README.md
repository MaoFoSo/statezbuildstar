# Bodensee Builder

Ein Idle-/Tycoon-Aufbauspiel rund um den Bodensee, gespielt auf einem Raster aus Achtecken und Quadraten (4.8.8). Alles steckt in einer einzigen `index.html`, ohne Abhängigkeiten.

- Spezifikation: [`PROMPT.md`](PROMPT.md)
- Plan: [`PLAN.md`](PLAN.md)
- Änderungen: [`CHANGELOG.md`](CHANGELOG.md)

## Starten
`index.html` im Browser öffnen oder einen lokalen Server starten, z. B. `python3 -m http.server`.

## Spielen
- Neblige Felder antippen und freischalten. Rohstofffelder (Wald, Kiesgrube, Weide) produzieren sofort.
- Auf Bauplätzen Verarbeitungsbetriebe bauen (Sägewerk, Schreinerei, Betonwerk, Molkerei) und alle Gebäude bis Stufe 6 ausbauen.
- Unter „Lager“ legst du fest, welche Waren automatisch verkauft werden. Der Reiter „Lieferketten“ zeigt Engpässe.
- Eine Ballonstation belädt Heißluftballons mit Waren. Starts bringen Seeperlen und decken Nebel auf.
- Seeperlen gibst du unter „Upgrades“ für dauerhafte, globale Verbesserungen aus.
- „Ziele“ führen durch die Region und bringen Belohnungen.
- Debug: `index.html#debug` öffnen, dann Einstellungen → „+1.000 Münzen“ bzw. „+10 Seeperlen“.
