const username = "uhtred-X";
const repo = "cohort-tasks";

const grid      = document.getElementById("grid");
const status    = document.getElementById("status");
const heading   = document.getElementById("heading");
const subtitle  = document.getElementById("subtitle");
const eyebrow   = document.getElementById("eyebrow");
const backBtn   = document.getElementById("back-btn");

const diffColour = {
    easy:   { bg: "rgba(52,211,153,0.12)",  text: "#34d399" },
    medium: { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24" },
    hard:   { bg: "rgba(248,113,113,0.12)", text: "#f87171" },
};

function diffBadge(name) {
    const key = name.toLowerCase();
    const c = diffColour[key];
    if (!c) return `<span class="card-meta">${name}</span>`;
    return `<span style="background:${c.bg};color:${c.text};font-size:11px;font-family:var(--mono);
            letter-spacing:.05em;padding:3px 10px;border-radius:20px;display:inline-block;">${name}</span>`;
}

function showSkeletons(count = 6) {
    grid.innerHTML = Array.from({ length: count }, () => `
        <div class="skeleton">
            <div class="skeleton-line" style="width:36px;height:36px;border-radius:8px;"></div>
            <div class="skeleton-line" style="width:70%;height:14px;margin-top:4px;"></div>
            <div class="skeleton-line" style="width:40%;height:11px;"></div>
        </div>
    `).join("");
}

function folderIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
    </svg>`;
}

function arrowIcon() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 17L17 7M17 7H7M17 7v10"/>
    </svg>`;
}

// "" → []   "#/Task1" → ["Task1"]   "#/Task1/Easy" → ["Task1","Easy"]
function parsePath() {
    const hash = location.hash.replace(/^#\/?/, "");
    return hash ? hash.split("/") : [];
}

function buildApiUrl(segments) {
    const path = segments.length ? "/" + segments.join("/") : "";
    return `https://api.github.com/repos/${username}/${repo}/contents${path}`;
}

async function render() {
    const segments = parsePath();
    showSkeletons();

    // Update header
    if (segments.length === 0) {
        heading.textContent   = "Cohort Tasks";
        subtitle.textContent  = "Select a project to open";
        eyebrow.textContent   = `${username} / ${repo}`;
        backBtn.style.display = "none";
    } else {
        heading.textContent   = segments.map(s => s.replaceAll("-", " ")).join(" › ");
        subtitle.textContent  = segments.length === 1 ? "Select a difficulty" : "";
        eyebrow.textContent   = `${username} / ${repo} / ${segments.join(" / ")}`;
        backBtn.style.display = "inline-flex";
        backBtn.href          = segments.length > 1 ? `#/${segments.slice(0, -1).join("/")}` : "#";
    }

    try {
        const res = await fetch(buildApiUrl(segments));
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

        const data    = await res.json();
        const folders = data.filter(item => item.type === "dir" && !item.name.startsWith("."));

        grid.innerHTML = "";

        if (folders.length === 0) {
            status.textContent = "no folders found";
            return;
        }

        const isDiffLevel = segments.length === 1; // next click opens actual project

        folders.forEach(folder => {
            const label    = folder.name.replaceAll("-", " ");
            const nextSegs = [...segments, folder.name];

            const card = document.createElement("a");
            card.className = "card";
            card.setAttribute("aria-label", label);

            if (isDiffLevel) {
                // Direct link into Task/Difficulty — Vercel serves the index.html there
                card.href = `./${nextSegs.join("/")}/`;
            } else {
                // Hash-navigate within the SPA
                card.href = `#/${nextSegs.join("/")}`;
            }

            card.innerHTML = `
                <div class="card-top">
                    <div class="card-icon">${folderIcon()}</div>
                    <span class="card-arrow">${arrowIcon()}</span>
                </div>
                <h2>${label}</h2>
                ${isDiffLevel
                    ? diffBadge(folder.name)
                    : `<span class="card-meta">${username} / ${repo} / ${folder.name}</span>`
                }
            `;

            grid.appendChild(card);
        });

        status.textContent = `${folders.length} folder${folders.length !== 1 ? "s" : ""} found`;

    } catch (err) {
        grid.innerHTML = "";
        status.textContent = `error: ${err.message}`;
        console.error(err);
    }
}

window.addEventListener("hashchange", render);
render();