import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  sender: string;
  senderId?: string;
  text: string;
  timestamp: number;
}

export interface Treaty {
  id: string;
  title: string;
  content: string;
  authorId: string;
  requiredSigners: string[];
  signatures: string[];
  status: 'pending' | 'active' | 'rejected';
  timestamp: number;
}

export interface MailMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  type: 'text' | 'transfer' | 'treaty';
  amount?: number;
  treatySummary?: string;
  transferTarget?: string;
  treatyId?: string;
}

export interface MailChat {
  id: string;
  title: string;
  participants: string[];
  messages: MailMessage[];
  updatedAt: number;
  type: 'private' | 'group';
}

export interface City {
  id: string;
  name: string;
  territoryIdx: number;
  population?: number;
}

export interface PoliticalParty {
  id: string;
  name: string;
  color: string;
  ideology: string;
  leader?: string;
  percentage: number;
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
  description?: string;
  cities?: City[];
  economyState?: string;
  gdp?: number;
  budget?: number;
  overheat?: number;
  economyLockedUntil?: number;
  gdpChange?: number;
  gdpHistory?: { time: number; value: number }[];
  parties?: PoliticalParty[];
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
  paintedPixels?: number[];
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
  preWarTerritories?: Record<string, number[]>;
  timelineEvents?: { time: number; type: 'paint' | 'battle' | 'treaty'; data: any }[];
  narrative?: string;
  isGeneratingNarrative?: boolean;
  customWiki?: {
    title?: string;
    intro?: string;
    narrative?: string;
    result?: string;
    casualties?: string;
    mapColors?: Record<string, string>;
  };
}

export interface WikiEvent {
  timestamp: number;
  type: 'creation' | 'ideology_change' | 'territory_change' | 'war' | 'disband' | 'collapse' | 'conquered' | 'successor' | 'history' | 'other';
  description: string;
  relatedEntityId?: string;
  customArticle?: string;
  customWiki?: {
    title?: string;
    text?: string;
    infobox?: Record<string, string>;
    image?: string;
    mapColors?: Record<string, string>;
  };
}

export interface WikiNation {
  id: string;
  name: string;
  color: string;
  flag: string | null;
  ideology: string;
  status: string;
  createdAt: number;
  destroyedAt: number | null;
  peakGdp: number;
  peakTerritories: number;
  lastTerritories?: number[];
  customDescription?: string;
  events: WikiEvent[];
  conquerorIds: string[];
  successors: string[];
  predecessorId?: string;
  symbolismHistory?: {
    name: string;
    flag: string | null;
    timestamp: number;
  }[];
  navbox?: {
    title: string;
    groups: {
      id: string;
      title: string;
      links: { label: string; url: string }[];
    }[];
  };
}

export interface CustomWorldEvent {
  id: string;
  name: string;
  timestamp: number;
  status: 'ongoing' | 'resolved';
  customWiki: {
    title?: string;
    text?: string;
    infobox?: Record<string, string>;
    image?: string;
    mapColors?: Record<string, string>;
  };
  involvedNations: string[];
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
  mailChats: MailChat[];
  treaties: Treaty[];
  wikiNations: WikiNation[];
  worldEvents: CustomWorldEvent[];
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
  updateAlliance: (allianceId: string, data: Partial<Alliance>) => void;
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
  createCity: (name: string, territoryIdx: number) => void;
  renameCity: (cityId: string, newName: string) => void;
  updateEconomyState: (state: string) => void;
  createMailChat: (participants: string[], title?: string) => void;
  sendMailMessage: (chatId: string, text: string, type: 'text' | 'transfer' | 'treaty', amount?: number, treatySummary?: string, transferTarget?: string, treatyId?: string) => void;
  renameMailChat: (chatId: string, title: string) => void;
  proposeTreaty: (title: string, content: string, requiredSigners: string[], chatId?: string, text?: string) => void;
  signTreaty: (treatyId: string) => void;
  updateWikiDescription: (description: string) => void;
  updateWikiEventArticle: (nationId: string, eventIndex: number, article: string, customWiki?: any) => void;
  addCustomWikiEvent: (nationId: string, description: string, customWiki?: any) => void;
  updateWikiNavbox: (nationId: string, navbox: any) => void;
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
  mailChats: [],
  treaties: [],
  wikiNations: [],
  worldEvents: [],
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
    newSocket.on('gameState', (data: { nations: Nation[], chatHistory?: ChatMessage[], alliances?: Alliance[], unions?: Union[], newsHistory?: NewsItem[], allianceRequests?: AllianceRequest[], allianceChats?: Record<string, ChatMessage[]>, unSessions?: UNSession[], wars?: War[], finishedWars?: War[], colonizationBattles?: Battle[], treaties?: Treaty[] }) => {
      const now = Date.now();
      const prevNations = get().nations;
      const prevNationsMap = new Map(prevNations.map(n => [n.id, n]));
      
      const updatedNations = data.nations.map(n => {
        const prevNation = prevNationsMap.get(n.id);
        let history = prevNation?.gdpHistory ? prevNation.gdpHistory : [];
        
        // Only update history if enough time has passed (approx 3s)
        const lastEntry = history[history.length - 1];
        if (!lastEntry || now - lastEntry.time >= 2800) {
          const newHistory = [...history, { time: now, value: n.gdp || 0 }];
          if (newHistory.length > 50) newHistory.shift();
          return { ...n, gdpHistory: newHistory };
        }
        
        return { ...n, gdpHistory: history };
      });

      set({ 
        nations: updatedNations, 
        chatMessages: data.chatHistory || [],
        alliances: data.alliances || [],
        unions: data.unions || [],
        news: data.newsHistory || [],
        allianceRequests: data.allianceRequests || [],
        allianceChats: data.allianceChats || {},
        unSessions: data.unSessions || [],
        wars: data.wars || [],
        finishedWars: data.finishedWars || [],
        colonizationBattles: data.colonizationBattles || [],
        mailChats: (data as any).hasOwnProperty('mailChats') ? (data as any).mailChats : get().mailChats,
        treaties: (data as any).hasOwnProperty('treaties') ? (data as any).treaties : get().treaties,
        wikiNations: (data as any).hasOwnProperty('wikiNations') ? (data as any).wikiNations : get().wikiNations
      });
      const myNat = updatedNations.find(n => n.ownerId === playerId);
      if (myNat) set({ myNation: myNat });
    });
    newSocket.on('wikiData', (wikiNations: WikiNation[]) => set({ wikiNations }));
    newSocket.on('worldEventsData', (worldEvents: CustomWorldEvent[]) => set({ worldEvents }));
    newSocket.on('worldEventUpdated', (event: CustomWorldEvent) => set(state => {
       const exists = state.worldEvents.find(e => e.id === event.id);
       if (exists) return { worldEvents: state.worldEvents.map(e => e.id === event.id ? event : e) };
       return { worldEvents: [event, ...state.worldEvents] };
    }));
    newSocket.on('chatMessage', (msg: ChatMessage) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })));
    newSocket.on('nationCreated', (nation: Nation) => set((state) => ({ nations: [...state.nations, { ...nation, gdpHistory: [] }] })));
    newSocket.on('nationUpdated', (nation: Nation) => set((state) => {
      const prevNation = state.nations.find(n => n.id === nation.id);
      const updatedNation = { ...nation, gdpHistory: prevNation?.gdpHistory || [] };
      return {
        nations: state.nations.map(n => n.id === nation.id ? updatedNation : n),
        myNation: state.myNation?.id === nation.id ? updatedNation : state.myNation
      };
    }));
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

    newSocket.on('mailChatUpdated', (chat: MailChat) => set(state => {
      const exists = state.mailChats.some(c => c.id === chat.id);
      if (exists) {
        return { mailChats: state.mailChats.map(c => c.id === chat.id ? chat : c).sort((a,b) => b.updatedAt - a.updatedAt) };
      }
      return { mailChats: [chat, ...state.mailChats].sort((a,b) => b.updatedAt - a.updatedAt) };
    }));

    newSocket.on('treatyUpdated', (treaty: Treaty) => set(state => {
      const exists = state.treaties.some(t => t.id === treaty.id);
      if (exists) {
        return { treaties: state.treaties.map(t => t.id === treaty.id ? treaty : t) };
      }
      return { treaties: [...state.treaties, treaty] };
    }));

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

  updateAlliance: (allianceId, data) => {
    const { socket } = get();
    if (socket) {
      socket.emit('updateAlliance', { allianceId, ...data });
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

  createCity: (name, territoryIdx) => {
    const { socket } = get();
    if (socket) socket.emit('createCity', { name, territoryIdx });
  },

  renameCity: (cityId, newName) => {
    const { socket } = get();
    if (socket) socket.emit('renameCity', { cityId, newName });
  },

  updateEconomyState: (state) => {
    const { socket } = get();
    if (socket) socket.emit('updateEconomyState', { state });
  },

  createMailChat: (participants, title) => {
    const { socket } = get();
    if (socket) socket.emit('createMailChat', { participants, title });
  },

  sendMailMessage: (chatId, text, type, amount, treatySummary, transferTarget, treatyId) => {
    const { socket } = get();
    if (socket) socket.emit('sendMailMessage', { chatId, text, type, amount, treatySummary, transferTarget, treatyId });
  },

  renameMailChat: (chatId, title) => {
    const { socket } = get();
    if (socket) socket.emit('renameMailChat', { chatId, title });
  },

  proposeTreaty: (title, content, requiredSigners, chatId, text) => {
    const { socket } = get();
    if (socket) socket.emit('proposeTreaty', { title, content, requiredSigners, chatId, text });
  },

  signTreaty: (treatyId) => {
    const { socket } = get();
    if (socket) socket.emit('signTreaty', { treatyId });
  },

  disbandNation: () => {
    const { socket } = get();
    if (socket) socket.emit('disbandNation');
  },

  updateWikiDescription: (description) => {
    const { socket } = get();
    if (socket) socket.emit('updateWikiDescription', { description });
  },

  updateWikiEventArticle: (nationId, eventIndex, article, customWiki) => {
    const { socket } = get();
    if (socket) socket.emit('updateWikiEventArticle', { nationId, eventIndex, article, customWiki });
  },

  addCustomWikiEvent: (nationId, description, customWiki) => {
    const { socket } = get();
    if (socket) socket.emit('addCustomWikiEvent', { nationId, description, customWiki });
  },

  updateWikiNavbox: (nationId, navbox) => {
    const { socket } = get();
    if (socket) socket.emit('updateWikiNavbox', { nationId, navbox });
  }
}));
