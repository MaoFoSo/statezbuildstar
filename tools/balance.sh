#!/bin/bash
# Mittelwert über mehrere Seeds: tools/balance.sh index.html [n]
f=$1; n=${2:-6}
for s in $(seq 1 $n); do node "$(dirname "$0")/balance-bot.js" "$f" $s | grep -o '"[^"]*: [0-9.]* min'; done | python3 -c "
import sys,re,collections
d=collections.OrderedDict()
for l in sys.stdin:
  m=re.match(r'\"(.*): ([0-9.]+) min',l.strip()); d.setdefault(m.group(1),[]).append(float(m.group(2)))
for k,v in d.items(): print(f'{k:45s} Ø {sum(v)/len(v):5.1f} min  (min {min(v):.1f}, max {max(v):.1f}, n={len(v)})')
"
