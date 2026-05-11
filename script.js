const username = "uhtred-X";
const repo = "cohort-tasks";

const grid = document.getElementById("grid");
const status = document.getElementById("status");

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

async function loadProjects() {
    showSkeletons();

    try {
        const response = await fetch(
            `https://api.github.com/repos/${username}/${repo}/contents`
        );

        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

        const data = await response.json();
        const folders = data.filter(item => item.type === "dir");

        grid.innerHTML = "";

        if (folders.length === 0) {
            status.textContent = "no projects found";
            return;
        }

        folders.forEach(folder => {
            const label = folder.name.replaceAll("-", " ");

            const card = document.createElement("a");
            card.href = `./${folder.name}/`;
            card.className = "card";
            card.setAttribute("aria-label", label);

            card.innerHTML = `
                <div class="card-top">
                    <div class="card-icon">${folderIcon()}</div>
                    <span class="card-arrow">${arrowIcon()}</span>
                </div>
                <h2>${label}</h2>
                <span class="card-meta">cohort-tasks / ${folder.name}</span>
            `;

            grid.appendChild(card);
        });

        status.textContent = `${folders.length} project${folders.length !== 1 ? "s" : ""} loaded`;

    } catch (err) {
        grid.innerHTML = "";
        status.textContent = `error: ${err.message}`;
        console.error(err);
    }
}

loadProjects();