#!/usr/bin/env python3
"""Intel guide generator: writes the six W04 to W09 guide pages in /intel/.

The guide text lives in GUIDES below, so each guide is written once. Run from the repo root:
    python3 tools/build-guides.py
    python3 tools/site-menu.py        (fills in the menu and keeps it in step)
Then check intel.html and insights.html still link to the slugs listed here.
The pages reuse assets/css/intel-dashboard.css, assets/css/footer.css and the footer in
assets/partials/footer.html, so there is no page-specific CSS to maintain.
"""
import json
from html import escape
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://wemustcreate.online"
LOGO = "https://ik.imagekit.io/wemustcreate/Shield.png?updatedAt=1777882057056"
WA = "https://wa.me/27695326613?text="
CHECKED = "31 October 2026"

GUIDES = [
    {
        "slug": "google-business-profile", "id": "W04", "tag": "Visibility",
        "title": "Google Business Profile: get verified, then let Gemini help",
        "short": "Google Business Profile guide",
        "desc": "How to claim and verify your Google Business Profile in South Africa, what to expect from video verification, and how to keep the listing accurate afterwards.",
        "lede": "Claim your listing, get it verified, and keep the details right so customers see your hours, photos and phone number first.",
        "why": [
            "Most customers check Google before they call or visit. Your Business Profile is what they see on Maps and in search, so it works as your shop window.",
            "Verification is where most new profiles get stuck. It now takes planning, and an unverified profile cannot be fully managed.",
        ],
        "groups": [
            ("Before you start", [
                ("Make your details match everywhere.", "Use your trading name, a +27 phone number and your address exactly as on your door, website and social pages."),
                ("Keep the profile's phone number answered.", "Google may contact it by call, text or WhatsApp during verification. Tell whoever answers, because replies you give can appear on your profile."),
            ]),
            ("Verify", [
                ("Claim or add the business on Google Maps and choose “Verify”.", "Google picks the method. Video is now the most common. Phone or email appear for some older profiles. Postcards are rare."),
                ("If it is a video, record it at the business.", "Aim for 1 to 2 minutes and show the signage, the location, your equipment or stock, and proof that you manage the business. Avoid showing faces or sensitive documents. Watch it before you send it."),
                ("Allow up to 5 business days.", "If Google asks you to verify again after you change your name, address, category or hours, complete it. If no method works, contact Google support with photos of your signage, a recent utility bill and your website address."),
            ]),
            ("After you are verified", [
                ("If Gemini is available for your account, connect the profile to it.", "It can help update your hours, contacts and photos, draft replies to reviews, and report on impressions, website clicks and direction requests. Read every reply before it goes live."),
            ]),
        ],
        "mistakes": [
            "Changing the business name, address or category straight after verifying, which can trigger a new verification.",
            "Recording the verification video away from the business, or showing faces or sensitive documents.",
            "Letting the profile's phone number go unanswered while Google is trying to reach you.",
            "Posting AI-drafted replies to reviews without reading them first.",
        ],
        "check": [
            "The profile is verified and shows the right name, address, hours and +27 number.",
            "Someone is named to answer the phone number linked to the profile.",
            "You know where to find impressions, website clicks and direction requests.",
        ],
        "cta": ("Prefer not to do it yourself?", "We claim, verify and fill in your listing for you.", "See the Google Map Pack setup", "/solutions.html#map-pack",
                "Hi Max, I read the Google Business Profile guide and I need help getting verified."),
        "related": ["near-me-searches", "identity-consistency"],
    },
    {
        "slug": "near-me-searches", "id": "W05", "tag": "Visibility",
        "title": "How to rank in “near me” searches",
        "short": "Near me searches guide",
        "desc": "What decides who appears in local “near me” searches in South Africa, and the six things you can control: verification, details, category, photos, reviews and address.",
        "lede": "Google matches local buyers to businesses using relevance, distance and prominence. You cannot pay for a better ranking, but you control more of it than you think.",
        "why": [
            "People search for “near me” when they are ready to buy, often from a phone. Appearing there puts you in front of customers who are already close by.",
            "Google says local results depend on relevance, distance and prominence. Two of those three are in your hands.",
        ],
        "groups": [
            ("Six things to do, in order", [
                ("Get verified.", "A verified profile is more likely to appear in search results. See the Google Business Profile guide."),
                ("Fill in every detail.", "Use your full address if customers visit, regular and special opening hours, and attributes such as parking or Wi-Fi. Wrong details can stop you appearing for the right searches."),
                ("Choose the category that best describes what you sell.", "It is how Google matches you to what people search for."),
                ("Add photos and videos", "of what you offer, so people can see it before they visit."),
                ("Ask happy customers for reviews, and reply to every review.", "Reviews, ratings and links from other websites all add to how well known you are."),
                ("Check your address is exactly right.", "Distance is the one factor you cannot change, because Google measures it from where the customer is to where you are."),
            ]),
        ],
        "mistakes": [
            "Choosing a broad category such as “Store” when a more exact one exists.",
            "Leaving opening hours out of date after load shedding or holiday changes.",
            "Asking for reviews only once, then never replying to the ones you get.",
            "Trying to buy or fake reviews, which puts the whole profile at risk.",
        ],
        "check": [
            "The profile is verified and the category matches what you actually sell.",
            "Hours, address and phone number are correct today.",
            "Your last five reviews all have a reply.",
        ],
        "cta": ("Prefer not to do it yourself?", "We build this into your visibility work.", "See visibility work", "/solutions.html#service-visibility",
                "Hi Max, I read the near me searches guide and I would like help with my local visibility."),
        "related": ["google-business-profile", "identity-consistency"],
    },
    {
        "slug": "consent-basics", "id": "W06", "tag": "Privacy",
        "title": "Data collection and consent basics",
        "short": "Data collection and consent guide",
        "desc": "A plain guide to collecting customer details the POPIA way: ask only for what you need, explain why, make consent a real choice, and keep a record.",
        "lede": "Tell people why you need their details, how you will use them, and give them an easy way to opt out. This is general information, not legal advice.",
        "why": [
            "Any business that collects names, phone numbers or email addresses is handling personal information, and the Protection of Personal Information Act (POPIA) applies to it.",
            "Customers also notice. A clear, honest explanation of why you need their details builds trust before the first order.",
        ],
        "groups": [
            ("Six steps", [
                ("Ask only for what you need.", "Decide why you need each detail before you ask for it."),
                ("Say why, in plain words.", "Tell people why you are collecting their details, how you will use them and who you will share them with. “We may use your data for anything” is not good enough."),
                ("Where you need consent, make it a real choice.", "It must be voluntary, specific and informed. No pre-ticked boxes, silence is not consent, and do not bury it in terms people cannot refuse."),
                ("Know when you do not need consent.", "For an order, an invoice or a contract, another lawful reason usually applies. Consent matters most for optional extras such as newsletters and marketing."),
                ("Marketing by email, SMS or other electronic message needs prior consent,", "unless the person is an existing customer under the Act’s conditions. Every message should say who sent it and give an easy way to opt out. Stop when someone objects."),
                ("Keep a record.", "Note when and how each person agreed, and any time they withdrew. The burden of proof is on you."),
            ]),
        ],
        "mistakes": [
            "Pre-ticking a marketing box on a form.",
            "Adding customers to a newsletter because they placed an order.",
            "Collecting more details than the order needs, such as an ID number for a simple enquiry.",
            "Having no record of when someone agreed, so you cannot show consent if asked.",
        ],
        "check": [
            "Every form or chat that collects details says why you want them.",
            "Marketing consent is a separate, unticked choice.",
            "You can find out when and how a person agreed.",
        ],
        "cta": ("Want to see where you stand?", "General information, not legal advice. For your own situation, speak to a qualified adviser. We can check how your site and forms collect details.", "Book your free Digital Presence Assessment", "/solutions.html#service-dpa",
                "Hi Max, I read the consent basics guide and I would like a Digital Presence Assessment."),
        "related": ["spotting-fake-providers", "domain-ownership"],
    },
    {
        "slug": "identity-consistency", "id": "W07", "tag": "Privacy",
        "title": "Identity consistency checklist",
        "short": "Identity consistency guide",
        "desc": "A checklist for making your business name, address and +27 phone number match everywhere online, so Google and customers trust your details.",
        "lede": "Google trusts details that match everywhere, and so do customers. Check these in order.",
        "why": [
            "When your name, address or phone number differ between your website, your Google profile and your social pages, both people and search engines have to guess which one is right.",
            "A wrong or old phone number also sends real customers to the wrong place. Matching details are cheap to keep and costly to repair.",
        ],
        "groups": [
            ("Five steps", [
                ("Write your master copy once.", "Your trading name, your address and your phone number in +27 format, exactly as they should appear."),
                ("Check the main places.", "Your Google Business Profile, your website (contact page and footer), Facebook and other social pages, review sites and business directories."),
                ("Fix the mistakes that change the meaning.", "A wrong or old phone number, an old address, or a different business name. Small formatting differences, such as “St” and “Street”, are generally fine."),
                ("Start with the most visible listings.", "Errors are quick to create and slow to fix, so fix what customers see first."),
                ("Check again after any change.", "A move, a new number or a new name means going through the list once more."),
            ]),
        ],
        "mistakes": [
            "Using a personal cellphone number on one profile and the business line on another.",
            "Forgetting an old directory listing that still shows your previous address.",
            "Changing the trading name on one platform only.",
        ],
        "check": [
            "You have one saved master copy of your name, address and +27 number.",
            "Google, your website and your social pages all show that exact copy.",
            "Old listings with a wrong number or address are fixed or removed.",
        ],
        "cta": ("Prefer not to do it yourself?", "We make your name, address and phone number match everywhere as part of your visibility work.", "See visibility work", "/solutions.html#service-visibility",
                "Hi Max, I read the identity consistency guide and I would like my business details checked."),
        "related": ["google-business-profile", "near-me-searches"],
    },
    {
        "slug": "spotting-fake-providers", "id": "W08", "tag": "Safety",
        "title": "Spotting fake service providers",
        "short": "Spotting fake providers guide",
        "desc": "Six checks to run before paying anyone to build or manage your online presence in South Africa: CIPC registration, address, reviews, pricing, payment method and ownership.",
        "lede": "Before you pay anyone to build or manage your online presence, run through these checks.",
        "why": [
            "Small business owners are a common target for providers who take a deposit and disappear, or who build a site they then refuse to hand over.",
            "The checks below take about 15 minutes and cost nothing. They are easier than trying to get money or accounts back afterwards.",
        ],
        "groups": [
            ("Six checks", [
                ("Check they are registered.", "Find their registration number and look it up on the CIPC company search."),
                ("Check the address.", "Find it on a map. Be careful if you cannot find it or it does not look like a real business."),
                ("Find their contact details somewhere other than their own website,", "such as a directory, a social page or a Google listing. Search for reviews and other people’s experiences before you pay."),
                ("Be careful of prices far below everyone else’s,", "and of pressure to pay today. If it seems too good to be true, it probably is."),
                ("Look closely at how they want to be paid.", "If they insist on EFT only, you have no way to dispute or reverse the payment."),
                ("Get the price and what you receive in writing,", "make sure your domain and accounts are registered in your name, and never share passwords until you have checked who you are dealing with."),
            ]),
        ],
        "mistakes": [
            "Paying the full amount upfront because of a “today only” price.",
            "Taking the provider’s word that the domain is “in your name” without checking.",
            "Sharing a Google or Facebook password instead of adding the provider as a manager.",
            "Relying on testimonials that appear only on the provider’s own website.",
        ],
        "check": [
            "You found the company on the CIPC search and the address exists.",
            "You found the provider mentioned somewhere they do not control.",
            "The price, what you receive and who owns the domain are in writing.",
        ],
        "cta": ("Not sure about a provider?", "We will tell you where you stand.", "Book your free Digital Presence Assessment", "/solutions.html#service-dpa",
                "Hi Max, I read the guide on spotting fake providers and I would like a second opinion on a quote."),
        "related": ["domain-ownership", "consent-basics"],
    },
    {
        "slug": "domain-ownership", "id": "W09", "tag": "Safety",
        "title": "Verify you own your domain",
        "short": "Domain ownership guide",
        "desc": "How to check that you, not your web designer, own your domain name: registered owner, registrar login, auto-renew, transfer lock and a backup contact.",
        "lede": "If your web designer registered your domain, they may own it, not you. Check these in order.",
        "why": [
            "Your domain is your website address and your email address. If you do not control it, you can lose your site, your email and your search history in one move.",
            "Domains also expire. A missed renewal can take a business offline, so a backup contact matters as much as ownership.",
        ],
        "groups": [
            ("Six steps", [
                ("Find out who the registered owner is.", "Look your domain up at your registrar. The owner should be you or your business, not your web designer."),
                ("Log in to the registrar account yourself.", "If you cannot, you do not control the domain. Use an email address you control."),
                ("Turn on auto-renew,", "with a payment method that will not expire. Renewal reminders should go to an email you read. A .co.za domain can be renewed for up to five years."),
                ("Keep the transfer lock on.", "It blocks unauthorised transfers. A .co.za domain has no authorisation code, only lock and unlock, so the lock is your main protection."),
                ("Name a backup contact,", "a second email address or a person you trust, so renewals and access do not depend on one phone or one person."),
                ("Write down", "your registrar, the login email and the renewal date, and keep the note somewhere safe."),
            ]),
        ],
        "mistakes": [
            "Letting the web designer register the domain under their own name “to make it easier”.",
            "Using a registrar login email that is no longer read.",
            "Paying for renewal with a card that expires before the renewal date.",
            "Unlocking the domain to “test” a transfer and forgetting to lock it again.",
        ],
        "check": [
            "The registered owner is you or your business.",
            "You can log in to the registrar account without help.",
            "Auto-renew is on, the lock is on, and a backup contact is named.",
        ],
        "cta": ("Prefer not to do it yourself?", "Account ownership is part of our Cyber Hygiene check.", "See the Cyber Hygiene check", "/solutions.html#service-safety",
                "Hi Max, I read the domain ownership guide and I would like my domain and accounts checked."),
        "related": ["spotting-fake-providers", "consent-basics"],
    },
]
BY_SLUG = {g["slug"]: g for g in GUIDES}

FOOTER = (ROOT / "assets/partials/footer.html").read_text(encoding="utf-8").rstrip("\n")


def jsonld(g):
    url = f"{SITE}/intel/{g['slug']}.html"
    data = {
        "@context": "https://schema.org", "@type": "WebPage",
        "name": f"{g['short']} | Intel Hub", "description": g["desc"], "url": url, "inLanguage": "en-ZA",
        "dateModified": "2026-10-31",
        "isPartOf": {"@type": "WebSite", "name": "WeMustCreate", "url": f"{SITE}/"},
        "publisher": {"@id": f"{SITE}/#organization"},
        "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Intel Hub", "item": f"{SITE}/intel.html"},
            {"@type": "ListItem", "position": 3, "name": g["short"], "item": url}]},
    }
    return json.dumps(data, indent=2, ensure_ascii=False)


def panel(title_id, label, tag, heading, body_html):
    return f"""        <article class="win panel" aria-labelledby="{title_id}">
          <div class="win-bar" aria-hidden="true"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span><span class="win-id">{escape(label)}</span></div>
          <div class="win-body">
            <p class="win-tag">{escape(tag)}</p>
            <h2 id="{title_id}">{heading}</h2>
{body_html}
          </div>
        </article>"""


def render(g):
    title = escape(g["title"])
    url = f"{SITE}/intel/{g['slug']}.html"
    page_title = f"{escape(g['short'])} | Intel Hub"
    desc = escape(g["desc"], quote=True)

    why = "\n".join(f"            <p>{escape(p)}</p>" for p in g["why"])

    steps = []
    n = 1
    for heading, items in g["groups"]:
        steps.append(f"            <h3 class=\"guide-sub\">{escape(heading)}</h3>")
        start = f' start="{n}"' if n > 1 else ""
        lis = "".join(f"<li><strong>{escape(b)}</strong> {escape(t)}</li>" for b, t in items)
        steps.append(f"            <ol{start}>{lis}</ol>")
        n += len(items)

    mistakes = "<ul>" + "".join(f"<li>{escape(m)}</li>" for m in g["mistakes"]) + "</ul>"
    check = "<ul>" + "".join(f"<li>{escape(c)}</li>" for c in g["check"]) + "</ul>"

    related = "".join(
        f'<li><a class="text-link" href="{r}.html">{escape(BY_SLUG[r]["title"])}</a></li>' for r in g["related"]
    )
    related += '<li><a class="text-link" href="../insights.html">All insights and ideas</a></li>'

    cta_head, cta_text, cta_link_label, cta_link, wa_text = g["cta"]
    wa = WA + quote(wa_text, safe="")

    panels = "\n".join([
        panel("why-title", "Why it matters", g["tag"], "Why it matters", why),
        panel("steps-title", "Steps", g["tag"], "What to do", "\n".join(steps)),
        panel("mistakes-title", "Avoid", g["tag"], "Common mistakes", f"            {mistakes}"),
        panel("check-title", "Check", g["tag"], "Quick check", f"            <p>You are done when:</p>\n            {check}"),
        panel("related-title", "Next", "Keep going", "Related guides", f'            <ul class="guide-related">{related}</ul>'),
    ])

    return f"""<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="{LOGO}" type="image/png">
  <title>{page_title}</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="{url}">
  <link rel="sitemap" type="application/xml" href="../sitemap.xml">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="WeMustCreate">
  <meta property="og:locale" content="en_ZA">
  <meta property="og:title" content="{page_title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{LOGO}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{page_title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{LOGO}">
  <meta name="theme-color" content="#09090B">
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../assets/css/intel-dashboard.css">
  <script type="application/ld+json">
{jsonld(g)}
  </script>
<!-- site-menu:assets -->
<!-- /site-menu:assets -->
  <link rel="stylesheet" href="/assets/css/footer.css">
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header class="site-header">
    <div class="header-inner">
      <a href="../" class="logo" aria-label="WeMustCreate home">
        <img src="{LOGO}" alt="" width="32" height="32">
        <span class="logo-text">SEARCH <span>PLAYBOOK</span></span>
      </a>
      <!-- site-menu:button -->
<!-- /site-menu:button -->
      <nav class="site-nav" aria-label="Primary">
        <ul>
          <li><a href="../">Home</a></li>
          <li><a href="../solutions.html">Solutions</a></li>
          <li><a href="../collective.html">Collective</a></li>
          <li><a href="../intel.html" aria-current="page">Intel Hub</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol><li><a href="../">Home</a></li><li><a href="../intel.html">Intel Hub</a></li><li aria-current="page">{escape(g['short'])}</li></ol>
    </nav>
    <section class="page-head" aria-labelledby="page-title">
      <p class="eyebrow">Intel &middot; {g['id']} &middot; {escape(g['tag'])}</p>
      <h1 id="page-title">{title}</h1>
      <p class="lede">{escape(g['lede'])}</p>
    </section>

    <div class="panel-stack">
{panels}
    </div>

    <p class="fine-print">General information for South African small businesses. Last checked {CHECKED}. Rules and Google features change, so confirm current details before you act.</p>

    <section class="cta-panel" aria-labelledby="ask-title">
      <h2 id="ask-title">{escape(cta_head)}</h2>
      <p>{escape(cta_text)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="{cta_link}">{escape(cta_link_label)} <span aria-hidden="true">&rarr;</span></a>
        <a class="btn btn-outline" href="{wa}" target="_blank" rel="noopener">Ask on WhatsApp</a>
      </div>
    </section>
  </main>

{FOOTER}
<!-- site-menu:panel -->
<!-- /site-menu:panel -->
</body>
</html>
"""


def main():
    out = ROOT / "intel"
    for g in GUIDES:
        (out / f"{g['slug']}.html").write_text(render(g), encoding="utf-8")
        print("wrote", f"intel/{g['slug']}.html")


if __name__ == "__main__":
    main()
