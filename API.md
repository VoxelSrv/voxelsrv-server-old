## Plugin API

### Hooks: `require('../src/hooks')`
* `create(name, size)` - Create hooks (used internally). Size changes number of priorities. Server uses by default size of 5 (0 - 4)
* `execute(name, data)` - Executes hooks, from priority 0 to X
* `add(name, priority, func)` - Add function *func* to hooks execution, based on priority. You can add multiple functions to each priority

### Player: `require('../src/player')`
* `create(id, data)` - Creates player
* `remove(id)` - Removes player
* `getName(id)` - Returns player's name
* `move(id, pos, bool)` - Moves player to selected position. If `bool` is *true*, acts as teleportation
* `getPos(id)` - Returns player's position
* `getData(id)` - Returns player's data object
* `getIDList()` - Returns list of players
* `inv`- Used for modification of player's inventory:
  * `setSel(id, sel)` - Changes selected hotbar slot
  * `data(id)` - Returns Inventory
  * `add(id, item, count, data)` - Adds item
  * `remove(id, item, count, data)` - Removes item
  * `set(id, slot, item, count, data)` - Sets slot to item
  * `hasItem(id, item, count)` - Checks, if player has selected item
* `event` - Event emitter
* `actions` - Actions that player can do (internal)

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

