import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { site } from '../../data/site';
import './HeroContent.css';
/** Text and the spacer that reserves room for the 3D scene. */
export function HeroContent() {
    return (_jsxs("div", { className: "hero-content", children: [_jsx("div", { className: "hero-content__left", children: _jsxs("div", { className: "hero-copy", children: [_jsx("h1", { className: "hero-copy__name", children: site.name }), _jsxs("p", { className: "hero-copy__tagline", children: ["Between ", _jsx("em", { children: "Matter" }), " & ", _jsx("em", { children: "Medium" })] })] }) }), _jsx("div", { className: "hero-content__right", "aria-hidden": "true", children: _jsx("div", { className: "hero-scene hero-scene--spacer" }) })] }));
}
