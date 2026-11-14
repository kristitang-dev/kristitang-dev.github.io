import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { albums, notebooks } from '../../data/bookshelf';
import { galleryCardMatches, galleryCards, gallerySorts, getGalleryCard } from '../Gallery/galleryItems';
import { researchItems, researchKindLabels } from '../../data/research';
import { dismissGallery, rememberReturnPlace, useSpatialStore, } from '../../store/spatialStore';
import { DiscoGallery, galleryDragged, onGalleryVoid, ProjectTile } from '../Gallery/DiscoGallery';
import './SpatialLayer.css';
const filmNotes = {
    breath: 'Rural China',
    'chongqing-2023ss': 'Chongqing',
};
function stills() {
    const frames = [];
    const seen = new Set();
    for (const album of albums) {
        const sources = [album.image];
        for (const block of album.galleryBlocks ?? []) {
            for (const image of block.images) {
                sources.push(typeof image === 'string' ? image : image.src);
            }
        }
        for (const src of sources) {
            if (!src || seen.has(src))
                continue;
            seen.add(src);
            frames.push({ src, albumId: album.id, title: album.title, note: filmNotes[album.id] });
        }
    }
    return frames;
}
function filmRows(frames, count = 3) {
    const rows = Array.from({ length: count }, () => []);
    frames.forEach((frame, index) => rows[index % count].push(frame));
    return rows;
}
const filmStills = stills();
function overlayReturn(path) {
    const overlay = useSpatialStore.getState().activeOverlay;
    const place = overlay ? { kind: 'overlay', overlay } : null;
    return {
        state: place ? { from: place } : undefined,
        onClick: () => {
            if (place)
                rememberReturnPlace(path, place);
            useSpatialStore.getState().closeOverlay();
        },
    };
}
function AbstractPanel({ tidy }) {
    const activeProjectId = useSpatialStore((state) => state.activeProjectId);
    const item = activeProjectId ? getGalleryCard(activeProjectId) : undefined;
    const panel = useRef(null);
    const skipIntro = useRef(true);
    const [spot, setSpot] = useState({ left: 0, top: 0, width: 280 });
    useEffect(() => {
        if (!item || tidy)
            return;
        let frame = 0;
        const place = () => {
            frame = requestAnimationFrame(place);
            const host = panel.current?.closest('.spatial-laptop');
            if (!host || !panel.current)
                return;
            const anchor = document.querySelector(`[data-project-id="${CSS.escape(item.id)}"]`);
            if (!anchor)
                return;
            const bounds = host.getBoundingClientRect();
            const margin = 44;
            const width = Math.min(280, bounds.width - margin * 2);
            const height = panel.current.offsetHeight;
            const card = anchor.getBoundingClientRect();
            let left = card.right - bounds.left + margin;
            let top = card.top - bounds.top + card.height * 0.12;
            if (left + width > bounds.width - margin)
                left = card.left - bounds.left - width - margin;
            if (left < margin) {
                left = Math.min(Math.max(margin, card.left - bounds.left), bounds.width - width - margin);
                top = card.bottom - bounds.top + margin;
                if (top + height > bounds.height - margin)
                    top = card.top - bounds.top - height - margin;
            }
            top = Math.min(Math.max(margin, top), Math.max(margin, bounds.height - height - margin));
            left = Math.min(Math.max(margin, left), Math.max(margin, bounds.width - width - margin));
            setSpot((current) => (Math.abs(current.left - left) < 0.5
                && Math.abs(current.top - top) < 0.5
                && current.width === width
                ? current
                : { left, top, width }));
        };
        place();
        return () => cancelAnimationFrame(frame);
    }, [item, tidy]);
    useEffect(() => {
        const node = panel.current;
        if (!node)
            return;
        if (skipIntro.current) {
            skipIntro.current = false;
            return;
        }
        node.style.animation = 'none';
        void node.offsetWidth;
        node.style.animation = '';
    }, [item?.id, tidy]);
    if (!item)
        return null;
    return (_jsxs("aside", { ref: panel, className: "spatial-glass spatial-abstract", style: tidy ? undefined : { left: spot.left, top: spot.top, width: spot.width }, children: [tidy && _jsx("h2", { className: "spatial-abstract__title", children: item.title }), _jsx("p", { className: "spatial-abstract__body", children: item.description }), item.tags.length > 0 && (_jsx("ul", { className: "spatial-abstract__tags", children: item.tags.map((tag) => (_jsx("li", { children: tag }, tag))) })), _jsx(Link, { className: "spatial-abstract__cta", to: item.to, ...overlayReturn(item.to), children: "View project" })] }));
}
function LaptopLayer({ exiting = false }) {
    const [query, setQuery] = useState('');
    const [still, setStill] = useState(false);
    const [gridMounted, setGridMounted] = useState(false);
    const [gridOn, setGridOn] = useState(false);
    const [group, setGroup] = useState('all');
    const [sortOpen, setSortOpen] = useState(false);
    const sortMenu = useRef(null);
    const cards = galleryCards.filter((card) => {
        if (!galleryCardMatches(card, query))
            return false;
        if (!still || group === 'all')
            return true;
        return card.sorts?.includes(group) ?? false;
    });
    const cardIds = cards.map((card) => card.id).join('\n');
    useEffect(() => {
        const ids = cardIds ? cardIds.split('\n') : [];
        const activeId = useSpatialStore.getState().activeProjectId;
        if (activeId && ids.includes(activeId))
            return;
        if (still && ids[0]) {
            useSpatialStore.getState().setActiveProject(ids[0]);
            return;
        }
        if (activeId)
            useSpatialStore.getState().setActiveProject(null);
    }, [still, cardIds]);
    useEffect(() => {
        if (still) {
            setGridMounted(true);
            setGridOn(true);
            return;
        }
        setGridOn(false);
        setSortOpen(false);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = window.setTimeout(() => setGridMounted(false), reduce ? 0 : 620);
        return () => window.clearTimeout(timer);
    }, [still]);
    useEffect(() => {
        if (!sortOpen)
            return;
        const close = (event) => {
            if (!sortMenu.current?.contains(event.target))
                setSortOpen(false);
        };
        const onKey = (event) => {
            if (event.key !== 'Escape')
                return;
            event.stopImmediatePropagation();
            setSortOpen(false);
        };
        window.addEventListener('pointerdown', close);
        window.addEventListener('keydown', onKey, true);
        return () => {
            window.removeEventListener('pointerdown', close);
            window.removeEventListener('keydown', onKey, true);
        };
    }, [sortOpen]);
    return (_jsx("div", { className: `spatial-laptop${still ? ' is-tidy' : ''}`, children: _jsxs("div", { className: "spatial-gallery", onClick: (event) => {
                if (exiting)
                    return;
                const target = event.target;
                if (target.closest('.disco-tile, .spatial-tools, .spatial-search, .spatial-abstract, a, button'))
                    return;
                if (galleryDragged())
                    return;
                onGalleryVoid(still);
            }, children: [_jsxs("div", { className: "spatial-tools", children: [_jsx("button", { type: "button", className: `spatial-layout${still ? ' is-active' : ''}`, "aria-pressed": still, onClick: () => setStill((value) => !value), children: "Clean Up" }), gridMounted && (_jsxs("div", { className: "spatial-sort", ref: sortMenu, children: [_jsx("button", { type: "button", className: `spatial-sort__button${sortOpen ? ' is-open' : ''}${group !== 'all' ? ' is-active' : ''}`, "aria-expanded": sortOpen, "aria-haspopup": "menu", onClick: () => setSortOpen((open) => !open), children: "Sort Up" }), sortOpen && (_jsxs("ul", { className: "spatial-sort__menu", role: "menu", "aria-label": "Sort by", children: [_jsx("li", { className: "spatial-sort__label", role: "presentation", children: "Sort by" }), gallerySorts.map(({ id, label }) => (_jsx("li", { role: "none", children: _jsx("button", { type: "button", role: "menuitemradio", "aria-checked": group === id, className: group === id ? ' is-active' : '', onClick: () => {
                                                    setGroup(id);
                                                    setSortOpen(false);
                                                }, children: label }) }, id)))] }))] }))] }), _jsx("form", { className: "spatial-search", role: "search", onSubmit: (event) => event.preventDefault(), children: _jsx("input", { type: "search", value: query, placeholder: "Search projects", "aria-label": "Search projects", onChange: (event) => setQuery(event.target.value) }) }), _jsx(DiscoGallery, { cards: cards, exiting: exiting, still: still }), gridMounted && (_jsx("div", { className: `spatial-grid${gridOn ? ' is-shown' : ''}`, onClick: (event) => {
                        const target = event.target;
                        if (target.closest('.disco-tile, .spatial-sort, a, button'))
                            return;
                        onGalleryVoid(true);
                    }, children: _jsx("ul", { className: "spatial-grid__list", children: cards.map((item) => (_jsx("li", { children: _jsx(ProjectTile, { item: item }) }, item.id))) }) })), cards.length === 0 && _jsx("p", { className: "spatial-search__empty", children: "No matching projects" }), _jsx(AbstractPanel, { tidy: still })] }) }));
}
function ArchiveLayer() {
    const closeOverlay = useSpatialStore((state) => state.closeOverlay);
    return (_jsxs("div", { className: "spatial-glass spatial-archive", "aria-label": "Academic archive", children: [_jsxs("section", { className: "spatial-archive__group", children: [_jsx("h2", { className: "spatial-archive__label", children: "Notebooks" }), _jsx("ul", { className: "spatial-archive__list", children: notebooks.map((entry) => (_jsx("li", { children: entry.redirect && entry.link ? (_jsxs("a", { href: entry.link, target: "_blank", rel: "noopener noreferrer", onClick: () => closeOverlay(), children: [_jsx("span", { children: entry.courseLabel ?? entry.title }), _jsx("small", { children: entry.description })] })) : (_jsxs(Link, { to: `/garden/${entry.id}`, ...overlayReturn(`/garden/${entry.id}`), children: [_jsx("span", { children: entry.courseLabel ?? entry.title }), _jsx("small", { children: entry.description })] })) }, entry.id))) })] }), _jsxs("section", { className: "spatial-archive__group", children: [_jsx("h2", { className: "spatial-archive__label", children: "Research" }), _jsx("ul", { className: "spatial-archive__list", children: researchItems.map((item) => (_jsx("li", { children: _jsxs(Link, { to: `/research/${item.id}`, ...overlayReturn(`/research/${item.id}`), children: [_jsxs("span", { className: "spatial-archive__text", children: [_jsx("span", { children: item.title }), _jsxs("small", { children: [researchKindLabels[item.kind], item.period ? ` · ${item.period}` : ''] })] }), item.image && (_jsx("img", { className: "spatial-archive__thumb", src: item.image, alt: "" }))] }) }, item.id))) })] })] }));
}
function useReducedMotion() {
    const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = () => setReduced(media.matches);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);
    return reduced;
}
function FilmStill({ frame, decorative = false, ratio, onRatio, onOpen, }) {
    return (_jsxs("button", { type: "button", className: "spatial-film__frame", style: ratio ? { width: `calc(var(--film-h) * ${ratio})` } : undefined, onClick: () => onOpen(frame), "aria-label": decorative ? undefined : frame.title, "aria-hidden": decorative || undefined, tabIndex: decorative ? -1 : undefined, children: [_jsx("img", { src: frame.src, alt: "", decoding: "async", draggable: false, onLoad: (event) => {
                    const image = event.currentTarget;
                    if (image.naturalHeight)
                        onRatio(frame.src, image.naturalWidth / image.naturalHeight);
                } }), _jsxs("span", { className: "spatial-film__meta", children: [_jsx("span", { children: frame.title }), frame.note && _jsx("small", { children: frame.note })] })] }));
}
function MarqueeRow({ frames, index, reduced, ratios, onRatio, onOpen, }) {
    const setRef = useRef(null);
    const [shift, setShift] = useState(0);
    const [ready, setReady] = useState(reduced);
    useLayoutEffect(() => {
        const node = setRef.current;
        if (!node || reduced)
            return;
        let settle = 0;
        let last = 0;
        const measure = () => {
            const width = node.getBoundingClientRect().width;
            if (Math.abs(last - width) < 0.5)
                return;
            last = width;
            setShift(width);
            setReady(false);
            window.clearTimeout(settle);
            settle = window.setTimeout(() => setReady(true), 180);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => {
            observer.disconnect();
            window.clearTimeout(settle);
        };
    }, [frames, ratios, reduced]);
    return (_jsx("div", { className: "spatial-marquee__row", children: _jsxs("div", { className: `spatial-marquee__track spatial-marquee__track--${index}${ready && shift ? ' is-ready' : ''}`, style: shift ? { '--marquee-shift': `${shift}px` } : undefined, children: [_jsx("div", { className: "spatial-marquee__set", ref: setRef, children: frames.map((frame) => (_jsx(FilmStill, { frame: frame, ratio: ratios[frame.src], onRatio: onRatio, onOpen: onOpen }, frame.src))) }), !reduced && (_jsx("div", { className: "spatial-marquee__set", "aria-hidden": "true", children: frames.map((frame) => (_jsx(FilmStill, { frame: frame, decorative: true, ratio: ratios[frame.src], onRatio: onRatio, onOpen: onOpen }, `${frame.src}-copy`))) }))] }) }));
}
function CloseButton({ label, onClick }) {
    return (_jsx("button", { type: "button", className: "spatial__close", "aria-label": label, onClick: onClick, children: _jsx("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: _jsx("path", { d: "M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8" }) }) }));
}
function PhotoWindow({ frame, onClose }) {
    useEffect(() => {
        const onKey = (event) => {
            if (event.key !== 'Escape')
                return;
            event.stopImmediatePropagation();
            onClose();
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    }, [onClose]);
    return (_jsxs("div", { className: "spatial-lightbox", role: "dialog", "aria-modal": "true", "aria-label": frame.title, children: [_jsx("button", { type: "button", className: "spatial-lightbox__backdrop", "aria-label": "Close photograph", onClick: onClose }), _jsx(CloseButton, { label: "Close photograph", onClick: onClose }), _jsxs("figure", { className: "spatial-lightbox__figure", children: [_jsx("img", { src: frame.src, alt: frame.title }), _jsxs("figcaption", { children: [_jsx("span", { children: frame.title }), frame.note && _jsx("small", { children: frame.note })] })] })] }));
}
function CameraLayer() {
    const reducedMotion = useReducedMotion();
    const rows = filmRows(filmStills);
    const [active, setActive] = useState(null);
    const [ratios, setRatios] = useState({});
    const rememberRatio = (src, ratio) => {
        setRatios((current) => (current[src] === ratio ? current : { ...current, [src]: ratio }));
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: `spatial-film${active ? ' is-viewing' : ''}`, "aria-label": "Light table", children: rows.map((row, index) => (_jsx(MarqueeRow, { frames: row, index: index, reduced: reducedMotion, ratios: ratios, onRatio: rememberRatio, onOpen: setActive }, index))) }), active && _jsx(PhotoWindow, { frame: active, onClose: () => setActive(null) })] }));
}
const overlayLabel = {
    laptop: 'Projects',
    bookshelf: 'Academic archive',
    camera: 'Light table',
};
export function SpatialLayer() {
    const activeOverlay = useSpatialStore((state) => state.activeOverlay);
    const [tracked, setTracked] = useState(activeOverlay);
    const [galleryExit, setGalleryExit] = useState(false);
    if (activeOverlay !== tracked) {
        setTracked(activeOverlay);
        setGalleryExit(tracked === 'laptop' && activeOverlay === null);
    }
    useEffect(() => {
        if (!galleryExit)
            return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = window.setTimeout(() => setGalleryExit(false), reduce ? 0 : 400);
        return () => window.clearTimeout(timer);
    }, [galleryExit]);
    const overlayOpen = activeOverlay !== null || galleryExit;
    useEffect(() => {
        const onPop = () => {
            const marked = Boolean(window.history.state?.spatialGallery);
            const open = useSpatialStore.getState().activeOverlay === 'laptop';
            if (open && !marked)
                useSpatialStore.getState().closeOverlay();
            else if (!open && marked)
                useSpatialStore.getState().setActiveOverlay('laptop');
        };
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);
    useEffect(() => {
        if (!overlayOpen)
            return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [overlayOpen]);
    useEffect(() => {
        if (!overlayOpen)
            return;
        const onKey = (event) => {
            if (event.key !== 'Escape' || galleryExit)
                return;
            const state = useSpatialStore.getState();
            if (state.activeOverlay === 'laptop' && state.activeProjectId) {
                state.setActiveProject(null);
                return;
            }
            dismissGallery();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [overlayOpen, galleryExit]);
    const visible = activeOverlay ?? (galleryExit ? 'laptop' : null);
    if (!visible)
        return null;
    return createPortal(_jsxs("div", { className: `spatial${visible === 'camera' ? ' spatial--darkroom' : ''}${galleryExit ? ' spatial--leaving' : ''}`, children: [_jsx("button", { type: "button", className: "spatial__scrim", "aria-label": "Close", onClick: dismissGallery }), _jsxs("div", { className: `spatial__stage spatial__stage--${visible}`, role: "dialog", "aria-modal": "true", "aria-label": overlayLabel[visible], children: [_jsx(CloseButton, { label: "Close", onClick: dismissGallery }), visible === 'laptop' && _jsx(LaptopLayer, { exiting: galleryExit }), visible === 'bookshelf' && _jsx(ArchiveLayer, {}), visible === 'camera' && _jsx(CameraLayer, {})] })] }), document.body);
}
