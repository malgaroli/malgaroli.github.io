---
title: "Repository"
description: "Open-source tools and datasets from the DigiMind Lab."
layout: single
---

<div class="repo-grid">

  <article class="repo-card">
    <header>
      <h3>VISTA-SSM</h3>
      <p class="repo-subtitle">Longitudinal Clustering for Health Data</p>
    </header>
    <p>Varying and Irregular Sampling Time-series Analysis via State-Space Models — our clustering method for longitudinal psychological measurement data. Published in <em>Psychological Methods</em> (2025).</p>
    <footer>
      <a href="https://github.com/benjaminbrindle/vista_ssm" target="_blank" rel="noopener">
        <i class="fab fa-github"></i> github.com/benjaminbrindle/vista_ssm
      </a>
    </footer>
  </article>

  <article class="repo-card">
    <header>
      <h3>ICD11-Psych</h3>
      <p class="repo-subtitle">WHO ICD-11 Mental Health Diagnostic Benchmark</p>
    </header>
    <p>Benchmark and evaluation resources for mental-health diagnosis aligned with the WHO ICD-11 classification.</p>
    <footer>
      <a href="https://github.com/malgaroli/ICD11-Psych" target="_blank" rel="noopener">
        <i class="fab fa-github"></i> github.com/malgaroli/ICD11-Psych
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
}
.repo-card > p {
  margin: 0 0 1.25rem 0;
  color: #2A2A2A;
  line-height: 1.55;
  flex: 1;
}
.repo-card footer a {
  color: #1A2D5C;
  text-decoration: none;
  font-size: 0.9rem;
}
.repo-card footer a:hover {
  color: #5A6FA0;
  text-decoration: underline;
}
/* Make the whole card clickable: the GitHub link is stretched to cover
   the entire card, while its visible address stays in the footer. */
.repo-card footer a::after {
  content: "";
  position: absolute;
  inset: 0;
}
.repo-card footer .fa-github {
  margin-right: 0.45rem;
}
</style>
