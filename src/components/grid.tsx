import type { DdysDisplayOptions, DdysItem } from '../types/ddys';
import type { CSSProperties } from 'react';
import { DdysCard } from './card';

export interface DdysGridProps {
  items: DdysItem[];
  display?: DdysDisplayOptions;
  siteBaseUrl?: string;
  emptyText?: string;
}

export function DdysGrid({ items, display = {}, siteBaseUrl, emptyText = 'No DDYS content found.' }: DdysGridProps) {
  const columns = Math.max(1, Math.min(6, display.columns ?? 4));
  const layout = display.layout ?? 'grid';
  const theme = display.theme ?? 'auto';
  if (!items.length) {
    return <div className={`ddys-rr ddys-rr-theme-${theme}`}><div className="ddys-rr-empty">{emptyText}</div></div>;
  }

  return (
    <div className={`ddys-rr ddys-rr-theme-${theme} ddys-rr-layout-${layout}`} style={{ '--ddys-rr-columns': columns } as CSSProperties}>
      <div className="ddys-rr-items">
        {items.map((item, index) => <DdysCard key={String(item.id ?? item.slug ?? index)} item={item} display={display} siteBaseUrl={siteBaseUrl} />)}
      </div>
    </div>
  );
}
