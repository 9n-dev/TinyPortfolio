"""Export inspected Tiny Swords regions; compose hand-authored scene data.
Run with Python + Pillow. No procedural placement, filters or fractional scaling.
The original ZIP remains the source of truth. Exported UI cells retain their
transparent outside margins: no atlas gutters ever reach the browser.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import io
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = zipfile.ZipFile(ROOT / 'Tiny Swords (Free Pack).zip')
OUT = ROOT / 'public/assets'
WORLD = json.loads((ROOT / 'src/data/scenes/world.json').read_text())
MANIFEST = []
UI = 'UI Elements/UI Elements/'

def read(source):
    return Image.open(io.BytesIO(ARCHIVE.read('Tiny Swords (Free Pack)/' + source))).convert('RGBA')

def save(image, destination, source, kind, **metadata):
    path = OUT / destination
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True, **({'lossless': True} if path.suffix == '.webp' else {}))
    MANIFEST.append(dict(file=destination, source=source, kind=kind, size=list(image.size), **metadata))

# 9 independent cells. Corners have fixed pixel dimensions in CSS; middle cells
# repeat instead of stretching their flecks/grain. Separate pressed cells retain
# that state's own outline, which extends beyond the regular state's bounds.
UI_SHEETS = {
    'paper': ('Papers/RegularPaper.png', [0, 128, 256], 64),
    'slate': ('Papers/SpecialPaper.png', [0, 128, 256], 64),
    'wood': ('Wood Table/WoodTable.png', [0, 160, 320], 128),
    'scroll': ('Banners/Banner.png', [0, 160, 320], 128),
    'button': ('Buttons/BigBlueButton_Regular.png', [0, 128, 256], 64),
    'button-pressed': ('Buttons/BigBlueButton_Pressed.png', [0, 128, 256], 64),
}
POSITIONS = ['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br']
for name, (source, starts, size) in UI_SHEETS.items():
    atlas = read(UI + source)
    for row in range(3):
        for col in range(3):
            # Wood's middle cells are 64 px with 32 px gutters in a 128 px slot.
            # Pad by repeating the real center/edge tile, never by keeping gutters.
            x, y = starts[col], starts[row]
            if name in ['wood', 'scroll']:
                if col == 1: x += 32
                if row == 1: y += 32
            w = 64 if name in ['wood', 'scroll'] and col == 1 else size
            h = 64 if name in ['wood', 'scroll'] and row == 1 else size
            # The paper center contains a crease at its tile corner. Repeating that
            # crease creates an unintended grid. Use its uniform inner region.
            if name in ['paper', 'slate']:
                if row == col == 1:
                    x, y, w, h = 160, 160, 16, 16
                elif name == 'paper' and col == 1:
                    x, w = 144, 32
                elif name == 'paper' and row == 1:
                    y, h = 144, 32
            cell = atlas.crop((x, y, x + w, y + h))
            # A clean reading center from RegularPaper inside the scroll frame.
            if name == 'scroll' and row == col == 1:
                cell = read(UI + 'Papers/RegularPaper.png').crop((160, 160, 176, 176))
            # Remove only exterior atlas padding. Each resulting cell retains
            # its true aspect ratio; CSS has separate X/Y corner dimensions.
            if name in ['wood', 'scroll']:
                left, top, right, bottom = (44, 40, 44, 24) if name == 'wood' else (28, 60, 44, 16)
                cut = (left if col == 0 else 0, top if row == 0 else 0,
                       cell.width - (right if col == 2 else 0), cell.height - (bottom if row == 2 else 0))
                cell = cell.crop(cut)
            save(cell, f'ui/{name}/{POSITIONS[row * 3 + col]}.png', UI + source,
                 '9-slice UI cell', region=[x, y, w, h])

# BigRibbons: one color per 128px row; three horizontal pieces with gutters.
# Keep the original 128px height. Ends stay fixed; only the middle repeats.
atlas = read(UI + 'Ribbons/BigRibbons.png')
for name, x, width in [('left', 0, 128), ('center', 192, 64), ('right', 320, 128)]:
    save(atlas.crop((x, 0, x + width, 128)), f'ui/ribbon/{name}.png',
         UI + 'Ribbons/BigRibbons.png', 'atlas variant / horizontal slice', region=[x, 0, width, 128])

for number in ['02', '03', '05', '06', '10']:
    source = UI + f'Icons/Icon_{number}.png'
    save(read(source), f'ui/Icon_{number}.png', source, 'standalone sprite')
source = UI + 'Wood Table/WoodTable_Slots.png'
save(read(source), 'ui/WoodTable_Slots.png', source, 'standalone UI slot')
source = UI + 'Bars/SmallBar_Base.png'
for name, box in [('left', (48, 20, 64, 44)), ('center', (128, 20, 192, 44)), ('right', (256, 20, 272, 44))]:
    save(read(source).crop(box), f'ui/divider/{name}.png', source, 'three-slice UI bar', region=list(box))
terrain_source = 'Terrain/Tileset/Tilemap_color2.png'
grass = read(terrain_source).crop((64, 64, 128, 128))
save(grass, 'terrain/grass.png', terrain_source, 'terrain tile', region=[64, 64, 64, 64])

def draw_pond(scene, pond):
    # Coastline cells are taken from the original island autotiles. Their alpha
    # provides the irregular shoreline; the water tile fills the inset area.
    rows = pond['rows']
    width, height = max(map(len, rows)), len(rows)
    coast = Image.new('RGBA', (width * 64, height * 64))
    atlas = read(terrain_source)
    def wet(x, y):
        return 0 <= y < height and 0 <= x < len(rows[y]) and rows[y][x] == 'W'
    for y in range(height):
        for x in range(width):
            if not wet(x, y): continue
            tx = 0 if not wet(x - 1, y) else 2 if not wet(x + 1, y) else 1
            ty = 0 if not wet(x, y - 1) else 2 if not wet(x, y + 1) else 1
            coast.alpha_composite(atlas.crop((tx*64, ty*64, tx*64+64, ty*64+64)), (x*64, y*64))
    # Erode the composed shape, not each cell: no grid seams inside the pond.
    mask = coast.getchannel('A').filter(ImageFilter.MinFilter(9))
    water_tile = read('Terrain/Tileset/Water Background color.png')
    water = Image.new('RGBA', coast.size)
    for y in range(0, height*64, 64):
        for x in range(0, width*64, 64): water.alpha_composite(water_tile, (x, y))
    coast.paste(water, (0, 0), mask)
    scene.alpha_composite(coast, (pond['x'], pond['y']))

# Tight bounds are shared by rendering and validation, including all idle frames.
CACHE = {}
for key, data in WORLD['assets'].items():
    sheet = read(data['source'])
    if 'frame' in data:
        x, y, w, h = data['frame']
        frames = [sheet.crop((x+i*w, y, x+(i+1)*w, y+h)) for i in range(data['frames'])]
    else:
        frames = [sheet]
    boxes = [frame.getbbox() for frame in frames]
    bounds = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    CACHE[key] = [frame.crop(bounds) for frame in frames]

def intersects(a, b):
    return a[0] < b[0]+b[2] and a[0]+a[2] > b[0] and a[1] < b[1]+b[3] and a[1]+a[3] > b[1]

def compose(name, data):
    errors = []
    entries = []
    for item in data['items']:
        frames = CACHE[item['asset']]
        w,h = frames[0].size
        assert all(isinstance(item[k], int) for k in ['x','y'])
        rect = [item['x'],item['y'],w,h]
        entries.append({**item, 'bounds':rect, 'depth':item['y']+h})
        for safe in data['safeAreas']:
            if intersects(rect, safe): errors.append(f"{name}: {item['id']} enters UI safe area")
        if item['asset'] != 'waterRock':
            for pond in data['ponds']:
                for y,row in enumerate(pond['rows']):
                    for x,cell in enumerate(row):
                        if cell == 'W' and intersects(rect,[pond['x']+x*64,pond['y']+y*64,64,64]):
                            errors.append(f"{name}: {item['id']} overlaps water"); break
    for i,a in enumerate(entries):
        for b in entries[i+1:]:
            if not intersects(a['bounds'],b['bounds']): continue
            # Overlapping tree crowns are deliberate forest depth, never units,
            # animals, buildings or doors. Their bottom footprints must be clear.
            if a['asset'].startswith('tree') and b['asset'].startswith('tree'):
                def foot(o):
                    x,y,w,h=o['bounds']; return [x+w//3,y+h-16,w//3,16]
                if not intersects(foot(a),foot(b)): continue
            errors.append(f"{name}: {a['id']} overlaps {b['id']}")
    if errors:
        return None, errors
    image = Image.new('RGBA',(data['width'],data['height']))
    for pond in data['ponds']: draw_pond(image,pond)
    animations=[]
    for item in sorted(entries,key=lambda o:o['depth']):
        if item.get('animate'):
            frames=CACHE[item['asset']]; w,h=frames[0].size
            animations.append({**item,'width':w,'height':h,'frames':len(frames)})
        else:
            image.alpha_composite(CACHE[item['asset']][0],(item['x'],item['y']))
    save(image,f'terrain/{name}.webp','src/data/scenes/world.json#'+name,'validated Y-sorted decorative layer')
    return {'width':data['width'],'height':data['height'],'items':entries,'safeAreas':data['safeAreas'],'animations':animations}, []

RUNTIME = {}
ERRORS = []
for name, data in WORLD['regions'].items():
    desktop, errors = compose(name,data); ERRORS += errors
    mobile, errors = compose(name+'Mobile',data['mobile']); ERRORS += errors
    RUNTIME[name]={'desktop':desktop,'mobile':mobile}
if ERRORS:
    raise SystemExit('Visual placement validation failed:\n'+'\n'.join(sorted(set(ERRORS))))

animated = {item['asset'] for region in RUNTIME.values() for scene in region.values() for item in scene['animations']}
for key in sorted(animated):
    frames=CACHE[key];w,h=frames[0].size
    strip=Image.new('RGBA',(w*len(frames),h))
    for i,frame in enumerate(frames):strip.alpha_composite(frame,(i*w,0))
    save(strip,f'units/{key}-idle.png',WORLD['assets'][key]['source'],'tight animation strip',frames=len(frames),frame=[w,h])
(ROOT/'src/data/scenes/generated.json').write_text(json.dumps(RUNTIME,indent=2)+'\n')
(ROOT/'docs/scene-validation.json').write_text(json.dumps({'status':'passed','regions':len(RUNTIME),'sprites':sum(len(s['items']) for r in RUNTIME.values() for s in r.values()),'checks':['UI safe areas','visible sprite bounds','water exclusion','tree footprints','integer coordinates','Y depth']},indent=2)+'\n')

# Only delete files previously generated by this script, never unrelated assets.
manifest_path = ROOT / 'docs/selected-assets.json'
previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
selected = {item['file'] for item in MANIFEST}
for item in previous:
    if item['file'] not in selected:
        (OUT / item['file']).unlink(missing_ok=True)
manifest_path.write_text(json.dumps(MANIFEST, indent=2) + '\n')
print(f'Exported {len(MANIFEST)} inspected regions and composed layers.')
