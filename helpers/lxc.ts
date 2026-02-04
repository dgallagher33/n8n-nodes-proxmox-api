export interface LxcSummary {
	vmid: number | string;
	name?: string;
	hostname?: string;
}

export interface LxcOption {
	name: string;
	value: number | string;
}

export function buildLxcVmidOptions(lxcs: LxcSummary[]): LxcOption[] {
	return lxcs
		.filter((lxc) => lxc.vmid !== undefined && lxc.vmid !== null && lxc.vmid !== '')
		.map((lxc) => {
			const label = lxc.name ?? lxc.hostname ?? `LXC ${lxc.vmid}`;
			return {
				name: label,
				value: lxc.vmid,
			};
		});
}
