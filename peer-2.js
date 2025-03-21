const b4a = require('b4a')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')
const derive_seed = require('derive-key')
const crypto = require("hypercore-crypto")

start(process.argv.slice(2))

/******************************************************************************
  START
******************************************************************************/
async function start ([corekey]) {
  if (!corekey) throw new Error('most provide a core key')

  const opts = {
    namespace: 'noisekeys',
    seed: crypto.randomBytes(32),
    name: 'noise'
  }
  const { publicKey, secretKey } = create_noise_keypair (opts)

  console.log({ peerkey: publicKey.toString('hex')})

  const keyPair = { publicKey, secretKey }
  const store = new Corestore('./storage-2')
  const swarm = new Hyperswarm({ keyPair })
  const clonedCore = store.get(b4a.from(corekey, 'hex'))
  swarm.on('connection', onconnection)
  clonedCore.on('append', onappend)
  await clonedCore.ready()
  if (clonedCore.length) console.log('from cache:', { message: (await clonedCore.get(0)).toString('utf-8') })

  const discovery_key = clonedCore.discoveryKey.toString('hex')
  console.log('Joining swarm for discovery key:', { core: { key: corekey, discovery_key } })

  swarm.join(clonedCore.discoveryKey, { server: false, client: true })
  swarm.flush()
  // setInterval(() => swarm.flush(), 5000)

  return

  async function onconnection (socket, info) {
    socket.on('error', (err) => console.log('socket error', err))
    console.log({conn: 'onconnection', peerkey: info.publicKey.toString('hex')})
    store.replicate(socket)
  }
  async function onappend () {
    console.log("📥 New data received!")
    const data = await clonedCore.get(0)
    console.log(`✅ Successfully fetched data: ${data}`)
  }
}
/******************************************************************************
  HELPER
******************************************************************************/
function create_noise_keypair ({ namespace, seed, name }) {
  const noiseSeed = derive_seed(namespace, seed, name)
  const publicKey = b4a.alloc(32)
  const secretKey = b4a.alloc(64)
  if (noiseSeed) sodium.crypto_sign_seed_keypair(publicKey, secretKey, noiseSeed)
  else sodium.crypto_sign_keypair(publicKey, secretKey)
  return { publicKey, secretKey }
}

