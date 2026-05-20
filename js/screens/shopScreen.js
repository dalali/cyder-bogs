window.CB = window.CB || {};

CB.ShopScreen = {
  _tab: 'weapons',   // 'weapons' | 'ammo' | 'armor'
  _selectedItem: null,
  _hoveredItem: null,
  _modal: null,       // null or { weaponToReplace, pendingKind }

  enter(game) {
    CB.ShopScreen._tab = 'weapons';
    CB.ShopScreen._selectedItem = null;
    CB.ShopScreen._hoveredItem = null;
    CB.ShopScreen._modal = null;
    CB.ShopScreen._buildHits(game);
  },

  exit(game) {},

  _buildHits(game) {
    CB.ShopScreen._hitTargets = [];
  },

  update(dt, game) {},

  render(ctx, game) {
    const C = CB.COLORS;
    const W = CB.CANVAS_W;
    const H = CB.CANVAS_H;
    const ps = game.playerState;

    ctx.fillStyle = C.UI_BG;
    ctx.fillRect(0, 0, W, H);

    // Header bar
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, W, 50);
    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(0, 49, W, 1);

    // SHOP title
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = C.TEXT_TITLE;
    ctx.fillText('SHOP', 16, 32);

    // Credits
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.fillText(`CREDITS: ${CB.Utils.formatNum(ps.credits)}`, W / 2, 32);

    // Deploy button
    CB.ShopScreen._deployRect = { x: W - 230, y: 6, w: 220, h: 36 };
    const missionIndex = ps.missionIndex + 1;
    const nextName = CB.MISSION_DEFS[missionIndex] ? CB.MISSION_DEFS[missionIndex].title : 'ENDGAME';
    CB.UI.button(ctx, {
      x: W - 230, y: 6, w: 220, h: 36,
      label: `DEPLOY TO ${missionIndex + 1 <= CB.MISSION_DEFS.length ? 'M' + (missionIndex + 1) : 'ENDGAME'}`,
      state: 'primary', focused: false,
    });

    // Left panel — Your Loadout (x:0, w:200)
    CB.UI.panel(ctx, { x: 0, y: 50, w: 200, h: H - 50, fillColor: C.UI_PANEL });
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = C.TEXT_LABEL;
    ctx.fillText('YOUR LOADOUT', 10, 76);

    CB.ShopScreen._loadoutRects = [];
    for (let i = 0; i < 3; i++) {
      const slotY = 88 + i * 120;
      const w = ps.weapons[i];
      CB.ShopScreen._drawLoadoutSlot(ctx, ps, i, w, 10, slotY, game);
    }

    // Center panel — Items for Sale (x:200, w:380)
    CB.UI.panel(ctx, { x: 200, y: 50, w: 380, h: H - 50, fillColor: C.UI_BG });

    // Tabs
    const tabs = ['weapons', 'ammo', 'armor'];
    const tabW = 380 / 3;
    CB.ShopScreen._tabRects = [];
    tabs.forEach((tab, i) => {
      const tx = 200 + i * tabW;
      const isActive = CB.ShopScreen._tab === tab;
      ctx.fillStyle = isActive ? '#111111' : C.UI_BG;
      ctx.fillRect(tx, 51, tabW, 30);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isActive ? C.TEXT_PRIMARY : C.TEXT_DIM;
      ctx.fillText(tab.toUpperCase(), tx + tabW / 2, 71);
      if (isActive) {
        ctx.fillStyle = C.ACCENT_GREEN;
        ctx.fillRect(tx, 79, tabW, 2);
      }
      CB.ShopScreen._tabRects.push({ rect: { x: tx, y: 51, w: tabW, h: 30 }, tab });
    });

    // Item list
    CB.ShopScreen._itemRects = [];
    CB.ShopScreen._renderItemList(ctx, ps, 200, 84, game);

    // Right panel — Item Detail (x:580, w:220)
    CB.UI.panel(ctx, { x: 580, y: 50, w: 220, h: H - 50, fillColor: C.UI_PANEL });
    CB.ShopScreen._renderItemDetail(ctx, ps, game);

    // Modal
    if (CB.ShopScreen._modal) {
      CB.ShopScreen._renderModal(ctx, ps, game);
    }
  },

  _drawLoadoutSlot(ctx, ps, i, w, x, y, game) {
    const C = CB.COLORS;
    const slotW = 180;
    const slotH = 70;
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(x, y, slotW, slotH);
    ctx.strokeStyle = C.UI_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, slotW - 1, slotH - 1);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    if (w) {
      const def = CB.WEAPON_DEFS[w.kind];
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.fillText(`${i + 1}  ${def.name}`, x + 6, y + 20);
      ctx.fillStyle = C.AMMO_TEXT;
      ctx.fillText(`${w.ammo}/${def.ammoMax} ammo`, x + 6, y + 38);

      // Sell button (not for pistol)
      if (def.sellable) {
        const sellValue = Math.floor(def.cost / 2);
        const sellRect = { x: x + 4, y: y + 48, w: slotW - 8, h: 16 };
        CB.ShopScreen._loadoutRects.push({ rect: sellRect, slotIndex: i, action: 'sell' });
        ctx.fillStyle = '#1A0000';
        ctx.fillRect(sellRect.x, sellRect.y, sellRect.w, sellRect.h);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = C.ACCENT_RED;
        ctx.fillText(`[SELL ${sellValue}cr]`, sellRect.x + 4, sellRect.y + 11);
      }
    } else {
      ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText(`${i + 1}  --- EMPTY ---`, x + 6, y + 36);
    }
  },

  _renderItemList(ctx, ps, x, y, game) {
    const C = CB.COLORS;
    const rowH = 40;
    const listW = 380;
    let items = [];

    if (CB.ShopScreen._tab === 'weapons') {
      for (const kind of CB.SHOP_WEAPON_ORDER) {
        const def = CB.WEAPON_DEFS[kind];
        const owned = ps.weapons.some(w => w && w.kind === kind);
        items.push({ kind, def, owned, type: 'weapon' });
      }
    } else if (CB.ShopScreen._tab === 'ammo') {
      for (const kind of CB.SHOP_AMMO_ORDER) {
        const def = CB.WEAPON_DEFS[kind];
        const hasWeapon = ps.weapons.some(w => w && w.kind === kind);
        if (!hasWeapon) continue;
        const weaponSlot = ps.weapons.find(w => w && w.kind === kind);
        const full = weaponSlot && weaponSlot.ammo >= def.ammoMax;
        items.push({ kind, def, owned: full, type: 'ammo', ammoCost: def.ammoCost });
      }
    } else if (CB.ShopScreen._tab === 'armor') {
      for (const armorDef of CB.ARMOR_DEFS) {
        const owned = ps.armor >= armorDef.armorValue;
        items.push({ armorDef, owned, type: 'armor' });
      }
    }

    CB.ShopScreen._itemRects = [];
    items.forEach((item, i) => {
      const ry = y + i * rowH;
      const bgColor = i % 2 === 0 ? '#0D0D0D' : '#101010';
      const canAfford = item.type === 'weapon' ? ps.credits >= item.def.cost
        : item.type === 'ammo' ? ps.credits >= item.ammoCost
        : ps.credits >= item.armorDef.cost;
      const greyedOut = item.owned || !canAfford;

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, ry, listW, rowH);

      // Name
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = greyedOut ? C.TEXT_DIM : C.TEXT_PRIMARY;
      const name = item.type === 'weapon' ? item.def.name
        : item.type === 'ammo' ? `${item.def.name} AMMO`
        : item.armorDef.name;
      ctx.fillText(name, x + 8, ry + 16);

      // Cost
      const cost = item.type === 'weapon' ? item.def.cost
        : item.type === 'ammo' ? item.ammoCost
        : item.armorDef.cost;
      ctx.textAlign = 'right';
      ctx.fillStyle = greyedOut ? '#555500' : C.ACCENT_GOLD;
      ctx.fillText(`${cost}cr`, x + listW - 80, ry + 16);

      // Status badge
      if (item.owned) {
        ctx.fillStyle = '#334433';
        ctx.fillRect(x + listW - 74, ry + 4, 66, 20);
        ctx.fillStyle = '#00AA44';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OWNED', x + listW - 41, ry + 17);
      } else if (!canAfford) {
        ctx.fillStyle = '#331111';
        ctx.fillRect(x + listW - 74, ry + 4, 66, 20);
        ctx.fillStyle = '#AA2222';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LOW CR', x + listW - 41, ry + 17);
      }

      // Selected highlight
      if (CB.ShopScreen._selectedItem === item || CB.ShopScreen._hoveredItem === item) {
        ctx.strokeStyle = C.ACCENT_GREEN;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, ry + 0.5, listW - 1, rowH - 1);
      }

      CB.ShopScreen._itemRects.push({
        rect: { x, y: ry, w: listW, h: rowH },
        item,
      });
    });
  },

  _renderItemDetail(ctx, ps, game) {
    const C = CB.COLORS;
    const item = CB.ShopScreen._selectedItem;
    const x = 588;
    let y = 70;

    if (!item) {
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText('Select an item', 690, 200);
      return;
    }

    const def = item.def;
    const armorDef = item.armorDef;
    const name = item.type === 'weapon' ? def.name
      : item.type === 'ammo' ? `${def.name} AMMO`
      : armorDef.name;
    const cost = item.type === 'weapon' ? def.cost
      : item.type === 'ammo' ? item.ammoCost
      : armorDef.cost;
    const canAfford = ps.credits >= cost;
    const owned = item.owned;

    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = C.TEXT_TITLE;
    ctx.fillText(name, x, y);
    y += 18;

    ctx.fillStyle = C.UI_BORDER;
    ctx.fillRect(x, y, 200, 1);
    y += 14;

    ctx.font = '7px "Press Start 2P", monospace';
    if (item.type === 'weapon' && def) {
      const rows = [
        ['DMG:', `${def.dmg}`],
        ['RATE:', `${def.fireRate}/s`],
        ['RANGE:', `${def.range}px`],
        ['AMMO:', `${def.ammoMax}`],
        ['PELLETS:', def.pellets > 1 ? `${def.pellets}` : '-'],
        ['SPLASH:', def.splashRadius > 0 ? `${def.splashRadius}px` : '-'],
      ];
      rows.forEach(([label, val]) => {
        ctx.fillStyle = C.TEXT_LABEL;
        ctx.fillText(label, x, y);
        ctx.fillStyle = C.TEXT_PRIMARY;
        ctx.fillText(val, x + 100, y);
        y += 18;
      });
    } else if (item.type === 'ammo' && def) {
      ctx.fillStyle = C.TEXT_LABEL;
      ctx.fillText('FILLS:', x, y);
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.fillText(`${def.name}`, x + 80, y);
      y += 18;
      ctx.fillStyle = C.TEXT_LABEL;
      ctx.fillText('TO MAX:', x, y);
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.fillText(`${def.ammoMax}`, x + 80, y);
      y += 18;
    } else if (item.type === 'armor' && armorDef) {
      ctx.fillStyle = C.TEXT_LABEL;
      ctx.fillText('ARMOR:', x, y);
      ctx.fillStyle = C.TEXT_PRIMARY;
      ctx.fillText(`${armorDef.armorValue}`, x + 100, y);
      y += 18;
      ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText('50% DMG REDUCTION', x, y);
      y += 18;
    }

    y += 10;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = C.ACCENT_GOLD;
    ctx.fillText(`${cost} cr`, x, y);

    y += 30;
    const btnState = (owned || !canAfford) ? 'inactive' : 'primary';
    CB.UI.button(ctx, {
      x: x, y: y, w: 200, h: 38,
      label: owned ? 'OWNED' : (canAfford ? 'BUY' : 'BUY'),
      state: btnState, focused: !owned && canAfford,
    });
    CB.ShopScreen._buyRect = { x, y, w: 200, h: 38, item, canAfford: canAfford && !owned };

    if (!canAfford && !owned) {
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillStyle = C.ACCENT_RED;
      ctx.fillText('NOT ENOUGH CR', x, y + 52);
    }
  },

  _renderModal(ctx, ps, game) {
    const C = CB.COLORS;
    const W = 420;
    const H = 280;
    const mx = (CB.CANVAS_W - W) / 2;
    const my = (CB.CANVAS_H - H) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, CB.CANVAS_W, CB.CANVAS_H);

    ctx.fillStyle = C.UI_PANEL;
    ctx.fillRect(mx, my, W, H);
    ctx.strokeStyle = C.ACCENT_RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(mx + 1, my + 1, W - 2, H - 2);

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = C.TEXT_TITLE;
    ctx.fillText('SLOTS FULL', mx + W / 2, my + 36);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = C.TEXT_PRIMARY;
    ctx.fillText('Select a weapon to replace:', mx + W / 2, my + 60);

    CB.ShopScreen._modalSlotRects = [];
    ps.weapons.forEach((w, i) => {
      const ry = my + 80 + i * 52;
      ctx.fillStyle = '#111111';
      ctx.fillRect(mx + 20, ry, W - 40, 44);
      ctx.strokeStyle = CB.ShopScreen._modal.selectedSlot === i ? C.ACCENT_GREEN : C.UI_BORDER;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx + 20.5, ry + 0.5, W - 41, 43);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      if (w) {
        const def = CB.WEAPON_DEFS[w.kind];
        ctx.fillStyle = w.kind === 'pistol' ? C.TEXT_DIM : C.TEXT_PRIMARY;
        ctx.fillText(def.name, mx + 30, ry + 20);
        ctx.fillStyle = C.TEXT_DIM;
        ctx.fillText(w.kind === 'pistol' ? '(cannot sell)' : `sell: ${Math.floor(def.cost / 2)}cr`, mx + 30, ry + 36);
      } else {
        ctx.fillStyle = C.TEXT_DIM;
        ctx.fillText('--- EMPTY ---', mx + 30, ry + 28);
      }
      if (w && w.kind !== 'pistol') {
        CB.ShopScreen._modalSlotRects.push({ rect: { x: mx + 20, y: ry, w: W - 40, h: 44 }, slotIndex: i });
      }
    });

    // Buttons
    const btnY = my + H - 54;
    CB.UI.button(ctx, { x: mx + 20, y: btnY, w: 140, h: 36, label: 'CANCEL', state: 'inactive' });
    const confirmState = CB.ShopScreen._modal.selectedSlot !== null ? 'primary' : 'inactive';
    CB.UI.button(ctx, { x: mx + W - 160, y: btnY, w: 140, h: 36, label: 'CONFIRM', state: confirmState });
    CB.ShopScreen._modalCancelRect = { x: mx + 20, y: btnY, w: 140, h: 36 };
    CB.ShopScreen._modalConfirmRect = { x: mx + W - 160, y: btnY, w: 140, h: 36 };
  },

  onKey(e, game) {
    if (e.key === 'Escape') {
      if (CB.ShopScreen._modal) {
        CB.ShopScreen._modal = null;
      } else {
        // Don't allow escape without deploying — just ignore
      }
    }
    if (e.key === 'Enter') {
      if (CB.ShopScreen._modal && CB.ShopScreen._modal.selectedSlot !== null) {
        CB.ShopScreen._confirmSwap(game);
      }
    }
  },

  onClick(x, y, game) {
    const ps = game.playerState;

    // Modal click
    if (CB.ShopScreen._modal) {
      // Slot selection
      if (CB.ShopScreen._modalSlotRects) {
        for (const sr of CB.ShopScreen._modalSlotRects) {
          if (CB.Utils.pointInRect(x, y, sr.rect.x, sr.rect.y, sr.rect.w, sr.rect.h)) {
            CB.ShopScreen._modal.selectedSlot = sr.slotIndex;
            return;
          }
        }
      }
      // Cancel
      const cr = CB.ShopScreen._modalCancelRect;
      if (cr && CB.Utils.pointInRect(x, y, cr.x, cr.y, cr.w, cr.h)) {
        CB.ShopScreen._modal = null;
        return;
      }
      // Confirm
      const cfr = CB.ShopScreen._modalConfirmRect;
      if (cfr && CB.Utils.pointInRect(x, y, cfr.x, cfr.y, cfr.w, cfr.h)) {
        if (CB.ShopScreen._modal.selectedSlot !== null) {
          CB.ShopScreen._confirmSwap(game);
        }
      }
      return;
    }

    // Deploy button
    if (CB.ShopScreen._deployRect) {
      const dr = CB.ShopScreen._deployRect;
      if (CB.Utils.pointInRect(x, y, dr.x, dr.y, dr.w, dr.h)) {
        CB.ShopScreen._deploy(game);
        return;
      }
    }

    // Tab click
    if (CB.ShopScreen._tabRects) {
      for (const tr of CB.ShopScreen._tabRects) {
        if (CB.Utils.pointInRect(x, y, tr.rect.x, tr.rect.y, tr.rect.w, tr.rect.h)) {
          CB.ShopScreen._tab = tr.tab;
          CB.ShopScreen._selectedItem = null;
          return;
        }
      }
    }

    // Item list click
    if (CB.ShopScreen._itemRects) {
      for (const ir of CB.ShopScreen._itemRects) {
        if (CB.Utils.pointInRect(x, y, ir.rect.x, ir.rect.y, ir.rect.w, ir.rect.h)) {
          CB.ShopScreen._selectedItem = ir.item;
          return;
        }
      }
    }

    // Buy button click
    if (CB.ShopScreen._buyRect) {
      const br = CB.ShopScreen._buyRect;
      if (br.canAfford && CB.Utils.pointInRect(x, y, br.x, br.y, br.w, br.h)) {
        CB.ShopScreen._buyItem(br.item, game);
        return;
      }
    }

    // Sell button click
    if (CB.ShopScreen._loadoutRects) {
      for (const lr of CB.ShopScreen._loadoutRects) {
        if (lr.action === 'sell' && CB.Utils.pointInRect(x, y, lr.rect.x, lr.rect.y, lr.rect.w, lr.rect.h)) {
          CB.ShopScreen._sellWeapon(lr.slotIndex, game);
          return;
        }
      }
    }
  },

  onMouseMove(x, y, game) {
    CB.ShopScreen._hoveredItem = null;
    if (CB.ShopScreen._itemRects) {
      for (const ir of CB.ShopScreen._itemRects) {
        if (CB.Utils.pointInRect(x, y, ir.rect.x, ir.rect.y, ir.rect.w, ir.rect.h)) {
          CB.ShopScreen._hoveredItem = ir.item;
          if (!CB.ShopScreen._selectedItem) CB.ShopScreen._selectedItem = ir.item;
          break;
        }
      }
    }
  },

  _buyItem(item, game) {
    const ps = game.playerState;

    if (item.type === 'weapon') {
      const def = item.def;
      const owned = ps.weapons.some(w => w && w.kind === item.kind);
      if (owned) return;
      if (ps.credits < def.cost) return;

      // Find empty slot
      const emptySlot = ps.weapons.findIndex(w => w === null);
      if (emptySlot >= 0) {
        ps.credits -= def.cost;
        ps.weapons[emptySlot] = { kind: item.kind, ammo: def.ammoStart, cooldown: 0 };
        CB.ShopScreen._selectedItem = null;
      } else {
        // All slots full — show modal
        CB.ShopScreen._modal = { pendingKind: item.kind, selectedSlot: null };
      }
    } else if (item.type === 'ammo') {
      const def = item.def;
      const slot = ps.weapons.find(w => w && w.kind === item.kind);
      if (!slot) return;
      if (ps.credits < item.ammoCost) return;
      if (slot.ammo >= def.ammoMax) return;
      ps.credits -= item.ammoCost;
      slot.ammo = def.ammoMax;
      CB.ShopScreen._selectedItem = null;
    } else if (item.type === 'armor') {
      const armorDef = item.armorDef;
      if (ps.credits < armorDef.cost) return;
      if (ps.armor >= armorDef.armorValue) return;
      ps.credits -= armorDef.cost;
      ps.armor = armorDef.armorValue;
      CB.ShopScreen._selectedItem = null;
    }

    game.saveProgress();
  },

  _sellWeapon(slotIndex, game) {
    const ps = game.playerState;
    const w = ps.weapons[slotIndex];
    if (!w) return;
    const def = CB.WEAPON_DEFS[w.kind];
    if (!def || !def.sellable) return;
    const sellValue = Math.floor(def.cost / 2);
    ps.credits += sellValue;
    ps.weapons[slotIndex] = null;
    // Fix active slot if needed
    if (ps.activeSlot === slotIndex) {
      for (let i = 0; i < 3; i++) {
        if (ps.weapons[i]) { ps.activeSlot = i; break; }
      }
    }
    CB.ShopScreen._selectedItem = null;
    game.saveProgress();
  },

  _confirmSwap(game) {
    const ps = game.playerState;
    const modal = CB.ShopScreen._modal;
    if (!modal || modal.selectedSlot === null) return;

    const slotIndex = modal.selectedSlot;
    const newDef = CB.WEAPON_DEFS[modal.pendingKind];
    if (!newDef) { CB.ShopScreen._modal = null; return; }

    const w = ps.weapons[slotIndex];
    const sellValue = (w && CB.WEAPON_DEFS[w.kind] && CB.WEAPON_DEFS[w.kind].sellable)
      ? Math.floor(CB.WEAPON_DEFS[w.kind].cost / 2) : 0;

    // Atomic: only proceed if player can afford it after selling the old one
    if (ps.credits + sellValue < newDef.cost) {
      CB.ShopScreen._modal = null;
      return;
    }

    ps.credits += sellValue;
    ps.credits -= newDef.cost;
    ps.weapons[slotIndex] = { kind: modal.pendingKind, ammo: newDef.ammoStart, cooldown: 0 };

    CB.ShopScreen._modal = null;
    game.saveProgress();
  },

  _deploy(game) {
    const ps = game.playerState;
    ps.missionIndex = Math.min(ps.missionIndex + 1, CB.MISSION_DEFS.length - 1);
    game.saveProgress();
    game.setScreen('briefing');
  },
};
