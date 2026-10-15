import PageHeader from '../components/PageHeader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/siteContent.js';

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Welcome to ATS Roofing Supply"
        subtitle="Your trusted source for top-quality roofing materials"
        className="py-5"
      />
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Featured Products</h2>
          <div className="row text-center">
            <ProductCard product={products[0]} featured />
          </div>
        </div>
      </section>
      <section className="bg-light py-4 text-center">
        <p className="mb-0">
          Looking for technical specs? Check out our partner{' '}
          <a href="https://www.gaf.com" target="_blank" rel="noreferrer">GAF Roofing</a>.
        </p>
      </section>
    </>
  );
}