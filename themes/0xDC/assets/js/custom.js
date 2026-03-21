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
