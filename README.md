# Kololeč — Astro web

Prezentační web vesnice Kololeč postavený v Astro. Hlavní stránka obsahuje informace o obci, okolí, mapu a převedené vybrané informace ze starého webu osadního výboru. Kompletní archiv je součástí nového webu jako Astro stránka a datový soubor, ne jako odkaz na původní web.

## Lokální spuštění

Nainstalujte závislosti a spusťte lokální náhled s live reloadem:

```bash
npm install
make preview
```

Nebo přímo přes npm:

```bash
npm run dev -- --host 127.0.0.1 --port 8080
```

Poté navštivte `http://localhost:8080`. Při úpravě souborů se stránka automaticky obnoví.

## Build

```bash
make build
```

Statický výstup vznikne v `dist/`.

## Mapa

Mapa používá Leaflet a dlaždice Mapy.com REST API. API klíč je nastavený přímo v `public/script.js`:

```js
const API_KEY = 'vas-api-klic';
```

## Nasazení

Na Netlify se používá `netlify.toml`: build příkaz je `npm run build` a publish adresář je `dist/`. Na jiném statickém hostingu nahrajte obsah `dist/`.

## Obsah a fotografie

Textové podklady vycházejí ze stránky Kololeč na české Wikipedii. Použité fotografie pořídil uživatel Gortyna a jsou dostupné na Wikimedia Commons pod licencí CC BY-SA 4.0. Obrázky byly pro web optimalizovány a zmenšeny. Předepsaná atribuce je uvedena v patičce stránky.

## Obsah webu

Stránka obsahuje také samostatnou sekci Historie s časovou osou vývoje kapličky a přehledem významných rodáků.
Součástí webu je také `/archive.html` s převedeným obsahem starého webu osadního výboru Kololeč.
