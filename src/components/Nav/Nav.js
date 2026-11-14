import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearReturnOverlay, useSpatialStore } from '../../store/spatialStore';
import './Nav.css';
const LINKS = [
    { label: 'Work', section: 'work' },
    { label: 'Research', section: 'research' },
    { label: 'About', section: 'about' },
];
export function Nav() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const goToSection = (section) => {
        if (isHome) {
            useSpatialStore.getState().scrollToSection(section);
            return;
        }
        useSpatialStore.getState().closeOverlay();
        navigate('/', { state: { scrollTo: section } });
    };
    return (_jsx("header", { className: `nav${scrolled || !isHome ? ' nav--scrolled' : ''}`, children: _jsxs("nav", { className: "nav__inner", "aria-label": "Main", children: [_jsx(Link, { to: "/", className: "nav__brand", onClick: () => {
                        clearReturnOverlay();
                        useSpatialStore.getState().closeOverlay();
                        if (isHome)
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, children: "Kristi Tang" }), _jsx("ul", { className: "nav__links", children: LINKS.map(({ label, section }) => (_jsx("li", { children: _jsx("button", { type: "button", className: "nav__link", onClick: () => goToSection(section), children: label }) }, label))) })] }) }));
}
