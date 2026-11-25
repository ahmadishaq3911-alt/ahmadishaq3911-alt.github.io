
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css = function (n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); };
  var GREEN = css("--green"), INK = css("--ink"), MUTED = css("--muted"), RULE = css("--rule");
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }

  /* ---------- Nav, menu, reveal, copy ---------- */
  var nav = document.getElementById("nav"), bar = document.getElementById("progress"), navRight = document.getElementById("navRight");
  var links = document.querySelectorAll(".pill-nav a");
  var secObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); }); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("section[id]").forEach(function (s) { secObs.observe(s); });
  var menuBtn = document.getElementById("menuBtn"), menu = document.getElementById("mobileMenu");
  menuBtn.addEventListener("click", function () { var o = menu.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); menuBtn.textContent = o ? "Close" : "Menu"; });
  menu.addEventListener("click", function (e) { if (e.target.tagName === "A") { menu.classList.remove("open"); menuBtn.textContent = "Menu"; menuBtn.setAttribute("aria-expanded", false); } });
  var revObs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revObs.observe(el); });
  var toast = document.getElementById("toast"), tt;
  document.getElementById("copyBtn").addEventListener("click", function () {
    var done = function (m) { toast.textContent = m; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText("muhammad.ishaq@maine.edu").then(function () { done("Email copied"); }, function () { done("muhammad.ishaq@maine.edu"); }); else done("muhammad.ishaq@maine.edu");
  });

  /* ---------- Hero scroll scene ---------- */
  var hero = document.getElementById("home"), stage = document.getElementById("stage"), clip = document.getElementById("photoClip");
  var layer = document.getElementById("photoLayer"), colorImg = document.getElementById("photoColor");
  var marquee = document.getElementById("marquee"), sigRect = document.getElementById("sigRect");
  var statusEl = document.querySelector(".status"), ctaEl = document.querySelector(".hero-actions"), sigEl = document.querySelector(".signature");
  var L = { x: 0, y: 0, k: 1 };
  function heroUpdate() {
    var vw = stage.clientWidth, vh = stage.clientHeight, y = Math.max(0, -hero.getBoundingClientRect().top);
    var t = reduce ? 1 : clamp(y / (vh * .95)), p = t * t * (3 - 2 * t);
    var sb = statusEl.offsetTop + statusEl.offsetHeight + 18, ct = ctaEl.offsetTop - 18;
    var cw = Math.min(clamp(vw * .32, 260, 460), (ct - sb) / .96, vw - 32), ch = cw * .96, cx = vw / 2, cy = (sb + ct) / 2;
    var top = cy - ch / 2, side = cx - cw / 2, bottom = vh - top - ch;
    sigEl.style.top = lerp(vh * .70, cy + ch * .27, p) + "px";
    clip.style.clipPath = "inset(" + (top * p) + "px " + (side * p) + "px " + (bottom * p) + "px " + (side * p) + "px round " + (28 * p) + "px)";
    var aspect = .8, D = Math.max(vw, vh * aspect), H = D / aspect;
    var x0 = (vw - D) / 2, y0 = (vh - H) * .22;
    var k1 = cw * 1.04 / D, x1 = cx - D * k1 / 2, y1 = cy - H * k1 * .43;
    L.k = lerp(1, k1, p); L.x = lerp(x0, x1, p); L.y = lerp(y0, y1, p);
    layer.style.width = D + "px"; layer.style.height = H + "px";
    layer.style.transform = "translate(" + L.x + "px," + L.y + "px) scale(" + L.k + ")";
    marquee.style.opacity = p; stage.style.setProperty("--reveal", p); stage.style.setProperty("--photo-shade", (1-p)*.22);
    sigRect.setAttribute("width", 640);
  }

  /* Cursor spotlight on the photo + reactive dots */
  var cur = { x: -9999, y: -9999, r: 0, target: 0, cx: 0, cy: 0 };
  function follow(e) {
    var sr = stage.getBoundingClientRect();
    cur.x = e.clientX - sr.left; cur.y = e.clientY - sr.top; cur.cx = e.clientX; cur.cy = e.clientY; cur.target = 150;
    if (reduce) applyR(150);
  }
  function applyR(r) {
    cur.r = r;
    var sr = stage.getBoundingClientRect();
    colorImg.style.setProperty("--mx", ((cur.cx - sr.left - L.x) / L.k) + "px");
    colorImg.style.setProperty("--my", ((cur.cy - sr.top - L.y) / L.k) + "px");
    colorImg.style.setProperty("--r", (r / L.k) + "px");
  }
  stage.addEventListener("pointermove", follow);
  stage.addEventListener("pointerdown", follow);
  stage.addEventListener("pointerleave", function () { cur.target = 0; if (reduce) applyR(0); });

  var dotsC = document.getElementById("dots"), dots = { c: dotsC, ctx: dotsC.getContext("2d") };
  function seedDots() { var r = rng(3), n = Math.round(innerWidth * innerHeight / 4200); dots.p = []; for (var i = 0; i < n; i++) dots.p.push({ x: r(), y: r(), s: r() * 1.8 + 0.6, v: (r() - 0.5) * 0.00012, g: r() < 0.35 }); }
  seedDots();
  function drawDots(st, t) {
    var ctx = st.ctx, w = st.w, h = st.h; ctx.clearRect(0, 0, w, h);
    var R = Math.max(cur.r * 1.35, 1);
    st.p.forEach(function (p) {
      var x = ((p.x + t * p.v) % 1 + 1) % 1 * w, y = (p.y + Math.sin(t / 4000 + p.x * 9) * 0.006) * h, s = p.s, col = p.g ? rgba(GREEN, .7) : "rgba(20,24,20,.35)";
      var dx = x - cur.x, dy = y - cur.y, d = Math.hypot(dx, dy);
      if (d < R) { var k = 1 - d / R; x += dx / (d || 1) * k * 22; y += dy / (d || 1) * k * 22; s = p.s + k * 1.6; col = rgba("#4f8a62", .55 + k * .45); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill();
    });
  }

  /* ---------- Experience: vertical scroll -> sideways ---------- */
  var exp = document.getElementById("experience"), expTrack = document.getElementById("expTrack"), expBar = document.getElementById("expBar");
  var expShift = 0;
  function expLayout() {
    expShift = innerWidth < 860 || reduce ? 0 : Math.max(0, expTrack.scrollWidth - innerWidth + 24);
    exp.style.height = innerWidth < 860 || reduce ? "auto" : (innerHeight + expShift) + "px";
  }
  function expUpdate() {
    var r = exp.getBoundingClientRect(), span = exp.offsetHeight - innerHeight;
    var u = span > 0 ? clamp(-r.top / span) : 0;
    expTrack.style.transform = "translateX(" + (-u * expShift) + "px)";
    expBar.style.width = (8 + u * 92) + "%";
  }

  /* ---------- Fixed 3D orb: appears from Motivation through Experience ---------- */
  var orbC = document.getElementById("orb"), orb = { c: orbC, ctx: orbC.getContext("2d") };
  (function () {
    var n = 92, P = [], ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) { var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; P.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
    orb.P = P; orb.E = [];
    for (var a = 0; a < n; a++) for (var b = a + 1; b < n; b++) { if (Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1], P[a][2] - P[b][2]) < .4) orb.E.push([a, b]); }
  })();
  var motivation = document.getElementById("motivation");
  // keyframes along the path: [u, x (fraction of vw), y (fraction of vh), scale]
  var PATH = [[0, 1.15, .45, .8], [.12, .78, .42, 1], [.35, .74, .5, 1.05], [.55, .62, .72, .9], [.78, .66, .8, .85], [1, 1.15, .15, .7]];
  function along(u) {
    for (var i = 1; i < PATH.length; i++) if (u <= PATH[i][0]) {
      var a = PATH[i - 1], b = PATH[i], f = (u - a[0]) / (b[0] - a[0]); f = f * f * (3 - 2 * f);
      return [lerp(a[1], b[1], f), lerp(a[2], b[2], f), lerp(a[3], b[3], f)];
    }
    return PATH[PATH.length - 1].slice(1);
  }
  function drawOrb(st, t) {
    var ctx = st.ctx, w = st.w, h = st.h; ctx.clearRect(0, 0, w, h);
    var start = motivation.getBoundingClientRect().top + scrollY - h * .6, end = exp.getBoundingClientRect().bottom + scrollY - h * .2;
    var u = (scrollY - start) / (end - start); if (u < 0 || u > 1) return;
    var pos = along(u), R = Math.min(w, h) * .14 * pos[2], cx = pos[0] * w, cy = pos[1] * h;
    var a = t * .0003 + scrollY * .0012, b = .4 + Math.sin(t * .0002) * .15, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    var g = ctx.createRadialGradient(cx - R * .18, cy - R * .2, R * .04, cx, cy, R * .5);
    g.addColorStop(0, "#9a9a9a"); g.addColorStop(.6, "#4a4a4a"); g.addColorStop(1, "#2c2c2c");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * .42, 0, 6.283); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(cx - R * .14, cy - R * .02, 2.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = "rgba(170,230,190,.9)"; ctx.beginPath(); ctx.arc(cx + R * .06, cy - R * .1, 1.8, 0, 6.283); ctx.fill();
    var Q = st.P.map(function (p) { var x = p[0] * ca - p[2] * sa, z = p[0] * sa + p[2] * ca, y = p[1] * cb - z * sb; z = p[1] * sb + z * cb; return [cx + x * R, cy + y * R, z]; });
    st.E.forEach(function (e) { var p = Q[e[0]], q = Q[e[1]], z = (p[2] + q[2]) / 2; ctx.strokeStyle = "rgba(40,44,40," + (.18 + (z + 1) * .16) + ")"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); });
    Q.forEach(function (q) { var s = 3 + (q[2] + 1) * 2; ctx.fillStyle = "rgba(60,110,78," + (.45 + (q[2] + 1) * .27) + ")"; ctx.fillRect(q[0] - s / 2, q[1] - s / 2, s, s); });
  }

  /* ---------- Engine ---------- */
  function fit(st) {
    var c = st.c, d = Math.min(devicePixelRatio || 1, 2), w = c.clientWidth, h = c.clientHeight;
    if (st.w !== w || st.h !== h) { st.w = w; st.h = h; c.width = w * d; c.height = h * d; st.ctx.setTransform(d, 0, 0, d, 0, 0); }
  }
  var VIZ = {};
  var stages = [];
  document.querySelectorAll("canvas[data-viz]").forEach(function (c) {
    var v = VIZ[c.dataset.viz], st = { c: c, ctx: c.getContext("2d"), visible: false };
    if (v[0]) v[0](st); stages.push({ st: st, draw: v[1], still: v[2] });
  });
  var visObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) { stages.forEach(function (s) { if (s.st.c === e.target) { s.st.visible = e.isIntersecting; if (reduce && e.isIntersecting) { fit(s.st); s.draw(s.st, s.still); } } }); });
  });
  stages.forEach(function (s) { visObs.observe(s.st.c); });
  var heroVisible = true;
  new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }).observe(hero);

  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    nav.classList.toggle("scrolled", scrollY > 30);
    navRight.classList.remove("hide");
    if (heroVisible) heroUpdate();
    expUpdate();
  }
  function onResize() { seedDots(); expLayout(); onScroll(); }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);
  expLayout(); heroUpdate(); onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  (function loop(t) {
    if (heroVisible) {
      if (!reduce) { if (Math.abs(cur.target - cur.r) > .5 || cur.r > 0) applyR(cur.r + (cur.target - cur.r) * .12); }
      fit(dots); drawDots(dots, reduce ? 0 : t);
    }
    fit(orb); drawOrb(orb, reduce ? 0 : t);
    if (!reduce) stages.forEach(function (s) { if (s.st.visible) { fit(s.st); s.draw(s.st, t); } });
    if (!reduce) requestAnimationFrame(loop);
  })(0);
})();
