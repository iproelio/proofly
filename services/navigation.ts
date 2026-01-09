
/**
 * Navigation service to handle URL updates without full page reloads.
 * Uses a 'Virtual Params' fallback for environments where pushState is restricted (e.g., blob: URLs).
 */

let virtualParams: Record<string, string | null> = {};

export const getVirtualParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const combined = new URLSearchParams();
  
  // Fill with real URL params
  urlParams.forEach((value, key) => combined.set(key, value));
  
  // Overlay with virtual params
  Object.entries(virtualParams).forEach(([key, value]) => {
    if (value === null) {
      combined.delete(key);
    } else {
      combined.set(key, value);
    }
  });
  
  return combined;
};

export const navigateTo = (params: Record<string, string | null>) => {
  // Update virtual store
  virtualParams = { ...virtualParams, ...params };

  // Best effort: Try to update the real URL
  try {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    // In blob: environments, pushState will throw. We catch it and move on.
    window.history.pushState({}, '', url.toString());
  } catch (e) {
    console.warn("History API restricted in this environment. Using virtual routing.", e);
  }

  // Always dispatch event so App.tsx re-renders
  window.dispatchEvent(new CustomEvent('proofly-nav'));
  window.dispatchEvent(new Event('popstate'));
};

export const clearAllParams = () => {
  virtualParams = {};
  try {
    const url = new URL(window.location.href);
    const keys = Array.from(url.searchParams.keys());
    keys.forEach(k => url.searchParams.delete(k));
    window.history.pushState({}, '', url.toString());
  } catch (e) {
    // Ignore error
  }
  window.dispatchEvent(new CustomEvent('proofly-nav'));
  window.dispatchEvent(new Event('popstate'));
};
