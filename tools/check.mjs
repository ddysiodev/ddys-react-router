import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];

const requiredFiles = [
  'README.md','README.zh-CN.md','LICENSE','.gitignore','.env.example','react-router.config.example.ts','package.json','tsconfig.json',
  'src/index.ts','src/types/ddys.ts','src/utils/security.ts','src/client/client.ts','src/client/config.ts','src/client/error.ts','src/client/index.ts',
  'src/server/cache.ts','src/server/client.ts','src/server/config.ts','src/server/request-service.ts','src/server/index.ts',
  'src/loaders/index.ts','src/actions/index.ts',
  'src/resource-routes/index.ts','src/resource-routes/proxy.ts','src/resource-routes/request.ts','src/resource-routes/diagnostics.ts','src/resource-routes/revalidate.ts','src/resource-routes/seo.ts',
  'src/seo/index.ts',
  'src/components/card.tsx','src/components/diagnostics.tsx','src/components/grid.tsx','src/components/list.tsx','src/components/movie-detail.tsx','src/components/request-form.tsx','src/components/search.tsx','src/components/sources.tsx','src/components/utils.ts','src/components/view.tsx','src/components/client.ts','src/components/index.ts','src/styles/ddys.css',
  'public/images/icon-16.png','public/images/icon-32.png','public/images/icon-192.png','public/images/icon-512.png','public/images/logo.png',
  'examples/react-router-app/package.json','examples/react-router-app/.npmignore','examples/react-router-app/vite.config.ts','examples/react-router-app/react-router.config.ts','examples/react-router-app/tsconfig.json','examples/react-router-app/app/entry.client.tsx','examples/react-router-app/app/entry.server.tsx','examples/react-router-app/app/root.tsx','examples/react-router-app/app/routes.ts',
  'tests/structure.test.mjs','tests/runtime.test.mjs','tools/build-package.ps1','tools/check.mjs'
];

const exampleRoutes = [
  'ddys.tsx','ddys.latest.tsx','ddys.hot.tsx','ddys.movies.tsx','ddys.search.tsx','ddys.calendar.tsx','ddys.collections.tsx','ddys.shares.tsx','ddys.types.tsx','ddys.genres.tsx','ddys.regions.tsx','ddys.request.tsx','ddys.diagnostics.tsx','ddys.movie.$slug.tsx','ddys.movie.$slug.sources.tsx',
  'api.ddys.proxy.ts','api.ddys.request.ts','api.ddys.diagnostics.ts','api.ddys.revalidate.ts','sitemap.xml.ts','robots.txt.ts','manifest.webmanifest.ts'
].map((file) => `examples/react-router-app/app/routes/${file}`);

const clientMethods = ['movies','latest','hot','search','suggest','calendar','movie','sources','related','comments','collections','collection','shares','share','requests','activities','user','types','genres','regions','me','createRequest','createComment','deleteComment','reportInvalidResource','follow','unfollow'];

for (const file of [...requiredFiles, ...exampleRoutes]) await mustExist(file);
await checkEncoding();
await checkPackage();
await checkClient();
await checkServer();
await checkFrameworkEntries();
await checkComponents();
await checkExamples();
await checkAssets();
await checkDocs();
await checkBuildScript();
await checkForbiddenFiles();
await checkForbiddenText();

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, files: (await listFiles(root)).length, examples: exampleRoutes.length, clientMethods: clientMethods.length }, null, 2));

async function checkPackage() {
  const pkg = JSON.parse(await read('package.json'));
  assert(pkg.name === 'ddys-react-router', 'package name mismatch.');
  assert(pkg.version === '0.1.1', 'package version mismatch.');
  assert(pkg.peerDependencies?.['react-router'] && pkg.peerDependencies?.react && pkg.peerDependencies?.['react-dom'], 'package must declare React Router and React peer dependencies.');
  assert(pkg.devDependencies?.tsx && pkg.scripts?.test?.includes('--import tsx'), 'runtime tests must use tsx for TS source imports.');
  for (const key of ['./server','./loaders','./actions','./resource-routes','./seo','./components','./components/client','./styles.css']) assert(pkg.exports?.[key], `missing export ${key}.`);
  assert(!pkg.dependencies?.['server-only'] && !pkg.peerDependencies?.next, 'package must not depend on Next.js or server-only.');
  assert((await read('src/client/config.ts')).includes(`DDYS_REACT_ROUTER_VERSION = '${pkg.version}'`), 'runtime version must match package.json.');
  assert((await read('tools/build-package.ps1')).includes(`$Version = "${pkg.version}"`), 'build-package default version must match package.json.');
  const exampleIgnore = await read('examples/react-router-app/.npmignore');
  for (const fragment of ['node_modules', '.react-router', 'pnpm-lock.yaml', '*.tgz', '*.zip']) assert(exampleIgnore.includes(fragment), `example npmignore missing ${fragment}.`);
}

async function checkClient() {
  const client = await read('src/client/client.ts');
  for (const method of clientMethods) assert(client.includes(`${method}(`), `DdysClient missing ${method}.`);
  for (const fragment of ['sendWithRetry', "method !== 'GET'", 'Authorization', 'Bearer', "typeof window === 'undefined'", 'clearTimeout', 'routeSegment', 'positiveId', 'allowRoutes', 'noCache']) assert(client.includes(fragment), `DdysClient missing ${fragment}.`);
  const security = await read('src/utils/security.ts');
  for (const fragment of ['normalizeBaseUrl', 'normalizeRoutePrefix', 'buildQuery', 'safeMediaUrl', 'isAllowedResourceUrl', 'formDataToObject', 'requestToObject', 'cleanRuntimeQuery']) assert(security.includes(fragment), `security utils missing ${fragment}.`);
}

async function checkServer() {
  const config = await read('src/server/config.ts');
  assert(config.includes('setDdysReactRouterOptions') && config.includes('safeDdysConfig') && config.includes('getDdysConfig'), 'server config exports missing.');
  const request = await read('src/server/request-service.ts');
  for (const fragment of ['createRequestFormToken', 'verifyRequestFormToken', 'hexEncode', 'hexDecode', 'subject !== identity', 'enforceRateLimit', 'normalizeRequestInput', 'honeypot', 'DDYS request form is disabled']) assert(request.includes(fragment), `request service missing ${fragment}.`);
  const cache = await read('src/server/cache.ts');
  for (const fragment of ['cachedDdys', 'revalidateDdysCache', 'ddysCacheStats', 'ttlForRoute', 'tagsForRoute']) assert(cache.includes(fragment), `cache helper missing ${fragment}.`);
}

async function checkFrameworkEntries() {
  const loaders = await read('src/loaders/index.ts');
  for (const fragment of ['loadDdysView', 'loadDdysMovie', 'loadDdysSources', 'loadDdysRequestForm', 'loadDdysDiagnostics', 'dispatchView']) assert(loaders.includes(fragment), `loaders missing ${fragment}.`);
  const actions = await read('src/actions/index.ts');
  assert(actions.includes('createDdysRequestAction') && actions.includes('ddysRequestAction') && actions.includes('submitDdysRequest'), 'actions entry missing request action.');
  for (const file of ['proxy','request','diagnostics','revalidate','seo']) {
    const text = await read(`src/resource-routes/${file}.ts`);
    assert(text.includes('Response'), `resource route ${file} must return Response.`);
  }
  const revalidate = await read('src/resource-routes/revalidate.ts');
  assert(revalidate.includes('!config.revalidateToken') && revalidate.includes('x-ddys-revalidate-token') && revalidate.includes('revalidateDdysCache'), 'revalidate resource route must require token and clear cache.');
  const seo = await read('src/seo/index.ts');
  for (const fragment of ['createDdysSeo', 'createDdysMovieSeo', 'createDdysMovieJsonLd', 'createDdysSitemap', 'createDdysRobotsText', 'createDdysManifest']) assert(seo.includes(fragment), `seo helper missing ${fragment}.`);
}

async function checkComponents() {
  const components = await read('src/components/index.ts');
  for (const name of ['DdysCard','DdysGrid','DdysList','DdysMovieDetail','DdysSources','DdysSearch','DdysRequestForm','DdysDiagnostics','DdysView']) assert(components.includes(name), `components index missing ${name}.`);
  const client = await read('src/components/client.ts');
  assert(client.includes('DdysRequestForm') && client.includes('DdysSearch') && client.includes('DdysDiagnostics'), 'client components entry incomplete.');
  const view = await read('src/components/view.tsx');
  assert(view.includes('payload') && view.includes('DdysList') && view.includes('DdysGrid') && view.includes('DdysMovieDetail'), 'DdysView must render loader data.');
  const css = await read('src/styles/ddys.css');
  assert(css.includes('ddys-rr-items') && css.includes('ddys-rr-request-form') && css.includes('ddys-rr-list') && css.includes('@media') && css.includes('prefers-color-scheme'), 'CSS must include React Router class names and responsive styles.');
}

async function checkExamples() {
  const routes = await read('examples/react-router-app/app/routes.ts');
  for (const fragment of ['@react-router/dev/routes', "route('ddys'", "route('api/ddys/proxy'", "route('sitemap.xml'"]) assert(routes.includes(fragment), `routes.ts missing ${fragment}.`);
  assert((await read('examples/react-router-app/vite.config.ts')).includes('reactRouter()'), 'example vite config must use reactRouter plugin.');
  assert((await read('examples/react-router-app/tsconfig.json')).includes('"rootDirs"'), 'example tsconfig must include rootDirs for generated React Router types.');
  const examplePkg = JSON.parse(await read('examples/react-router-app/package.json'));
  assert(examplePkg.dependencies?.['@react-router/node'] && examplePkg.dependencies?.['@react-router/serve'] && examplePkg.scripts?.start?.includes('react-router-serve'), 'example package must keep server runtime dependencies and a production start script.');
  const serverEntry = await read('examples/react-router-app/app/entry.server.tsx');
  assert(serverEntry.includes('ServerRouter') && serverEntry.includes('renderToPipeableStream') && serverEntry.includes('createReadableStreamFromReadable'), 'example server entry must use React Router Node SSR streaming.');
  assert((await read('examples/react-router-app/app/entry.client.tsx')).includes('HydratedRouter'), 'example client entry must hydrate React Router.');
  assert(examplePkg.dependencies?.isbot, 'example package must include isbot for the default server entry.');
  for (const file of exampleRoutes) assert((await read(file)).includes('ddys-react-router'), `${file} must import ddys-react-router.`);
  assert((await read('examples/react-router-app/app/root.tsx')).includes('ddys-react-router/styles.css'), 'root must import package styles.');
  assert((await read('examples/react-router-app/app/routes/ddys.search.tsx')).includes('DdysSearch'), 'search route must include interactive search component.');
  assert((await read('examples/react-router-app/app/routes/ddys.request.tsx')).includes('DdysRequestForm'), 'request route must include request form.');
}

async function checkAssets() {
  for (const [rel, size] of Object.entries({'public/images/icon-16.png':[16,16],'public/images/icon-32.png':[32,32],'public/images/icon-192.png':[192,192],'public/images/icon-512.png':[512,512],'public/images/logo.png':[512,512]})) {
    const actual = await pngSize(rel);
    assert(actual[0] === size[0] && actual[1] === size[1], `${rel} must be ${size[0]}x${size[1]}.`);
  }
}

async function checkDocs() {
  const en = await read('README.md');
  const zh = await read('README.zh-CN.md');
  assert(en.includes('[中文](README.zh-CN.md)') && zh.includes('[English](README.md)'), 'READMEs must link to each other.');
  for (const fragment of ['ddys-react-router', 'React Router', 'Framework Mode', 'loader', 'action', 'resource-routes', 'DDYS_API_KEY', 'DdysView', 'DdysRequestForm', 'createDdysSitemap']) assert(en.includes(fragment) && zh.includes(fragment), `READMEs missing ${fragment}.`);
}

async function checkBuildScript() {
  const script = await read('tools/build-package.ps1');
  assert(script.includes('ddys-react-router-v{0}.zip') && script.includes('StartsWith($resolvedRoot') && script.includes('ZipFileExtensions') && script.includes('Replace("\\", "/")'), 'build-package.ps1 must safely create portable release zip.');
}

async function checkForbiddenFiles() {
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    assert(rel === '.env.example' || !/(^|\/)(\.env|\.env\..*|node_modules|\.react-router|build|coverage|dist|package)(\/|$)/.test(rel), `forbidden path: ${rel}`);
    assert(rel !== 'pnpm-lock.yaml', 'pnpm-lock.yaml must not remain.');
    assert(!/\.(log|bak|tmp|cache|tgz|zip)$/i.test(rel), `forbidden file: ${rel}`);
  }
}

async function checkForbiddenText() {
  const patterns = ['ddys-nextjs', 'ddys-next', 'next.config', 'server-only', 'next/cache', 'next/server', 'ghp_', 'github_pat_', 'npm_', '\uFFFD'];
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    if (!isTextFile(rel) || rel === 'tools/check.mjs') continue;
    const text = await fs.readFile(full, 'utf8');
    for (const pattern of patterns) assert(!text.includes(pattern), `${rel} contains forbidden text pattern ${pattern}.`);
  }
}

async function checkEncoding() {
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    if (!isTextFile(rel)) continue;
    const buffer = await fs.readFile(full);
    assert(!(buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf), `${rel} has BOM.`);
    assert(!buffer.toString('utf8').includes('\uFFFD'), `${rel} has replacement char.`);
  }
}

async function mustExist(rel) { try { await fs.stat(path.join(root, rel)); } catch { failures.push(`Missing required file: ${rel}`); } }
async function read(rel) { return fs.readFile(path.join(root, rel), 'utf8'); }
async function listFiles(dir) { const entries = await fs.readdir(dir, { withFileTypes: true }); const out = []; for (const entry of entries) { if (['.git','dist','node_modules','.react-router','build','coverage','package'].includes(entry.name) || entry.name === 'pnpm-lock.yaml') continue; const full = path.join(dir, entry.name); if (entry.isDirectory()) out.push(...await listFiles(full)); else out.push(full); } return out; }
async function pngSize(rel) { const buffer = await fs.readFile(path.join(root, rel)); assert(buffer.readUInt32BE(0) === 0x89504e47, `${rel} is not PNG.`); return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]; }
function isTextFile(rel) { return /\.(ts|tsx|js|mjs|json|css|md|txt|ps1)$/i.test(rel) || rel === '.gitignore' || rel === 'LICENSE' || rel === '.env.example' || rel === '.npmignore'; }
function slash(value) { return value.replace(/\\/g, '/'); }
function assert(condition, message) { if (!condition) failures.push(message); }
