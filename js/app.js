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
  activeTab: "home", // default active tab
  selectedEmailId: null, // default selected email
  inbox: [
    { id: 1, sender: "Jena Charles", avatar: "JC", subject: "LOCKED OUT: Please unlock account ASAP", time: "8:14 AM", unread: true, state: "added", body: "Hello Jean,\n\nI hope you’re well.\n\nI’m locked out of my Active Directory domain account. I entered my password incorrectly three times this morning.\n\nI need access to the client database to prepare for the upcoming Q2 audit. Any downtime will impact our schedule. Please prioritize this.\n\nLet me know when the account is reset or if you need me to verify security details.\n\nThanks,\nJena Charles" },
    { id: 2, sender: "Security Operations Center", avatar: "SO", subject: "CRITICAL: Unrecognized ssh attempts on production server", time: "7:45 AM", unread: true, state: "added", body: "Hello Jean,\n\nI hope this email finds you well.\n\nOur automated monitoring tools have flagged multiple unauthorized SSH login attempts on our core production cluster [Node-04] starting at 07:15 AM. The traffic appears to be originating from an unmapped external IP address.\n\nPlease inspect the authentication log files immediately, update the active firewall rules to block this range, and ensure our deployment pipelines remain secure. Let us know your findings as soon as possible.\n\nBest regards,\nSOC Team" },
    { id: 3, sender: "Marcus Vance", avatar: "MV", subject: "Motherboard replacement parts have arrived for dev laptop", time: "Yesterday", unread: true, state: "not_added", body: "Hi Jean,\n\nHope you're having a good week.\n\nThe replacement system board for the developer laptop (Unit-B) has officially been delivered to the front desk logistics area.\n\nWhen you have a moment, please retrieve the hardware, execute the physical motherboard swap, and re-image the machine so we can return it to production.\n\nThanks for the help,\nMarcus Vance" },
    { id: 4, sender: "HR Onboarding", avatar: "HR", subject: "Password reset required for new remote engineer", time: "Yesterday", unread: true, state: "none", body: "Hi, please create a new user profile, configure corporate SSH keys, and email temporary credentials to our new remote engineering hire who starts on Monday." },
    { id: 5, sender: "Datadog Alerts", avatar: "DA", subject: "WARNING: CPU spike on staging database server", time: "Oct 12", unread: false, state: "none", body: "Trigger: CPU usage exceeded 85% on db-staging-02. Please review current query execution plans, check locking queries, and optimize active logs." },
    { id: 6, sender: "HelpDesk Escalation", avatar: "HE", subject: "Account unlock request: VIP Sales Director", time: "Oct 12", unread: false, state: "none", body: "Hi, our VIP Sales Director is locked out of Salesforce and needs immediate AD override. Secondary authorization is attached. Please process ASAP." },
    { id: 7, sender: "Laptop Provisioning", avatar: "LP", subject: "Hardware diagnostics check complete for Unit-B", time: "Oct 10", unread: false, state: "none", body: "Diagnostics run on Unit-B complete. Memory test passed, drive check passed. Please log this completion in the asset inventory system." }
  ],
  tasks: [
    { id: 1, title: "Unlock Jena Charles' Active Directory domain account", priority: "high", completed: false, source: "Outlook - Jena Charles" },
    { id: 2, title: "Investigate production server SSH unauthorized access lines", priority: "high", completed: false, source: "Outlook - Security Operations Center" },
    { id: 3, title: "Review database performance and clean query logs on staging", priority: "normal", completed: false, source: "Internal System" },
    { id: 4, title: "Reset password and generate temporary keys for new engineer onboarding", priority: "normal", completed: false, source: "Outlook - HR Onboarding" },
    { id: 5, title: "Analyze staging database CPU metrics and check query logs", priority: "normal", completed: false, source: "Outlook - Datadog Alerts" },
    { id: 6, title: "Review secondary authorization to unlock VIP Sales account", priority: "high", completed: false, source: "Outlook - HelpDesk Escalation" },
    { id: 7, title: "Update laptop hardware asset inventory log for Unit-B", priority: "low", completed: false, source: "Outlook - Laptop Provisioning" },
    { id: 8, title: "Verify daily backups across enterprise storage clusters", priority: "high", completed: false, source: "Internal System" },
    { id: 9, title: "Run patch updates on staging environment firewall rules", priority: "normal", completed: false, source: "Internal System" },
    { id: 10, title: "Audit root user access logs for Q2 infrastructure compliance", priority: "normal", completed: false, source: "Compliance System" }
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
  setupDossierHandlers();
  setupAssistantFabScrollDetector();

  // Escape key global listener to close/deselect active reading email
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.selectedEmailId !== null) {
        state.selectedEmailId = null;
        renderHomeView();
      }
    }
  });

  // Render initial interface
  renderFilterBar();
  renderGrid();
  
  // Initialize default Home View layout and scroll states
  const appMain = document.querySelector(".app-main-scrollable");
  if (appMain) appMain.classList.add("home-active");
  renderHomeView();
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
  const appMain = document.querySelector(".app-main-scrollable");

  if (tabName === "home") {
    navHome.classList.add("active");
    navRec.classList.remove("active");
    recView.style.display = "none";
    homeView.style.display = "block";
    if (appMain) appMain.classList.add("home-active");
    renderHomeView();
  } else {
    navRec.classList.add("active");
    navHome.classList.remove("active");
    homeView.style.display = "none";
    recView.style.display = "block";
    if (appMain) appMain.classList.remove("home-active");
    renderGrid();
  }
}

/**
 * Renders the Workspace Homepage (Home View).
 */
function renderHomeView() {
  const progressPercent = document.getElementById("horizon-progress-percent");
  const activeFill = document.getElementById("horizon-active-fill");
  const expectedFill = document.getElementById("horizon-expected-fill");
  const tooltipExpected = document.getElementById("tooltip-expected-tasks");
  const tooltipVelocity = document.getElementById("tooltip-velocity-val");
  const tasksListMount = document.getElementById("tasks-list-mount");
  
  const milestoneDaily = document.getElementById("milestone-daily");
  const milestoneWeekly = document.getElementById("milestone-weekly");
  const milestoneMonthly = document.getElementById("milestone-monthly");

  if (!tasksListMount) return;

  const total = state.tasks.length;
  const completedCount = state.tasks.filter(t => t.completed).length;

  // 1. Calculate progression percentage
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
  if (activeFill) activeFill.style.width = `${percent}%`;

  // 2. Expected target baseline details
  const expectedRate = 60; // 3 of 5 baseline target
  const expectedCompletions = Math.round(total * (expectedRate / 100));
  if (expectedFill) expectedFill.style.width = `${expectedRate}%`;
  if (tooltipExpected) tooltipExpected.textContent = `${expectedCompletions} of ${total} (${expectedRate}%)`;

  // 3. Compute current velocity difference
  const velocityDiff = percent - expectedRate;
  if (tooltipVelocity) {
    if (velocityDiff >= 0) {
      tooltipVelocity.textContent = `+${velocityDiff}% expected`;
      tooltipVelocity.className = "metric-val text-gold";
    } else {
      tooltipVelocity.textContent = `${velocityDiff}% expected`;
      tooltipVelocity.className = "metric-val";
    }
  }

  // 4. Milestone dots achieved class highlights
  if (milestoneDaily) {
    if (percent >= 20) milestoneDaily.classList.add("achieved");
    else milestoneDaily.classList.remove("achieved");
  }
  if (milestoneWeekly) {
    if (percent >= 60) milestoneWeekly.classList.add("achieved");
    else milestoneWeekly.classList.remove("achieved");
  }
  if (milestoneMonthly) {
    if (percent >= 90) milestoneMonthly.classList.add("achieved");
    else milestoneMonthly.classList.remove("achieved");
  }

  tasksListMount.innerHTML = "";
  state.tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-row priority-${task.priority} ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
      <div class="task-radio-target" role="checkbox" aria-checked="${task.completed}" tabindex="0">
        <span class="radio-circle"></span>
      </div>
      <div class="task-info">
        <div class="task-title-row">
          <span class="task-title">${task.title}</span>
          <span class="priority-tag">${task.priority}</span>
        </div>
        ${task.source ? `
        <div class="task-source-badge">
          <span class="source-icon">${task.source.includes('Outlook') ? '✉' : '⚙'}</span>
          <span class="source-text">Source: ${task.source}</span>
        </div>
        ` : ''}
      </div>
    `;

    li.querySelector(".task-radio-target").addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent opening dossier panel
      task.completed = !task.completed;
      renderHomeView();
      // If active task is checked completed, close dossier
      if (activeDossierTaskId === task.id) {
        closeActionDossier();
      }
    });

    li.querySelector(".task-info").addEventListener("click", () => {
      openActionDossier(task);
    });

    tasksListMount.appendChild(li);
  });

  // 5. Render Inbox list dynamically
  const inboxListMount = document.querySelector(".inbox-list");
  const unreadIndicator = document.querySelector(".unread-indicator");
  if (inboxListMount) {
    inboxListMount.innerHTML = "";
    
    // Count unread items
    const unreadCount = state.inbox.filter(item => item.unread).length;
    if (unreadIndicator) {
      unreadIndicator.textContent = `${unreadCount} unread`;
    }
    
    state.inbox.forEach(item => {
      const li = document.createElement("li");
      li.className = `inbox-item ${item.unread ? 'unread border-[#0078D4]' : ''}`;
      if (item.unread) {
        li.classList.add("bg-[#0078D4]/5");
      }
      if (item.id === state.selectedEmailId) {
        li.classList.add("selected");
      }
      li.innerHTML = `
        <div class="sender-avatar">${item.avatar}</div>
        <div class="inbox-item-content">
          <div class="inbox-item-sender">${item.sender}</div>
          <div class="inbox-item-subject">${item.subject}</div>
        </div>
        <div class="inbox-item-meta">
          <span class="inbox-item-time">${item.time}</span>
          <span class="chevron-arrow">&rsaquo;</span>
        </div>
      `;
      
      // Dynamic hover class states
      li.addEventListener("mouseenter", () => {
        li.classList.add("bg-[#0078D4]/5");
      });
      li.addEventListener("mouseleave", () => {
        if (!item.unread && item.id !== state.selectedEmailId) {
          li.classList.remove("bg-[#0078D4]/5");
        }
      });
      
      // Toggle unread state and select email on click
      li.addEventListener("click", () => {
        item.unread = false;
        state.selectedEmailId = item.id;
        renderHomeView();
      });
      
      inboxListMount.appendChild(li);
    });
  }
  // 6. Render selected email details inside Reading Pane
  const readingPaneMount = document.getElementById("reading-pane-mount");
  if (readingPaneMount) {
    if (state.selectedEmailId !== null) {
      readingPaneMount.style.display = "flex";
      const email = state.inbox.find(item => item.id === state.selectedEmailId);
      if (email) {
        readingPaneMount.innerHTML = `
          <div class="reading-header">
            <div class="reading-header-top-row">
              <h3 class="reading-subject">${email.subject}</h3>
              <button class="reading-close-btn" id="reading-close-btn" aria-label="Close Email">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="reading-sender-row">
              <div class="reading-sender-info">
                <div class="reading-avatar">${email.avatar}</div>
                <div>
                  <div class="reading-sender-name">${email.sender}</div>
                  <div class="reading-time">To: Jean Bird • ${email.time}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="reading-body-container scrollbar-thin">
            <p class="reading-body-text">${email.body}</p>
          </div>
          <div class="reading-actions-bar">
            ${email.state === 'not_added' ? `
              <button class="btn-add-task" id="btn-add-task-trigger">
                <span class="sparkle-icon">✦</span> Add to Task list
              </button>
            ` : email.state === 'added' ? `
              <div class="btn-added-task">
                <span class="check-icon">✓</span> Added to Tasks
              </div>
            ` : ''}
          </div>
        `;

        // Setup Close button click handler
        const closeBtn = readingPaneMount.querySelector("#reading-close-btn");
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            state.selectedEmailId = null;
            renderHomeView();
          });
        }

        // Setup Add to Task list click handler
        const addTaskTriggerBtn = readingPaneMount.querySelector("#btn-add-task-trigger");
        if (addTaskTriggerBtn) {
          addTaskTriggerBtn.addEventListener("click", () => {
            // Add new task dynamically
            const newTaskId = state.tasks.length > 0 ? Math.max(...state.tasks.map(t => t.id)) + 1 : 1;
            const newTask = {
              id: newTaskId,
              title: email.subject.replace("LOCKED OUT: ", "").replace("CRITICAL: ", "").replace("WARNING: ", ""),
              priority: email.subject.toLowerCase().includes("critical") || email.subject.toLowerCase().includes("locked out") ? "high" : "normal",
              completed: false,
              source: `Outlook - ${email.sender}`
            };
            state.tasks.push(newTask);

            // Transition email state to 'added'
            email.state = 'added';

            // Re-render dashboard
            renderHomeView();

            // Scroll task list to bottom smoothly
            const tasksList = document.querySelector(".tasks-list");
            if (tasksList) {
              setTimeout(() => {
                tasksList.scrollTo({
                  top: tasksList.scrollHeight,
                  behavior: "smooth"
                });
              }, 100);
            }
          });
        }
      }
    } else {
      readingPaneMount.style.display = "none";
      readingPaneMount.innerHTML = "";
    }
  }
  
  if (window.checkAssistantFabState) {
    window.checkAssistantFabState();
  }
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

    // Scroll task list to bottom smoothly
    const tasksList = document.querySelector(".tasks-list");
    if (tasksList) {
      setTimeout(() => {
        tasksList.scrollTo({
          top: tasksList.scrollHeight,
          behavior: "smooth"
        });
      }, 50);
    }
  });
}

/**
 * Sets up event handlers for the Assistant panel drawer.
 */
function setupAssistantHandlers() {
  const toggleBtn = document.getElementById("assistant-toggle-btn");
  const assistantBody = document.getElementById("assistant-body");
  const assistant = document.querySelector(".assistant-drawer");

  if (!toggleBtn || !assistantBody || !assistant) return;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent bubbling in FAB view mode
    const isOpen = assistantBody.style.display === "block";
    if (isOpen) {
      assistantBody.style.display = "none";
      if (assistant.classList.contains("fab-active")) {
        assistant.classList.remove("open");
      } else {
        toggleBtn.textContent = "Open ^";
      }
    } else {
      assistantBody.style.display = "block";
      if (assistant.classList.contains("fab-active")) {
        assistant.classList.add("open");
      } else {
        toggleBtn.textContent = "Close v";
      }
    }
  });

  // Clicking the FAB circle button expands or collapses it
  assistant.addEventListener("click", () => {
    if (assistant.classList.contains("fab-active")) {
      const isExpanded = assistant.classList.contains("open");
      if (isExpanded) {
        assistant.classList.remove("open");
        assistantBody.style.display = "none";
      } else {
        assistant.classList.add("open");
        assistantBody.style.display = "block";
        toggleBtn.textContent = "Close ✕";
      }
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

// Active task ID in dossier side panel
let activeDossierTaskId = null;

// Mock context dossier data for KreyoList tasks (Gmail/Outlook MCP, Attachments, Jira tickets)
const dossierMockData = {
  1: {
    platform: "Outlook",
    platformIcon: "✉",
    dueDate: "Due July 10",
    emails: [
      {
        sender: "Jena Charles",
        time: "8:14 AM",
        subject: "LOCKED OUT: Please unlock account ASAP",
        body: "Hi HelpDesk, I've been locked out of my Active Directory domain account after typing my password wrong three times. Please unlock it ASAP, I need to access the client database for Q2 audit. Thanks!"
      }
    ],
    attachments: [
      { name: "ad_unlock_request_log.txt", size: "1.2 KB • Text Log", linkText: "View Logs" }
    ],
    jiraId: "SYS-9012",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  },
  2: {
    platform: "Outlook",
    platformIcon: "✉",
    dueDate: "Due July 10",
    emails: [
      {
        sender: "Security Operations Center",
        time: "7:45 AM",
        subject: "CRITICAL: Unrecognized ssh attempts on production server",
        body: "Alert: Multiple failed SSH attempts detected from IP 192.168.1.104 attempting to access root on prod-server-01. Please investigate auth logs and secure compliance status."
      }
    ],
    attachments: [
      { name: "auth_failure_report.log", size: "242 KB • Log File", linkText: "Open Report" }
    ],
    jiraId: "SEC-3401",
    jiraStatus: "In Progress",
    jiraStatusClass: "badge-in-progress",
    jiraDeps: "None"
  },
  3: {
    platform: "Outlook",
    platformIcon: "✉",
    dueDate: "Due July 12",
    emails: [
      {
        sender: "Marcus Vance",
        time: "Yesterday",
        subject: "Motherboard replacement parts have arrived for dev laptop",
        body: "The replacement parts for the Lenovo developer workstation have been delivered. Let me know when you can perform the motherboard swap and rebuild the standard OS image."
      }
    ],
    attachments: [
      { name: "parts_delivery_receipt.pdf", size: "1.1 MB • PDF Document", linkText: "Open PDF" }
    ],
    jiraId: "HW-1205",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  },
  4: {
    platform: "Outlook",
    platformIcon: "✉",
    dueDate: "Due July 12",
    emails: [
      {
        sender: "Marcus Vance",
        time: "Yesterday",
        subject: "Motherboard replacement parts have arrived for dev laptop",
        body: "The replacement parts for the Lenovo developer workstation have been delivered. Let me know when you can perform the motherboard swap and rebuild the standard OS image."
      }
    ],
    attachments: [
      { name: "parts_delivery_receipt.pdf", size: "1.1 MB • PDF Document", linkText: "Open PDF" }
    ],
    jiraId: "HW-1205",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  },
  4: {
    platform: "Gmail",
    platformIcon: "✉",
    dueDate: "Due July 15",
    emails: [
      {
        sender: "HR Onboarding",
        time: "Yesterday",
        subject: "Password reset required for new remote engineer",
        body: "Hi, please create a new user profile, configure corporate SSH keys, and email temporary credentials to our new remote engineering hire who starts on Monday."
      }
    ],
    attachments: [
      { name: "onboarding_checklist.pdf", size: "520 KB • PDF Document", linkText: "View PDF" }
    ],
    jiraId: "SYS-9110",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  },
  5: {
    platform: "Outlook",
    platformIcon: "✉",
    dueDate: "Due July 15",
    emails: [
      {
        sender: "Datadog Alerts",
        time: "Oct 12",
        subject: "WARNING: CPU spike on staging database server",
        body: "Trigger: CPU usage exceeded 85% on db-staging-02. Please review current query execution plans, check locking queries, and optimize active logs."
      }
    ],
    attachments: [
      { name: "datadog_cpu_metrics.png", size: "880 KB • PNG Image", linkText: "View Image" }
    ],
    jiraId: "DB-7729",
    jiraStatus: "In Progress",
    jiraStatusClass: "badge-in-progress",
    jiraDeps: "None"
  },
  6: {
    platform: "Outlook",
    platformIcon: "✉",
    dueDate: "Due July 18",
    emails: [
      {
        sender: "HelpDesk Escalation",
        time: "Oct 12",
        subject: "Account unlock request: VIP Sales Director",
        body: "Hi, our VIP Sales Director is locked out of Salesforce and needs immediate AD override. Secondary authorization is attached. Please process ASAP."
      }
    ],
    attachments: [
      { name: "secondary_auth_signature.pdf", size: "340 KB • PDF Document", linkText: "Open PDF" }
    ],
    jiraId: "SYS-9022",
    jiraStatus: "In Progress",
    jiraStatusClass: "badge-in-progress",
    jiraDeps: "None"
  },
  7: {
    platform: "Outlook",
    platformIcon: "✉",
    dueDate: "Due July 20",
    emails: [
      {
        sender: "Laptop Provisioning",
        time: "Oct 10",
        subject: "Hardware diagnostics check complete for Unit-B",
        body: "Diagnostics run on Unit-B complete. Memory test passed, drive check passed. Please log this completion in the asset inventory system."
      }
    ],
    attachments: [
      { name: "unit_b_diagnostic_report.txt", size: "14 KB • Text Report", linkText: "Read Report" }
    ],
    jiraId: "HW-1218",
    jiraStatus: "Done",
    jiraStatusClass: "badge-done",
    jiraDeps: "None"
  },
  8: {
    platform: "Internal System",
    platformIcon: "⚙",
    dueDate: "Due Today",
    emails: [],
    attachments: [
      { name: "backup_verification_checklist.pdf", size: "45 KB • PDF Document", linkText: "Open PDF" }
    ],
    jiraId: "SYS-4811",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  },
  9: {
    platform: "Internal System",
    platformIcon: "⚙",
    dueDate: "Due Oct 15",
    emails: [],
    attachments: [
      { name: "firewall_rules_diff.txt", size: "12 KB • Diff File", linkText: "View Diff" }
    ],
    jiraId: "SEC-4802",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  },
  10: {
    platform: "Compliance System",
    platformIcon: "⚙",
    dueDate: "Due Oct 20",
    emails: [],
    attachments: [
      { name: "compliance_requirements_q2.xlsx", size: "1.4 MB • Excel Document", linkText: "Open Sheet" }
    ],
    jiraId: "COMP-8812",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  }
};

/**
 * Opens the Action Dossier panel and populates it with task context data.
 * @param {Object} task - The selected task object.
 */
function openActionDossier(task) {
  const panel = document.getElementById("action-dossier-panel");
  const title = document.getElementById("dossier-task-title");
  const priority = document.getElementById("dossier-priority");
  const platform = document.getElementById("dossier-platform");
  const dueDate = document.getElementById("dossier-due-date");
  const emailsBox = document.getElementById("dossier-block-emails");
  const attachmentsBox = document.getElementById("dossier-block-attachments");
  const statusBox = document.getElementById("dossier-block-status");

  if (!panel || !title) return;

  activeDossierTaskId = task.id;

  // 1. Title & priority badge
  title.textContent = task.title;
  priority.className = `dossier-badge priority-${task.priority}`;
  priority.textContent = `${task.priority} Priority`;

  // 2. Fetch context information
  const context = dossierMockData[task.id] || {
    platform: "Workspace",
    platformIcon: "✦",
    dueDate: "No due date",
    emails: [{ sender: "System", time: "Now", subject: "Dossier initialized", body: "No records found." }],
    attachments: [],
    jiraId: "KREY-N/A",
    jiraStatus: "Open",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  };

  platform.innerHTML = `<span class="platform-icon">${context.platformIcon}</span> ${context.platform}`;
  dueDate.textContent = context.dueDate;

  // 3. Render Blocks
  emailsBox.innerHTML = "";
  context.emails.forEach(email => {
    const div = document.createElement("div");
    div.className = "email-snippet";
    div.innerHTML = `
      <div class="email-meta">
        <span class="email-sender">${email.sender}</span>
        <span class="email-time">${email.time}</span>
      </div>
      <div class="email-subject">${email.subject}</div>
      <p class="email-body">${email.body}</p>
    `;
    emailsBox.appendChild(div);
  });

  attachmentsBox.innerHTML = "";
  if (context.attachments.length === 0) {
    attachmentsBox.innerHTML = `<div style="font-size:0.75rem;color:var(--color-text-muted);">No linked attachments.</div>`;
  } else {
    context.attachments.forEach(doc => {
      const div = document.createElement("div");
      div.className = "attachment-preview-card";
      div.innerHTML = `
        <span class="doc-icon">${doc.name.endsWith('.pdf') ? '📄' : doc.name.endsWith('.xlsx') ? '📊' : '📝'}</span>
        <div class="doc-info">
          <span class="doc-title">${doc.name}</span>
          <span class="doc-size">${doc.size}</span>
        </div>
        <a href="#" class="doc-action-btn" onclick="event.preventDefault(); alert('Opening document: ${doc.name}');">${doc.linkText}</a>
      `;
      attachmentsBox.appendChild(div);
    });
  }

  statusBox.innerHTML = `
    <div class="tracker-row">
      <span class="tracker-label">Ticket ID:</span>
      <span class="tracker-val">${context.jiraId}</span>
    </div>
    <div class="tracker-row">
      <span class="tracker-label">Status:</span>
      <span class="tracker-val ${context.jiraStatusClass}">${context.jiraStatus}</span>
    </div>
    <div class="tracker-row">
      <span class="tracker-label">Assignee:</span>
      <span class="tracker-val">Jean Bird</span>
    </div>
    <div class="tracker-row">
      <span class="tracker-label">Dependencies:</span>
      <span class="tracker-val ${context.jiraDeps !== 'None' ? 'text-alert' : ''}">${context.jiraDeps}</span>
    </div>
  `;

  // Toggle active class to slide in side drawer
  panel.classList.add("active");
}

/**
 * Closes the Action Dossier panel drawer.
 */
function closeActionDossier() {
  const panel = document.getElementById("action-dossier-panel");
  if (panel) {
    panel.classList.remove("active");
  }
  activeDossierTaskId = null;
}

/**
 * Sets up dossier handlers.
 */
function setupDossierHandlers() {
  const closeBtn = document.getElementById("dossier-close-btn");
  const completeBtn = document.getElementById("dossier-complete-btn");
  const delegateBtn = document.getElementById("dossier-delegate-btn");
  const assistantPrompt = document.getElementById("dossier-assistant-prompt");
  const assistantSend = document.getElementById("dossier-assistant-send");

  // 1. Close drawer click listener
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeActionDossier();
    });
  }

  // 2. Mark task complete button click listener
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      if (activeDossierTaskId) {
        const task = state.tasks.find(t => t.id === activeDossierTaskId);
        if (task) {
          task.completed = true;
          renderHomeView();
          closeActionDossier();
          alert(`Task "${task.title}" has been completed!`);
        }
      }
    });
  }

  // 3. Delegate button click listener (Opens delegation overlay)
  const delegationOverlay = document.getElementById("dossier-delegation-overlay");
  const delegationClose = document.getElementById("delegation-close-btn");
  const searchInput = document.getElementById("delegation-search-input");
  const nextBtn = document.getElementById("delegation-next-btn");
  const backBtn = document.getElementById("delegation-back-btn");
  const confirmBtn = document.getElementById("delegation-confirm-btn");
  
  const step1 = document.getElementById("delegation-step-1");
  const step2 = document.getElementById("delegation-step-2");

  const syncJira = document.getElementById("sync-jira");
  const syncSlack = document.getElementById("sync-slack");
  const syncAsana = document.getElementById("sync-asana");

  if (delegateBtn && delegationOverlay) {
    delegateBtn.addEventListener("click", () => {
      // Open Step 1, reset selections
      selectedAssignee = null;
      activeSyncPlatforms = ["jira", "slack"];
      
      // Update platform card classes
      if (syncJira) syncJira.classList.add("active");
      if (syncSlack) syncSlack.classList.add("active");
      if (syncAsana) syncAsana.classList.remove("active");

      if (searchInput) searchInput.value = "";
      if (step1) step1.style.display = "flex";
      if (step2) step2.style.display = "none";
      
      renderTeamDirectory("");
      delegationOverlay.classList.add("active");
    });
  }

  if (delegationClose && delegationOverlay) {
    delegationClose.addEventListener("click", () => {
      delegationOverlay.classList.remove("active");
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderTeamDirectory(e.target.value);
    });
  }

  // Toggles for external platforms helper
  const setupPlatformToggle = (element, platform) => {
    if (element) {
      element.addEventListener("click", () => {
        const idx = activeSyncPlatforms.indexOf(platform);
        if (idx > -1) {
          activeSyncPlatforms.splice(idx, 1);
          element.classList.remove("active");
        } else {
          activeSyncPlatforms.push(platform);
          element.classList.add("active");
        }
      });
    }
  };

  setupPlatformToggle(syncJira, "jira");
  setupPlatformToggle(syncSlack, "slack");
  setupPlatformToggle(syncAsana, "asana");

  // Step 2 compile AI Summary Hand-off Draft
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!selectedAssignee || !activeDossierTaskId) return;

      const task = state.tasks.find(t => t.id === activeDossierTaskId);
      const context = dossierMockData[activeDossierTaskId] || {
        jiraId: "KREY-N/A",
        dueDate: "No date",
        emails: [{ sender: "System", time: "Now", subject: "Alert", body: "No further emails found." }]
      };

      const draft = `[AI Hand-off Draft] Handing over task "${task.title}". 
The context reveals active dependency requirements related to ticket ${context.jiraId}. 
The requester (${context.emails[0].sender}) indicated details in recent threads: "${context.emails[0].body.substring(0, 110)}...". 
Expected due date is ${context.dueDate}. Please coordinate status updates via the designated integration channels.`;

      const summaryText = document.getElementById("delegation-summary-text");
      if (summaryText) summaryText.value = draft;

      if (step1) step1.style.display = "none";
      if (step2) step2.style.display = "flex";
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (step1) step1.style.display = "flex";
      if (step2) step2.style.display = "none";
    });
  }

  // Confirm delegation: Syncs simulated MCP platforms and updates task complete status locally
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (!selectedAssignee || !activeDossierTaskId) return;

      const task = state.tasks.find(t => t.id === activeDossierTaskId);
      const summaryText = document.getElementById("delegation-summary-text")?.value || "";

      // Alert describing simulated MCP synchronization
      alert(`MCP Connection Sync Successful!\n\n` +
            `- Delegated to: ${selectedAssignee.name} (${selectedAssignee.role})\n` +
            `- Pushed Endpoints: ${activeSyncPlatforms.map(p => p.toUpperCase()).join(", ") || 'NONE'}\n` +
            `- Hand-off Summary: "${summaryText.substring(0, 80)}..."`);

      // Complete task
      if (task) {
        task.completed = true;
        renderHomeView();
      }

      // Close drawers
      if (delegationOverlay) delegationOverlay.classList.remove("active");
      closeActionDossier();
    });
  }

  // 4. Dossier context-aware AI Assistant queries
  const sendDossierQuery = () => {
    const query = assistantPrompt?.value.trim();
    if (!query || !activeDossierTaskId) return;

    const task = state.tasks.find(t => t.id === activeDossierTaskId);
    const context = dossierMockData[activeDossierTaskId];

    // Open Assistant panel body if closed
    const assistantBody = document.getElementById("assistant-body");
    const assistantBtn = document.getElementById("assistant-toggle-btn");
    if (assistantBody && assistantBody.style.display !== "block") {
      assistantBody.style.display = "block";
      if (assistantBtn) assistantBtn.textContent = "Close v";
    }

    // Render mock dialogue response inside assistant panel
    const assistantDiv = document.createElement("div");
    assistantDiv.style.borderTop = "1px solid rgba(255, 95, 31, 0.15)";
    assistantDiv.style.marginTop = "0.75rem";
    assistantDiv.style.paddingTop = "0.75rem";
    assistantDiv.innerHTML = `
      <div style="font-size:0.75rem;color:var(--color-accent-ochre);font-weight:600;margin-bottom:2px;">User (about ${task?.title}):</div>
      <p style="font-size:0.8rem;color:var(--color-text-primary);margin-bottom:0.5rem;font-style:italic;">"${query}"</p>
      <div style="font-size:0.75rem;color:var(--color-accent-vibrant);font-weight:600;margin-bottom:2px;">KreyoList Assistant:</div>
      <p style="font-size:0.8rem;color:var(--color-text-secondary);">Scanning connected MCP resources and emails. The context indicates this ticket (${context?.jiraId}) has active dependencies (${context?.jiraDeps}). I recommend resolving that blocker or forwarding the Excel attachments to the requester first.</p>
    `;
    assistantBody?.appendChild(assistantDiv);

    if (assistantPrompt) assistantPrompt.value = "";
  };

  if (assistantSend) {
    assistantSend.addEventListener("click", sendDossierQuery);
  }
  if (assistantPrompt) {
    assistantPrompt.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendDossierQuery();
      }
    });
  }
}

// Mock team directory for task delegation
const teamDirectory = [
  { id: '1', name: 'Elena Rostova', role: 'Lead Architect', avatar: 'ER' },
  { id: '2', name: 'Julian Vance', role: 'Senior Analyst', avatar: 'JV' },
  { id: '3', name: 'Clara Oswald', role: 'Operations Chief', avatar: 'CO' }
];

let selectedAssignee = null;
let activeSyncPlatforms = ["jira", "slack"];

/**
 * Renders the internal team cards dynamically based on search keywords.
 * @param {string} filterText - Search input filter text.
 */
function renderTeamDirectory(filterText = "") {
  const mount = document.getElementById("delegation-team-mount");
  const nextBtn = document.getElementById("delegation-next-btn");
  if (!mount) return;

  mount.innerHTML = "";
  const filtered = teamDirectory.filter(member => 
    member.name.toLowerCase().includes(filterText.toLowerCase()) ||
    member.role.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach(member => {
    const isSelected = selectedAssignee && selectedAssignee.id === member.id;
    const card = document.createElement("div");
    card.className = `team-member-card ${isSelected ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="team-member-avatar">${member.avatar}</div>
      <div class="team-member-info">
        <span class="team-member-name">${member.name}</span>
        <span class="team-member-role">${member.role}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      if (selectedAssignee && selectedAssignee.id === member.id) {
        selectedAssignee = null;
      } else {
        selectedAssignee = member;
      }
      renderTeamDirectory(filterText);
    });

    mount.appendChild(card);
  });

  if (nextBtn) {
    nextBtn.disabled = !selectedAssignee;
  }
}

/**
 * Automatically switches the Assistant drawer between inline row and circular FAB views
 * based on scroll offset and tasks count.
 */
function setupAssistantFabScrollDetector() {
  const tasksScroll = document.querySelector(".tasks-container .scroll-fade-container");
  const assistant = document.querySelector(".assistant-drawer");
  if (!tasksScroll || !assistant) return;

  const checkAssistantFab = () => {
    const isScrolled = tasksScroll.scrollTop > 20;
    const isFull = state.tasks.length >= 6;

    if (isScrolled || isFull) {
      if (!assistant.classList.contains("fab-active")) {
        assistant.classList.add("fab-active");
      }
    } else {
      if (assistant.classList.contains("fab-active")) {
        assistant.classList.remove("fab-active");
        assistant.classList.remove("open");
        
        // Restore toggle button copy based on body display state
        const assistantBody = document.getElementById("assistant-body");
        const toggleBtn = document.getElementById("assistant-toggle-btn");
        if (assistantBody && toggleBtn) {
          if (assistantBody.style.display === "block") {
            toggleBtn.textContent = "Close v";
          } else {
            toggleBtn.textContent = "Open ^";
          }
        }
      }
    }
  };

  // Check scroll positions
  tasksScroll.addEventListener("scroll", checkAssistantFab);
  
  // Register scroll detector as a global property so other elements can force refresh it
  window.checkAssistantFabState = checkAssistantFab;
}

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", init);
