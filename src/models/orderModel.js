/*const mongoose = require('mongoose');

// Define the Order schema
const orderSchema = new mongoose.Schema({
  products: [{ name: String, price: Number, quantity: Number }],
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

// Create the Order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
*/const mongoose = require('mongoose');

// Define Order schema
const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  customerName: String,
  customerEmail: String,
  stripeSessionId: String,
  status: { type: String, default: 'pending' }, // Add status field
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
