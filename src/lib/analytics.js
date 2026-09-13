/**
 * StudySpace Lightweight Analytics Utility
 * Supports event tracking, page view logging, and error telemetry.
 * Compatible with Google Analytics (gtag), Plausible, PostHog, or custom loggers.
 */

export const trackEvent = (eventName, eventParams = {}) => {
  try {
    // Google Analytics (window.gtag)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
    // Plausible
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: eventParams });
    }
    // Console log fallback in development
    if (import.meta.env?.DEV) {
      console.log(`[Analytics Event] ${eventName}`, eventParams);
    }
  } catch (err) {
    console.warn('[Analytics Error]', err);
  }
};

export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_path: typeof window !== 'undefined' ? window.location.hash || '/' : '/',
  });
};

export const trackError = (errorDescription, fatal = false) => {
  trackEvent('exception', {
    description: errorDescription,
    fatal,
  });
};

export default {
  trackEvent,
  trackPageView,
  trackError,
};
