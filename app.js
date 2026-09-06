(function () {
  "use strict";

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var list = document.getElementById("primary-nav-list");
    if (!toggle || !list) return;

    var desktopQuery = window.matchMedia("(min-width: 640px)");

    function closeMenu(focusToggle) {
      toggle.setAttribute("aria-expanded", "false");
      list.classList.remove("is-open");
      if (focusToggle) toggle.focus();
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      list.classList.add("is-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu(false);
      } else {
        openMenu();
      }
    });

    list.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu(true);
      }
    });

    desktopQuery.addEventListener("change", function (event) {
      if (event.matches) closeMenu(false);
    });
  }

  function initRecordsRequestForm() {
    var form = document.getElementById("records-request-form");
    if (!form) return;

    var successRegion = document.getElementById("rr-success");
    var errorSummaryRegion = document.getElementById("rr-error-summary");

    var fields = {
      name: {
        input: document.getElementById("rr-name"),
        error: document.getElementById("rr-name-error"),
        label: "Name",
        validate: function (value) {
          return value.trim() ? "" : "enter your name.";
        }
      },
      email: {
        input: document.getElementById("rr-email"),
        error: document.getElementById("rr-email-error"),
        label: "Email address",
        validate: function (value) {
          if (!value.trim()) return "enter an email address.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "enter an email address in the form name@example.com.";
          }
          return "";
        }
      },
      description: {
        input: document.getElementById("rr-description"),
        error: document.getElementById("rr-description-error"),
        label: "Description",
        validate: function (value) {
          return value.trim() ? "" : "describe the records you want.";
        }
      },
      format: {
        input: null,
        error: document.getElementById("rr-format-error"),
        label: "Preferred format",
        validate: function () {
          var checked = form.querySelector('input[name="format"]:checked');
          return checked ? "" : "choose electronic or paper.";
        }
      }
    };

    var hasAttemptedSubmit = false;

    function setFieldError(key, message) {
      var field = fields[key];
      if (field.input) {
        if (message) {
          field.input.setAttribute("aria-invalid", "true");
          field.input.setAttribute("aria-describedby", field.error.id);
          field.input.classList.add("has-error");
        } else {
          field.input.removeAttribute("aria-invalid");
          field.input.removeAttribute("aria-describedby");
          field.input.classList.remove("has-error");
        }
      }
      field.error.textContent = message ? "Error: " + message : "";
    }

    function validateAll() {
      var errors = {};
      Object.keys(fields).forEach(function (key) {
        var field = fields[key];
        var value = field.input ? field.input.value : "";
        var message = field.validate(value);
        if (message) errors[key] = message;
        setFieldError(key, message);
      });
      return errors;
    }

    function renderErrorSummary(errors) {
      var keys = Object.keys(errors);
      errorSummaryRegion.innerHTML = "";
      if (keys.length === 0) {
        errorSummaryRegion.classList.remove("has-error");
        return;
      }

      var title = document.createElement("p");
      title.className = "error-summary-title";
      title.textContent = "This form has a problem";
      errorSummaryRegion.appendChild(title);

      var list = document.createElement("ul");
      list.className = "error-summary-list";
      keys.forEach(function (key) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#rr-" + key;
        a.textContent = fields[key].label + ": " + errors[key];
        a.addEventListener("click", function (event) {
          event.preventDefault();
          var target = fields[key].input || document.getElementById("rr-format-electronic");
          if (target) target.focus();
        });
        li.appendChild(a);
        list.appendChild(li);
      });
      errorSummaryRegion.appendChild(list);
      errorSummaryRegion.classList.add("has-error");
    }

    function revalidateSingle(key) {
      var field = fields[key];
      var value = field.input ? field.input.value : "";
      var message = field.validate(value);
      setFieldError(key, message);
      var errors = {};
      Object.keys(fields).forEach(function (k) {
        var f = fields[k];
        var v = f.input ? f.input.value : "";
        var m = f.validate(v);
        if (m) errors[k] = m;
      });
      renderErrorSummary(errors);
    }

    ["name", "email", "description"].forEach(function (key) {
      fields[key].input.addEventListener("input", function () {
        if (hasAttemptedSubmit) revalidateSingle(key);
      });
    });
    form.querySelectorAll('input[name="format"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (hasAttemptedSubmit) revalidateSingle("format");
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hasAttemptedSubmit = true;
      successRegion.classList.remove("has-success");
      successRegion.textContent = "";

      var errors = validateAll();
      renderErrorSummary(errors);

      if (Object.keys(errors).length > 0) {
        errorSummaryRegion.focus();
      } else {
        successRegion.textContent = "Your request was submitted. The Clerk's office will contact you at the email or phone you provided.";
        successRegion.classList.add("has-success");
        successRegion.scrollIntoView({ block: "start" });
        successRegion.focus();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initRecordsRequestForm();
  });
})();
