import { site } from '../../data/site'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <p className="footer__name">{site.name}</p>
          <p className="footer__tagline">{site.tagline}</p>
        </div>

        <p className="footer__thanks">Thank you for spending time here.</p>

        <p className="footer__copy">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
