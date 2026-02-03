declare module 'https' {
	export interface AgentOptions {
		rejectUnauthorized?: boolean;
	}

	export class Agent {
		constructor(options?: AgentOptions);
	}
}
