//    ______________________________
//  / \                             \.
//  |   |  Hey, you found this!      |.
//   \_ |                            |.
//      |  Keep looking closely,     |.
//      |  curious eyes tend to find |.
//      |  more than they expect.    |.
//      |                            |.
//      |                   David    |.
//      |   _________________________|___
//      |  /                            /.
//      \_/dc__________________________/.

const SPECIAL_CHARS = ['A', 'V', '&', '<', '#', '²', '>', '~', '§', '%', '£', '€'];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// hovering a nav link scrambles its text
const EFFECT_TRIGGERS = '.nav_parent';
const EFFECT_TEXT = '.nav_item';

// WeakMap keyed by trigger element; value is the active timeouts array (used as identity token)
const effectState = new WeakMap();

document.addEventListener('mouseover', function(event) {
  const trigger = event.target.closest(EFFECT_TRIGGERS);
  if (trigger) startEffect(trigger);
});

document.addEventListener('mouseout', function(event) {
  const trigger = event.target.closest(EFFECT_TRIGGERS);
  if (!trigger) return;
  // Ignore mouseout when moving between children within the same trigger
  if (event.relatedTarget && trigger.contains(event.relatedTarget)) return;
  stopEffect(trigger);
});

function startEffect(element) {
  // Skip if an effect is already running on this element
  if (effectState.has(element)) return;

  const navItem = element.querySelector(EFFECT_TEXT);
  if (!navItem) return;

  // Snapshot the original text once; reuse it on subsequent hovers
  if (!navItem.dataset.originalText) {
    navItem.dataset.originalText = navItem.innerText;
  }
  const originalText = navItem.dataset.originalText;
  // capped so long names don't scramble for ages
  const numChanges = Math.min(Math.max(Math.floor(originalText.length / 2), 1), 6);
  const timeouts = [];

  effectState.set(element, timeouts);

  // Accumulate delays sequentially so set always fires before its matching revert
  let cumulativeDelay = 0;

  for (let i = 0; i < numChanges; i++) {
    const idx = Math.floor(Math.random() * originalText.length);
    const ch = SPECIAL_CHARS[Math.floor(Math.random() * SPECIAL_CHARS.length)];

    cumulativeDelay += getRandomDelay();
    const setAt = cumulativeDelay;
    cumulativeDelay += getRandomDelay();
    const revertAt = cumulativeDelay;

    timeouts.push(
      setTimeout(() => {
        // Bail out if this effect was cancelled and replaced
        if (effectState.get(element) !== timeouts) return;
        navItem.innerHTML = escapeHtml(originalText.slice(0, idx)) + '<span style="color:#30c992">' + escapeHtml(ch) + '</span>' + escapeHtml(originalText.slice(idx + 1));
      }, setAt),
      setTimeout(() => {
        if (effectState.get(element) !== timeouts) return;
        navItem.textContent = originalText;
      }, revertAt)
    );
  }

  // Final cleanup after all changes have played out
  timeouts.push(
    setTimeout(() => {
      if (effectState.get(element) !== timeouts) return;
      stopEffect(element);
    }, cumulativeDelay + 200)
  );
}

function stopEffect(element) {
  const timeouts = effectState.get(element);
  if (timeouts) {
    timeouts.forEach(clearTimeout);
    effectState.delete(element);
  }
  const navItem = element.querySelector(EFFECT_TEXT);
  if (navItem && navItem.dataset.originalText) {
    navItem.textContent = navItem.dataset.originalText;
  }
}

function getRandomDelay() {
  return Math.floor(Math.random() * 250) + 88;
}

(function () {
  const layer = document.getElementById('hex-bg');
  if (!layer) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FONT_SIZE = 14;
  const CELL_W = Math.round(FONT_SIZE * 2.2); // a byte and its trailing space, like a hex dump
  const CELL_H = Math.round(FONT_SIZE * 1.7);

  const BLOCK_COUNT = 5;        // blocks displayed at about the same time
  const BLOCK_DURATION = 2000;  // average ms a block remains on screen
  const STAGGER = 80;           // ms between two bytes of a block showing up
  const SCRAMBLE = reducedMotion ? 0 : 300; // ms a byte cycles through random values before settling, bytes only fade with reduced motion
  const FADE = 50;             // ms to fade a byte out
  const FLICKER = 300;          // average ms between two value changes of a settled byte, 0 to disable
  const MARGIN = 16;            // px of empty space kept between a block and the page content

  // blocks only show up in empty space, never over these
  const CONTENT = 'header, footer, nav, article, li, p, h1, h2, h3, h4, h5, h6, a, button, ' +
    'img, svg, figure, pre, table, blockquote, form, input, iframe, video, .authorbox_bio';

  // X is a byte, . an empty slot
  const SHAPES = [
    ['X'],
    ['XX'],
    ['XXX'],
    ['X', 'X'],
    ['XX', 'X.'],
    ['XX', '.X'],
    ['X.', 'XX'],
    ['.X', 'XX']
  ].map(function (lines) {
    const offsets = [];
    lines.forEach(function (line, r) {
      line.split('').forEach(function (ch, c) {
        if (ch === 'X') offsets.push([r, c]);
      });
    });
    return offsets;
  });

  const blocks = [];

  function hexPair() {
    return Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }

  function isFree(x, y) {
    const el = document.elementFromPoint(x, y);
    return el !== null && !el.closest(CONTENT);
  }

  function fits(r, c) {
    // keep blocks apart so their shapes stay readable
    const crowded = blocks.some(function (b) {
      return b.cells.some(function (cell) {
        return Math.abs(cell.r - r) <= 2 && Math.abs(cell.c - c) <= 2;
      });
    });
    if (crowded) return false;
    const x = c * CELL_W - window.scrollX;
    const y = r * CELL_H - window.scrollY;
    const xs = [x - MARGIN, x + CELL_W / 2, x + CELL_W + MARGIN];
    const ys = [y - MARGIN, y + CELL_H / 2, y + CELL_H + MARGIN];
    return xs.every(function (px) {
      return ys.every(function (py) { return isFree(px, py); });
    });
  }

  function idle(now, wait) {
    return { cells: [], end: now + wait };
  }

  function spawn(now) {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const top = Math.ceil(window.scrollY / CELL_H);
    const rows = Math.max(1, Math.floor(window.innerHeight / CELL_H) - 2);
    const cols = Math.max(1, Math.floor(document.documentElement.clientWidth / CELL_W) - 3);
    for (let attempt = 0; attempt < 20; attempt++) {
      const r = top + Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const cells = shape.map(function (o) { return { r: r + o[0], c: c + o[1] }; });
      if (cells.every(function (cell) { return fits(cell.r, cell.c); })) return show(cells, now);
    }
    // no room in view right now, try again a bit later
    return idle(now, Math.random() * BLOCK_DURATION / 2);
  }

  function show(cells, now) {
    const life = BLOCK_DURATION * (0.8 + Math.random() * 0.4);
    cells.forEach(function (cell) {
      cell.el = document.createElement('span');
      cell.el.className = 'hex';
      cell.el.textContent = hexPair();
      cell.el.style.left = cell.c * CELL_W + 'px';
      cell.el.style.top = cell.r * CELL_H + 'px';
      cell.step = 0;
      cell.changed = 0;
      cell.next = SCRAMBLE + Math.random() * FLICKER;
      layer.appendChild(cell.el);
    });
    return { cells: cells, start: now, life: life, end: now + life + (cells.length - 1) * STAGGER };
  }

  // a byte scrambles in its hot state, cools down, then fades out while its value keeps changing
  function update(cell, age, life) {
    if (age < 0) return;
    if (age >= life - FADE) {
      if (cell.step < 3) cell.el.className = 'hex';
      cell.step = 3;
    } else if (age >= SCRAMBLE) {
      if (cell.step < 2) cell.el.className = 'hex on';
      cell.step = 2;
    } else {
      if (cell.step < 1) cell.el.className = 'hex on hot';
      cell.step = 1;
      if (age - cell.changed >= 60) {
        cell.el.textContent = hexPair();
        cell.changed = age;
      }
    }
    if (FLICKER && cell.step > 1 && age >= cell.next) {
      cell.el.textContent = hexPair();
      cell.next = age + FLICKER * (0.5 + Math.random());
    }
  }

  function frame(now) {
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (now >= b.end) {
        b.cells.forEach(function (cell) { cell.el.remove(); });
        blocks[i] = idle(now, 0); // free the spot for the next block
        // a long overdue block means the tab was hidden, re-stagger instead of spawning all at once
        blocks[i] = now - b.end > BLOCK_DURATION ? idle(now, Math.random() * BLOCK_DURATION) : spawn(now);
        // new bytes render hidden for one frame so their fade in is animated
        continue;
      }
      b.cells.forEach(function (cell, j) { update(cell, now - b.start - j * STAGGER, b.life); });
    }
    requestAnimationFrame(frame);
  }

  layer.style.fontSize = FONT_SIZE + 'px';
  layer.style.setProperty('--hex-fade', FADE + 'ms');
  // stagger the first blocks so they don't all show up together, the first one right away
  const now = performance.now();
  for (let i = 0; i < BLOCK_COUNT; i++) {
    blocks.push(idle(now, i * 150 + Math.random() * 150));
  }
  requestAnimationFrame(frame);
})();

// projects page: fills the cards with live GitHub stats
(function () {
  const cards = document.querySelectorAll('.project[data-repo]');
  if (!cards.length) return;

  const CACHE_TTL = 60 * 60 * 1000; // the API allows 60 unauthenticated requests per hour
  const MAX_TAGS = 4;
  // github linguist colors for the languages these repositories are likely to use
  const LANG_COLORS = {
    'CSS': '#663399', 'Go': '#00add8', 'HTML': '#e34c26', 'JavaScript': '#f1e05a',
    'Jsonnet': '#0064bd', 'Mustache': '#724b3b', 'Python': '#3572a5', 'Shell': '#89e051',
    'TypeScript': '#3178c6', 'Vim Script': '#199f4b', 'HCL': '#844fba', 'Lua': '#000080'
  };
  const ICONS = {
    star: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M8 .25a.75.75 0 0 1 .67.42l1.88 3.8 4.2.6a.75.75 0 0 1 .41 1.28l-3.04 2.97.72 4.18a.75.75 0 0 1-1.09.79L8 12.33l-3.75 1.96a.75.75 0 0 1-1.09-.79l.72-4.18L.84 6.35a.75.75 0 0 1 .41-1.28l4.2-.6L7.33.67A.75.75 0 0 1 8 .25Z"/></svg>',
    fork: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M5 5.37v.88c0 .41.34.75.75.75h4.5c.41 0 .75-.34.75-.75v-.88a2.25 2.25 0 1 1 1.5 0v.88A2.25 2.25 0 0 1 10.25 8.5h-1.5v2.13a2.25 2.25 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.88a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>',
    clock: '<svg viewBox="0 0 16 16" width="13" height="13"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.99l2.03 2.03a.75.75 0 0 1-1.06 1.06L7.22 8.53A.75.75 0 0 1 7 8V4.75a.75.75 0 0 1 1.5 0Z"/></svg>'
  };

  let siteTags = {};
  try {
    siteTags = JSON.parse(document.getElementById('project-tags').textContent);
  } catch (e) { /* cards just won't link to the blog tags */ }

  const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  function timeAgo(date) {
    const seconds = (date.getTime() - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (let i = 0; i < units.length; i++) {
      if (Math.abs(seconds) >= units[i][1]) return relative.format(Math.round(seconds / units[i][1]), units[i][0]);
    }
    return 'just now';
  }

  function readCache(repo) {
    try {
      return JSON.parse(localStorage.getItem('gh:' + repo));
    } catch (e) {
      return null;
    }
  }

  function load(repo) {
    const cached = readCache(repo);
    if (cached && Date.now() - cached.at < CACHE_TTL) return Promise.resolve(cached.data);
    return fetch('https://api.github.com/repos/' + repo, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(function (json) {
        const data = {
          stars: json.stargazers_count, forks: json.forks_count, language: json.language,
          pushed: json.pushed_at, topics: json.topics || [], archived: json.archived
        };
        try {
          localStorage.setItem('gh:' + repo, JSON.stringify({ at: Date.now(), data: data }));
        } catch (e) { /* storage full or disabled */ }
        return data;
      })
      // rate limited or offline, stale stats are better than none
      .catch(function (err) {
        if (cached) return cached.data;
        throw err;
      });
  }

  function stat(list, icon, text, title) {
    const li = document.createElement('li');
    if (title) li.title = title;
    if (icon) li.insertAdjacentHTML('beforeend', icon);
    li.appendChild(document.createTextNode(text));
    list.appendChild(li);
    return li;
  }

  function render(card, data) {
    const list = card.querySelector('.project_stats');
    if (data.language) {
      const li = stat(list, '', data.language);
      const dot = document.createElement('span');
      dot.className = 'project_lang';
      if (LANG_COLORS[data.language]) dot.style.setProperty('--lang', LANG_COLORS[data.language]);
      li.prepend(dot);
    }
    stat(list, ICONS.star, compact.format(data.stars), data.stars.toLocaleString('en') + ' stars');
    stat(list, ICONS.fork, compact.format(data.forks), data.forks.toLocaleString('en') + ' forks');
    if (data.pushed) {
      const pushed = new Date(data.pushed);
      stat(list, ICONS.clock, 'updated ' + timeAgo(pushed), pushed.toLocaleDateString('en', { dateStyle: 'long' }));
    }
    if (data.archived) stat(list, '', 'archived').className = 'project_archived';

    // topics the blog also writes about link to their tag page
    const tags = card.querySelector('.project_tags');
    data.topics.filter(function (topic) { return siteTags[topic]; }).slice(0, MAX_TAGS).forEach(function (topic) {
      const a = document.createElement('a');
      a.className = 'post_tag button button_translucent project_tag';
      a.href = siteTags[topic];
      a.title = 'Articles about ' + topic;
      a.textContent = topic;
      tags.appendChild(a);
    });
  }

  cards.forEach(function (card) {
    load(card.dataset.repo).then(function (data) { render(card, data); }).catch(function () {
      // no stats to show, drop the empty row
      card.querySelector('.project_stats').remove();
    });
  });
})();
