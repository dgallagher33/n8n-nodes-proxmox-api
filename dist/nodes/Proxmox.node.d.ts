import type { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Proxmox implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getNodeOptions(this: ILoadOptionsFunctions): Promise<{
                name: string;
                value: string;
            }[]>;
            getLxcVmidOptions(this: ILoadOptionsFunctions): Promise<import("../helpers/lxc").LxcOption[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
