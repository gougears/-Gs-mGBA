#include <emscripten.h>
#include <mgba/core/core.h>
#include <mgba-util/vfs.h>
#include <mgba-util/audio-buffer.h>
#include <stdlib.h>
#include <mgba/core/serialize.h>
#include <mgba/internal/gba/gba.h>
#include <mgba/internal/gba/savedata.h>
static struct mCore* c;
static mColor pixels[240*160];
static int16_t samples[8192*2];
static void* save;
static void* quick;
void link_disable(void);
struct mCore* web_core(void){return c;}
EMSCRIPTEN_KEEPALIVE void stop(void) { link_disable();free(quick);quick=0; if(c) { mCoreConfigDeinit(&c->config); c->deinit(c); c=0; } free(save); save=0; }
EMSCRIPTEN_KEEPALIVE int start(const void* rom, int size) {
 stop(); c=mCoreCreate(mPLATFORM_GBA); if(!c || !c->init(c)) return 0;
 mCoreInitConfig(c,"web"); mCoreConfigSetDefaultIntValue(&c->config,"overclock",2); mCoreConfigSetDefaultIntValue(&c->config,"volume",256); mCoreLoadConfig(c);
 c->setVideoBuffer(c,pixels,240); c->setAudioBufferSize(c,8192);
 struct VFile* f=VFileMemChunk(rom,size); if(!f || !c->loadROM(c,f)) { if(f) f->close(f); stop(); return 0; }
 c->reset(c); return 1;
}
EMSCRIPTEN_KEEPALIVE void frame(int keys) { if(c) { c->setKeys(c,keys); c->runFrame(c); } }
EMSCRIPTEN_KEEPALIVE void* video(void) {return pixels;}
EMSCRIPTEN_KEEPALIVE int audio_read(void) {return c?mAudioBufferRead(c->getAudioBuffer(c),samples,8192):0;}
EMSCRIPTEN_KEEPALIVE void* audio_ptr(void) {return samples;}
EMSCRIPTEN_KEEPALIVE int audio_rate(void) {return c?c->audioSampleRate(c):32768;}
EMSCRIPTEN_KEEPALIVE int save_size(void) {free(save);save=0;return c?c->savedataClone(c,&save):0;}
EMSCRIPTEN_KEEPALIVE void* save_ptr(void) {return save;}
EMSCRIPTEN_KEEPALIVE int restore(const void* p,int n) {if(!c)return 0; struct VFile* f=VFileMemChunk(p,n); if(!f)return 0; if(n>=131072)GBASavedataForceType(&((struct GBA*)c->board)->memory.savedata,GBA_SAVEDATA_FLASH1M); if(!c->loadSave(c,f)){f->close(f);return 0;} return 1;}
EMSCRIPTEN_KEEPALIVE void reset_game(void) {if(c)c->reset(c);}
EMSCRIPTEN_KEEPALIVE int read_mem(int addr) {return c?c->busRead8(c,addr):0;}
EMSCRIPTEN_KEEPALIVE void write_mem(int addr,int value) {if(c)c->busWrite8(c,addr,value);}

EMSCRIPTEN_KEEPALIVE int quick_size(void){
 free(quick);quick=0;if(!c)return 0;
 struct VFile* f=VFileMemChunk(NULL,0);if(!f)return 0;
 if(!mCoreSaveStateNamed(c,f,SAVESTATE_SAVEDATA|SAVESTATE_RTC|SAVESTATE_METADATA)){f->close(f);return 0;}
 int n=f->size(f);quick=malloc(n);if(!quick){f->close(f);return 0;}
 f->seek(f,0,SEEK_SET);int ok=f->read(f,quick,n)==n;f->close(f);return ok?n:0;
}
EMSCRIPTEN_KEEPALIVE void* quick_ptr(void){return quick;}
EMSCRIPTEN_KEEPALIVE int quick_load(const void* p,int n){if(!c||n<16)return 0;struct VFile* f=VFileFromConstMemory(p,n);if(!f)return 0;int ok=mCoreLoadStateNamed(c,f,SAVESTATE_SAVEDATA|SAVESTATE_RTC);f->close(f);if(ok)mAudioBufferClear(c->getAudioBuffer(c));return ok;}


#include "browser-cheats.inc"
