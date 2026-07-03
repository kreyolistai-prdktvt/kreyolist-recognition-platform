import { venues } from "./data.js?v=1.0.2";
import { createFilterBar } from "./components/FilterBar.js?v=1.0.2";
import { createVenueCard } from "./components/VenueCard.js?v=1.0.2";
import { createDetailModal } from "./components/DetailModal.js?v=1.0.2";
import { loadEnv } from "./env.js?v=1.0.2";

// Global App State
const state = {
  activeCategory: "all",
  activeSort: "featured",
  openVenue: null,
  modalElement: null,
  firebaseConfigured: false
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
async function resolveVenueAssets() {
  if (!getAssetUrlFn) return;
  const promises = venues.map(async (venue) => {
    // 1. Resolve main category/background image
    const mainStoragePath = `venues/${venue.id}/main_bg.jpg`;
    venue.image = await getAssetUrlFn(mainStoragePath, venue.image);

    // 2. Resolve visual mosaic collage images (2x2)
    if (venue.mosaic && venue.mosaic.length > 0) {
      const resolvedMosaic = await Promise.all(
        venue.mosaic.map(async (localPath, idx) => {
          const storagePath = `venues/${venue.id}/mosaic_${idx + 1}.jpg`;
          return await getAssetUrlFn(storagePath, localPath);
        })
      );
      venue.mosaic = resolvedMosaic;
    }
  });

  await Promise.all(promises);
}

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
    const firebaseModule = await import("./firebase-config.js");
    initializeFirebaseFn = firebaseModule.initializeFirebase;
    getAssetUrlFn = firebaseModule.getAssetUrl;
    
    state.firebaseConfigured = initializeFirebaseFn(env);
    
    if (state.firebaseConfigured) {
      await resolveVenueAssets();
    }
  } catch (error) {
    console.warn("[KreyoList] Firebase SDK failed to load. Running in local fallback mode.", error);
  }

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
  // If 'featured', we preserve the curated order in data.js

  // 3. Render cards or empty state
  if (filtered.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <h3 class="empty-state-title">No Venues Found</h3>
      <p class="empty-state-text">Select another category or check back later for newly curated spaces.</p>
    `;
    dom.gridContainer.appendChild(emptyState);
    return;
  }

  // Append cards
  filtered.forEach(venue => {
    const card = createVenueCard(venue, (selectedVenue) => {
      setState({ openVenue: selectedVenue });
    });
    dom.gridContainer.appendChild(card);
  });
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
    });
    
    dom.modalContainer.appendChild(state.modalElement);
  }
}

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", init);
