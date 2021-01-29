import * as types from '../../types';
export declare function globalToChunk(pos: types.XYZ): {
    id: types.XZ;
    pos: types.XYZ;
};
export declare function chunkIDFromGlobal(pos: types.XYZ): types.XZ;
export declare function globalToLocal(pos: types.XYZ): types.XYZ;
export declare function getRandomSeed(): number;
export declare function validateID(id: number[]): boolean;
//# sourceMappingURL=helper.d.ts.map