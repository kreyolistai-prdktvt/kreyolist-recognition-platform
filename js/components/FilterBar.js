/**
 * Creates a DOM node for the filter and sort bar.
 * @param {Object} props
 * @param {string} props.activeCategory - The currently selected category ID.
 * @param {string} props.activeSort - The currently selected sort option ID.
 * @param {Function} props.onCategoryChange - Callback when a category filter is clicked.
 * @param {Function} props.onSortChange - Callback when a sort option is clicked.
 * @returns {HTMLElement} The filter bar element.
 */
export function createFilterBar({ activeCategory, activeSort, onCategoryChange, onSortChange }) {
  const container = document.createElement("div");
  container.className = "filter-bar";

  const categories = [
    { id: "all", label: "All Directory" },
    { id: "employee_appreciation", label: "Employee Appreciation" },
    { id: "team_entertainment", label: "Team Entertainment" },
    { id: "personal_rejuvenation", label: "Personal Rejuvenation" }
  ];

  const sortOptions = [
    { id: "featured", label: "Featured" },
    { id: "name-asc", label: "A – Z" },
    { id: "city", label: "Location" }
  ];

  // Render categories
  const categoryButtons = categories
    .map(
      (cat) => `
    <button class="filter-btn ${activeCategory === cat.id ? "active" : ""}" data-category="${cat.id}">
      <span class="filter-dot"></span>
      ${cat.label}
    </button>
  `
    )
    .join("");

  // Render sorting
  const sortButtons = sortOptions
    .map(
      (opt) => `
    <button class="sort-btn ${activeSort === opt.id ? "active" : ""}" data-sort="${opt.id}">
      ${opt.label}
    </button>
  `
    )
    .join("");

  container.innerHTML = `
    <div class="filter-group">
      <span class="section-label">Filter</span>
      <div class="filter-options">
        ${categoryButtons}
      </div>
    </div>
    <div class="sort-group">
      <span class="section-label">Sort</span>
      <div class="sort-options">
        ${sortButtons}
      </div>
    </div>
  `;

  // Event Listeners
  container.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onCategoryChange(btn.dataset.category);
    });
  });

  container.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onSortChange(btn.dataset.sort);
    });
  });

  return container;
}
