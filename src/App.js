import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav/Nav';
import { HomePage } from './pages/HomePage';
import { WorkDetail } from './pages/WorkDetail';
import { ResearchDetail } from './pages/ResearchDetail';
import { GardenDetail } from './pages/GardenDetail';
import { BlogPostPage } from './pages/BlogPostPage';
import { Footer } from './components/Footer/Footer';
function App() {
    return (_jsxs(HashRouter, { children: [_jsx(Nav, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/work/:id", element: _jsx(WorkDetail, {}) }), _jsx(Route, { path: "/research/:id", element: _jsx(ResearchDetail, {}) }), _jsx(Route, { path: "/garden/:id/:slug", element: _jsx(BlogPostPage, {}) }), _jsx(Route, { path: "/garden/:id", element: _jsx(GardenDetail, {}) })] }), _jsx(Footer, {})] }));
}
export default App;
