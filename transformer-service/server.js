const amqp = require('amqplib');
const xml2js = require('xml2js');

const AMQP_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const EXCHANGE_NAME = 'puskesmas_events';
const QUEUE_NAME = 'transformer_queue';
const DLQ_NAME = 'queue.created.dlq';
const DLX_NAME = 'puskesmas_dlx';

async function start() {
    try {
        console.log(`Attempting to connect to RabbitMQ at ${AMQP_URL}...`);
        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();

        // 1. Setup Dead Letter Exchange (DLX) and Dead Letter Queue (DLQ)
        await channel.assertExchange(DLX_NAME, 'topic', { durable: true });
        await channel.assertQueue(DLQ_NAME, { durable: true });
        await channel.bindQueue(DLQ_NAME, DLX_NAME, '#');

        // 2. Setup Main Exchange and Queue
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
        await channel.assertQueue(QUEUE_NAME, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_NAME,
                'x-dead-letter-routing-key': 'failed.event'
            }
        });

        // 3. Bind Main Queue to both routing keys we care about
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'queue.created');
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'queue.status.updated');

        console.log(`[*] Transformer Service Connected! Waiting for messages in ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const routingKey = msg.fields.routingKey;
                const content = msg.content.toString();
                
                try {
                    const data = JSON.parse(content);
                    
                    if (routingKey === 'queue.created') {
                        // Pola Message Translator: JSON -> XML
                        await handleQueueCreated(data);
                    } else if (routingKey === 'queue.status.updated') {
                        // Pola Choreography/Pub-Sub (Bonus)
                        handleStatusUpdated(data);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error(`[X] Error processing message: ${error.message}`);
                    
                    // Implementasi Reliable Messaging:
                    // Jika di-reject dengan requeue: false, pesan otomatis masuk ke DLQ berkat argumen x-dead-letter-exchange
                    channel.nack(msg, false, false);
                    console.log(`[!] Message moved to Dead Letter Queue (${DLQ_NAME})`);
                }
            }
        });
    } catch (error) {
        console.error('Failed to start transformer-service. Retrying in 5s...', error.message);
        setTimeout(start, 5000); // Retry connect
    }
}

async function handleQueueCreated(data) {
    console.log('\n--- [QUEUE_CREATED] Event Received ---');
    console.log('Original JSON Payload:');
    console.log(JSON.stringify(data, null, 2));

    // Translasi ke XML Kanonik
    const builder = new xml2js.Builder({ rootName: 'AntrianEvent', headless: true });
    
    const payload = data.payload || {};
    
    // Sesuaikan struktur agar output sesuai format
    const xmlObj = {
        $: { xmlns: 'http://puskesmas.eai/canonical/v1' },
        EventType: data.eventType || 'QUEUE_CREATED',
        Timestamp: data.timestamp || new Date().toISOString(),
        Source: data.source || 'queue-service',
        Payload: {
            QueueId: payload.id || payload.queueId || '',
            QueueNumber: payload.queue_number || payload.queueNumber || '',
            PatientId: payload.patient_id || payload.patientId || '',
            PatientName: payload.patient_name || payload.patientName || '',
            DoctorId: payload.doctor_id || payload.doctorId || '',
            DoctorName: payload.doctor_name || payload.doctorName || '',
            ScheduleDate: payload.schedule_date || payload.scheduleDate || '',
            Status: payload.status || 'waiting'
        }
    };

    const xmlResult = `<?xml version="1.0" encoding="UTF-8"?>\n` + builder.buildObject(xmlObj);
    
    console.log('\nTranslated Canonical XML:');
    console.log(xmlResult);
    console.log('--------------------------------------\n');
}

function handleStatusUpdated(data) {
    console.log('\n============= NOTIFICATION =============');
    const payload = data.payload || {};
    console.log(`[Status Antrian Diperbarui]`);
    console.log(`Nomor Antrian : ${payload.queue_number || payload.queueNumber || '-'}`);
    console.log(`Nama Pasien   : ${payload.patient_name || payload.patientName || '-'}`);
    console.log(`Status Baru   : ${String(payload.status).toUpperCase()}`);
    console.log('========================================\n');
}

start();
