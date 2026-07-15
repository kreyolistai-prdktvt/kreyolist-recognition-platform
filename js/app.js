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
  activeTab: "Outlook", // default active tab
  activeTeamsContactId: "claryce", // active Teams chat conversation contact
  chatBonusPoints: 0,
  selectedCalendarDate: "2026-07-14",
  calendarEvents: {
    "2026-07-12": [
      { 
        id: "1", 
        title: "Production Server Sync", 
        time: "9:00 AM", 
        duration: "1 hr", 
        type: "engineering", 
        attendees: ["Standly L."],
        points: 50,
        description: "Verify deployment handshake pipelines."
      },
      { 
        id: "2", 
        title: "Deep Work Focus Block", 
        time: "2:00 PM", 
        duration: "2 hrs", 
        type: "focus",
        points: 100,
        description: "No-meeting execution block for core backend development."
      }
    ],
    "2026-07-13": [
      { 
        id: "3", 
        title: "🔒 System Lock: Q2 Audit Prep", 
        time: "10:00 AM", 
        duration: "2 hrs", 
        type: "security", 
        attendees: ["Wilner S."],
        points: 75,
        description: "Prepare target compliance buffers and rotate secret keys."
      }
    ],
    "2026-07-14": [
      { 
        id: "4", 
        title: "M365 Migration Strategy", 
        time: "11:00 AM", 
        duration: "1.5 hrs", 
        type: "business", 
        attendees: ["Lawrence J."],
        points: 60,
        description: "Align enterprise target timelines for Nike and Amazon pipelines."
      },
      { 
        id: "5", 
        title: "Database Schema Lock", 
        time: "1:30 PM", 
        duration: "1 hr", 
        type: "engineering", 
        attendees: ["Claryce M."],
        points: 50,
        description: "Review index structures and migration tables for Firebase."
      },
      { 
        id: "6", 
        title: "AI for Humanity Roundtable Prep", 
        time: "4:00 PM", 
        duration: "1 hr", 
        type: "business", 
        attendees: ["Chris L."],
        points: 40,
        description: "Coordinate Silicon Valley deck outlines with Chris."
      }
    ],
    "2026-07-15": [
      { 
        id: "7", 
        title: "System Integration Review", 
        time: "10:00 AM", 
        duration: "1.5 hrs", 
        type: "security", 
        attendees: ["Wilner S.", "Standly L."],
        points: 80
      },
      { 
        id: "8", 
        title: "Weekly Ledger Sync", 
        time: "3:00 PM", 
        duration: "1 hr", 
        type: "engineering", 
        attendees: ["Ricky S."],
        points: 40
      }
    ]
  },
  teamsContacts: [
    {
      id: "claryce",
      name: "Claryce M.",
      avatar: "CM",
      role: "Backend Architect",
      status: "online",
      time: "10:02 PM",
      unreadCount: 1,
      lastMessage: "The Firebase replication logic is holding up. Are we ready to scale?",
      convo: [
        { id: "c_m1", sender: "them", senderName: "Claryce M.", time: "9:50 PM", text: "Hey, I just finalized the schema migrations for the user reward tables. The backend structure is optimized for high-volume reads." },
        { id: "c_m2", sender: "me", senderName: "DS", time: "9:55 PM", text: "Excellent work. Did you implement the indexing on the transaction IDs to prevent bottleneck issues?" },
        { id: "c_m3", sender: "them", senderName: "Claryce M.", time: "10:02 PM", text: "Yes, added composite indexes. The Firebase replication logic is holding up. Are we ready to scale?" }
      ]
    },
    {
      id: "wilner",
      name: "Wilner S.",
      avatar: "WS",
      role: "Security Engineer",
      status: "online",
      time: "9:55 PM",
      unreadCount: 3,
      lastMessage: "Make sure the API token encryption keys are rotated in the secret manager.",
      convo: [
        { id: "w1", sender: "them", senderName: "Wilner S.", time: "9:40 PM", text: "Looking at our application integration endpoints. We need to lock down OAuth security scopes." },
        { id: "w2", sender: "me", senderName: "DS", time: "9:48 PM", text: "Absolutely, I configured strict read-only scopes for the public API sync agents." },
        { id: "w3", sender: "them", senderName: "Wilner S.", time: "9:55 PM", text: "Good call. Make sure the API token encryption keys are rotated in the secret manager." }
      ]
    },
    {
      id: "charles",
      name: "Charles M.",
      avatar: "CM",
      role: "DevOps Lead",
      status: "busy",
      time: "9:48 PM",
      unreadCount: 0,
      lastMessage: "Scaling the container clusters to handle the high throughput test tomorrow.",
      convo: [
        { id: "ch1", sender: "them", senderName: "Charles M.", time: "9:30 PM", text: "Our server health metrics peaked at 88% CPU during the stress-test run on the staging environment." },
        { id: "ch2", sender: "me", senderName: "DS", time: "9:40 PM", text: "Let's increase our auto-scaling group limits. We want to auto-scale once we cross a 70% baseline load." },
        { id: "ch3", sender: "them", senderName: "Charles M.", time: "9:48 PM", text: "Agreed. Scaling the container clusters to handle the high throughput test tomorrow." }
      ]
    },
    {
      id: "standly",
      name: "Standly L.",
      avatar: "SL",
      role: "Platform Engineer",
      status: "online",
      time: "9:42 PM",
      unreadCount: 0,
      lastMessage: "Did you push the updated API gateway specifications yet?",
      convo: [
        { id: "s1", sender: "them", senderName: "Standly L.", time: "9:30 PM", text: "Hey! Looking at the new multi-agent pipeline setup. We need to lock down the exact specifications for the integration engine." },
        { id: "s2", sender: "me", senderName: "DS", time: "9:35 PM", text: "Just pushed the specs to the repo. It handles the secure token handshake with the target endpoints seamlessly." },
        { id: "s3", sender: "them", senderName: "Standly L.", time: "9:40 PM", text: "Awesome, pulling it now. If this is verified, our core performance matrix is going to look solid." },
        { id: "s4", sender: "them", senderName: "Standly L.", time: "9:42 PM", text: "Did you push the updated API gateway specifications yet?" }
      ]
    },
    {
      id: "lawrence",
      name: "Lawrence J.",
      avatar: "LJ",
      role: "Strategic Business Advisor",
      status: "busy",
      time: "8:15 PM",
      unreadCount: 0,
      lastMessage: "Let's align the M365 migration plan with the pipeline strategy.",
      convo: [
        { id: "l1", sender: "them", senderName: "Lawrence J.", time: "7:45 PM", text: "We need to construct a robust pitch for enterprise security. Think Accenture, Nike, MacDonalds, and Amazon. They won't look at us without bulletproof security architecture." },
        { id: "l2", sender: "me", senderName: "DS", time: "8:00 PM", text: "Agreed. I am mapping our compliance framework to show a 98.4% Secure Score. That should clear any high-priority security questionnaires." },
        { id: "l3", sender: "them", senderName: "Lawrence J.", time: "8:15 PM", text: "Perfect. Let's align the M365 migration plan with the pipeline strategy before we present to the Amazon engineering contacts." }
      ]
    },
    {
      id: "chris",
      name: "Chris L.",
      avatar: "CL",
      role: "Global Tech Evangelist",
      status: "online",
      time: "6:30 PM",
      unreadCount: 0,
      lastMessage: "We're setting up the Silicon Valley roundtable deck.",
      convo: [
        { id: "c1", sender: "them", senderName: "Chris L.", time: "6:10 PM", text: "The AI for Humanity summit panel schedule is getting finalized. We need to show how localized rewards actually mitigate real-world engineer burnout." },
        { id: "c2", sender: "me", senderName: "DS", time: "6:20 PM", text: "Exactly, it's not just another tracker. We're bridging actual enterprise server logs directly to curated local incentives." },
        { id: "c3", sender: "them", senderName: "Chris L.", time: "6:30 PM", text: "Exactly. It's human-centric engineering. We're setting up the Silicon Valley roundtable deck tonight—send me over those latest performance metrics!" }
      ]
    },
    {
      id: "ricky",
      name: "Ricky S.",
      avatar: "RS",
      role: "FinTech Lead Architect",
      status: "offline",
      time: "Yesterday",
      unreadCount: 0,
      lastMessage: "The transaction handler API looks clean.",
      convo: [
        { id: "r1", sender: "them", senderName: "Ricky S.", time: "Yesterday", text: "I was reading up on how ancient architectural principles match modern database sharding. It's wild how systemic order repeats across history, religion, and finance." },
        { id: "r2", sender: "me", senderName: "DS", time: "Yesterday", text: "Total pattern matching. Systematic structure is everything, whether it's managing ledger trust or optimizing transactional endpoints." },
        { id: "r3", sender: "them", senderName: "Ricky S.", time: "Yesterday", text: "Exactly! By the way, the transaction handler API looks clean. Zero lag on the sandbox terminal." }
      ]
    }
  ],
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
  
  // Initialize default active view
  setActiveTab(state.activeTab, true);
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
  const navCalendar = document.getElementById("nav-item-calendar");
  const navTeams = document.getElementById("nav-item-teams");
  const navRec = document.getElementById("nav-item-recognition");

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
  if (navTeams) {
    navTeams.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Teams");
    });
  }
  if (navRec) {
    navRec.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveTab("Recognition");
    });
  }
}

/**
 * Switches the active tab view.
 * @param {string} tabName - The name of the tab to switch to.
 */
function setActiveTab(tabName, force = false) {
  if (state.activeTab === tabName && !force) return;
  state.activeTab = tabName;

  if (tabName === "Home" || tabName === "Outlook") {
    state.activeSystemTab = tabName;
  }

  const navHome = document.getElementById("nav-item-home");
  const navOutlook = document.getElementById("nav-item-outlook");
  const navCalendar = document.getElementById("nav-item-calendar");
  const navTeams = document.getElementById("nav-item-teams");
  const navRec = document.getElementById("nav-item-recognition");

  const homeView = document.getElementById("home-view");
  const recView = document.getElementById("recognition-view");
  const calendarView = document.getElementById("calendar-view");
  const teamsView = document.getElementById("teams-view");
  const appMain = document.querySelector(".app-main-scrollable");
  const greetingEl = document.querySelector(".recognition-portal-greeting");

  // Apply active wayfinding highlight
  const navs = [
    { name: "Home", el: navHome },
    { name: "Outlook", el: navOutlook },
    { name: "Calendar", el: navCalendar },
    { name: "Teams", el: navTeams },
    { name: "Recognition", el: navRec }
  ];

  navs.forEach(item => {
    if (item.el) {
      if (state.activeTab === item.name) item.el.classList.add("active");
      else item.el.classList.remove("active");
    }
  });

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
  if (calendarView) {
    calendarView.classList.remove("active-view");
    calendarView.style.display = "none";
  }
  if (teamsView) {
    teamsView.classList.remove("active-view");
    teamsView.style.display = "none";
  }

  if (greetingEl) {
    greetingEl.style.display = state.activeTab === "Recognition" ? "block" : "none";
  }

  // Lock target view display conditions
  if (state.activeTab === "Home") {
    const infraMount = document.getElementById("infra-dashboard-mount");
    if (infraMount) {
      infraMount.style.display = "grid";
      renderInfraDashboard();
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
    renderCalendarView();
    if (appMain) appMain.classList.remove("home-active");
  } else if (state.activeTab === "Teams") {
    if (teamsView) {
      teamsView.classList.add("active-view");
      teamsView.style.display = "flex";
    }
    renderTeamsView();
    if (appMain) appMain.classList.add("home-active");
  } else if (state.activeTab === "Recognition") {
    if (recView) recView.style.display = "block";
    if (appMain) appMain.classList.remove("home-active");
    renderGrid();
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

// MS Teams Chat Module Helpers
window.selectTeamsChat = function(contactId) {
  state.activeTeamsContactId = contactId;
  const contact = state.teamsContacts.find(c => c.id === contactId);
  if (contact) {
    contact.unreadCount = 0;
  }
  renderTeamsView();
};

function renderTeamsView() {
  const teamsView = document.getElementById("teams-view");
  if (!teamsView) return;

  const activeContact = state.teamsContacts.find(c => c.id === state.activeTeamsContactId) || state.teamsContacts[0];
  
  // Point calculations (matching home dashboard logic)
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const currentPoints = 1100 + completedTasks * 90 + (state.chatBonusPoints || 0);

  // Render contacts list
  let contactsHtml = "";
  state.teamsContacts.forEach(c => {
    const isActive = c.id === activeContact.id;
    contactsHtml += `
      <button class="teams-chat-item ${isActive ? "active" : ""}" onclick="selectTeamsChat('${c.id}')">
        <div class="teams-avatar-frame">
          ${c.avatar}
          <span class="teams-status-dot ${c.status}"></span>
        </div>
        <div class="teams-item-details">
          <div class="teams-item-meta">
            <span class="teams-item-name">${c.name}</span>
            <span class="teams-item-time">${c.time}</span>
          </div>
          <div class="teams-item-role">${c.role}</div>
          <div class="teams-item-preview">${c.lastMessage}</div>
        </div>
        ${c.unreadCount ? `<span class="teams-badge-unread">${c.unreadCount}</span>` : ""}
      </button>
    `;
  });

  // Render messages
  let messagesHtml = "";
  activeContact.convo.forEach(msg => {
    if (msg.isTechLog) {
      messagesHtml += `
        <div class="teams-activity-sync-card">
          <div class="teams-activity-sync-bubble">
            <div class="teams-activity-sync-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              KreyōList Activity Sync
            </div>
            <p class="teams-activity-sync-text">${msg.text}</p>
          </div>
        </div>
      `;
    } else {
      const isMe = msg.sender === 'me';
      messagesHtml += `
        <div class="teams-message-row ${isMe ? 'sent' : 'received'}">
          <div class="teams-message-container">
            <div class="teams-message-meta">
              <span class="teams-message-sender">${msg.senderName}</span>
              <span class="teams-message-time">${msg.time}</span>
            </div>
            <div class="teams-message-bubble">
              ${msg.text}
            </div>
          </div>
        </div>
      `;
    }
  });

  teamsView.innerHTML = `
    <div class="teams-wrapper">
      <!-- Left Sidebar Column -->
      <div class="teams-sidebar">
        <!-- Search and Header -->
        <div class="teams-search-container">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em;">Teams Workspace</span>
            <span style="font-size: 10px; background: #1A1A1A; text-shadow: none; color: #737373; padding: 2px 6px; border-radius: 4px; border: 1px solid #262626; font-family: monospace;">
              M365 Linked
            </span>
          </div>
          <div class="teams-search-wrapper">
            <input type="text" placeholder="Search engineer, client, or topic..." class="teams-search-input" />
            <span class="teams-search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
          </div>
        </div>

        <!-- Chat List -->
        <div class="teams-chat-list">
          ${contactsHtml}
        </div>

        <!-- Bottom Widget -->
        <div class="teams-widget-container">
          <div class="teams-widget-header">
            <span class="teams-widget-title">KreyōList Engine</span>
            <span class="teams-widget-status">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10B981; margin-right: 4px;" class="animate-pulse"></span>
              Active
            </span>
          </div>
          <div class="teams-widget-box">
            <div class="teams-widget-points">
              <span class="teams-widget-label">Earned Today</span>
              <span class="teams-widget-value">${currentPoints.toLocaleString()} / 2,000 pts</span>
            </div>
            <div class="teams-widget-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Area: Chat Conversation Frame -->
      <div class="teams-chat-area">
        <!-- Active Chat Header -->
        <header class="teams-chat-header">
          <div class="teams-chat-header-profile">
            <div class="teams-chat-header-avatar">${activeContact.avatar}</div>
            <div>
              <div class="teams-chat-header-name">${activeContact.name}</div>
              <div class="teams-chat-header-role">${activeContact.role}</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="teams-header-actions">
            <button class="teams-action-btn" title="Call">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </button>
            <button class="teams-action-btn" title="Video Call">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7z"/><polygon points="14 10.68 1 5.32 1 18.68 14 13.32 14 10.68"/></svg>
            </button>
            <button class="teams-action-btn" title="More Options">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </header>

        <!-- Conversation History -->
        <div class="teams-chat-history" id="teams-chat-history-scroll">
          ${messagesHtml}
        </div>

        <!-- Chat Input Form -->
        <div class="teams-input-container">
          <form class="teams-input-form" id="teams-message-form">
            <input 
              type="text" 
              id="teams-msg-input"
              placeholder="Type a message... (Use tech jargon like 'API', 'server', or 'M365' to log active milestones)" 
              class="teams-input-field"
              autocomplete="off"
            />
            <div class="teams-input-actions-row">
              <div class="teams-input-attach-group">
                <button type="button" class="teams-input-attach-btn" title="Attach file">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <button type="button" class="teams-input-attach-btn" title="Insert emoji">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </button>
                <button type="button" class="teams-input-attach-btn" title="Add image">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </button>
                <button type="button" class="teams-input-attach-btn" title="Add voice message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </button>
              </div>
              <button type="submit" class="teams-send-btn">
                Send 
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Apply visual flags to the tab
  teamsView.classList.add("active-view");
  teamsView.style.display = "flex";

  // Scroll to bottom of chat history
  const historyScroll = document.getElementById("teams-chat-history-scroll");
  if (historyScroll) {
    historyScroll.scrollTop = historyScroll.scrollHeight;
  }

  // Hook submit listener
  const form = document.getElementById("teams-message-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("teams-msg-input");
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      const newMsg = {
        id: Date.now().toString(),
        sender: "me",
        senderName: "DS",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: text
      };

      activeContact.convo.push(newMsg);
      activeContact.lastMessage = text;
      activeContact.time = "Just now";

      // Clear input
      input.value = "";

      // Re-render
      renderTeamsView();

      // Check for technical jargon
      const containsTechJargon = /(api|server|m365|migration|deploy|sync|endpoint|database|docker|firebase|encryption)/i.test(text);
      if (containsTechJargon) {
        setTimeout(() => {
          const kreyoLog = {
            id: (Date.now() + 1).toString(),
            sender: "them",
            senderName: "KreyōList Bot",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "🤖 [KreyōList Engine]: Technical contribution logged. +50 Gamification points recorded towards your Weekly Reward Goal! ☕️",
            isTechLog: true
          };
          activeContact.convo.push(kreyoLog);
          activeContact.lastMessage = "Contribution logged successfully!";
          state.chatBonusPoints = (state.chatBonusPoints || 0) + 50;

          // Re-render Teams view
          renderTeamsView();
          
          // Force refresh other points widgets if active
          renderHomeView();
          renderInfraDashboard();
        }, 1200);
      }
    });
  }
}

function renderInfraDashboard() {
  const infraMount = document.getElementById("infra-dashboard-mount");
  if (!infraMount) return;

  const completedCount = state.tasks.filter(t => t.completed).length;
  const uncompletedHighPriorityCount = state.tasks.filter(t => t.priority === "high" && !t.completed).length;
  
  // Calculate points and progress dynamically
  const points = 1100 + completedCount * 90 + (state.chatBonusPoints || 0);
  const rewardProgress = Math.min(100, Math.round((points / 2000) * 100));
  
  // Enterprise sync states
  const outlookStatus = state.isSyncingAll ? "syncing" : "connected";
  const outlookTime = state.isSyncingAll ? "Syncing..." : "Synced 1m ago";
  const jiraStatus = state.isSyncingAll ? "syncing" : "connected";
  const jiraTime = state.isSyncingAll ? "Syncing..." : "Synced 4m ago";
  const teamsStatus = state.isSyncingAll ? "syncing" : "connected";
  const teamsTime = state.isSyncingAll ? "Syncing..." : "Synced 2m ago";
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
                <span class="status-dot ${teamsStatus}"></span>
                <span style="color: #FFFFFF; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">MS Teams Synchronization</span>
              </div>
              <span style="color: #737373; font-family: monospace; font-size: 10px;">${teamsTime}</span>
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

// Calendar Module Helpers
window.selectCalendarDate = function(dateStr) {
  state.selectedCalendarDate = dateStr;
  renderCalendarView();
};

function renderCalendarView() {
  const calendarView = document.getElementById("calendar-view");
  if (!calendarView) return;

  const selectedDate = state.selectedCalendarDate || "2026-07-14";
  const activeEvents = state.calendarEvents[selectedDate] || [];

  // Generate days grid HTML
  const daysList = [
    { day: 28, date: "2026-06-28", currentMonth: false },
    { day: 29, date: "2026-06-29", currentMonth: false },
    { day: 30, date: "2026-06-30", currentMonth: false },
    { day: 1, date: "2026-07-01", currentMonth: true },
    { day: 2, date: "2026-07-02", currentMonth: true },
    { day: 3, date: "2026-07-03", currentMonth: true },
    { day: 4, date: "2026-07-04", currentMonth: true },
    { day: 5, date: "2026-07-05", currentMonth: true },
    { day: 6, date: "2026-07-06", currentMonth: true },
    { day: 7, date: "2026-07-07", currentMonth: true },
    { day: 8, date: "2026-07-08", currentMonth: true },
    { day: 9, date: "2026-07-09", currentMonth: true },
    { day: 10, date: "2026-07-10", currentMonth: true },
    { day: 11, date: "2026-07-11", currentMonth: true },
    { day: 12, date: "2026-07-12", currentMonth: true },
    { day: 13, date: "2026-07-13", currentMonth: true },
    { day: 14, date: "2026-07-14", currentMonth: true, isToday: true },
    { day: 15, date: "2026-07-15", currentMonth: true },
    { day: 16, date: "2026-07-16", currentMonth: true },
    { day: 17, date: "2026-07-17", currentMonth: true },
    { day: 18, date: "2026-07-18", currentMonth: true },
    { day: 19, date: "2026-07-19", currentMonth: true },
    { day: 20, date: "2026-07-20", currentMonth: true },
    { day: 21, date: "2026-07-21", currentMonth: true },
    { day: 22, date: "2026-07-22", currentMonth: true },
    { day: 23, date: "2026-07-23", currentMonth: true },
    { day: 24, date: "2026-07-24", currentMonth: true },
    { day: 25, date: "2026-07-25", currentMonth: true },
    { day: 26, date: "2026-07-26", currentMonth: true },
    { day: 27, date: "2026-07-27", currentMonth: true },
    { day: 28, date: "2026-07-28", currentMonth: true },
    { day: 29, date: "2026-07-29", currentMonth: true },
    { day: 30, date: "2026-07-30", currentMonth: true },
    { day: 31, date: "2026-07-31", currentMonth: true }
  ];

  let gridHtml = "";
  daysList.forEach(dObj => {
    const isSelected = selectedDate === dObj.date;
    const hasEvents = state.calendarEvents[dObj.date] && state.calendarEvents[dObj.date].length > 0;
    
    let btnClass = "calendar-day-btn";
    if (isSelected) btnClass += " selected";
    if (dObj.isToday) btnClass += " today";

    gridHtml += `
      <button 
        ${dObj.currentMonth ? `onclick="selectCalendarDate('${dObj.date}')"` : "disabled"}
        class="${btnClass}"
      >
        <span>${dObj.day}</span>
        ${hasEvents && !isSelected ? `<span class="calendar-day-dot"></span>` : ""}
      </button>
    `;
  });

  // Calculate day total points
  let dayTotalPoints = 0;
  activeEvents.forEach(evt => {
    if (evt.points) dayTotalPoints += evt.points;
  });

  // Format selected date description
  const dateObj = new Date(selectedDate);
  const formattedDateString = dateObj.toLocaleDateString("en-US", { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Render events list
  let eventsHtml = "";
  if (activeEvents.length === 0) {
    eventsHtml = `
      <div class="flex flex-col items-center justify-center h-64 border border-dashed border-[#1F1F1F] rounded-xl text-center p-6" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3F3F46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p class="text-sm font-medium" style="color: #737373; font-weight: 500; font-size: 14px; margin: 0;">No scheduled events found for this date.</p>
        <p class="text-xs" style="color: #525252; font-size: 12px; margin-top: 4px; margin-bottom: 0;">Keep focus blocks and core sprint sessions logged for progress tracking.</p>
      </div>
    `;
  } else {
    activeEvents.forEach(evt => {
      // Build attendees HTML if they exist
      let attendeesHtml = "";
      if (evt.attendees && evt.attendees.length > 0) {
        let spanList = "";
        evt.attendees.forEach(person => {
          spanList += `<span class="calendar-event-teammate">${person}</span>`;
        });
        attendeesHtml = `
          <div style="display: flex; align-items: center; gap: 6px; padding-top: 4px;">
            <span style="font-size: 10px; color: #525252; font-weight: 600;">Teammates:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${spanList}
            </div>
          </div>
        `;
      }

      // Build points HTML if they exist
      let pointsHtml = "";
      if (evt.points) {
        pointsHtml = `
          <div class="calendar-score-box">
            <div style="text-align: right;">
              <span class="calendar-score-label">Kreyō Score</span>
              <span class="calendar-score-value">+${evt.points} Points</span>
            </div>
            <div class="calendar-score-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
          </div>
        `;
      }

      eventsHtml += `
        <div class="calendar-event-card ${evt.type}">
          <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="calendar-event-badge ${evt.type}">${evt.type}</span>
              <span style="font-size: 12px; color: #737373; display: inline-flex; align-items: center; gap: 4px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${evt.time} (${evt.duration})
              </span>
            </div>
            <h4 style="font-size: 1rem; font-weight: 600; color: #FFFFFF; margin: 0;">${evt.title}</h4>
            ${evt.description ? `<p style="font-size: 12px; color: #A3A3A3; margin: 0; line-height: 1.5; max-width: 480px;">${evt.description}</p>` : ""}
            ${attendeesHtml}
          </div>
          ${pointsHtml}
        </div>
      `;
    });
  }

  calendarView.innerHTML = `
    <div class="calendar-wrapper">
      <!-- Left Sub-Column: Mini Date Navigator -->
      <div class="calendar-sidebar-left">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 style="font-size: 14px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">My Schedule</h2>
          <button style="padding: 6px; background: #1A1A1A; hover:bg-[#262626]; border: 1px solid #262626; color: #A3A3A3; border-radius: 6px; display: flex; align-items: center; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <!-- Month navigator title -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #FFFFFF;">July 2026</span>
          <div style="display: flex; gap: 4px;">
            <button style="padding: 4px; background: transparent; border: none; color: #A3A3A3; cursor: pointer; border-radius: 4px;" title="Previous Month">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button style="padding: 4px; background: transparent; border: none; color: #A3A3A3; cursor: pointer; border-radius: 4px;" title="Next Month">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <!-- Days grid header & buttons -->
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px 0; text-align: center; font-size: 12px; margin-top: 12px;">
          <span style="color: #525252; font-weight: 600;">Su</span>
          <span style="color: #525252; font-weight: 600;">Mo</span>
          <span style="color: #525252; font-weight: 600;">Tu</span>
          <span style="color: #525252; font-weight: 600;">We</span>
          <span style="color: #525252; font-weight: 600;">Th</span>
          <span style="color: #525252; font-weight: 600;">Fr</span>
          <span style="color: #525252; font-weight: 600;">Sa</span>
          
          ${gridHtml}
        </div>

        <!-- Progress Integration Card -->
        <div style="padding-top: 16px; border-top: 1px solid #1F1F1F; margin-top: auto;">
          <div style="padding: 1rem; background: #141414; border: 1px solid #262626; border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 0.05em;">Active Integration</span>
              <span style="font-size: 9px; color: #10B981; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10B981;" class="animate-pulse"></span>
                Live
              </span>
            </div>
            <p style="font-size: 11px; color: #A3A3A3; margin: 0; line-height: 1.5;">
              Complete your target focus periods and collaborative sync events today to hit your milestones.
            </p>
          </div>
        </div>
      </div>

      <!-- Right Area: Big Calendar Board -->
      <div class="calendar-center-grid">
        <!-- Header -->
        <header class="teams-chat-header" style="height: 64px; border-bottom: 1px solid #1F1F1F; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; background: #0D0D0D; flex-shrink: 0; box-sizing: border-box;">
          <div>
            <h3 style="font-size: 14px; font-weight: 600; color: #FFFFFF; margin: 0;">Daily Agenda Review</h3>
            <p style="font-size: 12px; color: #737373; margin: 2px 0 0 0;">Review meeting metrics, target slots, and logged points for ${formattedDateString}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px; color: #A3A3A3;">Focus Target Score:</span>
            <span style="background: #261C14; color: #F59E0B; border: 1px solid #451A03; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 4px;">
              +150 pts Max
            </span>
          </div>
        </header>

        <!-- Events List -->
        <div style="flex: 1; padding: 2rem; display: flex; flex-direction: column; gap: 1rem; box-sizing: border-box; max-width: 900px; width: 100%;">
          ${eventsHtml}
        </div>

        <!-- Footer -->
        <div style="padding: 1.5rem; background: #0D0D0D; border-top: 1px solid #1F1F1F; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #737373; flex-shrink: 0; box-sizing: border-box;">
          <span>Enterprise Integration Core v1.4.2 Active</span>
          <span>Total Logged Points Today: +${dayTotalPoints} pts</span>
        </div>
      </div>
    </div>
  `;

  // Ensure view display classes are active
  calendarView.classList.add("active-view");
  calendarView.style.display = "flex";
}

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", init);
