import {KbChannel} from "./kb-channel.model";

export class ChannelConfig {
	public name: string;
	public model: string;
	public max_tokens: number;
	public temperature: number;
	public max_context_length: number;
	public system_prompt: string;
	public initial_message: string = '';
	public kbs: KbChannel[];
	public uuid: string;

	constructor(partial?: Partial<ChannelConfig>) {
		if (!!partial) {
			Object.assign(this, partial);
		}
	}

}