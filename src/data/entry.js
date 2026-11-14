export function getEntryKindLabel(item) {
    return item.kinds.join(' · ');
}
export function getEntryHome(item) {
    if (item.home === 'sandbox') {
        return { label: 'Work', overlay: 'laptop' };
    }
    if (item.kinds.includes('photography') || item.kinds.includes('video')) {
        return { label: 'Photography', overlay: 'camera' };
    }
    return { label: 'Research', overlay: 'bookshelf' };
}
