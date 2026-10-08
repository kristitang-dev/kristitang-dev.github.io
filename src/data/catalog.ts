import { albums, notebooks } from './bookshelf'
import { type CatalogEntry, type PlacedEntry } from './entry'
import { sandboxEntries } from './sandbox'

function place(entries: CatalogEntry[], home: PlacedEntry['home']): PlacedEntry[] {
  return entries.map((entry) => ({ ...entry, home }))
}

/** Every Sandbox and Bookshelf item, for /garden/:id detail routes. */
const catalog: PlacedEntry[] = [
  ...place(sandboxEntries, 'sandbox'),
  ...place(notebooks, 'bookshelf'),
  ...place(albums, 'bookshelf'),
]

export function getCatalogEntry(id: string) {
  return catalog.find((item) => item.id === id)
}
