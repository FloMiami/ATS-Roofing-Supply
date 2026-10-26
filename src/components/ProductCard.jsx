import { Link } from 'react-router-dom';

// Show the same product details everywhere, with a shorter description on the home page.
export default function ProductCard({ product, featured = false }) {
  const description = featured ? product.featuredDescription : product.description;

  return (
    <div className="col-md-4">
      <article className={`card h-100${featured ? ' mb-4 shadow-sm' : ''}`}>
        <img className="card-img-top" src={product.image} alt={product.imageAlt} />
        <div className="card-body">
          <h2 className="card-title h5">{product.name}</h2>
          <p className="card-text">{description}</p>
          {/* The featured home card is a preview; the full catalog cards link to the quote form. */}
          {!featured && <Link to="/quote" className="btn btn-accent">Request a Quote</Link>}
        </div>
      </article>
    </div>
  );
}