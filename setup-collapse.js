// Collapses the pre-game setup panel when a match starts, and restores it back at the lobby.
// The player can still show or hide it with the button in the panel header.
(function () {
  'use strict';
  var panel = document.getElementById('setup'), btn = document.getElementById('setup-toggle');
  if (!panel || !btn) return;
  var last = null;
  function set(collapsed) {
    panel.classList.toggle('setup-collapsed', collapsed);
    btn.textContent = collapsed ? 'Show setup' : 'Hide setup';
    btn.setAttribute('aria-expanded', String(!collapsed));
  }
  btn.addEventListener('click', function () { set(!panel.classList.contains('setup-collapsed')); });
  setInterval(function () {
    var a = globalThis.__arena, phase = a && a.phase;
    if (!phase || phase === last) return;
    if (phase === 'playing') { btn.hidden = false; set(true); }
    else if (phase === 'lobby') { set(false); btn.hidden = true; }
    last = phase;
  }, 150);
})();
