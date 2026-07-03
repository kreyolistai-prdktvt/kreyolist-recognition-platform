/**
 * Creates and orchestrates the luxury Detail Modal overlay.
 * @param {Object} venue - The selected venue object to display.
 * @param {Function} onClose - Callback function to handle modal closure.
 * @returns {HTMLElement} The modal overlay element.
 */
export function createDetailModal(venue, onClose) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "modal-title");

  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      
      <div class="modal-grid">
        <!-- Visual Column -->
        <div class="modal-visual ${venue.mosaic ? "has-mosaic" : ""}" ${venue.mosaic ? "" : `style="background-image: url('${venue.image}')"`}>
          ${venue.mosaic ? `
            <div class="modal-mosaic-grid">
              ${venue.mosaic.map(img => `
                <div class="modal-mosaic-item">
                  <img src="${img}" alt="${venue.name} view" class="modal-mosaic-image" loading="lazy" />
                </div>
              `).join("")}
            </div>
          ` : ""}
          <div class="modal-visual-gradient"></div>
          <div class="modal-visual-meta">
            <span class="modal-badge">${venue.vibe}</span>
            <span class="modal-city">${venue.city}</span>
          </div>
        </div>

        <!-- Details Column -->
        <div class="modal-info">
          <span class="modal-category">${venue.categoryLabel}</span>
          <h2 id="modal-title" class="modal-title">${venue.name}</h2>
          
          <p class="modal-tagline">“${venue.tagline}”</p>
          <p class="modal-description">${venue.description}</p>
          
          <div class="modal-section">
            <h4 class="modal-section-title">Bespoke Curation Highlights</h4>
            <ul class="modal-highlights">
              ${venue.highlights.map(h => `<li>${h}</li>`).join("")}
            </ul>
          </div>

          <div class="modal-section inquiry-form-section">
            <h4 class="modal-section-title">Inquire for Bespoke Corporate Curation</h4>
            <form class="inquiry-form" id="inquiry-form">
              <div class="form-row">
                <input type="text" placeholder="Full Name" required />
                <input type="email" placeholder="Corporate Email" required />
              </div>
              <div class="form-row">
                <input type="number" placeholder="Estimated Guest Count" min="1" required />
                <input type="date" required min="${new Date().toISOString().split("T")[0]}" />
              </div>
              <button type="submit" class="submit-btn">Request Custom Itinerary</button>
            </form>
            <div class="success-message" id="success-message" style="display: none;">
              <div class="success-icon">✦</div>
              <h5 class="success-title">Experience Curation Requested</h5>
              <p class="success-text">Our Concierge has received your request. A custom, print-ready proposal will arrive in your inbox shortly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Animate open
  setTimeout(() => {
    overlay.classList.add("open");
  }, 10);

  // Close handlers
  const close = () => {
    overlay.classList.remove("open");
    setTimeout(() => {
      onClose();
    }, 400); // match transition duration
  };

  overlay.querySelector(".modal-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  // Handle escape key
  const keyHandler = (e) => {
    if (e.key === "Escape") {
      close();
    }
  };
  document.addEventListener("keydown", keyHandler);

  // Cleanup key listener when modal is destroyed
  overlay.destroy = () => {
    document.removeEventListener("keydown", keyHandler);
  };

  // Handle Inquiry Form Submission
  const form = overlay.querySelector("#inquiry-form");
  const successSection = overlay.querySelector("#success-message");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.style.opacity = "0";
    setTimeout(() => {
      form.style.display = "none";
      successSection.style.display = "block";
      setTimeout(() => {
        successSection.classList.add("show");
      }, 50);
    }, 300);
  });

  return overlay;
}
