import type { DdysApiResponse, DdysDisplayOptions, DdysItem, DdysMovie, DdysViewName } from '../types/ddys';
import { DdysGrid } from './grid';
import { DdysList } from './list';
import { DdysMovieDetail } from './movie-detail';
import { DdysSources } from './sources';

export interface DdysViewProps {
  view: DdysViewName | string;
  payload?: unknown;
  movie?: DdysMovie;
  sources?: unknown;
  display?: DdysDisplayOptions;
  siteBaseUrl?: string;
}

export function DdysView({ view, payload, movie, sources, display, siteBaseUrl }: DdysViewProps) {
  if (view === 'movie' && movie) return <DdysMovieDetail movie={movie} display={display} siteBaseUrl={siteBaseUrl} />;
  if (view === 'sources') return <DdysSources sources={sources ?? payload} display={display} />;
  if (['calendar', 'collections', 'collection', 'shares', 'share', 'requests', 'activities', 'user', 'types', 'genres', 'regions'].includes(view)) {
    return <DdysList items={asItems(payload)} display={display} siteBaseUrl={siteBaseUrl} />;
  }
  if (['movies', 'latest', 'hot', 'search', 'suggest', 'related', 'comments'].includes(view)) {
    return <DdysGrid items={asItems(payload)} display={display} siteBaseUrl={siteBaseUrl} />;
  }
  return <div className="ddys-rr-empty">Unsupported DDYS view.</div>;
}

function asItems(payload: unknown): DdysItem[] {
  if (Array.isArray(payload)) return payload as DdysItem[];
  if (payload && typeof payload === 'object') {
    const maybe = payload as DdysApiResponse | { data?: unknown; payload?: unknown };
    if (Array.isArray(maybe.data)) return maybe.data as DdysItem[];
    if (maybe.data && typeof maybe.data === 'object' && Array.isArray((maybe.data as { data?: unknown }).data)) return (maybe.data as { data: DdysItem[] }).data;
    if (Array.isArray(maybe.payload)) return maybe.payload as DdysItem[];
    if (maybe.payload && typeof maybe.payload === 'object') return asItems(maybe.payload);
    return Object.entries(maybe as Record<string, unknown>).map(([code, value]) => {
      if (value && typeof value === 'object') return { code, ...(value as Record<string, unknown>) } as DdysItem;
      return { code, title: String(value) } as DdysItem;
    });
  }
  return [];
}
