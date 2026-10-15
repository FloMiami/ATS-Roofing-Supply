export default function ProductCard({ product, featured = false }) {
  const description = featured ? product.featuredDescription : product.description;

  return (
    <div className="col-md-4">
      <article className={`card h-100${featured ? ' mb-4 shadow-sm' : ''}`}>
        <img className="card-img-top" src={product.image} alt={product.imageAlt} />
        <div className="card-body">
          <h2 className="card-title h5">{product.name}</h2>
          <p className="card-text">{description}</p>
          {!featured && <a href="#" className="btn btn-accent">View Details</a>}
        </div>
      </article>
    </div>
  );
}