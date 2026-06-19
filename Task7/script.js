// ---------- Grab elements we need ----------
const form = document.querySelector("#taskForm");
const titleInput = document.querySelector("#task-title");
const descInput = document.querySelector("#task-desc");
const categorySelect = document.querySelector("#task-category");
const priorityDiv = document.querySelector("#priorityDiv");
const container = document.querySelector("#task-container");

const searchInput = document.querySelector("#searchInput");
const filterCategory = document.querySelector("#filterCategory");
const clearAllBtn = document.querySelector("#clearAllBtn");

const totalCountEl = document.querySelector("#totalCount");
const pendingCountEl = document.querySelector("#pendingCount");
const completedCountEl = document.querySelector("#completedCount");

// ---------- App state ----------
const STORAGE_KEY = "taskManagerTasks";

// Load any tasks saved from last time (if none, start with an empty list)
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let selectedPriority = ""; // currently chosen radio value

// nextId should continue after the highest id we already have saved
let nextId = tasks.length
  ? Math.max(...tasks.map((t) => t.id)) + 1
  : 1;

// Save the current tasks array to localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function demoAttributeVsProperty() {
  titleInput.value = ""; // property: live current value
  console.log(
    "Property (input.value):",
    titleInput.value,
    "| Attribute (getAttribute('value')):",
    titleInput.getAttribute("value")
  );
}
// ---------- Priority selection (event delegation) ----------
priorityDiv.addEventListener("change", (e) => {
  if (e.target.type === "radio") {
    selectedPriority = e.target.value;
  }
});

function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task-card" + (task.completed ? " completed" : "");

  // Custom data attributes (Attributes vs Properties practice)
  card.dataset.id = task.id;
  card.dataset.status = task.completed ? "completed" : "pending";
  card.dataset.category = task.category;

  const title = document.createElement("h3");
  title.className = "task-title";
  title.append(document.createTextNode(task.title)); // createTextNode + append

  const desc = document.createElement("p");
  desc.className = "task-desc";
  desc.textContent = task.description;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const categoryTag = document.createElement("span");
  categoryTag.textContent = `📁 ${task.category}`;

  const priorityTag = document.createElement("span");
  priorityTag.className = `tag tag-${task.priority.toLowerCase()}`;
  priorityTag.textContent = task.priority;

  meta.append(categoryTag, priorityTag);

  // Buttons (Edit / Complete / Delete) — identified via data-action
  const buttons = document.createElement("div");
  buttons.className = "task-buttons";
  buttons.innerHTML = `
    <button class="btn-small btn-complete" data-action="complete">✔ Done</button>
    <button class="btn-small btn-edit" data-action="edit">✎ Edit</button>
    <button class="btn-small btn-delete" data-action="delete">🗑 Delete</button>
  `;

  card.append(title, desc, meta, buttons);
  return card;
}

function renderTasks() {
  container.innerHTML = ""; // clear old cards

  const searchTerm = searchInput.value.trim().toLowerCase();
  const categoryFilter = filterCategory.value;

  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      categoryFilter === "All" || task.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // DocumentFragment = build off-screen, then add to page once (faster)
  const fragment = document.createDocumentFragment();
  visibleTasks.forEach((task) => fragment.append(createTaskCard(task)));
  container.append(fragment);

  updateStats();
}

function updateStats() {
  const completed = tasks.filter((t) => t.completed).length;
  totalCountEl.textContent = tasks.length;
  completedCountEl.textContent = completed;
  pendingCountEl.textContent = tasks.length - completed;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const category = categorySelect.value;

  if (!title || !description || !category || !selectedPriority) {
    alert("Please fill in every field, including priority.");
    return;
  }

  tasks.push({
    id: nextId++,
    title,
    description,
    category,
    priority: selectedPriority,
    completed: false,
  });

  saveTasks();
  renderTasks();
  form.reset();
  selectedPriority = "";
});

container.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const card = button.closest(".task-card");
  const id = Number(card.dataset.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const action = button.dataset.action;

  if (action === "delete") {
    // remove() — DOM method straight from the task list
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
  }

  if (action === "complete") {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }

  if (action === "edit") {
    // Load task back into the form
    titleInput.value = task.title;
    descInput.value = task.description;
    categorySelect.value = task.category;
    selectedPriority = task.priority;
    document
      .querySelector(`input[name="priority"][value="${task.priority}"]`)
      .checked = true;

    // Remove the old task; user will re-submit the form to save changes
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
    titleInput.focus();
  }
});

// ---------- Search & filter ----------
searchInput.addEventListener("input", renderTasks);
filterCategory.addEventListener("change", renderTasks);

// ---------- Clear all ----------
clearAllBtn.addEventListener("click", () => {
  if (tasks.length === 0) return;
  if (confirm("Delete all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});


const themeToggle = document.querySelector("#themeToggle");

themeToggle.addEventListener("click", () => {
  const isDark = document.body.dataset.theme === "dark";
  const newTheme = isDark ? "light" : "dark";

  document.body.setAttribute("data-theme", newTheme);
  themeToggle.textContent = isDark ? "🌙 Dark Mode" : "☀ Light Mode";
});

const grandparent = document.querySelector("#grandparent");
const parent = document.querySelector("#parent");
const child = document.querySelector("#child");

// Only wire this up if the demo section actually exists on the page
if (grandparent && parent && child) {
  grandparent.addEventListener("click", () => console.log("Bubbling: Grandparent"));
  parent.addEventListener("click", () => console.log("Bubbling: Parent"));
  child.addEventListener("click", () => console.log("Bubbling: Child"));

  grandparent.addEventListener(
    "click",
    () => console.log("Capturing: Grandparent"),
    true
  );
  parent.addEventListener("click", () => console.log("Capturing: Parent"), true);
  child.addEventListener("click", () => console.log("Capturing: Child"), true);
}

// ---------- Initial render ----------
demoAttributeVsProperty();
renderTasks();
