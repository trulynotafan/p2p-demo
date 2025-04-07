const b4a = require('b4a')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')
const crypto = require("hypercore-crypto")
const process = require("bare-process") //new module for uptime, though we can use simple counter. But the counter 

start()

/******************************************************************************
  START
******************************************************************************/
async function start (iid) {
  const label = '\x1b[32m[writer]\x1b[0m'
  const startTime = process.hrtime()
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

  function append_more () {
    const time = Math.floor(process.hrtime(startTime)[0]) //using process.hrtime()
    const stamp = `${time/60/60|0}h:${time/60|0}m:${time%60}s`
    core.append(`uptime: ${stamp}`)
  }

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
}
/******************************************************************************
  HELPER
******************************************************************************/
function create_noise_keypair ({namespace, seed, name}) {
  const noiseSeed = deriveSeed(seed, namespace, name)
  const publicKey = b4a.alloc(32)
  const secretKey = b4a.alloc(64)
  if (noiseSeed) sodium.crypto_sign_seed_keypair(publicKey, secretKey, noiseSeed)
  else sodium.crypto_sign_keypair(publicKey, secretKey)
  
  return { publicKey, secretKey }
}

function deriveSeed (primaryKey, namespace, name) {

  if (!b4a.isBuffer(namespace)) namespace = b4a.from(namespace) 
  if (!b4a.isBuffer(name)) name = b4a.from(name)
  const out = b4a.alloc(32)
  sodium.crypto_generichash_batch(out, [namespace, name], primaryKey)
  return out
}
