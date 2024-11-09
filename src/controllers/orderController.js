/*const Order = require('../models/orderModel');

// Créer une nouvelle commande
const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
};

// Lire toutes les commandes
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
};

// Lire une commande par ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
};

// Mettre à jour une commande
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
  }
};

// Supprimer une commande
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la commande' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
*/const Order = require('../models/orderModel');
const stripe = require('../config/stripeConfig');

const createOrder = async (req, res, rabbitChannel) => {
  try {
    const { products, customerName, customerEmail } = req.body;

    // Envoyer la vérification de l'inventaire
    rabbitChannel.sendToQueue('inventory_check', Buffer.from(JSON.stringify({ products })));

    // Écoutez la réponse
    rabbitChannel.consume('inventory_response', async (msg) => {
      const { status } = JSON.parse(msg.content.toString());
      rabbitChannel.ack(msg); // Accusé de réception du message

      if (status === 'available') {
        // Créez la nouvelle commande dans MongoDB
        const order = new Order({ products, customerName, customerEmail });
        const savedOrder = await order.save();

        // Créer une session Stripe
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: products.map((product) => ({
            price_data: {
              currency: 'usd',
              product_data: { name: product.name },
              unit_amount: Math.round(product.price * 100), // Stripe attend des cents
            },
            quantity: product.quantity,
          })),
          mode: 'payment',
          // Use dummy URLs for now
          success_url: `http://localhost:3000/success?orderId=${savedOrder._id}`,
          cancel_url: `http://localhost:3000/cancel`,
        });

        // Enregistrer l'ID de la session dans la commande
        savedOrder.stripeSessionId = session.id;
        await savedOrder.save();

        // Envoyer l'URL de la session Stripe pour redirection
        return res.status(201).json({ stripeSessionUrl: session.url });
      } else {
        return res.status(400).json({ error: 'Produits hors stock' });
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
};

module.exports = { createOrder };
