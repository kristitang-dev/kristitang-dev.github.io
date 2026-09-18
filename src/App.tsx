import { HashRouter, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav/Nav'
import { HomePage } from './pages/HomePage'
import { WorkDetail } from './pages/WorkDetail'
import { ResearchDetail } from './pages/ResearchDetail'
import { GardenDetail } from './pages/GardenDetail'
import { BlogPostPage } from './pages/BlogPostPage'
import { Footer } from './components/Footer/Footer'

function App() {
  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="/research/:id" element={<ResearchDetail />} />
        <Route path="/garden/:id/:slug" element={<BlogPostPage />} />
        <Route path="/garden/:id" element={<GardenDetail />} />
      </Routes>
      <Footer />
    </HashRouter>
  )
}

export default App
