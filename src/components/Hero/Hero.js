import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeroContent } from './HeroContent';
import { HeroScene } from './HeroScene';
import './Hero.css';
import './HeroContent.css';
export function Hero() {
    return (_jsxs("section", { id: "home", className: "hero", "aria-label": "Interactive hero", children: [_jsx(HeroContent, {}), _jsx("div", { className: "hero__scene-layer", children: _jsx("div", { className: "hero-scene", children: _jsx(HeroScene, {}) }) }), _jsx("div", { className: "hero__scroll-hint", "aria-hidden": "true", children: _jsx("span", { className: "hero__scroll-line" }) })] }));
}
