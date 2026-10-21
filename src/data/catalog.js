import { albums, notebooks } from './bookshelf';
import {} from './entry';
import { sandboxEntries } from './sandbox';
function place(entries, home) {
    return entries.map((entry) => ({ ...entry, home }));
}
/** Every Sandbox and Bookshelf item, for /garden/:id detail routes. */
const catalog = [
    ...place(sandboxEntries, 'sandbox'),
    ...place(notebooks, 'bookshelf'),
    ...place(albums, 'bookshelf'),
];
export function getCatalogEntry(id) {
    return catalog.find((item) => item.id === id);
}
