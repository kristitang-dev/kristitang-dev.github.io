import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { getEntryKindLabel } from '../../data/entry';
import { sandboxEntries } from '../../data/sandbox';
import './DigitalGarden.css';
export function GardenCardLink({ entry, className, children, }) {
    if (entry.redirect && entry.link) {
        return (_jsx("a", { href: entry.link, className: className, target: "_blank", rel: "noopener noreferrer", children: children }));
    }
    return (_jsx(Link, { to: `/garden/${entry.id}`, className: className, children: children }));
}
export function DigitalGarden() {
    return (_jsx("section", { id: "sandbox", className: "garden", children: _jsxs("div", { className: "garden__inner", children: [_jsxs("div", { className: "garden__header", children: [_jsx("span", { className: "garden__eyebrow", children: "Experiments" }), _jsx("h2", { className: "garden__title", children: "Sandbox" }), _jsx("p", { className: "garden__intro", children: "Game jams and experiments" })] }), _jsx("div", { className: "garden__grid", children: sandboxEntries.map((entry) => (_jsxs("article", { className: `garden-card${entry.image || entry.preview ? '' : ' garden-card--text'}`, children: [(entry.image || entry.preview) && (_jsx(GardenCardLink, { entry: entry, className: "garden-card__media-link", children: _jsx("div", { className: "garden-card__media", children: entry.preview ? (_jsx("iframe", { src: entry.preview, title: `${entry.title} live preview`, className: "garden-card__preview", loading: "lazy", tabIndex: -1, "aria-hidden": "true" })) : (_jsx("img", { src: entry.image, alt: "", className: "garden-card__image", loading: "lazy" })) }) })), _jsxs("div", { className: "garden-card__body", children: [_jsx("span", { className: "garden-card__kind", children: getEntryKindLabel(entry) }), _jsx("h3", { className: "garden-card__title", children: _jsx(GardenCardLink, { entry: entry, children: entry.title }) }), _jsx("p", { className: "garden-card__desc", children: entry.description }), entry.link && (_jsx("a", { href: entry.link, className: "garden-card__link", target: "_blank", rel: "noopener noreferrer", children: entry.linkLabel ?? 'Open link' }))] })] }, entry.id))) })] }) }));
}
