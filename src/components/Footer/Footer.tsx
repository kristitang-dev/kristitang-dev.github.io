import { site } from '../../data/site'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
        </div>

        <p className="footer__thanks">Thank you for spending time here.</p>

        <p className="footer__copy">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
