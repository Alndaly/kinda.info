'use client';

import { createContext, useContext } from 'react';

/**
 * Every figure in a document belongs to one album, so the viewer can page
 * through them. The list is built from the document itself rather than from
 * mount order — tiptap renders node views through portals, so a registry fed by
 * mount order would end up shuffled.
 *
 * Lives in its own module because both the content component and the image node
 * need it, and importing across those two would be a cycle.
 */
export const GalleryContext = createContext<{ open: (src: string) => void } | null>(null);

export function useDocumentGallery() {
  return useContext(GalleryContext);
}
