import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import 'dotenv/config';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  
  app.post('/api/fetch-image', async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) return res.status(400).json({ error: 'No image URL provided' });
      
      const fetchResp = await fetch(imageUrl);
      if (!fetchResp.ok) throw new Error('Failed to fetch image');
      const arrayBuffer = await fetchResp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = fetchResp.headers.get('content-type') || 'image/jpeg';
      
      res.json({ base64: buffer.toString('base64'), mimeType });
    } catch (e: any) {
      console.error('Fetch image error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  const PORT = 3000;

  const players = new Map();
  const nations = new Map();
  const spawnRequests = new Map();
  const chatHistory: any[] = [];
  const alliances = new Map();
  const unions = new Map();
  const newsHistory: any[] = [];
  const allianceRequests = new Map();
  const allianceChats = new Map();
  const unSessions = new Map();
  const wars = new Map();
  const finishedWars = new Map();
  const colonizationBattles = new Map();
  const mailChats = new Map();
  const treaties = new Map();
  const historicalNations = new Map();
  const lastNewsTime = new Map<string, number>();

  const getRandomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

  const addNews = (text: string, type: string, senderId?: string) => {
    const item = { id: Math.random().toString(36).substring(7), text, timestamp: Date.now(), type, senderId };
    newsHistory.push(item);
    if (newsHistory.length > 50) newsHistory.shift();
    io.emit('newsUpdate', item);
  };

  io.on('connection', (socket) => {
    const playerId = socket.handshake.auth?.playerId || socket.id;
    socket.join(playerId);
    console.log('User connected:', playerId);
    
    const player = players.get(playerId);
    const getMailChatsForPlayer = (natId: string) => Array.from(mailChats.values()).filter((c: any) => c.participants.includes(natId));
    
    socket.emit('gameState', { 
      nations: Array.from(nations.values()), 
      chatHistory,
      alliances: Array.from(alliances.values()),
      unions: Array.from(unions.values()),
      newsHistory,
      allianceRequests: Array.from(allianceRequests.values()),
      allianceChats: Object.fromEntries(allianceChats),
      unSessions: Array.from(unSessions.values()),
      wars: Array.from(wars.values()),
      finishedWars: Array.from(finishedWars.values()),
      colonizationBattles: Array.from(colonizationBattles.values()),
      treaties: Array.from(treaties.values()),
      mailChats: player ? getMailChatsForPlayer(player.nationId) : [],
      wikiNations: Array.from(historicalNations.values())
    });

    socket.on('getWikiData', () => {
      socket.emit('wikiData', Array.from(historicalNations.values()));
    });

    socket.on('chatMessage', (data) => {
      const player = players.get(playerId);
      const senderName = player ? nations.get(player.nationId)?.shortName : 'Observer';
      const senderId = player?.nationId;
      const msg = {
        id: Math.random().toString(36).substring(7),
        sender: senderName,
        senderId,
        text: data.text,
        timestamp: Date.now()
      };
      chatHistory.push(msg);
      if (chatHistory.length > 100) chatHistory.shift();
      io.emit('chatMessage', msg);
    });

    socket.on('requestSpawn', (data) => {
      console.log(`Spawn request from ${playerId}:`, data.name);
      
      if (data.targetNationId) {
        const target = nations.get(data.targetNationId);
        if (target) {
          const requestId = Math.random().toString(36).substring(7);
          const request = { id: requestId, from: playerId, targetNationId: data.targetNationId, data };
          spawnRequests.set(requestId, request);
          io.to(target.ownerId).emit('spawnRequest', request);
          socket.emit('spawnPending', { message: 'Waiting for approval...' });
        } else {
          socket.emit('spawnError', { message: 'Target nation not found.' });
        }
      } else {
        const nationId = Math.random().toString(36).substring(7);
        const newNation = { 
          id: nationId, 
          ownerId: playerId, 
          name: data.name,
          shortName: data.shortName,
          ideology: data.ideology,
          status: 'Independent',
          color: data.color || getRandomColor(),
          territories: data.territories || [],
          flag: data.flag || '',
          description: data.description || '',
          cities: [],
          economyState: 'Стагнация',
          gdp: 1000,
          budget: 1000000000,
          overheat: 0,
          economyLockedUntil: 0,
          gdpChange: 0
        };
        nations.set(nationId, newNation);
        players.set(playerId, { id: playerId, nationId });
        
        historicalNations.set(nationId, {
          id: nationId,
          name: data.name,
          color: newNation.color,
          flag: data.flag || '',
          ideology: data.ideology,
          status: newNation.status,
          customDescription: '',
          lastTerritories: newNation.territories,
          createdAt: Date.now(),
          destroyedAt: null,
          peakGdp: 1000,
          peakTerritories: newNation.territories.length,
          events: [{ timestamp: Date.now(), type: 'creation', description: `Nation ${data.name} was established.` }],
          conquerorIds: [],
          successors: []
        });

        io.emit('nationCreated', newNation);
        socket.emit('spawnSuccess', newNation);
        addNews(`A new nation, ${newNation.name}, has emerged!`, 'spawn');
        io.emit('wikiData', Array.from(historicalNations.values()));
      }
    });

    socket.on('approveSpawn', (requestId) => {
      const request = spawnRequests.get(requestId);
      if (request) {
        const targetNation = nations.get(request.targetNationId);
        if (targetNation && targetNation.ownerId === playerId) {
          const nationId = Math.random().toString(36).substring(7);
          const newNation = { 
            id: nationId, 
            ownerId: request.from, 
            name: request.data.name,
            shortName: request.data.shortName,
            ideology: request.data.ideology,
            status: request.data.status,
            parentId: targetNation.id,
            color: request.data.color || getRandomColor(),
            territories: request.data.territories || [],
            flag: request.data.flag || '',
            description: request.data.description || '',
            cities: [],
            economyState: 'Стагнация',
            gdp: 1000,
            budget: 1000000000,
            overheat: 0,
            economyLockedUntil: 0,
            gdpChange: 0
          };
          
          nations.set(nationId, newNation);
          players.set(request.from, { id: request.from, nationId });
          
          historicalNations.set(nationId, {
            id: nationId,
            name: request.data.name,
            color: newNation.color,
            flag: request.data.flag || '',
            ideology: request.data.ideology,
            status: request.data.status,
            customDescription: '',
            lastTerritories: newNation.territories,
            createdAt: Date.now(),
            destroyedAt: null,
            peakGdp: 1000,
            peakTerritories: newNation.territories.length,
            events: [{ timestamp: Date.now(), type: 'creation', description: `Nation ${request.data.name} was established as a territory of ${targetNation.name}.`, relatedEntityId: targetNation.id }],
            conquerorIds: [],
            successors: [],
            predecessorId: targetNation.id
          });

          const parentWiki = historicalNations.get(targetNation.id);
          if (parentWiki) {
            if (!parentWiki.successors.includes(nationId)) parentWiki.successors.push(nationId);
            parentWiki.events.push({ timestamp: Date.now(), type: 'successor', description: `${request.data.name} was formed from its territory.`, relatedEntityId: nationId });
          }

          io.emit('nationCreated', newNation);
          io.to(request.from).emit('spawnSuccess', newNation);
          spawnRequests.delete(requestId);
          addNews(`A new nation, ${newNation.name}, has emerged!`, 'spawn');
          io.emit('wikiData', Array.from(historicalNations.values()));
        }
      }
    });

    socket.on('rejectSpawn', (requestId) => {
      const request = spawnRequests.get(requestId);
      if (request) {
        const targetNation = nations.get(request.targetNationId);
        if (targetNation && targetNation.ownerId === playerId) {
          io.to(request.from).emit('spawnRejected', { message: 'Your spawn request was rejected.' });
          spawnRequests.delete(requestId);
        }
      }
    });

    const getDiplomaticEntity = (nationId: string) => {
      const union = Array.from(unions.values()).find((u: any) => u.members.includes(nationId));
      if (union) {
        return {
          id: union.id,
          type: 'union',
          name: union.name,
          shortName: union.name,
          founderId: union.founderId,
          isFounder: union.founderId === nationId
        };
      }
      const nation = nations.get(nationId);
      return {
        id: nationId,
        type: 'nation',
        name: nation?.name || 'Unknown',
        shortName: nation?.shortName || 'Unknown',
        founderId: nationId,
        isFounder: true
      };
    };

    // Alliance Events
    socket.on('createAlliance', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return; // Only founder can create alliance for union

      const allianceId = Math.random().toString(36).substring(7);
      const newAlliance = {
        id: allianceId,
        name: data.name,
        type: data.type,
        description: data.description,
        flag: data.flag || '',
        founderId: entity.id,
        members: [entity.id]
      };
      alliances.set(allianceId, newAlliance);
      io.emit('allianceCreated', newAlliance);
      addNews(`The ${newAlliance.name} alliance has been formed!`, 'alliance_create');
      
      const wiki = historicalNations.get(player.nationId);
      if (wiki) {
        wiki.events.push({ timestamp: Date.now(), type: 'history' as any, description: `Formed the ${data.type} alliance "${data.name}".` });
        io.emit('wikiData', Array.from(historicalNations.values()));
      }
    });

    socket.on('requestJoinAlliance', (allianceId) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const alliance = alliances.get(allianceId);
      if (alliance && !alliance.members.includes(entity.id)) {
        const existingReq = Array.from(allianceRequests.values()).find((r: any) => r.allianceId === allianceId && r.nationId === entity.id);
        if (existingReq) return;

        const reqId = Math.random().toString(36).substring(7);
        const request = { id: reqId, allianceId, nationId: entity.id, nationName: entity.name };
        allianceRequests.set(reqId, request);
        
        socket.emit('joinRequestSent');
        
        // Find the founder of the alliance
        // The founder could be a union or a nation. We need to find the player who is the founder of that entity.
        let founderPlayerId = null;
        if (unions.has(alliance.founderId)) {
          const union = unions.get(alliance.founderId);
          const founderPlayer = Array.from(players.values()).find(p => p.nationId === union.founderId);
          if (founderPlayer) founderPlayerId = founderPlayer.id;
        } else {
          const founderPlayer = Array.from(players.values()).find(p => p.nationId === alliance.founderId);
          if (founderPlayer) founderPlayerId = founderPlayer.id;
        }

        if (founderPlayerId) {
          io.to(founderPlayerId).emit('allianceRequest', request);
        }
      }
    });

    socket.on('approveAllianceJoin', (reqId) => {
      const player = players.get(playerId);
      const request = allianceRequests.get(reqId);
      if (request && player) {
        const alliance = alliances.get(request.allianceId);
        const entity = getDiplomaticEntity(player.nationId);
        
        if (alliance && alliance.founderId === entity.id && entity.isFounder) {
          if (!alliance.members.includes(request.nationId)) {
            alliance.members.push(request.nationId);
            io.emit('allianceUpdated', alliance);
            
            addNews(`${request.nationName} has joined ${alliance.name}!`, 'alliance_join');
            
            const wiki = historicalNations.get(request.nationId);
            if (wiki) {
              wiki.events.push({ timestamp: Date.now(), type: 'history' as any, description: `Joined the alliance "${alliance.name}".` });
              io.emit('wikiData', Array.from(historicalNations.values()));
            }
            
            // Send chat history to all players in the joining entity
            if (allianceChats.has(alliance.id)) {
              const joiningEntityId = request.nationId;
              const playersToNotify = Array.from(players.values()).filter(p => {
                const pEntity = getDiplomaticEntity(p.nationId);
                return pEntity.id === joiningEntityId;
              });
              
              playersToNotify.forEach(p => {
                io.to(p.id).emit('allianceChatHistory', { allianceId: alliance.id, messages: allianceChats.get(alliance.id) });
              });
            }
          }
          allianceRequests.delete(reqId);
        }
      }
    });

    socket.on('rejectAllianceJoin', (reqId) => {
      const player = players.get(playerId);
      const request = allianceRequests.get(reqId);
      if (request && player) {
        const alliance = alliances.get(request.allianceId);
        const entity = getDiplomaticEntity(player.nationId);
        if (alliance && alliance.founderId === entity.id && entity.isFounder) {
          allianceRequests.delete(reqId);
        }
      }
    });

    socket.on('leaveAlliance', (allianceId) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const alliance = alliances.get(allianceId);
      if (alliance) {
        alliance.members = alliance.members.filter((id: string) => id !== entity.id);
        addNews(`${entity.name} has left ${alliance.name}.`, 'alliance_leave');
        
        const wiki = historicalNations.get(entity.id);
        if (wiki) {
          wiki.events.push({ timestamp: Date.now(), type: 'history' as any, description: `Left the alliance "${alliance.name}".` });
          io.emit('wikiData', Array.from(historicalNations.values()));
        }

        if (alliance.members.length === 0) {
          alliances.delete(allianceId);
          io.emit('allianceDeleted', allianceId);
        } else {
          if (alliance.founderId === entity.id) {
            alliance.founderId = alliance.members[0];
          }
          io.emit('allianceUpdated', alliance);
        }
      }
    });

    socket.on('updateAlliance', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const alliance = alliances.get(data.allianceId);
      if (alliance && alliance.founderId === entity.id && entity.isFounder) {
        if (data.name) alliance.name = data.name;
        if (data.description) alliance.description = data.description;
        if (data.flag !== undefined) alliance.flag = data.flag;
        
        alliances.set(alliance.id, alliance);
        io.emit('allianceUpdated', alliance);
      }
    });

    socket.on('allianceChatMessage', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      const alliance = alliances.get(data.allianceId);
      
      if (alliance && alliance.members.includes(entity.id)) {
        const senderName = entity.type === 'union' ? `[${entity.shortName}] ${nations.get(player.nationId)?.shortName || 'Unknown'}` : nations.get(player.nationId)?.shortName || 'Unknown';
        const msg = {
          id: Math.random().toString(36).substring(7),
          allianceId: data.allianceId,
          sender: senderName,
          senderId: player.nationId,
          text: data.text,
          timestamp: Date.now()
        };
        if (!allianceChats.has(data.allianceId)) allianceChats.set(data.allianceId, []);
        const chat = allianceChats.get(data.allianceId);
        chat.push(msg);
        if (chat.length > 50) chat.shift();
        
        // Broadcast to all players whose entity is in the alliance
        Array.from(players.values()).forEach((p: any) => {
          const pEntity = getDiplomaticEntity(p.nationId);
          if (alliance.members.includes(pEntity.id)) {
            io.to(p.id).emit('allianceChatMessage', msg);
          }
        });
      }
    });

    // Union Events
    socket.on('createUnion', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const unionId = Math.random().toString(36).substring(7);
      const newUnion = {
        id: unionId,
        name: data.name,
        color: data.color || getRandomColor(),
        flag: data.flag || '',
        founderId: player.nationId,
        members: [player.nationId]
      };
      unions.set(unionId, newUnion);
      io.emit('unionCreated', newUnion);
      addNews(`The ${newUnion.name} union has been formed!`, 'union_create');

      const wiki = historicalNations.get(player.nationId);
      if (wiki) {
        wiki.events.push({ timestamp: Date.now(), type: 'history' as any, description: `Formed the union "${data.name}".` });
        io.emit('wikiData', Array.from(historicalNations.values()));
      }
    });

    socket.on('updateUnion', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      
      const union = unions.get(data.unionId);
      if (union && union.founderId === player.nationId) {
        if (data.name) union.name = data.name;
        if (data.color) union.color = data.color;
        if (data.flag !== undefined) union.flag = data.flag;
        
        unions.set(union.id, union);
        io.emit('unionUpdated', union);
      }
    });

    socket.on('requestJoinUnion', (unionId) => {
      const player = players.get(playerId);
      if (!player) return;
      const union = unions.get(unionId);
      if (union && !union.members.includes(player.nationId)) {
        const existingReq = Array.from(allianceRequests.values()).find((r: any) => r.unionId === unionId && r.nationId === player.nationId);
        if (existingReq) return;

        const reqId = Math.random().toString(36).substring(7);
        const nation = nations.get(player.nationId);
        const request = { id: reqId, unionId, nationId: player.nationId, nationName: nation.name };
        allianceRequests.set(reqId, request);
        
        socket.emit('joinRequestSent');
        
        const founder = Array.from(players.values()).find(p => p.nationId === union.founderId);
        if (founder) {
          io.to(founder.id).emit('allianceRequest', request);
        }
      }
    });

    socket.on('approveUnionJoin', (reqId) => {
      const player = players.get(playerId);
      const request = allianceRequests.get(reqId);
      if (request && player && request.unionId) {
        const union = unions.get(request.unionId);
        if (union && union.founderId === player.nationId) {
          if (!union.members.includes(request.nationId)) {
            union.members.push(request.nationId);
            io.emit('unionUpdated', union);
            
            const nation = nations.get(request.nationId);
            addNews(`${nation.name} has joined ${union.name}!`, 'union_join');

            const wiki = historicalNations.get(request.nationId);
            if (wiki) {
              wiki.events.push({ timestamp: Date.now(), type: 'history' as any, description: `Joined the union "${union.name}".` });
              io.emit('wikiData', Array.from(historicalNations.values()));
            }
          }
          allianceRequests.delete(reqId);
        }
      }
    });

    socket.on('rejectUnionJoin', (reqId) => {
      const player = players.get(playerId);
      const request = allianceRequests.get(reqId);
      if (request && player && request.unionId) {
        const union = unions.get(request.unionId);
        if (union && union.founderId === player.nationId) {
          allianceRequests.delete(reqId);
        }
      }
    });

    socket.on('leaveUnion', (unionId) => {
      const player = players.get(playerId);
      if (!player) return;
      const union = unions.get(unionId);
      if (union) {
        union.members = union.members.filter((id: string) => id !== player.nationId);
        const nation = nations.get(player.nationId);
        if (nation) {
          addNews(`${nation.name} has left ${union.name}.`, 'union_leave');
        }

        const wiki = historicalNations.get(player.nationId);
        if (wiki) {
          wiki.events.push({ timestamp: Date.now(), type: 'history' as any, description: `Left the union "${union.name}".` });
          io.emit('wikiData', Array.from(historicalNations.values()));
        }

        if (union.members.length === 0) {
          unions.delete(unionId);
          io.emit('unionDeleted', unionId);
          
          // Remove union from any alliances
          for (const [allianceId, alliance] of alliances.entries()) {
            if (alliance.members.includes(unionId)) {
              alliance.members = alliance.members.filter((id: string) => id !== unionId);
              if (alliance.members.length === 0) {
                alliances.delete(allianceId);
                io.emit('allianceDeleted', allianceId);
              } else {
                if (alliance.founderId === unionId) {
                  alliance.founderId = alliance.members[0];
                }
                io.emit('allianceUpdated', alliance);
              }
            }
          }
        } else {
          if (union.founderId === player.nationId) {
            union.founderId = union.members[0];
          }
          io.emit('unionUpdated', union);
        }
      }
    });

    socket.on('createUNSession', (topic) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const sessionId = Math.random().toString(36).substring(7);
      const session = {
        id: sessionId,
        callerId: entity.id,
        callerName: entity.name,
        topic,
        votes: {},
        createdAt: Date.now(),
        status: 'active'
      };
      unSessions.set(sessionId, session);
      io.emit('unSessionCreated', session);
      addNews(`${entity.name} созвал заседание ООН: "${topic}"`, 'un_session');
    });

    socket.on('voteUNSession', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const session = unSessions.get(data.sessionId);
      if (session && session.status === 'active') {
        session.votes[entity.id] = data.vote;
        io.emit('unSessionUpdated', session);
      }
    });

    function processWarParticipation(entityId: string, description: string, warId: string) {
      if (unions.has(entityId)) {
        const union = unions.get(entityId);
        union.members.forEach((mId: string) => {
          const wiki = historicalNations.get(mId);
          if (wiki) {
            if (!wiki.events) wiki.events = [];
            wiki.events.push({ timestamp: Date.now(), type: 'war', description, relatedEntityId: warId });
          }
        });
      } else {
        const wiki = historicalNations.get(entityId);
        if (wiki) {
          if (!wiki.events) wiki.events = [];
          wiki.events.push({ timestamp: Date.now(), type: 'war', description, relatedEntityId: warId });
        }
      }
    }

    // Wars Events
    socket.on('declareWar', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const targetEntity = getDiplomaticEntity(data.targetId);
      if (!targetEntity) return;

      const warId = Math.random().toString(36).substring(7);
      const preWarTerritories: Record<string, number[]> = {};
      const allParticipants = [entity.id, targetEntity.id];
      // Gather territories for participants
      for (const pId of allParticipants) {
        if (unions.has(pId)) {
          const union = unions.get(pId);
          union.members.forEach((mId: string) => {
            const nation = nations.get(mId);
            if (nation) preWarTerritories[mId] = [...nation.territories];
          });
        } else {
          const nation = nations.get(pId);
          if (nation) preWarTerritories[pId] = [...nation.territories];
        }
      }

      const newWar = {
        id: warId,
        attackerId: entity.id,
        defenderId: targetEntity.id,
        reason: data.reason,
        status: 'active',
        attackers: [entity.id],
        defenders: [targetEntity.id],
        battles: [],
        timelineEvents: [],
        createdAt: Date.now(),
        preWarTerritories
      };
      wars.set(warId, newWar);
      io.emit('warCreated', newWar);
      processWarParticipation(entity.id, `Participated in the war as an attacker`, warId);
      processWarParticipation(targetEntity.id, `Attacked and participated in the war as a defender`, warId);
      io.emit('wikiData', Array.from(historicalNations.values()));
      addNews(`${entity.name} объявил войну ${targetEntity.name}! Причина: ${data.reason}`, 'war_declare');
    });

    socket.on('joinWar', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const war = wars.get(data.warId);
      if (war && war.status === 'active') {
        if (!war.preWarTerritories) war.preWarTerritories = {};
        if (unions.has(entity.id)) {
          unions.get(entity.id).members.forEach((mId: string) => {
            if (!war.preWarTerritories[mId]) war.preWarTerritories[mId] = [...(nations.get(mId)?.territories || [])];
          });
        } else {
          if (!war.preWarTerritories[entity.id]) war.preWarTerritories[entity.id] = [...(nations.get(entity.id)?.territories || [])];
        }

        if (data.side === 'attackers' && !war.attackers.includes(entity.id) && !war.defenders.includes(entity.id)) {
          war.attackers.push(entity.id);
          io.emit('warUpdated', war);
          processWarParticipation(entity.id, `Joined the war as an attacker`, data.warId);
          io.emit('wikiData', Array.from(historicalNations.values()));
          addNews(`${entity.name} вступил в войну на стороне атакующих!`, 'war_join');
        } else if (data.side === 'defenders' && !war.attackers.includes(entity.id) && !war.defenders.includes(entity.id)) {
          war.defenders.push(entity.id);
          io.emit('warUpdated', war);
          processWarParticipation(entity.id, `Joined the war as a defender`, data.warId);
          io.emit('wikiData', Array.from(historicalNations.values()));
          addNews(`${entity.name} вступил в войну на стороне защитников!`, 'war_join');
        }
      }
    });

    socket.on('proposePeaceTreaty', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const war = wars.get(data.warId);
      if (war && war.status !== 'finished') {
        if (war.attackers.includes(entity.id) || war.defenders.includes(entity.id)) {
          war.status = 'peace_negotiation';
          war.peaceTreaty = {
            warId: war.id,
            territoryClaims: data.territoryClaims || {},
            puppetClaims: data.puppetClaims || {},
            agreements: [entity.id]
          };
          io.emit('warUpdated', war);
          addNews(`${entity.name} предложил мирный договор.`, 'war_peace');
        }
      }
    });

    socket.on('agreePeaceTreaty', (warId) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const war = wars.get(warId);
      if (war && war.status === 'peace_negotiation' && war.peaceTreaty) {
        if ((war.attackers.includes(entity.id) || war.defenders.includes(entity.id)) && !war.peaceTreaty.agreements.includes(entity.id)) {
          war.peaceTreaty.agreements.push(entity.id);
          
          // Check if all participants agreed
          const allParticipants = [...war.attackers, ...war.defenders];
          const allAgreed = allParticipants.every(p => war.peaceTreaty!.agreements.includes(p));
          
          if (allAgreed) {
            // Apply peace treaty
            // 1. Transfer territories
            const claims = war.peaceTreaty.territoryClaims;
            const newNations = new Map(nations);
            
            // Track for wiki
            const territoryChanges: Record<string, { lostCount: number, to: Set<string> }> = {};

            for (const [territoryIdxStr, claimerId] of Object.entries(claims)) {
              const territoryIdx = parseInt(territoryIdxStr);
              // Remove from old owner and clear occupations
              for (const [nId, n] of newNations.entries()) {
                let changed = false;
                if (n.territories.includes(territoryIdx)) {
                  n.territories = n.territories.filter((t: number) => t !== territoryIdx);
                  changed = true;
                  
                  if (!territoryChanges[nId]) territoryChanges[nId] = { lostCount: 0, to: new Set() };
                  territoryChanges[nId].lostCount++;
                  
                  let actualClaimerId = claimerId as string;
                  if (unions.has(claimerId)) actualClaimerId = unions.get(claimerId).founderId;
                  territoryChanges[nId].to.add(actualClaimerId);
                }
                if (n.occupations && n.occupations.includes(territoryIdx)) {
                  n.occupations = n.occupations.filter((t: number) => t !== territoryIdx);
                  changed = true;
                }
                if (changed) {
                  newNations.set(nId, n);
                  io.emit('nationUpdated', n);
                }
              }
              // Add to new owner
              let actualClaimerId = claimerId;
              if (unions.has(claimerId)) {
                actualClaimerId = unions.get(claimerId).founderId;
              }
              const claimer = newNations.get(actualClaimerId);
              if (claimer && !claimer.territories.includes(territoryIdx)) {
                claimer.territories.push(territoryIdx);
                newNations.set(actualClaimerId, claimer);
                io.emit('nationUpdated', claimer);
              }
            }
            
            for (const [loserId, data] of Object.entries(territoryChanges)) {
              const wiki = historicalNations.get(loserId);
              if (wiki) {
                if (!wiki.events) wiki.events = [];
                const toNames = Array.from(data.to).map(id => historicalNations.get(id)?.name).filter(Boolean).join(', ');
                wiki.events.push({ timestamp: Date.now(), type: 'territory_change', description: `Lost ${data.lostCount} territories to ${toNames}.` });
                if (!wiki.conquerorIds) wiki.conquerorIds = [];
                Array.from(data.to).forEach(id => {
                  if (!wiki.conquerorIds.includes(id)) wiki.conquerorIds.push(id);
                });
                io.emit('wikiData', Array.from(historicalNations.values()));
              }
            }
            
            // 2. Apply puppets
            for (const [targetId, claimerId] of Object.entries(war.peaceTreaty.puppetClaims)) {
              let actualClaimerId = claimerId;
              if (unions.has(claimerId)) {
                actualClaimerId = unions.get(claimerId).founderId;
              }
              
              const overlord = newNations.get(actualClaimerId);
              
              // If target is a union, make all its members puppets
              if (unions.has(targetId)) {
                const union = unions.get(targetId);
                for (const memberId of union.members) {
                  const target = newNations.get(memberId);
                  if (target) {
                    target.status = 'Puppet';
                    target.parentId = actualClaimerId;
                    newNations.set(memberId, target);
                    io.emit('nationUpdated', target);
                    
                    const wiki = historicalNations.get(memberId);
                    if (wiki && overlord) {
                      if (!wiki.events) wiki.events = [];
                      if (!wiki.conquerorIds) wiki.conquerorIds = [];
                      wiki.events.push({ timestamp: Date.now(), type: 'conquered', description: `Became a puppet of ${overlord.name}.`, relatedEntityId: actualClaimerId });
                      if (!wiki.conquerorIds.includes(actualClaimerId)) wiki.conquerorIds.push(actualClaimerId);
                    }
                  }
                }
              } else {
                const target = newNations.get(targetId);
                if (target) {
                  target.status = 'Puppet';
                  target.parentId = actualClaimerId;
                  newNations.set(targetId, target);
                  io.emit('nationUpdated', target);
                  
                  const wiki = historicalNations.get(targetId);
                  if (wiki && overlord) {
                    if (!wiki.events) wiki.events = [];
                    if (!wiki.conquerorIds) wiki.conquerorIds = [];
                    wiki.events.push({ timestamp: Date.now(), type: 'conquered', description: `Became a puppet of ${overlord.name}.`, relatedEntityId: actualClaimerId });
                    if (!wiki.conquerorIds.includes(actualClaimerId)) wiki.conquerorIds.push(actualClaimerId);
                  }
                }
              }
            }
            
            // 3. Clear occupations for participants
            for (const pId of allParticipants) {
              const nationIds = unions.has(pId) ? unions.get(pId).members : [pId];
              for (const nId of nationIds) {
                const n = newNations.get(nId);
                if (n && n.occupations && n.occupations.length > 0) {
                  const enemies = war.attackers.includes(pId) ? war.defenders : war.attackers;
                  const enemyNationIds = new Set(enemies.flatMap((eId: string) => unions.has(eId) ? unions.get(eId).members : [eId]));
                  
                  n.occupations = n.occupations.filter((t: number) => {
                    const owner = Array.from(newNations.values()).find(on => on.territories.includes(t));
                    return !(owner && enemyNationIds.has(owner.id));
                  });
                  newNations.set(nId, n);
                  io.emit('nationUpdated', n);
                }
              }
            }
            
            war.status = 'finished';
            war.finishedAt = Date.now();
            wars.delete(war.id);
            finishedWars.set(war.id, war);
            io.emit('warFinished', war);
            addNews(`Война завершена! Мирный договор подписан всеми сторонами.`, 'war_end');
          } else {
            io.emit('warUpdated', war);
          }
        }
      }
    });

    socket.on('rejectPeaceTreaty', (warId) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const war = wars.get(warId);
      if (war && war.status === 'peace_negotiation' && war.peaceTreaty) {
        if (war.attackers.includes(entity.id) || war.defenders.includes(entity.id)) {
          war.status = 'active';
          war.peaceTreaty = undefined;
          io.emit('warUpdated', war);
          addNews(`${entity.name} отклонил мирный договор. Война продолжается!`, 'war_peace');
        }
      }
    });

    socket.on('setWarGenerating', ({ warId, isGenerating }) => {
      let war = wars.get(warId) || finishedWars.get(warId);
      if (war) {
        war.isGeneratingNarrative = isGenerating;
        io.emit('warUpdated', war);
      }
    });

    socket.on('setWarNarrative', ({ warId, narrative, customWiki }) => {
      let war = wars.get(warId) || finishedWars.get(warId);
      if (war) {
        if (narrative !== undefined) war.narrative = narrative;
        if (customWiki !== undefined) war.customWiki = customWiki;
        war.isGeneratingNarrative = false;
        io.emit('warUpdated', war);
      }
    });

    socket.on('placeBattle', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const war = wars.get(data.warId);
      if (war && war.status === 'active') {
        const battleId = Math.random().toString(36).substring(7);
        const newBattle = {
          id: battleId,
          warId: war.id,
          x: data.x,
          y: data.y,
          attackerId: entity.id,
          defenderId: data.defenderId,
          attackerBuffs: 0,
          defenderBuffs: 0,
          status: 'pending'
        };
        war.battles.push(newBattle);
        io.emit('warUpdated', war);
      }
    });

    socket.on('startBattle', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const war = wars.get(data.warId);
      if (war && war.status === 'active') {
        const battle = war.battles.find((b: any) => b.id === data.battleId);
        if (battle && battle.status === 'pending') {
          // Both need to click start? The prompt says "Для того чтобы произошло сражение обоим игрокам надо нажать на зелёную кнопку «начать битву»."
          // Let's simplify: if one clicks, it sets their readiness. If both ready, roll.
          // Actually, let's just roll immediately for simplicity or add a ready state.
          // Let's add ready state to battle.
          if (!battle.readyPlayers) battle.readyPlayers = [];
          if (!battle.readyPlayers.includes(entity.id)) {
            battle.readyPlayers.push(entity.id);
          }
          
          if (battle.readyPlayers.includes(battle.attackerId) && battle.readyPlayers.includes(battle.defenderId)) {
            // Roll dice
            battle.attackerRoll = Math.floor(Math.random() * 100) + 1 + battle.attackerBuffs;
            battle.defenderRoll = Math.floor(Math.random() * 100) + 1 + battle.defenderBuffs;
            
            const diff = Math.abs(battle.attackerRoll - battle.defenderRoll);
            let resultText = '';
            
            if (diff <= 5) {
              battle.winnerId = 'draw';
              resultText = 'Ничья';
              battle.pixelsToPaint = 0;
            } else if (battle.attackerRoll > battle.defenderRoll) {
              battle.winnerId = battle.attackerId;
              if (diff > 50) resultText = 'Полный разгром';
              else if (diff > 30) resultText = 'Решающая победа';
              else if (diff > 15) resultText = 'Уверенное наступление';
              else resultText = 'Малое продвижение';
              battle.pixelsToPaint = Math.max(10, Math.floor(diff * 2));
            } else {
              battle.winnerId = battle.defenderId;
              if (diff > 50) resultText = 'Полный разгром';
              else if (diff > 30) resultText = 'Решающая победа';
              else if (diff > 15) resultText = 'Уверенное наступление';
              else resultText = 'Малое продвижение';
              battle.pixelsToPaint = Math.max(10, Math.floor(diff * 2));
            }
            
            battle.resultText = resultText;
            battle.status = 'finished';
          }
          io.emit('warUpdated', war);
        }
      }
    });

    socket.on('paintBattleResult', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const war = wars.get(data.warId);
      if (war && war.status === 'active') {
        const battle = war.battles.find((b: any) => b.id === data.battleId);
        if (battle && battle.status === 'finished' && battle.winnerId === entity.id && battle.pixelsToPaint > 0) {
          // Apply painted territories
          const painted = data.paintedTerritories.slice(0, battle.pixelsToPaint);
          let successfullyPainted = 0;
          
          const newNations = new Map(nations);
          for (const territoryIdx of painted) {
            const currentOwner = Array.from(newNations.values()).find(n => n.territories.includes(territoryIdx));
            const currentOwnerEntity = currentOwner ? getDiplomaticEntity(currentOwner.id) : null;
            
            const currentOccupier = Array.from(newNations.values()).find(n => n.occupations?.includes(territoryIdx));
            const currentOccupierEntity = currentOccupier ? getDiplomaticEntity(currentOccupier.id) : null;

            const loserId = battle.winnerId === battle.attackerId ? battle.defenderId : battle.attackerId;
            
            if ((currentOwnerEntity && currentOwnerEntity.id === loserId) || (currentOccupierEntity && currentOccupierEntity.id === loserId)) {
              let changed = false;
              // Remove from any other occupier
              for (const [nId, n] of newNations.entries()) {
                if (n.occupations && n.occupations.includes(territoryIdx)) {
                  n.occupations = n.occupations.filter((t: number) => t !== territoryIdx);
                  newNations.set(nId, n);
                  io.emit('nationUpdated', n);
                  changed = true;
                }
              }
              // Add to winner's occupations if not their own territory
              const winnerNation = newNations.get(player.nationId);
              if (winnerNation) {
                if (!winnerNation.territories.includes(territoryIdx)) {
                  if (!winnerNation.occupations) winnerNation.occupations = [];
                  if (!winnerNation.occupations.includes(territoryIdx)) {
                    winnerNation.occupations.push(territoryIdx);
                    newNations.set(player.nationId, winnerNation);
                    io.emit('nationUpdated', winnerNation);
                    changed = true;
                  }
                }
              }
              if (changed) {
                successfullyPainted++;
                if (!battle.paintedPixels) battle.paintedPixels = [];
                battle.paintedPixels.push(territoryIdx);
              }
            }
          }
          
          battle.pixelsToPaint -= successfullyPainted;

          // Check if loser is fully occupied. If so, reset remaining pixels.
          const loserId = battle.winnerId === battle.attackerId ? battle.defenderId : battle.attackerId;
          const isLoserFullyOccupied = () => {
             const loserEntity = getDiplomaticEntity(loserId);
             if (!loserEntity) return false;
             
             let allLoserTerritories: number[] = [];
             if ('members' in loserEntity) {
               (loserEntity as any).members.forEach((mId: string) => {
                 const m = newNations.get(mId);
                 if (m) allLoserTerritories.push(...m.territories);
               });
             } else {
               const n = newNations.get(loserEntity.id);
               if (n) allLoserTerritories.push(...n.territories);
             }

             if (allLoserTerritories.length === 0) return true;

             const allOccupied = allLoserTerritories.every(tId => {
               // Is this territory occupied by anyone in the winning side?
               // The user said "by another country", let's treat it as occupied by ANY country
               let isOccupied = false;
               for (const n of newNations.values()) {
                 if (n.occupations && n.occupations.includes(tId)) {
                   isOccupied = true;
                   break;
                 }
               }
               return isOccupied;
             });
             return allOccupied;
          };

          if (isLoserFullyOccupied()) {
             battle.pixelsToPaint = 0;
          }

          io.emit('warUpdated', war);
        }
      }
    });

    socket.on('captureLands', (data: { indices: number[] }) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const myWars = Array.from(wars.values()).filter(w => w.status === 'active' && (w.attackers.includes(entity.id) || w.defenders.includes(entity.id)));
      if (myWars.length === 0) return;

      const newNations = new Map(nations);
      
      for (const territoryIdx of data.indices) {
        const currentOwner = Array.from(newNations.values()).find(n => n.territories.includes(territoryIdx));
        const currentOwnerEntity = currentOwner ? getDiplomaticEntity(currentOwner.id) : null;
        
        const currentOccupier = Array.from(newNations.values()).find(n => n.occupations?.includes(territoryIdx));
        const currentOccupierEntity = currentOccupier ? getDiplomaticEntity(currentOccupier.id) : null;

        const isEnemy = myWars.some(w => {
          const isAttacker = w.attackers.includes(entity.id);
          const enemies = isAttacker ? w.defenders : w.attackers;
          return (currentOwnerEntity && enemies.includes(currentOwnerEntity.id)) || 
                 (currentOccupierEntity && enemies.includes(currentOccupierEntity.id));
        });

        if (isEnemy) {
          for (const [nId, n] of newNations.entries()) {
            if (n.occupations && n.occupations.includes(territoryIdx)) {
              n.occupations = n.occupations.filter((t: number) => t !== territoryIdx);
              newNations.set(nId, n);
              io.emit('nationUpdated', n);
            }
          }
          const myNation = newNations.get(player.nationId);
          if (myNation) {
            if (!myNation.territories.includes(territoryIdx)) {
              if (!myNation.occupations) myNation.occupations = [];
              if (!myNation.occupations.includes(territoryIdx)) {
                myNation.occupations.push(territoryIdx);
                newNations.set(player.nationId, myNation);
                io.emit('nationUpdated', myNation);
                
                // Add to timeline
                const activeWar = myWars[0];
                if (activeWar) {
                   if (!activeWar.timelineEvents) activeWar.timelineEvents = [];
                   let lastEvent = activeWar.timelineEvents[activeWar.timelineEvents.length - 1];
                   if (lastEvent && lastEvent.type === 'paint' && lastEvent.data.claimerId === entity.id && (Date.now() - lastEvent.time < 5000)) {
                      lastEvent.data.pixels.push(territoryIdx);
                   } else {
                      activeWar.timelineEvents.push({
                         time: Date.now(),
                         type: 'paint',
                         data: { claimerId: entity.id, pixels: [territoryIdx] }
                      });
                   }
                   wars.set(activeWar.id, activeWar);
                }
              }
            }
          }
        }
      }
    });

    socket.on('publishNews', (text) => {
      const player = players.get(playerId);
      if (!player) return;
      const nation = nations.get(player.nationId);
      if (!nation) return;
      
      const now = Date.now();
      const lastTime = lastNewsTime.get(playerId) || 0;
      if (now - lastTime < 60000) {
        socket.emit('newsError', { message: 'Вы можете публиковать новости только раз в минуту.' });
        return;
      }
      lastNewsTime.set(playerId, now);
      
      addNews(`[${nation.shortName}] ${text}`, 'player_news', nation.id);
    });

    socket.on('placeColonizationBattle', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const battleId = Math.random().toString(36).substring(7);
      const newBattle = {
        id: battleId,
        warId: 'colonization',
        x: data.x,
        y: data.y,
        attackerId: entity.id,
        defenderId: 'nature',
        attackerBuffs: 0,
        defenderBuffs: 0,
        status: 'pending',
        readyPlayers: []
      };
      
      colonizationBattles.set(battleId, newBattle);
      io.emit('colonizationBattleCreated', newBattle);
    });

    socket.on('startColonizationBattle', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const battle = colonizationBattles.get(data.battleId);
      if (battle && battle.status === 'pending' && battle.attackerId === entity.id) {
        battle.attackerRoll = Math.floor(Math.random() * 100) + 1;
        battle.defenderRoll = Math.floor(Math.random() * 100) + 1;
        
        const diff = Math.abs(battle.attackerRoll - battle.defenderRoll);
        let resultText = '';
        
        if (diff <= 5) {
          battle.winnerId = 'draw';
          resultText = 'Ничья';
          battle.pixelsToPaint = 0;
        } else if (battle.attackerRoll > battle.defenderRoll) {
          battle.winnerId = battle.attackerId;
          resultText = `Победа ${entity.name}`;
          battle.pixelsToPaint = Math.max(1, Math.floor(diff / 2));
        } else {
          battle.winnerId = battle.defenderId;
          resultText = 'Поражение';
          battle.pixelsToPaint = 0;
        }
        
        battle.status = 'finished';
        battle.resultText = resultText;
        
        colonizationBattles.set(battle.id, battle);
        io.emit('colonizationBattleUpdated', battle);

        if (battle.pixelsToPaint === 0) {
          setTimeout(() => {
            colonizationBattles.delete(battle.id);
            io.emit('colonizationBattleFinished', battle);
          }, 5000); // 5 seconds delay to show the result
        }
      }
    });

    socket.on('paintColonizationResult', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      
      const battle = colonizationBattles.get(data.battleId);
      if (battle && battle.status === 'finished' && battle.winnerId === entity.id && battle.pixelsToPaint > 0) {
        const painted = data.paintedTerritories.slice(0, battle.pixelsToPaint);
        let successfullyPainted = 0;
        
        const newNations = new Map(nations);
        const winnerNation = newNations.get(player.nationId);
        
        if (winnerNation) {
          for (const territoryIdx of painted) {
            // Check if territory is empty
            const currentOwner = Array.from(newNations.values()).find(n => n.territories.includes(territoryIdx));
            const currentOccupier = Array.from(newNations.values()).find(n => n.occupations?.includes(territoryIdx));
            
            if (!currentOwner && !currentOccupier) {
              if (!winnerNation.territories.includes(territoryIdx)) {
                winnerNation.territories.push(territoryIdx);
                successfullyPainted++;
                if (!battle.paintedPixels) battle.paintedPixels = [];
                battle.paintedPixels.push(territoryIdx);
              }
            }
          }
          
          if (successfullyPainted > 0) {
            newNations.set(player.nationId, winnerNation);
            io.emit('nationUpdated', winnerNation);
            
            battle.pixelsToPaint -= successfullyPainted;
            if (battle.pixelsToPaint <= 0) {
              colonizationBattles.delete(battle.id);
              io.emit('colonizationBattleFinished', battle);
            } else {
              colonizationBattles.set(battle.id, battle);
              io.emit('colonizationBattleUpdated', battle);
            }
          }
        }
      }
    });

    socket.on('createCity', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const nation = nations.get(player.nationId);
      if (!nation) return;

      if (nation.territories.includes(data.territoryIdx)) {
        const cityId = Math.random().toString(36).substring(7);
        if (!nation.cities) nation.cities = [];
        nation.cities.push({ id: cityId, name: data.name, territoryIdx: data.territoryIdx, population: 1000 });
        nations.set(player.nationId, nation);
        io.emit('nationUpdated', nation);
      }
    });

    socket.on('renameCity', (data) => {
      const { cityId, newName } = data;
      const player = players.get(playerId);
      if (!player) return;
      
      const nation = nations.get(player.nationId);
      if (!nation || !nation.cities) return;

      const city = nation.cities.find((c: any) => c.id === cityId);
      if (city && newName && newName.trim().length > 0) {
        city.name = newName.trim();
        nations.set(player.nationId, nation);
        io.emit('nationUpdated', nation);
      }
    });

    socket.on('updateEconomyState', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const nation = nations.get(player.nationId);
      if (!nation) return;

      if (nation.economyLockedUntil && Date.now() < nation.economyLockedUntil) {
        return; // Locked
      }

      const validStates = ['Депрессия', 'Рецессия', 'Стагнация', 'Рост', 'Экономический бум'];
      if (validStates.includes(data.state)) {
        nation.economyState = data.state;
        nations.set(player.nationId, nation);
        io.emit('nationUpdated', nation);
      }
    });

    socket.on('updateNation', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const nation = nations.get(player.nationId);
      if (!nation) return;
      
      const wiki = historicalNations.get(player.nationId);
      
      let isSignificantChange = false;
      const oldName = nation.name;
      const oldFlag = nation.flag;
      
      const newName = data.name || nation.name;
      const newFlag = data.flag !== undefined ? data.flag : nation.flag;
      
      // Calculate Levenshtein distance
      const calcDistance = (a: string, b: string) => {
         if (a === b) return 0;
         const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
         for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
         for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
         for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
               const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
               matrix[j][i] = Math.min(
                  matrix[j][i - 1] + 1,
                  matrix[j - 1][i] + 1,
                  matrix[j - 1][i - 1] + indicator
               );
            }
         }
         return matrix[b.length][a.length];
      };
      
      if (oldName !== newName) {
        if (calcDistance(oldName, newName) > 4) isSignificantChange = true;
      }
      if (oldFlag !== newFlag && newFlag && newFlag.length > 0 && oldFlag && oldFlag.length > 0) {
        if (oldFlag !== newFlag) isSignificantChange = true;
      }
      
      if (isSignificantChange && wiki) {
        if (!wiki.symbolismHistory) wiki.symbolismHistory = [];
        wiki.symbolismHistory.push({
          name: oldName,
          flag: oldFlag,
          timestamp: Date.now()
        });
        
        wiki.events.push({
            timestamp: Date.now(),
            type: 'history',
            description: `${oldName} transformed into ${newName}.`
        });
        
        addNews(`${oldName} is now known as ${newName}.`, 'transformation');
        
        // Ensure name and flag are instantly updated in wiki
        wiki.name = newName;
        if (newFlag) wiki.flag = newFlag;
        
        io.emit('wikiData', Array.from(historicalNations.values()));
      }
      
      if (data.name) {
        nation.name = data.name;
        if (wiki && !isSignificantChange) {
           wiki.name = data.name; // minor update
           io.emit('wikiData', Array.from(historicalNations.values()));
        }
      }
      if (data.shortName) nation.shortName = data.shortName;
      if (data.ideology && data.ideology !== nation.ideology) {
        nation.ideology = data.ideology;
        if (wiki) {
          wiki.ideology = data.ideology;
          wiki.events.push({ timestamp: Date.now(), type: 'ideology_change', description: `Ideology changed to ${data.ideology}.` });
          io.emit('wikiData', Array.from(historicalNations.values()));
        }
      }
      if (data.flag !== undefined) {
        nation.flag = data.flag;
        if (wiki && !isSignificantChange) {
          wiki.flag = data.flag; // minor update
          io.emit('wikiData', Array.from(historicalNations.values()));
        }
      }
      if (data.description !== undefined) nation.description = data.description;
      if (data.parties !== undefined) nation.parties = data.parties;
      if (data.color) {
        nation.color = data.color;
        // Update union color if founder
        for (const [unionId, union] of unions.entries()) {
          if (union.founderId === player.nationId) {
            union.color = data.color;
            unions.set(unionId, union);
            io.emit('unionUpdated', union);
          }
        }
      }
      
      nations.set(player.nationId, nation);
      io.emit('nationUpdated', nation);
    });

    socket.on('updateWikiEventArticle', (data) => {
      const wiki = historicalNations.get(data.nationId);
      if (wiki && wiki.events && wiki.events[data.eventIndex]) {
        wiki.events[data.eventIndex].customArticle = data.article;
        if (data.customWiki) {
           wiki.events[data.eventIndex].customWiki = data.customWiki;
        }
        io.emit('wikiData', Array.from(historicalNations.values()));
      }
    });

    socket.on('addCustomWikiEvent', (data) => {
      const player = players.get(playerId);
      if (!player || !player.nationId) return;
      
      const realNationId = data.nationId || player.diplomaticEntityId || player.nationId;
      const wiki = historicalNations.get(realNationId);
      if (wiki) {
        wiki.events.push({
          timestamp: Date.now(),
          type: 'history',
          description: data.description,
          customWiki: data.customWiki
        });
        io.emit('wikiData', Array.from(historicalNations.values()));
      }
    });

    socket.on('updateWikiDescription', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      
      const wiki = historicalNations.get(player.nationId);
      if (wiki) {
        wiki.customDescription = data.description;
        io.emit('wikiData', Array.from(historicalNations.values()));
      }
    });

    socket.on('createMailChat', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      
      const id = Math.random().toString(36).substring(7);
      const parts = Array.from(new Set([player.nationId, ...(data.participants || [])]));
      const chat = {
        id,
        participants: parts,
        title: data.title || '',
        messages: [],
        updatedAt: Date.now(),
        type: parts.length > 2 ? 'group' : 'private'
      };
      mailChats.set(id, chat);
      
      chat.participants.forEach((natId: string) => {
         const p = Array.from(players.values()).find(pl => pl.nationId === natId);
         if (p) {
           io.to(p.id).emit('mailChatUpdated', chat);
         }
      });
    });

    socket.on('sendMailMessage', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const chat = mailChats.get(data.chatId);
      if (!chat || !chat.participants.includes(player.nationId)) return;
      
      const nation = nations.get(player.nationId);
      if (!nation) return;

      if (data.type === 'transfer' && data.amount) {
        if (!nation.budget || nation.budget < data.amount || data.amount <= 0) return;
        
        nation.budget -= data.amount;
        nations.set(player.nationId, nation);
        io.emit('nationUpdated', nation);
        
        let targets = chat.participants.filter((id: string) => id !== player.nationId);
        if (data.transferTarget && data.transferTarget !== 'all' && targets.includes(data.transferTarget)) {
           targets = [data.transferTarget];
        }

        if (targets.length > 0) {
          const splitAmount = Math.floor(data.amount / targets.length);
          targets.forEach((otherId: string) => {
             const otherNat = nations.get(otherId);
             if (otherNat) {
               otherNat.budget = (otherNat.budget || 0) + splitAmount;
               nations.set(otherId, otherNat);
               io.emit('nationUpdated', otherNat);
             }
          });
        }
      }

      const msg = {
        id: Math.random().toString(36).substring(7),
        senderId: player.nationId,
        text: data.text,
        timestamp: Date.now(),
        type: data.type || 'text',
        amount: data.amount,
        treatySummary: data.treatySummary,
        transferTarget: data.transferTarget,
        treatyId: data.treatyId
      };

      chat.messages.push(msg);
      chat.updatedAt = Date.now();
      
      chat.participants.forEach((natId: string) => {
         const p = Array.from(players.values()).find(pl => pl.nationId === natId);
         if (p) {
           io.to(p.id).emit('mailChatUpdated', chat);
         }
      });
    });

    socket.on('renameMailChat', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const chat = mailChats.get(data.chatId);
      if (!chat || !chat.participants.includes(player.nationId)) return;
      if (chat.type !== 'group') return;
      
      chat.title = data.title;
      mailChats.set(chat.id, chat);
      
      chat.participants.forEach((natId: string) => {
         const p = Array.from(players.values()).find(pl => pl.nationId === natId);
         if (p) {
           io.to(p.id).emit('mailChatUpdated', chat);
         }
      });
    });

    socket.on('proposeTreaty', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const treaty = {
        id: Math.random().toString(36).substring(7),
        title: data.title,
        content: data.content,
        authorId: player.nationId,
        requiredSigners: data.requiredSigners,
        signatures: [player.nationId],
        status: 'pending',
        timestamp: Date.now()
      };
      // Auto active if only author signs
      if (treaty.requiredSigners.every((s: string) => treaty.signatures.includes(s))) {
         treaty.status = 'active';
      }
      treaties.set(treaty.id, treaty);
      io.emit('treatyUpdated', treaty);

      if (data.chatId) {
         const chat = mailChats.get(data.chatId);
         if (chat && chat.participants.includes(player.nationId)) {
            const msg = {
              id: Math.random().toString(36).substring(7),
              senderId: player.nationId,
              text: data.text || '',
              timestamp: Date.now(),
              type: 'treaty',
              treatyId: treaty.id
            };
            chat.messages.push(msg);
            chat.updatedAt = Date.now();
            chat.participants.forEach((natId: string) => {
               const p = Array.from(players.values()).find(pl => pl.nationId === natId);
               if (p) {
                 io.to(p.id).emit('mailChatUpdated', chat);
               }
            });
         }
      }
    });

    socket.on('signTreaty', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const treaty = treaties.get(data.treatyId);
      if (!treaty || treaty.status !== 'pending') return;
      if (!treaty.requiredSigners.includes(player.nationId)) return;
      if (!treaty.signatures.includes(player.nationId)) {
         treaty.signatures.push(player.nationId);
         if (treaty.requiredSigners.every((s: string) => treaty.signatures.includes(s))) {
            treaty.status = 'active';
         }
         treaties.set(treaty.id, treaty);
         io.emit('treatyUpdated', treaty);
      }
    });

    socket.on('disbandNation', () => {
      const player = players.get(playerId);
      if (!player) return;
      const nation = nations.get(player.nationId);
      if (!nation) return;
      
      // Remove from alliances
      alliances.forEach((alliance, id) => {
        if (alliance.members.includes(player.nationId)) {
          alliance.members = alliance.members.filter((m: string) => m !== player.nationId);
          if (alliance.members.length === 0) {
            alliances.delete(id);
            io.emit('allianceDeleted', id);
          } else {
            if (alliance.founderId === player.nationId) {
              alliance.founderId = alliance.members[0];
            }
            io.emit('allianceUpdated', alliance);
          }
        }
      });
      
      // Remove from unions
      unions.forEach((union, id) => {
        if (union.members.includes(player.nationId)) {
          union.members = union.members.filter((m: string) => m !== player.nationId);
          if (union.members.length === 0) {
            unions.delete(id);
            io.emit('unionDeleted', id);
            
            // Remove union from any alliances
            alliances.forEach((alliance, allianceId) => {
              if (alliance.members.includes(id)) {
                alliance.members = alliance.members.filter((m: string) => m !== id);
                if (alliance.members.length === 0) {
                  alliances.delete(allianceId);
                  io.emit('allianceDeleted', allianceId);
                } else {
                  if (alliance.founderId === id) {
                    alliance.founderId = alliance.members[0];
                  }
                  io.emit('allianceUpdated', alliance);
                }
              }
            });
          } else {
            if (union.founderId === player.nationId) {
              union.founderId = union.members[0];
            }
            io.emit('unionUpdated', union);
          }
        }
      });

      nations.delete(player.nationId);
      players.delete(playerId);
      
      const wiki = historicalNations.get(player.nationId);
      if (wiki) {
        wiki.destroyedAt = Date.now();
        wiki.events.push({ timestamp: Date.now(), type: 'disband', description: `The nation collapsed and disbanded.` });
      }

      io.emit('nationDeleted', player.nationId);
      socket.emit('disbandSuccess');
      addNews(`${nation.name} has collapsed and disbanded.`, 'spawn');
      io.emit('wikiData', Array.from(historicalNations.values()));
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', playerId);
    });
  });

  // Economy Loop
  setInterval(() => {
    let updated = false;
    
    // Step 1: Calculate raw potentials for all nations
    const rawRates = new Map<string, { rate: number, overheatChange: number }>();
    
    for (const [id, nation] of nations.entries()) {
      if (!nation.gdp) nation.gdp = 1000;
      if (!nation.overheat) nation.overheat = 0;
      if (!nation.economyState) nation.economyState = 'Стагнация';

      let baseChange = 0;
      let overheatChange = 0;

      switch (nation.economyState) {
        case 'Депрессия':
          baseChange = -0.12;
          overheatChange = -20;
          break;
        case 'Рецессия':
          baseChange = -0.04;
          overheatChange = -8;
          break;
        case 'Стагнация':
          baseChange = 0;
          overheatChange = -1.2;
          break;
        case 'Рост':
          baseChange = 0.02;
          overheatChange = 0.25;
          break;
        case 'Экономический бум':
          baseChange = 0.05;
          overheatChange = 0.5;
          break;
      }

      const overheatValue = nation.overheat || 0;
      let instability = 0;
      if (overheatValue > 50) {
        instability = Math.pow((overheatValue - 50) / 50, 1.5);
      }

      let randomFactor = (Math.random() * 0.01) - 0.005;
      
      if (instability > 0) {
        const swingMin = -0.30 * instability;
        const swingMax = 0.08 * instability;
        const wildSwing = (Math.random() * (swingMax - swingMin)) + swingMin;
        randomFactor += wildSwing;
      }

      const resistanceThreshold = 100000;
      let resistanceMultiplier = 1.0;
      if (nation.gdp > resistanceThreshold) {
        resistanceMultiplier = Math.max(0.15, 1 / (1 + (nation.gdp - resistanceThreshold) / 400000));
      }

      let rawChangePercent = baseChange + randomFactor;
      if (rawChangePercent > 0) {
        rawChangePercent *= resistanceMultiplier;
      }
      
      rawRates.set(id, { rate: rawChangePercent, overheatChange });
    }

    // Step 2: Calculate bloc averages
    const blocAvgs = new Map<string, number>();
    for (const union of unions.values()) {
      const rates = union.members.map((mid: string) => rawRates.get(mid)?.rate).filter((r: any) => r !== undefined) as number[];
      if (rates.length > 1) {
        blocAvgs.set(`union_${union.id}`, rates.reduce((a, b) => a + b, 0) / rates.length);
      }
    }
    for (const alliance of alliances.values()) {
      if (alliance.type === 'Economic') {
        const rates = alliance.members.map((mid: string) => rawRates.get(mid)?.rate).filter((r: any) => r !== undefined) as number[];
        if (rates.length > 1) {
          blocAvgs.set(`alliance_${alliance.id}`, rates.reduce((a, b) => a + b, 0) / rates.length);
        }
      }
    }

    // Step 3: Apply adjusted economics and other changes
    for (const [id, nation] of nations.entries()) {
      const rawData = rawRates.get(id);
      if (!rawData) continue;
      
      let finalRate = rawData.rate;
      let sumAvg = 0;
      let count = 0;
      
      // Check unions
      for (const union of unions.values()) {
        if (union.members && union.members.includes(id)) {
          const avg = blocAvgs.get(`union_${union.id}`);
          if (avg !== undefined) {
            sumAvg += avg;
            count++;
          }
        }
      }
      // Check economic alliances
      for (const alliance of alliances.values()) {
        if (alliance.type === 'Economic' && alliance.members && alliance.members.includes(id)) {
          const avg = blocAvgs.get(`alliance_${alliance.id}`);
          if (avg !== undefined) {
            sumAvg += avg;
            count++;
          }
        }
      }
      
      if (count > 0) {
        const avgRate = sumAvg / count;
        // 75% tie-in to the group economics (was 40%) - blocs now have a much stronger shared destiny
        finalRate = finalRate * 0.25 + avgRate * 0.75;
      }
      
      const changeAmount = Math.floor(nation.gdp * finalRate);
      nation.gdpChange = changeAmount;
      nation.gdp = Math.max(100, nation.gdp + changeAmount);
      nation.overheat = Math.max(0, Math.min(100, nation.overheat + rawData.overheatChange));

      const taxRate = 0.10 * Math.max(0.5, 1 / (1 + (nation.gdp / 1000000)));
      const taxRevenue = Math.floor(nation.gdp * taxRate * 10000);
      nation.budget = (nation.budget || 0) + taxRevenue;

      // Population growth
      const isAtWar = Array.from(wars.values()).some((w: any) => 
        w.status === 'active' && (w.attackers.includes(id) || w.defenders.includes(id))
      );

      if (nation.cities && nation.cities.length > 0) {
        let popGrowthRate = 0;
        if (isAtWar) {
          popGrowthRate = 0;
        } else {
          switch (nation.economyState) {
            case 'Депрессия':
            case 'Рецессия':
              popGrowthRate = 0.001;
              break;
            case 'Стагнация':
              popGrowthRate = 0.005;
              break;
            case 'Рост':
            case 'Экономический бум':
              popGrowthRate = 0.015;
              break;
          }
        }

        nation.cities = nation.cities.map((city: any) => {
          if (!city.population) city.population = 1000;
          return {
            ...city,
            population: Math.floor(city.population * (1 + popGrowthRate))
          };
        });
      }

      nations.set(id, nation);
      updated = true;

      const wiki = historicalNations.get(id);
      if (wiki) {
        wiki.lastTerritories = nation.territories;
        if (nation.gdp > wiki.peakGdp) wiki.peakGdp = nation.gdp;
        if (nation.territories.length > wiki.peakTerritories) wiki.peakTerritories = nation.territories.length;
      }
    }
    
    if (updated) {
      io.emit('gameState', { 
        nations: Array.from(nations.values()), 
        chatHistory,
        alliances: Array.from(alliances.values()),
        unions: Array.from(unions.values()),
        newsHistory,
        allianceRequests: Array.from(allianceRequests.values()),
        allianceChats: Object.fromEntries(allianceChats),
        unSessions: Array.from(unSessions.values()),
        wars: Array.from(wars.values()),
        finishedWars: Array.from(finishedWars.values()),
        colonizationBattles: Array.from(colonizationBattles.values()),
        treaties: Array.from(treaties.values())
      });
      io.emit('wikiData', Array.from(historicalNations.values()));
    }
  }, 3000); // Update every 3 seconds

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
