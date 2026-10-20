/* Browser bridge to mGBA's native GBA cheat engine (MPL-2.0). */
#include <mgba/core/cheats.h>
#include <mgba/internal/gba/cheats.h>
#include <string.h>
EMSCRIPTEN_KEEPALIVE void cheats_clear(void) {
 if(c) mCheatDeviceClear(c->cheatDevice(c));
}
/* Validate the entire group before installing. Negative result = invalid line. */
EMSCRIPTEN_KEEPALIVE int cheats_add(const char* text,int type) {
 if(!c || !text || type<0 || type>4) return -1;
 struct mCheatDevice* device=c->cheatDevice(c);
 struct mCheatSet* set=device->createSet(device,"Browser cheat");
 char* copy=strdup(text); if(!copy){mCheatSetDeinit(set);free(set);return -1;}
 int line=0; char* cursor=copy;
 while(cursor && *cursor){
  char* next=strchr(cursor,'\n');if(next)*next++=0; ++line;
  if(*cursor && !mCheatAddLine(set,cursor,type)){free(copy);mCheatSetDeinit(set);free(set);return -line;}
  cursor=next;
 }
 free(copy);
 struct GBACheatSet* gba=(struct GBACheatSet*)set;
 if(!line || gba->incompleteCheat!=COMPLETE || gba->incompletePatch || gba->remainingAddresses){mCheatSetDeinit(set);free(set);return -(line+1);}
 set->enabled=true;mCheatAddSet(device,set);return 1;
}
EMSCRIPTEN_KEEPALIVE void cheats_button(int down){if(c)mCheatPressButton(c->cheatDevice(c),down!=0);}
