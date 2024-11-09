const { connectRabbitMQ } = require('./config/rabbitmq');

let channel;

// Publiez un message dans RabbitMQ
const publishOrderMessage = async (message) => {
    try {
        const { channel } = await connectRabbitMQ();
        const QUEUE_NAME = 'orderQueue'; // Nom de la queue

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
            persistent: true,
        });
        console.log("Message envoyé à RabbitMQ :", message);
    } catch (error) {
        console.error("Erreur lors de l'envoi du message à RabbitMQ :", error);
    }
};

module.exports = { publishOrderMessage };
