const b4a = require('b4a')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')
const crypto = require("hypercore-crypto")
const process = require("bare-process") //new module.

start(parse(Bare.argv.slice(2))) //bare uses Bare.argv instead of process.argv

/******************************************************************************
  START
******************************************************************************/
async function start (args, flag) {
  const { '--corekey': corekey, '--name': name } = validate(args)
  const label = `\x1b[${process.pid % 2 ? 31 : 34}m[peer-${name}]\x1b[0m` //process.pid is available in bare-process XD
  console.log(label, 'start')
  const opts = {
    namespace: 'noisekeys',
    seed: crypto.randomBytes(32),
    name: 'noise'
  }
  const { publicKey, secretKey } = create_noise_keypair (opts)
  console.log(label, { peerkey: publicKey.toString('hex')})
  const keyPair = { publicKey, secretKey }
  const store = new Corestore(`./storage-${name}`)
  const swarm = new Hyperswarm({ keyPair })
  const clonedCore = store.get(b4a.from(corekey, 'hex'))
  swarm.on('connection', onconnection)
  clonedCore.on('append', onappend)
  await clonedCore.ready()
  const unavailable = []
  if (clonedCore.length) for (var i = 0, L = clonedCore.length; i < L; i++) {
    const raw = await clonedCore.get(i, { wait: false })
    if (raw) console.log(label, 'local:', { i, message: raw.toString('utf-8') })
    else unavailable.push(i)
  }
  function onwait (index) { console.log({index}) }
  const discovery_key = clonedCore.discoveryKey.toString('hex')
  const data = { core: { key: corekey, discovery_key } }
  console.log(label, 'Joining swarm for discovery key:', data)
  swarm.join(clonedCore.discoveryKey, { server: false, client: true })
  swarm.flush()
  return
  async function onconnection (socket, info) {
    console.log({conn: 'onconnection', peerkey: info.publicKey.toString('hex')})
    socket.on('error', onerror)
    store.replicate(socket)
    for (var i = 0, L = unavailable.sort().length; i < L; i++) {
      const raw = await clonedCore.get(i)
      console.log(label, 'download:', { i, message: raw.toString('utf-8') })
    }
  }
  async function onappend () {
    const L = clonedCore.length
    if (!flag) {
      flag = true
      for (var i = 0; i < L; i++) {
        const raw = await clonedCore.get(i)
        console.log(label, 'download old:', { i, message: raw.toString('utf-8') })
      }
    }
    console.log(label, "notification: 📥 New data available", L)
    const raw = await clonedCore.get(L)
    console.log(label, { i: L, message: raw.toString('utf-8') })
  }
  function onerror (err) {
    console.log(label, 'socket error', err)

  }
}
/******************************************************************************
  HELPER
******************************************************************************/
function create_noise_keypair ({ namespace, seed, name }) {
  const noiseSeed = deriveSeed(namespace, seed, name)
  const publicKey = b4a.alloc(32)
  const secretKey = b4a.alloc(64)
  if (noiseSeed) sodium.crypto_sign_seed_keypair(publicKey, secretKey, noiseSeed)
  else sodium.crypto_sign_keypair(publicKey, secretKey)
  return { publicKey, secretKey }
}

function deriveSeed (primaryKey, namespace, name) {

  if (!b4a.isBuffer(namespace)) namespace = b4a.from(namespace) //Making sure that all three arguments are a valid buffer. Also I did compare the seed with derive-key, both generate a valid seed.
  if (!b4a.isBuffer(name)) name = b4a.from(name)
  if (!b4a.isBuffer(primaryKey)) primaryKey = b4a.from(primaryKey) 
  const out = b4a.alloc(32) 
  sodium.crypto_generichash_batch(out, [namespace, name, primaryKey])
  return out
}

function parse (L) {
  const arr = []
  for (var i = 0; i < L.length; i += 2) arr.push([L[i], L[i+1]])
  return Object.fromEntries(arr)
}
function validate (opts) {
  if (!opts['--name']) throw new Error('requires flag: --name <name_string>')
  if (!opts['--corekey']) throw new Error('requires flag: --corekey <corekey_string>')
  return opts
}
