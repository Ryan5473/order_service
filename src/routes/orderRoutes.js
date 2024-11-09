/*const express = require('express');
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', createOrder); // Créer une commande
router.get('/', getAllOrders); // Récupérer toutes les commandes
router.get('/:id', getOrderById); // Récupérer une commande par ID
router.put('/:id', updateOrder); // Mettre à jour une commande
router.delete('/:id', deleteOrder); // Supprimer une commande

module.exports = router;
*/const express = require('express');
const { createOrder } = require('../controllers/orderController');

const router = express.Router();

// Modifiez la route pour passer le canal RabbitMQ
const orderRoutes = (rabbitChannel) => {
  router.post('/', (req, res) => createOrder(req, res, rabbitChannel));
  return router;
};

module.exports = orderRoutes;
