import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DetailPage } from '../components/DetailPage/DetailPage';
import { getCategoryLabels, getWorkById } from '../data/work';
export function WorkDetail() {
    const { id } = useParams();
    const item = id ? getWorkById(id) : undefined;
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);
    if (!item) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return (_jsx(DetailPage, { backTo: "/", backLabel: "Back to Work", backState: { scrollTo: 'work' }, eyebrow: getCategoryLabels(item).join(' · '), title: item.title, subtitle: item.subtitle, lead: item.description, meta: [item.period, item.type, item.tools.join(' · ')], image: item.detailImage ?? item.image, imageAlt: item.title, body: item.body, sections: item.sections, timeline: item.timeline, timelineTitle: item.timelineTitle, gallery: item.gallery, galleryTitle: item.galleryTitle, darkBandFrom: item.darkBandFrom, epilogue: item.epilogue, tags: item.tags, externalLink: item.link
            ? { href: item.link, label: item.linkLabel ?? 'External link' }
            : undefined }));
}
