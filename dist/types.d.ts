import { Position } from 'voxelservercore/interfaces/types';
export declare type XYZ = Position;
export declare type XZ = [number, number];
export declare type anyobject = {
    [index: string]: any;
};
export interface IView3duint16 {
    data: Uint16Array;
    shape: XYZ;
    stride: XYZ;
    offset: number;
    [index: string]: any;
}
//# sourceMappingURL=types.d.ts.map