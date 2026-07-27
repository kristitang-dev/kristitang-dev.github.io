import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Hero } from '../components/Hero/Hero'
import { About } from '../components/About/About'
import { Work } from '../components/Work/Work'
import { Research } from '../components/Research/Research'
import { DigitalGarden } from '../components/DigitalGarden/DigitalGarden'
import { Footer } from '../components/Footer/Footer'

export function HomePage() {
  const location = useLocation()

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (scrollTo) {
      requestAnimationFrame(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }
    window.scrollTo(0, 0)
  }, [location])

  return (
    <>
      <Hero />
      <About />
      <Work />
      <Research />
      <DigitalGarden />
      <Footer />
    </>
  )
}
