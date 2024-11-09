// tests/orderController.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createOrder } = require('../src/controllers/orderController'); // Ensure correct path
const Order = require('../src/models/orderModel'); // Ensure correct path
require('dotenv').config({ path: '.env.test' });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mock RabbitMQ setup
let mockChannel = {
  sendToQueue: jest.fn(),
  consume: jest.fn((queue, callback) => {
    // Simulate the inventory service response
    const response = JSON.stringify({ status: 'available' });
    callback({ content: Buffer.from(response) });
  }),
  ack: jest.fn(),
};

// API endpoint for testing order creation
app.post('/api/orders', (req, res) => createOrder(req, res, mockChannel));

beforeAll(async () => {
  // Connect to the test MongoDB database
  await mongoose.connect('mongodb://localhost:27017/test_orders', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Close MongoDB connection after tests
  await mongoose.connection.close();
});

afterEach(async () => {
  // Clean up the database after each test
  await Order.deleteMany({});
});

describe('Order Service Tests', () => {
  test('should create a new order and return Stripe session URL', async () => {
    const orderData = {
      products: [{ name: 'Product 1', price: 10, quantity: 1 }],
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    };

    const response = await request(app)
      .post('/api/orders')
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('stripeSessionUrl');
    const order = await Order.findById(response.body.orderId);
    expect(order).toBeTruthy();
    expect(order.customerName).toBe(orderData.customerName);
  });

  test('should return error when products are out of stock', async () => {
    // Simulate out-of-stock response from inventory service
    mockChannel.consume.mockImplementationOnce((queue, callback) => {
      const response = JSON.stringify({ status: 'unavailable' });
      callback({ content: Buffer.from(response) });
    });

    const orderData = {
      products: [{ name: 'Product 1', price: 10, quantity: 1 }],
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    };

    const response = await request(app)
      .post('/api/orders')
      .send(orderData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Produits hors stock');
  });

  test('should handle database connection error', async () => {
    // Simulate a database connection error
    jest.spyOn(mongoose, 'connect').mockImplementationOnce(() => {
      throw new Error('Database connection error');
    });

    const response = await request(app)
      .post('/api/orders')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Erreur lors de la création de la commande');
  });
});
