import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Shape, Group, Circle, Rect } from 'react-konva';
import { useGameStore } from './store';
import type { Treaty, TreatyBlock } from './store';
import { Settings, Users, Map as MapIcon, Shield, Check, ArrowLeft, MessageSquare, Upload, Image as ImageIcon, X, Search, Globe, Landmark, ChevronLeft, Star, Swords, Crosshair, Flag, Dices, FileText, Plus, Trash2, Pencil, UserPlus, ScrollText } from 'lucide-react';

const IDEOLOGIES = [
  'Communism', 'Fascism', 'Democracy', 'Anarcho-capitalism', 'Theocracy',
  'Monarchy', 'Social Democracy', 'Technocracy', 'Oligarchy', 'Meritocracy',
  'Feudalism', 'Tribalism', 'Corporatocracy', 'Eco-Socialism', 'Libertarianism',
];

const DEPENDENCY_STATUSES = ['Independent', 'Puppet', 'Autonomous Republic', 'Colony'];

const ALLIANCE_TYPES = ['Political', 'Economic', 'Military', 'Scientific', 'Cultural'];

const WORLD_FLAGS = [
  { code: 'un', name: 'United Nations' }, { code: 'eu', name: 'European Union' },
  { code: 'af', name: 'Afghanistan' }, { code: 'al', name: 'Albania' }, { code: 'dz', name: 'Algeria' },
  { code: 'ar', name: 'Argentina' }, { code: 'am', name: 'Armenia' }, { code: 'au', name: 'Australia' },
  { code: 'at', name: 'Austria' }, { code: 'az', name: 'Azerbaijan' }, { code: 'bh', name: 'Bahrain' },
  { code: 'bd', name: 'Bangladesh' }, { code: 'by', name: 'Belarus' }, { code: 'be', name: 'Belgium' },
  { code: 'ba', name: 'Bosnia and Herzegovina' }, { code: 'br', name: 'Brazil' }, { code: 'bg', name: 'Bulgaria' },
  { code: 'kh', name: 'Cambodia' }, { code: 'cm', name: 'Cameroon' }, { code: 'ca', name: 'Canada' },
  { code: 'cl', name: 'Chile' }, { code: 'cn', name: 'China' }, { code: 'co', name: 'Colombia' },
  { code: 'cr', name: 'Costa Rica' }, { code: 'hr', name: 'Croatia' }, { code: 'cu', name: 'Cuba' },
  { code: 'cy', name: 'Cyprus' }, { code: 'cz', name: 'Czechia' }, { code: 'dk', name: 'Denmark' },
  { code: 'do', name: 'Dominican Republic' }, { code: 'ec', name: 'Ecuador' }, { code: 'eg', name: 'Egypt' },
  { code: 'sv', name: 'El Salvador' }, { code: 'ee', name: 'Estonia' }, { code: 'et', name: 'Ethiopia' },
  { code: 'fi', name: 'Finland' }, { code: 'fr', name: 'France' }, { code: 'ge', name: 'Georgia' },
  { code: 'de', name: 'Germany' }, { code: 'gh', name: 'Ghana' }, { code: 'gr', name: 'Greece' },
  { code: 'gt', name: 'Guatemala' }, { code: 'hn', name: 'Honduras' }, { code: 'hu', name: 'Hungary' },
  { code: 'is', name: 'Iceland' }, { code: 'in', name: 'India' }, { code: 'id', name: 'Indonesia' },
  { code: 'ir', name: 'Iran' }, { code: 'iq', name: 'Iraq' }, { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' }, { code: 'it', name: 'Italy' }, { code: 'jm', name: 'Jamaica' },
  { code: 'jp', name: 'Japan' }, { code: 'jo', name: 'Jordan' }, { code: 'kz', name: 'Kazakhstan' },
  { code: 'ke', name: 'Kenya' }, { code: 'kr', name: 'South Korea' }, { code: 'kp', name: 'North Korea' },
  { code: 'kw', name: 'Kuwait' }, { code: 'kg', name: 'Kyrgyzstan' }, { code: 'lv', name: 'Latvia' },
  { code: 'lb', name: 'Lebanon' }, { code: 'ly', name: 'Libya' }, { code: 'lt', name: 'Lithuania' },
  { code: 'lu', name: 'Luxembourg' }, { code: 'mg', name: 'Madagascar' }, { code: 'my', name: 'Malaysia' },
  { code: 'ml', name: 'Mali' }, { code: 'mt', name: 'Malta' }, { code: 'mx', name: 'Mexico' },
  { code: 'md', name: 'Moldova' }, { code: 'mc', name: 'Monaco' }, { code: 'mn', name: 'Mongolia' },
  { code: 'me', name: 'Montenegro' }, { code: 'ma', name: 'Morocco' }, { code: 'mm', name: 'Myanmar' },
  { code: 'np', name: 'Nepal' }, { code: 'nl', name: 'Netherlands' }, { code: 'nz', name: 'New Zealand' },
  { code: 'ni', name: 'Nicaragua' }, { code: 'ng', name: 'Nigeria' }, { code: 'mk', name: 'North Macedonia' },
  { code: 'no', name: 'Norway' }, { code: 'om', name: 'Oman' }, { code: 'pk', name: 'Pakistan' },
  { code: 'pa', name: 'Panama' }, { code: 'py', name: 'Paraguay' }, { code: 'pe', name: 'Peru' },
  { code: 'ph', name: 'Philippines' }, { code: 'pl', name: 'Poland' }, { code: 'pt', name: 'Portugal' },
  { code: 'qa', name: 'Qatar' }, { code: 'ro', name: 'Romania' }, { code: 'ru', name: 'Russia' },
  { code: 'rw', name: 'Rwanda' }, { code: 'sa', name: 'Saudi Arabia' }, { code: 'sn', name: 'Senegal' },
  { code: 'rs', name: 'Serbia' }, { code: 'sg', name: 'Singapore' }, { code: 'sk', name: 'Slovakia' },
  { code: 'si', name: 'Slovenia' }, { code: 'so', name: 'Somalia' }, { code: 'za', name: 'South Africa' },
  { code: 'es', name: 'Spain' }, { code: 'lk', name: 'Sri Lanka' }, { code: 'sd', name: 'Sudan' },
  { code: 'se', name: 'Sweden' }, { code: 'ch', name: 'Switzerland' }, { code: 'sy', name: 'Syria' },
  { code: 'tw', name: 'Taiwan' }, { code: 'tj', name: 'Tajikistan' }, { code: 'tz', name: 'Tanzania' },
  { code: 'th', name: 'Thailand' }, { code: 'tn', name: 'Tunisia' }, { code: 'tr', name: 'Turkey' },
  { code: 'tm', name: 'Turkmenistan' }, { code: 'ug', name: 'Uganda' }, { code: 'ua', name: 'Ukraine' },
  { code: 'ae', name: 'United Arab Emirates' }, { code: 'gb', name: 'United Kingdom' }, { code: 'us', name: 'United States' },
  { code: 'uy', name: 'Uruguay' }, { code: 'uz', name: 'Uzbekistan' }, { code: 've', name: 'Venezuela' },
  { code: 'vn', name: 'Vietnam' }, { code: 'ye', name: 'Yemen' }, { code: 'zm', name: 'Zambia' }, { code: 'zw', name: 'Zimbabwe' }
];

const MAX_TERRITORY = 1000;
const BRUSH_RADIUS = 4;

import { Nation, Union, Alliance } from './store';

const EntityName = ({ entity, className = "" }: { entity: Nation | Union | Alliance | undefined, className?: string }) => {
  if (!entity) return <span className={className}>Unknown</span>;
  
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      {entity.flag ? (
        <img src={entity.flag} alt="flag" className="h-3 w-auto object-contain rounded-sm border border-white/20 shrink-0" />
      ) : (
        'members' in entity ? <Shield className="w-3 h-3 text-green-400 shrink-0" /> : <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: (entity as Nation).color }} />
      )}
      <span className="truncate">{entity.name}</span>
    </span>
  );
};

export default function App() {
  const { 
    connect, connected, nations, alliances, unions, myNation, requestSpawn, spawnStatus, spawnMessage,
    pendingRequests, approveSpawn, rejectSpawn, setupPhase, setSetupPhase,
    draftTerritories, setDraftTerritories, chatMessages, sendChatMessage,
    selectedNationId, setSelectedNationId, createAlliance, requestJoinAlliance, leaveAlliance,
    news, allianceRequests, allianceChats, approveAllianceJoin, rejectAllianceJoin, sendAllianceChatMessage,
    unSessions, createUNSession, voteUNSession, updateNation, disbandNation, publishNews,
    wars, finishedWars, declareWar, joinWar, proposePeaceTreaty, agreePeaceTreaty, rejectPeaceTreaty, placeBattle, startBattle, paintBattleResult,
    colonizationBattles, placeColonizationBattle, startColonizationBattle, paintColonizationResult,
    treaties, createTreaty, addTreatyBlock, removeTreatyBlock, editTreatyBlock, inviteToTreaty, joinTreaty, acceptTreaty, rejectTreaty
  } = useGameStore();

  const myDiplomaticEntity = useMemo(() => {
    if (!myNation) return null;
    const union = unions.find(u => u.members.includes(myNation.id));
    if (union) {
      return {
        id: union.id,
        type: 'union',
        name: union.name,
        shortName: union.name,
        founderId: union.founderId,
        isFounder: union.founderId === myNation.id
      };
    }
    return {
      id: myNation.id,
      type: 'nation',
      name: myNation.name,
      shortName: myNation.shortName,
      founderId: myNation.id,
      isFounder: true
    };
  }, [myNation, unions]);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [ideology, setIdeology] = useState(IDEOLOGIES[0]);
  const [targetNationId, setTargetNationId] = useState('');
  const [status, setStatus] = useState(DEPENDENCY_STATUSES[0]);
  const [color, setColor] = useState('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
  
  const [flagType, setFlagType] = useState('preset');
  const [flagUrl, setFlagUrl] = useState(`https://flagcdn.com/w160/un.png`);
  const [flagSearch, setFlagSearch] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Alliances UI State
  const [showAlliances, setShowAlliances] = useState(false);
  const [allianceView, setAllianceView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedAllianceId, setSelectedAllianceId] = useState<string | null>(null);
  
  const [newAllianceName, setNewAllianceName] = useState('');
  const [newAllianceType, setNewAllianceType] = useState(ALLIANCE_TYPES[0]);
  const [newAllianceDesc, setNewAllianceDesc] = useState('');
  const [newAllianceFlag, setNewAllianceFlag] = useState('');
  const [allianceChatInput, setAllianceChatInput] = useState('');

  // News UI State
  const [showNews, setShowNews] = useState(false);
  
  // UN State
  const [showUN, setShowUN] = useState(false);
  const [unTopic, setUnTopic] = useState('');

  // Wars State
  const [showWars, setShowWars] = useState(false);
  const [warView, setWarView] = useState<'list' | 'declare' | 'details' | 'finished'>('list');
  const [selectedWarId, setSelectedWarId] = useState<string | null>(null);
  const [warTargetId, setWarTargetId] = useState('');
  const [warReason, setWarReason] = useState('');
  
  // Battle State
  const [placingBattle, setPlacingBattle] = useState<string | null>(null); // warId
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [isPaintingMode, setIsPaintingMode] = useState(false);
  const [isRollMode, setIsRollMode] = useState(false);
  const [pendingPaints, setPendingPaints] = useState<number[]>([]);
  
  // Peace Treaty State
  const [proposingPeace, setProposingPeace] = useState<string | null>(null); // warId
  const [peaceClaims, setPeaceClaims] = useState<Record<number, string>>({}); // territoryIdx -> claimerId
  const [peacePuppets, setPeacePuppets] = useState<Record<string, string>>({}); // targetId -> claimerId

  // Unions State
  const [showUnions, setShowUnions] = useState(false);
  const [newUnionName, setNewUnionName] = useState('');
  const [newUnionColor, setNewUnionColor] = useState('#ffffff');
  const [newUnionFlag, setNewUnionFlag] = useState('');
  const [selectedUnionId, setSelectedUnionId] = useState<string | null>(null);

  // Treaties State
  const [showTreaties, setShowTreaties] = useState(false);
  const [treatyView, setTreatyView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTreatyId, setSelectedTreatyId] = useState<string | null>(null);
  const [newTreatyTitle, setNewTreatyTitle] = useState('');
  const [newTreatyOpen, setNewTreatyOpen] = useState(false);
  const [addingBlock, setAddingBlock] = useState(false);
  const [newBlockText, setNewBlockText] = useState('');
  const [newBlockType, setNewBlockType] = useState<TreatyBlock['type']>('text');
  const [newBlockData, setNewBlockData] = useState<Record<string, any>>({});
  const [inviteTargetId, setInviteTargetId] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingBlockText, setEditingBlockText] = useState('');

  // Chat Tab State
  const [chatTab, setChatTab] = useState<'global' | 'alliance'>('global');

  // Nation Settings State
  const [showNationSettings, setShowNationSettings] = useState(false);
  const [editNationName, setEditNationName] = useState('');
  const [editNationShortName, setEditNationShortName] = useState('');
  const [editNationIdeology, setEditNationIdeology] = useState(IDEOLOGIES[0]);
  const [editNationColor, setEditNationColor] = useState('#ffffff');
  const [editNationFlag, setEditNationFlag] = useState('');
  const [confirmDisband, setConfirmDisband] = useState(false);

  // Union Settings State
  const [showUnionSettings, setShowUnionSettings] = useState(false);
  const [editUnionName, setEditUnionName] = useState('');
  const [editUnionColor, setEditUnionColor] = useState('#ffffff');
  const [editUnionFlag, setEditUnionFlag] = useState('');

  // Toast State
  const [toast, setToast] = useState<string | null>(null);
  
  const [newsInput, setNewsInput] = useState('');
  const [newsCooldown, setNewsCooldown] = useState(0);

  useEffect(() => {
    if (newsCooldown > 0) {
      const timer = setInterval(() => setNewsCooldown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [newsCooldown]);

  // Canvas scaling and panning
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Map Generation
  const [gridSize, setGridSize] = useState({ w: 0, h: 0 });
  const [landGrid, setLandGrid] = useState<Uint8Array | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const alreadySentRef = useRef<Set<number>>(new Set());

  // Memoize claimed territories for fast collision detection
  const claimedSet = useMemo(() => {
    const set = new Set<number>();
    nations.forEach(n => n.territories.forEach(idx => set.add(idx)));
    return set;
  }, [nations]);

  const filteredFlags = useMemo(() => {
    return WORLD_FLAGS.filter(f => f.name.toLowerCase().includes(flagSearch.toLowerCase()));
  }, [flagSearch]);

  const socket = useGameStore(state => state.socket);

  useEffect(() => {
    if (socket) {
      const handleToast = () => {
        setToast('Заявка отправлена!');
        setTimeout(() => setToast(null), 3000);
      };
      socket.on('joinRequestSent', handleToast);
      return () => { socket.off('joinRequestSent', handleToast); };
    }
  }, [socket]);

  useEffect(() => {
    const handleCustomToast = (e: any) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    const handleCooldownReset = () => {
      setNewsCooldown(60);
    };
    window.addEventListener('showToast', handleCustomToast);
    window.addEventListener('newsCooldownReset', handleCooldownReset);
    return () => {
      window.removeEventListener('showToast', handleCustomToast);
      window.removeEventListener('newsCooldownReset', handleCooldownReset);
    };
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/world-map.png?v=' + Date.now();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const w = img.width;
      const h = img.height;
      setGridSize({ w, h });

      const fitScale = Math.min(window.innerWidth / w, window.innerHeight / h) * 0.9;
      setScale(fitScale);
      setPosition({
        x: (window.innerWidth - w * fitScale) / 2,
        y: (window.innerHeight - h * fitScale) / 2
      });

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const land = new Uint8Array(w * h);
      for (let i = 0; i < data.length; i += 4) {
        const isLand = data[i] > 128;
        land[i / 4] = isLand ? 1 : 0;

        if (isLand) {
          data[i] = 210;    // R
          data[i+1] = 215;  // G
          data[i+2] = 200;  // B
          data[i+3] = 255;  // Alpha
        } else {
          data[i] = 40;     // R
          data[i+1] = 60;   // G
          data[i+2] = 80;   // B
          data[i+3] = 255;  // Alpha
        }
      }
      ctx.putImageData(imgData, 0, 0);

      const coloredImg = new window.Image();
      coloredImg.src = canvas.toDataURL();
      coloredImg.onload = () => setBgImage(coloredImg);
      setLandGrid(land);
    };
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setPosition({
      x: Math.round(-(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale),
      y: Math.round(-(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale),
    });
  };

  const handleSpawnFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupPhase('draw');
  };

  const handleConfirmSpawn = () => {
    if (draftTerritories.length === 0) return;
    requestSpawn({ name, shortName, ideology, targetNationId, status, color, territories: draftTerritories, flag: flagUrl });
  };

  const processImageUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 100;
        const maxH = 60;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h *= maxW / w; w = maxW; }
        if (h > maxH) { w *= maxH / h; h = maxH; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processImageUpload(e.target.files[0], setFlagUrl);
  };

  const handleAllianceFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processImageUpload(e.target.files[0], setNewAllianceFlag);
  };

  const handleCreateAlliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myNation) return;
    createAlliance({
      name: newAllianceName,
      type: newAllianceType,
      description: newAllianceDesc,
      flag: newAllianceFlag
    });
    setAllianceView('list');
    setNewAllianceName('');
    setNewAllianceDesc('');
    setNewAllianceFlag('');
  };

  // Check for won battles to paint
  useEffect(() => {
    if (!myDiplomaticEntity) return;
    
    for (const war of wars) {
      for (const battle of war.battles) {
        if (battle.status === 'finished' && battle.winnerId === myDiplomaticEntity.id && battle.pixelsToPaint && battle.pixelsToPaint > 0) {
          if (activeBattleId !== battle.id) {
            setActiveBattleId(battle.id);
            setIsPaintingMode(true);
            setShowWars(false);
          }
          return;
        }
      }
    }

    for (const battle of colonizationBattles) {
      if (battle.status === 'finished' && battle.winnerId === myDiplomaticEntity.id && battle.pixelsToPaint && battle.pixelsToPaint > 0) {
        if (activeBattleId !== battle.id) {
          setActiveBattleId(battle.id);
          setIsPaintingMode(true);
          setShowWars(false);
        }
        return;
      }
    }
    
    // If we get here, no active battles need painting
    if (activeBattleId) {
      setActiveBattleId(null);
      setIsPaintingMode(false);
    }
  }, [wars, colonizationBattles, myDiplomaticEntity, activeBattleId]);

  useEffect(() => {
    alreadySentRef.current.clear();
    setPendingPaints([]);
  }, [activeBattleId]);

  const paintCell = (e: any) => {
    if (!landGrid || gridSize.w === 0) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    const x = Math.floor((point.x - stage.x()) / stage.scaleX());
    const y = Math.floor((point.y - stage.y()) / stage.scaleY());

    const newIndices: number[] = [];
    
    for (let dy = -BRUSH_RADIUS; dy <= BRUSH_RADIUS; dy++) {
      for (let dx = -BRUSH_RADIUS; dx <= BRUSH_RADIUS; dx++) {
        if (dx * dx + dy * dy <= BRUSH_RADIUS * BRUSH_RADIUS) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < gridSize.w && ny >= 0 && ny < gridSize.h) {
            const idx = ny * gridSize.w + nx;
            if (landGrid[idx] === 1) {
              newIndices.push(idx);
            }
          }
        }
      }
    }

    if (newIndices.length > 0) {
      if (setupPhase === 'draw') {
        setDraftTerritories(prev => {
          const currentSet = new Set(prev);
          let added = false;
          for (const idx of newIndices) {
            if (currentSet.size >= MAX_TERRITORY) break;
            if (!currentSet.has(idx) && !claimedSet.has(idx)) {
              currentSet.add(idx);
              added = true;
            }
          }
          return added ? Array.from(currentSet) : prev;
        });
      } else if (activeBattleId && myDiplomaticEntity) {
        // Painting battle result — send immediately to server on each stroke
        const war = wars.find(w => w.battles.some(b => b.id === activeBattleId));
        if (war) {
          const battle = war.battles.find(b => b.id === activeBattleId);
          if (battle && battle.status === 'finished' && battle.winnerId === myDiplomaticEntity.id && battle.pixelsToPaint && battle.pixelsToPaint > 0) {
            const loserId = battle.winnerId === battle.attackerId ? battle.defenderId : battle.attackerId;
            const validIndices = newIndices.filter(idx => {
              const currentOwner = nations.find(n => n.territories.includes(idx));
              const currentOwnerEntity = currentOwner ? (unions.find(u => u.members.includes(currentOwner.id))?.id || currentOwner.id) : null;
              const currentOccupier = nations.find(n => n.occupations?.includes(idx));
              const currentOccupierEntity = currentOccupier ? (unions.find(u => u.members.includes(currentOccupier.id))?.id || currentOccupier.id) : null;
              return currentOwnerEntity === loserId || currentOccupierEntity === loserId;
            });
            const remaining = battle.pixelsToPaint;
            const toSend = validIndices.filter(idx => !alreadySentRef.current.has(idx)).slice(0, Math.max(0, remaining));
            if (toSend.length > 0) {
              toSend.forEach(idx => alreadySentRef.current.add(idx));
              paintBattleResult(war.id, battle.id, toSend);
              setPendingPaints(prev => {
                const s = new Set(prev);
                toSend.forEach(idx => s.add(idx));
                return Array.from(s);
              });
            }
          }
        } else {
          // Colonization battle
          const colBattle = colonizationBattles.find(b => b.id === activeBattleId);
          if (colBattle && colBattle.status === 'finished' && colBattle.winnerId === myDiplomaticEntity.id && colBattle.pixelsToPaint && colBattle.pixelsToPaint > 0) {
            const validIndices = newIndices.filter(idx => {
              const currentOwner = nations.find(n => n.territories.includes(idx));
              const currentOccupier = nations.find(n => n.occupations?.includes(idx));
              return !currentOwner && !currentOccupier;
            });
            const remaining = colBattle.pixelsToPaint;
            const toSend = validIndices.filter(idx => !alreadySentRef.current.has(idx)).slice(0, Math.max(0, remaining));
            if (toSend.length > 0) {
              toSend.forEach(idx => alreadySentRef.current.add(idx));
              paintColonizationResult(colBattle.id, toSend);
              setPendingPaints(prev => {
                const s = new Set(prev);
                toSend.forEach(idx => s.add(idx));
                return Array.from(s);
              });
            }
          }
        }
      } else if (proposingPeace && myDiplomaticEntity) {
        // Painting peace claims
        const war = wars.find(w => w.id === proposingPeace);
        if (war) {
          const isAttacker = war.attackers.includes(myDiplomaticEntity.id);
          const enemies = isAttacker ? war.defenders : war.attackers;
          
          setPeaceClaims(prev => {
            const newClaims = { ...prev };
            let changed = false;
            for (const idx of newIndices) {
              const currentOwner = nations.find(n => n.territories.includes(idx));
              const currentOwnerEntity = currentOwner ? (unions.find(u => u.members.includes(currentOwner.id))?.id || currentOwner.id) : null;
              
              if (currentOwnerEntity && enemies.includes(currentOwnerEntity)) {
                if (newClaims[idx] !== myDiplomaticEntity.id) {
                  newClaims[idx] = myDiplomaticEntity.id;
                  changed = true;
                }
              }
            }
            return changed ? newClaims : prev;
          });
        }
      } else if (isPaintingMode && myDiplomaticEntity) {
        // Painting enemy lands during war
        const myWars = wars.filter(w => w.status === 'active' && (w.attackers.includes(myDiplomaticEntity.id) || w.defenders.includes(myDiplomaticEntity.id)));
        if (myWars.length > 0) {
          const validIndices = newIndices.filter(idx => {
            const currentOwner = nations.find(n => n.territories.includes(idx));
            const currentOwnerEntity = currentOwner ? (unions.find(u => u.members.includes(currentOwner.id))?.id || currentOwner.id) : null;
            
            const currentOccupier = nations.find(n => n.occupations?.includes(idx));
            const currentOccupierEntity = currentOccupier ? (unions.find(u => u.members.includes(currentOccupier.id))?.id || currentOccupier.id) : null;

            return myWars.some(w => {
              const isAttacker = w.attackers.includes(myDiplomaticEntity.id);
              const enemies = isAttacker ? w.defenders : w.attackers;
              return (currentOwnerEntity && enemies.includes(currentOwnerEntity)) || 
                     (currentOccupierEntity && enemies.includes(currentOccupierEntity));
            });
          });
          
          if (validIndices.length > 0) {
            setPendingPaints(prev => {
              const currentSet = new Set(prev);
              let added = false;
              for (const idx of validIndices) {
                if (!currentSet.has(idx)) {
                  currentSet.add(idx);
                  added = true;
                }
              }
              return added ? Array.from(currentSet) : prev;
            });
          }
        }
      }
    }
  };

  const handlePointerDown = (e: any) => {
    if (setupPhase === 'draw' || isPaintingMode || proposingPeace) {
      setIsPainting(true);
      paintCell(e);
    } else if (placingBattle && myDiplomaticEntity) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const x = Math.floor((point.x - stage.x()) / stage.scaleX());
      const y = Math.floor((point.y - stage.y()) / stage.scaleY());
      
      const war = wars.find(w => w.id === placingBattle);
      if (war) {
        const idx = y * gridSize.w + x;
        const owner = nations.find(n => n.territories.includes(idx));
        const ownerEntityId = owner ? (unions.find(u => u.members.includes(owner.id))?.id || owner.id) : null;
        
        const isAttacker = war.attackers.includes(myDiplomaticEntity.id);
        const enemies = isAttacker ? war.defenders : war.attackers;
        
        let defenderId = enemies[0]; // Fallback
        if (ownerEntityId && enemies.includes(ownerEntityId)) {
          defenderId = ownerEntityId;
        }
        
        placeBattle(war.id, x, y, defenderId);
      }
      setPlacingBattle(null);
    } else if (isRollMode && myDiplomaticEntity) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const x = Math.floor((point.x - stage.x()) / stage.scaleX());
      const y = Math.floor((point.y - stage.y()) / stage.scaleY());
      const idx = y * gridSize.w + x;
      
      const owner = nations.find(n => n.territories.includes(idx));
      const occupier = nations.find(n => n.occupations?.includes(idx));
      
      if (!owner && !occupier && landGrid && landGrid[idx] === 1) {
        placeColonizationBattle(x, y);
        setIsRollMode(false);
      }
    } else {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const x = Math.floor((point.x - stage.x()) / stage.scaleX());
      const y = Math.floor((point.y - stage.y()) / stage.scaleY());
      const idx = y * gridSize.w + x;
      
      const clickedNation = nations.find(n => n.territories.includes(idx));
      if (clickedNation) {
        const union = unions.find(u => u.members.includes(clickedNation.id));
        if (union) {
          setSelectedNationId(union.id);
        } else {
          setSelectedNationId(clickedNation.id);
        }
      } else {
        setSelectedNationId(null);
      }
    }
  };

  const handleDblClick = (e: any) => {
    if (setupPhase !== 'draw') {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const x = Math.floor((point.x - stage.x()) / stage.scaleX());
      const y = Math.floor((point.y - stage.y()) / stage.scaleY());
      const idx = y * gridSize.w + x;
      
      const clickedNation = nations.find(n => n.territories.includes(idx));
      if (clickedNation) {
        setSelectedNationId(clickedNation.id);
      }
    }
  };

  const handlePointerMove = (e: any) => {
    if (isPainting && (setupPhase === 'draw' || isPaintingMode || proposingPeace)) {
      paintCell(e);
    }
  };

  const handlePointerUp = () => {
    setIsPainting(false);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#111] text-white overflow-hidden font-sans">
      {/* Map Layer */}
      <div ref={containerRef} className="absolute inset-0 z-0" style={{ imageRendering: 'pixelated' }}>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onDblClick={handleDblClick}
          onDblTap={handleDblClick}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={!(setupPhase === 'draw' || isPaintingMode || proposingPeace)}
          onDragMove={(e) => {
            if (e.target === e.target.getStage()) {
              e.target.x(Math.round(e.target.x()));
              e.target.y(Math.round(e.target.y()));
            }
          }}
          onDragEnd={(e) => {
            if (e.target === e.target.getStage()) {
              setPosition({ x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
            }
          }}
          pixelRatio={window.devicePixelRatio || 1}
        >
          <Layer>
            {/* Base Map */}
            {bgImage && (
              <KonvaImage 
                image={bgImage} 
                x={0} 
                y={0} 
                width={gridSize.w} 
                height={gridSize.h} 
                imageSmoothingEnabled={false}
              />
            )}

            {/* Render all territories seamlessly */}
            {gridSize.w > 0 && (
              <Shape
                sceneFunc={(context, shape) => {
                  context.imageSmoothingEnabled = false;
                  
                  // Draw Nations
                  nations.forEach(nation => {
                    if (nation.territories.length === 0) return;
                    context.beginPath();
                    const union = unions.find(u => u.members.includes(nation.id));
                    const displayColor = union ? union.color : nation.color;
                    const isSelected = selectedNationId === nation.id || (union && selectedNationId === union.id);
                    context.fillStyle = isSelected ? '#ffffff' : displayColor;
                    nation.territories.forEach(idx => {
                      const x = idx % gridSize.w;
                      const y = Math.floor(idx / gridSize.w);
                      context.rect(x, y, 1, 1);
                    });
                    context.fill();
                  });

                  // Draw Occupations - use the occupier's actual color with dark diagonal stripes
                  nations.forEach(nation => {
                    if (!nation.occupations || nation.occupations.length === 0) return;
                    const union = unions.find(u => u.members.includes(nation.id));
                    const baseColor = union ? union.color : nation.color;

                    // Draw solid base in the occupier's actual color
                    context.beginPath();
                    context.fillStyle = baseColor;
                    nation.occupations.forEach(idx => {
                      const x = idx % gridSize.w;
                      const y = Math.floor(idx / gridSize.w);
                      context.rect(x, y, 1, 1);
                    });
                    context.fill();

                    // Overlay dark diagonal stripes to visually distinguish from owned territory
                    context.beginPath();
                    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
                    nation.occupations.forEach(idx => {
                      const x = idx % gridSize.w;
                      const y = Math.floor(idx / gridSize.w);
                      if ((x + y) % 4 === 0) {
                        context.rect(x, y, 1, 1);
                      }
                    });
                    context.fill();
                  });

                  // Draw Draft Territories
                  if (!myNation && draftTerritories.length > 0) {
                    context.beginPath();
                    context.fillStyle = color; // Use selected color for draft
                    draftTerritories.forEach(idx => {
                      const x = idx % gridSize.w;
                      const y = Math.floor(idx / gridSize.w);
                      context.rect(x, y, 1, 1);
                    });
                    context.fill();
                  }

                  // Draw Pending Paints
                  if (myNation && pendingPaints.length > 0) {
                    const myUnion = unions.find(u => u.members.includes(myNation.id));
                    const paintColor = myUnion ? myUnion.color : myNation.color;
                    context.beginPath();
                    context.fillStyle = paintColor;
                    pendingPaints.forEach(idx => {
                      const x = idx % gridSize.w;
                      const y = Math.floor(idx / gridSize.w);
                      context.rect(x, y, 1, 1);
                    });
                    context.fill();
                  }

                  // Draw Peace Claims
                  if (proposingPeace && Object.keys(peaceClaims).length > 0) {
                    Object.entries(peaceClaims).forEach(([idxStr, entityId]) => {
                      const idx = parseInt(idxStr);
                      const entity = nations.find(n => n.id === entityId) || unions.find(u => u.id === entityId);
                      if (entity) {
                        context.beginPath();
                        context.fillStyle = entity.color;
                        const x = idx % gridSize.w;
                        const y = Math.floor(idx / gridSize.w);
                        context.rect(x, y, 1, 1);
                        context.fill();
                      }
                    });
                  }
                }}
              />
            )}

            {/* Render Nation Labels */}
            {gridSize.w > 0 && nations.map((nation) => {
              if (nation.territories.length === 0) return null;
              
              const union = unions.find(u => u.members.includes(nation.id));
              const displayName = union ? `[${union.name}] ${nation.shortName}` : nation.shortName;
              
              const firstIdx = nation.territories[0];
              const tx = firstIdx % gridSize.w;
              const ty = Math.floor(firstIdx / gridSize.w);
              
              return (
                <Text
                  key={`label-${nation.id}`}
                  x={tx}
                  y={ty - (15 / scale)}
                  text={displayName}
                  fill="#fff"
                  fontSize={14 / scale}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  shadowColor="black"
                  shadowBlur={4 / scale}
                />
              );
            })}

            {/* Battle Markers */}
            {[...wars.flatMap(w => w.battles.map(b => ({ ...b, warId: w.id }))), ...colonizationBattles.map(b => ({ ...b, warId: 'colonization' }))].filter(b => b.status !== 'finished' || (b.pixelsToPaint && b.pixelsToPaint > 0)).map(battle => {
              const attacker = unions.find(u => u.id === battle.attackerId) || nations.find(n => n.id === battle.attackerId);
              const defender = battle.defenderId === 'nature' ? { name: 'Природа', shortName: 'Природа' } : (unions.find(u => u.id === battle.defenderId) || nations.find(n => n.id === battle.defenderId));
              const attName = attacker ? ('shortName' in attacker ? attacker.shortName : attacker.name) : 'Атакующий';
              const defName = defender ? ('shortName' in defender ? defender.shortName : defender.name) : 'Защитник';
              
              const isAttackerReady = battle.readyPlayers?.includes(battle.attackerId);
              const isDefenderReady = battle.defenderId === 'nature' ? true : battle.readyPlayers?.includes(battle.defenderId);

              const isAttacker = myDiplomaticEntity && battle.attackerId === myDiplomaticEntity.id;
              const isDefender = myDiplomaticEntity && battle.defenderId === myDiplomaticEntity.id;

              const handleAttackerClick = () => {
                if (battle.status === 'pending' && isAttacker) {
                  if (battle.warId === 'colonization') {
                    startColonizationBattle(battle.id);
                  } else {
                    startBattle(battle.warId, battle.id);
                  }
                }
              };

              const handleDefenderClick = () => {
                if (battle.status === 'pending' && isDefender) {
                  startBattle(battle.warId, battle.id);
                }
              };

              return (
                <Group key={battle.id} x={battle.x} y={battle.y}>
                  {/* Background with shadow and stroke */}
                  <Rect 
                    x={-80 / scale} y={-45 / scale} 
                    width={160 / scale} height={100 / scale} 
                    fill="#1e1e24" 
                    cornerRadius={12 / scale} 
                    stroke="#333" 
                    strokeWidth={2 / scale}
                    shadowColor="black"
                    shadowBlur={10 / scale}
                    shadowOpacity={0.5}
                    shadowOffsetY={5 / scale}
                  />
                  
                  {/* Header/Title area */}
                  <Rect 
                    x={-80 / scale} y={-45 / scale} 
                    width={160 / scale} height={20 / scale} 
                    fill="#2a2a35" 
                    cornerRadius={[12 / scale, 12 / scale, 0, 0]} 
                  />
                  <Text 
                    text={battle.warId === 'colonization' ? "Колонизация" : "Битва"} 
                    fill="#aaa" width={160 / scale} x={-80 / scale} align="center" y={-40 / scale} fontSize={10 / scale} fontStyle="bold" 
                  />

                  {/* Attacker */}
                  <Group x={-70 / scale} y={-15 / scale} onClick={handleAttackerClick} onTap={handleAttackerClick}>
                    <Text text={attName} fill="white" width={60 / scale} align="center" y={-8 / scale} fontSize={10 / scale} fontStyle="bold" />
                    <Rect 
                      y={8 / scale}
                      width={60 / scale} height={35 / scale} 
                      fill={battle.status === 'finished' ? (battle.winnerId === battle.attackerId ? "#22c55e" : "#4b5563") : (isAttackerReady ? "#eab308" : "#ef4444")} 
                      cornerRadius={6 / scale} 
                      shadowColor="black" shadowBlur={4 / scale} shadowOpacity={0.3} shadowOffsetY={2 / scale}
                    />
                    <Text 
                      text={battle.status === 'finished' ? String(battle.attackerRoll) : (isAttackerReady ? "ГОТОВ" : "НАЧАТЬ")} 
                      fill="white" width={60 / scale} align="center" y={20 / scale} fontSize={11 / scale} fontStyle="bold" 
                    />
                  </Group>

                  {/* VS Badge */}
                  <Circle x={0} y={10 / scale} radius={12 / scale} fill="#3b82f6" shadowColor="black" shadowBlur={4 / scale} shadowOpacity={0.4} />
                  <Text text="VS" fill="white" x={-10 / scale} y={5 / scale} width={20 / scale} align="center" fontSize={10 / scale} fontStyle="bold" />

                  {/* Defender */}
                  <Group x={10 / scale} y={-15 / scale} onClick={handleDefenderClick} onTap={handleDefenderClick}>
                    <Text text={defName} fill="white" width={60 / scale} align="center" y={-8 / scale} fontSize={10 / scale} fontStyle="bold" />
                    <Rect 
                      y={8 / scale}
                      width={60 / scale} height={35 / scale} 
                      fill={battle.status === 'finished' ? (battle.winnerId === battle.defenderId ? "#22c55e" : "#4b5563") : (isDefenderReady ? "#eab308" : "#3b82f6")} 
                      cornerRadius={6 / scale} 
                      shadowColor="black" shadowBlur={4 / scale} shadowOpacity={0.3} shadowOffsetY={2 / scale}
                    />
                    <Text 
                      text={battle.status === 'finished' ? String(battle.defenderRoll) : (isDefenderReady ? "ГОТОВ" : "НАЧАТЬ")} 
                      fill="white" width={60 / scale} align="center" y={20 / scale} fontSize={11 / scale} fontStyle="bold" 
                    />
                  </Group>

                  {/* Result Text */}
                  {battle.status === 'finished' && (
                    <Text 
                      text={
                        isAttacker ? (battle.attackerResultText || (battle.winnerId === 'draw' ? 'Ничья' : battle.winnerId === battle.attackerId ? 'Победа' : 'Поражение')) :
                        isDefender ? (battle.defenderResultText || (battle.winnerId === 'draw' ? 'Ничья' : battle.winnerId === battle.defenderId ? 'Победа' : 'Поражение')) :
                        (battle.winnerId === 'draw' ? 'Ничья' : battle.winnerId === battle.attackerId ? `Победа: ${attName}` : `Победа: ${defName}`)
                      }
                      fill={
                        battle.winnerId === 'draw' ? '#facc15' :
                        (isAttacker && battle.winnerId === battle.attackerId) || (isDefender && battle.winnerId === battle.defenderId) ? '#4ade80' :
                        (isAttacker || isDefender) ? '#f87171' : '#4ade80'
                      }
                      width={160 / scale} x={-80 / scale} align="center" y={40 / scale} fontSize={11 / scale} fontStyle="bold" 
                    />
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-3 shadow-lg">
                <MapIcon className="w-5 h-5 text-blue-400" />
                <span className="font-bold tracking-wider text-sm">GLOBAL POLITICS RP</span>
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <button 
                onClick={() => { setShowAlliances(!showAlliances); setShowUN(false); setShowUnions(false); setShowNationSettings(false); setShowWars(false); setShowTreaties(false); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showAlliances ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Globe className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-sm">Alliances</span>
                {myDiplomaticEntity && myDiplomaticEntity.isFounder && allianceRequests.some(r => r.allianceId && alliances.find(a => a.id === r.allianceId)?.founderId === myDiplomaticEntity.id) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                )}
              </button>

              <button 
                onClick={() => { setShowUN(!showUN); setShowAlliances(false); setShowUnions(false); setShowNationSettings(false); setShowWars(false); setShowTreaties(false); }}
                className={`bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showUN ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Landmark className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">UN</span>
              </button>

              <button 
                onClick={() => { setShowUnions(!showUnions); setShowAlliances(false); setShowUN(false); setShowNationSettings(false); setShowWars(false); setShowTreaties(false); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showUnions ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-bold text-sm">Unions</span>
                {myNation && allianceRequests.some(r => r.unionId && unions.find(u => u.id === r.unionId)?.founderId === myNation.id) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                )}
              </button>

              <button 
                onClick={() => { setShowWars(!showWars); setShowAlliances(false); setShowUN(false); setShowUnions(false); setShowNationSettings(false); setShowTreaties(false); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showWars ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Swords className="w-5 h-5 text-red-400" />
                <span className="font-bold text-sm">Wars</span>
                {wars.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black text-[9px] flex items-center justify-center font-bold">{wars.length}</span>
                )}
              </button>

              <button
                onClick={() => { setShowTreaties(!showTreaties); setShowWars(false); setShowAlliances(false); setShowUN(false); setShowUnions(false); setShowNationSettings(false); setTreatyView('list'); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showTreaties ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <ScrollText className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">Договоры</span>
                {myDiplomaticEntity && treaties.filter(t => t.invitees.includes(myDiplomaticEntity.id) && !t.parties.includes(myDiplomaticEntity.id)).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-black text-[9px] flex items-center justify-center font-bold">
                    {treaties.filter(t => t.invitees.includes(myDiplomaticEntity.id) && !t.parties.includes(myDiplomaticEntity.id)).length}
                  </span>
                )}
              </button>

            </div>

            {/* News Feed - Always open under title */}
            <div className="w-80 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg pointer-events-auto overflow-hidden flex flex-col max-h-[30vh]">
              <div className="bg-white/10 px-3 py-1 text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-white/10 flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-green-400" /> World News
              </div>
              <div className="p-2 flex-1 overflow-y-auto custom-scrollbar space-y-2 flex flex-col-reverse">
                {news.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No news yet...</p>
                ) : (
                  news.slice().reverse().map(item => {
                    const senderNation = item.senderId ? nations.find(n => n.id === item.senderId) : null;
                    return (
                      <div key={item.id} className="text-xs">
                        <span className="text-gray-500">[{new Date(item.timestamp).toLocaleTimeString()}]</span>{' '}
                        {senderNation?.flag && (
                          <img src={senderNation.flag} alt={senderNation.name} title={senderNation.name} className="inline-block h-3 w-auto rounded-[2px] align-middle mr-1" />
                        )}
                        <span className={`${
                          item.type === 'spawn' ? 'text-blue-300' :
                          item.type === 'alliance_create' ? 'text-purple-300' :
                          item.type === 'alliance_join' ? 'text-green-300' :
                          item.type === 'alliance_leave' ? 'text-red-300' :
                          item.type === 'un_session' ? 'text-yellow-300' :
                          item.type === 'player_news' ? 'text-white font-bold' : 'text-gray-200'
                        }`}>
                          {item.text}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              {myNation && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsInput.trim() && newsCooldown === 0) {
                      useGameStore.getState().publishNews(newsInput.trim());
                      setNewsInput('');
                      setNewsCooldown(60);
                    }
                  }}
                  className="p-2 border-t border-white/10 bg-black/50 flex gap-2"
                >
                  <input
                    type="text"
                    value={newsInput}
                    onChange={e => setNewsInput(e.target.value)}
                    placeholder={newsCooldown > 0 ? `Ожидайте ${newsCooldown} сек...` : "Опубликовать новость..."}
                    disabled={newsCooldown > 0}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button 
                    type="submit" 
                    disabled={newsCooldown > 0 || !newsInput.trim()}
                    className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {newsCooldown > 0 ? `${newsCooldown}с` : 'Отправить'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {myNation && (
            <button 
              onClick={() => {
                setEditNationName(myNation.name);
                setEditNationShortName(myNation.shortName);
                setEditNationIdeology(myNation.ideology);
                setEditNationColor(myNation.color);
                setEditNationFlag(myNation.flag || '');
                setShowNationSettings(true);
                setShowAlliances(false);
                setShowUN(false);
                setShowUnions(false);
                setShowWars(false);
                setShowTreaties(false);
              }}
              className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-lg pointer-events-auto flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-white/10 transition-colors min-w-[80px]"
            >
              {myNation.flag ? (
                <img src={myNation.flag} alt="Flag" className="h-8 w-auto object-contain rounded-sm border border-white/20" />
              ) : (
                <div className="w-12 h-8 rounded-sm" style={{ backgroundColor: myNation.color }} />
              )}
              <span className="font-bold text-xs text-center">{myNation.shortName}</span>
            </button>
          )}
        </div>

        {/* Treaties Panel */}
        {showTreaties && myNation && (
          <div className="absolute top-0 left-0 bottom-0 w-96 bg-black/80 backdrop-blur-md border-r border-white/10 pointer-events-auto flex flex-col z-20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-lg">Договоры</span>
              </div>
              <button onClick={() => setShowTreaties(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {treatyView === 'list' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {/* Incoming invitations */}
                {myDiplomaticEntity && treaties.filter(t => t.invitees.includes(myDiplomaticEntity.id) && !t.parties.includes(myDiplomaticEntity.id)).map(t => (
                  <div key={t.id} className="bg-amber-900/40 border border-amber-500/40 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-amber-300 text-sm">{t.title}</span>
                      <span className="ml-auto text-xs text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded">Приглашение</span>
                    </div>
                    <p className="text-xs text-gray-400">Создатель: {nations.find(n => n.id === t.creatorId)?.name || unions.find(u => u.id === t.creatorId)?.name || t.creatorId}</p>
                    <p className="text-xs text-gray-400">Участников: {t.parties.length}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { acceptTreaty(t.id); }} className="flex-1 bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Принять</button>
                      <button onClick={() => { rejectTreaty(t.id); }} className="flex-1 bg-red-900 hover:bg-red-800 text-white px-3 py-1 rounded text-xs font-bold">Отклонить</button>
                    </div>
                  </div>
                ))}

                {/* Open treaties I can join */}
                {myDiplomaticEntity && treaties.filter(t => t.isOpen && !t.parties.includes(myDiplomaticEntity.id) && !t.invitees.includes(myDiplomaticEntity.id) && t.status === 'draft').map(t => (
                  <div key={t.id} className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-sm">{t.title}</span>
                      <span className="ml-auto text-xs text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded">Открытый</span>
                    </div>
                    <p className="text-xs text-gray-400">Участников: {t.parties.length}</p>
                    <button onClick={() => joinTreaty(t.id)} className="w-full bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Присоединиться</button>
                  </div>
                ))}

                {/* My treaties */}
                {myDiplomaticEntity && treaties.filter(t => t.parties.includes(myDiplomaticEntity.id)).map(t => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => { setSelectedTreatyId(t.id); setTreatyView('detail'); }}>
                    <div className="flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm">{t.title}</span>
                      {t.isOpen && <span className="ml-auto text-xs text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">Открытый</span>}
                      {t.status === 'active' && <span className="ml-auto text-xs text-green-400 bg-green-900/40 px-2 py-0.5 rounded">Активен</span>}
                    </div>
                    <p className="text-xs text-gray-400">Блоков: {t.blocks.length} · Участников: {t.parties.length}</p>
                  </div>
                ))}

                {treaties.length === 0 && !myDiplomaticEntity && (
                  <p className="text-gray-500 text-sm italic text-center py-8">Нет договоров</p>
                )}

                {/* Create treaty button */}
                {myNation && (
                  <button
                    onClick={() => setTreatyView('create')}
                    className="w-full bg-amber-800/60 hover:bg-amber-700/60 border border-amber-600/40 text-amber-300 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold mt-2"
                  >
                    <Plus className="w-4 h-4" /> Создать договор
                  </button>
                )}
              </div>
            )}

            {treatyView === 'create' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                <button onClick={() => setTreatyView('list')} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <h3 className="font-bold text-lg">Новый договор</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Название договора</label>
                    <input
                      value={newTreatyTitle}
                      onChange={e => setNewTreatyTitle(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      placeholder="Например: Пакт о ненападении"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newTreatyOpen} onChange={e => setNewTreatyOpen(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                    <span className="text-sm">Открытый договор (любой может присоединиться)</span>
                  </label>
                  <button
                    onClick={() => {
                      if (!newTreatyTitle.trim()) return;
                      createTreaty(newTreatyTitle.trim(), newTreatyOpen);
                      setNewTreatyTitle('');
                      setNewTreatyOpen(false);
                      setTreatyView('list');
                    }}
                    disabled={!newTreatyTitle.trim()}
                    className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg font-bold text-sm"
                  >
                    Создать
                  </button>
                </div>
              </div>
            )}

            {treatyView === 'detail' && (() => {
              const treaty = treaties.find(t => t.id === selectedTreatyId);
              if (!treaty) return <div className="p-4 text-gray-400">Не найдено</div>;
              const isParty = !!myDiplomaticEntity && treaty.parties.includes(myDiplomaticEntity.id);
              const isCreator = !!myDiplomaticEntity && treaty.creatorId === myDiplomaticEntity.id;
              return (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  <button onClick={() => setTreatyView('list')} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                    <ChevronLeft className="w-4 h-4" /> Назад
                  </button>
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-lg">{treaty.title}</h3>
                    {treaty.isOpen && <span className="text-xs text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">Открытый</span>}
                    {treaty.status === 'active' && <span className="text-xs text-green-400 bg-green-900/40 px-2 py-0.5 rounded">Активен</span>}
                  </div>

                  {/* Parties */}
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Участники ({treaty.parties.length})</p>
                    <div className="space-y-1">
                      {treaty.parties.map(pid => {
                        const nation = nations.find(n => n.id === pid);
                        const union = unions.find(u => u.id === pid);
                        return (
                          <div key={pid} className="flex items-center gap-2 text-sm py-1 border-b border-white/5">
                            <div className="w-3 h-3 rounded-full" style={{ background: nation?.color || union?.color || '#888' }} />
                            <span>{nation?.name || union?.name || pid}</span>
                            {pid === treaty.creatorId && <span className="text-xs text-amber-400 ml-auto">Создатель</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Invite */}
                  {isCreator && treaty.status === 'draft' && (
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Пригласить сторону</p>
                      <div className="flex gap-2">
                        <select
                          value={inviteTargetId}
                          onChange={e => setInviteTargetId(e.target.value)}
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm focus:outline-none"
                        >
                          <option value="">— выбрать —</option>
                          {nations.filter(n => !treaty.parties.includes(n.id) && !treaty.invitees.includes(n.id)).map(n => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                          {unions.filter(u => !treaty.parties.includes(u.id) && !treaty.invitees.includes(u.id)).map(u => (
                            <option key={u.id} value={u.id}>{u.name} (союз)</option>
                          ))}
                        </select>
                        <button
                          onClick={() => { if (inviteTargetId) { inviteToTreaty(treaty.id, inviteTargetId); setInviteTargetId(''); } }}
                          className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Blocks */}
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Блоки договора</p>
                    <div className="space-y-2">
                      {treaty.blocks.map((block, i) => (
                        <div key={block.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                          {editingBlockId === block.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingBlockText}
                                onChange={e => setEditingBlockText(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm focus:outline-none resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button onClick={() => {
                                  editTreatyBlock(treaty.id, block.id, editingBlockText);
                                  setEditingBlockId(null);
                                }} className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Сохранить</button>
                                <button onClick={() => setEditingBlockId(null)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-bold">Отмена</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-amber-400 uppercase">{block.type}</span>
                                  <span className="text-xs text-gray-500">#{i + 1}</span>
                                </div>
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">{block.content}</p>
                              </div>
                              {isParty && (
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button onClick={() => { setEditingBlockId(block.id); setEditingBlockText(block.content); }} className="text-gray-400 hover:text-white">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => removeTreatyBlock(treaty.id, block.id)} className="text-gray-400 hover:text-red-400">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {treaty.blocks.length === 0 && <p className="text-gray-500 text-sm italic">Нет блоков. Добавьте первый!</p>}
                    </div>

                    {/* Add block */}
                    {isParty && treaty.status === 'draft' && (
                      addingBlock ? (
                        <div className="mt-3 space-y-2">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Тип блока</label>
                            <select
                              value={newBlockType}
                              onChange={e => setNewBlockType(e.target.value as TreatyBlock['type'])}
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm focus:outline-none"
                            >
                              <option value="text">Текст</option>
                              <option value="clause">Статья</option>
                              <option value="obligation">Обязательство</option>
                              <option value="condition">Условие</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Содержание</label>
                            <textarea
                              value={newBlockText}
                              onChange={e => setNewBlockText(e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm focus:outline-none resize-none"
                              rows={3}
                              placeholder="Введите текст блока..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (!newBlockText.trim()) return;
                                addTreatyBlock(treaty.id, newBlockType, newBlockText.trim());
                                setNewBlockText('');
                                setNewBlockType('text');
                                setAddingBlock(false);
                              }}
                              disabled={!newBlockText.trim()}
                              className="flex-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white px-3 py-1 rounded text-sm font-bold"
                            >
                              Добавить
                            </button>
                            <button onClick={() => { setAddingBlock(false); setNewBlockText(''); }} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingBlock(true)}
                          className="mt-3 w-full border border-dashed border-white/20 hover:border-amber-500/50 text-gray-400 hover:text-amber-400 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Добавить блок
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Nation Settings Panel */}
        {showNationSettings && myNation && (
          <div className="absolute top-20 right-4 w-[400px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> Настройки страны</h2>
              <button onClick={() => setShowNationSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Полное название</label>
                <input type="text" value={editNationName} onChange={e => setEditNationName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Короткое название</label>
                <input type="text" value={editNationShortName} onChange={e => setEditNationShortName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Идеология</label>
                <select value={editNationIdeology} onChange={e => setEditNationIdeology(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  {IDEOLOGIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Цвет</label>
                <div className="flex gap-2">
                  <input type="color" value={editNationColor} onChange={e => setEditNationColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                  <input type="text" value={editNationColor} onChange={e => setEditNationColor(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Флаг (URL или файл)</label>
                <div className="flex gap-2">
                  <input type="text" value={editNationFlag} onChange={e => setEditNationFlag(e.target.value)} placeholder="https://..." className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded px-3 py-2 flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4 text-gray-300" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEditNationFlag(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                {editNationFlag && (
                  <div className="mt-2 flex justify-center">
                    <img src={editNationFlag} alt="Preview" className="h-16 w-auto object-contain rounded border border-white/20" />
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <button 
                  onClick={() => {
                    useGameStore.getState().updateNation({
                      name: editNationName,
                      shortName: editNationShortName,
                      ideology: editNationIdeology,
                      color: editNationColor,
                      flag: editNationFlag
                    });
                    setShowNationSettings(false);
                    setConfirmDisband(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Сохранить изменения
                </button>
                
                {confirmDisband ? (
                  <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-center">
                    <p className="text-sm text-red-200 mb-3">Вы уверены? Ваша страна будет навсегда удалена.</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          useGameStore.getState().disbandNation();
                          setShowNationSettings(false);
                          setConfirmDisband(false);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-2 rounded transition-colors"
                      >
                        Да, расформировать
                      </button>
                      <button 
                        onClick={() => setConfirmDisband(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDisband(true)}
                    className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 font-bold py-2 px-4 rounded transition-colors mt-4"
                  >
                    Расформировать страну
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wars Panel */}
        {showWars && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] bg-black/90 backdrop-blur-xl border border-red-500/30 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between p-4 border-b border-red-500/20 bg-red-900/10">
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-400"><Swords className="w-5 h-5"/> Wars</h2>
              <button onClick={() => setShowWars(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setWarView('list')} 
                className={`flex-1 py-2 text-sm font-bold ${warView === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              >
                Active Wars
              </button>
              <button 
                onClick={() => setWarView('finished')} 
                className={`flex-1 py-2 text-sm font-bold ${warView === 'finished' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              >
                History
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {warView === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Conflicts</h3>
                    <button 
                      onClick={() => setWarView('declare')}
                      disabled={!myNation}
                      className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-1 px-3 rounded transition-colors"
                    >
                      Declare War
                    </button>
                  </div>
                  
                  {wars.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">The world is at peace.</p>
                  ) : (
                    <div className="grid gap-2">
                      {wars.map(war => {
                        const attacker = nations.find(n => n.id === war.attackerId) || unions.find(u => u.id === war.attackerId);
                        const defender = nations.find(n => n.id === war.defenderId) || unions.find(u => u.id === war.defenderId);
                        return (
                          <div 
                            key={war.id} 
                            onClick={() => { setSelectedWarId(war.id); setWarView('details'); }}
                            className="bg-red-900/10 hover:bg-red-900/20 border border-red-500/20 p-3 rounded cursor-pointer flex flex-col gap-2 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <EntityName entity={attacker} className="font-bold text-red-400" />
                                <Swords className="w-4 h-4 text-gray-500 shrink-0" />
                                <EntityName entity={defender} className="font-bold text-blue-400" />
                              </div>
                              <span className="text-xs font-bold px-2 py-1 rounded bg-black/50 border border-white/10 ml-2">
                                {war.status === 'peace_negotiation' ? 'Negotiating Peace' : 'Active'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 italic">"{war.reason}"</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {warView === 'finished' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Historical Conflicts</h3>
                  {finishedWars.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No wars have ended yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {finishedWars.map(war => {
                        const attacker = nations.find(n => n.id === war.attackerId) || unions.find(u => u.id === war.attackerId);
                        const defender = nations.find(n => n.id === war.defenderId) || unions.find(u => u.id === war.defenderId);
                        return (
                          <div 
                            key={war.id} 
                            onClick={() => { setSelectedWarId(war.id); setWarView('details'); }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded cursor-pointer flex flex-col gap-2 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 opacity-70">
                                <EntityName entity={attacker} className="font-bold text-red-400" />
                                <Swords className="w-4 h-4 text-gray-500 shrink-0" />
                                <EntityName entity={defender} className="font-bold text-blue-400" />
                              </div>
                              <span className="text-xs font-bold px-2 py-1 rounded bg-black/50 border border-white/10 ml-2 text-gray-400">
                                Ended
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 italic">"{war.reason}"</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {warView === 'declare' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (warTargetId && warReason) {
                    declareWar(warTargetId, warReason);
                    setWarView('list');
                    setWarTargetId('');
                    setWarReason('');
                  }
                }} className="space-y-4">
                  <button type="button" onClick={() => setWarView('list')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-4">
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Target</label>
                    <select 
                      value={warTargetId} 
                      onChange={e => setWarTargetId(e.target.value)} 
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                      required
                    >
                      <option value="">Select target...</option>
                      {nations.filter(n => n.id !== myNation?.id).map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                      {unions.filter(u => !u.members.includes(myNation?.id || '')).map(u => (
                        <option key={u.id} value={u.id}>[Union] {u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Casus Belli (Reason)</label>
                    <textarea 
                      value={warReason} 
                      onChange={e => setWarReason(e.target.value)} 
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 min-h-[100px]"
                      placeholder="State your reason for war..."
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!warTargetId || !warReason}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" /> Declare War
                  </button>
                </form>
              )}

              {warView === 'details' && selectedWarId && (
                (() => {
                  const war = wars.find(w => w.id === selectedWarId) || finishedWars.find(w => w.id === selectedWarId);
                  if (!war) return <p>War not found.</p>;
                  
                  const isParticipant = myDiplomaticEntity && (war.attackers.includes(myDiplomaticEntity.id) || war.defenders.includes(myDiplomaticEntity.id));
                  
                  return (
                    <div className="space-y-6">
                      <button type="button" onClick={() => setWarView(war.status === 'finished' ? 'finished' : 'list')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" /> Back
                      </button>

                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-white">{war.reason || 'War'}</h3>
                        <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold mt-2">
                          Status: {war.status === 'active' ? 'Active' : war.status === 'peace_negotiation' ? 'Peace Negotiations' : 'Finished'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                          <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2"><Crosshair className="w-4 h-4"/> Attackers</h4>
                          <ul className="space-y-1 text-sm">
                            {war.attackers.map(id => {
                              const n = nations.find(x => x.id === id) || unions.find(x => x.id === id);
                              return <li key={id}><EntityName entity={n} /></li>;
                            })}
                          </ul>
                          {war.status === 'active' && myDiplomaticEntity && !isParticipant && (
                            <button onClick={() => joinWar(war.id, 'attackers')} className="mt-4 w-full bg-red-600/50 hover:bg-red-500/50 text-white text-xs font-bold py-1 px-2 rounded">
                              Join Attackers
                            </button>
                          )}
                        </div>
                        
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                          <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Shield className="w-4 h-4"/> Defenders</h4>
                          <ul className="space-y-1 text-sm">
                            {war.defenders.map(id => {
                              const n = nations.find(x => x.id === id) || unions.find(x => x.id === id);
                              return <li key={id}><EntityName entity={n} /></li>;
                            })}
                          </ul>
                          {war.status === 'active' && myDiplomaticEntity && !isParticipant && (
                            <button onClick={() => joinWar(war.id, 'defenders')} className="mt-4 w-full bg-blue-600/50 hover:bg-blue-500/50 text-white text-xs font-bold py-1 px-2 rounded">
                              Join Defenders
                            </button>
                          )}
                        </div>
                      </div>

                      {war.status === 'active' && isParticipant && (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setPlacingBattle(war.id);
                                setIsPaintingMode(false);
                                setIsRollMode(false);
                                setShowWars(false);
                              }}
                              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                              Place Battle Marker
                            </button>
                            <button 
                              onClick={() => {
                                setProposingPeace(war.id);
                                setPeaceClaims({});
                                setPeacePuppets({});
                                setShowWars(false);
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                              Propose Peace
                            </button>
                          </div>
                        </div>
                      )}

                      {war.status === 'peace_negotiation' && war.peaceTreaty && (
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 space-y-4">
                          <h4 className="font-bold text-green-400 flex items-center gap-2"><Flag className="w-4 h-4"/> Peace Treaty Proposed</h4>
                          
                          <div className="text-sm space-y-2">
                            <div>
                              <p className="font-bold text-gray-300">Territory Changes:</p>
                              <p className="text-gray-400">{Object.keys(war.peaceTreaty.territoryClaims).length} territories claimed.</p>
                            </div>
                            
                            {Object.keys(war.peaceTreaty.puppetClaims).length > 0 && (
                              <div>
                                <p className="font-bold text-gray-300">Puppet States:</p>
                                <ul className="list-disc list-inside text-gray-400">
                                  {Object.entries(war.peaceTreaty.puppetClaims).map(([targetId, overlordId]) => {
                                    const target = nations.find(n => n.id === targetId) || unions.find(u => u.id === targetId);
                                    const overlord = nations.find(n => n.id === overlordId) || unions.find(u => u.id === overlordId);
                                    return <li key={targetId} className="flex items-center gap-1"><EntityName entity={target} /> becomes puppet of <EntityName entity={overlord} /></li>;
                                  })}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="text-sm">
                            <p className="font-bold mb-1">Agreements ({war.peaceTreaty.agreements.length} / {war.attackers.length + war.defenders.length}):</p>
                            <div className="flex flex-wrap gap-1">
                              {war.peaceTreaty.agreements.map(id => {
                                const n = nations.find(x => x.id === id) || unions.find(x => x.id === id);
                                return <span key={id} className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs flex items-center gap-1"><EntityName entity={n} /></span>;
                              })}
                            </div>
                          </div>

                          {isParticipant && !war.peaceTreaty.agreements.includes(myDiplomaticEntity!.id) && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => agreePeaceTreaty(war.id)}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors"
                              >
                                Agree to Treaty
                              </button>
                              <button 
                                onClick={() => rejectPeaceTreaty(war.id)}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {war.status === 'finished' && war.peaceTreaty && (
                        <div className="bg-gray-900/40 border border-gray-500/30 rounded-lg p-4 space-y-4">
                          <h4 className="font-bold text-gray-300 flex items-center gap-2"><Flag className="w-4 h-4"/> Peace Treaty Concluded</h4>
                          
                          <div className="text-sm space-y-2">
                            <div>
                              <p className="font-bold text-gray-400">Territory Changes:</p>
                              <p className="text-gray-500">{Object.keys(war.peaceTreaty.territoryClaims).length} territories were claimed.</p>
                            </div>
                            
                            {Object.keys(war.peaceTreaty.puppetClaims).length > 0 && (
                              <div>
                                <p className="font-bold text-gray-400">Puppet States Formed:</p>
                                <ul className="list-disc list-inside text-gray-500">
                                  {Object.entries(war.peaceTreaty.puppetClaims).map(([targetId, overlordId]) => {
                                    const target = nations.find(n => n.id === targetId) || unions.find(u => u.id === targetId);
                                    const overlord = nations.find(n => n.id === overlordId) || unions.find(u => u.id === overlordId);
                                    return <li key={targetId} className="flex items-center gap-1"><EntityName entity={target} /> became puppet of <EntityName entity={overlord} /></li>;
                                  })}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {war.battles.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-300 mb-2">Battles</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                            {war.battles.map((b, i) => {
                              const att = nations.find(x => x.id === b.attackerId) || unions.find(x => x.id === b.attackerId);
                              const def = nations.find(x => x.id === b.defenderId) || unions.find(x => x.id === b.defenderId);
                              return (
                                <div key={b.id} className="bg-black/40 border border-white/10 p-2 rounded text-xs">
                                  <div className="flex justify-between font-bold mb-1">
                                    <span>Battle {i + 1}</span>
                                    <span className={b.status === 'finished' ? 'text-gray-400' : 'text-yellow-400'}>{b.status}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-red-300 flex items-center gap-1">{att ? <EntityName entity={att} /> : '?'}: {b.attackerRoll || '?'}</span>
                                    <span className="text-blue-300 flex items-center gap-1">{def ? <EntityName entity={def} /> : '?'}: {b.defenderRoll || '?'}</span>
                                  </div>
                                  {b.resultText && <div className="mt-1 text-center font-bold text-white">{b.resultText}</div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* Placing Battle Overlay */}
        {placingBattle && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg pointer-events-auto flex items-center gap-4">
            <span>Click on the map to place the battle marker</span>
            <button onClick={() => setPlacingBattle(null)} className="bg-black/30 hover:bg-black/50 rounded-full p-1"><X className="w-4 h-4"/></button>
          </div>
        )}

        {/* Proposing Peace Overlay */}
        {proposingPeace && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg pointer-events-auto flex flex-col items-center gap-2">
            <span>Paint territories you want to claim.</span>
            
            {(() => {
              const war = wars.find(w => w.id === proposingPeace);
              if (!war || !myDiplomaticEntity) return null;
              
              const isAttacker = war.attackers.includes(myDiplomaticEntity.id);
              const enemies = isAttacker ? war.defenders : war.attackers;
              
              return (
                <div className="flex flex-col gap-1 w-full mt-2">
                  <span className="text-xs uppercase tracking-wider opacity-80">Make Puppet:</span>
                  <div className="flex flex-wrap gap-2">
                    {enemies.map(enemyId => {
                      const enemy = nations.find(n => n.id === enemyId) || unions.find(u => u.id === enemyId);
                      if (!enemy) return null;
                      const isPuppet = peacePuppets[enemyId] === myDiplomaticEntity.id;
                      return (
                        <button
                          key={enemyId}
                          onClick={() => {
                            setPeacePuppets(prev => {
                              const next = { ...prev };
                              if (isPuppet) {
                                delete next[enemyId];
                              } else {
                                next[enemyId] = myDiplomaticEntity.id;
                              }
                              return next;
                            });
                          }}
                          className={`text-xs px-2 py-1 rounded border ${isPuppet ? 'bg-white text-green-700 border-white' : 'bg-black/20 border-white/30 hover:bg-black/40'}`}
                        >
                          <EntityName entity={enemy} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2 mt-2 flex-wrap">
              <button 
                onClick={() => { setPeaceClaims({}); setPeacePuppets({}); }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                ↩ Статус-кво
              </button>
              <button 
                onClick={() => {
                  proposePeaceTreaty(proposingPeace, peaceClaims, peacePuppets);
                  setProposingPeace(null);
                  setPeaceClaims({});
                  setPeacePuppets({});
                }} 
                className="bg-white text-green-700 hover:bg-gray-100 px-4 py-1 rounded"
              >
                Отправить предложение
              </button>
              <button 
                onClick={() => {
                  setProposingPeace(null);
                  setPeaceClaims({});
                  setPeacePuppets({});
                }} 
                className="bg-black/30 hover:bg-black/50 px-4 py-1 rounded"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Painting Battle Result Overlay */}
        {activeBattleId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg pointer-events-none flex items-center gap-4">
            <span>
              🖌 Закрашивайте вражеские территории!
              {' '}({wars.flatMap(w => w.battles).find(b => b.id === activeBattleId)?.pixelsToPaint || colonizationBattles.find(b => b.id === activeBattleId)?.pixelsToPaint || 0} пикс. осталось)
            </span>
          </div>
        )}
        {showAlliances && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-purple-400"/> Alliances</h2>
              <button onClick={() => setShowAlliances(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {allianceView === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Alliances</h3>
                    <button 
                      onClick={() => setAllianceView('create')}
                      disabled={!myNation}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-1 px-3 rounded transition-colors"
                    >
                      Create New
                    </button>
                  </div>
                  
                  {alliances.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No alliances have been formed yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {alliances.map(alliance => (
                        <div 
                          key={alliance.id} 
                          onClick={() => { setSelectedAllianceId(alliance.id); setAllianceView('details'); }}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          {alliance.flag ? (
                            <img src={alliance.flag} alt="Flag" className="h-6 w-auto object-contain rounded-sm border border-white/20" />
                          ) : (
                            <div className="w-10 h-6 bg-gray-800 rounded-sm border border-white/20 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-sm"><EntityName entity={alliance} /></h4>
                            <p className="text-xs text-gray-400">{alliance.type} • {alliance.members.length} members</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {allianceView === 'create' && (
                <form onSubmit={handleCreateAlliance} className="space-y-4">
                  <button type="button" onClick={() => setAllianceView('list')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-4">
                    <ArrowLeft className="w-3 h-3" /> Back to list
                  </button>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Alliance Name</label>
                    <input required type="text" value={newAllianceName} onChange={e => setNewAllianceName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Type</label>
                    <select value={newAllianceType} onChange={e => setNewAllianceType(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-purple-500">
                      {ALLIANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Description</label>
                    <textarea required value={newAllianceDesc} onChange={e => setNewAllianceDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-purple-500 min-h-[80px]" />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Alliance Flag (Optional)</label>
                    <input type="file" accept="image/*" onChange={handleAllianceFlagUpload} className="text-xs w-full mb-2" />
                    {newAllianceFlag && (
                      <div className="h-16 border border-white/10 rounded overflow-hidden flex items-center justify-center bg-black/50">
                        <img src={newAllianceFlag} alt="Preview" className="h-full object-contain" />
                      </div>
                    )}
                  </div>

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors">
                    Establish Alliance
                  </button>
                </form>
              )}

              {allianceView === 'details' && selectedAllianceId && (
                <div className="space-y-4">
                  <button type="button" onClick={() => setAllianceView('list')} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-3 h-3" /> Back to list
                  </button>

                  {(() => {
                    const alliance = alliances.find(a => a.id === selectedAllianceId);
                    if (!alliance) return null;
                    const isMember = myDiplomaticEntity && alliance.members.includes(myDiplomaticEntity.id);
                    
                    return (
                      <>
                        <div className="flex items-start gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                          {alliance.flag ? (
                            <img src={alliance.flag} alt="Flag" className="h-16 w-auto object-contain rounded shadow-lg border border-white/20" />
                          ) : (
                            <div className="w-24 h-16 bg-gray-800 rounded border border-white/20 flex items-center justify-center">
                              <Globe className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold"><EntityName entity={alliance} /></h3>
                            <p className="text-sm text-purple-400 font-bold">{alliance.type} Alliance</p>
                          </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Description</h4>
                          <p className="text-sm text-gray-200 whitespace-pre-wrap">{alliance.description}</p>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Members ({alliance.members.length})</h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                            {alliance.members.map(memberId => {
                              const memberNat = nations.find(n => n.id === memberId);
                              const memberUnion = unions.find(u => u.id === memberId);
                              const entity = memberNat || memberUnion;
                              if (!entity) return null;
                              
                              return (
                                <div key={memberId} className="flex items-center gap-2 text-sm">
                                  <EntityName entity={entity} />
                                  {memberId === alliance.founderId && <span className="text-xs text-yellow-500 ml-auto">Founder</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {myDiplomaticEntity && myDiplomaticEntity.isFounder && alliance.founderId === myDiplomaticEntity.id && allianceRequests.filter(r => r.allianceId === alliance.id).length > 0 && (
                          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="text-xs uppercase tracking-wider text-yellow-500 mb-2">Pending Requests</h4>
                            <div className="space-y-2">
                              {allianceRequests.filter(r => r.allianceId === alliance.id).map(req => (
                                <div key={req.id} className="flex items-center justify-between text-sm bg-black/40 p-2 rounded border border-white/5">
                                  <span>{req.nationName}</span>
                                  <div className="flex gap-2">
                                    <button onClick={() => approveAllianceJoin(req.id)} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => rejectAllianceJoin(req.id)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {myDiplomaticEntity && myDiplomaticEntity.isFounder && (
                          <button 
                            onClick={() => {
                              if (isMember) {
                                leaveAlliance(alliance.id);
                              } else {
                                const hasRequested = allianceRequests.some(r => r.allianceId === alliance.id && r.nationId === myDiplomaticEntity.id);
                                if (!hasRequested) requestJoinAlliance(alliance.id);
                              }
                            }}
                            disabled={!isMember && allianceRequests.some(r => r.allianceId === alliance.id && r.nationId === myDiplomaticEntity.id)}
                            className={`w-full font-bold py-2 px-4 rounded transition-colors ${
                              isMember 
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/50' 
                                : allianceRequests.some(r => r.allianceId === alliance.id && r.nationId === myDiplomaticEntity.id)
                                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                          >
                            {isMember ? 'Leave Alliance' : allianceRequests.some(r => r.allianceId === alliance.id && r.nationId === myDiplomaticEntity.id) ? 'Request Sent' : 'Request to Join'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* UN Panel */}
        {showUN && (
          <div className="absolute top-20 right-4 w-[400px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Landmark className="w-5 h-5 text-blue-400"/> United Nations</h2>
              <button onClick={() => setShowUN(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {myNation && (
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h3 className="font-bold mb-2 text-sm text-blue-400">Convene Session</h3>
                  <form onSubmit={(e) => { e.preventDefault(); if (unTopic.trim()) { createUNSession(unTopic.trim()); setUnTopic(''); } }} className="flex gap-2">
                    <input
                      type="text"
                      value={unTopic}
                      onChange={e => setUnTopic(e.target.value)}
                      placeholder="Topic of discussion..."
                      className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-bold transition-colors">Call</button>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Active Sessions</h3>
                {unSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No active sessions.</p>
                ) : (
                  unSessions.map(session => {
                    const callerNat = nations.find(n => n.id === session.callerId);
                    const callerUnion = unions.find(u => u.id === session.callerId);
                    const callerEntity = callerNat || callerUnion;
                    
                    return (
                    <div key={session.id} className="bg-white/5 border border-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-blue-300">{session.topic}</h4>
                        <span className="text-xs text-gray-500 flex items-center gap-1">Called by <EntityName entity={callerEntity} /></span>
                      </div>
                      
                      <div className="flex gap-4 mb-3 text-sm">
                        <div className="text-green-400">Yes: {Object.values(session.votes).filter(v => v === 'yes').length}</div>
                        <div className="text-red-400">No: {Object.values(session.votes).filter(v => v === 'no').length}</div>
                        <div className="text-gray-400">Abstain: {Object.values(session.votes).filter(v => v === 'abstain').length}</div>
                      </div>

                      {myDiplomaticEntity && myDiplomaticEntity.isFounder && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => voteUNSession(session.id, 'yes')}
                            className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${session.votes[myDiplomaticEntity.id] === 'yes' ? 'bg-green-600 text-white' : 'bg-green-900/40 text-green-400 hover:bg-green-800/60'}`}
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => voteUNSession(session.id, 'no')}
                            className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${session.votes[myDiplomaticEntity.id] === 'no' ? 'bg-red-600 text-white' : 'bg-red-900/40 text-red-400 hover:bg-red-800/60'}`}
                          >
                            No
                          </button>
                          <button 
                            onClick={() => voteUNSession(session.id, 'abstain')}
                            className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${session.votes[myDiplomaticEntity.id] === 'abstain' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                          >
                            Abstain
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Unions Panel */}
        {showUnions && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-green-400"/> Unions</h2>
              <button onClick={() => setShowUnions(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {!selectedUnionId ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Unions</h3>
                    <button 
                      onClick={() => setSelectedUnionId('create')}
                      disabled={!myNation}
                      className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-1 px-3 rounded transition-colors"
                    >
                      Form Union
                    </button>
                  </div>
                  
                  {unions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No unions have been formed yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {unions.map(union => (
                        <div 
                          key={union.id} 
                          onClick={() => setSelectedUnionId(union.id)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          {union.flag ? (
                            <img src={union.flag} alt="Flag" className="h-6 w-auto object-contain rounded-sm border border-white/20" />
                          ) : (
                            <div className="w-10 h-6 rounded-sm border border-white/20 flex items-center justify-center" style={{ backgroundColor: union.color }}>
                              <Shield className="w-4 h-4 text-white/50" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-sm"><EntityName entity={union} /></h4>
                            <p className="text-xs text-gray-400">{union.members.length} member states</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : selectedUnionId === 'create' ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newUnionName.trim()) {
                      useGameStore.getState().createUnion({
                        name: newUnionName.trim(),
                        color: newUnionColor,
                        flag: newUnionFlag.trim()
                      });
                      setSelectedUnionId(null);
                      setNewUnionName('');
                      setNewUnionFlag('');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Form New Union</h3>
                    <button type="button" onClick={() => setSelectedUnionId(null)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Union Name</label>
                    <input
                      required
                      type="text"
                      value={newUnionName}
                      onChange={e => setNewUnionName(e.target.value)}
                      placeholder="e.g. European Union"
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Union Color</label>
                    <input
                      type="color"
                      value={newUnionColor}
                      onChange={e => setNewUnionColor(e.target.value)}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Flag URL (Optional)</label>
                    <input
                      type="url"
                      value={newUnionFlag}
                      onChange={e => setNewUnionFlag(e.target.value)}
                      placeholder="https://example.com/flag.png"
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded transition-colors"
                  >
                    Propose Union
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const union = unions.find(u => u.id === selectedUnionId);
                    if (!union) return null;
                    const isMember = myNation && union.members.includes(myNation.id);
                    const hasRequested = myNation && allianceRequests.some(r => r.unionId === union.id && r.nationId === myNation.id);
                    
                    return (
                      <>
                        {showUnionSettings ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> Настройки союза</h3>
                              <button onClick={() => setShowUnionSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Название союза</label>
                              <input type="text" value={editUnionName} onChange={e => setEditUnionName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Цвет союза</label>
                              <div className="flex gap-2">
                                <input type="color" value={editUnionColor} onChange={e => setEditUnionColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                                <input type="text" value={editUnionColor} onChange={e => setEditUnionColor(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Флаг (URL или файл)</label>
                              <div className="flex gap-2">
                                <input type="text" value={editUnionFlag} onChange={e => setEditUnionFlag(e.target.value)} placeholder="https://..." className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded px-3 py-2 flex items-center justify-center transition-colors">
                                  <Upload className="w-4 h-4 text-gray-300" />
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          setEditUnionFlag(event.target.result as string);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                                </label>
                              </div>
                              {editUnionFlag && (
                                <div className="mt-2 flex justify-center">
                                  <img src={editUnionFlag} alt="Preview" className="h-16 w-auto object-contain rounded border border-white/20" />
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => {
                                useGameStore.getState().updateUnion(union.id, {
                                  name: editUnionName,
                                  color: editUnionColor,
                                  flag: editUnionFlag
                                });
                                setShowUnionSettings(false);
                              }}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors mt-4"
                            >
                              Сохранить изменения
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-4">
                              <button onClick={() => setSelectedUnionId(null)} className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                                <ChevronLeft className="w-4 h-4" /> Back
                              </button>
                              <div className="flex gap-2">
                                {myNation && union.founderId === myNation.id && (
                                  <button 
                                    onClick={() => {
                                      setEditUnionName(union.name);
                                      setEditUnionColor(union.color);
                                      setEditUnionFlag(union.flag || '');
                                      setShowUnionSettings(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded transition-colors flex items-center gap-1"
                                  >
                                    <Settings className="w-3 h-3" />
                                    Settings
                                  </button>
                                )}
                                {myNation && !isMember && !hasRequested && (
                                  <button 
                                    onClick={() => useGameStore.getState().requestJoinUnion(union.id)}
                                    className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
                                  >
                                    Request to Join
                                  </button>
                                )}
                                {myNation && hasRequested && (
                                  <span className="text-yellow-500 text-xs font-bold px-2 py-1 border border-yellow-500/30 rounded bg-yellow-500/10">
                                    Request Pending
                                  </span>
                                )}
                                {isMember && (
                                  <button 
                                    onClick={() => {
                                      useGameStore.getState().leaveUnion(union.id);
                                      setSelectedUnionId(null);
                                    }}
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
                                  >
                                    Leave Union
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                              {union.flag ? (
                                <img src={union.flag} alt="Flag" className="h-10 w-auto object-contain rounded border border-white/20" />
                              ) : (
                                <div className="w-16 h-10 rounded border border-white/20 flex items-center justify-center" style={{ backgroundColor: union.color }}>
                                  <Shield className="w-6 h-6 text-white/50" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-xl font-bold">{union.name}</h3>
                                <p className="text-sm text-gray-400">Founded by {nations.find(n => n.id === union.founderId)?.name || 'Unknown'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Member States ({union.members.length})</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {union.members.map(memberId => {
                                  const nation = nations.find(n => n.id === memberId);
                                  if (!nation) return null;
                                  return (
                                    <div key={memberId} className="bg-white/5 border border-white/10 p-2 rounded flex items-center gap-2">
                                      <EntityName entity={nation} />
                                      {memberId === union.founderId && <Star className="w-3 h-3 text-yellow-500 ml-auto" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {myNation && union.founderId === myNation.id && allianceRequests.filter(r => r.unionId === union.id).length > 0 && (
                              <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-4">
                                <h4 className="text-xs uppercase tracking-wider text-yellow-500 mb-2">Pending Requests</h4>
                                <div className="space-y-2">
                                  {allianceRequests.filter(r => r.unionId === union.id).map(req => (
                                    <div key={req.id} className="flex items-center justify-between text-sm bg-black/40 p-2 rounded border border-white/5">
                                      <span>{req.nationName}</span>
                                      <div className="flex gap-2">
                                        <button onClick={() => useGameStore.getState().approveUnionJoin(req.id)} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                                        <button onClick={() => useGameStore.getState().rejectUnionJoin(req.id)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Server Selection */}
        {!myNation && setupPhase === 'server' && !showAlliances && (
          <div className="self-center bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-xl w-full max-w-md pointer-events-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-400" />
              Select Server
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => {
                connect();
                setSetupPhase('form');
              }}>
                <div>
                  <h3 className="font-bold text-lg text-white">Main Server</h3>
                  <p className="text-xs text-green-400">Online • Global Politics RP</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pre-Spawn Form */}
        {!myNation && setupPhase === 'form' && !showAlliances && (
          <div className="self-center bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-xl w-full max-w-md pointer-events-auto shadow-2xl overflow-y-auto max-h-[80vh] custom-scrollbar">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Found a Nation
            </h2>
            <form onSubmit={handleSpawnFormSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. United Kingdom"
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-[38px] bg-white/5 border border-white/10 rounded cursor-pointer"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Short Name</label>
                <input
                  required
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. UK"
                  className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Ideology</label>
                <select
                  value={ideology}
                  onChange={(e) => setIdeology(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {IDEOLOGIES.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">National Flag</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setFlagType('preset')} className={`flex-1 py-1 text-xs rounded border ${flagType === 'preset' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-white/10 text-gray-400'}`}>Search Flags</button>
                  <button type="button" onClick={() => setFlagType('upload')} className={`flex-1 py-1 text-xs rounded border ${flagType === 'upload' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-white/10 text-gray-400'}`}>Upload Custom</button>
                  <button type="button" onClick={() => setFlagType('url')} className={`flex-1 py-1 text-xs rounded border ${flagType === 'url' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-white/10 text-gray-400'}`}>URL</button>
                </div>
                
                {flagType === 'preset' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search countries..." 
                        value={flagSearch}
                        onChange={(e) => setFlagSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded p-2 pl-8 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      {filteredFlags.map(f => {
                        const url = `https://flagcdn.com/w80/${f.code}.png`;
                        return (
                          <button
                            key={f.code}
                            type="button"
                            onClick={() => setFlagUrl(url)}
                            title={f.name}
                            className={`relative aspect-[3/2] rounded overflow-hidden border-2 transition-all ${flagUrl === url ? 'border-blue-500 scale-105 z-10' : 'border-transparent hover:border-white/30'}`}
                          >
                            <img src={url} alt={f.name} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : flagType === 'upload' ? (
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleFlagUpload} className="text-xs w-full" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="url" 
                      placeholder="https://example.com/flag.png" 
                      value={flagUrl} 
                      onChange={(e) => setFlagUrl(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
                {flagUrl && (
                  <div className="mt-4 h-20 border border-white/10 rounded overflow-hidden flex items-center justify-center bg-black/50">
                    <img src={flagUrl} alt="Flag Preview" className="h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Spawn Location</label>
                <select
                  value={targetNationId}
                  onChange={(e) => setTargetNationId(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors mb-2"
                >
                  <option value="">Free Territory (Independent)</option>
                  {nations.map((n) => (
                    <option key={n.id} value={n.id}>Inside {n.name}</option>
                  ))}
                </select>

                {targetNationId && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Dependency Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {DEPENDENCY_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Select Territory
              </button>
            </form>
          </div>
        )}

        {/* Drawing Mode Overlay */}
        {!myNation && setupPhase === 'draw' && !showAlliances && (
          <div className="self-center bg-black/80 backdrop-blur-xl border border-blue-500/50 p-6 rounded-xl w-full max-w-md pointer-events-auto shadow-2xl text-center">
            <h2 className="text-xl font-bold mb-2 text-blue-400">Draw Your Borders</h2>
            <p className="text-sm text-gray-300 mb-4">
              Click and drag on the map to claim land.
            </p>
            
            <div className="flex justify-between items-center mb-6 bg-white/5 p-3 rounded">
              <span className="text-sm uppercase tracking-wider text-gray-400">Territory</span>
              <span className={`font-mono font-bold ${draftTerritories.length === MAX_TERRITORY ? 'text-yellow-400' : 'text-white'}`}>
                {draftTerritories.length} / {MAX_TERRITORY}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSetupPhase('form')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleConfirmSpawn}
                disabled={draftTerritories.length === 0 || spawnStatus === 'pending'}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {spawnStatus === 'pending' ? 'Requesting...' : <><Check className="w-4 h-4" /> Confirm Spawn</>}
              </button>
            </div>

            {spawnMessage && (
              <div className={`mt-4 text-sm text-center p-2 rounded ${spawnStatus === 'error' || spawnStatus === 'rejected' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {spawnMessage}
              </div>
            )}
          </div>
        )}

        {/* Selected Entity Menu */}
        {selectedNationId && !pendingRequests.length && !showAlliances && !showUnions && (
          <div className="absolute top-20 right-4 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {(() => {
              const n = nations.find(x => x.id === selectedNationId);
              const u = unions.find(x => x.id === selectedNationId);
              
              if (u) {
                // Render Union Info
                return (
                  <>
                    <div className="relative h-32 bg-white/5 flex items-center justify-center border-b border-white/10">
                      {u.flag ? (
                        <img src={u.flag} alt="Flag" className="w-full h-full object-contain opacity-80" />
                      ) : (
                        <Shield className="w-12 h-12 text-gray-500" />
                      )}
                      <button onClick={() => setSelectedNationId(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded hover:bg-black/80">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                      <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                        <EntityName entity={u} />
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">Union</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-400">Members</span>
                          <span className="font-bold">{u.members.length}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-400">Founder</span>
                          <span className="font-bold"><EntityName entity={nations.find(nat => nat.id === u.founderId)} /></span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-2">Member Nations</h4>
                        <div className="space-y-1">
                          {u.members.map(memberId => {
                            const memberNation = nations.find(nat => nat.id === memberId);
                            if (!memberNation) return null;
                            return (
                              <div key={memberId} className="flex items-center gap-2 text-sm bg-white/5 p-2 rounded">
                                <EntityName entity={memberNation} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {(() => {
                        if (!myDiplomaticEntity) return null;
                        const activeWar = wars.find(w => w.status === 'active' && 
                          ((w.attackerId === myDiplomaticEntity.id && w.defenderId === u.id) || 
                           (w.defenderId === myDiplomaticEntity.id && w.attackerId === u.id)));
                        
                        if (activeWar) {
                          return (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <button
                                onClick={() => {
                                  setPlacingBattle(activeWar.id);
                                  setIsPaintingMode(false);
                                  setIsRollMode(false);
                                  setSelectedNationId(null);
                                }}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                              >
                                <Crosshair className="w-4 h-4" />
                                Place Battle
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </>
                );
              }

              if (!n) return null;
              
              // Find alliances this nation belongs to
              const nationAlliances = alliances.filter(a => a.members.includes(n.id));
              const nationUnion = unions.find(un => un.members.includes(n.id));

              return (
                <>
                  <div className="relative h-32 bg-white/5 flex items-center justify-center border-b border-white/10">
                    {n.flag ? (
                      <img src={n.flag} alt="Flag" className="w-full h-full object-contain opacity-80" />
                    ) : (
                      <Shield className="w-12 h-12 text-gray-500" />
                    )}
                    <button onClick={() => setSelectedNationId(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded hover:bg-black/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                      <EntityName entity={n} />
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">{n.shortName}</p>
                    
                    <div className="space-y-2 text-sm">
                      {nationUnion && (
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-green-400 font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> Union</span>
                          <span className="text-green-300 font-bold"><EntityName entity={nationUnion} /></span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-400">Ideology</span>
                        <span>{n.ideology}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-400">Status</span>
                        <span>{n.status}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-400">Territory Size</span>
                        <span>{n.territories.length} px</span>
                      </div>
                    </div>

                    {nationAlliances.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Alliances</h4>
                        <div className="flex flex-wrap gap-2">
                          {nationAlliances.map(a => (
                            <span key={a.id} className="bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-2 py-1 rounded">
                              {a.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(() => {
                      if (!myDiplomaticEntity) return null;
                      const activeWar = wars.find(w => w.status === 'active' && 
                        ((w.attackerId === myDiplomaticEntity.id && w.defenderId === n.id) || 
                         (w.defenderId === myDiplomaticEntity.id && w.attackerId === n.id)));
                      
                      if (activeWar) {
                        return (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <button
                              onClick={() => {
                                setPlacingBattle(activeWar.id);
                                setIsPaintingMode(false);
                                setIsRollMode(false);
                                setSelectedNationId(null);
                              }}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                            >
                              <Crosshair className="w-4 h-4" />
                              Place Battle
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Pending Requests Overlay */}
        {pendingRequests.length > 0 && !showAlliances && (
          <div className="absolute top-20 right-4 w-80 space-y-2 pointer-events-auto">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-black/80 backdrop-blur-md border border-yellow-500/50 p-4 rounded-lg shadow-lg">
                <h3 className="font-bold text-yellow-400 mb-2">Spawn Request</h3>
                <p className="text-sm mb-1"><span className="text-gray-400">Nation:</span> {req.data.name} ({req.data.shortName})</p>
                <p className="text-sm mb-1"><span className="text-gray-400">Ideology:</span> {req.data.ideology}</p>
                <p className="text-sm mb-3"><span className="text-gray-400">Requested Status:</span> {req.data.status}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveSpawn(req.id)}
                    className="flex-1 bg-green-600 hover:bg-green-500 py-1 rounded text-sm font-bold transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectSpawn(req.id)}
                    className="flex-1 bg-red-600 hover:bg-red-500 py-1 rounded text-sm font-bold transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Overlay */}
        <div className="absolute bottom-4 left-4 w-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg flex flex-col pointer-events-auto shadow-lg overflow-hidden" style={{ maxHeight: '40vh' }}>
          <div className="flex bg-white/5 border-b border-white/10">
            <button 
              onClick={() => setChatTab('global')} 
              className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${chatTab === 'global' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              Global
            </button>
            {myDiplomaticEntity && alliances.some(a => a.members.includes(myDiplomaticEntity.id)) && (
              <button 
                onClick={() => setChatTab('alliance')} 
                className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${chatTab === 'alliance' ? 'bg-purple-600/50 text-white' : 'text-purple-400/70 hover:bg-white/5'}`}
              >
                Alliance
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 text-sm flex flex-col-reverse custom-scrollbar">
            {chatTab === 'global' ? (
              [...chatMessages].reverse().map(msg => {
                const senderNation = msg.senderId ? nations.find(n => n.id === msg.senderId) : null;
                return (
                  <div key={msg.id} className="break-words">
                    {senderNation?.flag && (
                      <img src={senderNation.flag} alt={senderNation.name} title={senderNation.name} className="inline-block h-3 w-auto rounded-[2px] align-middle mr-1" />
                    )}
                    <span className="font-bold text-blue-400">{msg.sender}: </span>
                    <span className="text-gray-200">{msg.text}</span>
                  </div>
                );
              })
            ) : (
              (() => {
                const myAlliance = alliances.find(a => myDiplomaticEntity && a.members.includes(myDiplomaticEntity.id));
                if (!myAlliance) return null;
                const chats = allianceChats[myAlliance.id] || [];
                return [...chats].reverse().map(msg => {
                  const senderNation = msg.senderId ? nations.find(n => n.id === msg.senderId) : null;
                  return (
                    <div key={msg.id} className="break-words">
                      <span className="text-gray-400 text-xs">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>{' '}
                      {senderNation?.flag && (
                        <img src={senderNation.flag} alt={senderNation.name} title={senderNation.name} className="inline-block h-3 w-auto rounded-[2px] align-middle mr-1" />
                      )}
                      <span className="font-bold text-purple-400">{msg.sender}: </span>
                      <span className="text-gray-200">{msg.text}</span>
                    </div>
                  );
                });
              })()
            )}
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (chatTab === 'global') {
                if (chatInput.trim()) {
                  sendChatMessage(chatInput.trim());
                  setChatInput('');
                }
              } else {
                const myAlliance = alliances.find(a => myDiplomaticEntity && a.members.includes(myDiplomaticEntity.id));
                if (myAlliance && allianceChatInput.trim()) {
                  sendAllianceChatMessage(myAlliance.id, allianceChatInput.trim());
                  setAllianceChatInput('');
                }
              }
            }} 
            className="p-2 border-t border-white/10 bg-black/50 flex gap-2"
          >
            <input
              type="text"
              value={chatTab === 'global' ? chatInput : allianceChatInput}
              onChange={e => chatTab === 'global' ? setChatInput(e.target.value) : setAllianceChatInput(e.target.value)}
              placeholder={chatTab === 'global' ? "Message global..." : "Message alliance..."}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm font-bold">Send</button>
          </form>
        </div>

        {/* Action Buttons (Bottom Right) */}
        {myNation && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => {
                setIsRollMode(!isRollMode);
                if (!isRollMode) {
                  setIsPaintingMode(false);
                  setPlacingBattle(null);
                }
              }} 
              className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full flex items-center justify-center transition-colors shadow-lg ${isRollMode ? 'bg-orange-500/50 hover:bg-orange-500/70 border-orange-500/50' : 'hover:bg-gray-800/80'}`}
              title="Rolls (Colonization)"
            >
              <Dices className={`w-6 h-6 ${isRollMode ? 'text-white' : 'text-orange-400'}`} /> 
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-600/90 backdrop-blur-md text-white px-6 py-3 rounded-lg shadow-2xl z-50 font-bold border border-green-400/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <Check className="w-5 h-5" />
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
