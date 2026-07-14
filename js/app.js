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
  activeTab: "Home", // default active tab
  activeSystemTab: "Home", // default active system tab
  activeSlackContact: "Donaldy Salvant", // active slack conversation contact
  activeEmailId: null, // default active email
  rewardProgress: 68,
  isSyncingAll: false,
  inbox: [
    { 
      id: 1, 
      sender: "Jena Charles", 
      avatar: "JC", 
      subject: "Urgent: Active Directory Account Unlock Request – Jena Charles", 
      time: "8:14 AM", 
      unread: true,
      body: "Hello Jean,\n\nI hope you are doing well.\n\nI am writing to request the immediate unlocking of my Active Directory domain account. I have been locked out after entering my password incorrectly three times while trying to log in this morning.\n\nThis access is critical right now, as I need to get into the client database to prepare data for the upcoming Q2 audit. Any extended downtime will impact our preparation schedule, so I would appreciate your prompt attention to this matter.\n\nPlease let me know once it has been reset or if you need me to verify any security details on my end.\n\nSincerely,\n\nJena Charles",
      state: "not_added"
    },
    { 
      id: 2, 
      sender: "Security Operations Center", 
      avatar: "SO", 
      subject: "CRITICAL: Unrecognized ssh attempts on production server", 
      time: "7:45 AM", 
      unread: true,
      body: "Alert: Multiple failed SSH attempts detected from IP 192.168.1.104 attempting to access root on prod-server-01. Please investigate auth logs and secure compliance status.",
      state: "not_added"
    },
    { 
      id: 3, 
      sender: "Marcus Vance", 
      avatar: "MV", 
      subject: "Motherboard replacement parts have arrived for dev laptop", 
      time: "Yesterday", 
      unread: true,
      body: "The replacement parts for the Lenovo developer workstation have been delivered. Let me know when you can perform the motherboard swap and rebuild the standard OS image.",
      state: "not_added"
    },
    { 
      id: 4, 
      sender: "HR Onboarding", 
      avatar: "HR", 
      subject: "Password reset required for new remote engineer", 
      time: "Yesterday", 
      unread: true,
      body: "Hi, please create a new user profile, configure corporate SSH keys, and email temporary credentials to our new remote engineering hire who starts on Monday.",
      state: "not_added"
    },
    { 
      id: 5, 
      sender: "Datadog Alerts", 
      avatar: "DA", 
      subject: "WARNING: CPU spike on staging database server", 
      time: "Oct 12", 
      unread: false,
      body: "Trigger: CPU usage exceeded 85% on db-staging-02. Please review current query execution plans, check locking queries, and optimize active logs.",
      state: "not_added"
    },
    { 
      id: 6, 
      sender: "HelpDesk Escalation", 
      avatar: "HE", 
      subject: "Account unlock request: VIP Sales Director", 
      time: "Oct 12", 
      unread: false,
      body: "Hi, our VIP Sales Director is locked out of Salesforce and needs immediate AD override. Secondary authorization is attached. Please process ASAP.",
      state: "not_added"
    },
    { 
      id: 7, 
      sender: "Laptop Provisioning", 
      avatar: "LP", 
      subject: "Hardware diagnostics check complete for Unit-B", 
      time: "Oct 10", 
      unread: false,
      body: "Diagnostics run on Unit-B complete. Memory test passed, drive check passed. Please log this completion in the asset inventory system.",
      state: "not_added"
    }
  ],
  tasks: [
    { id: 1, title: "Unlock Jena Charles' Active Directory domain account", priority: "high", completed: false },
    { id: 2, title: "Investigate production server SSH unauthorized access lines", priority: "high", completed: false },
    { id: 3, title: "Replace motherboard and re-image developer laptop", priority: "normal", completed: false },
    { id: 4, title: "Reset password and generate temporary keys for new engineer onboarding", priority: "normal", completed: false },
    { id: 5, title: "Analyze staging database CPU metrics and check query logs", priority: "normal", completed: false },
    { id: 6, title: "Review secondary authorization to unlock VIP Sales account", priority: "high", completed: false },
    { id: 7, title: "Update laptop hardware asset inventory log for Unit-B", priority: "low", completed: false },
    { id: 8, title: "Verify daily backups across enterprise storage clusters", priority: "high", completed: false },
    { id: 9, title: "Run patch updates on staging environment firewall rules", priority: "normal", completed: false },
    { id: 10, title: "Audit root user access logs for Q2 infrastructure compliance", priority: "normal", completed: false }
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
      if (state.activeEmailId !== null) {
        state.activeEmailId = null;
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
  
  const homeView = document.getElementById("home-view");
  const infraMount = document.getElementById("infra-dashboard-mount");
  const outlookContainer = document.getElementById("outlook-view-container");
  if (homeView) {
    homeView.classList.add("active-view");
    homeView.style.display = "flex";
  }
  if (infraMount) {
    infraMount.style.display = "grid";
    renderInfraDashboard();
  }
  if (outlookContainer) {
    outlookContainer.style.display = "none";
  }
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
  if (state.activeTab !== "Recognition") {
    if (dom.gridContainer) dom.gridContainer.innerHTML = "";
    return;
  }
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
  const navOutlook = document.getElementById("nav-item-outlook");
  const navCalendar = Array.from(document.querySelectorAll(".sidebar-nav-item")).find(el => el.querySelector(".sidebar-text")?.textContent.trim() === "Calendar");
  const navRec = Array.from(document.querySelectorAll(".sidebar-nav-item")).find(el => el.querySelector(".sidebar-text")?.textContent.trim() === "Recognition");
  const navRewards = document.getElementById("nav-item-rewards");
  const navAwards = document.getElementById("nav-item-awards");

  if (navHome) {
    navHome.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Home");
    });
  }

  if (navOutlook) {
    navOutlook.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Outlook");
    });
  }

  if (navCalendar) {
    navCalendar.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Calendar");
    });
  }

  if (navRec) {
    navRec.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Recognition");
    });
  }

  const navSlack = document.getElementById("nav-item-slack");
  if (navSlack) {
    navSlack.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Slack");
    });
  }

  if (navRewards) {
    navRewards.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Rewards");
    });
  }

  if (navAwards) {
    navAwards.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Awards");
    });
  }
}

/**
 * Switches the active tab view.
 * @param {string} tabName - The name of the tab to switch to.
 */
function setActiveTab(tabName) {
  if (state.activeTab === tabName) return;
  state.activeTab = tabName;

  // Cache state.activeSystemTab if switching between Home and Outlook
  if (tabName === "Home" || tabName === "Outlook") {
    state.activeSystemTab = tabName;
  }

  const navHome = document.getElementById("nav-item-home");
  const navOutlook = document.getElementById("nav-item-outlook");
  const navCalendar = Array.from(document.querySelectorAll(".sidebar-nav-item")).find(el => el.querySelector(".sidebar-text")?.textContent.trim() === "Calendar");
  const navRec = Array.from(document.querySelectorAll(".sidebar-nav-item")).find(el => el.querySelector(".sidebar-text")?.textContent.trim() === "Recognition");
  const navRewards = document.getElementById("nav-item-rewards");
  const navAwards = document.getElementById("nav-item-awards");
  const navSlack = document.getElementById("nav-item-slack");

  const homeView = document.getElementById("home-view");
  const recView = document.getElementById("recognition-view");
  const calendarView = document.getElementById("calendar-view");
  const rewardsView = document.getElementById("rewards-view");
  const awardsView = document.getElementById("awards-view");
  const slackView = document.getElementById("slack-view");
  const appMain = document.querySelector(".app-main-scrollable");
  const greetingEl = document.querySelector(".recognition-portal-greeting");

  // Apply active wayfinding highlight
  if (navHome) {
    if (state.activeTab === "Home") navHome.classList.add("active");
    else navHome.classList.remove("active");
  }
  if (navOutlook) {
    if (state.activeTab === "Outlook") navOutlook.classList.add("active");
    else navOutlook.classList.remove("active");
  }
  if (navCalendar) {
    if (state.activeTab === "Calendar") navCalendar.classList.add("active");
    else navCalendar.classList.remove("active");
  }
  if (navRec) {
    if (state.activeTab === "Recognition") navRec.classList.add("active");
    else navRec.classList.remove("active");
  }
  if (navRewards) {
    if (state.activeTab === "Rewards") navRewards.classList.add("active");
    else navRewards.classList.remove("active");
  }
  if (navAwards) {
    if (state.activeTab === "Awards") navAwards.classList.add("active");
    else navAwards.classList.remove("active");
  }
  if (navSlack) {
    if (state.activeTab === "Slack") navSlack.classList.add("active");
    else navSlack.classList.remove("active");
  }

  // Hide all views first
  if (homeView) {
    homeView.classList.remove("active-view");
    homeView.style.display = "none";
    const infraMount = document.getElementById("infra-dashboard-mount");
    const outlookContainer = document.getElementById("outlook-view-container");
    if (infraMount) infraMount.style.display = "none";
    if (outlookContainer) outlookContainer.style.display = "none";
  }
  if (recView) recView.style.display = "none";
  if (calendarView) calendarView.style.display = "none";
  if (rewardsView) rewardsView.style.display = "none";
  if (awardsView) awardsView.style.display = "none";
  if (slackView) {
    slackView.classList.remove("active-view");
    slackView.style.display = "none";
  }

  // Control greeting element display condition strictly tied to activeTab === 'Recognition'
  if (greetingEl) {
    greetingEl.style.display = state.activeTab === "Recognition" ? "block" : "none";
  }

  // Lock target view display conditions
  if (state.activeTab === "Home") {
    const infraMount = document.getElementById("infra-dashboard-mount");
    const outlookContainer = document.getElementById("outlook-view-container");
    if (infraMount) {
      infraMount.style.display = "grid";
      renderInfraDashboard();
    }
    if (outlookContainer) {
      outlookContainer.style.display = "none";
    }
    if (homeView) {
      homeView.classList.add("active-view");
      homeView.style.display = "flex";
    }
    if (appMain) appMain.classList.add("home-active");
  } else if (state.activeTab === "Outlook") {
    const infraMount = document.getElementById("infra-dashboard-mount");
    const outlookContainer = document.getElementById("outlook-view-container");
    if (infraMount) {
      infraMount.style.display = "none";
    }
    if (outlookContainer) {
      outlookContainer.style.display = "flex";
    }
    if (homeView) {
      homeView.classList.add("active-view");
      homeView.style.display = "flex";
    }
    if (appMain) appMain.classList.add("home-active");
    renderHomeView();
  } else if (state.activeTab === "Calendar") {
    if (calendarView) {
      calendarView.innerHTML = `
        <div class="calendar-wrapper">
          <!-- Left Sidebar Column (24%) -->
          <div class="calendar-sidebar-left">
            <div class="mini-calendar-title">July 2026</div>
            <div class="mini-calendar-grid">
              <div class="mini-day-header">Su</div>
              <div class="mini-day-header">Mo</div>
              <div class="mini-day-header">Tu</div>
              <div class="mini-day-header">We</div>
              <div class="mini-day-header">Th</div>
              <div class="mini-day-header">Fr</div>
              <div class="mini-day-header">Sa</div>
              
              <div class="mini-day other-month">28</div>
              <div class="mini-day other-month">29</div>
              <div class="mini-day other-month">30</div>
              
              <div class="mini-day">1</div>
              <div class="mini-day">2</div>
              <div class="mini-day">3</div>
              <div class="mini-day">4</div>
              <div class="mini-day">5</div>
              <div class="mini-day">6</div>
              <div class="mini-day">7</div>
              <div class="mini-day">8</div>
              <div class="mini-day">9</div>
              <div class="mini-day">10</div>
              <div class="mini-day">11</div>
              <div class="mini-day today">12</div>
              <div class="mini-day">13</div>
              <div class="mini-day">14</div>
              <div class="mini-day">15</div>
              <div class="mini-day">16</div>
              <div class="mini-day">17</div>
              <div class="mini-day">18</div>
              <div class="mini-day">19</div>
              <div class="mini-day">20</div>
              <div class="mini-day">21</div>
              <div class="mini-day">22</div>
              <div class="mini-day">23</div>
              <div class="mini-day">24</div>
              <div class="mini-day">25</div>
              <div class="mini-day">26</div>
              <div class="mini-day">27</div>
              <div class="mini-day">28</div>
              <div class="mini-day">29</div>
              <div class="mini-day">30</div>
              <div class="mini-day">31</div>
              
              <div class="mini-day other-month">1</div>
              <div class="mini-day other-month">2</div>
            </div>
          </div>
          
          <!-- Center Monthly Grid Column (50%) -->
          <div class="calendar-center-grid">
            <div class="main-calendar-header">
              <div class="main-calendar-title">July 2026</div>
            </div>
            
            <div class="main-calendar-grid">
              <div class="main-day-header">Sunday</div>
              <div class="main-day-header">Monday</div>
              <div class="main-day-header">Tuesday</div>
              <div class="main-day-header">Wednesday</div>
              <div class="main-day-header">Thursday</div>
              <div class="main-day-header">Friday</div>
              <div class="main-day-header">Saturday</div>
              
              <!-- Week 1 -->
              <div class="main-calendar-cell other-month"><span class="day-number">28</span></div>
              <div class="main-calendar-cell other-month"><span class="day-number">29</span></div>
              <div class="main-calendar-cell other-month"><span class="day-number">30</span></div>
              <div class="main-calendar-cell"><span class="day-number">1</span></div>
              <div class="main-calendar-cell"><span class="day-number">2</span></div>
              <div class="main-calendar-cell"><span class="day-number">3</span></div>
              <div class="main-calendar-cell"><span class="day-number">4</span></div>
              
              <!-- Week 2 -->
              <div class="main-calendar-cell"><span class="day-number">5</span></div>
              <div class="main-calendar-cell"><span class="day-number">6</span></div>
              <div class="main-calendar-cell"><span class="day-number">7</span></div>
              <div class="main-calendar-cell"><span class="day-number">8</span></div>
              <div class="main-calendar-cell"><span class="day-number">9</span></div>
              <div class="main-calendar-cell"><span class="day-number">10</span></div>
              <div class="main-calendar-cell"><span class="day-number">11</span></div>
              
              <!-- Week 3 -->
              <div class="main-calendar-cell today">
                <span class="day-number">12</span>
                <div class="calendar-event regular">9:00 AM Production Server Sync</div>
                <div class="calendar-event regular">2:00 PM Deep Work Focus</div>
              </div>
              <div class="main-calendar-cell">
                <span class="day-number">13</span>
                <div class="calendar-event system-buffer">🤖 System Lock: Q2 Audit Preparation Buffer (2 Hours)</div>
              </div>
              <div class="main-calendar-cell"><span class="day-number">14</span></div>
              <div class="main-calendar-cell"><span class="day-number">15</span></div>
              <div class="main-calendar-cell"><span class="day-number">16</span></div>
              <div class="main-calendar-cell"><span class="day-number">17</span></div>
              <div class="main-calendar-cell"><span class="day-number">18</span></div>
              
              <!-- Week 4 -->
              <div class="main-calendar-cell"><span class="day-number">19</span></div>
              <div class="main-calendar-cell"><span class="day-number">20</span></div>
              <div class="main-calendar-cell"><span class="day-number">21</span></div>
              <div class="main-calendar-cell"><span class="day-number">22</span></div>
              <div class="main-calendar-cell"><span class="day-number">23</span></div>
              <div class="main-calendar-cell"><span class="day-number">24</span></div>
              <div class="main-calendar-cell"><span class="day-number">25</span></div>
              
              <!-- Week 5 -->
              <div class="main-calendar-cell"><span class="day-number">26</span></div>
              <div class="main-calendar-cell"><span class="day-number">27</span></div>
              <div class="main-calendar-cell"><span class="day-number">28</span></div>
              <div class="main-calendar-cell"><span class="day-number">29</span></div>
              <div class="main-calendar-cell"><span class="day-number">30</span></div>
              <div class="main-calendar-cell"><span class="day-number">31</span></div>
              <div class="main-calendar-cell other-month"><span class="day-number">1</span></div>
            </div>
          </div>
          
          <!-- Right Agenda Sidebar Column (26%) -->
          <div class="calendar-sidebar-right">
            <div class="agenda-title">Today's Agenda</div>
            <div class="agenda-subtitle">Sunday, July 12, 2026</div>
            
            <div class="agenda-list">
              <div class="agenda-item">
                <span class="agenda-time">9:00 AM - 10:00 AM</span>
                <span class="agenda-text">Production Server Sync</span>
              </div>
              <div class="agenda-item">
                <span class="agenda-time">2:00 PM - 4:00 PM</span>
                <span class="agenda-text">Deep Work Focus</span>
              </div>
            </div>
          </div>
        </div>
      `;
      calendarView.style.display = "block";
    }
    if (appMain) appMain.classList.remove("home-active");
  } else if (state.activeTab === "Slack") {
    if (slackView) {
      slackView.classList.add("active-view");
    }
    renderSlackView();
    if (appMain) appMain.classList.add("home-active");
  } else if (state.activeTab === "Recognition") {
    if (recView) recView.style.display = "block";
    if (appMain) appMain.classList.remove("home-active");
    renderGrid();
  } else if (state.activeTab === "Rewards") {
    if (rewardsView) rewardsView.style.display = "block";
    if (appMain) appMain.classList.remove("home-active");
  } else if (state.activeTab === "Awards") {
    if (awardsView) awardsView.style.display = "block";
    if (appMain) appMain.classList.remove("home-active");
  }
}

/**
 * Renders the Workspace Homepage (Home View).
 */
function renderHomeView() {
  const homeView = document.getElementById("home-view");
  if (homeView) {
    if (state.activeEmailId !== null && state.activeSystemTab === "Outlook") {
      homeView.classList.add("reading-pane-active");
    } else {
      homeView.classList.remove("reading-pane-active");
    }
  }

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

  // 5. Render active view inside systems dynamic canvas
  const outlookInboxPanel = document.getElementById("outlook-inbox-panel");
  const readingPaneMount = document.getElementById("reading-pane-mount");
  const consolidatedFeedPlaceholder = document.getElementById("consolidated-feed-placeholder");

  if (state.activeSystemTab === "Outlook") {
    if (outlookInboxPanel) outlookInboxPanel.style.display = "flex";
    if (consolidatedFeedPlaceholder) consolidatedFeedPlaceholder.style.display = "none";

    // Count unread items
    const unreadIndicator = document.querySelector(".unread-indicator");
    const unreadCount = state.inbox.filter(item => item.unread).length;
    if (unreadIndicator) {
      unreadIndicator.textContent = `${unreadCount} unread`;
    }

    // Populate Inbox list dynamically
    const inboxListMount = document.querySelector(".inbox-list");
    if (inboxListMount) {
      inboxListMount.innerHTML = "";
      state.inbox.forEach(item => {
        const li = document.createElement("li");
        li.className = `inbox-item ${item.unread ? 'unread border-[#0078D4]' : ''}`;
        if (item.unread) {
          li.classList.add("bg-[#0078D4]/5");
        }
        
        const isAnyEmailOpen = (state.activeEmailId !== null);
        const isCurrentActiveEmail = (item.id === state.activeEmailId);
        
        if (isCurrentActiveEmail) {
          li.classList.add("selected");
        }
        
        if (isAnyEmailOpen) {
          // Compact layout for ALL cards when reading is active
          li.innerHTML = `
            <div class="inbox-item-compact-wrapper" style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                <div class="sender-avatar" style="flex-shrink: 0; width: 28px; height: 28px; font-size: 0.75rem;">${item.avatar}</div>
                <div class="inbox-item-sender" style="margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.88rem; color: #FFFFFF; flex: 1; min-width: 0;">${item.sender}</div>
              </div>
              <div class="inbox-item-meta" style="flex-shrink: 0; margin-left: auto; display: flex; align-items: center;">
                <span class="inbox-item-time" style="font-size: 0.72rem; color: var(--color-text-muted);">${item.time}</span>
              </div>
            </div>
          `;
        } else {
          // Full detailed layout for all cards when no email is active
          const snippetText = item.body ? item.body.replace(/\n/g, ' ').substring(0, 50) + '...' : '';
          li.innerHTML = `
            <div class="sender-avatar" style="flex-shrink: 0;">${item.avatar}</div>
            <div class="inbox-item-content" style="min-width: 0;">
              <div class="inbox-item-sender">${item.sender}</div>
              <div class="inbox-item-subject" style="font-weight: 600; margin-bottom: 2px;">${item.subject}</div>
              <div class="inbox-item-snippet" style="font-size: 0.78rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${snippetText}</div>
            </div>
            <div class="inbox-item-meta" style="flex-shrink: 0; display: flex; align-items: center; gap: 12px;">
              <span class="inbox-item-time">${item.time}</span>
              <span class="chevron-arrow">&rsaquo;</span>
            </div>
          `;
        }
        
        // Dynamic hover class states
        li.addEventListener("mouseenter", () => {
          li.classList.add("bg-[#0078D4]/5");
        });
        li.addEventListener("mouseleave", () => {
          if (!item.unread && item.id !== state.activeEmailId) {
            li.classList.remove("bg-[#0078D4]/5");
          }
        });
        
        // Toggle unread state and select email on click
        li.addEventListener("click", () => {
          item.unread = false;
          state.activeEmailId = item.id;
          renderHomeView();
        });
        
        inboxListMount.appendChild(li);
      });
    }

    // Render selected email details inside Reading Pane
    if (readingPaneMount) {
      if (state.activeEmailId !== null) {
        readingPaneMount.style.display = "flex";
        const email = state.inbox.find(item => item.id === state.activeEmailId);
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
              ${email.id === 1 ? `
                <div class="agent-insight-banner">
                  🤖 Agent Note: Jena Charles is locked out. Access is critical for the upcoming Q2 Audit data preparation. This action item has been summarized and moved to the top of your high-priority task list.
                </div>
              ` : ''}
              <p class="reading-body-text" style="white-space: pre-line;">${email.body}</p>
            </div>
            <div class="reading-actions-bar">
              ${email.id === 1 ? `
                <div class="btn-added-task" style="border: 1px solid #4ADE80; color: #4ADE80; background: rgba(74, 222, 128, 0.05); padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; cursor: default;">
                  <span class="check-icon">✓</span> Synced to Tasks
                </div>
              ` : email.state === 'not_added' ? `
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
              state.activeEmailId = null;
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
  } else {
    // consolidated feed active System Tab
    if (outlookInboxPanel) outlookInboxPanel.style.display = "none";
    if (readingPaneMount) {
      readingPaneMount.style.display = "none";
      readingPaneMount.innerHTML = "";
    }
    if (consolidatedFeedPlaceholder) consolidatedFeedPlaceholder.style.display = "flex";
  }
  
  if (window.checkAssistantFabState) {
    window.checkAssistantFabState();
  }

  const infraMount = document.getElementById("infra-dashboard-mount");
  if (infraMount && infraMount.style.display !== "none") {
    renderInfraDashboard();
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
    platform: "Gmail",
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
    platform: "Gmail",
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
    platform: "Gmail",
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
    platform: "Gmail",
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
    platform: "Gmail",
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

// Slack Chat Module Helpers
window.selectSlackChat = function(contactName) {
  state.activeSlackContact = contactName;
  renderSlackView();
};

function renderSlackView() {
  const slackView = document.getElementById("slack-view");
  if (!slackView) return;
  
  const contact = state.activeSlackContact || "Donaldy Salvant";
  
  let messageContent = "";
  if (contact === "Donaldy Salvant") {
    messageContent = `
      <div class="slack-message-row sent">
        <div class="slack-message-bubble">
          <div>call me when u get a chance</div>
          <span class="slack-message-time">4:06 PM</span>
        </div>
      </div>
    `;
  } else if (contact === "Claryce Medard") {
    messageContent = `
      <div class="slack-message-row sent">
        <div class="slack-message-bubble">
          <div>Hi Claryce, I've updated the AD permissions as requested.</div>
          <span class="slack-message-time">4:15 PM</span>
        </div>
      </div>
    `;
  } else {
    messageContent = `
      <div class="slack-message-row sent">
        <div class="slack-message-bubble">
          <div>hey Wilner, let's sync on the audit tasks later today.</div>
          <span class="slack-message-time">4:10 PM</span>
        </div>
      </div>
    `;
  }

  slackView.innerHTML = `
    <div class="slack-wrapper">
      <!-- Left Sidebar Panel (24%) -->
      <div class="slack-sidebar">
        <div class="slack-filters">
          <span class="slack-filter-pill">Unread</span>
          <span class="slack-filter-pill">Channels</span>
          <span class="slack-filter-pill active">Chats</span>
        </div>
        
        <div>
          <div class="slack-section-header">Direct Messages</div>
          <div class="slack-chat-list">
            <div class="slack-chat-item ${contact === "Donaldy Salvant" ? "active" : ""}" onclick="selectSlackChat('Donaldy Salvant')">
              <div class="slack-chat-avatar">DS</div>
              <div class="slack-chat-name">Donaldy Salvant</div>
            </div>
            <div class="slack-chat-item ${contact === "Wilner Sainlot" ? "active" : ""}" onclick="selectSlackChat('Wilner Sainlot')">
              <div class="slack-chat-avatar">WS</div>
              <div class="slack-chat-name">Wilner Sainlot</div>
            </div>
            <div class="slack-chat-item ${contact === "Claryce Medard" ? "active" : ""}" onclick="selectSlackChat('Claryce Medard')">
              <div class="slack-chat-avatar">CM</div>
              <div class="slack-chat-name">Claryce Medard</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Conversation Panel (76%) -->
      <div class="slack-chat-area">
        <div class="slack-chat-header">
          <div class="slack-header-name">${contact}</div>
        </div>
        
        <div class="slack-chat-history">
          ${messageContent}
        </div>
        
        <!-- Input Field -->
        <div class="slack-input-container">
          <div class="slack-input-wrapper">
            <input type="text" class="slack-input-field" placeholder="Type a message" />
            <div class="slack-input-actions">
              <span class="action-icon" style="cursor: pointer; margin-right: 8px;">☺</span>
              <span class="action-icon" style="cursor: pointer;">📎</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  slackView.classList.add("active-view");
  slackView.style.display = "flex";
}

function renderInfraDashboard() {
  const infraMount = document.getElementById("infra-dashboard-mount");
  if (!infraMount) return;

  const completedCount = state.tasks.filter(t => t.completed).length;
  const uncompletedHighPriorityCount = state.tasks.filter(t => t.priority === "high" && !t.completed).length;
  
  // Calculate points and progress dynamically
  const points = 1100 + completedCount * 90;
  const rewardProgress = Math.min(100, Math.round((points / 2000) * 100));
  
  // Enterprise sync states
  const outlookStatus = state.isSyncingAll ? "syncing" : "connected";
  const outlookTime = state.isSyncingAll ? "Syncing..." : "Synced 1m ago";
  const jiraStatus = state.isSyncingAll ? "syncing" : "connected";
  const jiraTime = state.isSyncingAll ? "Syncing..." : "Synced 4m ago";
  const slackStatus = "syncing";
  const slackTime = "Syncing...";
  const asanaStatus = state.isSyncingAll ? "syncing" : "error";
  const asanaTime = state.isSyncingAll ? "Syncing..." : "Auth Error (401)";

  infraMount.className = "infra-dashboard";
  infraMount.innerHTML = `
    <!-- Sub-header -->
    <div class="infra-dashboard-header">
      <div>
        <h1 class="infra-header-title">IT Engineering Dashboard</h1>
        <p class="infra-header-subtitle">Live insight into helpdesk queues, infrastructure syncs, and your daily gamified progress.</p>
      </div>
      
      <div style="display: flex; align-items: center; gap: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 8px; background: #1A1A1A; padding: 6px 12px; border-radius: 9999px; border: 1px solid #262626;">
          <span class="status-dot connected animate-pulse-green" style="width: 8px; height: 8px;"></span>
          <span style="font-size: 11px; color: #A3A3A3; font-weight: 500;">Agent Engine: Active</span>
        </div>
        <div class="infra-profile-avatar" title="Donaldy Salvant">
          DS
        </div>
      </div>
    </div>

    <!-- SECTION 1: SYSTEM & GAMIFICATION BANNER -->
    <div class="infra-grid-3">
      <!-- Gamified Productivity Meter (Reward Synthesizer) -->
      <div class="infra-card col-span-2 gamified-banner">
        <div class="zap-icon-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        
        <div style="z-index: 2;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; width: 100%;">
            <span style="background: #451A03; color: #F59E0B; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; letter-spacing: 0.05em; text-transform: uppercase;">
              Work-Life Synthesis Active
            </span>
            <span style="font-size: 11px; color: #A3A3A3; display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              <span style="color: #10B981; font-weight: 600;">+12%</span> vs Yesterday
            </span>
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">Your Daily Progress</h2>
          <p style="font-size: 12px; color: #A3A3A3; max-width: 480px; line-height: 1.5; margin-bottom: 0;">
            ${uncompletedHighPriorityCount > 0 ? `Resolve <span style="color: #FFFFFF; font-weight: 600;">${uncompletedHighPriorityCount} more</span> critical high-priority tickets to unlock your target reward milestone:` : `All critical high-priority tickets resolved! Your target reward milestone is ready:`} <span style="color: #FFFFFF; font-weight: 600;">Free Local Roast Coffee</span>.
          </p>
        </div>

        <!-- Progress Bar and Metrics -->
        <div class="mt-4" style="display: flex; flex-direction: column; gap: 8px; z-index: 2;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
            <span style="color: #D97706; font-weight: 500; display: flex; align-items: center; gap: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2v10h3V12zM22 12h-3v10h3V12zM12 8H7.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5H12Z"/></svg>
              <span>${points.toLocaleString()} pts / 2,000 pts to reward</span>
            </span>
            <span style="color: #A3A3A3;">${rewardProgress}% complete</span>
          </div>
          <div style="width: 100%; height: 10px; background: #1C1917; border-radius: 9999px; overflow: hidden; border: 1px solid #2E2520; position: relative;">
            <div style="height: 100%; width: ${rewardProgress}%; background: linear-gradient(90deg, #D97706 0%, #F59E0B 100%); border-radius: 9999px; transition: width 0.5s ease-in-out;"></div>
          </div>
        </div>
      </div>

      <!-- Quick KPI Snapshot Card -->
      <div class="infra-card flex-col-between">
        <div>
          <span class="infra-card-title">SLA Breach Metric</span>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 8px;">
            <span class="text-4xl font-extrabold text-white">98.4%</span>
            <span style="font-size: 12px; color: #10B981; font-weight: 600;">▲ 0.8%</span>
          </div>
          <p style="font-size: 11px; color: #737373; line-height: 1.4; margin-top: 8px; margin-bottom: 0;">
            Target threshold remains &gt;95.0% for enterprise compliance schedules.
          </p>
        </div>

        <!-- Sparkline Visual -->
        <div class="h-10 w-full flex items-end gap-1 mt-4" style="height: 40px; display: flex; align-items: flex-end; gap: 3px; margin-top: 16px;">
          <div class="sparkline-bar" style="height: 40%;"></div>
          <div class="sparkline-bar" style="height: 50%;"></div>
          <div class="sparkline-bar" style="height: 45%;"></div>
          <div class="sparkline-bar" style="height: 60%;"></div>
          <div class="sparkline-bar" style="height: 70%;"></div>
          <div class="sparkline-bar" style="height: 65%;"></div>
          <div class="sparkline-bar" style="height: 80%;"></div>
          <div class="sparkline-bar" style="height: 75%;"></div>
          <div class="sparkline-bar" style="height: 90%;"></div>
          <div class="sparkline-bar" style="height: 85%;"></div>
          <div class="sparkline-bar" style="height: 95%;"></div>
          <div class="sparkline-bar active" style="height: 98.4%;"></div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: KEY PERFORMANCE INDICATORS -->
    <div>
      <h3 class="section-title-kpi">Core Performance Indicators (KPIs)</h3>
      <div class="infra-grid-4">
        <!-- Card 1: Active Connection Stack -->
        <div class="infra-card">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; width: 100%;">
            <span style="font-size: 11px; font-weight: 600; color: #737373; text-transform: uppercase;">Active Connection Stack</span>
            <div style="padding: 6px; background: #1A1A1A; border-radius: 6px; border: 1px solid #262626; display: flex; align-items: center; justify-content: center; color: #3B82F6;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
          </div>
          <div style="margin-top: 12px;">
            <span class="text-2xl font-bold text-white">28 / 32 Apps</span>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 11px;">
              <span style="color: #10B981; font-weight: 600;">+4 Connected</span>
              <span style="color: #525252;">•</span>
              <span style="color: #737373; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="Connected API SaaS Integrations">Connected API SaaS Integrations</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Avg Ticket Resolution Speed -->
        <div class="infra-card">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; width: 100%;">
            <span style="font-size: 11px; font-weight: 600; color: #737373; text-transform: uppercase;">Avg Resolution Speed</span>
            <div style="padding: 6px; background: #1A1A1A; border-radius: 6px; border: 1px solid #262626; display: flex; align-items: center; justify-content: center; color: #10B981;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div style="margin-top: 12px;">
            <span class="text-2xl font-bold text-white">14.2 mins</span>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 11px;">
              <span style="color: #10B981; font-weight: 600;">-3.5m Faster</span>
              <span style="color: #525252;">•</span>
              <span style="color: #737373; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="Target SLA: under 30 minutes">Target SLA: under 30m</span>
            </div>
          </div>
        </div>

        <!-- Card 3: System Vulnerability Score -->
        <div class="infra-card">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; width: 100%;">
            <span style="font-size: 11px; font-weight: 600; color: #737373; text-transform: uppercase;">Vulnerability Score</span>
            <div style="padding: 6px; background: #1A1A1A; border-radius: 6px; border: 1px solid #262626; display: flex; align-items: center; justify-content: center; color: #EF4444;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
          <div style="margin-top: 12px;">
            <span class="text-2xl font-bold text-white">82.91%</span>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 11px;">
              <span style="color: #EF4444; font-weight: 600;">Needs Action</span>
              <span style="color: #525252;">•</span>
              <span style="color: #737373; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="Microsoft Secure Score metrics">Secure Score metrics</span>
            </div>
          </div>
        </div>

        <!-- Card 4: Pending User Alerts -->
        <div class="infra-card">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; width: 100%;">
            <span style="font-size: 11px; font-weight: 600; color: #737373; text-transform: uppercase;">Pending User Alerts</span>
            <div style="padding: 6px; background: #1A1A1A; border-radius: 6px; border: 1px solid #262626; display: flex; align-items: center; justify-content: center; color: #F59E0B;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div style="margin-top: 12px;">
            <span class="text-2xl font-bold text-white">1 User Risk</span>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 11px;">
              <span style="color: #F59E0B; font-weight: 600;">Critical</span>
              <span style="color: #525252;">•</span>
              <span style="color: #737373; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="Identity compliance flags triggered">Identity flags triggered</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 3: ALERT TILES & INTEGRATIONS -->
    <div class="infra-grid-3">
      <!-- Left Box: Critical Alert Queue -->
      <div class="infra-card col-span-2" style="justify-content: flex-start; gap: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 12px; width: 100%;">
          <div>
            <h4 style="font-size: 14px; font-weight: 600; color: #FFFFFF; margin: 0;">Critical Alert Queue</h4>
            <p style="font-size: 11px; color: #737373; margin: 2px 0 0 0;">Actions requiring direct engineering intervention today</p>
          </div>
          <span class="infra-badge critical" style="background: #450A0A; border: 1px solid #7F1D1D; color: #F87171; font-weight: 600;">
            3 Immediate Failures
          </span>
        </div>

        <!-- Alert Rows -->
        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
          <!-- Alert 1 (Critical) -->
          <div style="padding: 12px 16px; border-radius: 8px; border: 1px solid #7F1D1D; background: #180A0A; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="color: #EF4444; margin-top: 2px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 9px; font-weight: 700; background: #450A0A; color: #F87171; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Service Health</span>
                  <span style="font-size: 10px; color: #737373;">Updated 5 mins ago</span>
                </div>
                <p style="font-size: 13px; font-weight: 500; color: #FFFFFF; margin: 6px 0 0 0;">SharePoint Sync Interruption (1 active incident, 1 advisory)</p>
              </div>
            </div>
            <button class="infra-btn" style="padding: 6px 12px; font-size: 11px;">
              <span>Run Diagnostic</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Alert 2 (Warning) -->
          <div style="padding: 12px 16px; border-radius: 8px; border: 1px solid #78350F; background: #17110C; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="color: #F59E0B; margin-top: 2px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 9px; font-weight: 700; background: #451A03; color: #FBBF24; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">License Allocations</span>
                  <span style="font-size: 10px; color: #737373;">Updated 2 hours ago</span>
                </div>
                <p style="font-size: 13px; font-weight: 500; color: #FFFFFF; margin: 6px 0 0 0;">249 agentic runtime licenses lack defined ownership parameters</p>
              </div>
            </div>
            <button class="infra-btn" style="padding: 6px 12px; font-size: 11px;">
              <span>Re-assign Owners</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Alert 3 (Info) -->
          <div style="padding: 12px 16px; border-radius: 8px; border: 1px solid #1E3A8A; background: #0A101D; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="color: #60A5FA; margin-top: 2px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 9px; font-weight: 700; background: #1E1B4B; color: #93C5FD; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Service Health</span>
                  <span style="font-size: 10px; color: #737373;">Updated 4 hours ago</span>
                </div>
                <p style="font-size: 13px; font-weight: 500; color: #FFFFFF; margin: 6px 0 0 0;">Microsoft Teams API throttling warning (0 incidents, 1 advisory)</p>
              </div>
            </div>
            <button class="infra-btn" style="padding: 6px 12px; font-size: 11px;">
              <span>Optimize Webhook</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Box: App Connections & Sync Status -->
      <div class="infra-card flex-col-between">
        <div style="width: 100%;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 12px; width: 100%; margin-bottom: 12px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #FFFFFF; margin: 0;">Enterprise Stack Syncs</h4>
            <button id="sync-all-stack-btn" style="font-size: 11px; color: #D97706; background: transparent; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 600; transition: color 0.2s; padding: 4px 8px; border-radius: 4px;">
              <svg id="sync-all-icon" style="transition: transform 0.2s;" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <span>${state.isSyncingAll ? "Syncing..." : "Sync All"}</span>
            </button>
          </div>

          <!-- Sync statuses -->
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
            <div class="status-badge-row">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                <span class="status-dot ${outlookStatus}"></span>
                <span style="color: #FFFFFF; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Outlook Enterprise Mail API</span>
              </div>
              <span style="color: #737373; font-family: monospace; font-size: 10px;">${outlookTime}</span>
            </div>

            <div class="status-badge-row">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                <span class="status-dot ${jiraStatus}"></span>
                <span style="color: #FFFFFF; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Jira Workspace Integration</span>
              </div>
              <span style="color: #737373; font-family: monospace; font-size: 10px;">${jiraTime}</span>
            </div>

            <div class="status-badge-row">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                <span class="status-dot ${slackStatus}"></span>
                <span style="color: #FFFFFF; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Slack Webhook Pipeline</span>
              </div>
              <span style="color: #737373; font-family: monospace; font-size: 10px;">${slackTime}</span>
            </div>

            <div class="status-badge-row">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                <span class="status-dot ${asanaStatus}"></span>
                <span style="color: #FFFFFF; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Asana Management (Legacy Core)</span>
              </div>
              <span style="color: #737373; font-family: monospace; font-size: 10px;">${asanaTime}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Footer inside card -->
        <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px; margin-top: 12px; width: 100%;">
          <button class="infra-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; padding: 10px;">
            <span>Connect New App Core</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach event listener for sync all button
  const syncBtn = document.getElementById("sync-all-stack-btn");
  if (syncBtn) {
    if (state.isSyncingAll) {
      const icon = document.getElementById("sync-all-icon");
      if (icon) {
        icon.style.animation = "spin 1s linear infinite";
      }
    }
    syncBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (state.isSyncingAll) return;
      state.isSyncingAll = true;
      renderInfraDashboard();
      
      setTimeout(() => {
        state.isSyncingAll = false;
        renderInfraDashboard();
      }, 2000);
    });
  }
}

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", init);
