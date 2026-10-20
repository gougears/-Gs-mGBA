#!/usr/bin/env python3
"""Regenerate sw.js after ANY runtime asset change. Excludes user ROMs and source ZIPs."""
import hashlib,json,sys,re
from pathlib import Path
root=Path(sys.argv[1])
# Hosting may append instrumentation to HTML; a generated release marker binds the shell.
html=root/'index.html'
text=re.sub(r'<meta name="gs-offline-shell" content="[a-f0-9]+">','',html.read_text())
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
