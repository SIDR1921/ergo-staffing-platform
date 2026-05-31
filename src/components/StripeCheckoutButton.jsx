import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

function CheckoutForm({ amount, onSuccess, isSecondary }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const cardElement = elements.getElement(CardElement);
    
    // Simulate API delay for creating PaymentMethod
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      alert("Stripe Error: " + error.message);
      setLoading(false);
    } else {
      // Simulate backend checkout completion delay
      setTimeout(() => {
        setLoading(false);
        onSuccess(paymentMethod);
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}>
      <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', background: '#fff' }}>
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } } } }} />
      </div>
      <button type="submit" disabled={!stripe || loading} className={`brutal-button ${isSecondary ? 'secondary' : ''}`} style={{ width: '100%' }}>
        {loading ? "PROCESSING..." : `PAY $${amount}`}
      </button>
    </form>
  );
}

export default function StripeCheckoutButton({ planName, amount, buttonText, isSecondary }) {
  const [showElements, setShowElements] = useState(false);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(0,255,102,0.1)', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
        <CheckCircle size={20} /> Payment Successful
      </div>
    );
  }

  return (
    <div>
      {!showElements ? (
        <button 
          onClick={() => setShowElements(true)} 
          className={`brutal-button ${isSecondary ? 'secondary' : ''}`} 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
        >
          <CreditCard size={18} />
          {buttonText || "SECURE CHECKOUT"}
        </button>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm amount={amount} onSuccess={() => setSuccess(true)} isSecondary={isSecondary} />
        </Elements>
      )}
    </div>
  );
}
