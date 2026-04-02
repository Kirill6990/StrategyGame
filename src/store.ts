import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sender: string;
  senderId?: string;
  text: string;
  timestamp: number;
}

export interface Nation {
  id: string;
  name: string;
  shortName: string;
  ideology: string;
  status: string;
  color: string;
  ownerId: string;
  parentId?: string;
  territories: number[];
  occupations?: number[];
  flag?: string;
}

export interface Alliance {
  id: string;
  name: string;
  type: string;
  description: string;
  flag: string;
  founderId: string;
  members: string[];
}

export interface Union {
  id: string;
  name: string;
  color: string;
  flag: string;
  founderId: string;
  members: string[];
}

interface SpawnRequest {
  id: string;
  from: string;
  targetNationId: string;
  data: any;
}

interface NewsItem {
  id: string;
  text: string;
  timestamp: number;
  type: string;
  senderId?: string;
}

interface AllianceRequest {
  id: string;
  allianceId?: string;
  unionId?: string;
  nationId: string;
  nationName: string;
}

export interface UNSession {
  id: string;
  callerId: string;
  callerName: string;
  topic: string;
  votes: Record<string, 'yes' | 'no' | 'abstain'>;
  createdAt: number;
  status: 'active' | 'resolved';
}

export interface Battle {
  id: string;
  warId: string;
  x: number;
  y: number;
  attackerId: string;
  defenderId: string;
  attackerRoll?: number;
  defenderRoll?: number;
  attackerBuffs: number;
  defenderBuffs: number;
  status: 'pending' | 'rolling' | 'finished';
  winnerId?: string;
  pixelsToPaint?: number;
  resultText?: string;
  readyPlayers?: string[];
}

export interface PeaceTreaty {
  warId: string;
  territoryClaims: Record<number, string>;
  puppetClaims: Record<string, string>;
  agreements: string[];
}

export interface War {
  id: string;
  attackerId: string;
  defenderId: string;
  reason: string;
  status: 'active' | 'peace_negotiation' | 'finished';
  attackers: string[];
  defenders: string[];
  battles: Battle[];
  peaceTreaty?: PeaceTreaty;
  createdAt: number;
  finishedAt?: number;
}

interface GameState {
  socket: Socket | null;
  connected: boolean;
  nations: Nation[];
  alliances: Alliance[];
  unions: Union[];
  news: NewsItem[];
  allianceRequests: AllianceRequest[];
  allianceChats: Record<string, ChatMessage[]>;
  unSessions: UNSession[];
  wars: War[];
  finishedWars: War[];
  colonizationBattles: Battle[];
  myNation: Nation | null;
  pendingRequests: SpawnRequest[];
  spawnStatus: 'idle' | 'pending' | 'success' | 'rejected' | 'error';
  spawnMessage: string;
  setupPhase: 'server' | 'form' | 'draw';
  draftTerritories: number[];
  chatMessages: ChatMessage[];
  selectedNationId: string | null;
  setSetupPhase: (phase: 'form' | 'draw') => void;
  setDraftTerritories: (territories: number[] | ((prev: number[]) => number[])) => void;
  setSelectedNationId: (id: string | null) => void;
  connect: () => void;
  requestSpawn: (data: any) => void;
  approveSpawn: (requestId: string) => void;
  rejectSpawn: (requestId: string) => void;
  sendChatMessage: (text: string) => void;
  createAlliance: (data: any) => void;
  requestJoinAlliance: (allianceId: string) => void;
  approveAllianceJoin: (reqId: string) => void;
  rejectAllianceJoin: (reqId: string) => void;
  leaveAlliance: (allianceId: string) => void;
  sendAllianceChatMessage: (allianceId: string, text: string) => void;
  createUnion: (data: any) => void;
  updateUnion: (unionId: string, data: Partial<Union>) => void;
  requestJoinUnion: (unionId: string) => void;
  approveUnionJoin: (reqId: string) => void;
  rejectUnionJoin: (reqId: string) => void;
  leaveUnion: (unionId: string) => void;
  createUNSession: (topic: string) => void;
  voteUNSession: (sessionId: string, vote: 'yes' | 'no' | 'abstain') => void;
  declareWar: (targetId: string, reason: string) => void;
  joinWar: (warId: string, side: 'attackers' | 'defenders') => void;
  proposePeaceTreaty: (warId: string, territoryClaims: Record<number, string>, puppetClaims: Record<string, string>) => void;
  agreePeaceTreaty: (warId: string) => void;
  rejectPeaceTreaty: (warId: string) => void;
  placeBattle: (warId: string, x: number, y: number, defenderId: string) => void;
  startBattle: (warId: string, battleId: string) => void;
  paintBattleResult: (warId: string, battleId: string, paintedTerritories: number[]) => void;
  placeColonizationBattle: (x: number, y: number) => void;
  startColonizationBattle: (battleId: string) => void;
  paintColonizationResult: (battleId: string, paintedTerritories: number[]) => void;
  updateNation: (data: Partial<Nation>) => void;
  disbandNation: () => void;
  publishNews: (text: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  connected: false,
  nations: [],
  alliances: [],
  unions: [],
  news: [],
  allianceRequests: [],
  allianceChats: {},
  unSessions: [],
  wars: [],
  finishedWars: [],
  colonizationBattles: [],
  myNation: null,
  pendingRequests: [],
  spawnStatus: 'idle',
  spawnMessage: '',
  setupPhase: 'server',
  draftTerritories: [],
  chatMessages: [],
  selectedNationId: null,

  setSetupPhase: (phase) => set({ setupPhase: phase }),
  setDraftTerritories: (territories) => set((state) => ({ 
    draftTerritories: typeof territories === 'function' ? territories(state.draftTerritories) : territories 
  })),
  setSelectedNationId: (id) => set({ selectedNationId: id }),

  connect: () => {
    if (get().socket || get().connected) return;

    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
      playerId = Math.random().toString(36).substring(7);
      localStorage.setItem('playerId', playerId);
    }

    const newSocket = io({
      auth: { playerId },
      transports: ['websocket']
    });
    set({ socket: newSocket });
    
    newSocket.on('connect', () => set({ connected: true }));
    newSocket.on('disconnect', () => set({ connected: false }));
    newSocket.on('gameState', (data: { nations: Nation[], chatHistory?: ChatMessage[], alliances?: Alliance[], unions?: Union[], newsHistory?: NewsItem[], allianceRequests?: AllianceRequest[], allianceChats?: Record<string, ChatMessage[]>, unSessions?: UNSession[], wars?: War[], finishedWars?: War[], colonizationBattles?: Battle[] }) => {
      set({ 
        nations: data.nations, 
        chatMessages: data.chatHistory || [],
        alliances: data.alliances || [],
        unions: data.unions || [],
        news: data.newsHistory || [],
        allianceRequests: data.allianceRequests || [],
        allianceChats: data.allianceChats || {},
        unSessions: data.unSessions || [],
        wars: data.wars || [],
        finishedWars: data.finishedWars || [],
        colonizationBattles: data.colonizationBattles || []
      });
      const myNat = data.nations.find(n => n.ownerId === playerId);
      if (myNat) set({ myNation: myNat });
    });
    newSocket.on('chatMessage', (msg: ChatMessage) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })));
    newSocket.on('nationCreated', (nation: Nation) => set((state) => ({ nations: [...state.nations, nation] })));
    newSocket.on('nationUpdated', (nation: Nation) => set((state) => ({
      nations: state.nations.map(n => n.id === nation.id ? nation : n),
      myNation: state.myNation?.id === nation.id ? nation : state.myNation
    })));
    newSocket.on('nationDeleted', (nationId: string) => set((state) => ({
      nations: state.nations.filter(n => n.id !== nationId)
    })));
    newSocket.on('disbandSuccess', () => set({ myNation: null, setupPhase: 'form', draftTerritories: [] }));
    
    newSocket.on('allianceCreated', (alliance: Alliance) => set((state) => ({ alliances: [...state.alliances, alliance] })));
    newSocket.on('allianceUpdated', (alliance: Alliance) => set((state) => ({ 
      alliances: state.alliances.map(a => a.id === alliance.id ? alliance : a) 
    })));
    newSocket.on('allianceDeleted', (allianceId: string) => set((state) => ({ 
      alliances: state.alliances.filter(a => a.id !== allianceId) 
    })));

    newSocket.on('unionCreated', (union: Union) => set((state) => ({ unions: [...state.unions, union] })));
    newSocket.on('unionUpdated', (union: Union) => set((state) => ({ 
      unions: state.unions.map(u => u.id === union.id ? union : u) 
    })));
    newSocket.on('unionDeleted', (unionId: string) => set((state) => ({ 
      unions: state.unions.filter(u => u.id !== unionId) 
    })));

    newSocket.on('newsUpdate', (item: NewsItem) => set(state => {
      if (state.news.some(n => n.id === item.id)) return state;
      return { news: [...state.news, item] };
    }));
    newSocket.on('allianceRequest', (req: AllianceRequest) => set(state => {
      if (state.allianceRequests.some(r => r.id === req.id)) return state;
      return { allianceRequests: [...state.allianceRequests, req] };
    }));
    newSocket.on('allianceChatHistory', (data: { allianceId: string, messages: ChatMessage[] }) => set(state => ({
      allianceChats: { ...state.allianceChats, [data.allianceId]: data.messages }
    })));
    newSocket.on('allianceChatMessage', (msg: ChatMessage & { allianceId: string }) => set(state => {
      const currentChat = state.allianceChats[msg.allianceId] || [];
      return {
        allianceChats: { ...state.allianceChats, [msg.allianceId]: [...currentChat, msg] }
      };
    }));

    newSocket.on('unSessionCreated', (session: UNSession) => set(state => ({ unSessions: [session, ...state.unSessions] })));
    newSocket.on('unSessionUpdated', (session: UNSession) => set(state => ({
      unSessions: state.unSessions.map(s => s.id === session.id ? session : s)
    })));

    newSocket.on('warCreated', (war: War) => set(state => ({ wars: [war, ...state.wars] })));
    newSocket.on('warUpdated', (war: War) => set(state => ({
      wars: state.wars.map(w => w.id === war.id ? war : w),
      finishedWars: war.status === 'finished' && !state.finishedWars.find(fw => fw.id === war.id) 
        ? [war, ...state.finishedWars] 
        : state.finishedWars.map(fw => fw.id === war.id ? war : fw)
    })));
    newSocket.on('warFinished', (war: War) => set(state => ({
      wars: state.wars.filter(w => w.id !== war.id),
      finishedWars: [war, ...state.finishedWars]
    })));

    newSocket.on('colonizationBattleCreated', (battle: Battle) => set(state => ({ colonizationBattles: [...state.colonizationBattles, battle] })));
    newSocket.on('colonizationBattleUpdated', (battle: Battle) => set(state => ({
      colonizationBattles: state.colonizationBattles.map(b => b.id === battle.id ? battle : b)
    })));
    newSocket.on('colonizationBattleFinished', (battle: Battle) => set(state => ({
      colonizationBattles: state.colonizationBattles.filter(b => b.id !== battle.id)
    })));

    newSocket.on('spawnRequest', (request: SpawnRequest) => set((state) => ({ pendingRequests: [...state.pendingRequests, request] })));
    newSocket.on('spawnPending', (data: { message: string }) => set({ spawnStatus: 'pending', spawnMessage: data.message }));
    newSocket.on('spawnSuccess', (nation: Nation) => set({ spawnStatus: 'success', myNation: nation, spawnMessage: 'Spawned successfully!', setupPhase: 'form', draftTerritories: [] }));
    newSocket.on('spawnRejected', (data: { message: string }) => set({ spawnStatus: 'rejected', spawnMessage: data.message, setupPhase: 'form' }));
    newSocket.on('spawnError', (data: { message: string }) => set({ spawnStatus: 'error', spawnMessage: data.message, setupPhase: 'form' }));
    newSocket.on('newsError', (data: { message: string }) => {
      // We can dispatch a custom event that App.tsx will listen to for toast
      window.dispatchEvent(new CustomEvent('showToast', { detail: data.message }));
      window.dispatchEvent(new CustomEvent('newsCooldownReset'));
    });
  },

  requestSpawn: (data) => {
    const { socket, draftTerritories } = get();
    if (socket) {
      set({ spawnStatus: 'pending', spawnMessage: 'Requesting spawn...' });
      socket.emit('requestSpawn', { ...data, territories: draftTerritories });
    }
  },

  approveSpawn: (requestId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('approveSpawn', requestId);
      set((state) => ({ pendingRequests: state.pendingRequests.filter((req) => req.id !== requestId) }));
    }
  },

  rejectSpawn: (requestId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('rejectSpawn', requestId);
      set((state) => ({ pendingRequests: state.pendingRequests.filter((req) => req.id !== requestId) }));
    }
  },

  sendChatMessage: (text) => {
    const { socket } = get();
    if (socket) {
      socket.emit('chatMessage', { text });
    }
  },

  createAlliance: (data) => {
    const { socket } = get();
    if (socket) {
      socket.emit('createAlliance', data);
    }
  },

  requestJoinAlliance: (allianceId) => {
    const { socket } = get();
    if (socket) socket.emit('requestJoinAlliance', allianceId);
  },

  approveAllianceJoin: (reqId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('approveAllianceJoin', reqId);
      set(state => ({ allianceRequests: state.allianceRequests.filter(r => r.id !== reqId) }));
    }
  },

  rejectAllianceJoin: (reqId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('rejectAllianceJoin', reqId);
      set(state => ({ allianceRequests: state.allianceRequests.filter(r => r.id !== reqId) }));
    }
  },

  leaveAlliance: (allianceId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leaveAlliance', allianceId);
    }
  },

  sendAllianceChatMessage: (allianceId, text) => {
    const { socket } = get();
    if (socket) socket.emit('allianceChatMessage', { allianceId, text });
  },

  createUnion: (data) => {
    const { socket } = get();
    if (socket) socket.emit('createUnion', data);
  },

  updateUnion: (unionId, data) => {
    const { socket } = get();
    if (socket) socket.emit('updateUnion', { unionId, ...data });
  },

  requestJoinUnion: (unionId) => {
    const { socket } = get();
    if (socket) socket.emit('requestJoinUnion', unionId);
  },

  approveUnionJoin: (reqId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('approveUnionJoin', reqId);
      set(state => ({ allianceRequests: state.allianceRequests.filter(r => r.id !== reqId) }));
    }
  },

  rejectUnionJoin: (reqId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('rejectUnionJoin', reqId);
      set(state => ({ allianceRequests: state.allianceRequests.filter(r => r.id !== reqId) }));
    }
  },

  leaveUnion: (unionId) => {
    const { socket } = get();
    if (socket) socket.emit('leaveUnion', unionId);
  },

  createUNSession: (topic) => {
    const { socket } = get();
    if (socket) socket.emit('createUNSession', topic);
  },

  voteUNSession: (sessionId, vote) => {
    const { socket } = get();
    if (socket) socket.emit('voteUNSession', { sessionId, vote });
  },

  declareWar: (targetId, reason) => {
    const { socket } = get();
    if (socket) socket.emit('declareWar', { targetId, reason });
  },

  joinWar: (warId, side) => {
    const { socket } = get();
    if (socket) socket.emit('joinWar', { warId, side });
  },

  proposePeaceTreaty: (warId, territoryClaims, puppetClaims) => {
    const { socket } = get();
    if (socket) socket.emit('proposePeaceTreaty', { warId, territoryClaims, puppetClaims });
  },

  agreePeaceTreaty: (warId) => {
    const { socket } = get();
    if (socket) socket.emit('agreePeaceTreaty', warId);
  },

  rejectPeaceTreaty: (warId) => {
    const { socket } = get();
    if (socket) socket.emit('rejectPeaceTreaty', warId);
  },

  placeBattle: (warId, x, y, defenderId) => {
    const { socket } = get();
    if (socket) socket.emit('placeBattle', { warId, x, y, defenderId });
  },

  startBattle: (warId, battleId) => {
    const { socket } = get();
    if (socket) socket.emit('startBattle', { warId, battleId });
  },

  paintBattleResult: (warId, battleId, paintedTerritories) => {
    const { socket } = get();
    if (socket) socket.emit('paintBattleResult', { warId, battleId, paintedTerritories });
  },

  placeColonizationBattle: (x, y) => {
    const { socket } = get();
    if (socket) socket.emit('placeColonizationBattle', { x, y });
  },

  startColonizationBattle: (battleId) => {
    const { socket } = get();
    if (socket) socket.emit('startColonizationBattle', { battleId });
  },

  paintColonizationResult: (battleId, paintedTerritories) => {
    const { socket } = get();
    if (socket) socket.emit('paintColonizationResult', { battleId, paintedTerritories });
  },

  publishNews: (text) => {
    const { socket } = get();
    if (socket) socket.emit('publishNews', text);
  },

  updateNation: (data) => {
    const { socket } = get();
    if (socket) socket.emit('updateNation', data);
  },

  disbandNation: () => {
    const { socket } = get();
    if (socket) socket.emit('disbandNation');
  }
}));
