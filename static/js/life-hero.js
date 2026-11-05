/* Homepage hero: Conway's Game of Life that settles into the digimind logo.
 *
 *   1. soup     – random cells evolve under normal Life rules
 *   2. converge – cells are progressively "pinned" to the logomark's squares
 *   3. hold     – the finished logomark holds briefly, then the SVG takes over
 *
 * The Life field is wider than the logomark (it spans the hero column,
 * centred on the logo); on narrow screens the logo is drawn smaller to fit.
 *
 * The hero <img> stays in the DOM (no-JS, reduced motion, screen readers).
 * When the animation ends the canvas is removed and the SVG shows again.
 * Click the logo to replay.
 *
 * Geometry is in the logomark SVG's own units (viewBox 1980 × 1414.29).
 */
(function () {
  "use strict";

  var img = document.querySelector(".home-hero-img");
  if (!img || !window.HTMLCanvasElement) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // ── Geometry ────────────────────────────────────────────────────────────
  var VW = 1980, VH = 1414.29;
  var COLOR = "#000";

  // Logomark: 7 × 5 grid of squares, origin (30, 21.43).
  var CELL = 274.29, MX = 30, MY = 21.43;
  var BLOCKS = [[2, 0], [1, 1], [0, 2], [2, 2], [1, 3], [2, 4],   // left bracket
                [4, 0], [5, 1], [4, 2], [6, 2], [5, 3], [4, 4]];  // right bracket

  // Width of the Life field: 10 logo squares centred on the logomark, plus a
  // little air either side (see .life-hero in _custom.scss).
  var HALF = 5 * CELL + CELL / 20;

  // Life cells: SUB per logo square.
  var SUB = 3, FC = CELL / SUB;

  // ── Timeline (ms) ───────────────────────────────────────────────────────
  var T_SOUP = 3000, T_CONV = 2400, T_END = 400, GEN_MS = 110;

  // Timing playground: override from the URL, e.g. /?soup=1200&conv=1800&gen=70&end=300
  (function () {
    var q = new URLSearchParams(location.search), v = function (name, d) {
      var n = parseFloat(q.get(name)); return isFinite(n) ? n : d;
    };
    T_SOUP = v("soup", T_SOUP); T_CONV = v("conv", T_CONV);
    T_END = v("end", T_END); GEN_MS = v("gen", GEN_MS);
  })();

  // ── Canvas ──────────────────────────────────────────────────────────────
  var holder = img.parentNode;              // .life-hero wrapper (layouts/index.html)
  if (!holder.classList.contains("life-hero")) return;
  holder.title = "Conway's Game of Life · Click to replay";
  var column = holder.parentNode;
  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext("2d");
  var k = 1, VX0 = 0, VW_C = VW;           // px per unit; visible x-range in units

  function layout() {
    holder.style.maxWidth = "";
    // The animation may spill into the empty gutter either side of the
    // column (2rem each: the text column's margin and this column's mr4).
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var colW = column.getBoundingClientRect().width + 4 * rem;
    var imgW = img.getBoundingClientRect().width;
    if (!imgW || !colW) return false;
    k = imgW / VW;
    // Too narrow for the full field at this scale → shrink the logo to fit.
    if (2 * HALF * k > colW) {
      k = colW / (2 * HALF);
      holder.style.maxWidth = (VW * k) + "px";
      imgW = VW * k;
    }
    var cw = Math.min(colW, 2 * HALF * k * 1.15);
    VW_C = cw / k;
    VX0 = VW / 2 - VW_C / 2;
    var dpr = window.devicePixelRatio || 1;
    canvas.style.width = cw + "px";
    canvas.style.left = ((imgW - cw) / 2) + "px";
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(VH * k * dpr);
    k *= dpr;                               // drawing scale in device pixels
    return true;
  }

  // Pixel-snapped rectangle in viewBox units (avoids hairline seams).
  function rect(x, y, w, h) {
    var x0 = Math.round((x - VX0) * k), y0 = Math.round(y * k);
    var x1 = Math.round((x + w - VX0) * k), y1 = Math.round((y + h) * k);
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }

  // ── Life ────────────────────────────────────────────────────────────────
  var FX, FY, COLS, ROWS, N, BX, BY, cells, next, target, lockAt;

  function seed() {
    // Grid aligned so SUB × SUB Life cells make up exactly one logo square.
    FX = MX - FC * Math.ceil((MX - VX0) / FC);
    FY = MY - FC * Math.ceil(MY / FC);
    COLS = Math.ceil((VX0 + VW_C - FX) / FC);
    ROWS = Math.ceil((VH - FY) / FC);
    BX = Math.round((MX - FX) / FC);
    BY = Math.round((MY - FY) / FC);
    N = COLS * ROWS;
    cells = new Uint8Array(N); next = new Uint8Array(N);
    target = new Uint8Array(N); lockAt = new Float32Array(N);

    BLOCKS.forEach(function (b) {
      for (var j = 0; j < SUB; j++) for (var i = 0; i < SUB; i++) {
        var x = BX + b[0] * SUB + i, y = BY + b[1] * SUB + j;
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) target[y * COLS + x] = 1;
      }
    });
    for (var q = 0; q < N; q++) {
      cells[q] = Math.random() < 0.3 ? 1 : 0;
      // On-target cells pin a little earlier so the shape emerges from the noise.
      lockAt[q] = target[q] ? Math.random() * 0.85 : 0.1 + Math.random() * 0.9;
    }
  }

  function step(progress) {
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        var q = y * COLS + x;
        if (progress >= lockAt[q]) { next[q] = target[q]; continue; }
        var n = 0;
        for (var dy = -1; dy <= 1; dy++) {
          var yy = y + dy;
          if (yy < 0 || yy >= ROWS) continue;
          for (var dx = -1; dx <= 1; dx++) {
            var xx = x + dx;
            if ((dx || dy) && xx >= 0 && xx < COLS) n += cells[yy * COLS + xx];
          }
        }
        next[q] = n === 3 || (n === 2 && cells[q]) ? 1 : 0;
      }
    }
    var t = cells; cells = next; next = t;
  }

  function drawLife() {
    for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
      if (cells[y * COLS + x]) rect(FX + x * FC, FY + y * FC, FC, FC);
    }
  }

  function drawLogo() {
    BLOCKS.forEach(function (b) { rect(MX + b[0] * CELL, MY + b[1] * CELL, CELL, CELL); });
  }

  // ── Main loop ───────────────────────────────────────────────────────────
  var t = 0, last = 0, genAcc = 0, running = false;
  var P1 = T_SOUP, P2 = P1 + T_CONV, P3 = P2 + T_END;

  function frame(now) {
    if (!running) return;
    // Clamp dt so a backgrounded tab resumes where it left off.
    var dt = last ? Math.min(now - last, 50) : 16;
    last = now; t += dt;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLOR;

    if (t < P2) {
      genAcc += dt;
      while (genAcc >= GEN_MS) {
        genAcc -= GEN_MS;
        step(t < P1 ? -1 : (t - P1) / T_CONV);
      }
      drawLife();
    } else if (t < P3) {
      drawLogo();
    } else {
      finish();
      return;
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || !layout()) return;
    seed();
    t = 0; last = 0; genAcc = 0; running = true;
    holder.classList.add("is-playing");
    if (!canvas.parentNode) holder.appendChild(canvas);
    requestAnimationFrame(frame);
  }

  function finish() {
    running = false;
    holder.classList.remove("is-playing");
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }

  // A resize mid-animation would change the grid; just skip to the end.
  window.addEventListener("resize", function () { if (running) finish(); });
  holder.addEventListener("click", start);

  // Play once the logo is actually on screen (it can start below the fold).
  function ready() {
    if (!window.IntersectionObserver) return start();
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); start(); }
    }, { threshold: 0.5 });
    io.observe(holder);
  }
  if (img.complete) ready(); else img.addEventListener("load", ready);
})();
