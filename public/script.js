const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
const solidHeader = header?.hasAttribute('data-solid-header') ?? false;

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle('scrolled', solidHeader || window.scrollY > 24);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('[data-scroll-top]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    menu?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const imagePattern = /\.(avif|gif|jpe?g|png|webp)(\?.*)?$/i;
const lightboxKeys = [];
const lightboxItems = [];
const getLightboxGroup = (element) => {
  const section = element.closest('.archive-entry[id], section[id], article[id], main[id]');
  if (section?.id) return section.id;
  return window.location.pathname;
};
const registerLightboxItem = ({ trigger, src, caption, group }) => {
  const key = `${group}:${src}`;
  if (!src || lightboxKeys.includes(key)) return;
  lightboxKeys.push(key);
  lightboxItems.push({ trigger, src, caption, group });
};

document.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || !imagePattern.test(href)) return;

  const image = link.querySelector('img');
  if (!image) return;

  registerLightboxItem({
    trigger: link,
    src: link.href,
    caption: image.alt || link.title || link.querySelector('span')?.textContent?.trim() || '',
    group: getLightboxGroup(link),
  });
});

document.querySelectorAll('.archive-body img, .post-shell .archive-body img').forEach((image) => {
  if (image.closest('a[href]')) return;

  registerLightboxItem({
    trigger: image,
    src: image.currentSrc || image.src,
    caption: image.alt || image.title || '',
    group: getLightboxGroup(image),
  });
});

if (lightboxItems.length) {
  let activeLightboxGroup = [];
  let activeLightboxIndex = 0;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Prohlížeč obrázků');
  lightbox.innerHTML = `
    <button class="lightbox-button lightbox-close" type="button" aria-label="Zavřít prohlížeč">×</button>
    <button class="lightbox-button lightbox-prev" type="button" aria-label="Předchozí obrázek">‹</button>
    <figure class="lightbox-figure">
      <img class="lightbox-image" alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-button lightbox-next" type="button" aria-label="Další obrázek">›</button>
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const prevButton = lightbox.querySelector('.lightbox-prev');
  const nextButton = lightbox.querySelector('.lightbox-next');

  const renderLightbox = () => {
    const item = activeLightboxGroup[activeLightboxIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.caption;
    lightboxCaption.textContent = item.caption;
    lightboxCaption.hidden = !item.caption;
    prevButton.disabled = activeLightboxGroup.length < 2;
    nextButton.disabled = activeLightboxGroup.length < 2;
  };

  const openLightbox = (item) => {
    activeLightboxGroup = lightboxItems.filter((candidate) => candidate.group === item.group);
    activeLightboxIndex = activeLightboxGroup.indexOf(item);
    renderLightbox();
    lightbox.classList.add('open');
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    activeLightboxGroup[activeLightboxIndex]?.trigger?.focus?.();
  };

  const moveLightbox = (direction) => {
    if (activeLightboxGroup.length < 2) return;
    activeLightboxIndex = (activeLightboxIndex + direction + activeLightboxGroup.length) % activeLightboxGroup.length;
    renderLightbox();
  };

  lightboxItems.forEach((item) => {
    item.trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox(item);
    });

    if (!item.trigger.matches('a, button, input, textarea, select')) {
      item.trigger.setAttribute('tabindex', '0');
      item.trigger.setAttribute('role', 'button');
      item.trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(item);
        }
      });
    }
  });

  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => moveLightbox(-1));
  nextButton.addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}

const API_KEY = 'dDHxVzCn8Z61uQlo82IbXW9g6mOZZFErmJjebP-SyQ0';
const kololecArea = [50.4747843, 13.9714202];
const mapElement = document.querySelector('#kololec-map');
const boundaryUrl = 'https://gis.nature.cz/arcgis/rest/services/Ruian/RuianGeocode/MapServer/3/query?f=geojson&where=KOD%3D769584&outFields=KOD%2CNAZEV&returnGeometry=true&outSR=4326';

if (mapElement && window.L) {
  const map = L.map(mapElement).setView(kololecArea, 15);
  const attribution = '<a href="https://api.mapy.com/copyright" target="_blank" rel="noreferrer">&copy; Seznam.cz a.s. a další</a>';
  const createTileLayer = (mapset) => L.tileLayer(`https://api.mapy.com/v1/maptiles/${mapset}/256/{z}/{x}/{y}?apikey=${API_KEY}&lang=cs`, {
    attribution,
    maxZoom: 19,
    minZoom: 0,
  });

  const tileLayers = {
    'Turistická': createTileLayer('outdoor'),
    'Základní': createTileLayer('basic'),
    'Letecká': createTileLayer('aerial'),
    'Zimní': createTileLayer('winter'),
  };

  tileLayers['Turistická'].addTo(map);
  L.control.layers(tileLayers).addTo(map);

  map.createPane('boundary');
  map.getPane('boundary').style.zIndex = 450;

  fetch(boundaryUrl)
    .then((response) => response.json())
    .then((boundary) => {
      const boundaryBase = L.geoJSON(boundary, {
        pane: 'boundary',
        style: {
          color: '#fff',
          fill: false,
          lineCap: 'round',
          lineJoin: 'round',
          opacity: 1,
          weight: 11,
        },
      }).addTo(map);

      L.geoJSON(boundary, {
        pane: 'boundary',
        style: {
          color: '#ef1515',
          fill: false,
          lineCap: 'round',
          lineJoin: 'round',
          opacity: 1,
          weight: 5,
        },
      }).addTo(map);

      map.fitBounds(boundaryBase.getBounds(), {
        maxZoom: 15,
        padding: [18, 18],
      });
    })
    .catch(() => {
      map.setView(kololecArea, 15);
    });
}
