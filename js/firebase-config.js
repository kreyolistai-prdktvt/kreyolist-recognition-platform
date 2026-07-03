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

/**
 * Resolves a storage bucket path to a dynamic download URL.
 * Falls back to returning the local asset path if Firebase is not active.
 * @param {string} storagePath - The relative path inside the bucket (e.g. 'venues/savvor-boston/mosaic_1.jpg')
 * @param {string} localFallback - The local asset URL to fall back to.
 * @returns {Promise<string>} A promise resolving to the public asset URL.
 */
export async function getAssetUrl(storagePath, localFallback) {
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
