import PageHeader from '../components/PageHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/siteContent.js';

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Our Roofing Products"
        subtitle="High-quality materials built to last through any season"
      />
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {products.map((product) => <ProductCard key={product.name} product={product} />)}
          </div>
        </div>
      </section>
    </>
  );
}