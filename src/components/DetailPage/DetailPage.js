import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { HistoryTimeline, } from './HistoryTimeline';
import './DetailPage.css';
function isVideoHref(href) {
    return /(?:youtu\.be|youtube\.com|vimeo\.com)/i.test(href);
}
function highlightCodePlaceholders(code) {
    const parts = code.split(/(\{[^}]+\})/g);
    return parts.map((part, index) => part.startsWith('{') && part.endsWith('}') ? (_jsx("span", { className: "detail-section__token", children: part }, `${part}-${index}`)) : (_jsx("span", { children: part }, `plain-${index}`)));
}
function normalizeGallery(gallery) {
    if (!gallery)
        return [];
    return gallery.map((item) => typeof item === 'string' ? { src: item } : item);
}
function isPhotoGridLayout(layout) {
    return (layout === '1x1' ||
        layout === '2x1' ||
        layout === '3x1' ||
        layout === '4x1');
}
function resolveGalleryBlocks(galleryBlocks, gallery, galleryTitle, galleryLayout) {
    if (galleryBlocks && galleryBlocks.length > 0) {
        return galleryBlocks.map((block) => ({
            layout: block.layout,
            title: block.title,
            images: normalizeGallery(block.images),
        }));
    }
    const images = normalizeGallery(gallery);
    if (images.length === 0)
        return [];
    return [
        {
            layout: galleryLayout,
            title: galleryTitle,
            images,
        },
    ];
}
function GalleryBlockView({ layout, title, images, blockIndex, }) {
    if (images.length === 0)
        return null;
    const isGrid = isPhotoGridLayout(layout);
    return (_jsxs("section", { className: `detail__gallery-wrap${isGrid ? ' detail__gallery-wrap--grid' : ''}`, children: [title ? _jsx("h2", { className: "detail__gallery-title", children: title }) : null, _jsx("div", { className: isGrid
                    ? `detail__gallery detail__gallery--${layout}`
                    : 'detail__gallery', tabIndex: isGrid ? undefined : 0, children: images.map((item, itemIndex) => (_jsxs("figure", { className: "detail__gallery-item", children: [_jsx("img", { src: item.src, alt: item.caption ?? '', className: "detail__gallery-image" }), item.caption && (_jsx("figcaption", { className: "detail__gallery-caption", children: item.caption }))] }, `${blockIndex}-${item.src}-${itemIndex}`))) })] }));
}
function groupTimeline(timeline) {
    const blocks = [];
    let i = 0;
    while (i < timeline.length) {
        const step = timeline[i];
        if (step.loop) {
            const steps = [];
            while (i < timeline.length && timeline[i].loop) {
                steps.push({ step: timeline[i], index: i });
                i += 1;
            }
            blocks.push({ type: 'loop', steps });
        }
        else {
            blocks.push({ type: 'step', step, index: i });
            i += 1;
        }
    }
    return blocks;
}
function TimelineStepRow({ step, index, }) {
    const placement = step.imagePlacement ?? 'side';
    return (_jsxs("li", { className: "detail-timeline__item", children: [_jsx("span", { className: "detail-timeline__index", "aria-hidden": "true", children: String(index + 1).padStart(2, '0') }), _jsxs("div", { className: `detail-timeline__content detail-timeline__content--${placement}`, children: [_jsxs("div", { className: "detail-timeline__copy", children: [_jsx("h3", { className: "detail-timeline__step", children: step.title }), _jsx("p", { className: "detail-timeline__text", children: step.text })] }), step.image && (_jsxs("figure", { className: "detail-timeline__figure", children: [_jsx("img", { src: step.image, alt: step.caption ?? step.title, className: "detail-timeline__image" }), step.caption && (_jsx("figcaption", { className: "detail-timeline__caption", children: step.caption }))] }))] })] }));
}
function DetailSectionView({ section }) {
    const blocks = section.blocks && section.blocks.length > 0
        ? section.blocks
        : [
            ...(section.paragraphs && section.paragraphs.length > 0
                ? section.paragraphs
                : section.text
                    ? [section.text]
                    : []).map((text) => ({ type: 'text', text })),
            ...(section.images && section.images.length > 0
                ? section.images
                : section.image
                    ? [{ src: section.image, caption: section.caption }]
                    : []).map((figure) => ({
                type: 'image',
                src: figure.src,
                caption: figure.caption,
            })),
        ];
    return (_jsxs("section", { className: `detail-section${section.theme === 'dark' ? ' detail-section--dark' : ''}`, children: [_jsx("h2", { className: "detail-section__heading", children: section.heading }), blocks.map((block, index) => {
                if (block.type === 'text') {
                    return (_jsx("p", { className: "detail-section__text", children: block.text }, `text-${index}-${block.text.slice(0, 24)}`));
                }
                if (block.type === 'code') {
                    return (_jsxs("figure", { className: "detail-section__code", children: [block.label && (_jsx("figcaption", { className: "detail-section__code-label", children: block.label })), _jsx("pre", { className: "detail-section__pre", children: _jsx("code", { children: highlightCodePlaceholders(block.code) }) })] }, `code-${index}`));
                }
                if (block.type === 'imageGrid') {
                    const count = Math.min(Math.max(block.images.length, 1), 3);
                    const fit = block.fit ?? 'height';
                    return (_jsx("div", { className: `detail-section__grid detail-section__grid--${count} detail-section__grid--fit-${fit}`, children: block.images.map((figure) => (_jsxs("figure", { className: "detail-section__grid-item", children: [_jsx("img", { src: figure.src, alt: figure.caption ?? '', className: "detail-section__grid-image" }), figure.caption && (_jsx("figcaption", { className: "detail-section__caption", children: figure.caption }))] }, figure.src))) }, `grid-${index}`));
                }
                if (block.type === 'historyTimeline') {
                    return (_jsx(HistoryTimeline, { eras: block.eras, hint: block.hint }, `history-${index}`));
                }
                if (block.type === 'split') {
                    const layout = block.layout ?? 'text-image';
                    const textEl = (_jsx("p", { className: "detail-section__split-text", children: block.text }));
                    const imageEl = (_jsxs("figure", { className: "detail-section__split-figure", children: [_jsx("img", { src: block.image, alt: block.caption ?? '', className: "detail-section__split-image" }), block.caption && (_jsx("figcaption", { className: "detail-section__caption", children: block.caption }))] }));
                    return (_jsx("div", { className: `detail-section__split detail-section__split--${layout}`, children: layout === 'image-text' ? (_jsxs(_Fragment, { children: [imageEl, textEl] })) : (_jsxs(_Fragment, { children: [textEl, imageEl] })) }, `split-${index}`));
                }
                return (_jsxs("figure", { className: `detail-section__figure${block.fullBleed ? ' detail-section__figure--full-bleed' : ''}${block.scale && block.scale !== 1 ? ' detail-section__figure--scaled' : ''}`, style: block.scale && block.scale !== 1
                        ? { width: `${block.scale * 100}%` }
                        : undefined, children: [_jsx("img", { src: block.src, alt: block.caption ?? '', className: "detail-section__image" }), block.caption && (_jsx("figcaption", { className: "detail-section__caption", children: block.caption }))] }, block.src));
            }), section.timelineSteps && section.timelineSteps.length > 0 && (_jsx("div", { className: "detail-timeline detail-timeline--inline", children: _jsx("ol", { className: "detail-timeline__list", children: section.timelineSteps.map((step, stepIndex) => (_jsx(TimelineStepRow, { step: step, index: stepIndex }, step.title))) }) }))] }));
}
export function DetailPage({ backTo, backLabel, backState, eyebrow, title, subtitle, lead, meta, image, imageAlt = '', preview, body = [], sections, timeline, timelineTitle = 'Flow', gallery, galleryTitle = 'Gallery', galleryLayout = 'scroll', galleryBlocks, darkBandFrom, epilogue, tags, externalLink, tryPrompt, children, }) {
    const blocks = resolveGalleryBlocks(galleryBlocks, gallery, galleryTitle, galleryLayout);
    const timelineBlocks = timeline ? groupTimeline(timeline) : [];
    const usesPhotoGrid = blocks.some((block) => isPhotoGridLayout(block.layout));
    const darkIndex = darkBandFrom && sections
        ? sections.findIndex((section) => section.heading === darkBandFrom)
        : -1;
    const hasDarkBand = darkIndex >= 0;
    const lightSections = hasDarkBand && sections ? sections.slice(0, darkIndex) : sections;
    const darkSections = hasDarkBand && sections ? sections.slice(darkIndex) : [];
    const pageTimeline = timelineBlocks.length > 0 ? (_jsxs("section", { className: "detail-timeline", children: [_jsx("h2", { className: "detail-timeline__title", children: timelineTitle }), _jsx("div", { className: "detail-timeline__blocks", children: timelineBlocks.map((block) => {
                    if (block.type === 'loop') {
                        return (_jsxs("div", { className: "detail-timeline__loop", children: [_jsxs("div", { className: "detail-timeline__loop-header", children: [_jsx("span", { className: "detail-timeline__loop-label", children: "Core loop" }), _jsx("span", { className: "detail-timeline__loop-hint", children: "Repeats for each customer \u00B7 02\u201305" })] }), _jsx("ol", { className: "detail-timeline__list detail-timeline__list--loop", children: block.steps.map(({ step, index }) => (_jsx(TimelineStepRow, { step: step, index: index }, step.title))) })] }, `loop-${block.steps[0].index}`));
                    }
                    return (_jsx("ol", { className: "detail-timeline__list", children: _jsx(TimelineStepRow, { step: block.step, index: block.index }) }, block.step.title));
                }) })] })) : null;
    const pageGallery = blocks.map((block, blockIndex) => (_jsx(GalleryBlockView, { layout: block.layout, title: block.title, images: block.images, blockIndex: blockIndex }, `gallery-block-${blockIndex}`)));
    const pageEpilogue = epilogue ? (_jsxs("section", { className: "detail-epilogue", children: [_jsx("h2", { className: "detail-epilogue__heading", children: epilogue.heading }), _jsx("div", { className: "detail-epilogue__body", children: epilogue.paragraphs.map((paragraph) => (_jsx("p", { children: paragraph }, paragraph))) }), epilogue.image && (_jsx("figure", { className: "detail-epilogue__figure", children: _jsx("img", { src: epilogue.image, alt: epilogue.heading, className: "detail-epilogue__image" }) }))] })) : null;
    const pageTags = tags && tags.length > 0 ? (_jsx("div", { className: "detail__tags", children: tags.map((tag) => (_jsx("span", { className: "detail__tag", children: tag }, tag))) })) : null;
    return (_jsxs("article", { className: `detail${usesPhotoGrid ? ' detail--photo-grid' : ''}`, children: [_jsxs("div", { className: "detail__inner", children: [_jsxs(Link, { to: backTo, state: backState, className: "detail__back", children: ["\u2190 ", backLabel] }), _jsxs("header", { className: "detail__header", children: [_jsx("span", { className: "detail__eyebrow", children: eyebrow }), _jsx("h1", { className: "detail__title", children: title }), subtitle && _jsx("p", { className: "detail__subtitle", children: subtitle }), meta && meta.length > 0 && (_jsx("p", { className: "detail__meta", children: meta.join(' · ') }))] }), lead && _jsx("p", { className: "detail__lead", children: lead }), externalLink && (_jsx("p", { className: `detail__external detail__external--early${externalLink.icon ? ' detail__external--icon' : ''}`, children: _jsxs("a", { href: externalLink.href, target: "_blank", rel: "noopener noreferrer", children: [externalLink.icon && (_jsx("img", { src: externalLink.icon, alt: "", className: "detail__external-icon" })), externalLink.label] }) })), preview && (_jsx("figure", { className: "detail__hero detail__hero--live", children: _jsx("iframe", { src: preview, title: `${title} live preview`, className: "detail__hero-preview" }) })), !preview && image && (_jsx("figure", { className: "detail__hero", children: externalLink && isVideoHref(externalLink.href) ? (_jsxs("a", { className: "detail__hero-link", href: externalLink.href, target: "_blank", rel: "noopener noreferrer", "aria-label": externalLink.label, children: [_jsx("img", { src: image, alt: "", className: "detail__hero-image" }), _jsxs("span", { className: "detail__hero-play", children: [_jsx("span", { className: "detail__hero-play-icon", "aria-hidden": "true" }), _jsx("span", { className: "detail__hero-play-label", children: externalLink.label })] })] })) : (_jsx("img", { src: image, alt: imageAlt, className: "detail__hero-image" })) })), body.length > 0 && (_jsx("div", { className: "detail__body", children: body.map((block, index) => {
                            if (typeof block === 'string') {
                                return _jsx("p", { children: block }, `body-text-${index}`);
                            }
                            if (block.type === 'images') {
                                return (_jsx("div", { className: "detail__body-row", children: block.images.map((item) => (_jsxs("figure", { className: "detail__body-figure", children: [_jsx("img", { src: item.src, alt: item.caption ?? '', className: "detail__body-image" }), item.caption && (_jsx("figcaption", { className: "detail-section__caption", children: item.caption }))] }, item.src))) }, `body-images-${index}`));
                            }
                            if (block.type === 'image') {
                                const scale = block.scale;
                                const scaled = scale != null && scale !== 1;
                                return (_jsxs("figure", { className: `detail__body-figure${scaled ? ' detail__body-figure--scaled' : ''}`, style: scaled ? { width: `${scale * 100}%` } : undefined, children: [_jsx("img", { src: block.src, alt: block.caption ?? '', className: "detail__body-image" }), block.caption && (_jsx("figcaption", { className: "detail-section__caption", children: block.caption }))] }, `body-image-${index}`));
                            }
                            if (block.type === 'embed') {
                                return (_jsx("div", { className: "detail__body-embed", children: _jsx("iframe", { src: block.src, title: block.title ?? 'Embedded media', width: "100%", height: block.height ?? 152, frameBorder: 0, allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture", loading: "eager", allowFullScreen: true, referrerPolicy: "strict-origin-when-cross-origin" }) }, `body-embed-${index}`));
                            }
                            const layout = block.layout ?? 'text-image';
                            const textEl = (_jsx("p", { className: "detail-section__split-text", children: block.text }));
                            const imageEl = (_jsxs("figure", { className: "detail-section__split-figure", children: [_jsx("img", { src: block.image, alt: block.caption ?? '', className: "detail-section__split-image" }), block.caption && (_jsx("figcaption", { className: "detail-section__caption", children: block.caption }))] }));
                            return (_jsx("div", { className: `detail-section__split detail-section__split--${layout}`, children: layout === 'image-text' ? (_jsxs(_Fragment, { children: [imageEl, textEl] })) : (_jsxs(_Fragment, { children: [textEl, imageEl] })) }, `body-split-${index}`));
                        }) })), lightSections && lightSections.length > 0 && (_jsx("div", { className: "detail__sections", children: lightSections.map((section) => (_jsx(DetailSectionView, { section: section }, section.heading))) })), !hasDarkBand && (_jsxs(_Fragment, { children: [pageTimeline, children, pageGallery, pageEpilogue, pageTags] })), tryPrompt && (_jsx("p", { className: "detail__external detail__external--icon detail__external--end", children: _jsxs("a", { href: tryPrompt.href, target: "_blank", rel: "noopener noreferrer", children: [tryPrompt.icon && (_jsx("img", { src: tryPrompt.icon, alt: "", className: "detail__external-icon" })), tryPrompt.label] }) }))] }), hasDarkBand && (_jsx("div", { className: "detail__dark-band", children: _jsxs("div", { className: "detail__dark-band-inner", children: [darkSections.length > 0 && (_jsx("div", { className: "detail__sections", children: darkSections.map((section) => (_jsx(DetailSectionView, { section: { ...section, theme: 'dark' } }, section.heading))) })), pageTimeline, children, pageGallery, pageEpilogue, pageTags] }) }))] }));
}
