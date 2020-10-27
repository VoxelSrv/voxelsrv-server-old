/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function (global, factory) {
    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);
    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));
})(this, function ($protobuf) {
    "use strict";
    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    $root.entity = (function () {
        /**
         * Properties of an entity.
         * @exports Ientity
         * @interface Ientity
         * @property {string|null} [uuid] entity uuid
         * @property {string|null} [type] entity type
         * @property {string|null} [data] entity data
         */
        /**
         * Constructs a new entity.
         * @exports entity
         * @classdesc Represents an entity.
         * @implements Ientity
         * @constructor
         * @param {Ientity=} [properties] Properties to set
         */
        function entity(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
        /**
         * entity uuid.
         * @member {string} uuid
         * @memberof entity
         * @instance
         */
        entity.prototype.uuid = "";
        /**
         * entity type.
         * @member {string} type
         * @memberof entity
         * @instance
         */
        entity.prototype.type = "";
        /**
         * entity data.
         * @member {string} data
         * @memberof entity
         * @instance
         */
        entity.prototype.data = "";
        /**
         * Creates a new entity instance using the specified properties.
         * @function create
         * @memberof entity
         * @static
         * @param {Ientity=} [properties] Properties to set
         * @returns {entity} entity instance
         */
        entity.create = function create(properties) {
            return new entity(properties);
        };
        /**
         * Encodes the specified entity message. Does not implicitly {@link entity.verify|verify} messages.
         * @function encode
         * @memberof entity
         * @static
         * @param {Ientity} message entity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        entity.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.uuid != null && Object.hasOwnProperty.call(message, "uuid"))
                writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.uuid);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.type);
            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.data);
            return writer;
        };
        /**
         * Encodes the specified entity message, length delimited. Does not implicitly {@link entity.verify|verify} messages.
         * @function encodeDelimited
         * @memberof entity
         * @static
         * @param {Ientity} message entity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        entity.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes an entity message from the specified reader or buffer.
         * @function decode
         * @memberof entity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {entity} entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        entity.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.entity();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1:
                        message.uuid = reader.string();
                        break;
                    case 2:
                        message.type = reader.string();
                        break;
                    case 3:
                        message.data = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes an entity message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof entity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {entity} entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        entity.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies an entity message.
         * @function verify
         * @memberof entity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        entity.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.uuid != null && message.hasOwnProperty("uuid"))
                if (!$util.isString(message.uuid))
                    return "uuid: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.data != null && message.hasOwnProperty("data"))
                if (!$util.isString(message.data))
                    return "data: string expected";
            return null;
        };
        /**
         * Creates an entity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof entity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {entity} entity
         */
        entity.fromObject = function fromObject(object) {
            if (object instanceof $root.entity)
                return object;
            var message = new $root.entity();
            if (object.uuid != null)
                message.uuid = String(object.uuid);
            if (object.type != null)
                message.type = String(object.type);
            if (object.data != null)
                message.data = String(object.data);
            return message;
        };
        /**
         * Creates a plain object from an entity message. Also converts values to other types if specified.
         * @function toObject
         * @memberof entity
         * @static
         * @param {entity} message entity
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        entity.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.uuid = "";
                object.type = "";
                object.data = "";
            }
            if (message.uuid != null && message.hasOwnProperty("uuid"))
                object.uuid = message.uuid;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = message.data;
            return object;
        };
        /**
         * Converts this entity to JSON.
         * @function toJSON
         * @memberof entity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        entity.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return entity;
    })();
    $root.chunk = (function () {
        /**
         * Properties of a chunk.
         * @exports Ichunk
         * @interface Ichunk
         * @property {number|null} [version] chunk version
         * @property {number|null} [stage] chunk stage
         * @property {Uint8Array|null} [blocks] chunk blocks
         * @property {Object.<string,Ientity>|null} [entities] chunk entities
         */
        /**
         * Constructs a new chunk.
         * @exports chunk
         * @classdesc Represents a chunk.
         * @implements Ichunk
         * @constructor
         * @param {Ichunk=} [properties] Properties to set
         */
        function chunk(properties) {
            this.entities = {};
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
        /**
         * chunk version.
         * @member {number} version
         * @memberof chunk
         * @instance
         */
        chunk.prototype.version = 0;
        /**
         * chunk stage.
         * @member {number} stage
         * @memberof chunk
         * @instance
         */
        chunk.prototype.stage = 0;
        /**
         * chunk blocks.
         * @member {Uint8Array} blocks
         * @memberof chunk
         * @instance
         */
        chunk.prototype.blocks = $util.newBuffer([]);
        /**
         * chunk entities.
         * @member {Object.<string,Ientity>} entities
         * @memberof chunk
         * @instance
         */
        chunk.prototype.entities = $util.emptyObject;
        /**
         * Creates a new chunk instance using the specified properties.
         * @function create
         * @memberof chunk
         * @static
         * @param {Ichunk=} [properties] Properties to set
         * @returns {chunk} chunk instance
         */
        chunk.create = function create(properties) {
            return new chunk(properties);
        };
        /**
         * Encodes the specified chunk message. Does not implicitly {@link chunk.verify|verify} messages.
         * @function encode
         * @memberof chunk
         * @static
         * @param {Ichunk} message chunk message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        chunk.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 1, wireType 0 =*/ 8).uint32(message.version);
            if (message.stage != null && Object.hasOwnProperty.call(message, "stage"))
                writer.uint32(/* id 2, wireType 0 =*/ 16).uint32(message.stage);
            if (message.blocks != null && Object.hasOwnProperty.call(message, "blocks"))
                writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.blocks);
            if (message.entities != null && Object.hasOwnProperty.call(message, "entities"))
                for (var keys = Object.keys(message.entities), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 4, wireType 2 =*/ 34).fork().uint32(/* id 1, wireType 2 =*/ 10).string(keys[i]);
                    $root.entity.encode(message.entities[keys[i]], writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim().ldelim();
                }
            return writer;
        };
        /**
         * Encodes the specified chunk message, length delimited. Does not implicitly {@link chunk.verify|verify} messages.
         * @function encodeDelimited
         * @memberof chunk
         * @static
         * @param {Ichunk} message chunk message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        chunk.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a chunk message from the specified reader or buffer.
         * @function decode
         * @memberof chunk
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {chunk} chunk
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        chunk.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.chunk(), key, value;
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                    case 1:
                        message.version = reader.uint32();
                        break;
                    case 2:
                        message.stage = reader.uint32();
                        break;
                    case 3:
                        message.blocks = reader.bytes();
                        break;
                    case 4:
                        if (message.entities === $util.emptyObject)
                            message.entities = {};
                        var end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            var tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.entity.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                            }
                        }
                        message.entities[key] = value;
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a chunk message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof chunk
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {chunk} chunk
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        chunk.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a chunk message.
         * @function verify
         * @memberof chunk
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        chunk.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isInteger(message.version))
                    return "version: integer expected";
            if (message.stage != null && message.hasOwnProperty("stage"))
                if (!$util.isInteger(message.stage))
                    return "stage: integer expected";
            if (message.blocks != null && message.hasOwnProperty("blocks"))
                if (!(message.blocks && typeof message.blocks.length === "number" || $util.isString(message.blocks)))
                    return "blocks: buffer expected";
            if (message.entities != null && message.hasOwnProperty("entities")) {
                if (!$util.isObject(message.entities))
                    return "entities: object expected";
                var key = Object.keys(message.entities);
                for (var i = 0; i < key.length; ++i) {
                    var error = $root.entity.verify(message.entities[key[i]]);
                    if (error)
                        return "entities." + error;
                }
            }
            return null;
        };
        /**
         * Creates a chunk message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof chunk
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {chunk} chunk
         */
        chunk.fromObject = function fromObject(object) {
            if (object instanceof $root.chunk)
                return object;
            var message = new $root.chunk();
            if (object.version != null)
                message.version = object.version >>> 0;
            if (object.stage != null)
                message.stage = object.stage >>> 0;
            if (object.blocks != null)
                if (typeof object.blocks === "string")
                    $util.base64.decode(object.blocks, message.blocks = $util.newBuffer($util.base64.length(object.blocks)), 0);
                else if (object.blocks.length)
                    message.blocks = object.blocks;
            if (object.entities) {
                if (typeof object.entities !== "object")
                    throw TypeError(".chunk.entities: object expected");
                message.entities = {};
                for (var keys = Object.keys(object.entities), i = 0; i < keys.length; ++i) {
                    if (typeof object.entities[keys[i]] !== "object")
                        throw TypeError(".chunk.entities: object expected");
                    message.entities[keys[i]] = $root.entity.fromObject(object.entities[keys[i]]);
                }
            }
            return message;
        };
        /**
         * Creates a plain object from a chunk message. Also converts values to other types if specified.
         * @function toObject
         * @memberof chunk
         * @static
         * @param {chunk} message chunk
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        chunk.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.objects || options.defaults)
                object.entities = {};
            if (options.defaults) {
                object.version = 0;
                object.stage = 0;
                if (options.bytes === String)
                    object.blocks = "";
                else {
                    object.blocks = [];
                    if (options.bytes !== Array)
                        object.blocks = $util.newBuffer(object.blocks);
                }
            }
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.stage != null && message.hasOwnProperty("stage"))
                object.stage = message.stage;
            if (message.blocks != null && message.hasOwnProperty("blocks"))
                object.blocks = options.bytes === String ? $util.base64.encode(message.blocks, 0, message.blocks.length) : options.bytes === Array ? Array.prototype.slice.call(message.blocks) : message.blocks;
            var keys2;
            if (message.entities && (keys2 = Object.keys(message.entities)).length) {
                object.entities = {};
                for (var j = 0; j < keys2.length; ++j)
                    object.entities[keys2[j]] = $root.entity.toObject(message.entities[keys2[j]], options);
            }
            return object;
        };
        /**
         * Converts this chunk to JSON.
         * @function toJSON
         * @memberof chunk
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        chunk.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return chunk;
    })();
    return $root;
});
//# sourceMappingURL=world.js.map