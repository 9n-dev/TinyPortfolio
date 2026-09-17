/** Atlas cells are extracted at build time by prepare-assets.py.
 * Corners remain fixed; edges and center repeat at the same pixel scale.
 * One decorative layer, independent of the semantic link/button/panel above it.
 */
export type PanelSkin = 'paper' | 'slate' | 'wood' | 'scroll';
type SurfaceSkin = PanelSkin | 'button';
const cells = ['tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'] as const;

export function NineSliceSurface({ skin }: { skin: SurfaceSkin }) {
  return (
    <span className="nine-slice" data-skin={skin} aria-hidden="true">
      {cells.map(cell => <span className={`slice slice-${cell}`} key={cell} />)}
    </span>
  );
}
