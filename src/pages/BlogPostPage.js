import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { ExternalRedirect } from '../components/ExternalRedirect';
import { getPost } from '../content/loadPosts';
import { getCatalogEntry } from '../data/catalog';
import './Blog.css';
/** Sequence titles on Develop by Hand. Wording is matched exactly. */
const handHeadings = new Set([
    'What does it cost to take a photo?',
    'Back when a photo had to be developed by hand',
    'Light is only the start',
    'The picture is taken. It stays dark.',
    'What makes a photo besides light?',
    'Shake the formula',
    'Then set it down',
    'A warm hand - Hold to appreciate it',
    'Hold to appreciate it',
    'The print is in your hands',
]);
function plainText(node) {
    if (node == null || typeof node === 'boolean')
        return '';
    if (typeof node === 'string' || typeof node === 'number')
        return String(node);
    if (Array.isArray(node))
        return node.map(plainText).join('');
    if (typeof node === 'object' && 'props' in node) {
        const props = node.props;
        return plainText(props?.children);
    }
    return '';
}
/** Only a Drive file preview is embedded. Other URLs are ignored. */
function drivePreviewSrc(url) {
    if (!url)
        return undefined;
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        return undefined;
    }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'drive.google.com')
        return undefined;
    if (!/^\/file\/d\/[^/]+\/preview$/.test(parsed.pathname))
        return undefined;
    return parsed.toString();
}
export function BlogPostPage() {
    const { id, slug } = useParams();
    const series = id ? getCatalogEntry(id) : undefined;
    const post = id && slug ? getPost(id, slug) : undefined;
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id, slug]);
    if (!series?.blog || !post) {
        return _jsx(Navigate, { to: id ? `/garden/${id}` : '/', replace: true });
    }
    const redirectUrl = post.redirect;
    if (redirectUrl) {
        return _jsx(ExternalRedirect, { url: redirectUrl });
    }
    const videoSrc = drivePreviewSrc(post.video);
    return (_jsx("main", { className: "blog", children: _jsxs("article", { className: "blog__inner", children: [_jsxs(Link, { to: `/garden/${series.id}`, className: "blog__back", children: ["\u2190 ", series.title] }), _jsx("time", { className: "blog__date", dateTime: post.sortDate, children: post.date }), _jsx("h1", { className: "blog__title", children: post.title }), videoSrc && (_jsx("div", { className: "blog__video", children: _jsx("iframe", { src: videoSrc, title: post.title, allow: "autoplay; fullscreen", allowFullScreen: true }) })), _jsx("div", { className: `blog__prose${post.slug === 'develop-by-hand' ? ' blog__prose--captions' : ''}`, children: _jsx(Markdown, { components: post.slug === 'develop-by-hand'
                            ? {
                                h2: ({ children }) => handHeadings.has(plainText(children).trim().replace(/\uFF1F/g, '?')) ? (_jsx("h2", { className: "blog__hand", children: children })) : (_jsx("h2", { children: children })),
                                img: ({ src, alt }) => {
                                    const url = typeof src === 'string' ? src : '';
                                    const fullSize = url.includes('anpoimages.com') ||
                                        url.includes('/circuit.png') ||
                                        url.includes('/prototype.png') ||
                                        url.endsWith('/cover.jpg');
                                    return (_jsx("img", { src: url, alt: alt ?? '', className: fullSize ? undefined : 'blog__img--half' }));
                                },
                            }
                            : post.slug === 'genai-as-creative-material'
                                ? {
                                    img: ({ src, alt }) => {
                                        const url = typeof src === 'string' ? src : '';
                                        const wide = /First%20Steps\.png|First Steps\.png|Saint-Remy\.png|Letter%20805\.png|Letter 805\.png|Generated/.test(url);
                                        return (_jsx("img", { src: url, alt: alt ?? '', className: wide ? 'blog__img--wide' : undefined }));
                                    },
                                }
                                : undefined, children: post.markdown }) })] }) }));
}
