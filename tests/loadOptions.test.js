const assert = require('assert');

const { Proxmox } = require('../dist/nodes/Proxmox.node');

async function run() {
	const proxmox = new Proxmox();
	const mockThis = {
		getCurrentNodeParameter: (name) => {
			if (name === 'guestType') {
				return 'lxc';
			}
			if (name === 'nodeName') {
				return 'node-1';
			}
			return undefined;
		},
		getNodeParameter: () => {
			throw new Error('getNodeParameter should not be called in load options');
		},
		getCredentials: async () => ({
			baseUrl: 'https://example.test',
			apiTokenId: 'token',
			apiTokenSecret: 'secret',
			allowSelfSignedCerts: true,
		}),
		helpers: {
			request: async () => ({
				data: [
					{
						vmid: 101,
						name: 'container-one',
					},
				],
			}),
		},
		logger: {
			debug: () => {},
		},
		getNode: () => ({
			name: 'Proxmox',
		}),
	};

	const options = await proxmox.methods.loadOptions.getGuestOptions.call(mockThis);

	assert.deepStrictEqual(options, [
		{
			name: 'container-one (101)',
			value: 101,
		},
	]);
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
