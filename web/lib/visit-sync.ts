export const VISITS_UPDATED_EVENT = 'artinerary-visits-updated';

export const notifyVisitsUpdated = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(VISITS_UPDATED_EVENT));
};
