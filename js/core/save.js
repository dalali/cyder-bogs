window.CB = window.CB || {};

CB.Save = {
  save(data) {
    try {
      const obj = Object.assign({ version: CB.SAVE_VERSION, timestamp: Date.now() }, data);
      localStorage.setItem(CB.SAVE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(CB.SAVE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj.version !== CB.SAVE_VERSION) return null;
      return obj;
    } catch (e) {
      return null;
    }
  },

  clear() {
    try {
      localStorage.removeItem(CB.SAVE_KEY);
    } catch (e) {}
  },

  exists() {
    return CB.Save.load() !== null;
  },
};
