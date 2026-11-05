"""Audit the formal C·Path original question set for completeness and repetition."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
files=[ROOT/'src/data/originals.json',ROOT/'src/data/originals-phase6.json']
items=[]
for path in files: items.extend(json.loads(path.read_text(encoding='utf-8')))
required=['id','title','chapter','topics','statement','constraints','inputFormat','outputFormat','examples','hints','referenceSolution','testCases','provenance']
errors=[]
ids=set()
for item in items:
    if item['id'] in ids: errors.append(f"duplicate id: {item['id']}")
    ids.add(item['id'])
    missing=[key for key in required if not item.get(key)]
    if missing: errors.append(f"{item['id']} missing {','.join(missing)}")
    if len(item.get('examples',[]))<2 and any(case.get('input','') for case in item.get('testCases',[])): errors.append(f"{item['id']} needs two examples")
    if len(item.get('hints',[]))<3: errors.append(f"{item['id']} needs three hints")
    if len(item.get('testCases',[]))<5: errors.append(f"{item['id']} needs five tests")
    if any(case.get('input','') for case in item.get('testCases',[])) and len({case['input'] for case in item.get('testCases',[])})<min(3,len(item.get('testCases',[]))): errors.append(f"{item['id']} has repetitive inputs")
if len(items)!=48: errors.append(f"expected 48 formal questions, got {len(items)}")
if errors:
    print('\n'.join(errors)); raise SystemExit(1)
print(f"Audited {len(items)} formal original questions and {sum(len(item['testCases']) for item in items)} test cases")
