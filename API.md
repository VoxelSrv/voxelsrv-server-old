## Plugin API
They might be incomplete, so it's better to just check the source code!

### Hooks: `require('../src/hooks')`
* `create(name, size)` - Create hooks (used internally). Size changes number of priorities. Server uses by default size of 5 (0 - 4)
* `execute(name, data)` - Executes hooks, from priority 0 to X
* `add(name, priority, func)` - Add function *func* to hooks execution, based on priority. You can add multiple functions to each priority

### Player: `require('../src/player')`
* `create(id, data)` - Creates player
* `get(id)` - Returns player object
* `getAll()` - Returns list of players
* `event` - Event emitter

### Entity: `require('../src/entity')`
* `create(id, data)` - Creates entity (and returns it)
* `get(id)` - Returns entity
* `getAll()` - Returns all entities

**Entity object**
* teleport(pos, eworld) - Teleports entity to pos (in eworld)
* move(pos) - Moves entity
* rotate(rot) - Rotates entity
* remove() - Removes entity

### Protocol: `require('../src/protocol')`
* `send(id, type, data)`- Send packet to player
* `sendAll(type, data)` - Sends packet to all players
* `getSocket(id)` - Returns player's socket
* `event` - Event emitter

### Items: `require('../src/items')`
* `get()`- Returns list of all items
* `getStack(id)` - Returns maximum stack size of item

### Blocks: `require('../src/blocks')`
* `get()`- Returns list of blocks
* `getIDs()` - Returns list of blocksIDs

### Chat: `require('../src/chat')`
* `send(id, msg)`- Sends message to player. If id == -1, sends message to console, id == -2 sends to all players and console
* `sendAll(msg)` - Sends message to all players/console
* `event`- Event emitter

### Commands: `require('../src/commands')`
* `register(command, func, description)`- Registers command
* `execute(id, args)`- Executes command
* `event`- Event emitter

### World: `require('../src/world/main')`
* `(async) chunk(id)` - Returns chunk
* `setBlock(pos, id)` - Sets block at pos to id
* `getBlock(pos)` - Returns block
* `toChunk(pos)` - Return id of chunk and local position in it
* `setChunk(id, data)` - Sets chunk (blocks) to *data* (ndarray)
* `setChunkData(id, data)` - Sets chunk's (meta)data to *data*
* `getChunk(id)` - Returns chunk (blocks)
* `getChunkData(id)` - Returns chunk's (meta)data
* `getHighestBlock(chunk, x, z)` - Gets highest block at [x, z] position within chunk (Object, not id)

