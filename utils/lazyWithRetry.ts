
import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * A wrapper around React.lazy that attempts to reload the page if a chunk fails to load.
 * This handles "ChunkLoadError" or "Loading chunk X failed" which happens when a user
 * navigates to an old version of the app after a new deployment.
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): LazyExoticComponent<T> => {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      // If load succeeds, reset the flag so future errors can trigger a refresh if needed
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error: any) {
      console.error('Lazy load error:', error);
      
      // Check if the error is related to loading chunks (network error or version mismatch)
      const isChunkLoadError = 
        error.name === 'ChunkLoadError' || 
        error.message?.includes('Loading chunk') ||
        error.message?.includes('missing');

      if (isChunkLoadError && !pageHasAlreadyBeenForceRefreshed) {
        // Set flag to prevent infinite reload loops
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        // Reload page to fetch the latest index.html and fresh chunks
        window.location.reload();
        // Return a never-resolving promise to wait for the reload
        return new Promise(() => {}); 
      }

      // If already refreshed or not a chunk error, propagate the error
      throw error;
    }
  });
};
