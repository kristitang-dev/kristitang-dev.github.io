import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeroContent } from './HeroContent';
import { HeroScene } from './HeroScene';
import { SpatialLayer } from '../Spatial/SpatialLayer';
import './Hero.css';
import './HeroContent.css';
export function Hero() {
    const scrollDown = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.getElementById('about')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    };
    return (_jsxs("section", { id: "home", className: "hero", "aria-label": "Interactive hero", children: [_jsx(HeroContent, {}), _jsx("div", { className: "hero__scene-layer", children: _jsx("div", { className: "hero-scene", children: _jsx(HeroScene, {}) }) }), _jsx("button", { type: "button", className: "hero__scroll-hint", onClick: scrollDown, "aria-label": "Scroll to about", children: _jsx("span", { className: "hero__scroll-line", "aria-hidden": "true" }) }), _jsx(SpatialLayer, {})] }));
}
