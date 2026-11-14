import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Hero } from '../components/Hero/Hero';
import { About } from '../components/About/About';
import { Work } from '../components/Work/Work';
import { Research } from '../components/Research/Research';
import { Bookshelf } from '../components/Bookshelf/Bookshelf';
import { clearReturnOverlay, consumeReturnPlace, useSpatialStore, } from '../store/spatialStore';
let homeHasMounted = false;
export function HomePage() {
    const location = useLocation();
    const navigationType = useNavigationType();
    useLayoutEffect(() => {
        const state = location.state;
        const firstHomeMount = !homeHasMounted;
        homeHasMounted = true;
        const scrollToSection = (id) => {
            useSpatialStore.getState().closeOverlay();
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView({
                    behavior: reduce ? 'auto' : 'smooth',
                    block: 'start',
                });
            });
        };
        if (state?.overlay) {
            clearReturnOverlay();
            window.scrollTo(0, 0);
            useSpatialStore.getState().setActiveOverlay(state.overlay);
            return;
        }
        if (state?.scrollTo) {
            clearReturnOverlay();
            scrollToSection(state.scrollTo);
            return;
        }
        // The first history entry keeps its default key, including when the
        // browser returns to it. Only a fresh load of the homepage should drop
        // a stored destination; backing out of a detail page should restore it.
        if (navigationType === 'POP') {
            if (firstHomeMount && location.key === 'default') {
                clearReturnOverlay();
            }
            else {
                const place = consumeReturnPlace();
                if (place?.kind === 'overlay') {
                    window.scrollTo(0, 0);
                    useSpatialStore.getState().setActiveOverlay(place.overlay);
                    return;
                }
                if (place?.kind === 'section') {
                    scrollToSection(place.section);
                    return;
                }
            }
        }
        window.scrollTo(0, 0);
    }, [location, navigationType]);
    return (_jsxs(_Fragment, { children: [_jsx(Hero, {}), _jsx(About, {}), _jsx(Work, {}), _jsx(Research, {}), _jsx(Bookshelf, {})] }));
}
