import * as $protobuf from "protobufjs";
/** Properties of an entity. */
export interface Ientity {

    /** entity uuid */
    uuid?: (string|null);

    /** entity type */
    type?: (string|null);

    /** entity data */
    data?: (string|null);
}

/** Represents an entity. */
export class entity implements Ientity {

    /**
     * Constructs a new entity.
     * @param [properties] Properties to set
     */
    constructor(properties?: Ientity);

    /** entity uuid. */
    public uuid: string;

    /** entity type. */
    public type: string;

    /** entity data. */
    public data: string;

    /**
     * Creates a new entity instance using the specified properties.
     * @param [properties] Properties to set
     * @returns entity instance
     */
    public static create(properties?: Ientity): entity;

    /**
     * Encodes the specified entity message. Does not implicitly {@link entity.verify|verify} messages.
     * @param message entity message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Ientity, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified entity message, length delimited. Does not implicitly {@link entity.verify|verify} messages.
     * @param message entity message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Ientity, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an entity message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns entity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): entity;

    /**
     * Decodes an entity message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns entity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): entity;

    /**
     * Verifies an entity message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an entity message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns entity
     */
    public static fromObject(object: { [k: string]: any }): entity;

    /**
     * Creates a plain object from an entity message. Also converts values to other types if specified.
     * @param message entity
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: entity, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this entity to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a chunk. */
export interface Ichunk {

    /** chunk version */
    version?: (number|null);

    /** chunk stage */
    stage?: (number|null);

    /** chunk blocks */
    blocks?: (Uint8Array|null);

    /** chunk entities */
    entities?: ({ [k: string]: Ientity }|null);
}

/** Represents a chunk. */
export class chunk implements Ichunk {

    /**
     * Constructs a new chunk.
     * @param [properties] Properties to set
     */
    constructor(properties?: Ichunk);

    /** chunk version. */
    public version: number;

    /** chunk stage. */
    public stage: number;

    /** chunk blocks. */
    public blocks: Uint8Array;

    /** chunk entities. */
    public entities: { [k: string]: Ientity };

    /**
     * Creates a new chunk instance using the specified properties.
     * @param [properties] Properties to set
     * @returns chunk instance
     */
    public static create(properties?: Ichunk): chunk;

    /**
     * Encodes the specified chunk message. Does not implicitly {@link chunk.verify|verify} messages.
     * @param message chunk message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: Ichunk, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified chunk message, length delimited. Does not implicitly {@link chunk.verify|verify} messages.
     * @param message chunk message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: Ichunk, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a chunk message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns chunk
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): chunk;

    /**
     * Decodes a chunk message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns chunk
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): chunk;

    /**
     * Verifies a chunk message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a chunk message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns chunk
     */
    public static fromObject(object: { [k: string]: any }): chunk;

    /**
     * Creates a plain object from a chunk message. Also converts values to other types if specified.
     * @param message chunk
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: chunk, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this chunk to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}
