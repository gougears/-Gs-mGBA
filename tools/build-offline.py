#!/usr/bin/env python3
"""Regenerate sw.js after ANY runtime asset change. Excludes user ROMs and source ZIPs."""
import hashlib,json,sys,re
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
root=Path(sys.argv[1])
# Hosting may append instrumentation to HTML; a generated release marker binds the shell.
html=root/'index.html'
text=re.sub(r'<meta name="gs-offline-shell" content="[a-f0-9]+">','',html.read_text())
# Generate a version from runtime contents; normalize the generated display first.
text=re.sub(r'(<strong id="app-version">)[^<]*(</strong>)',r'\1VERSION\2',text)
fingerprint=hashlib.sha256(text.encode())
for item in sorted(root.rglob('*')):
    if item.is_file() and item.name not in {'sw.js','index.html'} and item.suffix in {'.bin','.html','.js','.css','.png','.svg','.webp','.jpg','.jpeg','.webmanifest'}:
        fingerprint.update(item.relative_to(root).as_posix().encode()+b'\0'+item.read_bytes())
fingerprint.update(Path(__file__).with_name('sw-template.js').read_bytes())
release=datetime.now(ZoneInfo('Asia/Tokyo')).strftime('%Y.%m.%d')+'-'+fingerprint.hexdigest()[:8]
text=text.replace('<strong id="app-version">VERSION</strong>','<strong id="app-version">'+release+'</strong>')
shell=hashlib.sha256(text.encode()).hexdigest()
html.write_text(text.replace('</head>',f'<meta name="gs-offline-shell" content="{shell}"></head>'))
assets=[]
for p in sorted(root.rglob('*')):
    if p.is_file() and p.name != 'sw.js' and p.suffix in {'.bin','.html','.js','.css','.png','.svg','.webp','.jpg','.jpeg','.webmanifest'}:
        assets.append([p.relative_to(root).as_posix(),('html:'+shell) if p==html else hashlib.sha256(p.read_bytes()).hexdigest()])
payload=json.dumps(assets,ensure_ascii=False,separators=(',',':'))
template=Path(__file__).with_name('sw-template.js').read_text()
version=hashlib.sha256((payload+template).encode()).hexdigest()[:16]
(root/'sw.js').write_text(template.replace('__ASSETS__',payload).replace('__VERSION__',version))
print(root, len(assets), 'assets', version)
