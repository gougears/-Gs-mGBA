import {unpack} from './unpack.js';
const m=await unpack(new URL('chunks/worker',import.meta.url),17);
export const WorkerMessageHandler=m.WorkerMessageHandler;
