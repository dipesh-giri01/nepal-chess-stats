"""Build youth/data.json from a FIDE NEP player export (JSON lines), one youth category per player.

Usage: python3 youth/build_data.py path/to/ets.json
"""
import json
import sys
from pathlib import Path
from datetime import date

YEAR = date.today().year  # FIDE: age is counted as of 1 January of this year
CATS = (7, 8, 9, 10, 12, 14, 16, 18, 20)
MIN_RATING = 1400  # FIDE rating floor


def category(birth_year, year=YEAR):
    # Youngest category the player fits: under N if born in (year - N) or later
    return next((n for n in CATS if birth_year >= year - n), None)


def main(src):
    players = []
    for line in open(src, encoding='utf-8'):
        p = json.loads(line)
        b = p.get('birthday') or ''
        if not b.isdigit():
            continue
        cat = category(int(b))
        if cat is None:
            continue
        players.append({
            'cat': cat,
            'id': p['id_number'],
            'name': p['name'],
            'sex': p['sex'],
            'by': int(b),
            'title': ', '.join(p['title'] + p['w_title']),
            'std': p['standard_rating'],
            'rapid': p['rapid_rating'],
            'blitz': p['blitz_rating'],
        })
    players.sort(key=lambda p: (p['cat'], -max(p['std'] or 0, p['rapid'] or 0, p['blitz'] or 0), p['name']))

    data = {'year': YEAR, 'cats': CATS, 'min': MIN_RATING, 'players': players}
    out = Path(__file__).with_name('data.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f'Wrote {out}: {len(players)} youth players, season {YEAR}')


if __name__ == '__main__':
    assert category(2018, 2026) == 8 and category(2019, 2026) == 7
    assert category(2014, 2026) == 12 and category(2015, 2026) == 12
    assert category(2006, 2026) == 20 and category(2005, 2026) is None
    main(sys.argv[1])
