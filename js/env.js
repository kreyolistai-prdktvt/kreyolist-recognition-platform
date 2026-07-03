/**
 * Dynamically fetches and parses the project's `.env.local` file at runtime.
 * This pattern allows Vanilla ES Modules in static web applications to handle
 * local configuration variables without compiling/bundling.
 * @returns {Promise<Object>} An object containing the parsed environment variables.
 */
export async function loadEnv() {
  const env = {};
  try {
    const response = await fetch('/.env.local');
    if (!response.ok) {
      throw new Error(`HTTP status: ${response.status}`);
    }
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines or comments
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = trimmed.slice(0, equalIndex).trim();
      let value = trimmed.slice(equalIndex + 1).trim();
      
      // Strip optional quotes surrounding values
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      env[key] = value;
    }
  } catch (error) {
    console.warn("[KreyoList Env] Could not load .env.local; falling back to local mock variables.", error);
  }
  
  return env;
}
