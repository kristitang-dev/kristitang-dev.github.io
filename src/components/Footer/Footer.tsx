import { site } from '../../data/site'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__thanks">Thank you for spending time here.</p>

        <nav className="footer__contact" aria-label="Contact">
          <a className="footer__link" href={`mailto:${site.email}`}>
            Contact me
          </a>
          <a
            className="footer__link"
            href={site.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {site.linkedinLabel}
          </a>
          <a
            className="footer__link"
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram {site.instagramHandle}
          </a>
        </nav>

        <p className="footer__copy">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
