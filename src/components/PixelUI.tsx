import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { NineSliceSurface } from './NineSliceSurface';
import type { PanelSkin } from './NineSliceSurface';

export function PixelButton({ children, className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const secondary = className.split(' ').includes('secondary');
  return (
    <a className={`pixel-button ${className}`} {...props}>
      <NineSliceSurface skin={secondary ? 'slate' : 'button'} />
      {children}
    </a>
  );
}

export function PixelPanel({ children, className = '', skin = 'paper' }: PropsWithChildren<{ className?: string; skin?: PanelSkin }>) {
  return <div className={`pixel-panel ${className}`} data-skin={skin}>
    <NineSliceSurface skin={skin} />
    {children}
  </div>;
}

export function SectionTitle({ title, id }: { title: string; id?: string }) {
  return <header className="section-heading"><h2 id={id} className="ribbon">{title}</h2></header>;
}
