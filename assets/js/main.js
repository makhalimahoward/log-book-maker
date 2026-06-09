// =====================================================================
//  Log Book Maker
//  © 2026 Howard Makhalima — howardmakhalima.pages.dev
//  Licensed under MIT. Attribution required.
// =====================================================================

// ===================== WEEK CALCULATION =====================
const WEEK_1_START = new Date(2025, 8, 22);
const TOTAL_WEEKS = 40;
const OFF_WEEKS = new Set([13, 14, 15, 16]);

function getWeekNumber(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  const diffMs = date - WEEK_1_START;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  return Math.floor(diffDays / 7) + 1;
}

function getWeekRange(weekNum) {
  const start = new Date(WEEK_1_START);
  start.setDate(start.getDate() + (weekNum - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return {
    start,
    end,
    label: `Week ${weekNum} — ${fmt(start)} to ${fmt(end)}`,
  };
}

let logsData = [];
let searchTerm = "";
let roleFilter = "ALL";
let weekFilter = "ALL";
const STORAGE_KEY = "hm_log_book_data_v5";

const DOM = {
  logsList: document.getElementById("logs-list"),
  searchInput: document.getElementById("searchInput"),
  weekFilterSel: document.getElementById("weekFilter"),
  roleBtns: document.querySelectorAll(".role-filter-btn"),
  countAll: document.querySelector(".count-all"),
  countTech: document.querySelector(".count-tech"),
  countSuper: document.querySelector(".count-super"),
  countPM: document.querySelector(".count-pm"),
  tabGen: document.getElementById("tab-generator"),
  tabPrev: document.getElementById("tab-preview"),
  viewGen: document.getElementById("view-generator"),
  viewPrev: document.getElementById("view-preview"),
  addFormCont: document.getElementById("add-form-container"),
  btnShowAdd: document.getElementById("btn-show-add"),
  btnCancel: document.getElementById("btn-cancel-add"),
  btnCancelBottom: document.getElementById("btn-cancel-add-bottom"),
  btnResetData: document.getElementById("btn-reset-data"),
  logForm: document.getElementById("log-form"),
  formTitle: document.getElementById("form-title"),
  editId: document.getElementById("edit-id"),
  inpDate: document.getElementById("input-date"),
  inpClient: document.getElementById("input-client"),
  inpRole: document.getElementById("input-role"),
  inpWork: document.getElementById("input-work"),
  inpComments: document.getElementById("input-comments"),
  btnDownload: document.getElementById("btn-download-csv"),
  btnCopy: document.getElementById("btn-copy-table"),
  btnPrint: document.getElementById("btn-print"),
  fontSelector: document.getElementById("font-selector"),
  dynamicPagesContainer: document.getElementById("dynamic-pages-container"),
  weekHint: document.getElementById("week-hint"),
  weekHintText: document.getElementById("week-hint-text"),
};

// ===================== SCROLL HELPER =====================
function scrollFormIntoView() {
  setTimeout(() => {
    DOM.addFormCont.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 50);
}

// ===================== CUSTOM SELECT ARROWS =====================
// Wraps every <select> in a .select-wrap div and appends a remixicon chevron.
// The native arrow is hidden via CSS (appearance: none + padding-right).
function wrapSelects() {
  document.querySelectorAll("select").forEach((sel) => {
    // Skip if already wrapped
    if (
      sel.parentElement &&
      sel.parentElement.classList.contains("select-wrap")
    )
      if (sel.style.display === "none") return; // ← add this line
    return;
    const wrapper = document.createElement("div");
    wrapper.className = "select-wrap";
    // Preserve inline styles / classes on the select
    sel.parentNode.insertBefore(wrapper, sel);
    wrapper.appendChild(sel);
    const icon = document.createElement("i");
    icon.className = "ri-arrow-down-s-line select-chevron";
    wrapper.appendChild(icon);
  });
}

// ===================== CUSTOM WEEK FILTER POPOVER =====================
function buildWeekFilterPopover() {
  const list = document.getElementById("week-filter-list");
  const nativeSelect = document.getElementById("weekFilter");
  const label = document.getElementById("week-filter-label");
  if (!list || !nativeSelect) return;

  list.innerHTML = "";
  Array.from(nativeSelect.options).forEach((opt) => {
    const item = document.createElement("button");
    item.className =
      "week-filter-item" + (opt.value === weekFilter ? " active" : "");
    item.textContent = opt.text;
    item.dataset.value = opt.value;
    item.addEventListener("click", () => {
      weekFilter = opt.value;
      label.textContent = opt.text;
      document
        .querySelectorAll(".week-filter-item")
        .forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      document.getElementById("week-filter-popover").classList.add("hidden");
      renderApp();
    });
    list.appendChild(item);
  });
}

document.getElementById("week-filter-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  buildWeekFilterPopover();
  document.getElementById("week-filter-popover").classList.toggle("hidden");
});

document.addEventListener("click", () => {
  document.getElementById("week-filter-popover")?.classList.add("hidden");
});

// ===================== THEME TOGGLE =====================
const savedTheme = localStorage.getItem("hm_theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
document.getElementById("theme-icon").className =
  savedTheme === "dark" ? "ri-moon-fill" : "ri-sun-fill";

document.getElementById("btn-theme-toggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("hm_theme", next);
  document.getElementById("theme-icon").className =
    next === "dark" ? "ri-moon-fill" : "ri-sun-fill";
});

// ===================== COPY TO WORD / GOOGLE DOCS =====================
function buildTableHTML(logs) {
  if (!logs || logs.length === 0) return "";
  const rows = logs
    .map(
      (log) => `
    <tr>
      <td style="border:1px solid black;padding:6px 8px;font-size:11pt;vertical-align:top;width:13%;">${log.date}<br><small>${log.client}</small><br><small><em>${log.role}</em></small></td>
      <td style="border:1px solid black;padding:6px 8px;font-size:11pt;vertical-align:top;width:43%;">
        <ul style="margin:0;padding-left:16px;">${log.workDone
          .split("\n")
          .filter((s) => s.trim())
          .map((s) => `<li>${s.trim()}</li>`)
          .join("")}</ul>
      </td>
      <td style="border:1px solid black;padding:6px 8px;font-size:11pt;vertical-align:top;width:44%;">${log.comments}</td>
    </tr>`,
    )
    .join("");

  return `
    <table style="border-collapse:collapse;width:100%;font-family:'Times New Roman',serif;">
      <thead>
        <tr>
          <th style="border:1px solid black;padding:6px 8px;font-size:11pt;text-align:left;width:13%;">Date</th>
          <th style="border:1px solid black;padding:6px 8px;font-size:11pt;text-align:left;width:43%;">Work Accomplished / Tasks</th>
          <th style="border:1px solid black;padding:6px 8px;font-size:11pt;text-align:left;width:44%;">Academic Learning Reflections</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function copyHTMLToClipboard(html, btnEl, label) {
  const blob = new Blob([html], { type: "text/html" });
  const plainBlob = new Blob([html.replace(/<[^>]+>/g, "")], {
    type: "text/plain",
  });
  try {
    navigator.clipboard
      .write([
        new ClipboardItem({ "text/html": blob, "text/plain": plainBlob }),
      ])
      .then(() => {
        if (btnEl) {
          const orig = btnEl.innerHTML;
          btnEl.innerHTML = '<i class="ri-checkbox-circle-fill"></i> Copied!';
          btnEl.style.color = "#10b981";
          btnEl.style.borderColor = "#10b981";
          setTimeout(() => {
            btnEl.innerHTML = orig;
            btnEl.style.color = "";
            btnEl.style.borderColor = "";
          }, 2500);
        }
      });
  } catch (e) {
    const el = document.createElement("div");
    el.innerHTML = html;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    document.body.removeChild(el);
    if (btnEl) {
      const orig = btnEl.innerHTML;
      btnEl.innerHTML = '<i class="ri-checkbox-circle-fill"></i> Copied!';
      setTimeout(() => {
        btnEl.innerHTML = orig;
      }, 2500);
    }
  }
}

window.copyWeekToClipboard = function (weekNum) {
  const weekLogs = logsData.filter((l) => getWeekNumber(l.date) === weekNum);
  const r = getWeekRange(weekNum);
  const html = `<p><strong>WEEK ${weekNum} — ${r.label.split("—")[1].trim()}</strong></p>${buildTableHTML(weekLogs)}`;
  const btn = event.currentTarget;
  copyHTMLToClipboard(html, btn, `Week ${weekNum}`);
};

window.formatText = (command) => {
  document.execCommand(command, false, null);
};

const parseDate = (s) => {
  const [d, m, y] = s.split("/");
  return new Date(+y, +m - 1, +d);
};
const sortByDate = (arr) =>
  arr.sort((a, b) => parseDate(a.date) - parseDate(b.date));

function populateWeekFilter() {
  DOM.weekFilterSel.innerHTML = '<option value="ALL">All Weeks</option>';
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const r = getWeekRange(w);
    const opt = document.createElement("option");
    opt.value = w;
    opt.textContent = r.label;
    DOM.weekFilterSel.appendChild(opt);
  }
}

const initData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    logsData = JSON.parse(saved);
  } else {
    logsData = [...initialLogs];
    saveToLocalStorage();
  }
  sortByDate(logsData);
  populateWeekFilter();
  // Apply custom select arrows to all selects including newly populated ones
  wrapSelects();
  renderApp();
};

const saveToLocalStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logsData));
  renderApp();
};

DOM.btnResetData.addEventListener("click", () => {
  if (
    confirm("Restore default master dataset? Any custom logs will be deleted.")
  ) {
    logsData = sortByDate([...initialLogs]);
    saveToLocalStorage();
  }
});

DOM.inpDate.addEventListener("input", () => {
  const val = DOM.inpDate.value;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const wk = getWeekNumber(val);
    if (wk) {
      const r = getWeekRange(wk);
      DOM.weekHintText.textContent = `This date falls in ${r.label}`;
      DOM.weekHint.classList.remove("hidden");
    } else {
      DOM.weekHintText.textContent = `This date falls in a holiday period`;
      DOM.weekHint.classList.remove("hidden");
    }
  } else {
    DOM.weekHint.classList.add("hidden");
  }
});

DOM.logForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newLog = {
    id: DOM.editId.value || Date.now().toString(),
    date: DOM.inpDate.value,
    client: DOM.inpClient.value,
    role: DOM.inpRole.value,
    workDone: DOM.inpWork.value,
    comments: DOM.inpComments.value,
    timestamp: DOM.editId.value
      ? logsData.find((l) => l.id === DOM.editId.value).timestamp
      : Date.now(),
  };
  if (DOM.editId.value) {
    logsData = logsData.map((l) => (l.id === DOM.editId.value ? newLog : l));
  } else {
    logsData.push(newLog);
  }
  sortByDate(logsData);
  saveToLocalStorage();
  DOM.addFormCont.classList.add("is-hidden");
  resetForm();
});

window.editLog = (id) => {
  const log = logsData.find((l) => l.id === id);
  if (!log) return;
  DOM.editId.value = log.id;
  DOM.inpDate.value = log.date;
  DOM.inpClient.value = log.client;
  DOM.inpRole.value = log.role;
  DOM.inpWork.value = log.workDone;
  DOM.inpComments.value = log.comments;
  DOM.formTitle.textContent = "Modify Log Record";
  DOM.addFormCont.classList.remove("is-hidden");
  scrollFormIntoView();
};

window.deleteLog = (id) => {
  if (confirm("Permanently delete this entry?")) {
    logsData = logsData.filter((l) => l.id !== id);
    saveToLocalStorage();
  }
};

window.openWeekForm = (weekNum) => {
  resetForm();
  const r = getWeekRange(weekNum);
  const d = r.start;
  DOM.inpDate.value = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  DOM.weekHintText.textContent = `Creating entry for ${r.label}`;
  DOM.weekHint.classList.remove("hidden");
  DOM.formTitle.textContent = `Add Entry — ${r.label}`;
  DOM.addFormCont.classList.remove("is-hidden");
  scrollFormIntoView();
};

const resetForm = () => {
  DOM.logForm.reset();
  DOM.editId.value = "";
  DOM.formTitle.textContent = "Create Custom Log Entry";
  DOM.weekHint.classList.add("hidden");
};

const convertToBulletsHTML = (text) => {
  if (!text) return "";
  const lines = text.split("\n").filter((s) => s.trim());
  if (lines.length === 0) return "";
  return lines.map((s) => `<li>${s.trim()}</li>`).join("");
};

const convertToTicksHTML = (text) => {
  if (!text) return "";
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  if (sentences.length === 0) return text;
  return sentences
    .map((s) => {
      let c = s.trim();
      if (!c.endsWith(".") && !c.endsWith("!") && !c.endsWith("?")) c += ".";
      return `<li>${c}</li>`;
    })
    .join("");
};

function getRoleBadgeClass(role) {
  if (role.includes("Product Management") || role.includes("Co-Product"))
    return "role-badge role-badge-pm";
  if (role.includes("Supervision") && !role.includes("Technical"))
    return "role-badge role-badge-super";
  return "role-badge role-badge-tech";
}

const getFilteredLogs = () =>
  logsData.filter((log) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = [log.date, log.client, log.workDone, log.comments].some(
      (f) => f.toLowerCase().includes(s),
    );
    const matchRole =
      roleFilter === "ALL" ||
      (roleFilter === "TECH" && log.role.includes("Technical")) ||
      (roleFilter === "SUPER" && log.role.includes("Supervision")) ||
      (roleFilter === "PM" &&
        (log.role.includes("Product Management") ||
          log.role.includes("Co-Product")));
    const logWeek = getWeekNumber(log.date);
    const matchWeek = weekFilter === "ALL" || logWeek === parseInt(weekFilter);
    return matchSearch && matchRole && matchWeek;
  });

const updateCounters = () => {
  DOM.countAll.textContent = logsData.length;
  DOM.countTech.textContent = logsData.filter((l) =>
    l.role.includes("Technical"),
  ).length;
  DOM.countSuper.textContent = logsData.filter((l) =>
    l.role.includes("Supervision"),
  ).length;
  DOM.countPM.textContent = logsData.filter(
    (l) =>
      l.role.includes("Product Management") || l.role.includes("Co-Product"),
  ).length;
};

const renderApp = () => {
  const filtered = getFilteredLogs();
  updateCounters();

  // ---- DASHBOARD CARDS ----
  if (filtered.length === 0 && weekFilter === "ALL") {
    DOM.logsList.innerHTML = `
      <div class="no-results-box">
        <i class="ri-search-eye-line"></i>
        <p>No matching logs found</p>
      </div>`;
  } else {
    const byWeek = {};
    filtered.forEach((log) => {
      const wk = getWeekNumber(log.date) || 0;
      if (!byWeek[wk]) byWeek[wk] = [];
      byWeek[wk].push(log);
    });

    if (weekFilter !== "ALL") {
      const wNum = parseInt(weekFilter);
      if (!byWeek[wNum]) byWeek[wNum] = [];
    }

    const weekNums = Object.keys(byWeek)
      .map(Number)
      .sort((a, b) => a - b);
    let html = "";

    weekNums.forEach((wk) => {
      const r = getWeekRange(wk);
      const logs = byWeek[wk];
      const dateRange = r.label.split("—")[1].trim();

      html += `<div class="week-group">
        <div class="week-group-header has-entries">
          <div style="display:flex;align-items:center;gap:12px;">
            <span class="week-badge">WEEK ${wk}</span>
            <span class="week-date-range">${dateRange}</span>
          </div>
          <button class="week-add-btn" onclick="openWeekForm(${wk})">
            <i class="ri-add-circle-line"></i><span>Add Entry</span>
          </button>
        </div>`;

      if (logs.length === 0) {
        html += `<div class="week-empty-box">
          <i class="ri-inbox-line" style="font-size:1.5rem;display:block;margin-bottom:4px;color:var(--text-muted);"></i>
          <p>No entries for this week</p>
          <button class="week-empty-add-btn" onclick="openWeekForm(${wk})">
            <i class="ri-add-line"></i> Add Entry for Week ${wk}
          </button>
        </div>`;
      } else {
        logs.forEach((log) => {
          html += `
          <div class="log-card">
            <div class="log-card-header">
              <div class="log-card-header-left">
                <span class="log-date-badge">${log.date}</span>
                <span class="log-client-name">${log.client}</span>
              </div>
              <div class="log-card-header-right">
                <span class="${getRoleBadgeClass(log.role)}">${log.role}</span>
                <div class="log-card-actions">
                  <button class="log-action-btn edit" onclick="editLog('${log.id}')"><i class="ri-edit-2-line"></i></button>
                  <button class="log-action-btn delete" onclick="deleteLog('${log.id}')"><i class="ri-delete-bin-5-line"></i></button>
                </div>
              </div>
            </div>
            <div class="log-card-body">
              <div>
                <div class="log-section-label tasks">
                  <i class="ri-tools-line"></i> Tasks Accomplished
                </div>
                <p class="log-tasks-text">${log.workDone}</p>
              </div>
              <div class="log-reflect-col">
                <div class="log-section-label reflect">
                  <i class="ri-book-open-line"></i> Reflective Log
                </div>
                <p class="log-reflect-text">"${log.comments}"</p>
              </div>
            </div>
          </div>`;
        });
      }
      html += `</div>`;
    });

    if (weekFilter === "ALL" && searchTerm === "" && roleFilter === "ALL") {
      const populatedWeeks = new Set(weekNums);
      for (let w = 1; w <= TOTAL_WEEKS; w++) {
        if (!populatedWeeks.has(w)) {
          const r = getWeekRange(w);
          const dateRange = r.label.split("—")[1].trim();
          html += `<div class="week-group">
            <div class="week-group-header">
              <div style="display:flex;align-items:center;gap:12px;">
                <span class="week-badge empty">WEEK ${w}</span>
                <span class="week-date-range empty">${dateRange}</span>
              </div>
              <button class="week-add-btn empty" onclick="openWeekForm(${w})">
                <i class="ri-add-circle-line"></i><span>Add Entry</span>
              </button>
            </div>
            <div class="week-empty-box" style="padding:16px 20px;">
              <p>No entries — click Add Entry to fill this week</p>
            </div>
          </div>`;
        }
      }
    }

    DOM.logsList.innerHTML = html;
  }

  // ---- A4 PREVIEW ----
  DOM.dynamicPagesContainer.innerHTML = "";

  const previewLogs =
    weekFilter === "ALL"
      ? logsData
      : logsData.filter((l) => getWeekNumber(l.date) === parseInt(weekFilter));

  const byWeekPreview = {};
  previewLogs.forEach((log) => {
    const wk = getWeekNumber(log.date) || 0;
    if (!byWeekPreview[wk]) byWeekPreview[wk] = [];
    byWeekPreview[wk].push(log);
  });

  function buildSignatureHTML(currentWeek, allWeeks) {
    const mode = document.getElementById("signature-mode")
      ? document.getElementById("signature-mode").value
      : "last";
    const isLastWeek = currentWeek === allWeeks[allWeeks.length - 1];
    const sigBlock = `
      <div class="signature-block" contenteditable="true">
        <div class="sig-field">
          <div class="sig-line"></div>
          <span class="sig-label">Student Signature</span>
        </div>
        <div class="sig-field-right">
          <div class="sig-line"></div>
          <span class="sig-label">Supervisor Sign-off</span>
        </div>
      </div>`;
    if (mode === "none") return "";
    if (mode === "every") return sigBlock;
    if (mode === "last" && isLastWeek) return sigBlock;
    return "";
  }

  const allWeeks =
    weekFilter === "ALL"
      ? Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1)
      : [parseInt(weekFilter)];

  allWeeks.forEach((wk) => {
    const r = getWeekRange(wk);
    const weekLogs = byWeekPreview[wk] || [];
    const sheet = document.createElement("div");
    sheet.className = "a4-sheet-continuous";
    const isEmptyWeek = weekLogs.length === 0;

    let rowsHTML = "";
    if (isEmptyWeek) {
      rowsHTML = `<tr><td style="height:60px;" contenteditable="true"></td><td contenteditable="true"></td><td contenteditable="true"></td></tr>`;
    } else {
      rowsHTML = weekLogs
        .map(
          (log) => `
        <tr>
          <td style="padding:10px 8px;vertical-align:top;font-weight:700;font-size:11px;white-space:nowrap;" contenteditable="true">${log.date}</td>
          <td style="padding:10px 8px;vertical-align:top;" contenteditable="true">
            <div style="font-size:11px;color:#000;font-weight:400;margin-bottom:4px;">${log.client} (${log.role})</div>
            <ul style="list-style:disc;padding-left:18px;margin:0;font-size:11px;">${convertToBulletsHTML(log.workDone)}</ul>
          </td>
          <td style="padding:10px 8px;vertical-align:top;font-size:11px;line-height:1.5;" contenteditable="true">
            <ul class="tick-list">${convertToTicksHTML(log.comments)}</ul>
          </td>
        </tr>`,
        )
        .join("");
    }

    sheet.innerHTML = `
      <div class="a4-inner-content">
        <div>
          <div style="background:#fff;color:#000;border:1.5px solid #000;border-bottom:none;padding:10px 14px;font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;">
            <span>WEEK ${wk}</span>
            <span style="font-weight:500;font-size:10px;">${r.label.split("—")[1].trim()}</span>
          </div>
          <table class="log-table">
            <thead>
              <tr>
                <th style="width:13%;text-align:left;">Date</th>
                <th style="width:43%;text-align:left;">Work Accomplished / Tasks</th>
                <th style="width:44%;text-align:left;">Academic Learning Reflections</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
          <div class="week-copy-bar no-print">
            <button class="week-copy-btn" onclick="copyWeekToClipboard(${wk})">
              <i class="ri-clipboard-line"></i> Copy Week ${wk} for Docs
            </button>
          </div>
        </div>
        ${buildSignatureHTML(wk, allWeeks)}
      </div>`;

    DOM.dynamicPagesContainer.appendChild(sheet);
  });
};

// ===================== EVENT LISTENERS =====================
DOM.searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderApp();
});
DOM.weekFilterSel.addEventListener("change", (e) => {
  weekFilter = e.target.value;
  renderApp();
});

DOM.roleBtns.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    DOM.roleBtns.forEach((b) => b.classList.remove("active"));
    e.currentTarget.classList.add("active");
    roleFilter = e.currentTarget.getAttribute("data-role");
    renderApp();
  }),
);

const switchTab = (tab) => {
  if (tab === "gen") {
    DOM.viewGen.classList.remove("hidden");
    DOM.viewPrev.classList.add("hidden");
    DOM.tabGen.classList.add("active");
    DOM.tabPrev.classList.remove("active");
  } else {
    DOM.viewPrev.classList.remove("hidden");
    DOM.viewGen.classList.add("hidden");
    DOM.tabPrev.classList.add("active");
    DOM.tabGen.classList.remove("active");
  }
};

DOM.tabGen.addEventListener("click", () => switchTab("gen"));
DOM.tabPrev.addEventListener("click", () => switchTab("prev"));

DOM.btnShowAdd.addEventListener("click", () => {
  resetForm();
  DOM.addFormCont.classList.remove("is-hidden");
  scrollFormIntoView();
});

const closeForm = () => {
  DOM.addFormCont.classList.add("is-hidden");
  resetForm();
};
DOM.btnCancel.addEventListener("click", closeForm);
DOM.btnCancelBottom.addEventListener("click", closeForm);

DOM.fontSelector.addEventListener("change", (e) => {
  const pc = document.getElementById("print-canvas");
  pc.className = e.target.value + " print-canvas";
});

// ===================== PRINT HANDLING =====================
function prepareForPrint() {
  const wasHidden = DOM.viewPrev.classList.contains("hidden");
  if (wasHidden) {
    DOM.viewPrev.classList.remove("hidden");
  }
  renderApp();
  return wasHidden;
}

function restoreAfterPrint(wasHidden) {
  if (wasHidden) {
    DOM.viewPrev.classList.add("hidden");
  }
}

window.onbeforeprint = () => {
  prepareForPrint();
};

window.onafterprint = () => {
  const onDashboard = DOM.tabGen.classList.contains("active");
  restoreAfterPrint(onDashboard);
};

DOM.btnPrint.addEventListener("click", () => {
  prepareForPrint();
  setTimeout(() => window.print(), 80);
});

DOM.btnCopy.addEventListener("click", () => {
  const filt = getFilteredLogs();
  let text = "Week\tDate\tClient & Role\tWork Done\tReflections\n";
  filt.forEach((l) => {
    text += `Week ${getWeekNumber(l.date)}\t${l.date}\t${l.client} (${l.role})\t${l.workDone}\t${l.comments}\n`;
  });
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  document.getElementById("icon-copy").className = "ri-checkbox-circle-fill";
  document.getElementById("text-copy").textContent = "Data Table Copied!";
  setTimeout(() => {
    document.getElementById("icon-copy").className = "ri-clipboard-line";
    document.getElementById("text-copy").textContent = "Copy Records";
  }, 2500);
});

DOM.btnDownload.addEventListener("click", () => {
  const filt = getFilteredLogs();
  const headers = [
    "Week",
    "Date",
    "Client",
    "Role",
    "Work Done / Tasks",
    "Comments",
  ];
  const rows = filt.map((l) => [
    `"Week ${getWeekNumber(l.date)}"`,
    `"${l.date}"`,
    `"${l.client.replace(/"/g, '""')}"`,
    `"${l.role}"`,
    `"${l.workDone.replace(/"/g, '""')}"`,
    `"${l.comments.replace(/"/g, '""')}"`,
  ]);
  const csv =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const a = document.createElement("a");
  a.href = encodeURI(csv);
  a.download = "LogBook_Export.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

document.getElementById("btn-copy-docs").addEventListener("click", function () {
  let html = "";
  const allWeekNums = [...new Set(logsData.map((l) => getWeekNumber(l.date)))]
    .filter(Boolean)
    .sort((a, b) => a - b);
  allWeekNums.forEach((wk) => {
    const r = getWeekRange(wk);
    const weekLogs = logsData.filter((l) => getWeekNumber(l.date) === wk);
    html += `<p><strong>WEEK ${wk} — ${r.label.split("—")[1].trim()}</strong></p>${buildTableHTML(weekLogs)}<p>&nbsp;</p>`;
  });
  copyHTMLToClipboard(html, this, "Full Logbook");
});

// ===================== COVER PAGE SETTINGS =====================
const COVER_STORAGE_KEY = "hm_cover_settings_v1";

const coverFields = {
  name: { inputId: "cover-name", displayId: "cover-display-name", default: "" },
  number: {
    inputId: "cover-number",
    displayId: "cover-display-number",
    default: "",
  },
  degree: {
    inputId: "cover-degree",
    displayId: "cover-display-degree",
    default: "",
  },
  industrialSup: {
    inputId: "cover-industrial-sup",
    displayId: "cover-display-industrial",
    default: "",
  },
  academicSup: {
    inputId: "cover-academic-sup",
    displayId: "cover-display-academic",
    default: "",
  },
  company: {
    inputId: "cover-company",
    displayId: "cover-display-company",
    default: "",
  },
  location: {
    inputId: "cover-location",
    displayId: "cover-display-location",
    default: "",
  },
};

function getSavedCover() {
  try {
    return JSON.parse(localStorage.getItem(COVER_STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function loadCoverSettings() {
  const saved = getSavedCover();
  Object.entries(coverFields).forEach(([key, field]) => {
    const input = document.getElementById(field.inputId);
    const display = document.getElementById(field.displayId);
    const val = saved[key] || field.default;
    if (input) input.value = val;
    if (display) display.textContent = val;
  });
  if (saved.crestSrc) showCrestImage(saved.crestSrc);
  if (saved.logoSrc) showLogoImage(saved.logoSrc);
  const size = saved.crestSize || 160;
  applyCrestSize(size);
}

function showCrestImage(src) {
  const coverImg = document.getElementById("cover-crest-img");
  const placeholder = document.getElementById("cover-crest-placeholder");
  const thumb = document.getElementById("crest-thumb");
  const icon = document.getElementById("crest-icon");
  const label = document.getElementById("crest-label");
  coverImg.src = src;
  coverImg.style.display = "block";
  placeholder.style.display = "none";
  thumb.src = src;
  thumb.style.display = "block";
  if (icon) icon.style.display = "none";
  if (label) label.textContent = "Change";
}

function showLogoImage(src) {
  const coverImg = document.getElementById("cover-logo-img");
  const placeholder = document.getElementById("cover-logo-placeholder");
  const thumb = document.getElementById("logo-thumb");
  const icon = document.getElementById("logo-icon");
  const label = document.getElementById("logo-label");
  coverImg.src = src;
  coverImg.style.display = "block";
  placeholder.style.display = "none";
  thumb.src = src;
  thumb.style.display = "block";
  if (icon) icon.style.display = "none";
  if (label) label.textContent = "Change";
}

function applyCrestSize(size) {
  const coverImg = document.getElementById("cover-crest-img");
  const slider = document.getElementById("crest-size-slider");
  const label = document.getElementById("crest-size-value");
  coverImg.style.width = size + "px";
  coverImg.style.height = size + "px";
  if (slider) slider.value = size;
  if (label) label.textContent = size + "px";
}

function saveCoverSettings() {
  const saved = getSavedCover();
  Object.entries(coverFields).forEach(([key, field]) => {
    const input = document.getElementById(field.inputId);
    if (input) saved[key] = input.value;
  });
  localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(saved));
}

Object.entries(coverFields).forEach(([key, field]) => {
  const input = document.getElementById(field.inputId);
  const display = document.getElementById(field.displayId);
  if (!input) return;
  input.addEventListener("input", () => {
    if (display) display.textContent = input.value || field.default;
    saveCoverSettings();
  });
});

const crestSlider = document.getElementById("crest-size-slider");
if (crestSlider) {
  crestSlider.addEventListener("input", () => {
    const size = parseInt(crestSlider.value);
    applyCrestSize(size);
    const saved = getSavedCover();
    saved.crestSize = size;
    localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(saved));
  });
}

function wireImageUpload(inputId, storageKey, showFn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      showFn(src);
      const saved = getSavedCover();
      saved[storageKey] = src;
      localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(saved));
    };
    reader.readAsDataURL(file);
  });
}

const sigModeEl = document.getElementById("signature-mode");
if (sigModeEl) sigModeEl.addEventListener("change", () => renderApp());

wireImageUpload("upload-crest", "crestSrc", showCrestImage);
wireImageUpload("upload-logo", "logoSrc", showLogoImage);

const marginSlider = document.getElementById("margin-slider");
const marginValueLabel = document.getElementById("margin-value");

function applyMargin(val) {
  document.documentElement.style.setProperty("--page-margin", val + "px");
  if (marginValueLabel) marginValueLabel.textContent = val + "px";
  if (marginSlider) marginSlider.value = val;
}

if (marginSlider) {
  marginSlider.addEventListener("input", () => {
    const val = parseInt(marginSlider.value);
    applyMargin(val);
    const saved = getSavedCover();
    saved.pageMargin = val;
    localStorage.setItem(COVER_STORAGE_KEY, JSON.stringify(saved));
  });
}

const savedMargin = getSavedCover().pageMargin;
if (savedMargin) applyMargin(savedMargin);

function scaleA4Sheets() {
  if (window.innerWidth > 768) return;

  const available = window.innerWidth - 20; // 10px padding each side
  const scale = available / 794;

  document
    .querySelectorAll(".a4-sheet, .a4-sheet-continuous")
    .forEach((sheet) => {
      sheet.style.transformOrigin = "top left";
      sheet.style.transform = `scale(${scale})`;
      // Collapse the empty space the untransformed element still occupies
      sheet.style.marginBottom = `${1123 * scale - 1123}px`;
    });
}

// Run on load, tab switch, and resize
scaleA4Sheets();
window.addEventListener("resize", scaleA4Sheets);

// Also run when the Logbook View tab is clicked
// (sheets may not exist in DOM until tab is activated)
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setTimeout(scaleA4Sheets, 50); // slight delay for DOM render
  });
});

loadCoverSettings();
initData();
