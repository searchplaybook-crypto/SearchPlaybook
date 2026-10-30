/*
 * WeMustCreate analytics consent (POPIA).
 * Google Analytics does not load until the visitor accepts.
 * Consent Mode v2 defaults to denied. Rejecting loads nothing from Google.
 * The choice is stored locally so the banner is not shown again.
 * Single source for every page that uses analytics.
 */
(function () {
  'use strict';

  var GA_ID = 'G-FZKPVQY1GB';
  var KEY = 'wmc_analytics_consent';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function readChoice() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function saveChoice(value) {
    try { window.localStorage.setItem(KEY, value); } catch (e) { /* storage unavailable: choice applies to this visit only */ }
  }

  var gaLoaded = false;
  function loadAnalytics() {
    if (gaLoaded) { return; }
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  var css = [
    '.wmc-consent{position:fixed;left:0;right:0;bottom:0;z-index:1300;background:#18181B;color:#E4E4E7;border-top:2px solid #D4AF37;padding:16px;font-family:"Open Sans",system-ui,sans-serif;font-size:15px;line-height:1.5;}',
    '.wmc-consent[hidden]{display:none;}',
    '.wmc-consent__inner{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:12px;}',
    '.wmc-consent a{color:#D4AF37;}',
    '.wmc-consent__actions{display:flex;flex-wrap:wrap;gap:8px;}',
    '.wmc-consent button,.wmc-consent-open{min-height:44px;padding:8px 16px;border-radius:12px;font:inherit;font-weight:700;cursor:pointer;border:2px solid #D4AF37;background:#D4AF37;color:#18181B;}',
    '.wmc-consent button.wmc-consent__reject{background:transparent;color:#D4AF37;}',
    '.wmc-consent-open{background:transparent;color:#D4AF37;margin:8px 0;}',
    '.wmc-consent button:focus-visible,.wmc-consent-open:focus-visible,.wmc-consent a:focus-visible{outline:2px solid #43CFFD;outline-offset:2px;}',
    '@media (prefers-reduced-motion: reduce){.wmc-consent *{transition:none!important;animation:none!important;}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var banner = null;

  function hideBanner() { if (banner) { banner.hidden = true; } }

  function grant() {
    saveChoice('granted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadAnalytics();
    hideBanner();
  }

  function deny() {
    saveChoice('denied');
    gtag('consent', 'update', { analytics_storage: 'denied' });
    hideBanner();
  }

  function buildBanner() {
    banner = document.createElement('section');
    banner.className = 'wmc-consent';
    banner.setAttribute('aria-labelledby', 'wmc-consent-title');
    banner.innerHTML =
      '<div class="wmc-consent__inner">' +
        '<p id="wmc-consent-title"><strong>Analytics choice.</strong> We use Google Analytics to see how this site is used. It runs only if you accept. Reject and nothing is sent to Google from this page. Read our <a href="/privacy.html">Privacy Policy</a>.</p>' +
        '<div class="wmc-consent__actions">' +
          '<button type="button" class="wmc-consent__accept">Accept analytics</button>' +
          '<button type="button" class="wmc-consent__reject">Reject</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelector('.wmc-consent__accept').addEventListener('click', grant);
    banner.querySelector('.wmc-consent__reject').addEventListener('click', deny);
  }

  function addFooterLink() {
    var footer = document.querySelector('footer');
    if (!footer) { return; }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wmc-consent-open';
    btn.textContent = 'Cookie choices';
    btn.addEventListener('click', function () {
      if (!banner) { buildBanner(); }
      banner.hidden = false;
      banner.querySelector('.wmc-consent__accept').focus();
    });
    footer.appendChild(btn);
  }

  function init() {
    var choice = readChoice();
    if (choice === 'granted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadAnalytics();
    } else if (choice === 'denied') {
      gtag('consent', 'update', { analytics_storage: 'denied' });
    } else {
      buildBanner();
    }
    addFooterLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
