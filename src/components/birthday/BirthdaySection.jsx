import { Sparkles, Wind } from 'lucide-react'
import BirthdayCake from './BirthdayCake'
import './birthday.css'

export default function BirthdaySection() {
  return (
    <section id="wish" className="story-section wish-section section-anchor">
      <div className="wish-heading">
        <p className="eyebrow"><Sparkles size={14} /> WISH</p>
        <h2>Make a<br /><span>wish.</span></h2>
        <p className="wish-helper"><Wind size={15} /> Blow gently toward the candles.</p>
      </div>
      <div data-reveal="card"><BirthdayCake /></div>
    </section>
  )
}
