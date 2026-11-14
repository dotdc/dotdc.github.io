// resume page enhancements: scroll spy, the side menu
// timeline and a few hex flavored animations. The page works without it.
(function () {
  const root = document.querySelector('.resume');
  if (!root) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HEX = '0123456789ABCDEF';

  root.querySelectorAll('[data-js]').forEach(function (el) { el.hidden = false; });

  root.querySelector('[data-action="print"]').addEventListener('click', function () { window.print(); });

  // scroll spy on the sections and roles
  const links = Array.from(root.querySelectorAll('.resume_toc a'));
  const sections = Array.from(root.querySelectorAll('[data-spy]'));
  let ticking = false;

  // side timeline: the fill runs from dot to dot, at the pace of the roles
  const track = root.querySelector('.resume_track');
  const trackLinks = track ? Array.from(track.querySelectorAll('a')) : [];
  const jobs = trackLinks.map(function (link) { return document.getElementById(link.hash.slice(1)); })
    .map(function (heading) { return heading && heading.closest('.job'); });

  function updateTrack(line) {
    if (track.offsetParent === null || !trackLinks.length) return;
    const centers = trackLinks.map(function (link) { return link.offsetTop + link.offsetHeight / 2; });
    let index = -1;
    let frac = 0;
    jobs.forEach(function (job, i) {
      if (!job) return;
      const rect = job.getBoundingClientRect();
      if (rect.top <= line) {
        index = i;
        frac = Math.min(1, (line - rect.top) / rect.height);
      }
    });
    let fill = 0;
    if (index >= 0) {
      const next = index + 1 < centers.length ? centers[index + 1] : centers[index];
      fill = centers[index] + frac * (next - centers[index]) - centers[0];
    }
    track.style.setProperty('--dot-y', centers[0].toFixed(1) + 'px');
    track.style.setProperty('--fill', fill.toFixed(1) + 'px');
    trackLinks.forEach(function (link, i) {
      link.classList.toggle('is-passed', i < index || (i === index && !link.classList.contains('is-active')));
    });
  }

  function onScroll() {
    ticking = false;
    const line = window.innerHeight * 0.3;
    let current = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    // the last sections are too short to ever reach the line: at the very
    // bottom of the page, highlight the last one so the menu stays coherent
    const doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) current = sections[sections.length - 1];
    links.forEach(function (link) {
      const on = !!current && link.hash === '#' + current.dataset.spy;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (track) updateTrack(line);
  }
  function requestScroll() {
    if (!ticking) requestAnimationFrame(onScroll);
    ticking = true;
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  onScroll();

  if (reducedMotion) return;

  // headings decode from hex, like the background blocks
  function decode(el) {
    const text = el.textContent;
    const duration = 25 * text.length + 250;
    let start = null;
    el.closest('h2').setAttribute('aria-label', text);
    function step(now) {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const settled = Math.floor(t * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        out += i < settled || text[i] === ' ' ? text[i] : HEX[Math.floor(Math.random() * 16)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // stats count up once
  root.querySelectorAll('[data-count]').forEach(function (el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 900;
    let start = null;
    function step(now) {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // reveal roles, cards and headings as they scroll in
  if (!('IntersectionObserver' in window)) return;
  root.classList.add('can-reveal');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      const heading = el.matches('.resume_h') ? el : null;
      if (heading) decode(heading);
      observer.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  root.querySelectorAll('.job, .resume_group, .resume_h').forEach(function (el) { observer.observe(el); });
})();
