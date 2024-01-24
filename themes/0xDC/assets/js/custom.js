//    ______________________________
//  / \                             \.
//  |   |  Dear visitor,             |.
//   \_ |                            |.
//      |  If you're there, I guess  |.
//      |  you like the effects! <3  |.
//      |                            |.
//      |                   David    |.
//      |   _________________________|___
//      |  /                            /.
//      \_/dc__________________________/.

// Event listener for mouseover
document.addEventListener('mouseover', function(event) {
  // Find the nearest ancestor element with class 'nav_parent'
  const navParent = event.target.closest('.nav_parent');
  if (navParent) hoverEffect(navParent); // Apply hover effect
});

// Event listener for mouseout
document.addEventListener('mouseout', function(event) {
  // Find the nearest ancestor element with class 'nav_parent'
  const navParent = event.target.closest('.nav_parent');
  if (navParent) resetEffect(navParent); // Reset effect
});

// Function to apply the hover effect
function hoverEffect(element) {
  const navItem = element.querySelector('.nav_item');
  const originalText = navItem.innerText;
  const specialCharacters = ['A', 'V', '&', '<', '#', '²', '>', '~', '§', '%', '£', '€'];
  let timeout;
  const numChanges = Math.max(Math.floor(originalText.length / 2), 1);

  // Loop through the selected number of changes
  for (let i = 0; i < numChanges; i++) {
    const randomIndex = Math.floor(Math.random() * originalText.length);
    const randomCharacter = specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

    // Set a timeout to replace the character with a special character
    setTimeout(() => {
      navItem.innerText = originalText.substring(0, randomIndex) + randomCharacter + originalText.substring(randomIndex + 1);
    }, i * getRandomDelay());

    // Set a timeout to revert the character to its original value
    setTimeout(() => {
      navItem.innerText = originalText.substring(0, randomIndex) + originalText[randomIndex] + originalText.substring(randomIndex + 1);
    }, i * getRandomDelay() + getRandomDelay());
  }

  // Set a timeout to reset the effect after a certain duration
  timeout = setTimeout(() => {
    resetEffect(element);
  }, numChanges * getRandomDelay() + 800);
  element.setAttribute('data-timeout', timeout);
}

// Function to reset the effect
function resetEffect(element) {
  const navItem = element.querySelector('.nav_item');
  // Reset the text content to the initial title attribute
  navItem.innerText = navItem.getAttribute("title");
  // Clear the timeout to prevent further changes
  clearTimeout(parseInt(element.getAttribute('data-timeout')));
}

// Function to generate a random delay (between 150ms and 500ms)
function getRandomDelay() {
  return Math.floor(Math.random() * 350) + 150;
}
