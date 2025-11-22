const pickBtn = document.getElementById('pickBtn');
const colorSwatch = document.getElementById('color-swatch');
const hexValue = document.getElementById('hex-value');
const rgbValue = document.getElementById('rgb-value');
const hslValue = document.getElementById('hsl-value');
const copyBtns = document.querySelectorAll('.copy-btn');

// When the popup opens, get the last picked color from storage and update the UI.
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('lastColor', ({ lastColor }) => {
    if (lastColor) {
      updateUI(lastColor);
    }
  });
});

// When the "Pick Color" button is clicked, inject the scripts and close the popup.
pickBtn.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com')) {
      updateButtonText("Can't run here!", 2000);
      return;
  }

  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['picker.css']
  }, () => {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
    }
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        window.close(); 
    });
  });
});

// Add click listeners to the copy buttons
copyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const format = btn.dataset.format;
    let textToCopy;
    switch (format) {
      case 'hex':
        textToCopy = hexValue.value;
        break;
      case 'rgb':
        textToCopy = rgbValue.value;
        break;
      case 'hsl':
        textToCopy = hslValue.value;
        break;
    }
    copyColor(textToCopy, btn);
  });
});

function copyColor(text, btn) {
    navigator.clipboard.writeText(text)
    .then(() => {
      const originalIcon = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
      setTimeout(() => {
        btn.innerHTML = originalIcon;
      }, 1500);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}

function updateUI(color) {
  colorSwatch.style.backgroundColor = color;
  hexValue.value = color;

  const { r, g, b } = hexToRgb(color);
  rgbValue.value = `rgb(${r}, ${g}, ${b})`;

  const { h, s, l } = rgbToHsl(r, g, b);
  hslValue.value = `hsl(${h}, ${s}%, ${l}%)`;
}

function updateButtonText(text, duration) {
    const originalText = pickBtn.textContent;
    pickBtn.textContent = text;
    setTimeout(() => {
        pickBtn.textContent = 'Pick Color from Page';
    }, duration);
}

// Listen for messages from the content script with the picked color.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.color) {
    updateUI(request.color);
    chrome.storage.sync.set({ lastColor: request.color });
  }
});

// --- Color Conversion Functions ---

function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  // 3 digits
  if (hex.length == 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  // 6 digits
  } else if (hex.length == 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return { r: +r, g: +g, b: +b };
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}
