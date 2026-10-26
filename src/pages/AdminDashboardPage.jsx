import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

const statuses = ['new', 'contacted', 'quoted', 'approved', 'rejected'];

// Turn the database timestamp into a date the person viewing the dashboard expects.
function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

// Load quote summaries and show the current workload by status.
export default function AdminDashboardPage() {
  // Keep loading separate from an empty result so the page can explain each case clearly.
  const [quotes, setQuotes] = useState([]);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    let isCurrent = true;

    // Load the latest quote summaries once; ignore the response if this page has closed.
    async function loadQuotes() {
      if (!supabase) {
        setLoadState('error');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('quote_requests')
          .select('id, status, created_at, customer:customers(full_name, email), items:quote_items(id)')
          .order('created_at', { ascending: false });
        if (!isCurrent) return;
        if (error) {
          setLoadState('error');
          return;
        }
        setQuotes(data ?? []);
        setLoadState('loaded');
      } catch {
        if (isCurrent) setLoadState('error');
      }
    }

    void loadQuotes();
    return () => { isCurrent = false; };
  }, []);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow mb-1">QUOTE MANAGEMENT</p>
          <h1 className="h2 mb-1">Quote requests</h1>
          <p className="text-muted mb-0">Review new inquiries and keep each request moving.</p>
        </div>
      </div>

      {/* These counts help staff see the queue without opening each request. */}
      <section className="admin-status-grid" aria-label="Quote totals by status">
        {statuses.map((status) => (
          <article className="admin-status-tile" key={status}>
            <span className={`admin-status-dot status-${status}`} aria-hidden="true" />
            <span className="admin-status-label">{status}</span>
            <strong>{quotes.filter((quote) => quote.status === status).length}</strong>
          </article>
        ))}
      </section>

      {/* Show one clear state at a time: loading, trouble, empty queue, or the quote table. */}
      {loadState === 'loading' && <p className="py-4" role="status">Loading quote requests…</p>}
      {loadState === 'error' && (
        <div className="alert alert-danger" role="alert">
          Quote requests could not be loaded. Confirm the admin migration is applied and this account is on the admin allowlist.
        </div>
      )}
      {loadState === 'loaded' && quotes.length === 0 && (
        <div className="admin-empty-state">
          <h2 className="h5">No quote requests yet</h2>
          <p className="mb-0 text-muted">Submitted requests will appear here.</p>
        </div>
      )}
      {loadState === 'loaded' && quotes.length > 0 && (
        // Supabase returns customer joins as an object or a one-item array, so handle either.
        <div className="admin-table-wrap">
          <table className="table align-middle admin-quote-table mb-0">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Status</th>
                <th scope="col">Submitted</th>
                <th scope="col">Items</th>
                <th scope="col"><span className="visually-hidden">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                const customer = Array.isArray(quote.customer) ? quote.customer[0] : quote.customer;
                return (
                  <tr key={quote.id}>
                    <td>
                      <strong className="d-block">{customer?.full_name || 'Unknown customer'}</strong>
                      <span className="small text-muted">{customer?.email}</span>
                    </td>
                    <td><span className={`admin-status-pill status-${quote.status}`}>{quote.status}</span></td>
                    <td>{formatDate(quote.created_at)}</td>
                    <td>{quote.items?.length ?? 0}</td>
                    <td className="text-end"><Link className="btn btn-outline-secondary btn-sm" to={`/admin/quotes/${quote.id}`}>View details</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}