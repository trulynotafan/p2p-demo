# Demo of a p2p exchange using Hyperswarm, Corestore and Hypercore by Holepunch

## RUN

### 1. run peer
e.g.: `node peer.js`
```
{
  peerkey: '3c52abc34666f93253e72f99f6775469f23252a4c960d3cece88aea95fa68c04'
}
✅ Successfully created a new core with the key
{
  corekey: '0944e627af376eb0969f0507587de8e42f0943140286fdf0c6022a87dea3394f'
}
Joining discovery key: f6ec06f855e6892d7fbe8bdc0134ef822b3715dc612b07083075921d7c7b6f10
```
 => copy the logged `corekey` to peer-2.js file

### 2. run peer2
e.g.:
`node peer-2.js 0944e627af376eb0969f0507587de8e42f0943140286fdf0c6022a87dea3394f`
```
{
  peerkey: '0b007be742eafa9e7a8af3b5817ed47b0a39289c0164f51cfec6a5159bf3b7cc'
}
Joining swarm for discovery key: {
  core: {
    key: '0944e627af376eb0969f0507587de8e42f0943140286fdf0c6022a87dea3394f',
    discovery_key: 'f6ec06f855e6892d7fbe8bdc0134ef822b3715dc612b07083075921d7c7b6f10'
  }
}
{
  conn: 'onconnection',
  peerkey: '3c52abc34666f93253e72f99f6775469f23252a4c960d3cece88aea95fa68c04'
}
📥 New data received!
✅ Successfully fetched data: Hello , agent
```
### 3.reset
if you want to start over, just delete the storage folder:
e.g.: `rm -rf ./storage` and `rm -rf ./storage-2`