import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

const statuses = ['new', 'contacted', 'quoted', 'approved', 'rejected'];

// Use a longer date here because this screen is about one specific request.
function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value));
}

// Show one quote, its products and contact details, and let approved admins change its status.
export default function AdminQuoteDetailPage() {
  const { id } = useParams();
  // Track loading, saving, and errors separately so the right message appears at the right time.
  const [quote, setQuote] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    // Read one quote and its related customer and products using the ID in the page URL.
    async function loadQuote() {
      if (!supabase) {
        setLoadState('error');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('quote_requests')
          .select('id, status, message, created_at, customer:customers(full_name, email, phone), items:quote_items(quantity, product:products(name))')
          .eq('id', id)
          .maybeSingle();
        if (!isCurrent) return;
        if (error || !data) {
          setLoadState(error ? 'error' : 'not-found');
          return;
        }
        setQuote(data);
        setLoadState('loaded');
      } catch {
        if (isCurrent) setLoadState('error');
      }
    }

    void loadQuote();
    return () => { isCurrent = false; };
  }, [id]);

  // Only save a real status change, and keep the old value if the database rejects it.
  async function updateStatus(event) {
    const nextStatus = event.target.value;
    setStatusError('');
    setStatusMessage('');
    if (!statuses.includes(nextStatus) || nextStatus === quote.status) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .update({ status: nextStatus })
        .eq('id', quote.id)
        .select('id')
        .maybeSingle();
      if (error || !data) throw error || new Error('Quote status was not updated.');
      setQuote((currentQuote) => ({ ...currentQuote, status: nextStatus }));
      setStatusMessage('Status updated.');
    } catch {
      setStatusError('Status could not be updated. Your previous status has been kept.');
    } finally {
      setIsSaving(false);
    }
  }

  // Don't try to render quote fields until the request has actually loaded.
  if (loadState === 'loading') return <p role="status">Loading quote details…</p>;
  if (loadState === 'error') {
    return <div className="alert alert-danger" role="alert">Quote details could not be loaded. Confirm admin access and try again.</div>;
  }
  if (loadState === 'not-found') {
    return <div className="alert alert-warning" role="alert">This quote request was not found.</div>;
  }

  // A joined customer can come back as an object or a one-item array.
  const customer = Array.isArray(quote.customer) ? quote.customer[0] : quote.customer;

  return (
    <>
      <Link className="admin-back-link" to="/admin">&larr; All quote requests</Link>
      <div className="admin-page-heading mt-3">
        <div>
          <p className="admin-eyebrow mb-1">QUOTE REQUEST</p>
          <h1 className="h2 mb-1">{customer?.full_name || 'Unknown customer'}</h1>
          <p className="text-muted mb-0">Submitted {formatDate(quote.created_at)}</p>
        </div>
      </div>

      {/* Keep contact details, quote status/message, and requested items easy to scan separately. */}
      <div className="row g-4 mt-1">
        <section className="col-lg-5" aria-labelledby="customer-heading">
          <div className="admin-detail-section h-100">
            <h2 id="customer-heading" className="h5">Customer</h2>
            <dl className="admin-definition-list mb-0">
              <dt>Full name</dt><dd>{customer?.full_name || 'Not provided'}</dd>
              <dt>Email</dt><dd><a href={`mailto:${customer?.email}`}>{customer?.email || 'Not provided'}</a></dd>
              {customer?.phone && <><dt>Phone</dt><dd><a href={`tel:${customer.phone}`}>{customer.phone}</a></dd></>}
            </dl>
          </div>
        </section>

        <section className="col-lg-7" aria-labelledby="quote-heading">
          <div className="admin-detail-section h-100">
            <h2 id="quote-heading" className="h5">Quote</h2>
            <label className="form-label" htmlFor="quote-status">Status</label>
            <select className="form-select admin-status-select" id="quote-status" value={quote.status} onChange={updateStatus} disabled={isSaving}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            {isSaving && <p className="small text-muted mt-2 mb-0" role="status">Saving status…</p>}
            {statusMessage && <p className="small text-success mt-2 mb-0" role="status">{statusMessage}</p>}
            {statusError && <p className="small text-danger mt-2 mb-0" role="alert">{statusError}</p>}
            <h3 className="h6 mt-4">Customer message</h3>
            <p className="admin-message mb-0">{quote.message || <span className="text-muted">No message provided.</span>}</p>
          </div>
        </section>

        {/* Show each requested product and its quantity from the quote's item list. */}
        <section className="col-12" aria-labelledby="products-heading">
          <div className="admin-detail-section">
            <h2 id="products-heading" className="h5">Products requested</h2>
            {quote.items?.length ? (
              <div className="admin-product-list">
                {quote.items.map((item, index) => {
                  const product = Array.isArray(item.product) ? item.product[0] : item.product;
                  return (
                    <div className="admin-product-row" key={`${product?.name || 'product'}-${index}`}>
                      <span>{product?.name || 'Unavailable product'}</span>
                      <span>Quantity: <strong>{item.quantity}</strong></span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-muted mb-0">No products are associated with this request.</p>}
          </div>
        </section>
      </div>
    </>
  );
}