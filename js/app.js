import { venues } from "./data.js?v=1.0.13";
import { createFilterBar } from "./components/FilterBar.js?v=1.0.13";
import { createVenueCard } from "./components/VenueCard.js?v=1.0.13";
import { createDetailModal } from "./components/DetailModal.js?v=1.0.13";
import { loadEnv } from "./env.js?v=1.0.13";

// Global App State
const state = {
  activeCategory: "all",
  activeSort: "featured",
  openVenue: null,
  modalElement: null,
  firebaseConfigured: false,
  activeTab: "recognition", // default active tab
  tasks: [
    { id: 1, title: "Review Q2 planning notes", priority: "normal", completed: false },
    { id: 2, title: "Submit field trip form", priority: "high", completed: false },
    { id: 3, title: "Pay pending billing invoices", priority: "low", completed: false },
    { id: 4, title: "Finalize API architecture decision", priority: "high", completed: false },
    { id: 5, title: "Confirm networking event RSVP", priority: "normal", completed: false }
  ]
};

// DOM Cache
const dom = {
  filterContainer: null,
  gridContainer: null,
  modalContainer: null
};

// Dynamic Firebase SDK Resolvers
let getAssetUrlFn = null;
let initializeFirebaseFn = null;

/**
 * Resolves local file paths to Firebase Storage download URLs if Firebase is active.
 */
/**
 * Initializes the application.
 */
async function init() {
  // Grab containers
  dom.filterContainer = document.getElementById("filter-bar-mount");
  dom.gridContainer = document.getElementById("venue-grid-mount");
  dom.modalContainer = document.getElementById("modal-mount");

  // Load environment keys
  const env = await loadEnv();

  // Try loading Firebase modules dynamically to prevent page blockage on network limits
  try {
    const firebaseModule = await import("./firebase-config.js?v=1.0.2");
    initializeFirebaseFn = firebaseModule.initializeFirebase;
    getAssetUrlFn = firebaseModule.getAssetUrl;
    
    state.firebaseConfigured = initializeFirebaseFn(env);
  } catch (error) {
    console.warn("[KreyoList] Firebase SDK failed to load. Running in local fallback mode.", error);
  }

  // Set up SPA tabs and dashboard modules
  setupTabNavigation();
  setupTasksHandlers();
  setupAssistantHandlers();
  setupSidebarToggle();
  setupProfileDropdown();

  // Render initial interface
  renderFilterBar();
  renderGrid();
}

/**
 * Updates the state and triggers component re-renders.
 * @param {Object} newStateUpdates - Partial state updates.
 */
function setState(newStateUpdates) {
  Object.assign(state, newStateUpdates);
  
  if ("activeCategory" in newStateUpdates || "activeSort" in newStateUpdates) {
    renderFilterBar();
    renderGrid();
  }

  if ("openVenue" in newStateUpdates) {
    renderModal();
  }
}

/**
 * Renders the filter and sorting control bar.
 */
function renderFilterBar() {
  if (!dom.filterContainer) return;
  
  // Clear previous filter bar
  dom.filterContainer.innerHTML = "";
  
  const filterBar = createFilterBar({
    activeCategory: state.activeCategory,
    activeSort: state.activeSort,
    onCategoryChange: (category) => setState({ activeCategory: category }),
    onSortChange: (sort) => setState({ activeSort: sort })
  });
  
  dom.filterContainer.appendChild(filterBar);
}

/**
 * Filters, sorts, and renders the venue discovery cards grid.
 */
function renderGrid() {
  if (!dom.gridContainer) return;
  
  // Grab currently rendered cards
  const existingCards = dom.gridContainer.querySelectorAll(".venue-card");
  
  if (existingCards.length > 0) {
    // Phase 1: Fade out old cards
    existingCards.forEach(card => {
      card.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      card.style.opacity = "0";
      card.style.transform = "translateY(15px)";
    });
    
    // Phase 2: Wait for fade-out, then clear and render new cards
    setTimeout(() => {
      executeRender();
    }, 200);
  } else {
    // First load: render immediately
    executeRender();
  }

  function executeRender() {
    dom.gridContainer.innerHTML = "";

    // 1. Filter the database array
    let filtered = [...venues];
    if (state.activeCategory !== "all") {
      filtered = filtered.filter(v => v.category === state.activeCategory);
    }

    // 2. Sort the database array
    if (state.activeSort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.activeSort === "city") {
      filtered.sort((a, b) => a.city.localeCompare(b.city));
    }

    // 3. Render cards or empty state
    if (filtered.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.innerHTML = `
        <h3 class="empty-state-title">No Venues Found</h3>
        <p class="empty-state-text">Select another category or check back later for newly curated spaces.</p>
      `;
      emptyState.style.opacity = "0";
      emptyState.style.transition = "opacity 0.3s ease";
      dom.gridContainer.appendChild(emptyState);
      setTimeout(() => emptyState.style.opacity = "1", 10);
      return;
    }

    // Append cards with staggered animation delays
    filtered.forEach((venue, idx) => {
      const card = createVenueCard(venue, (selectedVenue) => {
        setState({ openVenue: selectedVenue });
      }, getAssetUrlFn);
      
      // Stagger delay
      card.style.animationDelay = `${idx * 0.04}s`;
      
      dom.gridContainer.appendChild(card);
    });
  }
}

/**
 * Handles creation and teardown of the details modal overlay.
 */
function renderModal() {
  if (!dom.modalContainer) return;

  // Teardown existing modal if active
  if (state.modalElement) {
    if (typeof state.modalElement.destroy === "function") {
      state.modalElement.destroy();
    }
    state.modalElement.remove();
    state.modalElement = null;
    document.body.style.overflow = ""; // restore scrolling
  }

  // Create new modal if a venue is selected
  if (state.openVenue) {
    document.body.style.overflow = "hidden"; // lock body scrolling
    
    state.modalElement = createDetailModal(state.openVenue, () => {
      setState({ openVenue: null });
    }, getAssetUrlFn);
    
    dom.modalContainer.appendChild(state.modalElement);
  }
}

/**
 * Sets up the SPA tab navigation listeners.
 */
function setupTabNavigation() {
  const navHome = document.getElementById("nav-item-home");
  const navRec = document.getElementById("nav-item-recognition");

  if (navHome && navRec) {
    navHome.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("home");
    });

    navRec.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("recognition");
    });
  }
}

/**
 * Switches the active tab view.
 * @param {string} tabName - The name of the tab to switch to.
 */
function switchTab(tabName) {
  if (state.activeTab === tabName) return;
  state.activeTab = tabName;

  const navHome = document.getElementById("nav-item-home");
  const navRec = document.getElementById("nav-item-recognition");
  const homeView = document.getElementById("home-view");
  const recView = document.getElementById("recognition-view");

  if (tabName === "home") {
    navHome.classList.add("active");
    navRec.classList.remove("active");
    recView.style.display = "none";
    homeView.style.display = "block";
    renderHomeView();
  } else {
    navRec.classList.add("active");
    navHome.classList.remove("active");
    homeView.style.display = "none";
    recView.style.display = "block";
    renderGrid();
  }
}

/**
 * Renders the Workspace Homepage (Home View).
 */
function renderHomeView() {
  const tasksProgressText = document.getElementById("tasks-progress-text");
  const tasksProgressBarFill = document.getElementById("tasks-progress-bar-fill");
  const tasksListMount = document.getElementById("tasks-list-mount");

  if (!tasksProgressText || !tasksProgressBarFill || !tasksListMount) return;

  const total = state.tasks.length;
  const completedCount = state.tasks.filter(t => t.completed).length;

  tasksProgressText.textContent = `${completedCount} of ${total} complete`;
  tasksProgressBarFill.style.width = total > 0 ? `${(completedCount / total) * 100}%` : "0%";

  tasksListMount.innerHTML = "";
  state.tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-row priority-${task.priority} ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
      <div class="task-radio-target" role="checkbox" aria-checked="${task.completed}" tabindex="0">
        <span class="radio-circle"></span>
      </div>
      <div class="task-info">
        <span class="task-title">${task.title}</span>
        <span class="priority-tag">${task.priority}</span>
      </div>
    `;

    li.querySelector(".task-radio-target").addEventListener("click", () => {
      task.completed = !task.completed;
      renderHomeView();
    });

    tasksListMount.appendChild(li);
  });
}

/**
 * Sets up event handlers for Tasks management.
 */
function setupTasksHandlers() {
  const trigger = document.getElementById("add-task-trigger");
  const wrapper = document.getElementById("add-task-input-wrapper");
  const cancel = document.getElementById("new-task-cancel");
  const submit = document.getElementById("new-task-submit");
  const newTitle = document.getElementById("new-task-title");
  const newPriority = document.getElementById("new-task-priority");

  if (!trigger || !wrapper || !cancel || !submit || !newTitle || !newPriority) return;

  trigger.addEventListener("click", () => {
    trigger.style.display = "none";
    wrapper.style.display = "flex";
    newTitle.focus();
  });

  const closeForm = () => {
    newTitle.value = "";
    newPriority.value = "normal";
    wrapper.style.display = "none";
    trigger.style.display = "flex";
  };

  cancel.addEventListener("click", closeForm);

  submit.addEventListener("click", () => {
    const titleVal = newTitle.value.trim();
    if (!titleVal) return;

    const newTask = {
      id: Date.now(),
      title: titleVal,
      priority: newPriority.value,
      completed: false
    };

    state.tasks.push(newTask);
    closeForm();
    renderHomeView();
  });
}

/**
 * Sets up event handlers for the Assistant panel drawer.
 */
function setupAssistantHandlers() {
  const toggleBtn = document.getElementById("assistant-toggle-btn");
  const assistantBody = document.getElementById("assistant-body");

  if (!toggleBtn || !assistantBody) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = assistantBody.style.display === "block";
    if (isOpen) {
      assistantBody.style.display = "none";
      toggleBtn.textContent = "Open ^";
    } else {
      assistantBody.style.display = "block";
      toggleBtn.textContent = "Close v";
    }
  });
}

/**
 * Sets up event handlers and persistence for the Collapsible Sidebar.
 */
function setupSidebarToggle() {
  const sidebar = document.getElementById("workspace-sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");
  
  if (!sidebar || !toggleBtn) return;
  
  // Restore user preference
  const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
  if (isCollapsed) {
    sidebar.classList.add("collapsed");
  }
  
  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const collapsed = sidebar.classList.toggle("collapsed");
    localStorage.setItem("sidebar-collapsed", collapsed);
  });
}

/**
 * Sets up event handlers and preferences for the Profile Dropdown Menu.
 */
function setupProfileDropdown() {
  const profileBtn = document.getElementById("user-profile-btn");
  const dropdownMenu = document.getElementById("profile-dropdown-menu");
  const themeToggle = document.getElementById("theme-mode-toggle");
  const regionSelect = document.getElementById("dropdown-region-select");
  const logoutTrigger = document.getElementById("logout-trigger");

  if (!profileBtn || !dropdownMenu) return;

  // 1. Toggle visibility on profile click
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("active");
  });

  // 2. Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== profileBtn && !profileBtn.contains(e.target)) {
      dropdownMenu.classList.remove("active");
    }
  });

  // 3. Theme mode persistence & toggle
  const savedTheme = localStorage.getItem("theme-mode") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeToggle) themeToggle.checked = false; // toggle checkbox is checked for dark mode
  } else {
    document.body.classList.remove("light-mode");
    if (themeToggle) themeToggle.checked = true;
  }

  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      if (themeToggle.checked) {
        document.body.classList.remove("light-mode");
        localStorage.setItem("theme-mode", "dark");
      } else {
        document.body.classList.add("light-mode");
        localStorage.setItem("theme-mode", "light");
      }
    });
  }

  // 4. Region Selector persistence & handler
  const savedRegion = localStorage.getItem("user-region") || "boston";
  if (regionSelect) {
    regionSelect.value = savedRegion;
    regionSelect.addEventListener("change", () => {
      localStorage.setItem("user-region", regionSelect.value);
      console.log(`[KreyoList] User region set to: ${regionSelect.value}`);
    });
  }

  // 5. Logout handler
  if (logoutTrigger) {
    logoutTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      const confirmLogout = confirm("Are you sure you want to log out of Kreyō List?");
      if (confirmLogout) {
        alert("Logging out... Redirecting to guest view.");
        window.location.reload();
      }
    });
  }
}

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", init);
