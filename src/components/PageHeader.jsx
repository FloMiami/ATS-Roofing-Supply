export default function PageHeader({ title, subtitle, className = 'py-4' }) {
  return (
    <header className={`bg-primary text-white text-center ${className}`}>
      <div className="container">
        <h1>{title}</h1>
        {subtitle && <p className="lead mb-0">{subtitle}</p>}
      </div>
    </header>
  );
}