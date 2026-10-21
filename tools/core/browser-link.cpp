// Browser port of the supplied CelioNet.cpp device logic. MPL-2.0.
#include <emscripten.h>
#include <mgba/core/core.h>
#include <mgba/core/interface.h>
#include <mgba/internal/gba/gba.h>
#include <mgba/internal/gba/io.h>
#include <deque>
#include <vector>
#include <memory>
#include <cstdint>
#include <algorithm>
extern "C" struct mCore* web_core(void);
enum LinkStatus : uint16_t {
	AwaitModeEmulator = 0xFF01,
	AwaitMode = 0xFF02,
	HandshakeReceived = 0xFF03,
	HandshakeFinished = 0xFF04,
	LinkConnected = 0xFF05,
	LinkReconnecting = 0xFF06,
	LinkClosed = 0xFF07,
	DeviceReady = 0xFF08,
	EmuTradeSessionFinished = 0xFF09,
	EmuSessionStarted = 0xFF0A,
	StatusDebug = 0xFFFF,
};

enum CommandType : uint16_t {
	CmdSetMode = 0x00,
	CmdCancel = 0x01,
	CmdGetFirmwareInfo = 0x0F,
	CmdSetModeMaster = 0x10,
	CmdSetModeSlave = 0x11,
	CmdStartHandshake = 0x12,
	CmdConnectLink = 0x13,
	CmdEmuSessionStart = 0xFF0A,
};

enum class Transive { Handshake, Crc, Command };
enum class Handshake { Waiting, Listening, WaitingToRespond, Responding };
enum class Mode { Master, Slave };

class CelioNet {
public:
 struct Device;
 struct Incoming {bool isCommand; uint16_t command; std::vector<uint16_t> data;};
 struct Outgoing {bool isStatus; uint16_t status; std::vector<uint16_t> data;};
 GBA* m_gba=nullptr; mCore* core=nullptr;
 std::unique_ptr<Device> m_device;
 std::unique_ptr<mSioMask> m_mask;
 mSioMask* m_oldMask=nullptr;
 bool m_attached=false, m_deviceOn=false, overflow=false;
 std::deque<Incoming> incoming;
 std::deque<Outgoing> outgoing;
 void drainIncoming(); void setSioMask(uint16_t mask){m_mask->mask=mask;}
 void emitStatus(uint16_t s){if(s==DeviceReady||s==EmuTradeSessionFinished||s==StatusDebug)return;if(outgoing.size()<256)outgoing.push_back({true,s,{}});else overflow=true;}
 void emitData(const std::vector<uint16_t>& d){if(outgoing.size()<256)outgoing.push_back({false,0,d});else overflow=true;}
 void log(const char*){}
 static void sioReadHook(void*);static void vblankHook(void*);static void timer3Hook(void*);
 void attach(mCore*);void detach();
};
struct CelioNet::Device {
	Handshake handshake = Handshake::Waiting;
	Transive transive = Transive::Handshake;
	bool emuReconnect = false;
	bool gbaReconnect = false;
	bool keepAlive = true;
	bool startResponse = false;
	bool startConnect = false;
	std::deque<uint16_t> receivedQueue;
	std::vector<uint16_t> transmitQueue;
	std::deque<uint16_t> currentTx;
	std::vector<uint16_t> currentRx;
	int emptyDirectionStreak = 0;
	uint16_t checksum = 0;
	bool timerEnabled = false;
	int timerCount = 0;
	Mode mode = Mode::Slave;

	void resetState(bool init) {
		Mode keep = mode;
		*this = Device();
		mode = keep;
		if (!init) {
			handshake = Handshake::Listening;
		}
	}
};

void CelioNet::drainIncoming(){
 if(!m_device)return;
 Device* d=m_device.get();
 while(!incoming.empty()){
  Incoming in=std::move(incoming.front());incoming.pop_front();
  if(!in.isCommand){for(auto v:in.data){if(d->receivedQueue.size()<8192)d->receivedQueue.push_back(v);else overflow=true;}continue;}
  switch(in.command){
   case CmdCancel:d->resetState(true);d->mode=Mode::Slave;setSioMask(0xFFFF);GBAIOWrite(m_gba,GBA_REG_TM3CNT_HI,0);GBAIOWrite(m_gba,GBA_REG_TM3CNT_LO,0);break;
   case CmdSetMode:emitStatus(DeviceReady);emitStatus(AwaitMode);break;
   case CmdEmuSessionStart:emitStatus(AwaitMode);break;
   case CmdSetModeSlave:d->handshake=Handshake::Listening;d->mode=Mode::Slave;setSioMask(0x600B);break;
   case CmdSetModeMaster:d->handshake=Handshake::Listening;d->mode=Mode::Master;setSioMask(0x601F);break;
   case CmdStartHandshake:d->startResponse=true;break;
   case CmdConnectLink:d->startConnect=true;break;
  }
 }
}
void CelioNet::attach(mCore* c){
 detach();core=c;if(!c)return;m_gba=(GBA*)c->board;
 mCoreCallbacks cb{};cb.context=this;cb.vblankIRQ=vblankHook;cb.timer3IRQ=timer3Hook;
 c->clearCoreCallbacks(c);c->addCoreCallbacks(c,&cb);
 m_mask.reset(new mSioMask);m_mask->mask=0xFFFF;m_oldMask=m_gba->sioMask;
 m_gba->sioMask=m_mask.get();m_gba->sioReadHookContext=this;m_gba->sioReadHook=sioReadHook;
 m_device.reset(new Device);m_attached=m_deviceOn=true;overflow=false;
}
void CelioNet::detach(){
 if(m_attached&&m_gba){m_gba->sioMask=m_oldMask;m_gba->sioReadHook=nullptr;m_gba->sioReadHookContext=nullptr;
  if(m_device&&m_device->timerEnabled){GBAIOWrite(m_gba,GBA_REG_TM3CNT_HI,0);GBAIOWrite(m_gba,GBA_REG_TM3CNT_LO,0);}}
 m_attached=m_deviceOn=false;core=nullptr;m_gba=nullptr;m_device.reset();incoming.clear();outgoing.clear();overflow=false;
}
static CelioNet net;
static uint16_t eventWords[34];
extern "C" {
EMSCRIPTEN_KEEPALIVE int link_enable(){auto c=web_core();if(!c)return 0;net.attach(c);return 1;}
EMSCRIPTEN_KEEPALIVE void link_disable(){net.detach();}
EMSCRIPTEN_KEEPALIVE void link_command(int command){if(!net.m_attached)return;if(net.incoming.size()>=256){net.overflow=true;return;}net.incoming.push_back({true,(uint16_t)command,{}});net.drainIncoming();}
EMSCRIPTEN_KEEPALIVE int link_receive(const uint16_t* p,int n){if(!net.m_attached||n!=32||net.incoming.size()>=256)return 0;net.incoming.push_back({false,0,std::vector<uint16_t>(p,p+n)});net.drainIncoming();return 1;}
EMSCRIPTEN_KEEPALIVE uint16_t* link_event(){if(net.overflow){eventWords[0]=3;net.overflow=false;return eventWords;}if(net.outgoing.empty())return nullptr;auto e=std::move(net.outgoing.front());net.outgoing.pop_front();eventWords[0]=e.isStatus?1:2;eventWords[1]=e.isStatus?e.status:(uint16_t)e.data.size();if(!e.isStatus)std::copy_n(e.data.begin(),std::min((size_t)32,e.data.size()),eventWords+2);return eventWords;}
EMSCRIPTEN_KEEPALIVE void link_test_transfer(int rx){if(net.m_attached){net.m_gba->memory.io[0x12A/2]=(uint16_t)rx;CelioNet::sioReadHook(&net);}}
}
static void writeIo(GBA* gba, uint32_t reg, uint16_t value) {
	gba->memory.io[reg >> 1] = value;
}

static uint16_t readIo(GBA* gba, uint32_t reg) {
	return gba->memory.io[reg >> 1];
}

void CelioNet::sioReadHook(void* context) {
	CelioNet* self = static_cast<CelioNet*>(context);
	if (!self->m_attached) {
		return;
	}
	self->drainIncoming();
	Device* d = self->m_device.get();
	if (!d || !self->m_deviceOn) {
		return;
	}
	GBA* gba = self->m_gba;
	uint16_t rx = readIo(gba, 0x12A);
	uint16_t tx = 0;

	switch (d->transive) {
	case Transive::Handshake: {
		// transive_handshake
		bool done = false;
		if (rx == 0xB9A0 && d->handshake == Handshake::Listening) {
			self->emitStatus(HandshakeReceived);
			d->handshake = Handshake::WaitingToRespond;
		}
		if (d->startConnect) {
			self->emitStatus(LinkConnected);
			d->transive = Transive::Crc;
			tx = 0x8FFF;
			done = true;
		}
		if (!done) {
			if (rx == 0x8FFF) {
				self->emitStatus(LinkConnected);
				d->transive = Transive::Crc;
			}
			if (d->handshake == Handshake::Responding) {
				tx = 0xB9A0;
			} else {
				if (d->startResponse) {
					d->handshake = Handshake::Responding;
				}
				tx = 0xD15E;
			}
		}
		break;
	}
	case Transive::Crc: {
		// transive_crc
		auto flush = [self, d]() {
			std::vector<uint16_t> data(d->transmitQueue.begin(), d->transmitQueue.end());
			data.resize(32, 0);
			d->transmitQueue.clear();
			self->emitData(data);
		};
		if (d->emuReconnect && d->gbaReconnect) {
			flush();
			if (d->keepAlive) {
				self->log("device reconnecting");
				self->emitStatus(LinkReconnecting);
				d->resetState(false);
			} else {
				self->log("device link closed");
				self->emitStatus(LinkClosed);
			}
			if (d->timerEnabled) {
				d->timerEnabled = false;
			}
			d->timerCount = 0;
			GBAIOWrite(gba, GBA_REG_TM3CNT_HI, 0);
			GBAIOWrite(gba, GBA_REG_TM3CNT_LO, 0);
		} else {
			d->transive = Transive::Command;
		}
		tx = d->checksum;
		d->checksum = 0;
		break;
	}
	case Transive::Command: {
		// transive_command
		d->currentRx.push_back(rx);
		if (d->currentTx.empty()) {
			// load_tx_command
			if (d->receivedQueue.empty()) {
				d->currentTx.assign(8, 0);
			} else {
				for (int i = 0; i < 8 && !d->receivedQueue.empty(); ++i) {
					d->currentTx.push_back(d->receivedQueue.front());
					d->receivedQueue.pop_front();
				}
			}
			if (d->currentTx.size() >= 2 && d->currentTx[0] == 0xCAFE && d->currentTx[1] == 0x0017) {
				d->keepAlive = false;
			}
			if (d->currentTx[0] == 0x5FFF) {
				self->log("partner ready for reconnect");
				d->emuReconnect = true;
			}
		}
		if (d->currentRx.size() == 8) {
			if (d->currentRx[0] == 0x5FFF) {
				self->log("ready for reconnect");
				d->gbaReconnect = true;
			}
			// save_rx_command
			if (d->currentRx[0] == 0xCAFE && d->currentRx[1] == 0x0011) {
				++d->emptyDirectionStreak;
				if (d->emptyDirectionStreak > 1) {
					d->currentRx[0] = 0;
					d->currentRx[1] = 0;
				}
			} else {
				d->emptyDirectionStreak = 0;
			}
			bool queue = !d->transmitQueue.empty();
			for (uint16_t v : d->currentRx) {
				if (v) {
					queue = true;
					break;
				}
			}
			if (queue) {
				d->transmitQueue.insert(d->transmitQueue.end(), d->currentRx.begin(), d->currentRx.end());
			}
			d->currentRx.clear();
			d->transive = Transive::Crc;
		}
		if (d->transmitQueue.size() >= 32) {
			std::vector<uint16_t> data(d->transmitQueue.begin(), d->transmitQueue.end());
			data.resize(32, 0);
			d->transmitQueue.clear();
			self->emitData(data);
		}
		tx = d->currentTx.front();
		d->currentTx.pop_front();
		d->checksum = (uint16_t) (d->checksum + tx);
		d->checksum = (uint16_t) (d->checksum + rx);
		break;
	}
	}

	if (d->mode == Mode::Master) {
		writeIo(gba, 0x120, tx);
		writeIo(gba, 0x122, rx);
	} else {
		writeIo(gba, 0x120, rx);
		writeIo(gba, 0x122, tx);
	}
	writeIo(gba, 0x124, 0xFFFF);
	writeIo(gba, 0x126, 0xFFFF);
}

void CelioNet::vblankHook(void* context) {
	CelioNet* self = static_cast<CelioNet*>(context);
	if (!self->m_attached) {
		return;
	}
	self->drainIncoming();
	Device* d = self->m_device.get();
	if (!d || !self->m_deviceOn) {
		return;
	}
	GBA* gba = self->m_gba;
	// sync_timer
	uint16_t ie = readIo(gba, 0x200);
	if (d->mode == Mode::Slave || !(ie & 0x80)) {
		if (d->timerEnabled) {
			d->timerEnabled = false;
			d->timerCount = 0;
			GBAIOWrite(gba, GBA_REG_TM3CNT_HI, 0);
			GBAIOWrite(gba, GBA_REG_TM3CNT_LO, 0);
		}
		return;
	}
	writeIo(gba, 0x202, readIo(gba, 0x202) | 0x80);
	if (d->transive == Transive::Crc && !d->timerEnabled) {
		d->timerEnabled = true;
		GBAIOWrite(gba, GBA_REG_TM3CNT_LO, 0xFED0);
		GBAIOWrite(gba, GBA_REG_TM3CNT_HI, 0x00C1);
	}
}

void CelioNet::timer3Hook(void* context) {
	CelioNet* self = static_cast<CelioNet*>(context);
	if (!self->m_attached) {
		return;
	}
	Device* d = self->m_device.get();
	if (!d || !self->m_deviceOn) {
		return;
	}
	GBA* gba = self->m_gba;
	// transmission_timer
	uint16_t ie = readIo(gba, 0x200);
	if (d->mode == Mode::Slave || !(ie & 0x80)) {
		return;
	}
	writeIo(gba, 0x202, (readIo(gba, 0x202) & 0xFFBF) | 0x80);
	if (d->timerCount == 7) {
		d->timerEnabled = false;
		d->timerCount = 0;
		GBAIOWrite(gba, GBA_REG_TM3CNT_HI, 0);
		GBAIOWrite(gba, GBA_REG_TM3CNT_LO, 0);
	} else {
		++d->timerCount;
	}
}

