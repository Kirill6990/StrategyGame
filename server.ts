import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

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
      colonizationBattles: Array.from(colonizationBattles.values())
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
          flag: data.flag || ''
        };
        nations.set(nationId, newNation);
        players.set(playerId, { id: playerId, nationId });
        
        io.emit('nationCreated', newNation);
        socket.emit('spawnSuccess', newNation);
        addNews(`A new nation, ${newNation.name}, has emerged!`, 'spawn');
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
            flag: request.data.flag || ''
          };
          
          nations.set(nationId, newNation);
          players.set(request.from, { id: request.from, nationId });
          
          io.emit('nationCreated', newNation);
          io.to(request.from).emit('spawnSuccess', newNation);
          spawnRequests.delete(requestId);
          addNews(`A new nation, ${newNation.name}, has emerged!`, 'spawn');
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

    // Wars Events
    socket.on('declareWar', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const targetEntity = getDiplomaticEntity(data.targetId);
      if (!targetEntity) return;

      const warId = Math.random().toString(36).substring(7);
      const newWar = {
        id: warId,
        attackerId: entity.id,
        defenderId: targetEntity.id,
        reason: data.reason,
        status: 'active',
        attackers: [entity.id],
        defenders: [targetEntity.id],
        battles: [],
        createdAt: Date.now()
      };
      wars.set(warId, newWar);
      io.emit('warCreated', newWar);
      addNews(`${entity.name} объявил войну ${targetEntity.name}! Причина: ${data.reason}`, 'war_declare');
    });

    socket.on('joinWar', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const entity = getDiplomaticEntity(player.nationId);
      if (!entity.isFounder) return;

      const war = wars.get(data.warId);
      if (war && war.status === 'active') {
        if (data.side === 'attackers' && !war.attackers.includes(entity.id) && !war.defenders.includes(entity.id)) {
          war.attackers.push(entity.id);
          io.emit('warUpdated', war);
          addNews(`${entity.name} вступил в войну на стороне атакующих!`, 'war_join');
        } else if (data.side === 'defenders' && !war.attackers.includes(entity.id) && !war.defenders.includes(entity.id)) {
          war.defenders.push(entity.id);
          io.emit('warUpdated', war);
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
            
            for (const [territoryIdxStr, claimerId] of Object.entries(claims)) {
              const territoryIdx = parseInt(territoryIdxStr);
              // Remove from old owner and clear occupations
              for (const [nId, n] of newNations.entries()) {
                let changed = false;
                if (n.territories.includes(territoryIdx)) {
                  n.territories = n.territories.filter((t: number) => t !== territoryIdx);
                  changed = true;
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
            
            // 2. Apply puppets
            for (const [targetId, claimerId] of Object.entries(war.peaceTreaty.puppetClaims)) {
              let actualClaimerId = claimerId;
              if (unions.has(claimerId)) {
                actualClaimerId = unions.get(claimerId).founderId;
              }
              
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
                  }
                }
              } else {
                const target = newNations.get(targetId);
                if (target) {
                  target.status = 'Puppet';
                  target.parentId = actualClaimerId;
                  newNations.set(targetId, target);
                  io.emit('nationUpdated', target);
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
              battle.attackerResultText = 'Ничья';
              battle.defenderResultText = 'Ничья';
              battle.pixelsToPaint = 0;
            } else if (battle.attackerRoll > battle.defenderRoll) {
              battle.winnerId = battle.attackerId;
              let winText: string, loseText: string;
              if (diff > 50) { winText = 'Полный разгром'; loseText = 'Тотальное поражение'; }
              else if (diff > 30) { winText = 'Решающая победа'; loseText = 'Тяжёлое поражение'; }
              else if (diff > 15) { winText = 'Уверенное наступление'; loseText = 'Отступление под давлением'; }
              else { winText = 'Малое продвижение'; loseText = 'Незначительные потери'; }
              battle.attackerResultText = winText;
              battle.defenderResultText = loseText;
              resultText = winText;
              battle.pixelsToPaint = Math.max(10, Math.floor(diff * 2));
            } else {
              battle.winnerId = battle.defenderId;
              let winText: string, loseText: string;
              if (diff > 50) { winText = 'Блестящая оборона'; loseText = 'Провальное наступление'; }
              else if (diff > 30) { winText = 'Успешная оборона'; loseText = 'Сокрушительное поражение'; }
              else if (diff > 15) { winText = 'Отражение атаки'; loseText = 'Вынужденное отступление'; }
              else { winText = 'Стойкое сопротивление'; loseText = 'Незначительная неудача'; }
              battle.attackerResultText = loseText;
              battle.defenderResultText = winText;
              resultText = winText;
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
              if (changed) successfullyPainted++;
            }
          }
          
          battle.pixelsToPaint -= successfullyPainted;
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

    socket.on('updateNation', (data) => {
      const player = players.get(playerId);
      if (!player) return;
      const nation = nations.get(player.nationId);
      if (!nation) return;
      
      if (data.name) nation.name = data.name;
      if (data.shortName) nation.shortName = data.shortName;
      if (data.ideology) nation.ideology = data.ideology;
      if (data.flag !== undefined) nation.flag = data.flag;
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
      
      io.emit('nationDeleted', player.nationId);
      socket.emit('disbandSuccess');
      addNews(`${nation.name} has collapsed and disbanded.`, 'spawn');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', playerId);
    });
  });

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
