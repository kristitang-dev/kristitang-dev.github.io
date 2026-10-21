export function getEntryKindLabel(item) {
    return item.kinds.join(' · ');
}
export function getEntryHome(item) {
    return item.home === 'bookshelf'
        ? { label: 'Bookshelf', section: 'bookshelf' }
        : { label: 'Sandbox', section: 'sandbox' };
}
