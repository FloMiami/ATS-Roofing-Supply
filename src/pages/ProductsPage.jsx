import PageHeader from '../components/PageHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/siteContent.js';

// List the roofing products and send interested visitors to request a quote.
export default function ProductsPage() {
  return (
    <>
      {/* Explain what this page is for before listing the product cards. */}
      <PageHeader
        title="Our Roofing Products"
        subtitle="High-quality materials built to last through any season"
      />
      <section className="py-5">
        <div className="container">
          {/* Each card comes from the shared product list in src/data/siteContent.js. */}
          <div className="row g-4">
            {products.map((product) => <ProductCard key={product.name} product={product} />)}
          </div>
        </div>
      </section>
    </>
  );
}