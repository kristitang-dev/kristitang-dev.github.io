import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { site } from '../../data/site';
import './Footer.css';
export function Footer() {
    return (_jsx("footer", { className: "footer", children: _jsxs("div", { className: "footer__inner", children: [_jsx("p", { className: "footer__thanks", children: "Thank you for spending time here." }), _jsxs("nav", { className: "footer__contact", "aria-label": "Contact", children: [_jsx("a", { className: "footer__link", href: `mailto:${site.email}`, children: "Contact me" }), _jsx("a", { className: "footer__link", href: site.linkedinUrl, target: "_blank", rel: "noopener noreferrer", children: site.linkedinLabel }), _jsxs("a", { className: "footer__link", href: site.instagramUrl, target: "_blank", rel: "noopener noreferrer", children: ["Instagram ", site.instagramHandle] })] }), _jsxs("p", { className: "footer__copy", children: ["\u00A9 ", new Date().getFullYear(), " ", site.name] })] }) }));
}
