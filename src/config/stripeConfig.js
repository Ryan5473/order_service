// src/config/stripeConfig.js
/*const Stripe = require('stripe');
require('dotenv').config(); // Ensure dotenv is loaded

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Use the environment variable here

module.exports = stripe;
*/
// stripeConfig.js
// src/config/stripeConfig.js
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27', // Use the appropriate API version
});

module.exports = stripe;
