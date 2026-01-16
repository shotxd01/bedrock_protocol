const bedrock = require('bedrock-protocol');
const { Authflow } = require('prismarine-auth');

const flow = new Authflow('ShotDevsBot', './auth_cache');

const client = bedrock.createClient({
  host: 'donutsmp.net',
  port: 19132,
  authFlow: flow,
  offline: false,
  version: '1.21.130'
});

let afkRoom = 2;
let joined = false;

client.on('join', () => {
  console.log('✅ Logged in');
});

client.once('spawn', () => {
  console.log('✅ Spawned');
  tryAfkRoom();
});

client.on('text', (packet) => {
  const msg = packet.message.toLowerCase();

  if (msg.includes('full') && !joined) {
    afkRoom++;

    if (afkRoom > 16) {
      console.log('❌ All AFK rooms are full');
      return;
    }

    console.log(`⚠ AFK ${afkRoom - 1} full, trying /afk ${afkRoom}`);
    setTimeout(tryAfkRoom, 2000);
  }

  if (
    msg.includes('joined') ||
    msg.includes('teleported') ||
    msg.includes('afk room')
  ) {
    joined = true;
    console.log(`✅ Successfully joined AFK ${afkRoom}`);
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

client.on('close', () => {
  console.log('❌ Disconnected');
  process.exit(1);
});

client.on('error', console.log);
