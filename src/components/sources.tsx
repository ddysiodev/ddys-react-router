import type { DdysResource } from '../types/ddys';
import { resourceParts } from './utils';

export interface DdysSourcesProps {
  sources?: unknown;
  groups?: Record<string, DdysResource[]>;
  display?: unknown;
  allowedProtocols?: string[];
}

export function DdysSources({ groups, sources, allowedProtocols = ['http:', 'https:', 'magnet:', 'ed2k:', 'thunder:'] }: DdysSourcesProps) {
  const normalized = groups ?? normalizeSources(sources);
  return (
    <div className="ddys-rr-sources">
      {Object.entries(normalized).map(([name, resources]) => (
        <section className="ddys-rr-source-group" key={name}>
          <h3>{name}</h3>
          {resources.map((resource, index) => {
            const links = resourceParts(resource, allowedProtocols);
            return (
              <p className="ddys-rr-resource" key={index}>
                {links.length ? links.map((link) => <a href={link.href} target="_blank" rel="noopener noreferrer" key={link.href}>{link.label}</a>) : 'Resource'}
              </p>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function normalizeSources(input: unknown): Record<string, DdysResource[]> {
  if (Array.isArray(input)) return { Sources: input as DdysResource[] };
  if (input && typeof input === 'object') {
    const value = input as { data?: unknown; sources?: unknown };
    if (Array.isArray(value.data)) return { Sources: value.data as DdysResource[] };
    if (Array.isArray(value.sources)) return { Sources: value.sources as DdysResource[] };
    const out: Record<string, DdysResource[]> = {};
    for (const [key, group] of Object.entries(input as Record<string, unknown>)) {
      if (Array.isArray(group)) out[key] = group as DdysResource[];
    }
    if (Object.keys(out).length) return out;
  }
  return {};
}
