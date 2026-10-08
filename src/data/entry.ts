import type {
  DetailGalleryBlock,
  DetailGalleryLayout,
} from '../components/DetailPage/DetailPage'

export type EntryKind = 'photography' | 'game' | 'video' | 'code' | 'writing'

export type EntryHome = 'sandbox' | 'bookshelf'

/** Shared shape for Sandbox experiments and Bookshelf notebooks/albums. */
export interface CatalogEntry {
  id: string
  title: string
  kinds: EntryKind[]
  description: string
  image?: string
  link?: string
  linkLabel?: string
  /** Detail-page label when it should differ from the card link */
  detailLinkLabel?: string
  /** Small icon shown beside the detail-page link */
  linkIcon?: string
  /** Card (and its detail route) open `link` instead of the detail page */
  redirect?: boolean
  /** Longer detail-page copy */
  body: Array<
    | string
    | { type: 'image'; src: string; caption?: string; scale?: number }
    | { type: 'images'; images: { src: string; caption?: string }[] }
    | {
        type: 'split'
        text: string
        image: string
        caption?: string
        layout?: 'text-image' | 'image-text'
      }
  >
  /** Simple single gallery (games scroll strip, etc.) */
  gallery?: string[]
  galleryTitle?: string
  galleryLayout?: DetailGalleryLayout
  /**
   * Mix layouts on one detail page, e.g. 2x1 then 1x1 then 3x1.
   * Prefer this for photography series.
   */
  galleryBlocks?: DetailGalleryBlock[]
  /** Dated markdown posts in src/content/<id>/ */
  blog?: boolean
  /** Shorter name for a notebook label */
  courseLabel?: string
  /** Small picture taped to a notebook cover */
  notebookCover?: string
}

export interface PlacedEntry extends CatalogEntry {
  home: EntryHome
}

export function getEntryKindLabel(item: CatalogEntry) {
  return item.kinds.join(' · ')
}

export function getEntryHome(item: PlacedEntry) {
  return item.home === 'bookshelf'
    ? { label: 'Bookshelf', section: 'bookshelf' }
    : { label: 'Sandbox', section: 'sandbox' }
}
