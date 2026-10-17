"""Build tournaments/data.json from the NEP FIDE rated tournaments export.

Usage: python3 tournaments/build_data.py [dataset/nep_rated_tournaments.json]
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def clean(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def organizers(s):
    # FIDE joins names as "Last, First (NEP) Last, First (NEP)"
    return '; '.join(clean(n) for n in re.split(r'\(NEP\)', s or '') if clean(n))


def chief_arbiter(s):
    return clean(re.sub(r'\([^)]*\)', '', s or ''))


def rating_cap(name):
    # "Below 1900", "Below ELO 2000", "Rating below 1800", "U-1800"; youth age caps like U19 have 2 digits and do not match
    m = re.search(r'(?:below|under)\s*(?:elo\s*)?(?:rating\s*)?(\d{4})|\bU-?(\d{4})\b', name, re.I)
    return int(m.group(1) or m.group(2)) if m else None


def main(src):
    raw = json.load(open(src, encoding='utf-8'))['data']
    events = [{
        'id': e['tournament_id'],
        'name': clean(e['name']),
        'city': clean(e['city']).rstrip(',').strip(),
        'start': e['start_date'],
        'end': e['end_date'],
        'fmt': e['rating_type'],  # Standard, Rapid or Blitz
        'n': e['num_players'],
        'org': organizers(e['organizer']),
        'arb': chief_arbiter(e['chief_arbiter']),
        'cap': rating_cap(e['name']),
    } for e in raw]
    events.sort(key=lambda e: (e['start'], e['id']), reverse=True)

    out = Path(__file__).with_name('data.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'events': events}, f, ensure_ascii=False, separators=(',', ':'))
    print(f'Wrote {out}: {len(events)} tournaments')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'dataset' / 'nep_rated_tournaments.json')
