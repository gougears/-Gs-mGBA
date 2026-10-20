import {unpack} from './unpack.js';
const m=await unpack(new URL('chunks/jpeg',import.meta.url),5);
export default m.default;
