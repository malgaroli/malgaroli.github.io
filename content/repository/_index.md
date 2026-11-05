---
title: "Repository"
description: "Open-source tools and datasets from the digimind lab."
layout: single
---

<div class="repo-grid">

  <article class="repo-card">
    <header class="has-logo">
      <img class="repo-logo" src="/img/repository/coralmind.png" alt="" width="48" height="48">
      <div>
        <h3>CoralMind Knowledge Library</h3>
        <p class="repo-subtitle">Evidence map of how AI conversations affect mental health</p>
      </div>
    </header>
    <p>A taxonomy that links behaviors you can see in human–AI transcripts to their effects on wellbeing. It covers 116 pathways, 28 impacts and 414 sources, and reviews the strength of the existing evidence.</p>
    <footer>
      <a href="https://map.coralmind.org/" target="_blank" rel="noopener">
        <i class="fas fa-globe"></i><span class="repo-url">map.coralmind.org</span>
      </a>
    </footer>
  </article>

  <article class="repo-card">
    <header class="has-logo">
      <img class="repo-logo" src="/img/repository/coralmind.png" alt="" width="48" height="48">
      <div>
        <h3>CoralMind Toolkit</h3>
        <p class="repo-subtitle">Simulation and evaluation for AI in mental health</p>
      </div>
    </header>
    <p>Simulates conversations with an AI system, scores them with AI judges against the Knowledge Library, and reports the results. Python package <code>corallab</code>.</p>
    <footer>
      <a href="https://github.com/coralmind/toolkit" target="_blank" rel="noopener">
        <i class="fab fa-github"></i><span class="repo-url">github.com/coralmind/toolkit</span>
      </a>
    </footer>
  </article>

  <article class="repo-card">
    <header class="has-logo">
      <img class="repo-logo" src="/img/repository/vista.png" alt="" width="48" height="48">
      <div>
        <h3>VISTA-SSM</h3>
        <p class="repo-subtitle">Longitudinal clustering for health data</p>
      </div>
    </header>
    <p>Varying and Irregular Sampling Time-series Analysis via State-Space Models, our clustering method for longitudinal psychological measurement data. Published in <em>Psychological Methods</em> (2025).</p>
    <footer>
      <a href="https://github.com/benjaminbrindle/vista_ssm" target="_blank" rel="noopener">
        <i class="fab fa-github"></i><span class="repo-url">github.com/benjaminbrindle/vista_ssm</span>
      </a>
    </footer>
  </article>

  <article class="repo-card">
    <header class="has-logo">
      <img class="repo-logo" src="/img/repository/who.jpg" alt="" style="transform: scale(1.2)" width="48" height="48">
      <div>
        <h3>ICD11-Psych</h3>
        <p class="repo-subtitle">WHO ICD-11 mental health diagnostic benchmark</p>
      </div>
    </header>
    <p>Benchmark and evaluation resources for mental-health diagnosis aligned with the WHO ICD-11 classification.</p>
    <footer>
      <a href="https://github.com/malgaroli/ICD11-Psych" target="_blank" rel="noopener">
        <i class="fab fa-github"></i><span class="repo-url">github.com/malgaroli/ICD11-Psych</span>
      </a>
    </footer>
  </article>

</div>

<style>
.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin: 2rem auto 3rem;
  max-width: 880px;
}
.repo-card {
  position: relative;
  padding: 1.75rem;
  border: 1px solid #E2E5EC;
  border-radius: 6px;
  background: #FFFFFF;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  flex-direction: column;
}
.repo-card:hover {
  border-color: #1A2D5C;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(26, 45, 92, 0.08);
}
/* Optional small logo beside the title: add class="has-logo" to the header
   and an <img class="repo-logo"> before the title block. */
.repo-card header.has-logo {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
.repo-card header.has-logo .repo-subtitle {
  margin-bottom: 0;
}
.repo-logo {
  flex: none;
  width: 48px;
  height: 48px;
  margin-top: 0.1rem;
  object-fit: contain;
}
.repo-card h3 {
  margin: 0 0 0.25rem 0;
  color: #1A2D5C;
  font-size: 1.35rem;
  line-height: 1.25;
}
.repo-card .repo-subtitle {
  margin: 0 0 1rem 0;
  color: #5A5A5A;
  font-size: 0.9rem;
  line-height: 1.4;
}
.repo-card > p {
  margin: 0 0 1.25rem 0;
  color: #2A2A2A;
  line-height: 1.55;
  flex: 1;
}
.page-main .repo-card footer a {
  display: inline-flex;
  align-items: baseline;
  max-width: 100%;
  color: #1A2D5C;
  text-decoration: none;
  font-size: 0.85rem;
}
/* Underline only the address, not the icon or the gap after it; keep it on
   one line and cut it off with an ellipsis if the card is very narrow. */
.repo-card .repo-url {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: underline;
  text-decoration-color: #A8A8A4;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}
.page-main .repo-card footer a:hover {
  color: #5A6FA0;
}
.repo-card footer a:hover .repo-url {
  text-decoration-color: currentColor;
}
/* Make the whole card clickable: the GitHub link is stretched to cover
   the entire card, while its visible address stays in the footer. */
.repo-card footer a::after {
  content: "";
  position: absolute;
  inset: 0;
}
.repo-card footer .fa-github,
.repo-card footer .fa-globe {
  margin-right: 0.45rem;
}
</style>
