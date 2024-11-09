
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api'); // Client RabbitMQ
require('dotenv').config();
const orderRoutes = require('./routes/orderRoutes'); // Assurez-vous que ce chemin est correct

const app = express();
const port = process.env.ORDER_SERVICE_PORT || 4000; // Port par défaut pour le service de commande

// Connectez-vous à MongoDB
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
let channel;
amqp.connect(process.env.RABBITMQ_URL, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, ch) => {
    if (error1) {
      throw error1;
    }
    channel = ch;
    app.locals.rabbitChannel = channel; // Rendre le canal RabbitMQ disponible globalement dans l'application

    // Consommer les réponses du service d'inventaire
    channel.assertQueue('inventory_response', { durable: false });
    channel.consume('inventory_response', (msg) => {
      if (msg) {
        // Traitez le message de réponse (facultatif)
        console.log('Réponse reçue de l\'inventaire:', msg.content.toString());
        channel.ack(msg);
      }
    }, { noAck: false });

    // Utilisez les routes de commande
    app.use('/api/orders', orderRoutes);

    // Démarrez le serveur
    app.listen(port, () => {
      console.log(`Service de commande en écoute sur le port ${port}`);
    });
  });
});
