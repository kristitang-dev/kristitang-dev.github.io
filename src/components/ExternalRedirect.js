import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
export function ExternalRedirect({ url }) {
    useEffect(() => {
        window.location.replace(url);
    }, [url]);
    return (_jsx("main", { className: "blog", children: _jsx("div", { className: "blog__inner", children: _jsxs("p", { className: "blog__intro", children: ["Opening", ' ', _jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: url }), "\u2026"] }) }) }));
}
