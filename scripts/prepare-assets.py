"""Export inspected Tiny Swords UI regions and the sprites the world canvas uses.
Run with Python + Pillow. No filters or fractional scaling.
The original ZIP remains the source of truth. Exported UI cells retain their
transparent outside margins: no atlas gutters ever reach the browser.
"""
from pathlib import Path
from PIL import Image
import io
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = zipfile.ZipFile(ROOT / 'Tiny Swords (Free Pack).zip')
OUT = ROOT / 'public/assets'
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

# World sprites: copied unmodified. The registry records the frame grid and the
# opaque box of frame 0; its bottom centre is the "feet" anchor used for Y-sorting.
T, D, R, U, B = 'Terrain/', 'Terrain/Decorations/', 'Terrain/Resources/', 'Units/Blue Units/', 'Buildings/Blue Buildings/'
WORLD = {  # id: (source, frame width, frame height, fps)
    'tilemap': (T + 'Tileset/Tilemap_color1.png', 576, 384, 0),
    'foam': (T + 'Tileset/Water Foam.png', 192, 192, 8),
    'shadow': (T + 'Tileset/Shadow.png', 192, 192, 0),
    'castle': (B + 'Castle.png', 320, 256, 0), 'tower': (B + 'Tower.png', 128, 256, 0),
    'barracks': (B + 'Barracks.png', 192, 256, 0), 'archery': (B + 'Archery.png', 192, 256, 0),
    'monastery': (B + 'Monastery.png', 192, 320, 0),
    **{f'house{i}': (B + f'House{i}.png', 128, 192, 0) for i in (1, 2, 3)},
    **{f'tree{i}': (R + f'Wood/Trees/Tree{i}.png', 192, 256 if i < 3 else 192, 8) for i in (1, 2, 3, 4)},
    **{f'stump{i}': (R + f'Wood/Trees/Stump {i}.png', 192, 256, 0) for i in (1, 2, 3, 4)},
    **{f'bush{i}': (D + f'Bushes/Bushe{i}.png', 128, 128, 8) for i in (1, 2, 3, 4)},
    **{f'rock{i}': (D + f'Rocks/Rock{i}.png', 64, 64, 0) for i in (1, 2, 3, 4)},
    **{f'waterRock{i}': (D + f'Rocks in the Water/Water Rocks_0{i}.png', 64, 64, 8) for i in (1, 2, 3, 4)},
    **{f'cloud{i}': (D + f'Clouds/Clouds_0{i}.png', 576, 256, 0) for i in range(1, 9)},
    **{f'gold{i}': (R + f'Gold/Gold Stones/Gold Stone {i}.png', 128, 128, 0) for i in range(1, 7)},
    'goldResource': (R + 'Gold/Gold Resource/Gold_Resource.png', 128, 128, 0),
    'woodResource': (R + 'Wood/Wood Resource/Wood Resource.png', 64, 64, 0),
    'sheepIdle': (R + 'Meat/Sheep/Sheep_Idle.png', 128, 128, 8),
    'sheepGrass': (R + 'Meat/Sheep/Sheep_Grass.png', 128, 128, 8),
    'sheepMove': (R + 'Meat/Sheep/Sheep_Move.png', 128, 128, 8),
    **{'pawn' + name.replace(' ', ''): (U + f'Pawn/Pawn_{name}.png', 192, 192, 10) for name in [
        'Idle', 'Run', 'Idle Axe', 'Run Axe', 'Interact Axe', 'Run Wood', 'Idle Pickaxe', 'Run Pickaxe',
        'Interact Pickaxe', 'Run Gold', 'Idle Hammer', 'Interact Hammer']},
    **{'warrior' + n: (U + f'Warrior/Warrior_{n}.png', 192, 192, 10) for n in ('Idle', 'Run', 'Guard')},
    **{'lancer' + n: (U + f'Lancer/Lancer_{n}.png', 320, 320, 10) for n in ('Idle', 'Run')},
    **{'archer' + n: (U + f'Archer/Archer_{n}.png', 192, 192, 10) for n in ('Idle', 'Run', 'Shoot')},
    'arrow': (U + 'Archer/Arrow.png', 64, 64, 0),
    **{'monk' + n: (U + f'Monk/{n}.png', 192, 192, 10) for n in ('Idle', 'Run', 'Heal')},
}
registry = {}
for key, (source, fw, fh, fps) in WORLD.items():
    image = read(source)
    assert image.width % fw == 0 and image.height == fh, (key, image.size)
    save(image, f'world/{key}.png', source, 'world sprite')
    x0, y0, x1, y1 = image.crop((0, 0, fw, fh)).getbbox()
    registry[key] = dict(src=f'/assets/world/{key}.png', frameW=fw, frameH=fh, frames=image.width // fw, fps=fps,
                         # Units swap sheets per state: a centred X keeps them from jittering sideways.
                         anchorX=fw // 2 if source.startswith((U, R + 'Meat')) else (x0 + x1) // 2, anchorY=y1, box=[x0, y0, x1, y1])
source = UI + 'Human Avatars/Avatars_01.png'
save(read(source), 'ui/avatar.png', source, 'standalone sprite')
lines = ',\n'.join(f'  {key}: {json.dumps(value)}' for key, value in registry.items())
(ROOT / 'src/world/sprites.generated.ts').write_text(
    '// Generated by scripts/prepare-assets.py. Do not edit.\n'
    'export type SpriteDef = { src: string; frameW: number; frameH: number; frames: number; fps: number; '
    'anchorX: number; anchorY: number; box: number[] };\n'
    f'export const sprites = {{\n{lines},\n}} satisfies Record<string, SpriteDef>;\n'
    'export type SpriteId = keyof typeof sprites;\n')
print(f'Exported {len(MANIFEST)} files.')
