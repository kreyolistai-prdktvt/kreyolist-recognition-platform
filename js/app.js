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
  setupDossierHandlers();
  setupAssistantFabScrollDetector();

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
        <span class="task-title">${task.title}</span>
        <span class="priority-tag">${task.priority}</span>
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
    platform: "Gmail",
    platformIcon: "✉",
    dueDate: "Due July 10",
    emails: [
      {
        sender: "Your Manager",
        time: "10:42 AM",
        subject: "Re: Q2 Planning & Objectives",
        body: "Alex, I attached the initial spreadsheet for the budget draft. Please check if the API costs match the integration specs before we commit on Friday."
      }
    ],
    attachments: [
      { name: "q2_budget_draft.xlsx", size: "2.4 MB • Excel Document", linkText: "View" },
      { name: "KreyoList Curation API Spec", size: "Swagger v2.0 • API Reference", linkText: "Open Spec" }
    ],
    jiraId: "KREY-4820",
    jiraStatus: "In Progress",
    jiraStatusClass: "badge-in-progress",
    jiraDeps: "Blocked by KREY-4819 (Database Migrations)"
  },
  2: {
    platform: "Outlook",
    platformIcon: "📅",
    dueDate: "Due July 12",
    emails: [
      {
        sender: "School Office",
        time: "9:15 AM",
        subject: "Action Required: Field Trip Forms",
        body: "Dear parents, please return the signed permission slip for the upcoming educational retreat to Verdant Canopy by the end of this week."
      }
    ],
    attachments: [
      { name: "field_trip_permission_slip.pdf", size: "840 KB • PDF Document", linkText: "Download" }
    ],
    jiraId: "KREY-1082",
    jiraStatus: "To Do",
    jiraStatusClass: "badge-todo",
    jiraDeps: "None"
  },
  3: {
    platform: "Gmail",
    platformIcon: "✉",
    dueDate: "Due July 15",
    emails: [
      {
        sender: "Billing Team",
        time: "Yesterday",
        subject: "Invoice #INV-29381 Available",
        body: "The monthly invoice for corporate integrations has been generated. Please verify the line items and process payment through the finance portal."
      }
    ],
    attachments: [
      { name: "kreyolist_billing_invoice_oct.pdf", size: "1.2 MB • PDF Document", linkText: "Open PDF" }
    ],
    jiraId: "KREY-9382",
    jiraStatus: "In Review",
    jiraStatusClass: "badge-in-progress",
    jiraDeps: "Requires Finance approval"
  },
  4: {
    platform: "Slack",
    platformIcon: "💬",
    dueDate: "Due July 18",
    emails: [
      {
        sender: "Alex",
        time: "Oct 12",
        subject: "#api-decisions discussions",
        body: "I summarized our tech stack discussions about GraphQL vs REST. We need to lock in this decision to proceed with the core dashboard hooks."
      }
    ],
    attachments: [
      { name: "api_architecture_proposal.md", size: "12 KB • Markdown Document", linkText: "Read Proposal" }
    ],
    jiraId: "KREY-2940",
    jiraStatus: "In Progress",
    jiraStatusClass: "badge-in-progress",
    jiraDeps: "Blocked by Tech Lead review"
  },
  5: {
    platform: "Outlook",
    platformIcon: "📅",
    dueDate: "Due July 20",
    emails: [
      {
        sender: "Events Team",
        time: "Oct 10",
        subject: "Executive Networking Agenda",
        body: "Thank you for expressing interest in the fall networking session. Please confirm your RSVP status and select your dietary preferences."
      }
    ],
    attachments: [
      { name: "networking_event_agenda.pdf", size: "450 KB • PDF Document", linkText: "View Agenda" }
    ],
    jiraId: "KREY-4491",
    jiraStatus: "Done",
    jiraStatusClass: "badge-done",
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
      <span class="tracker-val">Alex Mercer</span>
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
