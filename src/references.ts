import { Listing } from "./articleListings";

/**
 * window[listingRef] points to Main Article Listing ("/") if it active
 */
export const listingRef = Symbol();

export function getListingInstance(): Listing | null {
	return (window as any)[listingRef] || null;
}
