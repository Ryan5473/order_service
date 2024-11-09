const express = require('express');
const stripe = require('../config/stripeConfig');
const Order = require('../models/orderModel');

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
  } catch (err) {
    console.log(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Update the order status
      const order = await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: 'confirmed' },
        { new: true }
      );

      if (order) {
        console.log(`Order ${order._id} confirmed.`);
      } else {
        console.log('Order not found for session:', session.id);
      }
    } catch (dbError) {
      console.error('Database update error:', dbError.message);
    }
  }

  res.status(200).send({ received: true });
});

module.exports = router;
