import { createReadStream, watch } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const port = Number.parseInt(process.env.PORT || '8080', 10);
const clients = new Set();
let reloadTimer;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const reloadSnippet = `
<script>
(() => {
  const events = new EventSource('/__live-reload');
  events.addEventListener('reload', () => location.reload());
})();
</script>`;

const isInsideRoot = (filePath) => {
  const path = relative(root, filePath);
  return path === '' || (!path.startsWith('..') && !path.startsWith(`${sep}`));
};

const sendReload = () => {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const response of clients) {
      response.write('event: reload\ndata: now\n\n');
    }
  }, 80);
};

const serveHtml = async (filePath, response) => {
  const html = await readFile(filePath, 'utf8');
  const body = html.includes('</body>')
    ? html.replace('</body>', `${reloadSnippet}\n  </body>`)
    : `${html}${reloadSnippet}`;

  response.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': mimeTypes['.html'],
  });
  response.end(body);
};

const serveFile = async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === '/__live-reload') {
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/event-stream',
    });
    response.write('event: ready\ndata: connected\n\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let filePath = resolve(root, `.${safePath}`);

  if (!isInsideRoot(filePath)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  const fileStat = await stat(filePath).catch(() => undefined);
  if (fileStat?.isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  const finalStat = await stat(filePath).catch(() => undefined);
  if (!finalStat?.isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  if (extname(filePath) === '.html') {
    await serveHtml(filePath, response);
    return;
  }

  response.writeHead(200, {
    'Content-Length': finalStat.size,
    'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
};

const watchDirectory = async (directory) => {
  watch(directory, { persistent: true }, (_event, filename) => {
    if (!filename || filename.startsWith('.')) return;
    sendReload();
  });

  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .map((entry) => watchDirectory(join(directory, entry.name))));
};

await watchDirectory(root);

createServer((request, response) => {
  serveFile(request, response).catch((error) => {
    console.error(error);
    response.writeHead(500);
    response.end('Internal server error');
  });
}).listen(port, () => {
  console.log(`Serving Kololeč preview at http://localhost:${port}`);
  console.log('Live reload is enabled. Press Ctrl+C to stop.');
});
