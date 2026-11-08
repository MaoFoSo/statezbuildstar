// Balancing-Bot: treibt simTick direkt an und spielt alle Regionen nacheinander (Playwright, Chromium).
// Strategie: kauft jeweils das Günstigste (Feld, Ausbau, Betrieb mit Lieferant), startet Ballons, holt Ziele ab,
// kauft das billigste globale Upgrade und fliegt mit dem Luftschiff weiter. Zufall per Seed reproduzierbar.
// Aufruf: node tools/balance-bot.js index.html [seed] [regionen]   ·   Mittelwert: tools/balance.sh index.html [seeds]
const { chromium } = require('playwright');
const file = require('path').resolve(process.argv[2] || 'index.html');
const seed = +(process.argv[3] || 1), nRegions = +(process.argv[4] || 7);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + file);
  await page.waitForTimeout(500);
  const res = await page.evaluate(([seed, nRegions]) => {
    let s = seed >>> 0;
    Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    localStorage.clear();
    startState(newState()); state.settings.sound = false;
    const out = [], evCount = {};
    let simT = 0;
    const gupIds = () => Object.keys(CONFIG.meta.special).concat(regionGoods().flatMap(g => ['speed:' + g, 'price:' + g]));
    function decide() {
      for (const x of openGoals()) if (x.done) claimGoal(x.i);
      if (world.station && cargoFull(state.balloon, balloonNeed())) {
        tryLaunchBalloon();
        const f = fx.balloons[fx.balloons.length - 1];
        if (f) f.targets.forEach(o => { if (!o.unlocked) revealField(o, 0); });
        fx.balloons = [];
      }
      for (let k = 0; k < 20; k++) {
        const c = gupIds().filter(id => gupLevel(id) < metaDef(id).max).sort((a, b) => gupCost(a) - gupCost(b))[0];
        if (!c || state.pearls < gupCost(c) || !tryBuyMeta(c)) break;
      }
      if (airshipLoading() && cargoFull(state.airship, world.region.airship.need)) { tryLaunchAirship(); finishFlight(); return true; }
      for (let k = 0; k < 60; k++) {
        const cands = [];
        const un = world.octs.filter(isUnlockable);
        if (un.length) cands.push({ cost: unlockCost(), go: () => tryUnlock(un[Math.floor(Math.random() * un.length)]) });
        for (const o of world.octs) {
          if (!o.unlocked || !o.b) continue;
          const d = def(o.b);
          if (d.noUpgrade || o.b.l >= CONFIG.levels.max) continue;
          if (d.in && !o.b.a) continue;
          cands.push({ cost: upgradeCost(o.b), go: () => tryUpgrade(o) });
        }
        const { sup, dem } = chainStats();
        const free = world.octs.filter(o => o.unlocked && !o.b && buildableKinds(o).length);
        const kinds = world.region.buildings;
        for (const kk of kinds) {
          if (atMax(kk)) continue;
          const d = CONFIG.buildings[kk];
          if (d.in) {
            if (!Object.keys(d.in).every(regionProduces)) continue;
            const rate = CONFIG.levels.yield[0] / d.cycle;
            if (countKind(kk) > 0 && !Object.keys(d.in).every(g => (sup[g] || 0) >= (dem[g] || 0) + d.in[g] * rate * 0.8)) continue;
          }
          const plots = free.filter(o => o.type === d.field);
          if (!plots.length) continue;
          const unbuilt = kinds.filter(x => x !== kk && countKind(x) === 0 && !atMax(x) && CONFIG.buildings[x].field === 'plot').length;
          if (d.field === 'plot' && countKind(kk) > 0 && plots.length <= unbuilt) continue;
          let best = plots[0];
          if (typeof bonusGain === 'function') { let bg = -1; for (const p of plots) { const g = bonusGain(p, kk); if (g > bg) { bg = g; best = p; } } }
          cands.push({ cost: buildCost(kk), go: () => tryBuild(best, kk) });
        }
        if (!cands.length) break;
        cands.sort((a, b) => a.cost - b.cost);
        if (state.coins < cands[0].cost) break;
        if (!cands[0].go()) break;
      }
      return false;
    }
    for (let r = 0; r < nRegions; r++) {
      const name = world.region.name + (state.tour ? ' (Rundfahrt ' + state.tour + ')' : '');
      const t0 = simT; let flew = false, tAll = null;
      while (simT - t0 < 4 * 3600) {
        for (let i = 0; i < 10; i++) { simTick(DT, true); simT += DT; }
        if (state.event && state.event.id) evCount[state.event.id + '@' + simT.toFixed(0)] = 1;
        if (tAll === null && allUnlocked()) tAll = simT - t0;
        if (decide()) { flew = true; break; }
      }
      out.push({ region: name, min: +((simT - t0) / 60).toFixed(1), allMin: tAll === null ? null : +(tAll / 60).toFixed(1), flew, pearls: state.pearls, gups: gupTotal() });
      if (!flew) break;
    }
    const evs = {}; Object.keys(evCount).forEach(k => { const id = k.split('@')[0]; evs[id] = (evs[id] || 0) + 1; });
    return { out, evs };
  }, [seed, nRegions]);
  console.log(JSON.stringify(res.out.map(o => `${o.region}: ${o.min} min (alle Felder ${o.allMin}) · Perlen ${o.pearls} · Upgrades ${o.gups}`), null, 1));
  if (Object.keys(res.evs).length) console.log('Event-Sekunden:', JSON.stringify(res.evs));
  if (errors.length) console.log('FEHLER:', errors.slice(0, 5));
  await browser.close();
})();
