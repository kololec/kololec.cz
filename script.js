const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

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

document.querySelectorAll('[data-scroll-top]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
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

const API_KEY = 'dDHxVzCn8Z61uQlo82IbXW9g6mOZZFErmJjebP-SyQ0';
const kololec = [50.4783, 13.9758];
const mapElement = document.querySelector('#kololec-map');

if (mapElement && window.L) {
  const map = L.map(mapElement).setView(kololec, 16);
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
  L.marker(kololec).addTo(map).bindPopup('Kololeč');
  L.control.layers(tileLayers).addTo(map);
}
