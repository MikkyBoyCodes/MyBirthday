import { ArrowUpRight } from 'lucide-react'
import './footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>OCTOBER 06 · 2026</p>
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to the beginning <ArrowUpRight size={15} strokeWidth={1.5} />
      </button>
    </footer>
  )
}
