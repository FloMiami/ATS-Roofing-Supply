// Give the smaller pages the same title-and-subtitle banner without repeating its markup.
export default function PageHeader({ title, subtitle, className = 'py-4' }) {
  return (
    <header className={`page-header ${className}`}>
      <div className="container">
        <h1>{title}</h1>
        {subtitle && <p className="lead mb-0">{subtitle}</p>}
      </div>
    </header>
  );
}