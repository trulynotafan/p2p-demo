const b4a = require('b4a')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')
const derive_seed = require('derive-key')
const crypto = require("hypercore-crypto")


async function start () {
  const opts = { 
    namespace: 'noisekeys', 
    seed: crypto.randomBytes(32), 
    name: 'noise' 
  }
  const { publicKey, secretKey } = create_noise_keypair (opts)
  console.log({ publicKey: publicKey.toString('hex')})
  const keyPair = { publicKey, secretKey }
  swarm = new Hyperswarm({ keyPair })
  const store = new Corestore('./storage')
  
  const core = store.get({ name: 'test-core' })
  await core.ready()
  console.log(`✅ Successfully created a new core with the key`)
  console.log({ key: core.key.toString('hex') })
  await core.append('Hello , agent')

  console.log('Joining discovery key:', core.discoveryKey.toString('hex'))
  const discovery = swarm.join(core.discoveryKey, { server: true, client: false })
  await discovery.flushed()

  swarm.on('connection', async (socket, info) => {
    socket.on('error', (err) => console.log('socket error', err))
    console.log({conn: 'onconnection', pubkey: info.publicKey.toString('hex')})
    store.replicate(socket)
  })

}

start()

///////////////////////

function create_noise_keypair ({ namespace, seed, name }) {
  const noiseSeed = derive_seed(namespace, seed, name)
  const publicKey = b4a.alloc(32)
  const secretKey = b4a.alloc(64)
  if (noiseSeed) sodium.crypto_sign_seed_keypair(publicKey, secretKey, noiseSeed)
  else sodium.crypto_sign_keypair(publicKey, secretKey)
  return { publicKey, secretKey }
}

