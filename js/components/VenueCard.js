/**
 * Creates a DOM node for a single venue tile card.
 * @param {Object} venue - The venue data object.
 * @param {Function} onClick - The callback function when the card is clicked.
 * @returns {HTMLElement} The venue card element.
 */
export function createVenueCard(venue, onClick) {
  const card = document.createElement("div");
  card.className = "venue-card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `View details for ${venue.name}`);
  card.dataset.id = venue.id;
  card.dataset.category = venue.category;

  card.innerHTML = `
    <div class="venue-card-visual">
      <img src="${venue.image}" alt="${venue.name}" class="venue-card-image" loading="lazy" />
      <div class="venue-card-overlay"></div>
      <div class="venue-card-badge-container">
        <span class="venue-card-badge">${venue.vibe}</span>
      </div>
    </div>
    <div class="venue-card-info">
      <div class="venue-card-top-content">
        <div class="venue-card-header-row">
          <span class="venue-card-category-wrapper">
            <span class="venue-card-category">${venue.categoryLabel}</span>
            ${venue.suggested_time ? `
              <span class="venue-card-divider">•</span>
              <span class="venue-card-time">${venue.suggested_time}</span>
            ` : ''}
          </span>
          <span class="venue-card-city-wrapper">
            <svg class="venue-card-map-pin" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span class="venue-card-city">${venue.city}</span>
          </span>
        </div>
        <h3 class="venue-card-name">${venue.name}</h3>
        <p class="venue-card-tagline">“${venue.tagline}”</p>
      </div>
      <div class="venue-card-action">
        <span>Explore Selection</span>
        <svg class="venue-card-action-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"/>
        </svg>
      </div>
    </div>
  `;

  // Click handlers
  card.addEventListener("click", () => onClick(venue));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(venue);
    }
  });

  return card;
}
