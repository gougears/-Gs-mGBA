import {unpack} from './unpack.js';
const m=await unpack(new URL('chunks/jbig',import.meta.url),2);
export default m.default;
