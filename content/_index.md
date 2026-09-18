---
title: "DigiMind Lab"
description: |
  The DigiMind Lab, led by Dr. Matteo Malgaroli in the Department of Psychiatry at the NYU Grossman School of Medicine, sits at the intersection of clinical psychology and artificial intelligence.

  Mental health is assessed and treated through language. We use AI to examine and generate language at scale, allowing us to make mental health interventions more scalable and objective. We develop and test digital tools to support care, including automated systems for psychiatric assessment and risk stratification, and we study how patients and clinicians interact with conversational AI so that it can be deployed more safely.
# Hero image (shown beside the intro). SVG so it stays crisp at any size.
hero_image: img/logo-primary.svg
# Social-sharing card (og:image / twitter:image). Must be a PNG/JPG, not SVG.
images:
  - img/og-image.png
image_left: false
text_align_left: true
show_social_links: false
show_action_link: true
action_link: /research
action_label: "Learn More &rarr;"
action_type: text

# ── Recent News ───────────────────────────────────────────────────────────
# Newest first. Each item is a date label + one sentence.
# Use [text](https://link) for links and *text* for italics.
# The homepage shows the first 7; the full list lives at /news/.
news:
  - date: "October 2026"
    text: '[DIAL](https://doi.org/10.48550/arXiv.2512.20773), our adversarial framework for realistic multi-turn user simulation (Zhu et al.), has been accepted at EMNLP 2026. We will present it in Budapest, October 24 to 29.'
  - date: "September 2026"
    text: 'We are presenting our research at the [ISTSS 42nd Annual Meeting](https://istss.org/annual-meeting-hub/) in San Antonio, September 23 to 26.'
  - date: "August 2026"
    text: 'Now out in *Psychological Medicine*: [Mermin et al., "Anxiety and depression subtypes and their psychotherapy response: A network analysis of 33,675 patients"](https://doi.org/10.1017/S0033291726105480).'
  - date: "January 2026"
    text: 'New preprint: [Brindle et al., "Language markers of emotion flexibility predict depression and anxiety treatment outcomes"](https://doi.org/10.48550/arXiv.2601.07961).'
  - date: "September 2025"
    text: 'Dr. Malgaroli co-organized the [Dagstuhl Seminar on Natural Language Processing for Mental Health](https://www.dagstuhl.de/25361) at Schloss Dagstuhl, Germany.'
  - date: "August 2025"
    text: '[VISTA-SSM](https://github.com/benjaminbrindle/vista_ssm), our state-space clustering method, is published in *Psychological Methods*.'
  - date: "April 2025"
    text: '*The Lancet Digital Health* commentary: [Large language models for the mental health community](https://doi.org/10.1016/S2589-7500(24)00255-3).'

# ── Funding & Support ─────────────────────────────────────────────────────
# Logos live in static/img/funders/ (lowercase filenames, must match exactly).
# To add a funder, copy a block and change the three lines.
funders:
  - name: National Institute of Mental Health
    url: https://www.nimh.nih.gov/
    logo: /img/funders/nimh.png
  - name: DARPA
    url: https://www.darpa.mil/
    logo: /img/funders/darpa.png
  - name: American Foundation for Suicide Prevention
    url: https://afsp.org/
    logo: /img/funders/afsp.png
  - name: Talkspace
    url: https://www.talkspace.com/
    logo: /img/funders/talkspace.png
  - name: Slingshot AI
    url: https://www.slingshot.xyz/
    logo: /img/funders/slingshot.png
  - name: New York University
    url: https://www.nyulangone.org/
    logo: /img/funders/nyu.png
  - name: Wellcome Trust
    url: https://wellcome.org/
    logo: /img/funders/wellcome.png
        
---

<!-- The homepage (hero text, Recent News, and Funding logos) is built from the
     front matter above and rendered by layouts/index.html. There is no body
     content to edit here. Add news under `news:` and funders under `funders:`. -->
