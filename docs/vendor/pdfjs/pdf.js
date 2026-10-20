import {unpack} from './unpack.js';
const m=await unpack(new URL('chunks/pdf',import.meta.url),7);
export const getDocument=m.getDocument,GlobalWorkerOptions=m.GlobalWorkerOptions;
