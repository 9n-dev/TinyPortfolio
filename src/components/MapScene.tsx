import type { CSSProperties } from 'react';
import scenes from '../data/scenes/generated.json';

type Region = keyof typeof scenes;

/** Transparent, section-anchored scenery on a single shared terrain.
 * The exporter validates visible bounds and reserved UI areas, then bakes static
 * objects in Y-depth order. Only the handful of idle animations need DOM nodes.
 */
export function SceneRegion({ region }: { region: Region }) {
  return <div className={`region-scenery region-${region}`} aria-hidden="true">
    {(['desktop', 'mobile'] as const).map(layout => {
      const scene = scenes[region][layout];
      return <div key={layout} className={`scene-layer scene-${layout}`} style={{
        width: scene.width, height: scene.height,
        backgroundImage: `url('/assets/terrain/${region}${layout === 'mobile' ? 'Mobile' : ''}.webp')`,
      }}>
        {scene.animations.map(unit => <span key={unit.id} className="animated-sprite" style={{
          left: unit.x, top: unit.y, width: unit.width, height: unit.height,
          '--sheet': `url('/assets/units/${unit.asset}-idle.png')`,
          '--sprite-size': `${unit.width}px`, '--frames': unit.frames,
          animationDuration: unit.asset === 'sheep' ? '2.1s' : '1.6s',
        } as CSSProperties} />)}
      </div>;
    })}
  </div>;
}
