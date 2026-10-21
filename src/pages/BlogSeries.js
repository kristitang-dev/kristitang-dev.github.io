import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { getPostsBySeries } from '../content/loadPosts';
import { getEntryHome, getEntryKindLabel } from '../data/entry';
import './Blog.css';
export function BlogSeries({ series }) {
    const posts = getPostsBySeries(series.id);
    const home = getEntryHome(series);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [series.id]);
    return (_jsx("main", { className: "blog", children: _jsxs("div", { className: "blog__inner", children: [_jsxs(Link, { to: "/", className: "blog__back", state: { scrollTo: home.section }, children: ["\u2190 Back to ", home.label] }), _jsx("span", { className: "blog__eyebrow", children: getEntryKindLabel(series) }), _jsx("h1", { className: "blog__title", children: series.title }), _jsx("p", { className: "blog__intro", children: series.description }), series.link && (_jsx("a", { href: series.link, className: "blog__external", target: "_blank", rel: "noopener noreferrer", children: series.linkLabel ?? 'Open link' })), series.image && (_jsx("figure", { className: "blog__hero", children: _jsx("img", { src: series.image, alt: "" }) })), series.body.length > 0 && (_jsx("div", { className: "blog__body", children: series.body.map((block, index) => {
                        if (typeof block === 'string') {
                            return (_jsx(Markdown, { components: {
                                    a: ({ href, children }) => (_jsx("a", { href: href, target: "_blank", rel: "noopener noreferrer", children: children })),
                                }, children: block }, `body-${index}`));
                        }
                        if (block.type === 'image') {
                            return (_jsxs("figure", { className: "blog__body-figure", children: [_jsx("img", { src: block.src, alt: block.caption ?? '' }), block.caption && _jsx("figcaption", { children: block.caption })] }, `body-img-${index}`));
                        }
                        if (block.type === 'images') {
                            return (_jsx("div", { className: "blog__body-row", children: block.images.map((item) => (_jsxs("figure", { className: "blog__body-figure", children: [_jsx("img", { src: item.src, alt: item.caption ?? '' }), item.caption && _jsx("figcaption", { children: item.caption })] }, item.src))) }, `body-imgs-${index}`));
                        }
                        if (block.type === 'embed') {
                            return (_jsx("div", { className: "blog__body-embed", children: _jsx("iframe", { src: block.src, title: block.title ?? 'Embedded media', width: "100%", height: block.height ?? 352, frameBorder: 0, allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture", loading: "lazy", allowFullScreen: true }) }, `body-embed-${index}`));
                        }
                        return _jsx("p", { children: block.text }, `body-${index}`);
                    }) })), posts.length === 0 ? (_jsx("p", { className: "blog__empty", children: "No posts yet." })) : (_jsx("ol", { className: "blog__feed", children: posts.map((post) => (_jsxs("li", { className: `blog__feed-item${post.cover ? ' blog__feed-item--cover' : ''}`, children: [_jsxs("div", { className: "blog__feed-text", children: [_jsx("time", { className: "blog__feed-meta", dateTime: post.sortDate, children: post.date }), _jsx("h2", { className: "blog__feed-title", children: _jsx(Link, { to: `/garden/${series.id}/${post.slug}`, children: post.title }) }), post.excerpt && _jsx("p", { className: "blog__feed-excerpt", children: post.excerpt })] }), post.cover && (_jsx(Link, { to: `/garden/${series.id}/${post.slug}`, className: "blog__feed-cover", tabIndex: -1, "aria-hidden": "true", children: _jsx("img", { src: post.cover, alt: "", loading: "lazy" }) }))] }, post.slug))) }))] }) }));
}
