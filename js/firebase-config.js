import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

let app = null;
let storage = null;
let isConfigured = false;

/**
 * Initializes the Firebase Web SDK.
 * @param {Object} env - Loaded environment variables.
 * @returns {boolean} True if initialization succeeded.
 */
export function initializeFirebase(env) {
  if (!env.FIREBASE_API_KEY || 
      env.FIREBASE_API_KEY.includes("your_api_key") || 
      env.FIREBASE_API_KEY.includes("PLACEHOLDER")) {
    console.log("[Firebase Config] API key is missing or has placeholder values. Operating in local fallback mode.");
    return false;
  }

  try {
    const firebaseConfig = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID
    };

    app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    isConfigured = true;
    console.log("[Firebase Config] Successfully connected to project: " + env.FIREBASE_PROJECT_ID);
    return true;
  } catch (error) {
    console.error("[Firebase Config] Connection failed:", error);
    return false;
  }
}

const fallbacks = {
  // Savvor
  "venues/savvor/savvor_lounge.jpg": "./assets/savvor_lounge.jpg",
  "venues/savvor/savvor_food.jpg": "./assets/savvor_food.jpg",
  "venues/savvor/savvor_cocktails.jpg": "./assets/savvor_cocktails.jpg",
  "venues/savvor/savvor_boston_skyline.jpg": "./assets/savvor_boston_skyline.jpg",

  // The Obsidian Room
  "venues/obsidian-room/obsidian_lounge.png": "./assets/obsidian_lounge2.png",
  "venues/obsidian-room/obsidian_jazz.png": "./assets/obsidian_jazz.jpg",
  "venues/obsidian-room/obsidian_tasting.png": "./assets/obsidian_tasting.jpg",
  "venues/obsidian-room/obsidian_skyline.png": "./assets/obsidian_skyline.jpg",

  // Aether Wellness Canopy
  "venues/aether-sf/main_bg.jpg": "./assets/personal_rejuvenation_bg.jpg",
  "venues/aether-sf/mosaic_1.jpg": "./assets/aether_pool.jpg",
  "venues/aether-sf/mosaic_2.jpg": "./assets/aether_yoga.jpg",
  "venues/aether-sf/mosaic_3.jpg": "./assets/aether_tea.jpg",
  "venues/aether-sf/mosaic_4.jpg": "./assets/aether_forest.jpg",

  // L'Horizon Rooftop
  "venues/horizon-miami/main_bg.jpg": "./assets/employee_appreciation_bg.jpg",
  "venues/horizon-miami/mosaic_1.jpg": "./assets/horizon_yacht.jpg",
  "venues/horizon-miami/mosaic_2.jpg": "./assets/horizon_seafood.jpg",
  "venues/horizon-miami/mosaic_3.jpg": "./assets/horizon_sunset.jpg",
  "venues/horizon-miami/mosaic_4.jpg": "./assets/horizon_champagne.jpg",

  // Hearthstone
  "venues/hearthstone-chicago/main_bg.jpg": "./assets/team_entertainment_bg.jpg",
  "venues/hearthstone-chicago/mosaic_1.jpg": "./assets/hearthstone_glass.jpg",
  "venues/hearthstone-chicago/mosaic_2.jpg": "./assets/hearthstone_gastronomy.jpg",
  "venues/hearthstone-chicago/mosaic_3.jpg": "./assets/hearthstone_skyline.jpg",
  "venues/hearthstone-chicago/mosaic_4.jpg": "./assets/hearthstone_interior.jpg",

  // Soma
  "venues/soma-seattle/main_bg.jpg": "./assets/personal_rejuvenation_bg.jpg",
  "venues/soma-seattle/mosaic_1.jpg": "./assets/soma_sauna.jpg",
  "venues/soma-seattle/mosaic_2.jpg": "./assets/soma_plunge.jpg",
  "venues/soma-seattle/mosaic_3.jpg": "./assets/soma_forest.jpg",
  "venues/soma-seattle/mosaic_4.jpg": "./assets/soma_firepit.jpg",

  // Elysium
  "venues/elysium-la/main_bg.jpg": "./assets/team_entertainment_bg.jpg",
  "venues/elysium-la/mosaic_1.jpg": "./assets/elysium_vinyl.jpg",
  "venues/elysium-la/mosaic_2.jpg": "./assets/elysium_speaker.jpg",
  "venues/elysium-la/mosaic_3.jpg": "./assets/elysium_cocktail.jpg",
  "venues/elysium-la/mosaic_4.jpg": "./assets/elysium_skyline.jpg",

  // Brass Botanist
  "venues/brass-denver/main_bg.jpg": "./assets/employee_appreciation_bg.jpg",
  "venues/brass-denver/mosaic_1.jpg": "./assets/brass_greenhouse.jpg",
  "venues/brass-denver/mosaic_2.jpg": "./assets/brass_mixology.jpg",
  "venues/brass-denver/mosaic_3.jpg": "./assets/brass_plate.jpg",
  "venues/brass-denver/mosaic_4.jpg": "./assets/brass_mountains.jpg",

  // Komorebi
  "venues/komorebi-portland/main_bg.jpg": "./assets/personal_rejuvenation_bg.jpg",
  "venues/komorebi-portland/mosaic_1.jpg": "./assets/komorebi_matcha.jpg",
  "venues/komorebi-portland/mosaic_2.jpg": "./assets/komorebi_garden.jpg",
  "venues/komorebi-portland/mosaic_3.jpg": "./assets/komorebi_tatami.jpg",
  "venues/komorebi-portland/mosaic_4.jpg": "./assets/komorebi_waterfall.jpg",

  // Gilded Foundry
  "venues/gilded-austin/main_bg.jpg": "./assets/team_entertainment_bg.jpg",
  "venues/gilded-austin/mosaic_1.jpg": "./assets/gilded_leather.jpg",
  "venues/gilded-austin/mosaic_2.jpg": "./assets/gilded_whiskey.jpg",
  "venues/gilded-austin/mosaic_3.jpg": "./assets/gilded_foundry.jpg",
  "venues/gilded-austin/mosaic_4.jpg": "./assets/gilded_austin.jpg",

  // Nox Observatory
  "venues/nox-phoenix/main_bg.jpg": "./assets/employee_appreciation_bg.jpg",
  "venues/nox-phoenix/mosaic_1.jpg": "./assets/nox_telescope.jpg",
  "venues/nox-phoenix/mosaic_2.jpg": "./assets/nox_campfire.jpg",
  "venues/nox-phoenix/mosaic_3.jpg": "./assets/nox_dome.jpg",
  "venues/nox-phoenix/mosaic_4.jpg": "./assets/nox_skyline.jpg",

  // Verdant Escape
  "venues/verdant-atlanta/main_bg.jpg": "./assets/personal_rejuvenation_bg.jpg",
  "venues/verdant-atlanta/mosaic_1.jpg": "./assets/verdant_singing_bowls.jpg",
  "venues/verdant-atlanta/mosaic_2.jpg": "./assets/verdant_oxygen.jpg",
  "venues/verdant-atlanta/mosaic_3.jpg": "./assets/verdant_juice.jpg",
  "venues/verdant-atlanta/mosaic_4.jpg": "./assets/verdant_canopy.jpg",

  // Velvet & Vine
  "venues/velvet-napa/main_bg.jpg": "./assets/employee_appreciation_bg.jpg",
  "venues/velvet-napa/mosaic_1.jpg": "./assets/velvet_wine_blend.jpg",
  "venues/velvet-napa/mosaic_2.jpg": "./assets/velvet_barrels.jpg",
  "venues/velvet-napa/mosaic_3.jpg": "./assets/velvet_vineyard.jpg",
  "venues/velvet-napa/mosaic_4.jpg": "./assets/velvet_cellar_dining.jpg",

  // Kinetic Studio
  "venues/kinetic-vegas/main_bg.jpg": "./assets/team_entertainment_bg.jpg",
  "venues/kinetic-vegas/mosaic_1.jpg": "./assets/kinetic_simulator.jpg",
  "venues/kinetic-vegas/mosaic_2.jpg": "./assets/kinetic_telemetry.jpg",
  "venues/kinetic-vegas/mosaic_3.jpg": "./assets/kinetic_champagne.jpg",
  "venues/kinetic-vegas/mosaic_4.jpg": "./assets/kinetic_skyline.jpg",

  // Sanctuary of Wind
  "venues/wind-santafe/main_bg.jpg": "./assets/personal_rejuvenation_bg.jpg",
  "venues/wind-santafe/mosaic_1.jpg": "./assets/sanctuary_sage.jpg",
  "venues/wind-santafe/mosaic_2.jpg": "./assets/sanctuary_mud.jpg",
  "venues/wind-santafe/mosaic_3.jpg": "./assets/sanctuary_pergola.jpg",
  "venues/wind-santafe/mosaic_4.jpg": "./assets/sanctuary_cliffs.jpg"
};

/**
 * Resolves a storage bucket path to a dynamic download URL.
 * Falls back to returning the local asset path if Firebase is not active.
 * @param {string} storagePath - The relative path inside the bucket (e.g. 'venues/savvor-boston/mosaic_1.jpg')
 * @returns {Promise<string>} A promise resolving to the public asset URL.
 */
export async function getAssetUrl(storagePath) {
  const localFallback = fallbacks[storagePath] || "./assets/employee_appreciation_bg.jpg";
  if (!isConfigured || !storage) {
    return localFallback;
  }

  try {
    const assetRef = ref(storage, storagePath);
    return await getDownloadURL(assetRef);
  } catch (error) {
    console.warn(`[Firebase Storage] Fetch failed for "${storagePath}". Falling back to "${localFallback}"`, error);
    return localFallback;
  }
}
