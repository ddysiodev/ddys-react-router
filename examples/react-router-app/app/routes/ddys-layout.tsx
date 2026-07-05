import { Outlet } from 'react-router';

export default function DdysLayout() {
  return (
    <main style={{ margin: '0 auto', maxWidth: 1120, padding: 24 }}>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {['/ddys', '/ddys/latest', '/ddys/hot', '/ddys/movies', '/ddys/search', '/ddys/calendar', '/ddys/collections', '/ddys/shares', '/ddys/types', '/ddys/genres', '/ddys/regions', '/ddys/request', '/ddys/diagnostics'].map((href) => <a href={href} key={href}>{href.replace('/ddys', '') || 'home'}</a>)}
      </nav>
      <Outlet />
    </main>
  );
}
