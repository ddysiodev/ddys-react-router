import type { DdysDisplayOptions, DdysItem } from '../types/ddys';
import { itemMeta, itemPoster, itemSummary, itemTitle, itemUrl } from './utils';

export interface DdysCardProps {
  item: DdysItem;
  display?: DdysDisplayOptions;
  siteBaseUrl?: string;
}

export function DdysCard({ item, display = {}, siteBaseUrl }: DdysCardProps) {
  const title = itemTitle(item);
  const poster = itemPoster(item);
  const url = itemUrl(item, siteBaseUrl);
  const meta = itemMeta(item);
  const summary = itemSummary(item);
  const showPoster = display.showPoster ?? true;
  const showSummary = display.showSummary ?? true;
  const showSourceLink = display.showSourceLink ?? true;
  const target = display.target ?? '_blank';

  return (
    <article className="ddys-rr-card">
      {showPoster && poster ? (
        <div className="ddys-rr-poster">
          <img src={poster} alt={title} loading="lazy" />
        </div>
      ) : null}
      <div className="ddys-rr-card-body">
        <h3 className="ddys-rr-title">
          {url && showSourceLink ? <a href={url} target={target} rel="noopener noreferrer">{title}</a> : title}
        </h3>
        {meta.length ? <div className="ddys-rr-meta">{meta.join(' / ')}</div> : null}
        {showSummary && summary ? <div className="ddys-rr-summary">{summary}</div> : null}
      </div>
    </article>
  );
}
