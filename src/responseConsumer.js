const { connectRabbitMQ } = require('./config/rabbitmq');

async function consumeOrderResponses() {
    const { channel } = await connectRabbitMQ();
    const RESPONSE_QUEUE_NAME = 'order_response_queue';

    await channel.assertQueue(RESPONSE_QUEUE_NAME, { durable: true });
    channel.prefetch(1);
    console.log('Waiting for responses in %s', RESPONSE_QUEUE_NAME);

    channel.consume(RESPONSE_QUEUE_NAME, async (msg) => {
        if (msg !== null) {
            const response = JSON.parse(msg.content.toString());
            console.log('Received response:', response);

            // Traitez la réponse ici (mise à jour de la commande, notifications, etc.)
            await handleOrderResponse(response);

            channel.ack(msg);
        }
    });
}

async function handleOrderResponse(response) {
    console.log('Handling response:', response);
    // Logique pour mettre à jour la commande ou notifier l'utilisateur
}

module.exports = { consumeOrderResponses };
