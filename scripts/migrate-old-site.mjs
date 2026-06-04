import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const baseUrl = 'http://kololec.svet-stranek.cz';
const archiveDir = 'assets/archive';
const decoder = new TextDecoder('iso-8859-2');

const pages = [
  ['Úvod starého webu', '/uvodni-stranka/'],
  ['Kololeč současná - akce a události ze života obce', '/nova-stranka-106149/'],
  ['Aktivity roku 2019', '/nova-stranka-280072/'],
  ['Z činnosti osadního výboru Kololeč', '/nova-stranka-100127/'],
  ['Foto z akcí a události ze života obce', '/nova-stranka-119338/'],
  ['Akce s Nadací VIA', '/nova-stranka-100141/'],
  ['Spolupráce s Nadací VIA', '/nova-stranka-101533/'],
  ['Historie Kololeče', '/nova-stranka-106148/'],
  ['Historické fotografie', '/nova-stranka-99942/'],
  ['Videogalerie', '/nova-stranka-104087/'],
  ['Kontakty', '/nova-stranka-100171/'],
  ['Kololečské dobroty', '/nova-stranka-100129/'],
  ['Kololeč v Kosovu', '/nova-stranka-101439/'],
  ['Videa z Kololeče v Kosovu', '/nova-stranka-201153/'],
  ['Foto z Kololeče v Kosovu', '/nova-stranka-201156/'],
];

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const fetchText = async (path) => {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status}`);
  return decoder.decode(await response.arrayBuffer());
};

const fetchAsset = async (url, outputPath) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
};

const extractContent = (html) => {
  const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1]?.trim();
  const contentStart = html.indexOf('<div class="uvodnik"');
  const fallbackStart = html.indexOf('<div class="formated-text"');
  const start = contentStart >= 0 ? contentStart : fallbackStart;
  const endMarkers = [
    '<script type="text/javascript">function fblike',
    '<div class="l">',
    '<ul class="menu">',
  ];
  const end = endMarkers
    .map((marker) => html.indexOf(marker, start))
    .filter((index) => index > start)
    .sort((a, b) => a - b)[0];

  return {
    title: h2 || '',
    html: start >= 0 && end ? html.slice(start, end).trim() : '',
  };
};

const cleanContent = async (html, pageSlug, assetMap) => {
  let content = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<fb:[\s\S]*?<\/fb:[^>]+>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div class="uvodnik">\s*<span class="uvodnik-in">([\s\S]*?)<\/span>\s*<\/div>/gi, '<p class="archive-note">$1</p>')
    .replace(/\s(class|rel|onclick|style)="[^"]*"/gi, '')
    .replace(/\s(align|valign|border|cellpadding|cellspacing)="[^"]*"/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '')
    .replace(/<o:p><\/o:p>/gi, '')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    .replace(/<(p|table|tbody|thead|tr|td|th|ul|ol|li|strong|em|b|i|u|hr|br)\b[^>]*>/gi, '<$1>')
    .replace(/<br\s*\/?>\s*<br\s*\/?>\s*<br\s*\/?>/gi, '<br><br>');

  const imageMatches = [...content.matchAll(/(?:href|src)="(\/img\/obrazky\/[^"]+)"/g)];
  for (const [, sourcePath] of imageMatches) {
    if (!assetMap.has(sourcePath)) {
      const cleanSourcePath = sourcePath.split('?')[0];
      const extension = extname(cleanSourcePath) || '.jpg';
      const fileName = `${pageSlug}-${assetMap.size + 1}${extension}`;
      const localPath = join(archiveDir, fileName);
      await fetchAsset(`${baseUrl}${sourcePath}`, localPath);
      assetMap.set(sourcePath, localPath);
    }
    content = content.replaceAll(sourcePath, assetMap.get(sourcePath));
  }

  content = content
    .replace(/<p\s+style="[\s\S]*$/i, '')
    .replace(/<a href="(assets\/archive\/[^"]+)">/gi, '<a href="$1" target="_blank">')
    .replace(/<a href="(https?:\/\/[^"]+)">/gi, '<a href="$1" target="_blank" rel="noreferrer">')
    .replace(/\swidth="\d+"/gi, '')
    .replace(/\sheight="\d+"/gi, '');

  return content;
};

const renderArchive = (sections) => `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Archivní obsah starého webu osadního výboru Kololeč." />
    <meta name="theme-color" content="#31533a" />
    <title>Archiv osadního výboru Kololeč</title>
    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body class="archive-page">
    <a class="skip-link" href="#obsah">Přeskočit na obsah</a>

    <header class="site-header scrolled" id="nahoru">
      <div class="shell nav-wrap">
        <a class="brand" href="index.html" aria-label="Kololeč - úvodní stránka">
          <span class="brand-mark" aria-hidden="true">K</span>
          <span class="brand-copy">
            <strong>Kololeč</strong>
            <small>část města Třebenice</small>
          </span>
        </a>
        <nav class="main-nav archive-nav" aria-label="Hlavní navigace">
          <a href="index.html#o-obci">O obci</a>
          <a href="index.html#historie">Historie</a>
          <a href="index.html#mapa">Mapa</a>
          <a href="#obsah">Archiv OVK</a>
        </nav>
      </div>
    </header>

    <main id="obsah">
      <section class="archive-hero">
        <div class="shell">
          <p class="section-kicker">Archiv osadního výboru</p>
          <h1>Starý web Kololeče</h1>
          <p>Obsah převedený ze starého webu osadního výboru Kololeč. Stránka slouží jako archiv textů, fotografií, událostí a odkazů, které byly na původním webu dostupné.</p>
        </div>
      </section>

      <section class="archive-index section">
        <div class="shell archive-index-grid">
          ${sections.map((section) => `<a href="#${section.id}">${section.title}</a>`).join('\n          ')}
        </div>
      </section>

      <section class="archive-content section">
        <div class="shell archive-stack">
          ${sections.map((section) => `<article class="archive-entry" id="${section.id}">
            <p class="section-kicker">Archiv</p>
            <h2>${section.title}</h2>
            <div class="archive-source"><a href="${baseUrl}${section.path}" target="_blank" rel="noreferrer">Původní stránka</a></div>
            <div class="archive-body">
              ${section.html}
            </div>
          </article>`).join('\n\n          ')}
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="shell footer-grid">
        <div>
          <a class="brand footer-brand" href="index.html">
            <span class="brand-mark" aria-hidden="true">K</span>
            <span class="brand-copy"><strong>Kololeč</strong><small>část města Třebenice</small></span>
          </a>
          <p>Archivní obsah byl převeden ze starého webu osadního výboru Kololeč.</p>
        </div>
        <div class="footer-notes">
          <p>Zdroj: <a href="${baseUrl}/" target="_blank" rel="noreferrer">kololec.svet-stranek.cz</a>.</p>
        </div>
      </div>
    </footer>
  </body>
</html>
`;

await mkdir(archiveDir, { recursive: true });
await mkdir('.tmp-old-site', { recursive: true });

const assetMap = new Map();
const sections = [];

for (const [fallbackTitle, path] of pages) {
  const slug = slugify(fallbackTitle);
  const rawHtml = await fetchText(path);
  await writeFile(join('.tmp-old-site', `${slug}.html`), rawHtml);

  const extracted = extractContent(rawHtml);
  const html = await cleanContent(extracted.html, slug, assetMap);
  sections.push({
    id: slug,
    path,
    title: extracted.title || fallbackTitle,
    html,
  });
}

await writeFile('archive.html', renderArchive(sections));
console.log(`Generated archive.html with ${sections.length} sections and ${assetMap.size} archived images.`);
