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
  const store = new Corestore('./storage-2')
  
  const key = 'a9cd94a4506dcc926bd62041eeef0de018df2b67162a321b6a6cf43b200e0c00'
  const clonedCore = store.get(b4a.from(key, 'hex'))
  await clonedCore.ready()

  console.log('Joining discovery key:', clonedCore.discoveryKey.toString('hex'))
  swarm.join(clonedCore.discoveryKey, { server: false, client: true })
  setInterval(() => swarm.flush(), 5000)

  swarm.on('connection', async (socket, info) => {
    socket.on('error', (err) => console.log('socket error', err))
    console.log({conn: 'onconnection', pubkey: info.publicKey.toString('hex')})
    store.replicate(socket)
  })

  clonedCore.on('append', async () => {
    console.log("📥 New data received!")
    const data = await clonedCore.get(0)
    console.log(`✅ Successfully fetched data: ${data}`)
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

