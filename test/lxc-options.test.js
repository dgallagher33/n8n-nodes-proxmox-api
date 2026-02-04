const test = require('node:test');
const assert = require('node:assert/strict');

const { buildLxcVmidOptions } = require('../dist/helpers/lxc');

test('buildLxcVmidOptions uses name or hostname with vmid fallback', () => {
	const options = buildLxcVmidOptions([
		{ vmid: 101, name: 'app' },
		{ vmid: '102', hostname: 'db' },
		{ vmid: 103 },
	]);

	assert.deepEqual(options, [
		{ name: 'app', value: 101 },
		{ name: 'db', value: '102' },
		{ name: 'LXC 103', value: 103 },
	]);
});

test('buildLxcVmidOptions skips entries without vmid', () => {
	const options = buildLxcVmidOptions([
		{ vmid: 201, name: 'api' },
		{ vmid: '' },
		{ vmid: null },
	]);

	assert.deepEqual(options, [{ name: 'api', value: 201 }]);
});
