"""Create review candidates; never modify published data or mark codes redemption-tested."""
import concurrent.futures
import datetime
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import sys

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip = 0; self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
    def handle_data(self, data):
        if not self.skip and data.strip(): self.parts.append(data.strip())

def fetch(url):
    return subprocess.check_output(['curl', '--fail', '--location', '--silent', '--show-error', '--max-time', '35', url], text=True)

def number(lines, label):
    if label not in lines: raise ValueError('Missing source label: ' + label)
    value = lines[lines.index(label) + 1]
    if value in ('—', 'TBC'): return None
    match = re.match(r'\$?([\d,.]+)', value)
    if not match: raise ValueError('Unrecognized source value: ' + value)
    return float(match[1].replace(',', ''))

root = Path(__file__).resolve().parent.parent
out = root / 'docs' / 'data' / 'candidate'
out.mkdir(parents=True, exist_ok=True)
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
rows = json.loads((root / 'src/data/catalog.json').read_text())
codes = json.loads((root / 'src/data/codes.json').read_text())
report = {'checked_at': stamp, 'mode': 'candidate only; manual review required', 'records': [], 'errors': []}
def inspect(row):
    raw = fetch(row['source_url']); parser = Text(); parser.feed(raw)
    labels = {'price':'Price per kit','damage':'Damage per hit','rpm':'Fire rate','range':'Effective range','velocity':'Muzzle velocity','accuracy':'Accuracy','ammo_price':'Ammunition:'} if row['entity_type'] == 'weapons' else {'price':'Price','seats':'Seats'}
    observed = {key:number(parser.parts,label) for key,label in labels.items()}
    changes = {key:{'published':row['data_json'].get(key),'observed':value} for key,value in observed.items() if row['data_json'].get(key) != value}
    return {'id':row['id'],'source_url':row['source_url'],'observed':observed,'changes':changes,'facts_sha256':hashlib.sha256(json.dumps(observed,sort_keys=True).encode()).hexdigest()}
selected = [row for row in rows if row['entity_type'] in ('weapons','vehicles')]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(inspect,row):row for row in selected}
    for task in concurrent.futures.as_completed(futures):
        row = futures[task]
        try: report['records'].append(task.result())
        except Exception as exc: report['errors'].append({'id':row['id'],'error':str(exc)})
report['records'].sort(key=lambda row:row['id'])
code_candidates = []
for game_id, url in sorted(set((c['game_id'],c['source_url']) for c in codes)):
    try:
        payload = json.loads(fetch(url))
        data = payload['data'][0]
        description = data['description']
        for line in description.splitlines():
            match = re.fullmatch(r'([A-Za-z0-9_.-]{1,60})\s+—\s+(.+)',line.strip())
            if match:
                code_candidates.append({'game_id':game_id,'code':match[1],'reward':match[2],'source_url':url,'checked_at':stamp[:10],'status':'Officially listed · redemption untested'})
        report.setdefault('code_sources',[]).append({'game_id':game_id,'source_url':url,'experience_updated_at':data['updated'],'codes_observed':len([c for c in code_candidates if c['game_id']==game_id])})
    except Exception as exc: report['errors'].append({'source_url':url,'error':str(exc)})
old = {(c['game_id'],c['code']):c['reward'] for c in codes}
new = {(c['game_id'],c['code']):c['reward'] for c in code_candidates}
report['code_changes'] = [{'game_id':key[0],'code':key[1],'published_reward':old.get(key),'observed_reward':new.get(key)} for key in sorted(old.keys()|new.keys()) if old.get(key)!=new.get(key)]
(out/'source-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(out/'codes.json').write_text(json.dumps(code_candidates,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'observed_records':len(report['records']),'changed_records':sum(bool(r['changes']) for r in report['records']),'codes_observed':len(code_candidates),'code_changes':len(report['code_changes']),'errors':report['errors'],'report':str(out/'source-report.json')},indent=2))
if report['errors']: sys.exit(1)
