import { Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { DetailPage } from '../components/DetailPage/DetailPage'
import { getResearchById, researchKindLabels } from '../data/research'

export function ResearchDetail() {
  const { id } = useParams<{ id: string }>()
  const item = id ? getResearchById(id) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!item) {
    return <Navigate to="/" replace />
  }

  return (
    <DetailPage
      backTo="/"
      backLabel="Back to Research"
      backState={{ scrollTo: 'research' }}
      eyebrow={researchKindLabels[item.kind]}
      title={item.title}
      lead={item.contribution ?? item.description}
      meta={[item.period, ...item.tags].filter(Boolean) as string[]}
      image={item.image}
      imageAlt={item.title}
      body={item.body}
      gallery={item.gallery}
      tags={item.tags}
      externalLink={
        item.doi ? { href: item.doi, label: 'View publication (DOI)' } : undefined
      }
    />
  )
}
