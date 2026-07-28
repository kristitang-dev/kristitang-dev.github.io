import { Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { DetailPage } from '../components/DetailPage/DetailPage'
import { getGardenById } from '../data/garden'

export function GardenDetail() {
  const { id } = useParams<{ id: string }>()
  const item = id ? getGardenById(id) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!item) {
    return <Navigate to="/" replace />
  }

  return (
    <DetailPage
      backTo="/"
      backLabel="Back to Garden"
      backState={{ scrollTo: 'garden' }}
      eyebrow={item.kind}
      title={item.title}
      lead={item.description}
      image={item.image}
      imageAlt={item.title}
      body={item.body}
      gallery={item.gallery}
      externalLink={
        item.link
          ? { href: item.link, label: item.linkLabel ?? 'Open link' }
          : undefined
      }
    />
  )
}
