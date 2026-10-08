const TOUR_STORAGE_PREFIX = "money-handler-tour-seen";

export function tourStorageKey(userId: string) {
    return `${TOUR_STORAGE_PREFIX}:${userId}`;
}

export function hasSeenTour(userId: string) {
    if (typeof window === "undefined") {
        return true;
    }
    return window.localStorage.getItem(tourStorageKey(userId)) === "1";
}

export function markTourSeen(userId: string) {
    window.localStorage.setItem(tourStorageKey(userId), "1");
}
