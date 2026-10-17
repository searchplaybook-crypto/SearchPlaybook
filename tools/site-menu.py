#!/usr/bin/env python3
"""Site menu generator: the single source of the page list.

Every page carries three marked blocks:
    <!-- site-menu:assets --> ... <!-- /site-menu:assets -->   (in <head>)
    <!-- site-menu:button --> ... <!-- /site-menu:button -->   (in the page header)
    <!-- site-menu:panel -->  ... <!-- /site-menu:panel -->    (just before </body>)

To add, rename or reorder a page, edit NAV below, then run from the repo root:
    python3 tools/site-menu.py
The script rewrites only what sits between the markers. Styles live in
assets/css/site-menu.css and behaviour in assets/js/site-menu.js.
"""
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGO = "https://ik.imagekit.io/wemustcreate/Shield.png?updatedAt=1777882057056"
WHATSAPP = "https://wa.me/27695326613"

# The site's pages, in menu order. (key, label, path, children)
NAV = [
    ("home", "Home", "", []),
    ("solutions", "Solutions and pricing", "solutions.html", []),
    ("intel", "Intel Hub", "intel.html", [
        ("ncii", "NCII protection guide", "intel/ncii.html"),
        ("case-studies", "Case studies", "intel/case-studies.html"),
        ("toolkit", "Job market toolkit", "intel/job-market-toolkit.html"),
    ]),
    ("collective", "Collective", "collective.html", []),
]
LEGAL = [
    ("privacy", "Privacy policy", "privacy.html"),
    ("terms", "Terms of service", "terms.html"),
]
CTA = ("Book your free DPA (R750 value) →", "solutions.html#service-dpa")

# Each page: how to reach the site root from it, which menu item it is,
# and (optionally) its own sections for an "On this page" list.
PAGES = {
    "index.html": {"base": "", "current": "home",
                   "sections": [("Solutions", "#solutions"), ("About", "#about")]},
    "solutions.html": {"base": "", "current": "solutions",
                       "sections": [("Overview", "#hero"), ("Limitations", "#problem"), ("Catalogue", "#catalogue"),
                                    ("How it works", "#how-it-works"), ("Coverage", "#matrix"), ("FAQ", "#faq")]},
    "intel.html": {"base": "", "current": "intel"},
    "collective.html": {"base": "", "current": "collective"},
    "privacy.html": {"base": "", "current": "privacy"},
    "terms.html": {"base": "", "current": "terms"},
    # GitHub Pages serves 404.html at any depth, so it links from the site root
    "404.html": {"base": "/", "current": None},
    "intel/ncii.html": {"base": "../", "current": "ncii",
                        "sections": [("Understand", "#understand"), ("Take Action", "#act"),
                                     ("Resources", "#resources"), ("Get Help Now", "#emergency")]},
    "intel/case-studies.html": {"base": "../", "current": "case-studies"},
    "intel/job-market-toolkit.html": {"base": "../", "current": "toolkit"},
}

MENU_ICON = ('<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
             'stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>')
CLOSE_ICON = ('<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
              'stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>')


def href(base, path):
    if path == "":
        return base or "./"
    return base + path


def link(base, current, key, label, path):
    here = key == current
    attrs = ' aria-current="page"' if here else ""
    tag = '<span class="sm-here" aria-hidden="true">You\'re here</span>' if here else ""
    return f'<a class="sm-link" href="{escape(href(base, path))}"{attrs}><span>{escape(label)}</span>{tag}</a>'


def render_assets(base):
    return (f'<link rel="stylesheet" href="{base}assets/css/site-menu.css">\n'
            f'<script src="{base}assets/js/site-menu.js" defer></script>')


def render_button():
    return ('<button type="button" class="sm-btn" popovertarget="site-menu" aria-controls="site-menu" data-site-menu-open>'
            f'{MENU_ICON}<span class="sm-btn-label">Menu</span></button>')


def render_panel(cfg):
    base, current = cfg["base"], cfg["current"]
    rows = []
    for key, label, path, children in NAV:
        item = link(base, current, key, label, path)
        if children:
            subs = "".join(f"<li>{link(base, current, k, l, p)}</li>" for k, l, p in children)
            item += f'<ul class="sm-sub">{subs}</ul>'
        rows.append(f"<li>{item}</li>")
    legal = "".join(f"<li>{link(base, current, k, l, p)}</li>" for k, l, p in LEGAL)

    sections = ""
    if cfg.get("sections"):
        items = "".join(f'<li><a class="sm-link" href="{a}"><span>{escape(l)}</span></a></li>' for l, a in cfg["sections"])
        sections = ('\n    <nav aria-label="On this page">\n      <p class="sm-label">On this page</p>\n'
                    f'      <ul class="sm-list sm-list--sections">{items}</ul>\n    </nav>')

    cta_label, cta_path = CTA
    return f"""<div id="site-menu" class="sm-panel" popover>
  <div class="sm-head">
    <div class="sm-brand">
      <img src="{LOGO}" alt="" width="32" height="32" loading="lazy">
      <span class="sm-brand-text"><span class="sm-brand-name">SEARCH <span>PLAYBOOK</span></span><span class="sm-brand-sub">WeMustCreate</span></span>
    </div>
    <button type="button" class="sm-close" popovertarget="site-menu" popovertargetaction="hide" aria-label="Close menu" data-site-menu-close>{CLOSE_ICON}</button>
  </div>
  <div class="sm-body">
    <nav aria-label="Site pages">
      <p class="sm-label">Pages</p>
      <ul class="sm-list">{"".join(rows)}</ul>
      <ul class="sm-list sm-list--legal">{legal}</ul>
    </nav>{sections}
  </div>
  <div class="sm-foot">
    <a class="sm-cta" href="{escape(href(base, cta_path))}">{escape(cta_label)}</a>
    <a class="sm-wa" href="{WHATSAPP}" target="_blank" rel="noopener">WhatsApp +27 69 532 6613</a>
  </div>
</div>"""


def replace_block(text, name, content, page):
    pattern = re.compile(rf"(<!-- site-menu:{name} -->)(.*?)(<!-- /site-menu:{name} -->)", re.S)
    if len(pattern.findall(text)) != 1:
        sys.exit(f"{page}: expected exactly one <!-- site-menu:{name} --> block")
    return pattern.sub(lambda m: f"{m.group(1)}\n{content}\n{m.group(3)}", text)


def main():
    for page, cfg in PAGES.items():
        path = ROOT / page
        text = path.read_text(encoding="utf-8")
        text = replace_block(text, "assets", render_assets(cfg["base"]), page)
        text = replace_block(text, "button", render_button(), page)
        text = replace_block(text, "panel", render_panel(cfg), page)
        path.write_text(text, encoding="utf-8")
        print("updated", page)


if __name__ == "__main__":
    main()
