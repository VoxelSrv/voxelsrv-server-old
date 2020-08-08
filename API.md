## Plugin API
They might be incomplete, so it's better to just check the source code!
To use it, you need to use require('../src/api')

### hooks:
* `create(name, size)` - Create hooks (used internally). Size changes number of priorities. Server uses by default size of 5 (0 - 4)
* `execute(name, data)` - Executes hooks, from priority 0 to X
* `add(name, priority, func)` - Add function *func* to hooks execution, based on priority. You can add multiple functions to each priority

### players:
* `get(id)` - Returns player object
* `getAll()` - Returns list of players
* `event` - Event emitter

#### Player [Object/Class]
* `entity` [Object/Class] - look **Entity [Object/Class]**
* `world` [String] - Player's world name
* `inventory` [Object/Class] - look **PlayerInventiory [Object/Class]
* `id` [String] - Player's id 
* `nickname` [String] - Player's nickname
* `socket` [Socket.io Socket] - Player's connection socket
* `chunks` [Object] - Chunks loaded by player
* `remove()` - Removes player
* `teleport(pos, eworld)` - Teleports player to pos (array) in eworld (text)
* `move(pos)` - Moves player to pos (array)
* `rotate(rot)` - Rotates player

### entities:
* `create(data, worldName)` - Creates entity (and returns it)
* `recreate(id, data, worldName)`
* `get(id)` - Returns entity
* `getAll()` - Returns all entities

#### Entity [Object/Class]
* `teleport(pos, eworld)` - Teleports entity to pos (array) in eworld (string)
* `move(pos)` - Moves entity to pos (array)
* `rotate(rot)` - Rotates entity
* `remove()` - Removes entity

### protocol:
* `send(id, type, data)`- Send packet to player
* `sendAll(type, data)` - Sends packet to all players
* `getSocket(id)` - Returns player's socket
* `event` - Event emitter

### items:
* `get()`- Returns list of all items
* `getStack(id)` - Returns maximum stack size of item

### blocks:
* `get()`- Returns list of blocks
* `getIDs()` - Returns list of blocksIDs

### chat:
* `send(id, msg)`- Sends message to player. If id == -1, sends message to console, id == -2 sends to all players and console
* `sendAll(msg)` - Sends message to all players/console
* `event`- Event emitter

### commands:
* `register(command, func, description)`- Registers command
* `execute(id, args)`- Executes command
* `event`- Event emitter

### worlds:
* `create(name, seed, generator)` - Creates new world named name (String), with seed (Number) and selected generator (String)
* `load(name)` - Loads world
* `unload(name)` - Unloads world
* `exist(name)` - Checks, if world exist
* `get(name)` - Returns world Object/Class
* `getAll()` - Returns all loaded worlds
* `toChunk(pos)` - Converts global coordinates to local ones
* `validateID(id)` - Validates chunk id (Array)
* `addGenerator(name, worldgen)` - Adds new generator [worldgen - function] named *name*

#### world [Object/Class]
* `(async) getChunk(id)` - Returns chunk
* `setBlock(data, pos)` - Sets block at pos to data
* `getBlock(data)` - Returns block
* `toChunk(pos)` - Return id of chunk and local position in it
