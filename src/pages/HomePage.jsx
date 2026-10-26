import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/siteContent.js';

// Introduce ATS and point visitors toward the catalog or quote form.
export default function HomePage() {
  return (
    <>
      {/* Lead with the main message and the two paths most visitors need. */}
      <section
        className="home-hero"
        style={{ backgroundImage: `url("${products[0].image}")` }}
      >
        <div className="container">
          <div className="home-hero-copy">
            <span className="home-hero-eyebrow">Built for the people who build</span>
            <h1 className="home-hero-title">The right materials.<br /><span>Every time.</span></h1>
            <p>Your trusted source for dependable roofing supplies, practical expertise, and service that keeps your project moving.</p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-accent">Explore Products</Link>
              <Link to="/quote" className="btn btn-outline-light">Request a Quote</Link>
            </div>
          </div>
        </div>
      </section>
      {/* These three quick points explain what customers can expect from ATS. */}
      <div className="proof-strip">
        <div className="container">
          <div className="proof-strip-inner">
            <div className="proof-item"><strong>Materials you can trust</strong><span>Quality picks for the job ahead</span></div>
            <div className="proof-item"><strong>People who know roofing</strong><span>Helpful answers from real experts</span></div>
            <div className="proof-item"><strong>Ready when you are</strong><span>Local pickup and delivery options</span></div>
          </div>
        </div>
      </div>
      {/* Feature one product here; the Products page has the full catalog. */}
      <section className="home-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-eyebrow">A solid place to start</span>
            <h2>Roofing essentials, selected for the job.</h2>
            <p>From the roof deck to the finishing details, find dependable materials for projects big and small.</p>
          </div>
          <div className="row featured-products">
            <ProductCard product={products[0]} featured />
          </div>
        </div>
      </section>
      {/* Keep the external GAF link clearly separate from ATS site navigation. */}
      <section className="partner-callout">
        <div className="container">
          <p><strong>Need technical specs?</strong>Explore product resources from our partner, GAF Roofing.</p>
          <a href="https://www.gaf.com" target="_blank" rel="noreferrer">Visit GAF Roofing <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </>
  );
}