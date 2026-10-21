import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/Hero/Hero';
import { About } from '../components/About/About';
import { Work } from '../components/Work/Work';
import { Research } from '../components/Research/Research';
import { Bookshelf } from '../components/Bookshelf/Bookshelf';
import { DigitalGarden } from '../components/DigitalGarden/DigitalGarden';
export function HomePage() {
    const location = useLocation();
    useEffect(() => {
        const scrollTo = location.state?.scrollTo;
        if (scrollTo) {
            requestAnimationFrame(() => {
                document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
            });
            return;
        }
        window.scrollTo(0, 0);
    }, [location]);
    return (_jsxs(_Fragment, { children: [_jsx(Hero, {}), _jsx(About, {}), _jsx(Work, {}), _jsx(Research, {}), _jsx(DigitalGarden, {}), _jsx(Bookshelf, {})] }));
}
