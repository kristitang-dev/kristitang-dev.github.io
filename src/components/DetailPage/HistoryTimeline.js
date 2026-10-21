import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './HistoryTimeline.css';
function normalizeDetail(detail) {
    return typeof detail === 'string' ? { text: detail } : detail;
}
function DetailBlock({ detail }) {
    let body = detail.text;
    if (detail.citation) {
        const label = detail.citation.label ?? 'Source';
        body = (_jsxs(_Fragment, { children: [detail.text, ' ', _jsx("a", { href: detail.citation.href, className: "history-timeline__cite", target: "_blank", rel: "noopener noreferrer", children: label })] }));
    }
    return (_jsxs("div", { className: "history-timeline__detail", children: [_jsx("p", { children: body }), detail.image && (_jsxs("figure", { className: "history-timeline__figure", children: [_jsx("img", { src: detail.image, alt: detail.caption ?? '', className: "history-timeline__image" }), detail.caption && (_jsx("figcaption", { className: "history-timeline__caption", children: detail.caption }))] }))] }));
}
export function HistoryTimeline({ eras, hint = 'Select an era to expand', }) {
    const [active, setActive] = useState(0);
    return (_jsxs("div", { className: "history-timeline", children: [_jsx("p", { className: "history-timeline__hint", children: hint }), _jsx("ol", { className: "history-timeline__list", children: eras.map((era, index) => {
                    const isOpen = active === index;
                    const panelId = `history-era-panel-${index}`;
                    const buttonId = `history-era-btn-${index}`;
                    return (_jsxs("li", { className: era.highlight
                            ? 'history-timeline__item history-timeline__item--highlight'
                            : 'history-timeline__item', children: [_jsxs("button", { type: "button", id: buttonId, className: isOpen
                                    ? 'history-timeline__trigger history-timeline__trigger--open'
                                    : 'history-timeline__trigger', "aria-expanded": isOpen, "aria-controls": panelId, onClick: () => setActive(index), children: [_jsx("span", { className: "history-timeline__dot", "aria-hidden": "true" }), _jsx("span", { className: "history-timeline__era", children: era.era }), _jsx("span", { className: "history-timeline__title", children: era.title }), _jsx("span", { className: "history-timeline__chevron", "aria-hidden": "true", children: isOpen ? '−' : '+' })] }), isOpen && (_jsxs("div", { id: panelId, role: "region", "aria-labelledby": buttonId, className: "history-timeline__panel", children: [_jsx("p", { className: "history-timeline__summary", children: era.summary }), era.details && era.details.length > 0 && (_jsx("div", { className: "history-timeline__details", children: era.details.map((detail, detailIndex) => {
                                            const normalized = normalizeDetail(detail);
                                            return (_jsx(DetailBlock, { detail: normalized }, `${normalized.text.slice(0, 32)}-${detailIndex}`));
                                        }) })), era.cases && era.cases.length > 0 && (_jsx("ul", { className: "history-timeline__cases", children: era.cases.map((item, caseIndex) => (_jsxs("li", { className: "history-timeline__case", children: [_jsx("span", { className: "history-timeline__case-index", children: caseIndex + 1 }), _jsxs("div", { children: [_jsxs("h4", { className: "history-timeline__case-title", children: [item.title, item.citation && (_jsxs(_Fragment, { children: [' ', _jsx("a", { href: item.citation.href, className: "history-timeline__cite", target: "_blank", rel: "noopener noreferrer", children: item.citation.label ?? 'Source →' })] }))] }), _jsx("p", { className: "history-timeline__case-text", children: item.text }), item.image && (_jsxs("figure", { className: "history-timeline__figure", children: [_jsx("img", { src: item.image, alt: item.caption ?? item.title, className: "history-timeline__image history-timeline__image--wide" }), item.caption && (_jsx("figcaption", { className: "history-timeline__caption", children: item.caption }))] }))] })] }, item.title))) }))] }))] }, era.era + era.title));
                }) })] }));
}
