/**
 * Creates and orchestrates the luxury Detail Modal overlay.
 * @param {Object} venue - The selected venue object to display.
 * @param {Function} onClose - Callback function to handle modal closure.
 * @returns {HTMLElement} The modal overlay element.
 */
/**
 * Creates and orchestrates the luxury Detail Modal overlay.
 * @param {Object} venue - The selected venue object to display.
 * @param {Function} onClose - Callback function to handle modal closure.
 * @param {Function} resolveAssetUrl - Async function to resolve Storage URLs.
 * @returns {HTMLElement} The modal overlay element.
 */
export function createDetailModal(venue, onClose, resolveAssetUrl) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "modal-title");

  // Determine visual column HTML structure
  let visualHTML = "";
  if (venue.mosaic) {
    visualHTML = `
      <div class="modal-visual has-mosaic">
        <div class="modal-mosaic-grid">
          ${venue.mosaic.map((img, idx) => `
            <div class="modal-mosaic-item modal-mosaic-loading-placeholder" data-path="${img}">
              <img alt="${venue.name} view ${idx + 1}" class="modal-mosaic-image fade-in-img" loading="lazy" />
            </div>
          `).join("")}
        </div>
        <div class="modal-visual-gradient"></div>
        <div class="modal-visual-meta">
          <span class="modal-badge">${venue.vibe}</span>
          <span class="modal-city">${venue.city}</span>
        </div>
      </div>
    `;
  } else {
    visualHTML = `
      <div class="modal-visual modal-visual-loading-placeholder">
        <div class="modal-visual-gradient"></div>
        <div class="modal-visual-meta">
          <span class="modal-badge">${venue.vibe}</span>
          <span class="modal-city">${venue.city}</span>
        </div>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      
      <div class="modal-grid">
        <!-- Visual Column -->
        ${visualHTML}

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

  // Asynchronously resolve and load image paths
  if (resolveAssetUrl && typeof resolveAssetUrl === "function") {
    if (venue.mosaic) {
      const items = overlay.querySelectorAll(".modal-mosaic-item");
      items.forEach(item => {
        const path = item.dataset.path;
        const img = item.querySelector(".modal-mosaic-image");
        resolveAssetUrl(path).then(url => {
          img.src = url;
          img.onload = () => {
            img.classList.add("loaded");
            item.classList.remove("modal-mosaic-loading-placeholder");
          };
          img.onerror = () => {
            item.classList.remove("modal-mosaic-loading-placeholder");
          };
        }).catch(() => {
          item.classList.remove("modal-mosaic-loading-placeholder");
        });
      });
    } else {
      const visual = overlay.querySelector(".modal-visual");
      resolveAssetUrl(venue.image).then(url => {
        visual.style.backgroundImage = `url('${url}')`;
        visual.classList.remove("modal-visual-loading-placeholder");
      }).catch(() => {
        visual.classList.remove("modal-visual-loading-placeholder");
      });
    }
  } else {
    // Immediate fallback resolver if not provided
    if (venue.mosaic) {
      const items = overlay.querySelectorAll(".modal-mosaic-item");
      items.forEach(item => {
        const path = item.dataset.path;
        const img = item.querySelector(".modal-mosaic-image");
        // Reconstruct local path by getting filename and mapping
        const filename = path.split("/").pop();
        let finalFilename = filename;
        // Fix for name difference in fallback mapping filenames
        if (filename === "main_bg.jpg") {
          finalFilename = `${venue.category}_bg.jpg`;
        } else if (filename === "mosaic_1.jpg") {
          if (venue.id === "savvor-boston") finalFilename = "savvor_food.jpg";
          if (venue.id === "obsidian-ny") finalFilename = "obsidian_jazz.jpg";
          if (venue.id === "aether-sf") finalFilename = "aether_pool.jpg";
        } else if (filename.startsWith("obsidian_")) {
          if (filename === "obsidian_lounge.png") {
            finalFilename = "obsidian_lounge2.png";
          } else {
            finalFilename = filename.replace(".png", ".jpg");
          }
        }
        // General fallback check using a simpler mapper
        const resolvedFallback = `./assets/${finalFilename}`;
        img.src = resolvedFallback;
        img.onload = () => {
          img.classList.add("loaded");
          item.classList.remove("modal-mosaic-loading-placeholder");
        };
        img.onerror = () => {
          // Absolute fallback
          img.src = `./assets/${venue.category}_bg.jpg`;
          img.onload = () => {
            img.classList.add("loaded");
            item.classList.remove("modal-mosaic-loading-placeholder");
          };
        };
      });
    } else {
      const visual = overlay.querySelector(".modal-visual");
      visual.style.backgroundImage = `url('./assets/${venue.category}_bg.jpg')`;
      visual.classList.remove("modal-visual-loading-placeholder");
    }
  }

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
  const submitBtn = form.querySelector(".submit-btn");
  const successSection = overlay.querySelector("#success-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Lock submit button and show spinner
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner"></span> Sending Curation Request...`;

    // Lock input fields
    const inputs = form.querySelectorAll("input");
    inputs.forEach(input => input.disabled = true);

    // Simulate network communication latency
    setTimeout(() => {
      form.style.opacity = "0";
      setTimeout(() => {
        form.style.display = "none";
        successSection.style.display = "block";
        setTimeout(() => {
          successSection.classList.add("show");
        }, 50);
      }, 300);
    }, 1500);
  });

  return overlay;
}
