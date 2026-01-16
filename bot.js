const bedrock = require('bedrock-protocol');
const { Authflow } = require('prismarine-auth');

// --- CONFIGURATION ---
const OPTIONS = {
    host: 'donutsmp.net',
    port: 19132,
    username: 'ShotDevsBot',
    version: '1.21.130', // Ensure this matches the server exactly
    offline: false
};

const flow = new Authflow(OPTIONS.username, './auth_cache');

let afkRoom = 2;
let joined = false;

function createBot() {
    console.log(`🚀 Connecting to ${OPTIONS.host}:${OPTIONS.port}...`);

    const client = bedrock.createClient({
        ...OPTIONS,
        authFlow: flow
    });

    // --- PACKET DEBUGGING ---
    // Uncomment the line below if you want to see every packet name (very spammy)
    // client.on('packet', (packet) => console.log('Received:', packet.data.name));

    client.on('join', () => {
        console.log('✅ Server handshake complete. Joining world...');
    });

    client.once('spawn', () => {
        console.log('✅ Spawned in world!');
        // Small delay to ensure the server is ready to accept commands
        setTimeout(tryAfkRoom, 3000);
    });

    client.on('text', (packet) => {
        const msg = packet.message.toLowerCase();
        const source = packet.source_name;

        // Log incoming chat so you can see what's happening
        console.log(`[CHAT] ${source}: ${packet.message}`);

        if (msg.includes('full') && !joined) {
            afkRoom++;
            if (afkRoom > 16) {
                console.log('❌ All AFK rooms are full. Staying put.');
                return;
            }
            console.log(`⚠ AFK Room ${afkRoom - 1} full, trying /afk ${afkRoom}...`);
            setTimeout(tryAfkRoom, 2000);
        }

        if (msg.includes('joined') || msg.includes('teleported') || msg.includes('afk room')) {
            joined = true;
            console.log(`✨ Success: Now in AFK Room ${afkRoom}`);
        }
    });

    function tryAfkRoom() {
        console.log(`➡ Sending: /afk ${afkRoom}`);
        sendChat(`/afk ${afkRoom}`);
    }

    function sendChat(message) {
        client.queue('text', {
            type: 'chat',
            needs_translation: false,
            source_name: client.username,
            xuid: '',
            platform_chat_id: '',
            message
        });
    }

    // --- ERROR HANDLING & AUTO-RECONNECT ---
    client.on('error', (err) => {
        console.error('❗ Client Error:', err);
    });

    client.on('close', (reason) => {
        console.log(`❌ Disconnected: ${reason}`);
        joined = false;
        console.log('🔄 Reconnecting in 10 seconds...');
        setTimeout(createBot, 10000);
    });
}

// Start the bot
createBot();
