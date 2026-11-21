/* Humanize HR Academy - one script: menu, accordions, marquee, progress rings, contact details, forms.
   Everything degrades: without JS the nav is a visible row, cards are native <details>, rings show their final state. */
(function () {
  "use strict";
  var SITE = window.HR360_SITE || {};
  var CFG = window.HR360_FORMS || { forms: {}, options: {} };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var loadedAt = Date.now();

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- contact details from site-config ---------- */
  function waLink(text) {
    return "https://wa.me/" + encodeURIComponent(SITE.whatsappNumber || "") + "?text=" + encodeURIComponent(text || SITE.whatsappPrefill || "");
  }
  $$("[data-contact='email']").forEach(function (el) {
    if (SITE.email) { el.textContent = SITE.email; el.setAttribute("href", "mailto:" + SITE.email); }
  });
  $$("[data-contact='phone']").forEach(function (el) { if (SITE.phoneDisplay) el.textContent = SITE.phoneDisplay; });
  $$("[data-contact='whatsapp']").forEach(function (el) {
    el.setAttribute("href", waLink());
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
  $$("[data-contact='phone-note']").forEach(function (el) { el.hidden = !SITE.phoneIsPlaceholder; });

  /* ---------- mobile menu ---------- */
  var btn = $(".menu-btn"), nav = $("#site-nav");
  if (btn && nav) {
    var mq = window.matchMedia("(min-width: 960px)");
    var setOpen = function (open, restoreFocus) {
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.querySelector(".menu-btn__label").textContent = open ? "Close" : "Menu";
      if (!open && restoreFocus) btn.focus();
    };
    // inert while closed on small screens so hidden links are not tabbable
    var syncInert = function () {
      var hidden = !mq.matches && !nav.classList.contains("is-open");
      if (hidden) nav.setAttribute("inert", ""); else nav.removeAttribute("inert");
    };
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
      syncInert();
      if (btn.getAttribute("aria-expanded") === "true") { var a = nav.querySelector("a"); if (a) a.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false, true); syncInert(); }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) { setOpen(false); syncInert(); } });
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { setOpen(false); syncInert(); });
    syncInert();
  }

  /* ---------- open a <details> from the URL hash (services.html#resume) ---------- */
  function openFromHash() {
    var h = location.hash.slice(1);
    if (!h) return;
    var el = document.getElementById(decodeURIComponent(h));
    if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView({ block: "start" }); }
  }
  window.addEventListener("hashchange", openFromHash);

  /* ---------- marquee pause ---------- */
  var mw = $(".marquee-wrap"), mt = $(".marquee__toggle");
  if (mw && mt) {
    mt.addEventListener("click", function () {
      var paused = mw.classList.toggle("is-paused");
      mt.setAttribute("aria-pressed", paused ? "true" : "false");
      mt.setAttribute("aria-label", paused ? "Play moving keywords" : "Pause moving keywords");
    });
  }

  /* ---------- progress rings: fill clockwise when they scroll into view ---------- */
  var rings = $$(".ring[data-fill]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    rings.forEach(function (r) { io.observe(r); });
  } else {
    rings.forEach(function (r) { r.classList.add("is-in"); });
  }
  // scroll indicator in the header
  var sr = $(".scroll-ring");
  if (sr) {
    var ticking = false;
    var upd = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var v = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      sr.style.setProperty("--p", v.toFixed(3));
      ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  /* ---------- forms ---------- */
  var uid = 0;
  function isPlaceholder(form) {
    if (String(form.formId).indexOf("PLACEHOLDER") === 0) return true;
    return form.fields.some(function (f) { return String(f.entry).indexOf("PLACEHOLDER") === 0; });
  }
  function fieldOptions(f) { return (CFG.options && CFG.options[f.optionsFrom]) || []; }

  function renderForm(mount) {
    var type = mount.getAttribute("data-form");
    var form = CFG.forms && CFG.forms[type];
    if (!form) return;
    uid += 1;
    var id = mount.getAttribute("data-id") || (type + "-" + uid);
    var preset = mount.getAttribute("data-service") || "";
    var html = "";
    var anyOptional = form.fields.some(function (f) { return !f.required; });
    html += '<form class="form" id="' + esc(id) + '" novalidate data-type="' + esc(type) + '">';
    html += '<p class="form__intro">' + (anyOptional ? "Fields marked optional can be left blank. All others are needed." : "All fields are needed unless marked optional.") + "</p>";
    form.fields.forEach(function (f) {
      var fid = id + "-" + f.key, eid = fid + "-err";
      html += '<div class="field"><label for="' + fid + '">' + esc(f.label) + (f.required ? "" : ' <span class="opt">(optional)</span>') + "</label>";
      var common = ' id="' + fid + '" name="' + esc(f.key) + '" aria-describedby="' + eid + '"' + (f.required ? ' aria-required="true"' : "") + (f.autocomplete ? ' autocomplete="' + f.autocomplete + '"' : "");
      if (f.type === "select") {
        html += "<select" + common + '><option value="">Choose one</option>';
        fieldOptions(f).forEach(function (o) {
          html += '<option value="' + esc(o) + '"' + (f.key === "service" && o === preset ? " selected" : "") + ">" + esc(o) + "</option>";
        });
        html += "</select>";
      } else if (f.type === "textarea") {
        html += "<textarea" + common + ' rows="4"></textarea>';
      } else {
        html += '<input type="' + f.type + '"' + common + (f.type === "tel" ? ' inputmode="tel"' : "") + ">";
      }
      html += '<p class="field__error" id="' + eid + '"></p></div>';
    });
    html += '<div class="hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>';
    html += '<div><button type="submit" class="btn">' + esc(form.submitLabel) + "</button></div>";
    html += '<div class="form__status" role="status" aria-live="polite" tabindex="-1"></div></form>';
    mount.innerHTML = html;

    var el = mount.firstChild;
    el.setAttribute("data-rendered-at", String(Date.now()));
    el.addEventListener("submit", function (e) { e.preventDefault(); handleSubmit(el, form, preset); });
    el.addEventListener("input", function (e) {
      var t = e.target; if (t.getAttribute && t.getAttribute("aria-invalid") === "true") clearError(t);
    });
  }

  function setError(input, msg) {
    input.setAttribute("aria-invalid", "true");
    var err = document.getElementById(input.id + "-err");
    if (err) err.textContent = msg;
  }
  function clearError(input) {
    input.removeAttribute("aria-invalid");
    var err = document.getElementById(input.id + "-err");
    if (err) err.textContent = "";
  }

  function validate(formEl, form) {
    var firstBad = null, values = {};
    form.fields.forEach(function (f) {
      var input = formEl.elements[f.key];
      var v = (input.value || "").trim();
      values[f.key] = v;
      clearError(input);
      var msg = "";
      if (f.required && !v) {
        msg = f.type === "select" ? "Please choose an option for " + f.label.toLowerCase() + "." : "Please fill in " + f.label.toLowerCase() + ".";
      } else if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        msg = "That email address does not look right. Please check it.";
      } else if (v && f.type === "tel" && (v.replace(/\D/g, "").length < 7 || /[^0-9+()\s.-]/.test(v))) {
        msg = "Please enter a phone number with at least 7 digits.";
      } else if (v && f.type === "select" && fieldOptions(f).indexOf(v) === -1) {
        msg = "Please choose one of the listed options.";
      }
      if (msg) { setError(input, msg); if (!firstBad) firstBad = input; }
    });
    return { ok: !firstBad, firstBad: firstBad, values: values };
  }

  function waMessage(form, values, heading) {
    var lines = [heading];
    form.fields.forEach(function (f) { if (values[f.key]) lines.push(f.label + ": " + values[f.key]); });
    return lines.join("\n");
  }

  function say(statusEl, text) { statusEl.textContent = text; }

  function handleSubmit(formEl, form, preset) {
    var status = formEl.querySelector(".form__status");
    var submit = formEl.querySelector("button[type=submit]");
    say(status, "");
    // honeypot: a real person never sees this field
    if (formEl.elements.website && formEl.elements.website.value) return;
    var res = validate(formEl, form);
    if (!res.ok) {
      say(status, "Please fix the highlighted fields and try again.");
      res.firstBad.focus();
      return;
    }
    var rendered = Number(formEl.getAttribute("data-rendered-at")) || loadedAt;
    var minMs = (CFG.minSecondsOnPage || 3) * 1000;
    if (Date.now() - loadedAt < minMs) {
      say(status, "Just a moment. Please try again in a couple of seconds.");
      return;
    }
    var type = formEl.getAttribute("data-type");
    var heading = type === "registration" ? "Hello, I would like to register my interest in a course." : "Hello Humanize HR Academy, I have an enquiry.";

    if (isPlaceholder(form)) {
      // Not connected to a Google Form yet: do not pretend. Hand the details to WhatsApp instead.
      var w = window.open(waLink(waMessage(form, res.values, heading)), "_blank", "noopener");
      say(status, w
        ? "This form is not connected yet, so nothing was saved here. We opened WhatsApp with your details ready. Tap send there and the team will see it. You can also email " + (SITE.email || "us") + "."
        : "This form is not connected yet, so nothing was saved here. Your browser blocked WhatsApp from opening. Please message us on WhatsApp or email " + (SITE.email || "us") + " instead.");
      status.focus();
      return;
    }

    var body = new URLSearchParams();
    form.fields.forEach(function (f) { if (res.values[f.key]) body.append(f.entry, res.values[f.key]); });
    var url = "https://docs.google.com/forms/d/e/" + encodeURIComponent(form.formId) + "/formResponse";
    submit.disabled = true; submit.setAttribute("aria-busy", "true");
    var label = submit.textContent; submit.textContent = "Sending...";
    fetch(url, { method: "POST", mode: "no-cors", body: body })
      .then(function () {
        // no-cors responses are opaque: we can only know the request left the browser.
        formEl.reset();
        if (preset && formEl.elements.service) formEl.elements.service.value = preset;
        say(status, "Thank you. Your details have been sent. The team replies by WhatsApp or email.");
      })
      .catch(function () {
        say(status, "Sorry, that did not send. Please check your connection and try again, or message us on WhatsApp or by email.");
      })
      .then(function () {
        submit.disabled = false; submit.removeAttribute("aria-busy"); submit.textContent = label;
        status.focus();
      });
  }

  $$("[data-form]").forEach(renderForm);

  // Register interest buttons preselect the course
  $$("[data-course]").forEach(function (a) {
    a.addEventListener("click", function () {
      var reg = document.getElementById("register");
      if (!reg || !reg.elements.course) return;
      reg.elements.course.value = a.getAttribute("data-course");
      clearError(reg.elements.course);
      setTimeout(function () { reg.elements.course.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
    });
  });

  // anchors that point at JS-rendered content (contact.html#enquiry, courses.html#register)
  function scrollToHash() {
    var h = location.hash.slice(1);
    if (!h) return;
    var el = document.getElementById(h);
    if (el) { el.scrollIntoView(); }
  }
  openFromHash();
  if (location.hash && !(document.getElementById(location.hash.slice(1)) || {}).open) scrollToHash();
})();
