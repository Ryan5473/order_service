/*const stripe = require('../config/stripeConfig');
const mongoose = require('mongoose');

// Connexion à MongoDB
const Order = mongoose.model('Order', new mongoose.Schema({
  products: [{ id: Number, name: String, price: Number }],
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
}));

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
  } catch (err) {
    console.error('Erreur lors de la vérification du webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement de réussite de paiement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Mettre à jour l'ordre avec l'ID de session Stripe
    await Order.updateOne(
      { stripeSessionId: session.id },
      { status: 'confirmed' }
    );

    console.log(`Commande confirmée avec ID de session: ${session.id}`);
  }

  res.status(200).json({ received: true });
};

module.exports = { handleWebhook };
*/
const bodyParser = require('body-parser');
const express = require('express');
const { handleWebhook } = require('./controllers/webhookController');

const app = express();

// Use raw body parsing for Stripe webhook
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Other routes can use standard JSON body parsing
app.use(bodyParser.json());

// Webhook route
app.post('/webhook', handleWebhook);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
