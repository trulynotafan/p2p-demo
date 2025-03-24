const b4a = require('b4a')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')
const derive_seed = require('derive-key')
const crypto = require("hypercore-crypto")

start()

/******************************************************************************
  START
******************************************************************************/
async function start (iid) {
  const label = '\x1b[32m[writer]\x1b[0m'
  console.log(label, 'start')
  const opts = {
    namespace: 'noisekeys',
    seed: crypto.randomBytes(32),
    name: 'noise'
  }
  const { publicKey, secretKey } = create_noise_keypair (opts)
  console.log(label, { peerkey: publicKey.toString('hex')})
  const keyPair = { publicKey, secretKey }
  const store = new Corestore('./storage')
  const swarm = new Hyperswarm({ keyPair })
  swarm.on('connection', onconnection)
  const core = store.get({ name: 'test-core' })
  await core.ready()
  console.log(label, `✅ Successfully created a new core with the key`)
  console.log(label, { corekey: core.key.toString('hex') })
  await core.append('Hello , agent')
  console.log(label, 'Joining discovery key:', core.discoveryKey.toString('hex'))
  const discovery = swarm.join(core.discoveryKey, { server: true, client: false })
  await discovery.flushed()
  return
  async function onconnection (socket, info) {
    socket.on('error', onerror)
    console.log(label, {conn: 'onconnection', pubkey: info.publicKey.toString('hex')})
    store.replicate(socket)
    iid = setInterval(append_more, 1000)
  }
  function onerror (err) {
    clearInterval(iid)
    console.log(label, 'socket error', err)
  }
  function append_more () {
    const time = Math.floor(process.uptime())
    const stamp = `${time/60/60|0}h:${time/60|0}m:${time%60}s`
    core.append(`uptime: ${stamp}`)
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

