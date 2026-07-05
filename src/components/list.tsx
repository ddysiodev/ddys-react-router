import type { DdysDisplayOptions, DdysItem } from '../types/ddys';
import { itemMeta, itemTitle, itemUrl } from './utils';

export interface DdysListProps {
  items: DdysItem[];
  display?: DdysDisplayOptions;
  siteBaseUrl?: string;
  emptyText?: string;
}

export function DdysList({ items, display = {}, siteBaseUrl, emptyText = 'No DDYS content found.' }: DdysListProps) {
  const theme = display.theme ?? 'auto';
  if (!items.length) return <div className={`ddys-rr ddys-rr-theme-${theme}`}><div className="ddys-rr-empty">{emptyText}</div></div>;
  return (
    <div className={`ddys-rr ddys-rr-theme-${theme} ddys-rr-list`}>
      {items.map((item, index) => {
        const title = itemTitle(item);
        const url = itemUrl(item, siteBaseUrl);
        const meta = itemMeta(item);
        return (
          <article className="ddys-rr-list-item" key={String(item.id ?? item.slug ?? item.code ?? index)}>
            <h3 className="ddys-rr-title">{url ? <a href={url}>{title}</a> : title}</h3>
            {meta.length ? <div className="ddys-rr-meta">{meta.join(' / ')}</div> : null}
          </article>
        );
      })}
    </div>
  );
}
