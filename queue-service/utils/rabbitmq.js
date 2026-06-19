const amqp = require('amqplib');

let channel;
const EXCHANGE_NAME = 'puskesmas_events';

async function connectRabbitMQ() {
  try {
    const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = await amqp.connect(amqpUrl);
    channel = await connection.createChannel();
    
    // Gunakan Topic Exchange untuk fleksibilitas routing event
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    
    console.log('RabbitMQ Connected & Exchange Asserted');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000); // Retry connect
  }
}

async function publishEvent(routingKey, payload) {
  if (!channel) {
    console.warn('Channel RabbitMQ belum siap!');
    return;
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true } // Pastikan pesan tidak hilang saat broker restart
  );
  console.log(`[x] Event dipublish: ${routingKey}`);
}

module.exports = { connectRabbitMQ, publishEvent };