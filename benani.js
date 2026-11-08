/* Benani: class-only animations for Canvas pages. Load once (e.g. account theme JS).
 * Markup:  <div class="ben-ani ben-ani-reveal">...</div>   scroll reveal
 *          <h2 class="ben-ani ben-ani-type">Text</h2>       typing text (plain-text elements only)
 * No script / reduced motion / old browser => content just shows normally. */
(function () {
  if (window.benani) return;

  function prepType(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.style.minHeight = el.offsetHeight + 'px'; // no layout jump while typing
    el.textContent = '';
    var sr = document.createElement('span'); // screen readers get the full text at once
    sr.className = 'ben-sr';
    sr.textContent = text;
    var vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    el.append(sr, vis);
    el.benText = text;
  }

  function type(el) {
    var vis = el.lastChild, t = el.benText, i = 0, step = Math.ceil(t.length / 70); // ~2s max
    vis.className = 'ben-typing';
    var timer = setInterval(function () {
      i += step;
      vis.textContent = t.slice(0, i);
      if (i >= t.length) { clearInterval(timer); vis.className = ''; }
    }, 30);
  }

  function run() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    if (!document.getElementById('ben-ani-css')) {
      var s = document.createElement('style');
      s.id = 'ben-ani-css';
      s.textContent =
        '.ben-ani-reveal{transition:opacity .6s ease-out,transform .6s ease-out}' +
        '.ben-ani-reveal.ben-wait{opacity:0;transform:translateY(24px);transition:none}' +
        '.ben-typing::after{content:"|";animation:ben-blink 1s steps(1) infinite}' +
        '@keyframes ben-blink{50%{opacity:0}}' +
        '.ben-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
      document.head.appendChild(s);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.remove('ben-wait');
        if (e.target.benText) type(e.target);
      });
    }, { threshold: 0.15 });
    var els = document.querySelectorAll('.ben-ani:not(.ben-on)');
    els.forEach(function (el) {
      el.classList.add('ben-on');
      if (el.classList.contains('ben-ani-reveal')) el.classList.add('ben-wait');
      if (el.classList.contains('ben-ani-type') && !el.children.length) prepType(el);
    });
    // Let the hidden state paint first, or on-screen cards would never visibly fade in.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { els.forEach(function (el) { io.observe(el); }); });
    });
  }

  window.benani = run; // call again if content is added later
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
