// Pinned, bundled PDF.js modules are compressed only for distribution.
export async function unpack(prefix,count){
 const parts=await Promise.all(Array.from({length:count},async(_,i)=>{const response=await fetch(prefix+'.'+i+'.bin');if(!response.ok)throw Error('PDF読込ファイルの取得に失敗しました。オンラインで更新してください。');return response.arrayBuffer();}));
 const stream=new Blob(parts).stream().pipeThrough(new DecompressionStream('gzip'));
 const url=URL.createObjectURL(new Blob([await new Response(stream).arrayBuffer()],{type:'text/javascript'}));
 try{return await import(url);}finally{URL.revokeObjectURL(url);}
}
