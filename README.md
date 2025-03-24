# Demo of a p2p exchange using Hyperswarm, Corestore and Hypercore by Holepunch

## RUN

### 1. run wrtier peer
e.g.: `node writer-peer.js`
```bash
[writer] start
[writer] {
  peerkey: '577dc38983c22dbce7c44a373ba080350158dca254a4ca4340ffa7097840dacc'
}
[writer] ✅ Successfully created a new core with the key
[writer] {
  corekey: '36a08a0c9ea507cf767dff65e5038bbefbd93c6540605acee1167763fd9f3c88'
}
```
=> copy the logged `corekey` to peer-2.js file

### 2. run reader peer
e.g.: `node reader-peer.js --name bob --corekey 0944e627af376eb0969f0507587de8e42f0943140286fdf0c6022a87dea3394f`
```bash
[peer-bob] start
[peer-bob] {
  peerkey: 'e77a422c1bc7961541fbdb601034ec065ed2de83a94bdd173d97a1239194a1e6'
}
[peer-bob] Joining swarm for discovery key: {
  core: {
    key: '36a08a0c9ea507cf767dff65e5038bbefbd93c6540605acee1167763fd9f3c88',
    discovery_key: '489b752be3055292d3f5c695b42f9dbda21b7cc7b6d39d6288df088ba76cf3a8'
  }
}
{
  conn: 'onconnection',
  peerkey: '577dc38983c22dbce7c44a373ba080350158dca254a4ca4340ffa7097840dacc'
}
```

### 3. run another reader peer
e.g.: `node reader-peer.js --name amy --corekey 0944e627af376eb0969f0507587de8e42f0943140286fdf0c6022a87dea3394f`
```bash
[peer-amy] start
[peer-amy] {
  peerkey: '7b64c9095e87a966695ad9bad4d4c3b6679e1d694dcc5cba91b90493dc786f19'
}
[peer-amy] Joining swarm for discovery key: {
  core: {
    key: '36a08a0c9ea507cf767dff65e5038bbefbd93c6540605acee1167763fd9f3c88',
    discovery_key: '489b752be3055292d3f5c695b42f9dbda21b7cc7b6d39d6288df088ba76cf3a8'
  }
}
{
  conn: 'onconnection',
  peerkey: '577dc38983c22dbce7c44a373ba080350158dca254a4ca4340ffa7097840dacc'
}
```

### 4. reset
if you want to start over, just delete the storage folder:
e.g.: `npm run reset`

