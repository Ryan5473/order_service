const express = require('express');
const stripe = require('../config/stripeConfig'); // Ensure this points to your Stripe configuration
const router = express.Router();

// Replace with your Stripe webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Webhook endpoint to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent);
      // Handle successful payment here (e.g., update order status in database)
      break;
    case 'payment_intent.payment_failed':
      const paymentFailure = event.data.object;
      console.log('PaymentIntent failed!', paymentFailure);
      // Handle failed payment here (e.g., notify the user)
      break;
    // Add other event types you want to handle
    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.status(200).send('Received');
});

module.exports = router;
