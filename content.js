(function() {
  // Prevent script from running multiple times
  if (window.colorPickerActive) return;
  window.colorPickerActive = true;

  const overlay = document.createElement('div');
  overlay.id = 'color-picker-overlay-1982';
  
  const swatch = document.createElement('div');
  swatch.id = 'color-picker-swatch-1982';

  document.body.appendChild(overlay);
  document.body.appendChild(swatch);

  chrome.runtime.sendMessage({ action: 'takeScreenshot' }, (response) => {
    if (chrome.runtime.lastError || response.error || !response.screenshotUrl) {
      console.error('Color Picker Error:', chrome.runtime.lastError || response.error);
      alert('Could not pick color from this page. Please try a different page.');
      cleanup();
      return;
    }

    const img = new Image();
    img.src = response.screenshotUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      overlay.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        swatch.style.left = x + 'px';
        swatch.style.top = y + 'px';
        const pixel = ctx.getImageData(x * dpr, y * dpr, 1, 1).data;
        const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        swatch.style.backgroundColor = color;
        swatch.style.backgroundImage = `url(${img.src})`;
        const bgX = ((x * dpr) / canvas.width) * 100;
        const bgY = ((y * dpr) / canvas.height) * 100;
        swatch.style.backgroundPosition = `${bgX}% ${bgY}%`;
      });

      overlay.addEventListener('click', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const pixel = ctx.getImageData(x * dpr, y * dpr, 1, 1).data;
        const rgb = { r: pixel[0], g: pixel[1], b: pixel[2] };
        const hex = "#" + ("000000" + rgbToHex(rgb.r, rgb.g, rgb.b)).slice(-6);

        chrome.runtime.sendMessage({ action: 'colorPicked', color: hex });
        createResultDialog(hex, rgb);
        cleanup();
      });
    };
    img.onerror = () => {
        alert('Failed to load screenshot for processing.');
        cleanup();
    }
  });

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      cleanup();
    }
  }
  document.addEventListener('keydown', handleKeyDown);

  function cleanup() {
    overlay.remove();
    swatch.remove();
    document.removeEventListener('keydown', handleKeyDown);
    window.colorPickerActive = false;
  }

  function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // --- DIALOG AND PALETTE LOGIC ---

  function createResultDialog(color, rgb) {
    const style = document.createElement('style');
    style.id = 'color-picker-dialog-style-1982';
    style.textContent = `
      #color-result-dialog-1982 {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        padding: 25px; background: linear-gradient(to bottom, #fdfbfb, #ebedee);
        box-shadow: 0 8px 30px rgba(0,0,0,0.15); z-index: 2147483647;
        font-family: 'Roboto', sans-serif; text-align: center; border-radius: 16px;
        width: 320px; max-height: 90vh; overflow-y: auto;
        color: #333;
      }
      #color-result-dialog-1982 h3 { margin: 0 0 20px 0; font-size: 20px; font-weight: 500; color: #333; }
      #color-result-swatch-1982 { width: 100px; height: 100px; border: 3px solid white; margin: 0 auto 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      
      .color-display-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
      .color-format { display: flex; align-items: center; background: #fff; padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
      .color-format label { font-size: 14px; font-weight: 500; width: 40px; text-align: left; color: #555; }
      .color-format input { flex-grow: 1; padding: 5px; border: none; background: transparent; font-size: 14px; font-family: 'Roboto', sans-serif; color: #333; }
      .copy-button { padding: 5px; cursor: pointer; background: transparent; border: none; display: flex; align-items: center; justify-content: center; }
      .copy-button svg { width: 18px; height: 18px; fill: #888; transition: fill 0.2s ease; }
      .copy-button:hover svg { fill: #2575fc; }

      .color-picker-button-1982 { margin: 0 5px; padding: 10px 20px; border: none; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
      #color-palette-btn-1982 { background: linear-gradient(to right, #6a11cb, #2575fc); color: white; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
      #color-palette-btn-1982:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25); }
      #color-result-close-1982 { background: #eee; color: #555; }
      #color-result-close-1982:hover { background: #e0e0e0; }

      #color-palette-container-1982 { display: none; margin-top: 25px; text-align: left; }
      .palette-title-1982 { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 10px 0; }
      .palette-title-1982 span { font-size: 16px; font-weight: 500; color: #333; }
      .copy-css-btn-1982 { font-size: 12px; padding: 4px 8px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 5px; }
      .swatch-container-1982 { display: flex; gap: 10px; justify-content: center; }
      .palette-swatch-1982 { width: 50px; height: 50px; border: 2px solid white; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s ease; }
      .palette-swatch-1982:hover { transform: scale(1.1); }
    `;
    document.head.appendChild(style);

    const dialog = document.createElement('div');
    dialog.id = 'color-result-dialog-1982';
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const hslString = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`;

    dialog.innerHTML = `
      <h3>Color Picked</h3>
      <div id="color-result-swatch-1982"></div>
      <div class="color-display-container">
        <div class="color-format">
          <label for="hex-val">HEX</label>
          <input type="text" id="hex-val" value="${color}" readonly>
          <button class="copy-button" data-copy="${color}" title="Copy HEX">
            <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
        </div>
        <div class="color-format">
          <label for="rgb-val">RGB</label>
          <input type="text" id="rgb-val" value="${rgbString}" readonly>
          <button class="copy-button" data-copy="${rgbString}" title="Copy RGB">
            <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
        </div>
        <div class="color-format">
          <label for="hsl-val">HSL</label>
          <input type="text" id="hsl-val" value="${hslString}" readonly>
          <button class="copy-button" data-copy="${hslString}" title="Copy HSL">
            <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
        </div>
      </div>
      <div id="color-palette-container-1982"></div>
      <div>
        <button id="color-palette-btn-1982" class="color-picker-button-1982">Generate Palettes</button>
        <button id="color-result-close-1982" class="color-picker-button-1982">Close</button>
      </div>
    `;
    document.body.appendChild(dialog);

    document.getElementById('color-result-swatch-1982').style.backgroundColor = color;

    dialog.querySelectorAll('.copy-button').forEach(button => {
      button.onclick = () => {
        navigator.clipboard.writeText(button.dataset.copy);
        const originalIcon = button.innerHTML;
        button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        setTimeout(() => { button.innerHTML = originalIcon; }, 1500);
      };
    });

    document.getElementById('color-result-close-1982').onclick = () => {
      dialog.remove();
      style.remove();
    };

    document.getElementById('color-palette-btn-1982').onclick = (e) => {
      e.target.style.display = 'none';
      const paletteContainer = document.getElementById('color-palette-container-1982');
      paletteContainer.style.display = 'block';

      const palettes = [
        { name: "Analogous", colors: generateAnalogous(hsl) },
        { name: "Triadic", colors: generateTriadic(hsl) },
        { name: "Monochromatic", colors: generateMonochromatic(hsl) }
      ];

      palettes.forEach(p => {
        const title = document.createElement('div');
        title.className = 'palette-title-1982';
        title.innerHTML = `<span>${p.name}</span>`;
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy CSS';
        copyBtn.className = 'copy-css-btn-1982';
        copyBtn.onclick = () => {
          const cssString = p.colors.map((c, i) => `--palette-${p.name.toLowerCase()}-color-${i + 1}: ${c};`).join('\n');
          navigator.clipboard.writeText(cssString);
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = originalText; }, 1500);
        };
        title.appendChild(copyBtn);
        paletteContainer.appendChild(title);

        const swatchContainer = document.createElement('div');
        swatchContainer.className = 'swatch-container-1982';
        p.colors.forEach(c => {
          const swatch = document.createElement('div');
          swatch.className = 'palette-swatch-1982';
          swatch.style.backgroundColor = c;
          swatch.title = `Click to copy ${c}`;
          swatch.onclick = () => navigator.clipboard.writeText(c);
          swatchContainer.appendChild(swatch);
        });
        paletteContainer.appendChild(swatchContainer);
      });
    };
  }

  // --- COLOR CONVERSION HELPERS ---
  function generateAnalogous(hsl) { return [hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l), hslToHex(hsl.h, hsl.s, hsl.l), hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)]; }
  function generateTriadic(hsl) { return [hslToHex(hsl.h, hsl.s, hsl.l), hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l), hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)]; }
  function generateMonochromatic(hsl) { return [hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 0.2)), hslToHex(hsl.h, hsl.s, hsl.l), hslToHex(hsl.h, hsl.s, Math.min(1, hsl.l + 0.2))]; }

  function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) { h = s = 0; } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s, l: l };
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    h /= 360;
    if (s == 0) { r = g = b = l; } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function hslToHex(h, s, l) {
      const rgb = hslToRgb(h, s, l);
      return "#" + ("000000" + rgbToHex(rgb.r, rgb.g, rgb.b)).slice(-6);
  }

})();