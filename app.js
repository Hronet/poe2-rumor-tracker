"use strict";

const RUMOR_KEY = "poe2-rumor-defs";
const SETS_KEY = "poe2-rumor-sets";
const MAX_SELECTION = 6;

const RATINGS = ["S+", "A+", "A", "B", "C", "D"];
const RATING_VALUE = { "S+": 6, "A+": 5, "A": 4, "B": 3, "C": 2, "D": 1 };
const RATING_CSS = {
    "S+": "rating-splus", "A+": "rating-aplus", "A": "rating-a",
    "B": "rating-b", "C": "rating-c", "D": "rating-d",
};

const CATEGORIES = [
    { key: "expedition", label: "Grand Expeditions", single: "Grand Expedition", css: "group-expedition" },
    { key: "unique", label: "Unique Maps", single: "Unique Map", css: "group-unique" },
    { key: "boss", label: "Bosses", single: "Boss", css: "group-boss" },
];

function defaultRumors() {
    return [
        { id: "fallen-stars", name: "Fallen skies...", map: "Moor", mods: "Runestones", rating: "S+", category: "expedition" },
        { id: "cold-as-ice", name: "Cold as ice...", map: "Frigid Bluffs", mods: "Old Expedition", rating: "A+", category: "expedition" },
        { id: "nothing-to-drink", name: "Nothin' to drink...", map: "Stagnant Basin", mods: "Oil", rating: "A", category: "expedition" },
        { id: "endless-cliffs", name: "Endless cliffs...", map: "Craggy Peninsula", mods: "Rarity / Rogue Exiles", rating: "A", category: "expedition" },
        { id: "sulphite", name: "Sulphite!", map: "Scorched Cay", mods: "Increased Rarity", rating: "A", category: "expedition" },
        { id: "unknown-ruins", name: "Unknown ruins...", map: "Exhumed Ruins", mods: "Precursor Leylines", rating: "B", category: "expedition" },
        { id: "something-fishy", name: "Somethin' fishy...", map: "Bleached Shoals", mods: "Gold", rating: "B", category: "expedition" },
        { id: "its-warm", name: "Warm but risky...", map: "Lush Island", mods: "Exp / Beyond / Hoards", rating: "B", category: "expedition" },
        { id: "bleak-and-awful", name: "Bleak and awful...", map: "Barren Atoll", mods: "Strongbox", rating: "B", category: "expedition" },
        { id: "its-dry-at-least", name: "It's dry at least...", map: "Sloughed Gully", mods: "Monster Effectiveness", rating: "D", category: "expedition" },
        { id: "wild-roaming-free", name: "Wild roaming free...", map: "Grazed Prairie", mods: "Azmeri Spirits", rating: "D", category: "expedition" },

        { id: "reflective-waters", name: "Reflective waters...", map: "Lake of Kalandra", mods: "Ring Bases", rating: "A", category: "unique" },
        { id: "all-that-glitters", name: "All the glitters...", map: "Castaway", mods: "Gold", rating: "A", category: "unique" },
        { id: "almost-paradise", name: "Almost paradise...", map: "Untainted Paradise", mods: "Exp", rating: "C", category: "unique" },
        { id: "a-good-fellow", name: "A good fellow...", map: "Moment of Zen", mods: "Seer", rating: "C", category: "unique" },

        { id: "origin-of-the-fall", name: "Origin of the fall...", map: "Obscure Island", mods: "Olroth", rating: "A", category: "boss" },
        { id: "stardrinker", name: "Stardrinker...", map: "Secluded Temple", mods: "Uhtred", rating: "A", category: "boss" },
        { id: "last-to-fall", name: "Last to fall...", map: "Mournful Cliffside", mods: "Vorana", rating: "B", category: "boss" },
        { id: "end-of-the-circle", name: "End of the circle...", map: "Sprawling Jungle", mods: "Medved", rating: "B", category: "boss" },
    ];
}

function loadJson(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

let rumors = loadJson(RUMOR_KEY) || defaultRumors();
let savedSets = loadJson(SETS_KEY) || [];
const selected = new Set();
let editingId = null;

const $ = (id) => document.getElementById(id);

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

const ratingBadge = (r) =>
    `<span class="rating-badge ${RATING_CSS[r.rating] || "rating-d"}">${esc(r.rating)}</span>`;

const byId = (id) => rumors.find((r) => r.id === id);

const resolve = (ids) => ids.map(byId).filter(Boolean);

const newId = () =>
    (crypto.randomUUID ? crypto.randomUUID() : "r" + Math.random().toString(36).slice(2) + Date.now());

function persistRumors() {
    saveJson(RUMOR_KEY, rumors);
    $("customized-chip").hidden = false;
}

function persistSets() {
    saveJson(SETS_KEY, savedSets);
}

const expeditionsOf = (rumorList) => rumorList.filter((r) => r.category === "expedition");

const scoreOf = (rumorList) =>
    expeditionsOf(rumorList).reduce((sum, r) => sum + (RATING_VALUE[r.rating] || 0), 0);

function renderRumorList() {
    const full = selected.size >= MAX_SELECTION;

    $("rumor-groups").innerHTML = CATEGORIES.map((cat) => {
        const items = rumors.filter((r) => r.category === cat.key);
        if (!items.length) return "";
        const rows = items.map((r) => {
            const checked = selected.has(r.id);
            const disabled = !checked && full;
            return `<li class="rumor-row${checked ? " rumor-row-selected" : ""}${disabled ? " rumor-row-disabled" : ""}">
                <label>
                    <input type="checkbox" data-id="${esc(r.id)}"${checked ? " checked" : ""}${disabled ? " disabled" : ""}>
                    <span class="rumor-name">${esc(r.name)}</span>
                    <span class="rumor-map">${esc(r.map)}</span>
                    <span class="rumor-mods">${esc(r.mods)}</span>
                    ${ratingBadge(r)}
                </label>
            </li>`;
        }).join("");
        return `<h3 class="group-title ${cat.css}">${cat.label}</h3><ul class="rumor-list">${rows}</ul>`;
    }).join("");

    const counter = $("pick-counter");
    counter.textContent = `${selected.size} / ${MAX_SELECTION} selected`;
    counter.classList.toggle("pick-counter-full", full);
}

function renderAnalysis() {
    const picked = resolve([...selected]);
    const none = picked.length === 0;

    $("analysis").hidden = none;
    $("clear-btn").hidden = none;
    if (none) return;

    const expeditions = expeditionsOf(picked).sort((a, b) => (RATING_VALUE[b.rating] || 0) - (RATING_VALUE[a.rating] || 0));
    const uniques = picked.filter((r) => r.category === "unique").length;
    const bosses = picked.filter((r) => r.category === "boss").length;
    const score = scoreOf(picked);

    let html = `<div class="stat-tiles">
        <div class="stat-tile stat-tile-expedition"><span class="stat-number">${expeditions.length}</span><span class="stat-label">Grand Expeditions</span></div>
        <div class="stat-tile"><span class="stat-number">${uniques}</span><span class="stat-label">Unique Maps</span></div>
        <div class="stat-tile"><span class="stat-number">${bosses}</span><span class="stat-label">Bosses</span></div>
        <div class="stat-tile"><span class="stat-number">${score}</span><span class="stat-label">Expedition Score</span></div>
    </div>`;

    if (expeditions.length) {
        html += `<h3 class="group-title group-expedition">Expeditions in this set</h3>
            <table class="exp-table">
                <thead><tr><th>Rating</th><th>Rumor</th><th>Map</th><th>Effect</th></tr></thead>
                <tbody>`
            + expeditions.map((r) =>
                `<tr><td>${ratingBadge(r)}</td><td class="exp-name">${esc(r.name)}</td><td>${esc(r.map)}</td><td>${esc(r.mods)}</td></tr>`
            ).join("")
            + `</tbody></table>`;
    }

    $("stats-content").innerHTML = html;

    updateSaveButton();
}

function updateSaveButton() {
    const btn = $("save-btn");
    btn.disabled = $("set-name").value.trim() === "" || selected.size === 0;
    btn.textContent = editingId ? "Update Set" : "Save Set";
}

function renderSavedSets() {
    const sorted = [...savedSets].sort((a, b) => {
        const diff = scoreOf(resolve(b.rumorIds)) - scoreOf(resolve(a.rumorIds));
        return diff !== 0 ? diff : expeditionsOf(resolve(b.rumorIds)).length - expeditionsOf(resolve(a.rumorIds)).length;
    });

    $("saved-list").innerHTML = sorted.map((set) => {
        const setRumors = resolve(set.rumorIds).sort((a, b) => {
            const expDiff = (b.category === "expedition") - (a.category === "expedition");
            return expDiff !== 0 ? expDiff : (RATING_VALUE[b.rating] || 0) - (RATING_VALUE[a.rating] || 0);
        });
        const expeditionCount = expeditionsOf(setRumors).length;
        const rows = setRumors.map((r) =>
            `<li title="${esc(r.mods)}">${ratingBadge(r)}<span class="rumor-name">${esc(r.name)}</span><span class="rumor-map">${esc(r.map)}</span></li>`
        ).join("");

        return `<li class="saved-card${set.id === editingId ? " saved-card-active" : ""}">
            <div class="saved-card-top">
                <span class="saved-name">${esc(set.name)}</span>
                <button class="id-pill" data-action="copy-id" data-setid="${esc(set.setId || "")}"
                        title="Click to copy">${esc(set.setId || "")}</button>
            </div>
            <ul class="saved-rumors">${rows}</ul>
            <div class="saved-card-meta">
                <span>${expeditionCount} expedition${expeditionCount === 1 ? "" : "s"}</span>
                <span class="saved-actions">
                    <button class="btn btn-ghost" data-action="load" data-id="${esc(set.id)}">Load</button>
                    <button class="btn btn-ghost btn-danger" data-action="delete" data-id="${esc(set.id)}">Delete</button>
                </span>
            </div>
        </li>`;
    }).join("");
}

function renderTracker() {
    renderRumorList();
    renderAnalysis();
    renderSavedSets();
}

function renderSettings() {
    $("customized-chip").hidden = loadJson(RUMOR_KEY) === null;

    $("settings-groups").innerHTML = CATEGORIES.map((cat) => {
        const rows = rumors.filter((r) => r.category === cat.key).map((r) => `
            <div class="settings-row">
                <input class="text-input" data-id="${esc(r.id)}" data-field="name" value="${esc(r.name)}">
                <input class="text-input" data-id="${esc(r.id)}" data-field="map" value="${esc(r.map)}">
                <input class="text-input" data-id="${esc(r.id)}" data-field="mods" value="${esc(r.mods)}">
                <select class="text-input rating-select" data-id="${esc(r.id)}" data-field="rating">
                    ${RATINGS.map((rt) => `<option value="${rt}"${rt === r.rating ? " selected" : ""}>${rt}</option>`).join("")}
                </select>
                <button class="btn btn-ghost btn-danger" title="Delete rumor" data-action="delete-rumor" data-id="${esc(r.id)}">✕</button>
            </div>`).join("");

        return `<h3 class="group-title ${cat.css}">${cat.label}</h3>
            <div class="settings-table">
                <div class="settings-row settings-row-head">
                    <span>Rumor</span><span>Map Type</span><span>Mods</span><span>Rating</span><span></span>
                </div>
                ${rows}
            </div>
            <button class="btn btn-ghost add-btn" data-action="add-rumor" data-cat="${cat.key}">+ Add ${cat.label} rumor</button>`;
    }).join("");
}

const ID_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const issuedIds = new Set();

function generateSetId() {
    const used = new Set(issuedIds);
    for (const s of savedSets) if (s.setId) used.add(s.setId);
    let id;
    do {
        const buf = new Uint32Array(4);
        crypto.getRandomValues(buf);
        id = Array.from(buf, (n) => ID_CHARS[n % ID_CHARS.length]).join("");
    } while (used.has(id));
    issuedIds.add(id);
    return id;
}

function backfillSetIds() {
    let dirty = false;
    for (const s of savedSets) {
        if (!s.setId) {
            s.setId = generateSetId();
            dirty = true;
        }
    }
    if (dirty) persistSets();
}

function clearSelection() {
    selected.clear();
    editingId = null;
    $("set-name").value = "";
    renderTracker();
}

function saveCurrentSet() {
    const name = $("set-name").value.trim();
    if (!name || selected.size === 0) return;

    const existing = editingId && savedSets.find((s) => s.id === editingId);
    if (existing) {
        existing.name = name;
        existing.rumorIds = [...selected];
        existing.savedAt = new Date().toISOString();
    } else {
        savedSets.push({
            id: newId(),
            setId: generateSetId(),
            name,
            rumorIds: [...selected],
            savedAt: new Date().toISOString(),
        });
    }

    persistSets();
    clearSelection();
}

function loadSet(id) {
    const set = savedSets.find((s) => s.id === id);
    if (!set) return;
    selected.clear();
    for (const rid of set.rumorIds.slice(0, MAX_SELECTION)) selected.add(rid);
    editingId = set.id;
    $("set-name").value = set.name;
    renderTracker();
}

function copySetId(btn) {
    const text = btn.dataset.setid;
    const done = () => {
        btn.textContent = "copied";
        btn.classList.add("id-pill-copied");
        setTimeout(() => {
            btn.textContent = text;
            btn.classList.remove("id-pill-copied");
        }, 900);
    };
    const fallback = () => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch {}
        ta.remove();
        done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
    } else {
        fallback();
    }
}

function deleteSet(id) {
    savedSets = savedSets.filter((s) => s.id !== id);
    if (editingId === id) editingId = null;
    persistSets();
    renderTracker();
}

function switchView() {
    const settings = location.hash === "#settings";
    $("view-tracker").hidden = settings;
    $("view-settings").hidden = !settings;
    $("nav-tracker").classList.toggle("active", !settings);
    $("nav-settings").classList.toggle("active", settings);
    if (settings) renderSettings();
    else renderTracker();
}

$("rumor-groups").addEventListener("change", (e) => {
    const box = e.target.closest("input[type=checkbox][data-id]");
    if (!box) return;
    if (box.checked && selected.size < MAX_SELECTION) selected.add(box.dataset.id);
    else selected.delete(box.dataset.id);
    renderRumorList();
    renderAnalysis();
});

$("clear-btn").addEventListener("click", clearSelection);
$("save-btn").addEventListener("click", saveCurrentSet);

$("set-name").addEventListener("input", updateSaveButton);
$("set-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !$("save-btn").disabled) saveCurrentSet();
});

$("saved-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "load") loadSet(btn.dataset.id);
    else if (btn.dataset.action === "delete") deleteSet(btn.dataset.id);
    else if (btn.dataset.action === "copy-id") copySetId(btn);
});

$("settings-groups").addEventListener("change", (e) => {
    const field = e.target.closest("[data-id][data-field]");
    if (!field) return;
    const rumor = byId(field.dataset.id);
    if (!rumor) return;
    rumor[field.dataset.field] = field.value;
    persistRumors();
});

$("settings-groups").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "delete-rumor") {
        rumors = rumors.filter((r) => r.id !== btn.dataset.id);
        selected.delete(btn.dataset.id);
        persistRumors();
        renderSettings();
    } else if (btn.dataset.action === "add-rumor") {
        const cat = btn.dataset.cat;
        const rumor = { id: newId(), name: "New Rumor", map: "", mods: "", rating: "B", category: cat };
        let lastIdx = -1;
        rumors.forEach((r, i) => { if (r.category === cat) lastIdx = i; });
        rumors.splice(lastIdx + 1, 0, rumor);
        persistRumors();
        renderSettings();
    }
});

$("reset-btn").addEventListener("click", () => { $("confirm-bar").hidden = false; });
$("cancel-reset-btn").addEventListener("click", () => { $("confirm-bar").hidden = true; });
$("confirm-reset-btn").addEventListener("click", () => {
    $("confirm-bar").hidden = true;
    rumors = defaultRumors();
    try { localStorage.removeItem(RUMOR_KEY); } catch {}
    renderSettings();
});

window.addEventListener("hashchange", switchView);

backfillSetIds();
switchView();
