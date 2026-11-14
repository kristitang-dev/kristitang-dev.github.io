import { jsx as _jsx } from "react/jsx-runtime";
/** Keep this page in place and send the outside link to a new tab. */
export function ExternalRedirect({ url }) {
    return (_jsx("main", { className: "blog", children: _jsx("div", { className: "blog__inner", children: _jsx("p", { className: "blog__intro", children: _jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: "Open in a new tab" }) }) }) }));
}
