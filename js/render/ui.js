window.CB = window.CB || {};

CB.UI = {
  // Draw a button. Returns hit rect for click testing.
  button(ctx, opts) {
    const { x, y, w, h, label, state, focused } = opts;
    const C = CB.COLORS;

    let bgColor, textColor, borderColor;
    switch (state) {
      case 'primary':
        bgColor = C.BTN_PRIMARY_BG;
        textColor = C.BTN_PRIMARY_TEXT;
        borderColor = focused ? C.ACCENT_GREEN : '#00AA44';
        break;
      case 'danger':
        bgColor = C.BTN_DANGER_BG;
        textColor = '#FFFFFF';
        borderColor = focused ? '#FF6666' : '#880000';
        break;
      case 'inactive':
      default:
        bgColor = C.BTN_INACTIVE_BG;
        textColor = C.BTN_INACTIVE_TEXT;
        borderColor = focused ? C.ACCENT_GREEN : C.UI_BORDER;
        break;
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = focused ? 2 : 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.fillText(label, x + w / 2, y + h / 2 + 4);

    return { x, y, w, h };
  },

  // Draw a flat panel (background rect with border)
  panel(ctx, opts) {
    const { x, y, w, h, borderColor, fillColor } = opts;
    ctx.fillStyle = fillColor || CB.COLORS.UI_PANEL;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = borderColor || CB.COLORS.UI_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  },

  // Text label
  label(ctx, opts) {
    const { x, y, text, size, color, align } = opts;
    ctx.font = `${size || 10}px "Press Start 2P", monospace`;
    ctx.textAlign = align || 'left';
    ctx.fillStyle = color || CB.COLORS.TEXT_PRIMARY;
    ctx.fillText(text, x, y);
  },

  // Horizontal progress bar
  bar(ctx, opts) {
    const { x, y, w, h, fillRatio, fillColor, bgColor } = opts;
    ctx.fillStyle = bgColor || '#111111';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fillColor || CB.COLORS.ACCENT_GREEN;
    ctx.fillRect(x, y, Math.ceil(w * Math.min(1, fillRatio)), h);
  },

  // Wraps text into lines at maxWidth chars
  wrapText(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      if (current.length + word.length + 1 > maxChars) {
        if (current) lines.push(current.trim());
        current = word + ' ';
      } else {
        current += word + ' ';
      }
    }
    if (current.trim()) lines.push(current.trim());
    return lines;
  },

  // Draw a centered modal dialog
  modal(ctx, opts) {
    const { title, lines, buttons, focusedBtn, width, height } = opts;
    const C = CB.COLORS;
    const W = width || 400;
    const H = height || 200;
    const mx = (CB.CANVAS_W - W) / 2;
    const my = (CB.CANVAS_H - H) / 2;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, CB.CANVAS_W, CB.CANVAS_H);

    // Modal background
    ctx.fillStyle = C.UI_PANEL;
    ctx.fillRect(mx, my, W, H);
    ctx.strokeStyle = C.ACCENT_RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(mx + 1, my + 1, W - 2, H - 2);

    // Title
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.TEXT_TITLE;
    ctx.fillText(title, mx + W / 2, my + 28);

    // Lines
    if (lines) {
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = C.TEXT_PRIMARY;
      lines.forEach((line, i) => {
        ctx.fillText(line, mx + W / 2, my + 56 + i * 20);
      });
    }

    return { x: mx, y: my, w: W, h: H };
  },
};
