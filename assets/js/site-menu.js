/* Site menu behaviour (progressive enhancement).
   The menu already opens and closes without this file in browsers that support
   the Popover API. This script adds:
   - a fallback for browsers without popover support
   - aria-expanded on the menu button
   - scroll lock on the page behind the menu
   - moving focus into the menu and scrolling the current page into view
   - closing the menu when a link inside it is used (same-page links)
   Markup: tools/site-menu.py · Styles: assets/css/site-menu.css */
(function () {
  'use strict';

  var panel = document.getElementById('site-menu');
  if (!panel) return;

  var root = document.documentElement;
  var openers = Array.prototype.slice.call(document.querySelectorAll('[data-site-menu-open]'));
  var closeBtn = panel.querySelector('[data-site-menu-close]');
  var native = typeof panel.showPopover === 'function';
  var isOpen = false;
  var returnFocus = null;

  function setExpanded(value) {
    openers.forEach(function (btn) { btn.setAttribute('aria-expanded', value ? 'true' : 'false'); });
  }

  function afterOpen() {
    isOpen = true;
    root.classList.add('sm-lock');
    setExpanded(true);
    var current = panel.querySelector('[aria-current="page"]');
    if (current) current.scrollIntoView({ block: 'nearest' });
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function afterClose() {
    isOpen = false;
    root.classList.remove('sm-lock');
    setExpanded(false);
    if (!native && returnFocus) returnFocus.focus();
    returnFocus = null;
  }

  function hide() {
    if (!isOpen) return;
    if (native) {
      panel.hidePopover();
    } else {
      panel.classList.remove('sm-open');
      afterClose();
    }
  }

  setExpanded(false);

  if (native) {
    // The browser opens and closes the popover; we react to it
    panel.addEventListener('toggle', function (event) {
      if (event.newState === 'open') afterOpen(); else afterClose();
    });
  } else {
    // Fallback: no Popover API, so toggle a class instead
    panel.removeAttribute('popover');
    openers.forEach(function (btn) {
      btn.removeAttribute('popovertarget');
      btn.addEventListener('click', function () {
        if (isOpen) { hide(); return; }
        returnFocus = btn;
        panel.classList.add('sm-open');
        afterOpen();
      });
    });
    if (closeBtn) {
      closeBtn.removeAttribute('popovertarget');
      closeBtn.addEventListener('click', hide);
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') hide();
    });
    document.addEventListener('click', function (event) {
      if (!isOpen) return;
      if (panel.contains(event.target)) return;
      if (openers.some(function (btn) { return btn.contains(event.target); })) return;
      hide();
    });
  }

  // A link inside the menu always closes it (otherwise same-page links leave it open)
  panel.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('a')) hide();
  });
})();
