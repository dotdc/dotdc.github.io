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

// a random byte, shared by the background blocks and the about page dump
function hexPair() {
  return Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
}

// base64 JSON to a value (atob alone mangles emoji), its text only ever used as textContent
function decodeNote(str) {
  const bytes = Uint8Array.from(atob(str), function (c) { return c.charCodeAt(0); });
  return JSON.parse(new TextDecoder().decode(bytes));
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
    'img, svg, figure, pre, table, blockquote, form, input, iframe, video, .authorbox_bio, .dump_card';

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

// about page: the hex dump scrambles in like the background blocks, then
// pointing at a byte lights up its character, and the other way around
(function () {
  const card = document.querySelector('.dump_card');
  if (!card) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STAGGER = 25;   // ms between two bytes showing up
  const SCRAMBLE = 300; // ms a byte cycles through random values before settling
  const NAMES = { 0: 'null (padding)', 0xdc: 'U+0700 ܀ 1/2', 0x80: 'U+0700 ܀ 2/2', 9: 'tab', 10: 'line feed', 13: 'carriage return', 32: 'space' };

  // bytes whose value in the status line is a link, and what clicking it does
  const LINKS = { 0xdc: hatch };

  const rows = card.querySelector('.dump_rows');
  const title = card.querySelector('.resume_panel_title');
  const status = card.querySelector('.dump_status');
  const idle = status.textContent;
  const original = { title: title.textContent, label: card.getAttribute('aria-label'), role: card.getAttribute('role') };

  // one entry per byte: its hex and character elements, and its real value
  const bytes = [];
  card.querySelectorAll('.dump_hex [data-i]').forEach(function (hex) {
    bytes[hex.dataset.i] = { hex: hex, value: hex.textContent };
  });
  card.querySelectorAll('.dump_ascii [data-i]').forEach(function (chr) {
    bytes[chr.dataset.i].chr = chr;
  });

  let active = -1;
  let mode = 'dump'; // or 'busy' while an animation swaps the content, or 'eee'

  function light(index, on) {
    if (index < 0) return;
    bytes[index].hex.classList.toggle('is-on', on);
    bytes[index].chr.classList.toggle('is-on', on);
  }

  // the status line works like the inspector of a hex editor
  function select(index) {
    if (index === active || mode !== 'dump') return;
    light(active, false);
    light(index, true);
    active = index;
    if (index < 0) {
      status.textContent = idle;
      return;
    }
    const code = parseInt(bytes[index].value, 16);
    const name = NAMES[code] || (code > 32 && code < 127 ? "'" + String.fromCharCode(code) + "'" : 'not printable');
    const value = '0x' + bytes[index].value;
    status.textContent = 'offset 0x' + index.toString(16).padStart(2, '0') + ' · ';
    if (LINKS[code]) {
      status.append(action(value, LINKS[code]));
    } else {
      status.append(value);
    }
    status.append(' · ' + name);
  }

  // link in the status line should run
  function action(text, run) {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = text;
    link.addEventListener('click', function (event) {
      event.preventDefault();
      run();
    });
    return link;
  }

  // the gaps between two bytes keep the current one lit, so the status doesn't flicker
  card.addEventListener('pointerover', function (event) {
    const cell = event.target.closest('[data-i]');
    if (cell) select(Number(cell.dataset.i));
  });
  // a touch has no hover to leave: the tapped byte stays lit
  card.addEventListener('pointerleave', function (event) {
    if (event.pointerType !== 'touch') select(-1);
  });

  // runs step(elapsed ms) on every frame until it returns true, then done
  function animate(step, done) {
    let start = null;
    function frame(now) {
      if (start === null) start = now;
      if (step(now - start)) {
        if (done) done();
      } else {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }

  function hide() {
    bytes.forEach(function (byte) {
      byte.hex.classList.add('is-off');
      byte.chr.classList.add('is-off');
    });
  }

  // a byte shows up hot with random values, then settles on its own and reveals its character
  function scrambleIn(done) {
    if (reducedMotion) {
      bytes.forEach(function (byte) {
        byte.hex.textContent = byte.value;
        byte.hex.classList.remove('is-off', 'is-hot');
        byte.chr.classList.remove('is-off');
      });
      if (done) done();
      return;
    }
    hide();
    bytes.forEach(function (byte) { byte.done = false; byte.changed = undefined; });
    animate(function (t) {
      bytes.forEach(function (byte, i) {
        const age = t - i * STAGGER;
        if (byte.done || age < 0) return;
        if (age >= SCRAMBLE) {
          byte.hex.textContent = byte.value;
          byte.hex.classList.remove('is-hot');
          byte.chr.classList.remove('is-off');
          byte.done = true;
        } else if (byte.changed === undefined || age - byte.changed >= 60) {
          byte.hex.classList.remove('is-off');
          byte.hex.classList.add('is-hot');
          byte.hex.textContent = hexPair();
          byte.changed = age;
        }
      });
      return bytes[bytes.length - 1].done;
    }, done);
  }

  // the way back: bytes heat up, lose their character, then burn out
  function scrambleOut(done) {
    if (reducedMotion) {
      hide();
      done();
      return;
    }
    const STEP = 8;
    bytes.forEach(function (byte) { byte.done = false; byte.changed = undefined; });
    animate(function (t) {
      bytes.forEach(function (byte, i) {
        const age = t - i * STEP;
        if (byte.done || age < 0) return;
        if (age >= SCRAMBLE) {
          byte.hex.classList.remove('is-hot');
          byte.hex.classList.add('is-off');
          byte.done = true;
        } else if (byte.changed === undefined || age - byte.changed >= 60) {
          byte.chr.classList.add('is-off');
          byte.hex.classList.add('is-hot');
          byte.hex.textContent = hexPair();
          byte.changed = age;
        }
      });
      return bytes[bytes.length - 1].done;
    }, done);
  }

  const EEE = 'eyJsYWJlbCI6IkVhc3RlciBFZ2cgIzA1OiBEYXZpZCBDYWx2ZXJ0LCBFYXN0ZXIgRWdnIEVuZ2luZWVyIiwidGl0bGUiOiJlYXN0ZXIgZWdnICMwNSIsImJ1c3kiOiJoYXRjaGluZy4uLiIsImZvdW5kIjoiZWdnICMwNSBmb3VuZCDCtyAiLCJiYWNrIjoiYmFjayIsImVlZSI6WyIgICAgLi0tLiIsIiAgIC8gICAgXFwiLCIgIC8gICAgICBcXCIsIiB8ICAgICAgICB8IiwiICBcXCAgICAgIC8iLCIgICBgLS0tLSciXSwiY3JhY2siOlsiICAgIC4tLS4iLCIgICAvIC9cXCBcXCIsIiAgL1xcLyAgXFwvXFwiLCIgfCAgICAgICAgfCIsIiAgXFwgICAgICAvIiwiICAgYC0tLS0nIl0sInBlZWsiOlsiIiwiICAgIF8vXFxfIiwiKiAgICAobzwiLCIgfFxcL1xcL1xcL1xcfCIsIiAgXFwgICAgICAvIiwiICAgYC0tLS0nIl0sImhhdGNoIjpbIiAgXy9cXC9cXF8iLCIqICAgIChvPiIsIiogICAvL1xcIiwiIHxcXC9cXC9cXC9cXHwiLCIgIFxcICAgICAgLyIsIiAgIGAtLS0tJyJdLCJ0ZXh0IjpbIiIsIkRhdmlkIENhbHZlcnQiLCJFYXN0ZXIgRWdnIEVuZ2luZWVyIiwiIiwiR2l0SHViIMK3IExpbmtlZEluIMK3IEJsdWVza3kiLCIiXSwibGlua3MiOnsiR2l0SHViIjoiaHR0cHM6Ly9naXRodWIuY29tL2RvdGRjIiwiTGlua2VkSW4iOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vaW4vMHhkYy8iLCJCbHVlc2t5IjoiaHR0cHM6Ly9ic2t5LmFwcC9wcm9maWxlLzB4ZGMubWUifX0=';
  const TYPE = 22;      // ms per typed character
  const FIDGET = 1200;  // average ms between two moves of the hatched chick
  let eee, art, text, pieces, fidgeter;

  function buildEee(note) {
    eee = document.createElement('div');
    eee.className = 'dump_eee';
    art = [];
    text = [];
    note.text.forEach(function (_, i) {
      const line = document.createElement('div');
      art[i] = document.createElement('span');
      art[i].className = 'dump_eee_art';
      art[i].setAttribute('aria-hidden', 'true');
      text[i] = document.createElement('span');
      text[i].className = 'dump_eee_text';
      line.append(art[i], text[i]);
      eee.appendChild(line);
    });

    const width = Math.max.apply(null, note.text.map(function (line) { return line.length; }));
    text.forEach(function (span) { span.style.width = width + 'ch'; });
    // each line split on its link words, kept as their own pieces
    const words = Object.keys(note.links).map(function (word) {
      return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    const split = new RegExp('(' + words.join('|') + ')');
    pieces = note.text.map(function (line) {
      return line.split(split).filter(Boolean).map(function (piece) {
        return { text: piece, href: note.links[piece] };
      });
    });
    rows.appendChild(eee);
  }

  // shows the first n characters of line j, a link word typed in is already a link
  function typeLine(j, n) {
    const span = text[j];
    if (span.typed === n) return;
    span.typed = n;
    span.textContent = '';
    pieces[j].forEach(function (piece) {
      if (n <= 0) return;
      const shown = piece.text.slice(0, n);
      n -= shown.length;
      if (!piece.href) {
        span.append(shown);
        return;
      }
      const link = document.createElement('a');
      link.href = piece.href;
      link.textContent = shown;
      span.append(link);
    });
  }

  function draw(frame) {
    frame.forEach(function (line, i) {
      const chick = line.charAt(0) === '*';
      if (chick) line = ' ' + line.slice(1);
      // a blank line still takes a row, or the art would jump up
      art[i].textContent = line || ' ';
      art[i].classList.toggle('is-chick', chick);
    });
  }

  // once out, blinks or looks back
  function fidget(note) {
    const head = note.hatch.findIndex(function (line) { return line.indexOf('(o>') !== -1; });
    fidgeter = setTimeout(function () {
      const look = Math.random() < 0.4;
      art[head].textContent = art[head].textContent.replace('(o>', look ? '(o<' : '(->');
      fidgeter = setTimeout(function () {
        art[head].textContent = art[head].textContent.replace(look ? '(o<' : '(->', '(o>');
        fidget(note);
      }, look ? 500 : 140);
    }, FIDGET * (0.5 + Math.random()));
  }

  function found(note) {
    mode = 'eee';
    status.textContent = note.found;
    status.append(action(note.back, unhatch));
    // a glyph swap now and then, not motion: it plays with reduced motion too
    fidget(note);
  }

  function hatch() {
    if (mode !== 'dump') return;
    const note = decodeNote(EEE);
    light(active, false);
    active = -1;
    mode = 'busy';
    status.textContent = note.busy;
    title.textContent = note.title;
    card.setAttribute('aria-label', note.label);
    // an image can't hold links: the card becomes a labelled group of text
    card.setAttribute('role', 'group');
    if (!eee) buildEee(note);
    text.forEach(function (_, j) { typeLine(j, 0); });
    eee.hidden = true;

    scrambleOut(function () {
      rows.classList.add('is-eee');
      eee.hidden = false;
      // still frames: the shell cracks, the chick peeks out under a piece of
      // shell, then pops out and the card types itself in (all at once with
      // reduced motion)
      const STILL = 500; // ms per frame
      const frames = [
        [note.eee, STILL], [note.crack, STILL], [note.peek, STILL], [note.hatch, 0]
      ];
      const type = reducedMotion ? 0 : TYPE;
      draw(frames[0][0]);
      let shown = 0;
      const total = note.text.join('').length;
      let end = 0;
      frames.forEach(function (f) { end += f[1]; });
      animate(function (t) {
        let at = 0;
        let i = 0;
        while (i < frames.length - 1 && t >= at + frames[i][1]) at += frames[i++][1];
        if (i !== shown) {
          draw(frames[i][0]);
          shown = i;
        }
        // typing starts once the chick is out
        let left = t < end ? 0 : type ? Math.floor((t - end) / type) : Infinity;
        note.text.forEach(function (line, j) {
          const n = Math.min(line.length, left);
          typeLine(j, n);
          left -= n;
        });
        return t >= end + total * type;
      }, function () { found(note); });
    });
  }

  function unhatch() {
    if (mode !== 'eee') return;
    clearTimeout(fidgeter);
    mode = 'busy';
    eee.hidden = true;
    rows.classList.remove('is-eee');
    title.textContent = original.title;
    card.setAttribute('aria-label', original.label);
    card.setAttribute('role', original.role);
    status.textContent = idle;
    scrambleIn(function () { mode = 'dump'; });
  }

  if (reducedMotion || !('IntersectionObserver' in window)) return;

  // nothing to point at or hatch until the bytes have settled
  mode = 'busy';
  hide();
  // on small screens the dump sits below the content: wait for it to scroll in
  const observer = new IntersectionObserver(function (entries) {
    if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
    observer.disconnect();
    scrambleIn(function () { mode = 'dump'; });
  }, { threshold: 0.4 });
  observer.observe(card);
})();

// Just another note
(function () {
  const SEQUENCE = '0xdc';
  const NOTE = 'WyJFYXN0ZXIgRWdnICMwNCIsImVhc3RlciBlZ2cgIzA0Iiwi8J+lmiIsIkhhcHB5IDR0aCBCbG9nIEFubml2ZXJzYXJ5ISIsIvCfjoIiLCIgICAsICwgLCAsXG4gICB8IHwgfCB8XG4gX198X3xffF98X19cbnx+fn5+fn5+fn5+fnxcbnwgIDQgWUVBUlMgIHxcbnxfX19fX19fX19fX3wiXQ==';
  let typed = '';
  let dialog;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function isTypingField(target) {
    return target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
  }

  function build() {
    const [label, title, lead, message, tail, art] = decodeNote(NOTE);
    dialog = el('dialog', 'cake');
    dialog.setAttribute('aria-label', label);
    dialog.tabIndex = -1;

    // same block as the resume: a card with a panel title
    const card = el('div', 'cake_card');
    card.appendChild(el('p', 'resume_panel_title', title));

    const text = el('p');
    const before = el('span', '', lead);
    const after = el('span', '', tail);
    before.setAttribute('aria-hidden', 'true');
    after.setAttribute('aria-hidden', 'true');
    text.append(before, ' ' + message + ' ', after);
    card.appendChild(text);

    // same markup as an article code block, so it picks up their style
    const block = el('div', 'highlight');
    block.setAttribute('aria-hidden', 'true');
    const pre = el('pre');
    pre.appendChild(el('code', '', art));
    block.appendChild(pre);
    card.appendChild(block);

    const form = el('form');
    form.method = 'dialog';
    form.appendChild(el('button', 'button cake_close', 'Close'));
    card.appendChild(form);

    dialog.appendChild(card);
    // a click on the dialog itself (not its content) is a click on the backdrop
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    document.body.appendChild(dialog);
  }

  function open() {
    if (!dialog) build();
    if (dialog.open) return;
    dialog.showModal();
    // showModal focuses the button, which opened from the keyboard would
    // trigger its roll hover and light the card: start from the dialog instead
    dialog.focus();
  }

  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey || isTypingField(event.target)) return;
    // event.key, not event.code, so layouts like AZERTY (shift + 0) still match
    if (event.key.length !== 1) return;
    typed = (typed + event.key.toLowerCase()).slice(-SEQUENCE.length);
    if (typed === SEQUENCE) {
      typed = '';
      open();
    }
  });
})();
