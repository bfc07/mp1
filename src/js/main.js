const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.reading-progress span');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('.page-section[data-nav]')];
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-links');

function setActiveNav(currentId) {
  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${currentId}`;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateScrollState() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('is-compact', scrollTop > 30);
  progressBar.style.width = `${scrollable > 0 ? Math.min((scrollTop / scrollable) * 100, 100) : 0}%`;

  const atBottom = window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 3;
  let currentId = sections[0].dataset.nav;
  if (atBottom) {
    currentId = sections[sections.length - 1].dataset.nav;
  } else {
    // Use a stable focal line inside the reading area instead of the very top
    // edge. This keeps the indicator aligned with the section users are
    // actually viewing, even while the header is resizing.
    const headerBottom = header.getBoundingClientRect().bottom;
    const marker = headerBottom + (window.innerHeight - headerBottom) * 0.28;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) currentId = section.dataset.nav;
    });
  }
  setActiveNav(currentId);
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) window.requestAnimationFrame(() => { updateScrollState(); ticking = false; });
  ticking = true;
});
window.addEventListener('resize', updateScrollState);
updateScrollState();

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  navMenu.classList.toggle('is-open', !open);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    if (link.classList.contains('nav-link')) setActiveNav(target.id);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const carouselTrack = document.querySelector('.carousel-track');
const slides = [...document.querySelectorAll('.project-slide')];
const currentSlideLabel = document.querySelector('.current-slide');
let currentSlide = 0;
function showSlide(nextIndex) {
  currentSlide = (nextIndex + slides.length) % slides.length;
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  currentSlideLabel.textContent = String(currentSlide + 1).padStart(2, '0');
  slides.forEach((slide, index) => {
    slide.classList.toggle('is-current', index === currentSlide);
    slide.setAttribute('aria-hidden', String(index !== currentSlide));
  });
}
document.querySelector('.carousel-prev').addEventListener('click', () => showSlide(currentSlide - 1));
document.querySelector('.carousel-next').addEventListener('click', () => showSlide(currentSlide + 1));

let touchStartX = 0;
const viewport = document.querySelector('.carousel-viewport');
viewport.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
viewport.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 55) showSlide(currentSlide + (distance < 0 ? 1 : -1));
}, { passive: true });

let lastFocusedElement = null;
function openModal(modal) {
  lastFocusedElement = document.activeElement;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close').focus();
}
function closeModal(modal) {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (lastFocusedElement) lastFocusedElement.focus();
}
document.querySelectorAll('.modal-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
  const modal = document.getElementById(trigger.dataset.modal);
  if (modal) openModal(modal);
}));
document.querySelectorAll('[data-close-modal]').forEach((control) => control.addEventListener('click', () => closeModal(control.closest('.modal'))));
document.addEventListener('keydown', (event) => {
  const open = document.querySelector('.modal.is-open');
  if (event.key === 'Escape' && open) closeModal(open);
  if (event.key === 'Tab' && open) {
    const focusable = [...open.querySelectorAll('button, a[href]')];
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

const observer = new IntersectionObserver((entries, revealObserver) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.getElementById('current-year').textContent = new Date().getFullYear();
