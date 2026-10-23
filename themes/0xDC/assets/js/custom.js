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

// WeakMap keyed by nav element; value is the active timeouts array (used as identity token)
const effectState = new WeakMap();

document.addEventListener('mouseover', function(event) {
  const navParent = event.target.closest('.nav_parent');
  if (navParent) startEffect(navParent);
});

document.addEventListener('mouseout', function(event) {
  const navParent = event.target.closest('.nav_parent');
  if (!navParent) return;
  // Ignore mouseout when moving between children within the same nav_parent
  if (event.relatedTarget && navParent.contains(event.relatedTarget)) return;
  stopEffect(navParent);
});

function startEffect(element) {
  // Skip if an effect is already running on this element
  if (effectState.has(element)) return;

  const navItem = element.querySelector('.nav_item');
  if (!navItem) return;

  // Snapshot the original text once; reuse it on subsequent hovers
  if (!navItem.dataset.originalText) {
    navItem.dataset.originalText = navItem.innerText;
  }
  const originalText = navItem.dataset.originalText;
  const numChanges = Math.max(Math.floor(originalText.length / 2), 1);
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
  const navItem = element.querySelector('.nav_item');
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
