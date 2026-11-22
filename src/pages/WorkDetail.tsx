import { Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { DetailPage } from '../components/DetailPage/DetailPage'
import { getCategoryLabels, getWorkById } from '../data/work'
import { useDetailReturn } from '../store/spatialStore'

export function WorkDetail() {
  const { id } = useParams<{ id: string }>()
  const item = id ? getWorkById(id) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const backState = useDetailReturn('work')

  if (!item) {
    return <Navigate to="/" replace />
  }

  return (
    <DetailPage
      backTo="/"
      backLabel="Back to Work"
      backState={backState}
      eyebrow={getCategoryLabels(item).join(' · ')}
      title={item.title}
      subtitle={item.subtitle}
      lead={item.description}
      meta={[item.period, item.type, item.tools.join(' · ')]}
      image={item.detailImage ?? item.image}
      imageAlt={item.title}
      imageMotion={item.heroMotion}
      body={item.body}
      sections={item.sections}
      timeline={item.timeline}
      timelineTitle={item.timelineTitle}
      gallery={item.gallery}
      galleryTitle={item.galleryTitle}
      darkBandFrom={item.darkBandFrom}
      darkBandAccent={item.darkBandAccent}
      epilogue={item.epilogue}
      tags={item.tags}
      externalLink={
        item.link
          ? { href: item.link, label: item.linkLabel ?? 'External link' }
          : undefined
      }
    />
  )
}
