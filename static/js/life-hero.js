/* Homepage hero: Conway's Game of Life that settles into the digimind logo.
 *
 *   1. soup     – random cells evolve under normal Life rules
 *   2. converge – cells are progressively "pinned" to the open-lockup brackets
 *   3. write    – "digi / mind / lab" is typed in between the brackets
 *   4. close    – text fades and the brackets step together into the logomark
 *
 * Everything is drawn at ONE scale: the logo squares are the same size from
 * the first Life cell to the final frame. Because the open lockup is 12
 * squares wide (vs 7 for the logomark), the canvas spans the whole hero
 * column, centred on the logo. If the column is too narrow for that (phones),
 * the logo itself is drawn a little smaller so the scale still never changes.
 *
 * The hero <img> stays in the DOM (no-JS, reduced motion, screen readers).
 * When the animation ends the canvas is removed and the original SVG shows
 * again, so the final state is pixel-identical to the static page.
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
  var LEFT  = [[2, 0], [1, 1], [0, 2], [2, 2], [1, 3], [2, 4]];
  var RIGHT = [[4, 0], [5, 1], [4, 2], [6, 2], [5, 3], [4, 4]];

  // Open state at the same scale, centred on the logomark: each bracket sits
  // 1.5 squares further out (3 squares apart in total). This is tighter than
  // the official lockup (5 apart) so the logo can be larger at rest; the
  // lockup text is scaled down by TEXT_FIT to sit between the brackets.
  var OPEN_L = 1.5, OPEN_SHIFT = 3, TEXT_FIT = 0.78;
  var OX = MX - OPEN_L * CELL;               // x of the open lockup's column 0
  // Horizontal extent the open lockup needs, plus a little air either side.
  var NEED_L = VW / 2 - OX + CELL / 20;
  var NEED_R = MX + (7 + OPEN_SHIFT - OPEN_L) * CELL - VW / 2 + CELL / 20;
  var HALF = Math.max(NEED_L, NEED_R);

  // Life cells: SUB per logo square.
  var SUB = 3, FC = CELL / SUB;

  // Lockup SVG → our units (its bracket square is 165.1), and the centre of
  // its bracket grid (12 × 5 squares), which we map onto our open state's centre.
  var LK = CELL / 165.1 * TEXT_FIT, LCX = 990, LCY = 2.5 * 165.1;

  // ── Timeline (ms) ───────────────────────────────────────────────────────
  var T_SOUP = 3000, T_CONV = 2400, T_HOLD1 = 300, T_WRITE = 1500,
      T_HOLD2 = 1100, T_FADE = 350, T_STEP = 140;
  // Closing steps as [left, right] offsets from the open state's column 0:
  // one square in from each side, then a final half square each to land
  // exactly on the logomark (left 1.5, right 1.5).
  var STEPS = [[1, 3], [1, 2], [1.5, 1.5]];
  var GEN_MS = 110;

  // ── Canvas ──────────────────────────────────────────────────────────────
  var holder = img.parentNode;              // .life-hero wrapper (layouts/index.html)
  if (!holder.classList.contains("life-hero")) return;
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
    // Too narrow for the open lockup at this scale → shrink the logo to fit.
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

  // ── Text paths from the open lockup SVG ──────────────────────────────────
  var textLines = null; // [{paths:[Path2D], x0, x1}] for digi / mind / lab
  function loadText() {
    if (!window.Path2D || !window.fetch) return;
    var url = img.getAttribute("data-lockup");
    if (!url) return;
    fetch(url).then(function (r) { return r.text(); }).then(function (src) {
      var doc = new DOMParser().parseFromString(src, "image/svg+xml");
      var svg = document.importNode(doc.documentElement, true);
      // Mount off-screen briefly so getBBox() gives real glyph bounds.
      svg.setAttribute("style", "position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden");
      document.body.appendChild(svg);
      var g = svg.querySelector("g");
      var lines = [0, 1, 2].map(function () { return { paths: [], x0: 1e9, x1: -1e9 }; });
      if (g) Array.prototype.forEach.call(g.children, function (el) {
        var tag = el.tagName.toLowerCase(), d;
        if (tag === "path") d = el.getAttribute("d");
        else if (tag === "polygon") d = "M" + el.getAttribute("points").trim() + "Z";
        else if (tag === "rect") {
          d = "M" + el.getAttribute("x") + " " + el.getAttribute("y") + "h" + el.getAttribute("width") +
              "v" + el.getAttribute("height") + "h-" + el.getAttribute("width") + "Z";
        } else return;
        var b = el.getBBox();
        // Bucket by vertical centre: digi ≈ 180–300, mind ≈ 405–520, lab ≈ 720.
        var cy = b.y + b.height / 2;
        var L = lines[cy < 350 ? 0 : cy < 600 ? 1 : 2];
        L.paths.push(new Path2D(d));
        L.x0 = Math.min(L.x0, b.x);
        L.x1 = Math.max(L.x1, b.x + b.width);
      });
      document.body.removeChild(svg);
      if (lines.every(function (L) { return L.paths.length; })) textLines = lines;
    }).catch(function () {});
  }

  // ── Life ────────────────────────────────────────────────────────────────
  var FX, FY, COLS, ROWS, N, BX, BY, cells, next, target, lockAt;

  function seed() {
    // Grid aligned so SUB × SUB Life cells make up exactly one logo square.
    FX = OX - FC * Math.ceil((OX - VX0) / FC);
    FY = MY - FC * Math.ceil(MY / FC);
    COLS = Math.ceil((VX0 + VW_C - FX) / FC);
    ROWS = Math.ceil((VH - FY) / FC);
    BX = Math.round((OX - FX) / FC);
    BY = Math.round((MY - FY) / FC);
    N = COLS * ROWS;
    cells = new Uint8Array(N); next = new Uint8Array(N);
    target = new Uint8Array(N); lockAt = new Float32Array(N);

    LEFT.concat(RIGHT.map(function (b) { return [b[0] + OPEN_SHIFT, b[1]]; })).forEach(function (b) {
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

  // Brackets with the left one shifted `l` squares and the right one at `r`
  // squares, both measured from the open lockup's column 0.
  function drawBlocks(l, r) {
    LEFT.forEach(function (b) { rect(OX + (b[0] + l) * CELL, MY + b[1] * CELL, CELL, CELL); });
    RIGHT.forEach(function (b) { rect(OX + (b[0] + r) * CELL, MY + b[1] * CELL, CELL, CELL); });
  }

  function drawText(writeP, alpha) {
    if (!textLines || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    var s = k * LK;
    var cx = (OX + (7 + OPEN_SHIFT) / 2 * CELL - VX0) * k, cy = (MY + 2.5 * CELL) * k;
    ctx.setTransform(s, 0, 0, s, cx - LCX * s, cy - LCY * s);
    // Lines are typed one after another, in character-sized steps.
    for (var i = 0; i < 3; i++) {
      var lp = Math.max(0, Math.min(1, writeP * 3 - i));
      if (lp <= 0) break;
      var L = textLines[i], chars = i === 2 ? 3 : 4;
      var shown = Math.ceil(lp * chars) / chars;
      ctx.save();
      ctx.beginPath();
      ctx.rect(L.x0, -100, (L.x1 - L.x0) * shown, 1100);
      ctx.clip();
      L.paths.forEach(function (p) { ctx.fill(p); });
      ctx.restore();
    }
    ctx.restore();
  }

  // ── Main loop ───────────────────────────────────────────────────────────
  var t = 0, last = 0, genAcc = 0, running = false;
  var P1 = T_SOUP, P2 = P1 + T_CONV, P3 = P2 + T_HOLD1, P4 = P3 + T_WRITE,
      P5 = P4 + T_HOLD2, P6 = P5 + T_FADE, P7 = P6 + T_STEP * STEPS.length + 200;

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
    } else if (t < P6) {
      drawBlocks(0, OPEN_SHIFT);
      var fade = t < P5 ? 1 : 1 - (t - P5) / T_FADE;
      if (t >= P3) drawText(Math.min(1, (t - P3) / T_WRITE), fade);
    } else if (t < P7) {
      var st = STEPS[Math.min(STEPS.length - 1, Math.floor((t - P6) / T_STEP))];
      drawBlocks(st[0], st[1]);
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

  loadText();
  if (img.complete) start(); else img.addEventListener("load", start);
})();
