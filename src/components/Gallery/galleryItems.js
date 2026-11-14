import { sandboxEntries } from '../../data/sandbox';
import { workItems } from '../../data/work';
import { getPost } from '../../content/loadPosts';
const kindLabel = {
    code: 'Code',
    game: 'Game',
    photography: 'Photography',
    video: 'Video',
    writing: 'Writing',
};
const quiet = new Set(['somo', 'bubblebright']);
const previewTags = {
    graintwin: ['Human–Machine Interaction', 'MR', 'Apple Vision Pro'],
    'endangered-animal': ['Material'],
    'lens-of-bias': ['VR', 'Game', 'Unreal Engine'],
    'time-capsule': ['Three.js', 'Material'],
    bubblebright: ['Game', 'Unity'],
    nutrisynth: ['AI × Interaction', 'Game'],
    somo: ['Wearable'],
    'time-space-clock': ['P5.js'],
    halftone: ['P5.js'],
};
const sortFromTag = {
    MR: 'mr-vr',
    VR: 'mr-vr',
    Game: 'game',
    Material: 'material',
    'Three.js': 'code',
    'P5.js': 'code',
};
function sortsFor(id) {
    const groups = (previewTags[id] ?? []).map((tag) => sortFromTag[tag]).filter((group) => group != null);
    return [...new Set(groups)];
}
export const gallerySorts = [
    { id: 'all', label: 'All' },
    { id: 'mr-vr', label: 'MR/VR' },
    { id: 'game', label: 'Game' },
    { id: 'material', label: 'Material' },
    { id: 'code', label: 'Code' },
];
const heroGallery = {
    nutrisynth: {
        still: '/images/NutriSynth.png',
        motion: '/images/herogallery/LLM%20AI%20Native%20Game%20-%20NutriSynth.gif',
    },
    'lens-of-bias': {
        still: '/images/lens-of-bias.jpg',
        motion: '/images/herogallery/Trimmed_Through.gif',
    },
};
const studioPosts = ['endangered-animal', 'time-capsule']
    .map((slug) => getPost('ideation-prototyping', slug))
    .filter((post) => post != null);
export const galleryCards = [
    ...workItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        previewTags: previewTags[item.id],
        sorts: sortsFor(item.id),
        image: heroGallery[item.id]?.still ?? item.detailImage ?? item.image,
        motion: heroGallery[item.id]?.motion,
        categories: item.categories,
        to: `/work/${item.id}`,
        quiet: quiet.has(item.id),
    })),
    ...sandboxEntries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        tags: entry.kinds.map((kind) => kindLabel[kind] ?? kind),
        previewTags: previewTags[entry.id],
        sorts: sortsFor(entry.id),
        image: entry.image,
        preview: entry.image ? undefined : entry.preview,
        to: `/garden/${entry.id}`,
        quiet: quiet.has(entry.id),
    })),
    ...studioPosts.map((post) => ({
        id: post.slug,
        title: post.title,
        description: post.excerpt ?? '',
        tags: post.slug === 'time-capsule'
            ? ['Form', 'Material', 'Three.js']
            : post.slug === 'endangered-animal'
                ? ['Form', 'Material']
                : ['Ideation & Prototyping'],
        previewTags: previewTags[post.slug],
        sorts: sortsFor(post.slug),
        image: post.slug === 'time-capsule'
            ? '/images/herogallery/Misinterpretation.gif'
            : post.slug === 'endangered-animal'
                ? '/images/herogallery/endangered-animal.png'
                : post.cover,
        contain: post.slug === 'endangered-animal',
        to: `/garden/${post.series}/${post.slug}`,
    })),
];
export function getGalleryCard(id) {
    return galleryCards.find((card) => card.id === id);
}
export function galleryCardMatches(card, query) {
    const needle = query.trim().toLowerCase();
    if (!needle)
        return true;
    const haystack = [card.title, card.description, ...card.tags, ...(card.previewTags ?? [])]
        .join(' ')
        .toLowerCase();
    return haystack.includes(needle);
}
