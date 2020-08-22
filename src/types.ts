export type XYZ = [number, number, number];
export type XZ = [number, number];
export type anyobject = { [index: string]: any };

export interface IView3duint16 {
	data: Uint16Array;
	shape: XYZ;
	stride: XYZ;
	offset: number;
	[index: string]: any;
}
