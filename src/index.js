/*const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const amqp = require('amqplib/callback_api'); // RabbitMQ client
require('dotenv').config();
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const port = process.env.ORDER_SERVICE_PORT || 4000;

let channel; // Déclarez le canal ici

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connecté à MongoDB');
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(bodyParser.json()); // Utilisez body-parser pour analyser les JSON
app.use(cors()); // Ajoutez CORS pour permettre les requêtes depuis le frontend

// RabbitMQ setup
amqp.connect(process.env.RABBITMQ_URL, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, ch) => {
    if (error1) {
      throw error1;
    }
    channel = ch; // Assign the channel
    app.locals.rabbitChannel = channel; // Rendre le canal RabbitMQ disponible globalement dans l'application

    // Démarrer le serveur après configuration du canal RabbitMQ
    app.listen(port, () => {
      console.log(`Service de commande en écoute sur le port ${port}`);
    });
  });
});

// Utilisez les routes de commande
app.use('/api/orders', orderRoutes);
  */
 /*const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const orderRoutes = require('./routes/orderRoutes');
const amqp = require('amqplib/callback_api');
require('dotenv').config();

const app = express();
const port = process.env.ORDER_SERVICE_PORT || 4000; // Port par défaut pour le service de commande

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connecté à MongoDB');
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
  process.exit(1); // Quittez l'application si la connexion à la base de données échoue
});

// Middleware
app.use(bodyParser.json()); // Utilisez body-parser pour analyser le JSON

// Configuration RabbitMQ
let rabbitConnection;
let rabbitChannel;

amqp.connect(process.env.RABBITMQ_URL, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  rabbitConnection = connection; // Stockez la connexion pour l'utiliser plus tard
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    rabbitChannel = channel; // Stockez le canal pour l'utiliser plus tard

    // Assurez-vous que les files d'attente sont créées
    channel.assertQueue('inventory_check', { durable: false });
    channel.assertQueue('inventory_response', { durable: false });

    // Utilisez les routes de commande
    app.use('/api/orders', orderRoutes(rabbitChannel)); // Passer le canal RabbitMQ aux routes

    // Démarrez le serveur
    app.listen(port, () => {
      console.log(`Service de commande en écoute sur le port ${port}`);
    });
  });
});
*/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const orderRoutes = require('./routes/orderRoutes');
const amqp = require('amqplib/callback_api');
require('dotenv').config();

const app = express();
const port = process.env.ORDER_SERVICE_PORT || 4000; // Default port for order service

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the application if the database connection fails
});

// Middleware
app.use(cors()); // Enable CORS for all requests
app.use(bodyParser.json()); // Use body-parser to parse JSON

// RabbitMQ configuration
let rabbitConnection;
let rabbitChannel;

amqp.connect(process.env.RABBITMQ_URL, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  rabbitConnection = connection; // Store the connection for later use
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    rabbitChannel = channel; // Store the channel for later use

    // Ensure queues are created
    channel.assertQueue('inventory_check', { durable: false });
    channel.assertQueue('inventory_response', { durable: false });

    // Use order routes
    app.use('/api/orders', orderRoutes(rabbitChannel)); // Pass RabbitMQ channel to routes

    // Start the server
    app.listen(port, () => {
      console.log(`Order service listening on port ${port}`);
    });
  });
});
