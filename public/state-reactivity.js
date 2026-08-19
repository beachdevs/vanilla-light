globalThis.app = globalThis.app || {};

app.state = new Proxy({}, {
  set(o, p, v) {
    o[p] = v;

    document.querySelectorAll(`[data="${p}"]`).forEach(el => {
      if (typeof el.render === 'function') {
        el.render(v);
      }
    });

    return true;
  }
});
