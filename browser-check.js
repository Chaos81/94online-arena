// Classic script so older browsers can explain a failed module startup.
(function () {
  function notice(message) {
    var el = document.getElementById('browser-notice');
    if (el) { el.hidden = false; el.textContent = message; }
  }
  var missing = [];
  if (!window.WebAssembly) missing.push('WebAssembly');
  if (!window.RTCPeerConnection) missing.push('WebRTC');
  if (!window.crypto || !window.crypto.subtle || !window.crypto.randomUUID) missing.push('secure browser features');
  if (!window.structuredClone) missing.push('structured cloning');
  if (missing.length) notice('This browser is missing ' + missing.join(', ') + '. Update your browser and open this page over HTTPS. Current desktop Chrome, Edge or Safari is recommended.');
  window.addEventListener('error', function (event) {
    if (document.documentElement.getAttribute('data-arena-ready') === 'true') return;
    // No stack traces, private URLs or game data in the public message.
    if (event.message || (event.target && event.target.tagName === 'SCRIPT')) notice('The arena could not start in this browser. Reload once, then try an updated desktop browser. When reporting this, include your browser version and device.');
  }, true);
}());
