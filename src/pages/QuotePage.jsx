import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { supabase } from '../lib/supabaseClient.js';

// Keep noisy request details in the developer console, not in customer-facing messages.
function logProductLoadFailure(category, error = null) {
  if (!import.meta.env.DEV) return;

  const status = Number.isInteger(error?.status) ? error.status : null;
  const code = typeof error?.code === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(error.code)
    ? error.code
    : null;

  console.error('[quote] Product catalog request failed', { category, status, code });
}

// Give the console a useful failure category without exposing Supabase error text to visitors.
function getProductLoadFailureCategory(error) {
  const status = Number.isInteger(error?.status) ? error.status : null;
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' ? error.message.toLowerCase() : '';

  if (code === '42501' || status === 403 || /permission|row-level security|\brls\b/.test(message)) {
    return 'RLS/permission error';
  }
  if (status === 401 || /invalid api.?key|invalid jwt/.test(message)) {
    return 'authentication/API error';
  }
  if (status !== null && status >= 400) {
    return 'failed HTTP request';
  }
  return 'authentication/API error';
}

// Load the product choices, check the form, and submit a quote request safely.
export default function QuotePage() {
  // These values control the catalog, the form, and the message shown after a submit.
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productLoadError, setProductLoadError] = useState('');
  const [formValues, setFormValues] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [selectedProducts, setSelectedProducts] = useState({});
  const [validationError, setValidationError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    // The form needs the live product IDs from Supabase when it builds the quote request.
    async function loadProducts() {
      if (!supabase) {
        logProductLoadFailure('missing Supabase configuration');
        setProductLoadError('Product catalog is unavailable. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the development server.');
        setIsLoadingProducts(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description')
          .order('name');

        if (!isCurrent) return;

        // Show one friendly message for failures, whether the request was rejected or threw.
        if (error) {
          logProductLoadFailure(getProductLoadFailureCategory(error), error);
          setProductLoadError('We could not load the product catalog. Please refresh the page or try again later.');
        } else {
          setProducts(data ?? []);
        }
      } catch (error) {
        logProductLoadFailure('network/browser error', error);
        setProductLoadError('We could not load the product catalog. Please refresh the page or try again later.');
      } finally {
        if (isCurrent) setIsLoadingProducts(false);
      }
    }

    loadProducts();
    return () => { isCurrent = false; };
  }, []);

  // Keep the visible form state in sync as someone edits a field.
  function updateField(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setValidationError('');
    setSubmissionError('');
    setIsSubmitted(false);
  }

  // Add a checked product with quantity 1, or remove it from the request.
  function toggleProduct(productId, isSelected) {
    setSelectedProducts((currentProducts) => {
      const updatedProducts = { ...currentProducts };
      if (isSelected) {
        updatedProducts[productId] = updatedProducts[productId] || '1';
      } else {
        delete updatedProducts[productId];
      }
      return updatedProducts;
    });
    setValidationError('');
    setSubmissionError('');
    setIsSubmitted(false);
  }

  // Store quantity as typed text so an empty field can be corrected before submit.
  function updateQuantity(productId, quantity) {
    setSelectedProducts((currentProducts) => ({ ...currentProducts, [productId]: quantity }));
    setValidationError('');
    setSubmissionError('');
    setIsSubmitted(false);
  }

  // Check every value before sending anything to Supabase.
  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError('');
    setSubmissionError('');
    setIsSubmitted(false);

    const fullName = formValues.fullName.trim();
    const email = formValues.email.trim();
    const selectedEntries = Object.entries(selectedProducts);

    // Start with the contact details and keep the same size limits enforced by the database.
    if (!fullName) {
      setValidationError('Enter your full name.');
      return;
    }
    if (fullName.length > 200) {
      setValidationError('Your name must be 200 characters or fewer.');
      return;
    }
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Enter a valid email address.');
      return;
    }
    if (formValues.phone.trim().length > 40) {
      setValidationError('Your phone number must be 40 characters or fewer.');
      return;
    }
    if (formValues.message.trim().length > 5000) {
      setValidationError('Your message must be 5,000 characters or fewer.');
      return;
    }
    // A quote needs at least one item; quantities must fit the database integer column.
    if (selectedEntries.length === 0) {
      setValidationError('Select at least one product for your quote.');
      return;
    }

    const invalidQuantity = selectedEntries.some(([, quantity]) => (
      !/^[1-9]\d*$/.test(quantity)
      || !Number.isSafeInteger(Number(quantity))
      || Number(quantity) > 2147483647
    ));
    if (invalidQuantity) {
      setValidationError('Enter a positive whole-number quantity for every selected product (up to 2,147,483,647).');
      return;
    }
    // Don't try a network call when the app was started without its Supabase settings.
    if (!supabase) {
      setSubmissionError('Quote submission is unavailable until Supabase is configured.');
      return;
    }

    // Send only the product IDs and numeric quantities that the database RPC expects.
    const p_items = selectedEntries.map(([productId, quantity]) => ({
      product_id: productId,
      quantity: Number(quantity),
    }));

    // Prevent duplicate clicks, and keep a failed form filled in so it can be retried.
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('submit_quote_request', {
        p_full_name: fullName,
        p_email: email,
        p_phone: formValues.phone.trim() || null,
        p_items,
        p_message: formValues.message.trim() || null,
      });

      if (error) throw error;

      setFormValues({ fullName: '', email: '', phone: '', message: '' });
      setSelectedProducts({});
      setIsSubmitted(true);
    } catch {
      setSubmissionError('We could not submit your quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* The header gives the form a clear starting point before the contact fields. */}
      <PageHeader title="Request a Quote" subtitle="Let’s talk roofing — we’re here to help!" />
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 mb-4">
              <h2 className="h4">Send Us a Message</h2>
              {/* noValidate lets handleSubmit show the same friendly messages for each error. */}
              <form onSubmit={handleSubmit} noValidate>
                {/* maxLength gives quick feedback; handleSubmit checks the same limits on submit. */}
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input type="text" className="form-control" id="fullName" name="fullName" autoComplete="name" maxLength={200} value={formValues.fullName} onChange={updateField} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input type="email" className="form-control" id="email" name="email" autoComplete="email" maxLength={254} value={formValues.email} onChange={updateField} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" id="phone" name="phone" autoComplete="tel" maxLength={40} value={formValues.phone} onChange={updateField} />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Your Message <span className="text-muted">(optional)</span></label>
                  <textarea className="form-control" id="message" name="message" rows="4" maxLength={5000} value={formValues.message} onChange={updateField} />
                </div>

                {/* Product choices come from Supabase, so show loading and failure states here too. */}
                <fieldset className="mb-4">
                  <legend className="h5">Products and Quantities</legend>
                  {isLoadingProducts && <p role="status">Loading products…</p>}
                  {productLoadError && <div className="alert alert-warning" role="alert">{productLoadError}</div>}
                  {!isLoadingProducts && !productLoadError && products.length === 0 && (
                    <p className="text-muted">No products are currently available.</p>
                  )}
                  {!isLoadingProducts && !productLoadError && products.map((product) => {
                    const isSelected = Object.hasOwn(selectedProducts, product.id);
                    return (
                      <div className="border rounded p-3 mb-2" key={product.id}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`product-${product.id}`}
                            checked={isSelected}
                            onChange={(event) => toggleProduct(product.id, event.target.checked)}
                          />
                          <label className="form-check-label fw-medium" htmlFor={`product-${product.id}`}>
                            {product.name}
                          </label>
                        </div>
                        {product.description && <p className="small text-muted mb-0 ms-4">{product.description}</p>}
                        {isSelected && (
                          <div className="mt-3 ms-4">
                            <label className="form-label" htmlFor={`quantity-${product.id}`}>Quantity</label>
                            <input
                              className="form-control"
                              type="number"
                              id={`quantity-${product.id}`}
                              min="1"
                              step="1"
                              value={selectedProducts[product.id]}
                              onChange={(event) => updateQuantity(product.id, event.target.value)}
                              required
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </fieldset>

                {/* Keep validation, request failure, and success messages separate and easy to spot. */}
                {validationError && <div className="alert alert-danger" role="alert">{validationError}</div>}
                {submissionError && <div className="alert alert-danger" role="alert">{submissionError}</div>}
                {isSubmitted && (
                  <div className="alert alert-success" role="status">
                    Thank you. Your quote request has been received. Our team will be in touch soon.
                  </div>
                )}
                <button type="submit" className="btn btn-accent" disabled={isSubmitting || isLoadingProducts || Boolean(productLoadError) || products.length === 0}>
                  {isSubmitting ? 'Submitting…' : 'Submit Quote Request'}
                </button>
              </form>
            </div>
            {/* Give visitors the store's contact details alongside the form. */}
            <div className="col-lg-5">
              <h2 className="h4">Our Location</h2>
              <p>
                <strong>ATS Roofing Supply</strong><br />
                123 Ridgeway Blvd<br />
                Springfield, IL 62704
              </p>
              <p>
                <strong>Phone:</strong> (555) 123-4567<br />
                <strong>Email:</strong> info@atsroofingsupply.com
              </p>
              <p>
                <strong>Hours:</strong><br />
                Mon–Fri: 8am–6pm<br />
                Sat: 9am–2pm<br />
                Sun: Closed
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}