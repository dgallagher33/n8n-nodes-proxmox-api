export interface LxcSummary {
    vmid: number | string;
    name?: string;
    hostname?: string;
}
export interface LxcOption {
    name: string;
    value: number | string;
}
export declare function buildLxcVmidOptions(lxcs: LxcSummary[]): LxcOption[];
