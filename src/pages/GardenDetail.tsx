import { Navigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { DetailPage } from '../components/DetailPage/DetailPage'
import { getCatalogEntry } from '../data/catalog'
import { getEntryHome, getEntryKindLabel } from '../data/entry'
import { BlogSeries } from './BlogSeries'

export function GardenDetail() {
  const { id } = useParams<{ id: string }>()
  const item = id ? getCatalogEntry(id) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (item?.redirect && item.link) {
      window.location.replace(item.link)
    }
  }, [item])

  if (!item) {
    return <Navigate to="/" replace />
  }

  if (item.redirect && item.link) {
    return null
  }

  if (item.blog) {
    return <BlogSeries series={item} />
  }

  const home = getEntryHome(item)

  return (
    <DetailPage
      backTo="/"
      backLabel={`Back to ${home.label}`}
      backState={{ scrollTo: home.section }}
      eyebrow={getEntryKindLabel(item)}
      title={item.title}
      lead={item.description}
      image={item.image}
      imageAlt={item.title}
      body={item.body}
      gallery={item.gallery}
      galleryTitle={item.galleryTitle}
      galleryLayout={item.galleryLayout ?? 'scroll'}
      galleryBlocks={item.galleryBlocks}
      externalLink={
        item.link
          ? {
              href: item.link,
              label: item.linkLabel ?? 'Open link',
            }
          : undefined
      }
      tryPrompt={
        item.link && item.detailLinkLabel
          ? {
              href: item.link,
              label: item.detailLinkLabel,
              icon: item.linkIcon,
            }
          : undefined
      }
    />
  )
}
