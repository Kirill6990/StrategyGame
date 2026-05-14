import { translations, TranslationKey, Language, tMapIdeology, tMapEconomy } from './i18n';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import { Stage, Layer, Text, Image as KonvaImage, Shape, Group, Circle, Rect } from 'react-konva';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useGameStore } from './store';
import { Map as MapIcon, Shield, Check, ArrowLeft, MessageSquare, Upload, Image as ImageIcon, X, Search, Globe, Landmark, ChevronLeft, Star, Swords, Crosshair, Flag, Dices, Settings, Users, Mail, Plus, Send, Edit3, Edit2, Book } from 'lucide-react';

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

const EntityName = ({ entity, className = "", noTruncate = false }: { entity: Nation | Union | Alliance | undefined, className?: string, noTruncate?: boolean }) => {
  if (!entity) return <span className={className}>Unknown</span>;
  
  return (
    <span className={`flex items-center gap-1.5 min-w-0 ${className} ${noTruncate ? 'items-start' : ''}`}>
      {entity.flag ? (
        <img src={entity.flag} alt="flag" className={`h-3 w-auto object-contain rounded-sm border border-white/20 shrink-0 ${noTruncate ? 'mt-1.5' : ''}`} />
      ) : (
        'members' in entity ? <Shield className={`w-3 h-3 text-green-400 shrink-0 ${noTruncate ? 'mt-1.5' : ''}`} /> : <div className={`w-3 h-3 rounded-full shrink-0 ${noTruncate ? 'mt-1.5' : ''}`} style={{ backgroundColor: (entity as Nation).color }} />
      )}
      <span className={noTruncate ? "break-words whitespace-normal leading-tight" : "truncate min-w-0"}>{entity.name}</span>
    </span>
  );
};

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function generateWarNarrativeClientSide(war: any, getNatName: (id: string) => string, lang: string, socket: any, customPrompt?: string, existingWikiStr?: string, newsContextStr?: string) {
  if (war.isGeneratingNarrative || (!customPrompt && war.customWiki)) return;
  socket.emit('setWarGenerating', { warId: war.id, isGenerating: true });
  
  const rules = [];
  if (war.battles) {
    war.battles.forEach((b: any, i: number) => {
      rules.push(`Battle ${i+1}: Attacker ${getNatName(b.attackerId)} vs ${getNatName(b.defenderId)}, Winner: ${b.winnerId ? getNatName(b.winnerId) : 'None'}.`);
    });
  }
  
  let peaceSummary = '';
  if (war.peaceTreaty) {
    peaceSummary = `Peace Treaty: ${Object.keys(war.peaceTreaty.territoryClaims || {}).length} regions transferred.`;
  }
  
  const isRu = lang === 'ru';
  let prompt = '';
  const newsInfo = newsContextStr ? `\nКонтекст из мировых новостей:\n${newsContextStr}` : '';
  const newsInfoEn = newsContextStr ? `\nWorld News Context:\n${newsContextStr}` : '';
  
  if (customPrompt) {
     prompt = isRu ? 
      `Ты редактируешь ВСЮ статью о войне (Вики-страница).
      ВАЖНО: Игнорируй реальные исторические события и страны. Опирайся только на события происходящие в этой игре (указаны ниже).
      Не пиши информацию о потерях, так как статистика потерь считается игрой автоматически.
      Текущие данные статьи JSON: "${existingWikiStr || 'Отсутствует'}"
      Просьба пользователя: "${customPrompt}"
      
      Исходные факты:
      Атакует: ${getNatName(war.attackerId)}, Защищается: ${getNatName(war.defenderId)}.
      Причина: ${war.reason}.
      ${rules.join('\n')}
      ${peaceSummary}
      ${newsInfo}

      Обнови нужные поля и верни ГОТОВЫЙ JSON. Поддерживается Markdown (например, ссылки на страны [Имя](nation:id), войны [Имя](war:id)).`
    :
      `You are editing the ENTIRE war article (Wiki page).
      IMPORTANT: Ignore real historical events and countries. Rely only on the events happening in this game (listed below).
      Do not write casualty information, as casualties are automatically calculated by the game.
      Current article JSON data: "${existingWikiStr || 'None'}"
      User's request: "${customPrompt}"
      
      Raw facts:
      Attacker: ${getNatName(war.attackerId)}, Defender: ${getNatName(war.defenderId)}.
      Reason: ${war.reason}.
      ${rules.join('\n')}
      ${peaceSummary}
      ${newsInfoEn}

      Update the fields and return the final JSON. Markdown supported (e.g., links [Name](nation:id), [Name](war:id)).`;
  } else {
    prompt = isRu ? 
      `Сгенерируй полноценную Вики-статью о войне.
      ВАЖНО: Игнорируй реальные исторические события и реальные страны. Опирайся только на события происходящие в игре.
      Не придумывай и не вписывай никакие цифры потерь (casualties), так как это считает движок игры.
      Используй следующие факты:
      Атакует: ${getNatName(war.attackerId)}, Защищается: ${getNatName(war.defenderId)}.
      Причина: ${war.reason}.
      ${rules.join('\n')}
      ${peaceSummary}
      ${newsInfo}
      
      Придумай эпичное название для войны (если подходит).
      Верни JSON. Поддерживается Markdown (например, ссылки на страны [Имя](nation:id), войны [Имя](war:id)).`
    :
      `Generate a full Wiki article about the war.
      IMPORTANT: Ignore all real historical events and countries. Only rely on events happening in the game.
      Use the following facts:
      Attacker: ${getNatName(war.attackerId)}, Defender: ${getNatName(war.defenderId)}.
      Reason: ${war.reason}.
      ${rules.join('\n')}
      ${peaceSummary}
      ${newsInfoEn}

      Invent an epic name for the war (if fitting).
      Return JSON. Markdown supported (e.g., links [Name](nation:id), [Name](war:id)).`;
  }

  ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          title: { type: "string", description: isRu ? "Название войны" : "Name of the war" },
          intro: { type: "string", description: isRu ? "Вступление (когда, зачем, кто)" : "Intro (when, why, who)" },
          narrative: { type: "string", description: isRu ? "Ход войны (подробный текст)" : "Course of war (detailed text)" },
          result: { type: "string", description: isRu ? "Итог (например 'Мирный договор подписан')" : "Result (e.g. 'Peace treaty signed')" }
        },
        required: ["title", "intro", "narrative", "result"]
      }
    }
  }).then(result => {
    try {
      const txt = (result.text || "").replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(txt || "{}");
      socket.emit('setWarNarrative', { warId: war.id, customWiki: parsed, narrative: parsed.narrative });
    } catch(err) {
      console.error('Failed to parse JSON narrative:', err);
    }
  }).catch(e => {
    console.error('Failed to generate narrative:', e);
  }).finally(() => {
    socket.emit('setWarGenerating', { warId: war.id, isGenerating: false });
  });
}

function generateWarNarrative(war: any, getNatName: (id: string) => string, lang: string): string {
  if (!war.battles || war.battles.length === 0) {
    return lang === 'ru' ? 'Конфликт завершился без значительных сражений.' : 'The conflict ended without significant battles.';
  }
  
  const textRules: string[] = [];
  
  war.battles.forEach((b: any, i: number) => {
    const attackerName = getNatName(b.attackerId);
    const defenderName = getNatName(b.defenderId);
    
    if (i === 0) {
       textRules.push(lang === 'ru' 
         ? `Война началась с полномасштабного наступления сил ${attackerName} на территории ${defenderName}.` 
         : `The war commenced with a full-scale offensive by ${attackerName} against the territories of ${defenderName}.`);
    } else {
       if (b.attackerId === war.attackerId || war.attackers.includes(b.attackerId)) {
         textRules.push(lang === 'ru' 
           ? `Дальнейшее наступление продолжалось силами ${attackerName}.`
           : `Further offensives were pushed by ${attackerName}.`);
       } else {
         textRules.push(lang === 'ru'
           ? `Войска ${attackerName} начали ожесточенное контрнаступление на позиции ${defenderName}.`
           : `The forces of ${attackerName} launched a fierce counter-offensive against ${defenderName}.`);
       }
    }
  });

  const totalBattles = war.battles.length;
  if (totalBattles > 2) {
    textRules.push(lang === 'ru' 
      ? `В ходе долгих и кровопролитных кампаний, включавших как длительные осады городов, так и позиционные бои, стороны понесли значительные потери.`
      : `Throughout long and bloody campaigns, including city sieges and positional warfare, both sides suffered significant losses.`);
  }

  return textRules.join(' ');
}

const WarStaticMap = ({ war, wikiNations, nations, lang, bgImage, gridSize }: { war: any, wikiNations: any[], nations: any[], lang: string, bgImage: any, gridSize: any }) => {
  return (
    <div className="border-b border-[#a2a9b1] flex flex-col items-center bg-gray-50 p-2">
       <div className="w-full bg-[#1a202c] relative border border-[#a2a9b1] shadow-sm overflow-hidden aspect-[2]">
         <canvas 
            className="w-full h-full object-contain"
            ref={canvas => {
              if (!canvas || !war || !wikiNations) return;
              
              const w = gridSize?.w || 1000;
              const h = gridSize?.h || 500;
              let minX = w, minY = h, maxX = 0, maxY = 0;
              let hasPoints = false;
              
              const getTerritories = (nid: string) => {
                if (war.preWarTerritories && war.preWarTerritories[nid] && war.preWarTerritories[nid].length > 0) return war.preWarTerritories[nid];
                const active = nations.find(n => n.id === nid);
                if (active && active.territories && active.territories.length > 0) return active.territories;
                const wiki = wikiNations.find(wi => wi.id === nid);
                if (wiki && wiki.lastTerritories && wiki.lastTerritories.length > 0) return wiki.lastTerritories;
                return [];
              };

              const computeBounds = (nid: string) => {
                const terrs = getTerritories(nid);
                terrs.forEach((idx: number) => {
                   const gx = idx % w;
                   const gy = Math.floor(idx / w);
                   if (gx < minX) minX = gx;
                   if (gx > maxX) maxX = gx;
                   if (gy < minY) minY = gy;
                   if (gy > maxY) maxY = gy;
                   hasPoints = true;
                });
              };
              
              war.attackers.forEach((id: string) => computeBounds(id));
              war.defenders.forEach((id: string) => computeBounds(id));

              if (!hasPoints) {
                minX = 0; maxX = w; minY = 0; maxY = h;
              }
              if (maxX < minX) {
                minX = 0; maxX = w; minY = 0; maxY = h;
              }

              const padding = 8;
              minX = Math.max(0, minX - padding);
              minY = Math.max(0, minY - padding);
              maxX = Math.min(w, maxX + padding);
              maxY = Math.min(h, maxY + padding);

              let boxW = maxX - minX || 1;
              let boxH = maxY - minY || 1;
              
              const targetAspect = 2;
              const currentAspect = boxW / boxH;
              
              if (currentAspect < targetAspect) {
                const newW = boxH * targetAspect;
                const diff = newW - boxW;
                let p1 = diff / 2;
                let p2 = diff / 2;
                if (minX - p1 < 0) { p2 += p1 - minX; p1 = minX; }
                if (maxX + p2 > w) { p1 += (maxX + p2) - w; p2 = w - maxX; }
                minX = Math.max(0, Math.floor(minX - p1));
                maxX = Math.min(w, Math.ceil(maxX + p2));
              } else if (currentAspect > targetAspect) {
                const newH = boxW / targetAspect;
                const diff = newH - boxH;
                let p1 = diff / 2;
                let p2 = diff / 2;
                if (minY - p1 < 0) { p2 += p1 - minY; p1 = minY; }
                if (maxY + p2 > h) { p1 += (maxY + p2) - h; p2 = h - maxY; }
                minY = Math.max(0, Math.floor(minY - p1));
                maxY = Math.min(h, Math.ceil(maxY + p2));
              }
              
              boxW = maxX - minX || 1;
              boxH = maxY - minY || 1;

              const renderScale = Math.min(10, Math.floor(2000 / Math.max(boxW, boxH)));
              const finalScale = Math.max(2, renderScale);

              canvas.width = boxW * finalScale;
              canvas.height = boxH * finalScale;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              
              ctx.scale(finalScale, finalScale);
              ctx.imageSmoothingEnabled = false;
              ctx.clearRect(0, 0, boxW, boxH);
              
              if (bgImage) {
                try {
                  const imgW = (bgImage as HTMLImageElement).naturalWidth || w;
                  const imgH = (bgImage as HTMLImageElement).naturalHeight || h;
                  const rx = imgW / w;
                  const ry = imgH / h;
                  ctx.drawImage(bgImage, minX * rx, minY * ry, boxW * rx, boxH * ry, 0, 0, boxW, boxH);
                } catch(e) {
                  // handle
                }
              } else {
                ctx.fillStyle = '#1e293b'; 
                ctx.fillRect(0, 0, boxW, boxH);
                ctx.fillStyle = '#334155';
                const startX = Math.floor(minX / 10) * 10;
                const startY = Math.floor(minY / 10) * 10;
                for (let y = startY; y <= maxY; y += 10) {
                  for (let x = startX; x <= maxX; x += 10) {
                    ctx.fillRect(x - minX, y - minY, 1, 1);
                  }
                }
              }

              const paintNation = (nid: string, color: string) => {
                ctx.fillStyle = color;
                const terrs = getTerritories(nid);
                terrs.forEach((idx: number) => {
                   const gx = idx % w;
                   const gy = Math.floor(idx / w);
                   ctx.fillRect(gx - minX, gy - minY, 1, 1);
                });
              };
              
              wikiNations.forEach(n => {
                 if (!war.attackers.includes(n.id) && !war.defenders.includes(n.id)) {
                    // if bgImage isn't loading we could paint non-participants, but better just let bg show
                    if (!bgImage) paintNation(n.id, '#475569');
                 }
              });

              war.attackers.forEach((id: string) => paintNation(id, 'rgba(239, 68, 68, 0.7)')); // #ef4444 semi-transparent
              war.defenders.forEach((id: string) => paintNation(id, 'rgba(59, 130, 246, 0.7)')); // #3b82f6 semi-transparent
            }} 
         />
       </div>
       <div className="text-[10px] text-gray-500 italic mt-1.5 text-center leading-tight">
          {lang === 'ru' ? 'Карта территорий участников (красный - атакующие, синий - защитники).' : 'Territory map (red - attackers, blue - defenders).'}
       </div>
    </div>
  );
};

const WarAnimatedMap = ({ war, wikiNations, nations, lang, bgImage, gridSize }: { war: any, wikiNations: any[], nations: any[], lang: string, bgImage: any, gridSize: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);
  const playbackSpeedRef = useRef(playbackSpeed);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
     isPlayingRef.current = isPlaying;
     playbackSpeedRef.current = playbackSpeed;
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    if (isPlaying) {
       lastTimeRef.current = performance.now();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!canvasRef.current || !war || !wikiNations) return;
    const canvas = canvasRef.current;
    
    const w = gridSize?.w || 1000;
    const h = gridSize?.h || 500;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasPoints = false;

    const getTerritories = (nid: string) => {
      if (war.preWarTerritories && war.preWarTerritories[nid] && war.preWarTerritories[nid].length > 0) return war.preWarTerritories[nid];
      const active = nations.find(n => n.id === nid);
      if (active && active.territories && active.territories.length > 0) return active.territories;
      const wiki = wikiNations.find(wi => wi.id === nid);
      if (wiki && wiki.lastTerritories && wiki.lastTerritories.length > 0) return wiki.lastTerritories;
      return [];
    };

    const computeBounds = (nid: string) => {
      const terrs = getTerritories(nid);
      terrs.forEach((idx: number) => {
         const gx = idx % w;
         const gy = Math.floor(idx / w);
         if (gx < minX) minX = gx;
         if (gx > maxX) maxX = gx;
         if (gy < minY) minY = gy;
         if (gy > maxY) maxY = gy;
         hasPoints = true;
      });
    };
    
    war.attackers.forEach((id: string) => computeBounds(id));
    war.defenders.forEach((id: string) => computeBounds(id));

    if (war.battles) {
      war.battles.forEach((b: any) => {
         if (b.x < minX) minX = b.x;
         if (b.x > maxX) maxX = b.x;
         if (b.y < minY) minY = b.y;
         if (b.y > maxY) maxY = b.y;
         hasPoints = true;
      });
    }

    if (!hasPoints) {
      minX = 0; maxX = w; minY = 0; maxY = h;
    }
    if (maxX < minX) {
      minX = 0; maxX = w; minY = 0; maxY = h;
    }

    const padding = 8;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(w, maxX + padding);
    maxY = Math.min(h, maxY + padding);

    let boxW = maxX - minX || 1;
    let boxH = maxY - minY || 1;
    
    const targetAspect = 2;
    const currentAspect = boxW / boxH;
    
    if (currentAspect < targetAspect) {
      const newW = boxH * targetAspect;
      const diff = newW - boxW;
      let p1 = diff / 2;
      let p2 = diff / 2;
      if (minX - p1 < 0) { p2 += p1 - minX; p1 = minX; }
      if (maxX + p2 > w) { p1 += (maxX + p2) - w; p2 = w - maxX; }
      minX = Math.max(0, Math.floor(minX - p1));
      maxX = Math.min(w, Math.ceil(maxX + p2));
    } else if (currentAspect > targetAspect) {
      const newH = boxW / targetAspect;
      const diff = newH - boxH;
      let p1 = diff / 2;
      let p2 = diff / 2;
      if (minY - p1 < 0) { p2 += p1 - minY; p1 = minY; }
      if (maxY + p2 > h) { p1 += (maxY + p2) - h; p2 = h - maxY; }
      minY = Math.max(0, Math.floor(minY - p1));
      maxY = Math.min(h, Math.ceil(maxY + p2));
    }
    
    boxW = maxX - minX || 1;
    boxH = maxY - minY || 1;

    const renderScale = Math.min(10, Math.floor(2000 / Math.max(boxW, boxH)));
    const finalScale = Math.max(2, renderScale);

    canvas.width = boxW * finalScale;
    canvas.height = boxH * finalScale;

    const durationPerBattle = 1500;
    const durationForTreaty = 2000;
    const durationPerPaint = 300;
    const pauseAtEnd = 3000;
    
    const totalBattles = war.battles ? war.battles.length : 0;
    const manualPaints = war.timelineEvents ? war.timelineEvents.filter((e: any) => e.type === 'paint') : [];
    const hasPeaceTreaty = war.peaceTreaty && Object.keys(war.peaceTreaty.territoryClaims || {}).length > 0;
    
    let activeDuration = (totalBattles * durationPerBattle) + (manualPaints.length * durationPerPaint);
    if (hasPeaceTreaty) activeDuration += durationForTreaty;
    // total duration is sum of everything + a pause at the end
    const totalDuration = activeDuration > 0 ? (activeDuration + pauseAtEnd) : 0;

    const render = (time: number) => {
      if (isPlayingRef.current && totalDuration > 0) {
         const delta = time - lastTimeRef.current;
         progressRef.current += (delta * playbackSpeedRef.current) / totalDuration;
         if (progressRef.current >= 1) {
            progressRef.current = 1;
            setIsPlaying(false);
         }
         setProgress(progressRef.current);
      }
      lastTimeRef.current = time;

      const elapsed = progressRef.current * totalDuration;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.save();
      ctx.scale(finalScale, finalScale);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, boxW, boxH);
      
      if (bgImage) {
        try {
          const imgW = (bgImage as HTMLImageElement).naturalWidth || w;
          const imgH = (bgImage as HTMLImageElement).naturalHeight || h;
          const rx = imgW / w;
          const ry = imgH / h;
          ctx.drawImage(bgImage, minX * rx, minY * ry, boxW * rx, boxH * ry, 0, 0, boxW, boxH);
        } catch(e) {}
      } else {
        ctx.fillStyle = '#1e293b'; 
        ctx.fillRect(0, 0, boxW, boxH);
        ctx.fillStyle = '#334155';
        const startX = Math.floor(minX / 10) * 10;
        const startY = Math.floor(minY / 10) * 10;
        for (let y = startY; y <= maxY; y += 10) {
          for (let x = startX; x <= maxX; x += 10) {
            ctx.fillRect(x - minX, y - minY, 1, 1);
          }
        }
      }

      const paintNation = (nid: string, color: string) => {
        ctx.fillStyle = color;
        const terrs = getTerritories(nid);
        terrs.forEach((idx: number) => {
           const gx = idx % w;
           const gy = Math.floor(idx / w);
           ctx.fillRect(gx - minX, gy - minY, 1, 1);
        });
      };
      
      wikiNations.forEach(n => {
         if (!war.attackers.includes(n.id) && !war.defenders.includes(n.id)) {
            if (!bgImage) paintNation(n.id, '#475569');
         }
      });
      
      war.attackers.forEach((id: string) => paintNation(id, 'rgba(239, 68, 68, 0.6)'));
      war.defenders.forEach((id: string) => paintNation(id, 'rgba(59, 130, 246, 0.6)'));

      if (war.battles && totalBattles > 0) {
        for (let i = 0; i < totalBattles; i++) {
          const bStart = i * durationPerBattle;
          if (elapsed > bStart) {
            const b = war.battles[i];
            const localElapsed = elapsed - bStart;
            
            const bx = b.x - minX;
            const by = b.y - minY;
            
            const actualWinnerId = b.winnerId || b.attackerId;
            let isAttackerWinner = war.attackers.includes(actualWinnerId);
            let isDefenderWinner = war.defenders.includes(actualWinnerId);
            let winnerColor = '';
            let flashColor = '';

            if (isAttackerWinner) {
              winnerColor = 'rgba(220, 38, 38, 0.9)'; // Solid red
              flashColor = 'rgba(239, 68, 68, 0.5)'; 
            } else if (isDefenderWinner) {
              winnerColor = 'rgba(37, 99, 235, 0.9)'; // Solid blue
              flashColor = 'rgba(59, 130, 246, 0.5)';
            } else {
              continue; // don't draw gray zones
            }
            
            const conqueredRadius = Math.max(3, Math.sqrt((b.pixelsToPaint || 20) / Math.PI));
            const finalRadius = Math.min(conqueredRadius, boxW * 0.15); // limit max scale

            let currentRadius = finalRadius;
            let currentProgress = 1;
            if (localElapsed < durationPerBattle) {
               currentProgress = Math.sin((localElapsed / durationPerBattle) * (Math.PI / 2));
               currentRadius = finalRadius * currentProgress;
            }
            
            ctx.fillStyle = winnerColor;
            
            if (b.paintedPixels && b.paintedPixels.length > 0) {
              const pixelsToShowCount = Math.floor(b.paintedPixels.length * currentProgress);
              for (let pIdx = 0; pIdx < pixelsToShowCount; pIdx++) {
                const pixel = b.paintedPixels[pIdx];
                const gx = pixel % w;
                const gy = Math.floor(pixel / w);
                ctx.fillRect(gx - minX, gy - minY, 1, 1);
              }
            } else {
              // Legacy battle fallback (approximated circular area)
              const rInt = Math.ceil(currentRadius);
              for (let dy = -rInt; dy <= rInt; dy++) {
                for (let dx = -rInt; dx <= rInt; dx++) {
                  if (dx * dx + dy * dy <= currentRadius * currentRadius) {
                    ctx.fillRect(Math.floor(bx + dx), Math.floor(by + dy), 1, 1);
                  }
                }
              }
            }
          }
        }
      }

      let currentPhaseStart = totalBattles * durationPerBattle;

      if (manualPaints.length > 0) {
         for (let i = 0; i < manualPaints.length; i++) {
            const pStart = currentPhaseStart + i * durationPerPaint;
            if (elapsed > pStart) {
               const pEvent = manualPaints[i];
               const localElapsed = elapsed - pStart;
               let currentProgress = 1;
               if (localElapsed < durationPerPaint) {
                  currentProgress = Math.sin((localElapsed / durationPerPaint) * (Math.PI / 2));
               }
               let paintColor = 'rgba(156, 163, 175, 0.8)';
               if (war.attackers.includes(pEvent.data.claimerId)) paintColor = 'rgba(220, 38, 38, 0.9)';
               else if (war.defenders.includes(pEvent.data.claimerId)) paintColor = 'rgba(37, 99, 235, 0.9)';
               
               ctx.fillStyle = paintColor;
               const pixels = pEvent.data.pixels || [];
               const pixelsToShowCount = Math.floor(pixels.length * currentProgress);
               for (let pIdx = 0; pIdx < pixelsToShowCount; pIdx++) {
                  const pixel = pixels[pIdx];
                  const gx = pixel % w;
                  const gy = Math.floor(pixel / w);
                  ctx.fillRect(gx - minX, gy - minY, 1, 1);
               }
            }
         }
         currentPhaseStart += manualPaints.length * durationPerPaint;
      }

      if (hasPeaceTreaty) {
         if (elapsed > currentPhaseStart) {
            const treatyElapsed = elapsed - currentPhaseStart;
            let currentProgress = 1;
            if (treatyElapsed < durationForTreaty) {
               currentProgress = Math.sin((treatyElapsed / durationForTreaty) * (Math.PI / 2));
            }
            
            const claims = Object.entries(war.peaceTreaty.territoryClaims || {});
            const pixelsToShowCount = Math.floor(claims.length * currentProgress);
            
            for (let i = 0; i < pixelsToShowCount; i++) {
               const [pixelStr, claimerId] = claims[i];
               const pixel = parseInt(pixelStr);
               
               let winnerColor = 'rgba(156, 163, 175, 0.8)';
               const foundAttacker = war.attackers.includes(claimerId);
               const foundDefender = war.defenders.includes(claimerId);
               
               if (foundAttacker) {
                  winnerColor = 'rgba(220, 38, 38, 0.9)';
               } else if (foundDefender) {
                  winnerColor = 'rgba(37, 99, 235, 0.9)';
               } else {
                  winnerColor = 'rgba(16, 185, 129, 0.9)'; // Some other color if puppet or third party
               }

               ctx.fillStyle = winnerColor;
               const gx = pixel % w;
               const gy = Math.floor(pixel / w);
               ctx.fillRect(gx - minX, gy - minY, 1, 1);
            }
         }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [war, wikiNations, nations, bgImage, gridSize]);

  const togglePlay = () => {
     if (progressRef.current >= 1) {
        progressRef.current = 0;
     }
     setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: any) => {
     const v = parseFloat(e.target.value);
     progressRef.current = v;
     setProgress(v);
  };

  return (
    <div className="bg-[#f8f9fa] border border-[#a2a9b1] text-gray-900 shadow-sm overflow-hidden text-[12px] leading-[1.3] mt-4 flex flex-col">
      <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-[#a2a9b1] flex justify-center items-center gap-2">
         {lang === 'ru' ? 'Ход боевых действий' : 'Course of Battles'}
         <span className="text-[9px] bg-blue-100 text-blue-800 px-1 border border-blue-200 rounded">{lang === 'ru' ? 'АНИМАЦИЯ' : 'ANIMATION'}</span>
      </div>
      <div className="w-full bg-[#1a202c] relative border-b border-[#a2a9b1] aspect-[2]">
         <canvas ref={canvasRef} className="w-full h-full object-contain" />
      </div>
      
      {/* Controls Container */}
      <div className="p-2 bg-white flex flex-col gap-2 border-b border-[#a2a9b1]">
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlay}
            className="shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-800"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-8 text-right font-mono">{Math.round(progress * 100)}%</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.001" 
              value={progress} 
              onChange={handleSliderChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <select 
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="text-xs bg-gray-100 border border-gray-300 rounded p-1 cursor-pointer"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="4">4x</option>
            <option value="10">10x</option>
          </select>
        </div>
      </div>
      
      <div className="p-1.5 text-center text-gray-600 bg-white">
         {(war.battles && war.battles.length > 0) ? (
            lang === 'ru' ? 'Сведения о развитии конфликта на карте.' : 'Map visually reflects conflict progression.'
         ) : (
            lang === 'ru' ? 'Воспроизведение карты без сражений.' : 'Map playback with no major battles.'
         )}
      </div>
    </div>
  );
};

const globalImageModerationCache: Record<string, boolean> = {};

function useImageModeration(url: string | undefined, language: string) {
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const checkImage = async () => {
      if (!url || (!url.startsWith('http') && !url.startsWith('data:image/'))) {
        setModerationError(null);
        return;
      }
      if (globalImageModerationCache[url] !== undefined) {
        if (!globalImageModerationCache[url]) {
          setModerationError(language === 'ru' ? 'Изображение заблокировано ИИ-модератором (жестокость/насилие)' : 'Image blocked by AI moderator (violence/gore)');
        } else {
          setModerationError(null);
        }
        return;
      }
      
      setIsCheckingImage(true);
      setModerationError(null);
      
      try {
        const res = await fetch('/api/fetch-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url })
        });
        const data = await res.json();
        
        if (data.error) {
           console.error('Image fetch error:', data.error);
           if (active) setIsCheckingImage(false);
           return;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            'Is this image containing gore (corpses, massacre, extreme violence)? Return ONLY a valid JSON: {"isGore": true} or {"isGore": false}.',
            { inlineData: { data: data.base64, mimeType: data.mimeType } }
          ],
          config: { responseMimeType: 'application/json' }
        });
        
        const result = JSON.parse(response.text || '{"isGore": false}');
        globalImageModerationCache[url] = !result.isGore;
        
        if (active) {
          if (result.isGore) {
            setModerationError(language === 'ru' ? 'Изображение заблокировано ИИ-модератором (жестокость/насилие)' : 'Image blocked by AI moderator (violence/gore)');
          }
        }
      } catch (err: any) {
        console.error('Image moderation failed', err);
        if (active) {
          if (err?.message?.toLowerCase().includes('safety') || err?.status === 400 || err?.status === 403) {
            globalImageModerationCache[url] = false;
            setModerationError(language === 'ru' ? 'Изображение заблокировано автоматическим фильтром безопасности' : 'Image blocked by automatic safety filter');
          } else {
            setModerationError(language === 'ru' ? 'Ошибка при проверке изображения' : 'Error checking image');
          }
        }
      } finally {
        if (active) setIsCheckingImage(false);
      }
    };
    
    const timeout = setTimeout(checkImage, 1000);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [url, language]);

  return { isCheckingImage, moderationError };
}

export default function App() {
  const { 
    connect, connected, nations, alliances, unions, myNation, requestSpawn, spawnStatus, spawnMessage,
    pendingRequests, approveSpawn, rejectSpawn, setupPhase, setSetupPhase,
    draftTerritories, setDraftTerritories, chatMessages, sendChatMessage,
    selectedNationId, setSelectedNationId, createAlliance, requestJoinAlliance, leaveAlliance,
    news, allianceRequests, allianceChats, approveAllianceJoin, rejectAllianceJoin, sendAllianceChatMessage,
    unSessions, createUNSession, voteUNSession, updateNation, disbandNation, publishNews,
    wars, finishedWars, declareWar, joinWar, proposePeaceTreaty, agreePeaceTreaty, rejectPeaceTreaty, placeBattle, startBattle, paintBattleResult,
    colonizationBattles, placeColonizationBattle, startColonizationBattle, paintColonizationResult, wikiNations, updateWikiDescription, updateWikiEventArticle
  } = useGameStore();

  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'ru');
  const t = (key: keyof typeof translations.ru) => translations[language]?.[key] || translations.en[key] || key;

  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [isGeneratingNationArticle, setIsGeneratingNationArticle] = useState(false);
  const [nationAiEditPrompt, setNationAiEditPrompt] = useState('');

  const [editingEventArticle, setEditingEventArticle] = useState<{ nationId: string, eventIndex: number } | null>(null);
  const [viewingEventArticle, setViewingEventArticle] = useState<{ nationId: string, eventIndex?: number, isNew?: boolean, isEditing?: boolean } | null>(null);
  const [eventArticleDraft, setEventArticleDraft] = useState({ title: '', text: '', infoboxKeys: [] as string[], infoboxValues: [] as string[], description: '', image: '' });
  const { isCheckingImage: isCheckingArticleImage, moderationError: articleModerationError } = useImageModeration(eventArticleDraft.image, language);

  const [addingCustomEventNationId, setAddingCustomEventNationId] = useState<string | null>(null);
  const [customEventDesc, setCustomEventDesc] = useState('');

  const generateNationArticleClientSide = (wiki: any, customPrompt: string) => {
     if (!wiki) return;
     setIsGeneratingNationArticle(true);
     
     const history = (wiki.events || []).map((e: any) => new Date(e.time).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ': ' + e.description).join('\n');
     
     let prompt = '';
     if (customPrompt) {
        prompt = language === 'ru' ?
         `Ты редактируешь Вики-статью о государстве "${wiki.name}".
         Текущий текст: "${descriptionDraft || 'Отсутствует'}"
         Просьба пользователя: "${customPrompt}"
         
         История для контекста (если пригодится):
         ${history.substring(0, 500)} // обрезано
         
         Верни ТОЛЬКО новый текст статьи.`
         :
         `You are editing the Wiki article for the nation "${wiki.name}".
         Current text: "${descriptionDraft || 'None'}"
         User's request: "${customPrompt}"
         
         History context (if needed):
         ${history.substring(0, 500)}
         
         Return ONLY the updated article text.`;
     } else {
        prompt = language === 'ru' ?
         `Напиши интересную Вики-статью о великом (или не очень) государстве под названием "${wiki.name}".
         Сделай акцент на его истории. Объем - 2 абзаца.
         
         Краткая хроника:
         ${history}
         `
         :
         `Write an interesting Wikipedia style article about the nation "${wiki.name}".
         Focus on its history. Length - 2 paragraphs.
         
         Short timeline:
         ${history}
         `;
     }

     ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
     }).then(result => {
        setDescriptionDraft(result.text);
     }).catch(e => {
        console.error('Failed to generate nation article:', e);
     }).finally(() => {
        setIsGeneratingNationArticle(false);
     });
  };

  const [editingWarNarrativeId, setEditingWarNarrativeId] = useState<string|null>(null);
  const [warNarrativeDraft, setWarNarrativeDraft] = useState('');
  const [aiEditPrompt, setAiEditPrompt] = useState('');

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
  const [ideology, setIdeology] = useState('');
  const [description, setDescription] = useState('');
  const [targetNationId, setTargetNationId] = useState('');
  const [status, setStatus] = useState(DEPENDENCY_STATUSES[0]);
  const [color, setColor] = useState('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
  
  const [flagType, setFlagType] = useState('preset');
  const [flagUrl, setFlagUrl] = useState(`https://flagcdn.com/w160/un.png`);
  const { isCheckingImage: isCheckingFlagUrl, moderationError: flagUrlError } = useImageModeration(flagUrl, language);
  const [flagSearch, setFlagSearch] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Wiki State
  const [showWiki, setShowWiki] = useState(false);
  const [selectedWikiNationId, setSelectedWikiNationId] = useState<string | null>(null);
  const [selectedWikiWarId, setSelectedWikiWarId] = useState<string | null>(null);
  const [wikiTab, setWikiTab] = useState<'nations'|'wars'>('nations');

  // Alliances UI State
  const [showAlliances, setShowAlliances] = useState(false);
  const [allianceView, setAllianceView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedAllianceId, setSelectedAllianceId] = useState<string | null>(null);
  
  const [newAllianceName, setNewAllianceName] = useState('');
  const [newAllianceType, setNewAllianceType] = useState(ALLIANCE_TYPES[0]);
  const [newAllianceDesc, setNewAllianceDesc] = useState('');
  const [newAllianceFlag, setNewAllianceFlag] = useState('');
  const { isCheckingImage: isCheckingNewAllianceFlag, moderationError: newAllianceFlagError } = useImageModeration(newAllianceFlag, language);
  const [allianceChatInput, setAllianceChatInput] = useState('');

  // Edit Alliance State
  const [showAllianceSettings, setShowAllianceSettings] = useState(false);
  const [editAllianceName, setEditAllianceName] = useState('');
  const [editAllianceDesc, setEditAllianceDesc] = useState('');
  const [editAllianceFlag, setEditAllianceFlag] = useState('');
  const { isCheckingImage: isCheckingEditAllianceFlag, moderationError: editAllianceFlagError } = useImageModeration(editAllianceFlag, language);

  // News UI State
  const [showNews, setShowNews] = useState(false);
  
  // City State
  const [selectedTerritoryIdx, setSelectedTerritoryIdx] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ nationId: string, cityId: string } | null>(null);
  const [newCityName, setNewCityName] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);

  // UN State
  const [showUN, setShowUN] = useState(false);
  const [unTopic, setUnTopic] = useState('');

  // Wars State
  const [showWars, setShowWars] = useState(false);
  const [warView, setWarView] = useState<'list' | 'declare' | 'details' | 'finished'>('list');
  const [selectedWarId, setSelectedWarId] = useState<string | null>(null);
  const [warTargetId, setWarTargetId] = useState('');
  const [warReason, setWarReason] = useState('');
  
  // Nation Info Tab
  const [nationInfoTab, setNationInfoTab] = useState<'info' | 'lore' | 'politics' | 'economy'>('info');
  
  // Battle State
  const [placingBattle, setPlacingBattle] = useState<string | null>(null); // warId
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [isPaintingMode, setIsPaintingMode] = useState(false);
  const [isRollMode, setIsRollMode] = useState(false);
  const [isCityMode, setIsCityMode] = useState(false);
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
  const { isCheckingImage: isCheckingNewUnionFlag, moderationError: newUnionFlagError } = useImageModeration(newUnionFlag, language);
  const [selectedUnionId, setSelectedUnionId] = useState<string | null>(null);

  // Chat Tab State
  const [chatTab, setChatTab] = useState<'global' | 'alliance'>('global');

  // Nation Settings State
  const [showNationSettings, setShowNationSettings] = useState(false);
  const [nationSettingsTab, setNationSettingsTab] = useState<'general' | 'economy' | 'politics'>('general');
  const [editNationName, setEditNationName] = useState('');
  const [editNationShortName, setEditNationShortName] = useState('');
  const [editNationIdeology, setEditNationIdeology] = useState('');
  const [editNationColor, setEditNationColor] = useState('#ffffff');
  const [editNationFlag, setEditNationFlag] = useState('');
  const { isCheckingImage: isCheckingEditNationFlag, moderationError: editNationFlagError } = useImageModeration(editNationFlag, language);
  const [editNationDescription, setEditNationDescription] = useState('');
  const [editNationParties, setEditNationParties] = useState<any[]>([]);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyColor, setNewPartyColor] = useState('#ff0000');
  const [newPartyIdeology, setNewPartyIdeology] = useState('');
  const [newPartyLeader, setNewPartyLeader] = useState('');
  const [newPartyPercentage, setNewPartyPercentage] = useState<number>(10);
  const [confirmDisband, setConfirmDisband] = useState(false);

  // Union Settings State
  const [showUnionSettings, setShowUnionSettings] = useState(false);
  const [editUnionName, setEditUnionName] = useState('');
  const [editUnionColor, setEditUnionColor] = useState('#ffffff');
  const [editUnionFlag, setEditUnionFlag] = useState('');
  const { isCheckingImage: isCheckingEditUnionFlag, moderationError: editUnionFlagError } = useImageModeration(editUnionFlag, language);

  // Mail State
  const [showMail, setShowMail] = useState(false);
  const [selectedMailChatId, setSelectedMailChatId] = useState<string | null>(null);
  const [newMailChatTab, setNewMailChatTab] = useState<'chats' | 'new'>('chats');
  const [mailTo, setMailTo] = useState('');
  const [mailAmount, setMailAmount] = useState(0);
  const [mailMessage, setMailMessage] = useState('');
  const [attachType, setAttachType] = useState<'none' | 'transfer' | 'treaty'>('none');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [editChatTitle, setEditChatTitle] = useState('');
  const [isRenamingChat, setIsRenamingChat] = useState(false);
  const [transferTarget, setTransferTarget] = useState('all');
  const [showTreatyDraft, setShowTreatyDraft] = useState(false);
  const [treatyDraftTitle, setTreatyDraftTitle] = useState('');
  const [treatyDraftContent, setTreatyDraftContent] = useState('');
  const [treatyDraftSigners, setTreatyDraftSigners] = useState<string[]>([]);

  // Reset edit title when chat changes
  useEffect(() => {
    const chat = useGameStore.getState().mailChats.find(c => c.id === selectedMailChatId);
    if (chat) {
      setEditChatTitle(chat.title || '');
      setIsRenamingChat(false);
      setAttachType('none');
      setShowAttachMenu(false);
      setMailAmount(0);
      setTransferTarget('all');
    }
  }, [selectedMailChatId]);
  
  const attachAmount = mailAmount;
  const setAttachAmount = setMailAmount;

  // Toast State
  const [toast, setToast] = useState<string | null>(null);
  
  const [newsInput, setNewsInput] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => { localStorage.setItem('lang', language); }, [language]);
  
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
        setToast(language === 'ru' ? 'Заявка отправлена!' : 'Request sent!');
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
    requestSpawn({ name, shortName, ideology, description, targetNationId, status, color, territories: draftTerritories, flag: flagUrl });
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
        // Painting battle result
        const war = wars.find(w => w.battles.some(b => b.id === activeBattleId));
        if (war) {
          const battle = war.battles.find(b => b.id === activeBattleId);
          if (battle && battle.status === 'finished' && battle.winnerId === myDiplomaticEntity.id && battle.pixelsToPaint && battle.pixelsToPaint > 0) {
            // Send painted pixels to server
            // To avoid sending too many requests, we could batch them, but for simplicity we'll send them directly if they are not already owned by us
            const validIndices = newIndices.filter(idx => {
              const currentOwner = nations.find(n => n.territories.includes(idx));
              const currentOwnerEntity = currentOwner ? (unions.find(u => u.members.includes(currentOwner.id))?.id || currentOwner.id) : null;
              
              const currentOccupier = nations.find(n => n.occupations?.includes(idx));
              const currentOccupierEntity = currentOccupier ? (unions.find(u => u.members.includes(currentOccupier.id))?.id || currentOccupier.id) : null;

              const loserId = battle.winnerId === battle.attackerId ? battle.defenderId : battle.attackerId;
              
              if (currentOccupierEntity === battle.winnerId) return false;
              
              return currentOwnerEntity === loserId || currentOccupierEntity === loserId;
            });
            
            if (validIndices.length > 0) {
              setPendingPaints(prev => {
                const currentSet = new Set(prev);
                let added = false;
                for (const idx of validIndices) {
                  if (currentSet.size >= battle.pixelsToPaint) break;
                  if (!currentSet.has(idx)) {
                    currentSet.add(idx);
                    added = true;
                  }
                }
                return added ? Array.from(currentSet) : prev;
              });
            }
          }
        } else {
          // Check if it's a colonization battle
          const colBattle = colonizationBattles.find(b => b.id === activeBattleId);
          if (colBattle && colBattle.status === 'finished' && colBattle.winnerId === myDiplomaticEntity.id && colBattle.pixelsToPaint && colBattle.pixelsToPaint > 0) {
            const validIndices = newIndices.filter(idx => {
              const currentOwner = nations.find(n => n.territories.includes(idx));
              const currentOccupier = nations.find(n => n.occupations?.includes(idx));
              return !currentOwner && !currentOccupier;
            });
            
            if (validIndices.length > 0) {
              setPendingPaints(prev => {
                const currentSet = new Set(prev);
                let added = false;
                for (const idx of validIndices) {
                  if (currentSet.size >= colBattle.pixelsToPaint) break;
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

            if (currentOccupierEntity === myDiplomaticEntity.id) return false;

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
    if (setupPhase === 'draw' || isPaintingMode) {
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
      
      const ownerEntityId = owner ? (unions.find(u => u.members.includes(owner.id))?.id || owner.id) : null;
      const occupierEntityId = occupier ? (unions.find(u => u.members.includes(occupier.id))?.id || occupier.id) : null;

      let battlePlaced = false;

      if (!owner && !occupier && landGrid && landGrid[idx] === 1) {
        placeColonizationBattle(x, y);
        battlePlaced = true;
      } else {
        const myWars = wars.filter(w => w.status === 'active' && (w.attackers.includes(myDiplomaticEntity.id) || w.defenders.includes(myDiplomaticEntity.id)));
        for (const war of myWars) {
           const isAttacker = war.attackers.includes(myDiplomaticEntity.id);
           const enemies = isAttacker ? war.defenders : war.attackers;
           let targetEnemy = null;
           
           if (ownerEntityId && enemies.includes(ownerEntityId)) {
             targetEnemy = ownerEntityId;
           } else if (occupierEntityId && enemies.includes(occupierEntityId)) {
             targetEnemy = occupierEntityId;
           }
           
           if (targetEnemy) {
             placeBattle(war.id, x, y, targetEnemy);
             battlePlaced = true;
             break;
           }
        }
      }

      if (battlePlaced) {
        setIsRollMode(false);
      }
    } else if (isCityMode && myNation) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const x = Math.floor((point.x - stage.x()) / stage.scaleX());
      const y = Math.floor((point.y - stage.y()) / stage.scaleY());
      const idx = y * gridSize.w + x;
      
      if (myNation.territories.includes(idx)) {
        setSelectedTerritoryIdx(idx);
        setShowCityModal(true);
        setIsCityMode(false);
      }
    } else {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const x = Math.floor((point.x - stage.x()) / stage.scaleX());
      const y = Math.floor((point.y - stage.y()) / stage.scaleY());
      const idx = y * gridSize.w + x;
      
      const clickedNation = nations.find(n => n.territories.includes(idx));
      if (clickedNation) {
        // Check if there is a city on this territory
        const clickedCity = clickedNation.cities?.find(c => c.territoryIdx === idx);
        if (clickedCity) {
          setSelectedCity({ nationId: clickedNation.id, cityId: clickedCity.id });
        } else {
          setSelectedCity(null);
        }

        if (myNation && clickedNation.id === myNation.id) {
          setSelectedTerritoryIdx(idx);
        } else {
          setSelectedTerritoryIdx(null);
        }
        
        const union = unions.find(u => u.members.includes(clickedNation.id));
        if (union) {
          setSelectedNationId(union.id);
        } else {
          setSelectedNationId(clickedNation.id);
        }
        setNationInfoTab('info');
      } else {
        setSelectedNationId(null);
        setSelectedTerritoryIdx(null);
        setSelectedCity(null);
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
        if (myNation && clickedNation.id === myNation.id) {
          setSelectedTerritoryIdx(idx);
        } else {
          setSelectedTerritoryIdx(null);
        }
        setSelectedNationId(clickedNation.id);
      }
    }
  };

  const handlePointerMove = (e: any) => {
    if (isPainting && (setupPhase === 'draw' || isPaintingMode)) {
      paintCell(e);
    }
  };

  const handlePointerUp = () => {
    setIsPainting(false);
    if (pendingPaints.length > 0 && myDiplomaticEntity) {
      if (activeBattleId) {
        const war = wars.find(w => w.battles.some(b => b.id === activeBattleId));
        if (war) {
          paintBattleResult(war.id, activeBattleId, pendingPaints);
        } else {
          const colBattle = colonizationBattles.find(b => b.id === activeBattleId);
          if (colBattle) {
            paintColonizationResult(colBattle.id, pendingPaints);
          }
        }
      } else if (isPaintingMode) {
        socket?.emit('captureLands', { indices: pendingPaints });
      }
      setPendingPaints([]);
    }
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
          draggable={!(setupPhase === 'draw' || isPaintingMode)}
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

                  // Draw Occupations
                  nations.forEach(nation => {
                    if (!nation.occupations || nation.occupations.length === 0) return;
                    const union = unions.find(u => u.members.includes(nation.id));
                    const baseColor = union ? union.color : nation.color;
                    
                    // Lighten the color
                    const r = parseInt(baseColor.slice(1, 3), 16);
                    const g = parseInt(baseColor.slice(3, 5), 16);
                    const b = parseInt(baseColor.slice(5, 7), 16);
                    const lightColor = `rgba(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)}, 0.8)`;
                    const darkColor = `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)}, 0.8)`;

                    context.beginPath();
                    context.fillStyle = lightColor;
                    nation.occupations.forEach(idx => {
                      const x = idx % gridSize.w;
                      const y = Math.floor(idx / gridSize.w);
                      context.rect(x, y, 1, 1);
                    });
                    context.fill();

                    // Draw dark diagonals
                    context.beginPath();
                    context.fillStyle = darkColor;
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

            {/* Render Cities */}
            {gridSize.w > 0 && nations.map(nation => {
              if (!nation.cities) return null;
              return nation.cities.map(city => {
                const cx = city.territoryIdx % gridSize.w;
                const cy = Math.floor(city.territoryIdx / gridSize.w);
                return (
                  <Group key={city.id} x={cx} y={cy}>
                    <Circle radius={0.8} fill="#ffffff" shadowColor="black" shadowBlur={0.5} />
                    <Circle radius={0.3} fill="#000000" />
                    <Text
                      x={1.5}
                      y={-1.5}
                      text={city.name}
                      fill="#ffffff"
                      fontSize={3}
                      fontFamily="Inter, sans-serif"
                      fontStyle="bold"
                      shadowColor="black"
                      shadowBlur={1}
                    />
                  </Group>
                );
              });
            })}

            {/* Battle Markers */}
            {[...wars.flatMap(w => w.battles.map(b => ({ ...b, warId: w.id }))), ...colonizationBattles.map(b => ({ ...b, warId: 'colonization' }))].filter(b => b.status !== 'finished' || (b.pixelsToPaint && b.pixelsToPaint > 0)).map(battle => {
              const attacker = unions.find(u => u.id === battle.attackerId) || nations.find(n => n.id === battle.attackerId);
              const defender = battle.defenderId === 'nature' ? { name: language === 'ru' ? 'Природа' : 'Nature', shortName: language === 'ru' ? 'Природа' : 'Nature' } : (unions.find(u => u.id === battle.defenderId) || nations.find(n => n.id === battle.defenderId));
              const attName = attacker ? ('shortName' in attacker ? attacker.shortName : attacker.name) : language === 'ru' ? 'Атакующий' : 'Attacker';
              const defName = defender ? ('shortName' in defender ? defender.shortName : defender.name) : language === 'ru' ? 'Защитник' : 'Defender';
              
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

              const setPointer = (e: any) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'pointer';
              };
              const resetPointer = (e: any) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'default';
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
                    text={battle.warId === 'colonization' ? language === 'ru' ? 'Колонизация' : 'Colonization' : (language === 'ru' ? 'Битва' : 'Battle')} 
                    fill="#aaa" width={160 / scale} x={-80 / scale} align="center" y={-40 / scale} fontSize={10 / scale} fontStyle="bold" 
                  />

                  {/* Attacker */}
                  <Group 
                    x={-70 / scale} y={-15 / scale} 
                    onClick={handleAttackerClick} onTap={handleAttackerClick}
                    onMouseEnter={(battle.status === 'pending' && isAttacker) ? setPointer : undefined}
                    onMouseLeave={(battle.status === 'pending' && isAttacker) ? resetPointer : undefined}
                  >
                    <Text text={attName} fill="white" width={60 / scale} align="center" y={-8 / scale} fontSize={10 / scale} fontStyle="bold" />
                    <Rect 
                      y={8 / scale}
                      width={60 / scale} height={35 / scale} 
                      fill={battle.status === 'finished' ? (battle.winnerId === battle.attackerId ? "#22c55e" : "#4b5563") : (isAttackerReady ? "#eab308" : "#ef4444")} 
                      cornerRadius={6 / scale} 
                      shadowColor="black" shadowBlur={4 / scale} shadowOpacity={0.3} shadowOffsetY={2 / scale}
                    />
                    <Text 
                      text={battle.status === 'finished' ? String(battle.attackerRoll) : (isAttackerReady ? language === 'ru' ? 'ГОТОВ' : 'READY' : (language === 'ru' ? 'НАЧАТЬ' : 'START'))} 
                      fill="white" width={60 / scale} align="center" y={20 / scale} fontSize={11 / scale} fontStyle="bold" 
                    />
                  </Group>

                  {/* VS Badge */}
                  <Circle x={0} y={10 / scale} radius={12 / scale} fill="#3b82f6" shadowColor="black" shadowBlur={4 / scale} shadowOpacity={0.4} />
                  <Text text="VS" fill="white" x={-10 / scale} y={5 / scale} width={20 / scale} align="center" fontSize={10 / scale} fontStyle="bold" />

                  {/* Defender */}
                  <Group 
                    x={10 / scale} y={-15 / scale} 
                    onClick={handleDefenderClick} onTap={handleDefenderClick}
                    onMouseEnter={(battle.status === 'pending' && isDefender) ? setPointer : undefined}
                    onMouseLeave={(battle.status === 'pending' && isDefender) ? resetPointer : undefined}
                  >
                    <Text text={defName} fill="white" width={60 / scale} align="center" y={-8 / scale} fontSize={10 / scale} fontStyle="bold" />
                    <Rect 
                      y={8 / scale}
                      width={60 / scale} height={35 / scale} 
                      fill={battle.status === 'finished' ? (battle.winnerId === battle.defenderId ? "#22c55e" : "#4b5563") : (isDefenderReady ? "#eab308" : "#3b82f6")} 
                      cornerRadius={6 / scale} 
                      shadowColor="black" shadowBlur={4 / scale} shadowOpacity={0.3} shadowOffsetY={2 / scale}
                    />
                    <Text 
                      text={battle.status === 'finished' ? String(battle.defenderRoll) : (isDefenderReady ? language === 'ru' ? 'ГОТОВ' : 'READY' : (language === 'ru' ? 'НАЧАТЬ' : 'START'))} 
                      fill="white" width={60 / scale} align="center" y={20 / scale} fontSize={11 / scale} fontStyle="bold" 
                    />
                  </Group>

                  {/* Result Text */}
                  {battle.status === 'finished' && (
                    <Text 
                      text={battle.winnerId === 'draw' ? language === 'ru' ? 'Ничья' : 'Draw' : (battle.winnerId === battle.attackerId ? `${language === 'ru' ? 'Победа:' : 'Victory:'} ${attName}` : `${language === 'ru' ? 'Победа:' : 'Victory:'} ${defName}`)} 
                      fill={battle.winnerId === 'draw' ? '#facc15' : '#4ade80'} 
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
                onClick={() => { setShowWiki(!showWiki); setShowAlliances(false); setShowUN(false); setShowUnions(false); setShowNationSettings(false); setShowWars(false); setShowMail(false); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showWiki ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Book className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Wiki</span>
              </button>

              <button 
                onClick={() => { setShowAlliances(!showAlliances); setShowWiki(false); setShowUN(false); setShowUnions(false); setShowNationSettings(false); setShowWars(false); setShowMail(false); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showAlliances ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Globe className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-sm">Alliances</span>
                {myDiplomaticEntity && myDiplomaticEntity.isFounder && allianceRequests.some(r => r.allianceId && alliances.find(a => a.id === r.allianceId)?.founderId === myDiplomaticEntity.id) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                )}
              </button>

              <button 
                onClick={() => { setShowUN(!showUN); setShowAlliances(false); setShowUnions(false); setShowNationSettings(false); setShowWars(false); setShowMail(false); }}
                className={`bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showUN ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Landmark className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">UN</span>
              </button>

              <button 
                onClick={() => { setShowUnions(!showUnions); setShowAlliances(false); setShowUN(false); setShowNationSettings(false); setShowWars(false); setShowMail(false); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showUnions ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-bold text-sm">Unions</span>
                {myNation && allianceRequests.some(r => r.unionId && unions.find(u => u.id === r.unionId)?.founderId === myNation.id) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                )}
              </button>

              <button 
                onClick={() => { setShowWars(!showWars); setShowAlliances(false); setShowUN(false); setShowUnions(false); setShowNationSettings(false); setShowMail(false); }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showWars ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Swords className="w-5 h-5 text-red-400" />
                <span className="font-bold text-sm">Wars</span>
                {wars.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black text-[9px] flex items-center justify-center font-bold">{wars.length}</span>
                )}
              </button>

              <button 
                onClick={() => {
                  setShowMail(!showMail);
                  setShowSettings(false);
                  setShowAlliances(false);
                  setShowWars(false);
                  setShowUN(false);
                  setShowUnions(false);
                  setShowNationSettings(false);
                }}
                className={`bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${showMail ? 'bg-gray-700/80' : 'hover:bg-gray-800/80'}`}
              >
                <Mail className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">{language === 'ru' ? 'Почта' : 'Mail'}</span>
              </button>

              <button 
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowMail(false);
                  setShowAlliances(false);
                  setShowWars(false);
                  setShowUN(false);
                  setShowUnions(false);
                  setShowNationSettings(false);
                }}
                className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl pointer-events-auto flex items-center justify-center gap-2 transition-colors shadow-lg ${showSettings ? 'bg-gray-500/50 hover:bg-gray-500/70' : 'hover:bg-gray-800/80'}`}
                title={t('settings')}
              >
                <Settings className={`w-5 h-5 ${showSettings ? 'text-white' : 'text-gray-400'}`} /> 
              </button>

              {(activeBattleId || proposingPeace) && (
                <button 
                  onClick={() => {
                    setIsPaintingMode(!isPaintingMode);
                    if (!isPaintingMode) {
                      setIsRollMode(false);
                      setIsCityMode(false);
                      setPlacingBattle(null);
                    }
                  }} 
                  className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg pointer-events-auto flex items-center gap-2 transition-colors shadow-lg ${isPaintingMode ? 'bg-green-500/50 hover:bg-green-500/70' : 'hover:bg-gray-800/80'}`}
                >
                  <Crosshair className={`w-5 h-5 ${isPaintingMode ? 'text-white' : 'text-green-400'}`} /> 
                  <span className="font-bold text-sm">{isPaintingMode ? 'Paint Mode' : 'Move Map'}</span>
                </button>
              )}
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
                    {newsCooldown > 0 ? `${newsCooldown}s` : t('send')}
                  </button>
                </form>
              )}
            </div>
          </div>

          {myNation && (
            <button 
              onClick={() => {
                setNationSettingsTab('general');
                setEditNationName(myNation.name || '');
                setEditNationShortName(myNation.shortName || '');
                setEditNationIdeology(myNation.ideology || '');
                setEditNationColor(myNation.color || '#ffffff');
                setEditNationFlag(myNation.flag || '');
                setEditNationDescription(myNation.description || '');
                setEditNationParties(myNation.parties || []);
                setShowMail(false);
                setShowNationSettings(true);
                setShowAlliances(false);
                setShowUN(false);
                setShowUnions(false);
                setShowWars(false);
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

        {/* We will render Mail Fullscreen later in index root */}

        {/* Nation Settings Panel */}
        {showNationSettings && myNation && (
          <div className="absolute top-20 right-4 w-[400px] max-h-[calc(100vh-140px)] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> {t('nationSettings')}</h2>
              <button onClick={() => setShowNationSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex border-b border-white/10">
              <button 
                onClick={() => setNationSettingsTab('general')} 
                className={`flex-1 py-2 text-sm font-medium transition-colors ${nationSettingsTab === 'general' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {t('tabSettingsGeneral')}
              </button>
              <button 
                onClick={() => setNationSettingsTab('economy')} 
                className={`flex-1 py-2 text-sm font-medium transition-colors ${nationSettingsTab === 'economy' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {t('tabSettingsEconomy')}
              </button>
              <button 
                onClick={() => setNationSettingsTab('politics')} 
                className={`flex-1 py-2 text-sm font-medium transition-colors ${nationSettingsTab === 'politics' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {t('tabSettingsPolitics')}
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {nationSettingsTab === 'general' ? (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('fullName')}</label>
                    <input type="text" value={editNationName} onChange={e => setEditNationName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('shortName')}</label>
                    <input type="text" value={editNationShortName} onChange={e => setEditNationShortName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('ideology')}</label>
                    <input 
                      type="text"
                      value={editNationIdeology} 
                      onChange={e => setEditNationIdeology(e.target.value)} 
                      placeholder={t('ideology')}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('loreDesc')}</label>
                    <textarea 
                      value={editNationDescription} 
                      onChange={e => setEditNationDescription(e.target.value)} 
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                      placeholder={t('lorePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('color')}</label>
                    <div className="flex gap-2">
                      <input type="color" value={editNationColor} onChange={e => setEditNationColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                      <input type="text" value={editNationColor} onChange={e => setEditNationColor(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('flag')}</label>
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
                    {editNationFlagError && <div className="text-xs text-center text-red-600 mt-2 py-2 border border-red-500 bg-red-50/10 rounded-sm font-bold">{editNationFlagError}</div>}
                    {isCheckingEditNationFlag && <div className="text-xs text-center text-gray-500 mt-2 py-2 border border-dashed border-gray-300/30">{language === 'ru' ? 'Модерация ИИ...' : 'AI Moderation...'}</div>}
                    {editNationFlag && !isCheckingEditNationFlag && !editNationFlagError && (
                      <div className="mt-2 flex justify-center">
                        <img src={editNationFlag} alt="Preview" className="h-16 w-auto object-contain rounded border border-white/20" />
                      </div>
                    )}
                  </div>
                </>
              ) : nationSettingsTab === 'economy' ? (
                <>
                  <div className="border border-white/10 p-3 rounded bg-black/20">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">{t('economy')}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                        <span className="text-gray-400 text-sm">{t('gdp')}:</span>
                        <div className="text-right">
                          <span className="font-bold text-green-400">${myNation.gdp?.toLocaleString() || 1000}</span>
                          {myNation.gdpChange !== undefined && (
                            <span className={`ml-2 text-xs ${myNation.gdpChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {myNation.gdpChange >= 0 ? '+' : ''}{myNation.gdpChange}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                        <span className="text-gray-400 text-sm">{language === 'ru' ? 'Бюджет' : 'Budget'}:</span>
                        <div className="text-right">
                          <span className="font-bold text-amber-400">${myNation.budget?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('economyState')}</label>
                        <select 
                          value={myNation.economyState || 'Стагнация'} 
                          onChange={e => useGameStore.getState().updateEconomyState(e.target.value)} 
                          disabled={!!myNation.economyLockedUntil && Date.now() < myNation.economyLockedUntil}
                          className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {['Депрессия', 'Рецессия', 'Стагнация', 'Рост', 'Экономический бум'].map(s => (
                            <option key={s} value={s}>{tMapEconomy(language, s)}</option>
                          ))}
                        </select>
                        {!!myNation.economyLockedUntil && Date.now() < myNation.economyLockedUntil && (
                          <p className="text-xs text-red-400 mt-1">{t('overheatLocked')}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs uppercase tracking-wider text-gray-400">{t('overheat')}</label>
                          <span className="text-xs font-bold text-red-400">{Math.round(myNation.overheat || 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-red-500 h-2 transition-all duration-500" style={{ width: `${Math.round(myNation.overheat || 0)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="border border-white/10 p-3 rounded bg-black/20">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">{t('parties')}</h3>
                    
                    {editNationParties.length > 0 && (
                      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                        {editNationParties.map((party, idx) => (
                          <div key={party.id || idx} className="flex flex-col bg-black/40 p-2 rounded border border-white/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: party.color }}></span>
                                <span className="font-bold text-sm text-white">{party.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{party.percentage}%</span>
                                <button 
                                  onClick={() => setEditNationParties(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="w-4 h-4"/>
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 px-5">
                              <span className="text-xs text-gray-400">{tMapIdeology(language, party.ideology)}</span>
                              {party.leader && <span className="text-xs text-gray-300 ml-2">{party.leader}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-black/30 p-2 rounded border border-white/5 space-y-2">
                      <div className="flex gap-2">
                        <div className="w-10">
                          <input type="color" value={newPartyColor} onChange={e => setNewPartyColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                        </div>
                        <input 
                          type="text" 
                          value={newPartyName} 
                          onChange={e => setNewPartyName(e.target.value)} 
                          placeholder={t('partyName')}
                          className="flex-1 bg-black/40 border border-white/10 rounded px-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                            <input 
                              type="text"
                              value={newPartyIdeology} 
                              onChange={e => setNewPartyIdeology(e.target.value)} 
                              placeholder={t('ideology')}
                              className="flex-1 bg-[#1a1a1a] border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <div className="w-16 flex items-center bg-black/40 border border-white/10 rounded px-1">
                              <input 
                                type="number" 
                                min="1" max="100" 
                                value={newPartyPercentage || ''} 
                                onChange={e => setNewPartyPercentage(Number(e.target.value))} 
                                className="w-full bg-transparent text-sm text-right focus:outline-none text-white"
                              />
                              <span className="text-xs text-gray-400 ml-1">%</span>
                            </div>
                      </div>
                      <input 
                        type="text" 
                        value={newPartyLeader} 
                        onChange={e => setNewPartyLeader(e.target.value)} 
                        placeholder={t('leaderOptional')}
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                      />
                      
                      <button 
                        onClick={() => {
                          if (!newPartyName.trim() || newPartyPercentage <= 0) return;
                          const totalPercentage = editNationParties.reduce((sum, p) => sum + p.percentage, 0);
                          const remaining = 100 - totalPercentage;
                          const actualPercentage = Math.min(newPartyPercentage, remaining);
                          
                          if (actualPercentage > 0) {
                            setEditNationParties(prev => [...prev, {
                              id: Math.random().toString(36).substring(7),
                              name: newPartyName,
                              color: newPartyColor,
                              ideology: newPartyIdeology,
                              leader: newPartyLeader,
                              percentage: actualPercentage
                            }]);
                            setNewPartyName('');
                            setNewPartyLeader('');
                            setNewPartyPercentage(Math.min(10, remaining - actualPercentage || 10)); // default next
                          } else {
                            alert(language === 'ru' ? 'Сумма процентов не может превышать 100%' : 'Total percentage cannot exceed 100%');
                          }
                        }}
                        className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 text-xs font-bold py-1.5 rounded border border-emerald-500/30 transition-colors"
                      >
                        + {t('addParty')}
                      </button>
                      <div className="text-right text-xs text-gray-500">
                        {t('total')}: {editNationParties.reduce((sum, p) => sum + p.percentage, 0)}%
                        <span className="text-gray-600 block leading-tight mt-0.5">{language === 'ru' ? 'Оставшийся % будет независимым' : 'Remaining % will be unaligned'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <button 
                  onClick={() => {
                    useGameStore.getState().updateNation({
                      name: editNationName,
                      shortName: editNationShortName,
                      ideology: editNationIdeology,
                      color: editNationColor,
                      flag: editNationFlag,
                      description: editNationDescription,
                      parties: editNationParties
                    });
                    setShowNationSettings(false);
                    setConfirmDisband(false);
                  }}
                  disabled={isCheckingEditNationFlag || !!editNationFlagError}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                  {t('saveChanges')}
                </button>
                
                {confirmDisband ? (
                  <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-center">
                    <p className="text-sm text-red-200 mb-3">{t('disbandConfirm')}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          useGameStore.getState().disbandNation();
                          setShowNationSettings(false);
                          setConfirmDisband(false);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-2 rounded transition-colors"
                      >
                        {t('disbandNation')}
                      </button>
                      <button 
                        onClick={() => setConfirmDisband(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded transition-colors"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDisband(true)}
                    className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 font-bold py-2 px-4 rounded transition-colors mt-4"
                  >
                    {t('disbandNation')}
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
                        {war.status === 'finished' && (
                          <div className="flex justify-center mt-2">
                             <button 
                               onClick={() => {
                                 setShowWars(false); 
                                 setShowWiki(true); 
                                 setWikiTab('wars');
                                 setSelectedWikiWarId(war.id); 
                               }}
                               className="flex items-center gap-2 bg-[#f8f9fa] border border-[#a2a9b1] hover:bg-[#eaecf0] text-black px-3 py-1.5 rounded-sm text-xs font-sans transition-colors"
                             >
                               <Book className="w-3.5 h-3.5" />
                               {language === 'ru' ? 'Смотреть в Вики' : 'Read on Wiki'}
                             </button>
                          </div>
                        )}
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
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setPlacingBattle(war.id);
                              setIsPaintingMode(false);
                              setIsRollMode(false);
                              setIsCityMode(false);
                              setShowWars(false); // Hide UI to place battle
                            }}
                            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            Place Battle Marker
                          </button>
                          <button 
                            onClick={() => {
                              setProposingPeace(war.id);
                              setIsPaintingMode(true);
                              setIsRollMode(false);
                              setIsCityMode(false);
                              setPeaceClaims({});
                              setPeacePuppets({});
                              setShowWars(false); // Hide UI to paint claims
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            Propose Peace
                          </button>
                          <button 
                            onClick={() => {
                              proposePeaceTreaty(war.id, {}, {});
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            Status Quo
                          </button>
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

            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => {
                  proposePeaceTreaty(proposingPeace, peaceClaims, peacePuppets);
                  setProposingPeace(null);
                  setIsPaintingMode(false);
                  setPeaceClaims({});
                  setPeacePuppets({});
                }} 
                className="bg-white text-green-700 hover:bg-gray-100 px-4 py-1 rounded"
              >
                Submit Proposal
              </button>
              <button 
                onClick={() => {
                  proposePeaceTreaty(proposingPeace, {}, {});
                  setProposingPeace(null);
                  setIsPaintingMode(false);
                  setPeaceClaims({});
                  setPeacePuppets({});
                }} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded"
              >
                Status Quo
              </button>
              <button 
                onClick={() => {
                  setProposingPeace(null);
                  setIsPaintingMode(false);
                  setPeaceClaims({});
                  setPeacePuppets({});
                }} 
                className="bg-black/30 hover:bg-black/50 px-4 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Painting Battle Result Overlay */}
        {activeBattleId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg pointer-events-auto flex items-center gap-4">
            <span>
              Paint your won territories! 
              ({wars.flatMap(w => w.battles).find(b => b.id === activeBattleId)?.pixelsToPaint || colonizationBattles.find(b => b.id === activeBattleId)?.pixelsToPaint || 0} left)
            </span>
          </div>
        )}

        {/* Global Wiki */}
        {showWiki && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[80vh] bg-black/95 backdrop-blur-3xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2 font-serif"><Book className="w-5 h-5 text-indigo-400"/> {t('wiki')}</h2>
              <button onClick={() => setShowWiki(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex border-b border-white/10 bg-white/5">
              <button 
                onClick={() => { setWikiTab('nations'); setSelectedWikiWarId(null); setSelectedWikiNationId(null); }} 
                className={`flex-1 py-2 text-sm font-bold transition-colors border-r border-white/10 ${wikiTab === 'nations' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {language === 'ru' ? 'Нации' : 'Nations'}
              </button>
              <button 
                onClick={() => { setWikiTab('wars'); setSelectedWikiWarId(null); setSelectedWikiNationId(null); }} 
                className={`flex-1 py-2 text-sm font-bold transition-colors ${wikiTab === 'wars' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {language === 'ru' ? 'Войны' : 'Wars'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex p-4 bg-[#f8f9fa] text-gray-900 border-x border-gray-300">
              {wikiTab === 'nations' ? (
                !selectedWikiNationId && !viewingEventArticle ? (
                  <div className="w-full space-y-6">
                    <div className="bg-white border text-black border-gray-300 p-6 rounded-lg text-center font-serif shadow-sm">
                      <h1 className="text-3xl font-serif mb-2 text-black">{t('welcomeWiki')}</h1>
                      <p className="text-gray-600">{t('freeEncyclopedia')}</p>
                    </div>
                    <div>
                      <h2 className="text-xl font-serif border-b border-gray-300 pb-2 mb-4 text-black">{t('allHistoricalNations')}</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {[...wikiNations].sort((a, b) => (b.peakGdp || 0) - (a.peakGdp || 0)).map(nation => (
                          <div 
                            key={nation.id} 
                            onClick={() => setSelectedWikiNationId(nation.id)}
                            className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 p-3 rounded cursor-pointer transition-colors shadow-sm"
                          >
                            {nation.flag && <img src={nation.flag} alt="flag" className="w-10 h-6 object-cover border border-gray-200 shadow-sm" />}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold truncate text-[#0645ad] hover:underline">{nation.name}</h3>
                              <p className="text-xs text-gray-500">{nation.destroyedAt ? t('historical') : t('active')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : viewingEventArticle ? (
                <div className="flex w-full gap-6">
                  {(() => {
                    const eventNation = wikiNations.find(w => w.id === viewingEventArticle.nationId);
                    if (!eventNation) return <p>Nation not found.</p>;
                    const ev = viewingEventArticle.isNew ? {
                      timestamp: Date.now(),
                      description: language === 'ru' ? 'Новое событие' : 'New Event',
                      customWiki: { title: '', text: '', infobox: {}, image: '' },
                      customArticle: null
                    } : eventNation.events[viewingEventArticle.eventIndex!];
                    if (!ev) return <p>Event not found.</p>;
                    
                    if (viewingEventArticle.isEditing) {
                        return (
                          <div className="flex-1 flex flex-col w-full">
                            <button onClick={() => setViewingEventArticle(null)} className="self-start text-[#0645ad] hover:underline flex items-center gap-1 mb-4 text-sm font-sans">
                              <ArrowLeft className="w-4 h-4"/> {language === 'ru' ? 'Назад' : 'Back'}
                            </button>
                            <div className="flex gap-6 w-full">
                               <div className="flex-1 flex flex-col pr-4 border-r border-[#a2a9b1]">
                                  <div className="mb-4 p-4 bg-[#f8f9fa] border border-[#a2a9b1]">
                                    <div className="font-bold mb-2 flex justify-between items-center">
                                      <span>{language === 'ru' ? 'Сгенерировать статью с ИИ' : 'Generate article with AI'}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <textarea 
                                        value={nationAiEditPrompt}
                                        onChange={(e) => setNationAiEditPrompt(e.target.value)}
                                        placeholder={language === 'ru' ? 'Вкратце опишите событие, а ИИ полноценно оформит статью' : 'Briefly describe the event, and AI will format it into an article'}
                                        className="w-full border border-[#a2a9b1] p-2 text-sm min-h-[80px]"
                                        disabled={isGeneratingNationArticle}
                                      />
                                      <button 
                                        onClick={() => {
                                          setIsGeneratingNationArticle(true);
                                          const newsCtx = useGameStore.getState().news.map(n => `[${new Date(n.timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}] ${n.text}`).join('\n').substring(0, 5000);
                                          ai.models.generateContent({
                                             model: 'gemini-2.5-flash',
                                             contents: [
                                               language === 'ru' ?
                                               `Сгенерируй Вики-статью об историческом событии: "${viewingEventArticle.isNew ? eventArticleDraft.description : ev.description}".
                                               
                                               Используй ### для заголовков секций. НЕ используй ===.
                                               ВАЖНО: Обязательно напиши вводный абзац в самом начале текста статьи ДО первого заголовка ###. Текст должен сразу начинаться с описания события (что, где, когда).
                                               НЕ фантазируй о том, что было до основания государств, строго описывай само событие по промпту.
                                               Если событие прошло, напиши дату (или диапазон дат) в одной строке инфобокса под ключом "Дата" (не создавай два поля типа Начало/Конец).
                                               Если в событии имеются противоборствующие фракции (например, революционеры против правительства, или митинг), оформи это в инфобоксе по шаблону сторон: (Сторона 1, Сторона 2, Лидеры 1, Лидеры 2), но без терминов Защитники/Агрессоры.
                                               
                                               Пользовательский промпт (доп. детали): ${nationAiEditPrompt}
                                               Контекст мировых новостей:
                                               ${newsCtx}
                                               
                                               Верни ТОЛЬКО валидный JSON (без \`\`\`json):
                                               { "title": "...", "text": "...", "infobox": { "Ключ": "Значение" }, "image": "опционально ссылка на картинку" }` :
                                               `Generate Wiki article for: "${viewingEventArticle.isNew ? eventArticleDraft.description : ev.description}".
                                               
                                               Use ### for section headings. Do NOT use ===.
                                               IMPORTANT: You MUST write an introductory paragraph at the very beginning of the article text BEFORE the first ### heading. The text should immediately start with a summary of the event.
                                               Do NOT hallucinate history prior to the founding of nations unless requested in the prompt.
                                               If the event has ended, combine the start and end dates into a single "Date" field in the infobox.
                                               If there are opposing factions (e.g. revolutionaries vs government), use an infobox template grouping sides: (Side 1, Side 2, Leaders 1, Leaders 2) but do not use standard war terms like Defender/Aggressor.
                                               
                                               Prompt (user desc): ${nationAiEditPrompt}
                                               World news context:
                                               ${newsCtx}
                                               
                                               Return ONLY valid JSON (without \`\`\`json):
                                               { "title": "...", "text": "...", "infobox": { "Key": "Value" }, "image": "optional image url" }`
                                             ]
                                           }).then(res => {
                                              try {
                                                const txt = (res.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
                                                const parsed = JSON.parse(txt);
                                                setEventArticleDraft({
                                                  ...eventArticleDraft,
                                                  title: parsed.title || '',
                                                  text: parsed.text || '',
                                                  image: parsed.image || eventArticleDraft.image || '',
                                                  infoboxKeys: Object.keys(parsed.infobox || {}),
                                                  infoboxValues: Object.values(parsed.infobox || {}) as string[]
                                                });
                                              } catch (e) {
                                                console.error('Failed to parse AI response', e);
                                              }
                                              setNationAiEditPrompt('');
                                           }).finally(() => setIsGeneratingNationArticle(false));
                                        }}
                                        disabled={isGeneratingNationArticle || !nationAiEditPrompt.trim()}
                                        className="w-fit self-end px-4 py-2 bg-[#3366cc] text-white hover:bg-[#2a4b8d] font-bold text-sm disabled:opacity-50"
                                      >
                                        {isGeneratingNationArticle ? '...' : (language === 'ru' ? 'Сгенерировать' : 'Generate')}
                                      </button>
                                    </div>
                                  </div>

                                 {viewingEventArticle.isNew && (
                                    <div className="mb-4">
                                      <label className="block text-sm font-bold text-gray-700 mb-1">{language === 'ru' ? 'Краткое описание события в истории:' : 'Short event description for history tree:'}</label>
                                      <input 
                                        type="text" 
                                        value={eventArticleDraft.description || ''}
                                        onChange={(e) => setEventArticleDraft({ ...eventArticleDraft, description: e.target.value })}
                                        className="w-full border border-[#a2a9b1] p-2 font-sans"
                                      />
                                    </div>
                                 )}

                                 <input 
                                   value={eventArticleDraft.title || ''}
                                   onChange={(e) => setEventArticleDraft({ ...eventArticleDraft, title: e.target.value })}
                                   placeholder={language === 'ru' ? 'Заголовок статьи' : 'Article Title'}
                                   className="text-4xl font-serif border-b border-[#a2a9b1] pb-2 mb-4 text-black w-full outline-none bg-transparent"
                                 />
                                 <textarea 
                                   value={eventArticleDraft.text || ''}
                                   onChange={(e) => setEventArticleDraft({ ...eventArticleDraft, text: e.target.value })}
                                   className="flex-1 w-full min-h-[400px] border border-[#a2a9b1] p-4 font-sans text-base outline-none custom-scrollbar bg-white"
                                   placeholder={language === 'ru' ? 'Текст статьи (поддерживается Markdown). Вы можете ссылаться на страны как [Название](nation:id) и войны как [Название](war:id).' : 'Article text (Markdown supported). Link to nations with [Name](nation:id) and wars with [Name](war:id).'}
                                 />
                               </div>
                               
                               <div className="w-[300px] shrink-0 space-y-4 text-sm flex flex-col font-sans h-fit self-start">
                                 <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-3 text-gray-900 shadow-sm leading-[1.3]">
                                   <div className="font-bold text-center border-b border-[#a2a9b1] pb-2 mb-2">{language === 'ru' ? 'Главное изображение (Инфобокс)' : 'Main Image (Infobox)'}</div>
                                   <input 
                                     type="text"
                                     value={eventArticleDraft.image || ''}
                                     onChange={(e) => setEventArticleDraft({...eventArticleDraft, image: e.target.value})}
                                     placeholder={language === 'ru' ? 'URL картинки (http...)' : 'Image URL (http...)'}
                                     className="w-full border border-[#a2a9b1] p-1 text-xs mb-2"
                                   />
                                   {articleModerationError && <div className="text-xs text-center text-red-600 mb-2 py-2 border border-red-500 bg-red-50 rounded-sm font-bold">{articleModerationError}</div>}
                                   {isCheckingArticleImage && <div className="text-xs text-center text-gray-500 mb-2 py-2 border border-dashed border-gray-300">{language === 'ru' ? 'Модерация ИИ...' : 'AI Moderation...'}</div>}
                                   {eventArticleDraft.image && !isCheckingArticleImage && !articleModerationError && <img src={eventArticleDraft.image} className="w-full border border-[#a2a9b1] mt-1 mb-4" alt="" />}
                                   <div className="font-bold text-center border-b border-[#a2a9b1] pb-2 mb-2">{language === 'ru' ? 'Инфобокс' : 'Infobox'}</div>
                                   {eventArticleDraft.infoboxKeys.map((k, i) => (
                                     <div key={i} className="flex gap-2 mb-2 items-center">
                                       <input className="w-1/3 border border-[#a2a9b1] p-1 text-xs" value={k || ''} onChange={(e) => {
                                         const newK = [...eventArticleDraft.infoboxKeys]; newK[i] = e.target.value;
                                         setEventArticleDraft({ ...eventArticleDraft, infoboxKeys: newK });
                                       }} placeholder="Key" />
                                       <input className="flex-1 border border-[#a2a9b1] p-1 text-xs" value={eventArticleDraft.infoboxValues[i] || ''} onChange={(e) => {
                                         const newV = [...eventArticleDraft.infoboxValues]; newV[i] = e.target.value;
                                         setEventArticleDraft({ ...eventArticleDraft, infoboxValues: newV });
                                       }} placeholder="Value" />
                                       <button onClick={() => {
                                         const newK = [...eventArticleDraft.infoboxKeys]; newK.splice(i, 1);
                                         const newV = [...eventArticleDraft.infoboxValues]; newV.splice(i, 1);
                                         setEventArticleDraft({ ...eventArticleDraft, infoboxKeys: newK, infoboxValues: newV });
                                       }} className="text-red-500 font-bold ml-1">x</button>
                                     </div>
                                   ))}
                                   <button 
                                     onClick={() => setEventArticleDraft({ 
                                       ...eventArticleDraft, 
                                       infoboxKeys: [...eventArticleDraft.infoboxKeys, ''], 
                                       infoboxValues: [...eventArticleDraft.infoboxValues, ''] 
                                     })}
                                     className="w-full py-1 border border-[#a2a9b1] hover:bg-[#eaecf0] mt-2 font-bold text-xs"
                                   >+ {language === 'ru' ? 'Добавить поле' : 'Add field'}</button>
                                 </div>
                                 <button
                                   onClick={() => {
                                      const infoboxObj: Record<string,string> = {};
                                      eventArticleDraft.infoboxKeys.forEach((k, idx) => {
                                        if (k.trim()) infoboxObj[k.trim()] = eventArticleDraft.infoboxValues[idx];
                                      });
                                      const customWikiData = {
                                        title: eventArticleDraft.title,
                                        text: eventArticleDraft.text,
                                        infobox: infoboxObj,
                                        image: eventArticleDraft.image
                                      };
                                      if (viewingEventArticle.isNew) {
                                        useGameStore.getState().addCustomWikiEvent(viewingEventArticle.nationId, eventArticleDraft.description || (language === 'ru' ? 'Новое событие' : 'New Event'), customWikiData);
                                        setViewingEventArticle(null);
                                      } else {
                                        useGameStore.getState().updateWikiEventArticle(viewingEventArticle.nationId, viewingEventArticle.eventIndex!, eventArticleDraft.text, customWikiData);
                                        setViewingEventArticle({ ...viewingEventArticle, isEditing: false });
                                      }
                                   }}
                                   disabled={isCheckingArticleImage || !!articleModerationError}
                                   className="w-full py-2 bg-[#3366cc] text-white hover:bg-[#2a4b8d] font-bold text-sm shadow-sm disabled:opacity-50"
                                 >
                                   {language === 'ru' ? 'Сохранить статью' : 'Save Article'}
                                 </button>
                               </div>
                            </div>
                          </div>
                        );
                    }
                    
                    return (
                      <>
                        <div className="flex-1 flex flex-col pr-4 border-r border-[#a2a9b1]">
                          <button onClick={() => setViewingEventArticle(null)} className="self-start text-[#0645ad] hover:underline flex items-center gap-1 mb-4 text-sm font-sans">
                            <ArrowLeft className="w-4 h-4"/> {language === 'ru' ? 'Назад к государству' : 'Back to Nation'}
                          </button>
                          <h1 className="text-4xl font-serif border-b border-[#a2a9b1] pb-2 mb-4 text-black inline-flex items-center gap-3">
                            {ev.customWiki?.title || ev.description}
                          </h1>
                          <div className="prose prose-blue max-w-none text-gray-800 font-sans">
                            <div className="lead text-base">
                              <Markdown components={{
                                h1: ({node, ...props}: any) => <h1 className="text-3xl font-serif mt-6 mb-3 text-black border-b border-[#a2a9b1] pb-2" {...props} />,
                                h2: ({node, ...props}: any) => <h2 className="text-2xl font-serif mt-6 mb-3 text-black border-b border-[#a2a9b1] pb-2" {...props} />,
                                h3: ({node, ...props}: any) => <h3 className="text-xl font-serif mt-4 mb-2 text-black border-b border-[#a2a9b1] pb-1" {...props} />,
                                p: ({node, ...props}: any) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                                ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                strong: ({node, ...props}: any) => <strong className="font-bold text-black" {...props} />,
                                a: ({node, href, children, ...props}: any) => {
                                  if (href?.startsWith('nation:')) {
                                    return <span onClick={() => { setViewingEventArticle(null); setSelectedWikiNationId(href.split(':')[1]); }} className="text-[#0645ad] hover:underline cursor-pointer" {...props}>{children}</span>
                                  }
                                  if (href?.startsWith('war:')) {
                                    return <span onClick={() => { setViewingEventArticle(null); setSelectedWikiNationId(null); setSelectedWikiWarId(href.split(':')[1]); setWikiTab('wars'); }} className="text-[#0645ad] hover:underline cursor-pointer" {...props}>{children}</span>
                                  }
                                  return <a href={href} className="text-[#0645ad] hover:underline" {...props}>{children}</a>
                                }
                              }}>{ev.customWiki?.text || ev.customArticle || ev.description}</Markdown>
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-[300px] shrink-0 space-y-4 text-sm flex flex-col font-sans h-fit self-start">
                          <div className="bg-[#f8f9fa] border border-[#a2a9b1] text-gray-900 shadow-sm overflow-hidden text-[12px] leading-[1.3]">
                            <div className="bg-[#eaecf0] py-2 px-3 text-center border-b border-[#a2a9b1]">
                              <span className="font-bold text-base">{ev.customWiki?.title || ev.description}</span>
                            </div>
                            {ev.customWiki?.image && (
                              <div className="p-2 border-b border-[#a2a9b1] bg-white text-center">
                                <img src={ev.customWiki.image} alt="" className="w-full h-auto border border-[#a2a9b1] shadow-sm mb-1"/>
                              </div>
                            )}
                            <div className="p-2 border-b border-[#a2a9b1]">
                              {(!ev.customWiki?.infobox || !Object.keys(ev.customWiki.infobox).some(k => k.toLowerCase() === 'дата' || k.toLowerCase() === 'date')) && (
                                <div className="flex gap-2 border-b border-gray-200 last:border-0 py-1.5 break-words">
                                  <div className="font-bold w-[80px] shrink-0">{language === 'ru' ? 'Дата' : 'Date'}</div>
                                  <div className="flex-1 break-words">{new Date(ev.timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                </div>
                              )}
                              {(() => {
                                 const info = ev.customWiki?.infobox || {};
                                 let side1, side2, leaders1, leaders2, forces1, forces2, casualties1, casualties2;
                                 const normalKeys: [string, string][] = [];
                                 
                                 Object.entries(info).forEach(([k, v]) => {
                                    const kl = k.toLowerCase().trim();
                                    if (kl === 'сторона 1' || kl === 'side 1') side1 = v;
                                    else if (kl === 'сторона 2' || kl === 'side 2') side2 = v;
                                    else if (kl === 'лидеры 1' || kl === 'leaders 1') leaders1 = v;
                                    else if (kl === 'лидеры 2' || kl === 'leaders 2') leaders2 = v;
                                    else if (kl === 'силы 1' || kl === 'forces 1') forces1 = v;
                                    else if (kl === 'силы 2' || kl === 'forces 2') forces2 = v;
                                    else if (kl === 'потери 1' || kl === 'casualties 1') casualties1 = v;
                                    else if (kl === 'потери 2' || kl === 'casualties 2') casualties2 = v;
                                    else normalKeys.push([k, String(v)]);
                                 });
                                 
                                 return (
                                    <>
                                       {normalKeys.map(([k, v], idx) => (
                                          <div key={idx} className="flex gap-2 border-b border-gray-200 last:border-0 py-1.5 break-words">
                                             <div className="font-bold capitalize w-[80px] shrink-0">{k}</div>
                                             <div className="flex-1 break-words">{v}</div>
                                          </div>
                                       ))}
                                    </>
                                 );
                              })()}
                            </div>
                            {(() => {
                               const info = ev.customWiki?.infobox || {};
                               let side1, side2, leaders1, leaders2, forces1, forces2, casualties1, casualties2;
                               Object.entries(info).forEach(([k, v]) => {
                                  const kl = k.toLowerCase().trim();
                                  if (kl === 'сторона 1' || kl === 'side 1') side1 = v;
                                  else if (kl === 'сторона 2' || kl === 'side 2') side2 = v;
                                  else if (kl === 'лидеры 1' || kl === 'leaders 1') leaders1 = v;
                                  else if (kl === 'лидеры 2' || kl === 'leaders 2') leaders2 = v;
                                  else if (kl === 'силы 1' || kl === 'forces 1') forces1 = v;
                                  else if (kl === 'силы 2' || kl === 'forces 2') forces2 = v;
                                  else if (kl === 'потери 1' || kl === 'casualties 1') casualties1 = v;
                                  else if (kl === 'потери 2' || kl === 'casualties 2') casualties2 = v;
                               });
                               
                               const hasSides = side1 || side2;
                               const hasLeaders = leaders1 || leaders2;
                               const hasForces = forces1 || forces2;
                               const hasCasualties = casualties1 || casualties2;
                               
                               if (!hasSides && !hasLeaders && !hasForces && !hasCasualties) return null;
                               
                               return (
                                 <div className="border-b border-[#a2a9b1]">
                                    {hasSides && (
                                      <>
                                        <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-t border-[#a2a9b1] text-xs">{language === 'ru' ? 'Стороны' : 'Belligerents'}</div>
                                        <div className="flex border-b border-[#a2a9b1]">
                                           <div className="flex-1 p-2 border-r border-[#a2a9b1] break-words whitespace-pre-wrap">{String(side1 || '')}</div>
                                           <div className="flex-1 p-2 break-words whitespace-pre-wrap">{String(side2 || '')}</div>
                                        </div>
                                      </>
                                    )}
                                    {hasLeaders && (
                                      <>
                                        <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-[#a2a9b1] text-xs">{language === 'ru' ? 'Лидеры' : 'Leaders'}</div>
                                        <div className="flex border-b border-[#a2a9b1] text-xs">
                                           <div className="flex-1 p-2 border-r border-[#a2a9b1] break-words whitespace-pre-wrap">{String(leaders1 || '')}</div>
                                           <div className="flex-1 p-2 break-words whitespace-pre-wrap">{String(leaders2 || '')}</div>
                                        </div>
                                      </>
                                    )}
                                    {hasForces && (
                                      <>
                                        <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-[#a2a9b1] text-xs">{language === 'ru' ? 'Силы сторон' : 'Forces & Strength'}</div>
                                        <div className="flex border-b border-[#a2a9b1] text-xs text-center font-bold">
                                           <div className="flex-1 p-2 border-r border-[#a2a9b1] break-words whitespace-pre-wrap">{String(forces1 || '-')}</div>
                                           <div className="flex-1 p-2 break-words whitespace-pre-wrap">{String(forces2 || '-')}</div>
                                        </div>
                                      </>
                                    )}
                                    {hasCasualties && (
                                      <>
                                        <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-[#a2a9b1] text-xs">{language === 'ru' ? 'Потери' : 'Casualties'}</div>
                                        <div className="flex text-xs text-center text-red-800">
                                           <div className="flex-1 p-2 border-r border-[#a2a9b1] break-words whitespace-pre-wrap">{String(casualties1 || '-')}</div>
                                           <div className="flex-1 p-2 break-words whitespace-pre-wrap">{String(casualties2 || '-')}</div>
                                        </div>
                                      </>
                                    )}
                                 </div>
                               );
                            })()}
                            { (myDiplomaticEntity?.id === eventNation.id || myNation?.id === eventNation.id) && (
                              <div className="p-2 bg-white text-center">
                                 <button 
                                    onClick={() => {
                                       setEventArticleDraft({
                                         title: ev.customWiki?.title || ev.description || '',
                                         text: ev.customWiki?.text || ev.customArticle || '',
                                         description: ev.description || '',
                                         image: ev.customWiki?.image || '',
                                         infoboxKeys: Object.keys(ev.customWiki?.infobox || {}),
                                         infoboxValues: Object.values(ev.customWiki?.infobox || {}) as string[]
                                       });
                                       setViewingEventArticle({...viewingEventArticle, isEditing: true});
                                    }}
                                    className="w-full text-xs font-bold bg-[#f8f9fa] border border-[#a2a9b1] hover:bg-[#eaecf0] text-[#0645ad] px-3 py-2 rounded-sm font-sans flex items-center justify-center gap-2 shadow-sm"
                                 >
                                    {language === 'ru' ? 'Редактировать статью' : 'Edit Article'}
                                 </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                ) : (
                <div className="flex w-full gap-6">
                  {(() => {
                    const wiki = wikiNations.find(w => w.id === selectedWikiNationId);
                    if (!wiki) return <p>Nation not found.</p>;
                    return (
                      <>
                        <div className="flex-1 flex flex-col pr-4 border-r border-[#a2a9b1]">
                          <button onClick={() => setSelectedWikiNationId(null)} className="self-start text-[#0645ad] hover:underline flex items-center gap-1 mb-4 text-sm font-sans">
                            <ArrowLeft className="w-4 h-4"/> {t('backToMain')}
                          </button>
                          <h1 className="text-4xl font-serif border-b border-[#a2a9b1] pb-2 mb-4 text-black inline-flex items-center gap-3">
                            {wiki.name}
                            {wiki.destroyedAt && <span className="text-sm bg-[#eaecf0] text-gray-700 px-2 py-1 rounded border border-[#a2a9b1] align-middle font-sans">{t('defunct')}</span>}
                            {!wiki.destroyedAt && myNation?.id === wiki.id && (
                              <button
                                onClick={() => {
                                  setDescriptionDraft(wiki.customDescription || '');
                                  setEditingDescriptionId(wiki.id);
                                }}
                                className="ml-auto text-xs bg-[#f8f9fa] border border-[#a2a9b1] hover:bg-[#eaecf0] text-black px-2 py-1 rounded-sm font-sans"
                              >
                                {t('editArticle')}
                              </button>
                            )}
                          </h1>
                          <div className="prose prose-blue max-w-none text-gray-800 font-sans">
                            <p className="lead text-base whitespace-pre-wrap">
                              {wiki.customDescription ? wiki.customDescription : (
                                <>
                                  <span className="font-bold">{wiki.name}</span>{t('wikiDefaultDesc1')}<span className="font-bold text-gray-900">${wiki.peakGdp.toLocaleString()}M</span>
                                  {t('wikiDefaultDesc2')}{new Date(wiki.createdAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                                  {wiki.destroyedAt ? `${t('wikiDefaultDesc3')}${new Date(wiki.destroyedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}.` : t('wikiDefaultDesc4')}
                                </>
                              )}
                            </p>
                            
                            <h2 className="text-2xl font-serif mt-8 mb-4 border-b border-[#a2a9b1] pb-2 text-black">{t('history')}</h2>
                            <div className="relative border-l-2 border-[#a2a9b1] ml-3 pl-4 space-y-4">
                              {wiki.events.map((ev, i) => {
                                let desc = ev.description;
                                if (language === 'ru') {
                                  desc = desc.replace(/Nation (.*?) was established\./g, 'Государство $1 было основано.');
                                  desc = desc.replace(/Nation (.*?) was established as a territory of (.*?)\./g, 'Государство $1 было образовано на территории $2.');
                                  desc = desc.replace(/Formed the (.*?) alliance "(.*?)"\./g, 'Основан $1 альянс "$2".');
                                  desc = desc.replace(/Joined the (.*?) alliance "(.*?)"\./g, 'Вступление в $1 альянс "$2".');
                                  desc = desc.replace(/Left the (.*?) alliance "(.*?)"\./g, 'Выход из $1 альянса "$2".');
                                  desc = desc.replace(/Formed the union "(.*?)"\./g, 'Основана уния "$1".');
                                  desc = desc.replace(/Joined the union "(.*?)"\./g, 'Вступление в унию "$1".');
                                  desc = desc.replace(/Left the union "(.*?)"\./g, 'Выход из унии "$1".');
                                  desc = desc.replace(/Ideology changed to (.*?)\./g, 'Идеология изменена на $1.');
                                  desc = desc.replace(/Lost (.*?) territories to (.*?)\./g, 'Потеряно $1 территорий в пользу $2.');
                                  desc = desc.replace(/Became a puppet of (.*?)\./g, 'Государство стало марионеткой $1.');
                                  desc = desc.replace(/(.*?) was formed from its territory\./g, '$1 было образовано из этих территорий.');
                                  desc = desc.replace(/(.*?) transformed into (.*?)\./g, '$1 теперь известно как $2.');
                                }
                                
                                return (
                                  <div key={i} className="relative">
                                    <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-[#3366cc] ring-4 ring-[#f8f9fa]"></div>
                                    <div className="text-xs text-gray-500 mb-0.5">{new Date(ev.timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                    <div className="text-sm text-gray-900 mt-0.5">
                                      {ev.type !== 'war' ? (
                                        (ev.customWiki || ev.customArticle) ? (
                                          <div 
                                            onClick={() => setViewingEventArticle({ nationId: wiki.id, eventIndex: i })}
                                            className="text-[#0645ad] hover:underline cursor-pointer inline-block"
                                          >
                                            {ev.customWiki?.title || (desc === 'Новое событие' || desc === 'New Event' ? (language === 'ru' ? 'Читать статью' : 'Read Article') : desc)}
                                          </div>
                                        ) : (
                                          <span>{desc}</span>
                                        )
                                      ) : (
                                        <span>
                                          {desc}
                                          {ev.relatedEntityId && (() => {
                                            const w = finishedWars.find(w => w.id === ev.relatedEntityId) || wars.find(w => w.id === ev.relatedEntityId);
                                            if (w) {
                                              const warName = w.customWiki?.title || (language === 'ru' ? 
                                                `Война: ${wikiNations.find(wi => wi.id === w.attackerId)?.name || 'Неизвестно'} против ${wikiNations.find(wi => wi.id === w.defenderId)?.name || 'Неизвестно'}` :
                                                `War: ${wikiNations.find(wi => wi.id === w.attackerId)?.name || 'Unknown'} vs ${wikiNations.find(wi => wi.id === w.defenderId)?.name || 'Unknown'}`);
                                              return (
                                                <div 
                                                  onClick={() => {
                                                    setWikiTab('wars');
                                                    setSelectedWikiWarId(ev.relatedEntityId);
                                                  }}
                                                  className="text-[#0645ad] hover:underline cursor-pointer ml-1 font-bold inline-block"
                                                >
                                                  {warName}
                                                </div>
                                              );
                                            }
                                            return null;
                                          })()}
                                        </span>
                                      )}
                                      {ev.relatedEntityId && ev.type !== 'war' && wikiNations.find(w => w.id === ev.relatedEntityId) && (
                                        <span 
                                          onClick={() => setSelectedWikiNationId(ev.relatedEntityId)}
                                          className="text-[#0645ad] hover:underline cursor-pointer ml-1 font-bold"
                                        >
                                          ({wikiNations.find(w => w.id === ev.relatedEntityId)?.name})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {wiki.events.length === 0 && (myDiplomaticEntity?.id === wiki.id || myNation?.id === wiki.id) && (
                                <div className="text-xs text-gray-400 italic py-2">
                                  {language === 'ru' ? 'История этого государства ещё не записана.' : 'The history of this nation has not been recorded yet.'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Infobox */}
                        <div className="w-[300px] shrink-0 space-y-4 text-sm font-sans h-fit self-start">
                          <div className="bg-[#f8f9fa] border border-[#a2a9b1] text-gray-900 shadow-sm overflow-hidden text-[12px] leading-[1.3]">
                            <div className="bg-[#eaecf0] py-2 px-3 text-center border-b border-[#a2a9b1]">
                              <span className="font-bold text-base">{wiki.name}</span>
                            </div>
                            {wiki.flag && (
                              <div className="p-4 bg-white flex flex-col items-center justify-center border-b border-[#a2a9b1] relative group">
                                <img src={wiki.flag} alt="Flag" className="w-[150px] border border-gray-300 shadow-sm" />
                                <span className="text-[10px] text-[#0645ad] hover:underline mt-1 cursor-default">
                                  {language === 'ru' ? 'Флаг' : 'Flag'}
                                </span>
                                
                                {wiki.symbolismHistory && wiki.symbolismHistory.length > 0 && (
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-white border border-[#a2a9b1] shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                     <div className="text-xs font-bold mb-2 pb-1 border-b border-gray-700">{language === 'ru' ? 'Прошлые государственные флаги' : 'Past National Flags'}</div>
                                     <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                       {wiki.symbolismHistory.map((h, i) => (
                                          <div key={i} className="flex items-center gap-2">
                                            {h.flag ? <img src={h.flag} className="w-8 h-5 object-cover border border-gray-600"/> : <div className="w-8 h-5 bg-gray-800 border border-gray-600"/>}
                                            <div className="text-[10px] min-w-0">
                                              <div className="text-gray-300 truncate">{h.name}</div>
                                              <div className="text-gray-500">{new Date(h.timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                            </div>
                                          </div>
                                       ))}
                                     </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {wiki.lastTerritories && wiki.lastTerritories.length > 0 && (
                              <div className="p-2 border-b border-[#a2a9b1] bg-gray-50">
                                <div className="text-xs font-bold mb-1 text-gray-700">{t('territoryMap')}</div>
                                <div className="w-full bg-[#1a202c] border border-gray-400 rounded overflow-hidden aspect-[2]">
                                  <canvas 
                                    className="w-full h-full object-contain"
                                    ref={canvas => {
                                      if (canvas) {
                                        const w = gridSize.w || 1000;
                                        const h = gridSize.h || 500;
                                        let minX = w, minY = h, maxX = 0, maxY = 0;
                                        
                                        if (wiki.lastTerritories && wiki.lastTerritories.length > 0) {
                                          wiki.lastTerritories.forEach(idx => {
                                            const gx = idx % w;
                                            const gy = Math.floor(idx / w);
                                            if (gx < minX) minX = gx;
                                            if (gx > maxX) maxX = gx;
                                            if (gy < minY) minY = gy;
                                            if (gy > maxY) maxY = gy;
                                          });
                                        }

                                        if (maxX < minX) {
                                          minX = 0; maxX = w;
                                          minY = 0; maxY = h;
                                        }

                                        // Smaller padding to zoom in (масштаб побольше)
                                        const padding = 8;
                                        minX = Math.max(0, minX - padding);
                                        minY = Math.max(0, minY - padding);
                                        maxX = Math.min(w, maxX + padding);
                                        maxY = Math.min(h, maxY + padding);

                                        let boxW = maxX - minX || 1;
                                        let boxH = maxY - minY || 1;
                                        
                                        // Force 2:1 aspect ratio so there are no empty stripes horizontally
                                        const targetAspect = 2;
                                        const currentAspect = boxW / boxH;
                                        
                                        if (currentAspect < targetAspect) {
                                          const newW = boxH * targetAspect;
                                          const diff = newW - boxW;
                                          let p1 = diff / 2;
                                          let p2 = diff / 2;
                                          if (minX - p1 < 0) { p2 += p1 - minX; p1 = minX; }
                                          if (maxX + p2 > w) { p1 += (maxX + p2) - w; p2 = w - maxX; }
                                          minX = Math.max(0, Math.floor(minX - p1));
                                          maxX = Math.min(w, Math.ceil(maxX + p2));
                                        } else if (currentAspect > targetAspect) {
                                          const newH = boxW / targetAspect;
                                          const diff = newH - boxH;
                                          let p1 = diff / 2;
                                          let p2 = diff / 2;
                                          if (minY - p1 < 0) { p2 += p1 - minY; p1 = minY; }
                                          if (maxY + p2 > h) { p1 += (maxY + p2) - h; p2 = h - maxY; }
                                          minY = Math.max(0, Math.floor(minY - p1));
                                          maxY = Math.min(h, Math.ceil(maxY + p2));
                                        }
                                        
                                        boxW = maxX - minX || 1;
                                        boxH = maxY - minY || 1;

                                        // Increase internal canvas resolution so background map isn't blurry
                                        const renderScale = Math.min(10, Math.floor(2000 / Math.max(boxW, boxH)));
                                        const finalScale = Math.max(2, renderScale);

                                        canvas.width = boxW * finalScale;
                                        canvas.height = boxH * finalScale;
                                        const ctx = canvas.getContext('2d');
                                        if (ctx) {
                                          ctx.scale(finalScale, finalScale);
                                          ctx.imageSmoothingEnabled = false; // keep pixel style for territories
                                          ctx.clearRect(0, 0, boxW, boxH);
                                          
                                          if (bgImage) {
                                            try {
                                              const imgW = (bgImage as HTMLImageElement).naturalWidth || w;
                                              const imgH = (bgImage as HTMLImageElement).naturalHeight || h;
                                              const rx = imgW / w;
                                              const ry = imgH / h;
                                              ctx.drawImage(bgImage, minX * rx, minY * ry, boxW * rx, boxH * ry, 0, 0, boxW, boxH);
                                            } catch(e) {
                                              console.error('Canvas error', e);
                                            }
                                          } else {
                                            ctx.fillStyle = '#1e293b'; // dark map background
                                            ctx.fillRect(0, 0, boxW, boxH);
                                            ctx.fillStyle = '#334155'; // darker grid map
                                            const startX = Math.floor(minX / 10) * 10;
                                            const startY = Math.floor(minY / 10) * 10;
                                            for (let y = startY; y <= maxY; y += 10) {
                                              for (let x = startX; x <= maxX; x += 10) {
                                                ctx.fillRect(x - minX, y - minY, 1, 1);
                                              }
                                            }
                                          }
                                          
                                          // Draw actual territories
                                          if (wiki.lastTerritories && wiki.lastTerritories.length > 0) {
                                            ctx.fillStyle = wiki.color || '#22c55e';
                                            wiki.lastTerritories.forEach(idx => {
                                              const gx = idx % w;
                                              const gy = Math.floor(idx / w);
                                              ctx.fillRect(gx - minX, gy - minY, 1, 1);
                                            });
                                          }
                                        }
                                      }
                                    }}
                                  />
                                </div>
                                <div className="mt-1 text-[10px] text-gray-400 flex items-center justify-between">
                                   <span>{language === 'ru' ? 'Территория залита зелёным.' : 'Territory is painted green.'}</span>
                                   <div className="flex items-center gap-1">
                                      {language === 'ru' ? 'Ориг. цвет:' : 'Orig. color:'} 
                                      <div className="w-3 h-3 rounded-sm border border-gray-500" style={{ backgroundColor: wiki.color }} />
                                   </div>
                                </div>
                              </div>
                            )}
                            <div className="p-3 space-y-3 text-sm">
                              <div>
                                <div className="text-xs text-gray-500 font-bold mb-0.5">{language === 'ru' ? 'Идеология' : t('ideology')}</div>
                                <div className="font-medium text-gray-900">{tMapIdeology(language, wiki.ideology) || wiki.ideology}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-bold mb-0.5">{language === 'ru' ? 'Пик ВВП' : t('peakGdp')}</div>
                                <div className="font-medium text-gray-900">${wiki.peakGdp.toLocaleString()}M</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 font-bold mb-0.5">{language === 'ru' ? 'Макс. Территория' : t('peakTerritories')}</div>
                                <div className="font-medium text-gray-900">{wiki.peakTerritories.toLocaleString()} pixels</div>
                              </div>
                            </div>
                            
                            {/* Succession Wikipedia Bar */}
                            <div className="flex items-center justify-between p-2 mt-2 bg-[#f8f9fa] border-t border-[#a2a9b1]">
                               <div className="flex-1 flex flex-col items-start min-w-0" title={wikiNations.find(w => w.id === wiki.predecessorId)?.name}>
                                 {wiki.predecessorId && wikiNations.find(w => w.id === wiki.predecessorId) && (
                                   <div className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors" onClick={() => wiki.predecessorId && setSelectedWikiNationId(wiki.predecessorId)}>
                                     <ArrowLeft className="w-3 h-3 text-[#0645ad]" />
                                     {wikiNations.find(w => w.id === wiki.predecessorId)!.flag && <img src={wikiNations.find(w => w.id === wiki.predecessorId)!.flag!} className="w-8 h-5 object-cover border border-[#a2a9b1] shadow-sm" />}
                                     <span className="truncate text-[#0645ad] text-xs hover:underline">{wikiNations.find(w => w.id === wiki.predecessorId)!.name}</span>
                                   </div>
                                 )}
                               </div>
                               <div className="flex-1 text-center font-bold text-[10px] text-gray-700 flex flex-col items-center justify-center">
                                 <span>{new Date(wiki.createdAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                 <span className="text-gray-400 my-0.5 leading-none">—</span>
                                 <span>{wiki.destroyedAt ? new Date(wiki.destroyedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : (language === 'ru' ? 'наши дни' : 'present')}</span>
                                 {wiki.destroyedAt && wiki.conquerorIds && wiki.conquerorIds.length > 0 && (
                                   <div className="mt-1 flex flex-col items-center">
                                      <span className="text-gray-500 font-normal">{language === 'ru' ? 'Завоёвано:' : 'Conquered by:'}</span>
                                      <div className="flex flex-wrap justify-center gap-1 mt-0.5">
                                        {wiki.conquerorIds.map(cid => {
                                          const conq = wikiNations.find(w => w.id === cid);
                                          if (!conq) return null;
                                          return (
                                            <div key={cid} onClick={() => setSelectedWikiNationId(cid)} className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 p-0.5 rounded transition-colors" title={conq.name}>
                                              {conq.flag && <img src={conq.flag} className="w-3 h-2 object-cover border border-[#a2a9b1]"/>}
                                              <span className="text-[#0645ad] hover:underline text-[9px] max-w-[60px] truncate">{conq.name}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                   </div>
                                 )}
                               </div>
                               <div className="flex-1 flex flex-col items-end min-w-0" title={wiki.successors?.[0] ? wikiNations.find(w => w.id === wiki.successors![0])?.name : ''}>
                                 {wiki.successors && wiki.successors.length > 0 && wikiNations.find(w => w.id === wiki.successors[0]) && (
                                   <div className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors" onClick={() => wiki.successors?.[0] && setSelectedWikiNationId(wiki.successors[0])}>
                                     <span className="truncate text-[#0645ad] text-xs hover:underline">{wikiNations.find(w => w.id === wiki.successors[0])!.name}</span>
                                     {wikiNations.find(w => w.id === wiki.successors[0])!.flag && <img src={wikiNations.find(w => w.id === wiki.successors[0])!.flag!} className="w-8 h-5 object-cover border border-[#a2a9b1] shadow-sm" />}
                                     <ArrowLeft className="w-3 h-3 text-[#0645ad] transform rotate-180" />
                                   </div>
                                 )}
                               </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                )
              ) : (
                !selectedWikiWarId ? (
                   <div className="w-full space-y-6">
                      <div className="bg-white border text-black border-gray-300 p-6 rounded-lg text-center font-serif shadow-sm">
                        <h1 className="text-3xl font-serif mb-2 text-black">List of Historical Conflicts</h1>
                        <p className="text-gray-600">The historical archives of global conflicts and wars.</p>
                      </div>
                      <div>
                        <h2 className="text-xl font-serif border-b border-gray-300 pb-2 mb-4 text-black">Wars and Treaties</h2>
                        <div className="flex flex-col gap-2">
                          {[...finishedWars].sort((a, b) => b.createdAt - a.createdAt).map(w => {
                            const att = wikiNations.find(wi => wi.id === w.attackerId) || nations.find(n => n.id === w.attackerId);
                            const def = wikiNations.find(wi => wi.id === w.defenderId) || nations.find(n => n.id === w.defenderId);
                            const warName = `War of ${att?.name || 'Unknown'} - ${def?.name || 'Unknown'}`;
                            return (
                              <div 
                                key={w.id} 
                                onClick={() => setSelectedWikiWarId(w.id)}
                                className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 p-3 rounded cursor-pointer transition-colors shadow-sm"
                              >
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold truncate text-[#0645ad] hover:underline flex items-center gap-2">
                                    <Swords className="w-4 h-4 text-red-500"/> {warName}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {new Date(w.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} — {w.finishedAt ? new Date(w.finishedAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {finishedWars.length === 0 && <p className="text-gray-500 italic">No historical wars yet.</p>}
                        </div>
                      </div>
                   </div>
                ) : (
                   <div className="flex flex-col w-full gap-6">
                     {(() => {
                        const w = finishedWars.find(war => war.id === selectedWikiWarId);
                        if (!w) return <p>War not found.</p>;
                        
                        const mainAtt = wikiNations.find(wi => wi.id === w.attackerId) || nations.find(n => n.id === w.attackerId);
                        const mainDef = wikiNations.find(wi => wi.id === w.defenderId) || nations.find(n => n.id === w.defenderId);
                        const isRu = language === 'ru';
                        const wNarrative = generateWarNarrative(w, (id) => {
                          const nat = wikiNations.find(wi => wi.id === id) || nations.find(nn => nn.id === id);
                          return nat ? nat.name : 'Unknown';
                        }, language);
                        const defaultWarName = isRu ? `Война ${mainAtt?.name || 'Неизвестно'} - ${mainDef?.name || 'Неизвестно'}` : `War of ${mainAtt?.name || 'Unknown'} - ${mainDef?.name || 'Unknown'}`;
                        const warName = w.customWiki?.title || defaultWarName;
                        
                        return (
                          <>
                            <div className="flex w-full gap-6">
                              <div className="flex-1 flex flex-col pr-4 border-r border-gray-300">
                              <button onClick={() => setSelectedWikiWarId(null)} className="self-start text-[#0645ad] hover:underline flex items-center gap-1 mb-4 text-sm">
                                <ArrowLeft className="w-4 h-4"/> {isRu ? 'Назад к войнам' : 'Back to Wars'}
                              </button>
                              <h1 className="text-4xl font-serif border-b border-gray-300 pb-2 mb-4 text-black inline-flex items-center gap-3">
                                {warName}
                              </h1>
                              <div className="prose prose-blue max-w-none">
                                {w.customWiki?.intro ? (
                                  <div className="lead text-lg text-gray-800">
                                    <Markdown components={{
                                      h1: ({node, ...props}: any) => <h1 className="text-3xl font-serif mt-6 mb-3 text-black border-b border-[#a2a9b1] pb-2" {...props} />,
                                      h2: ({node, ...props}: any) => <h2 className="text-2xl font-serif mt-6 mb-3 text-black border-b border-[#a2a9b1] pb-2" {...props} />,
                                      h3: ({node, ...props}: any) => <h3 className="text-xl font-serif mt-4 mb-2 text-black border-b border-[#a2a9b1] pb-1" {...props} />,
                                      p: ({node, ...props}: any) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                                      ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                      ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                      strong: ({node, ...props}: any) => <strong className="font-bold text-black" {...props} />,
                                      a: ({node, href, children, ...props}: any) => {
                                        if (href?.startsWith('nation:')) {
                                          return <span onClick={() => { setViewingEventArticle(null); setSelectedWikiNationId(href.split(':')[1]); }} className="text-[#0645ad] hover:underline cursor-pointer" {...props}>{children}</span>
                                        }
                                        if (href?.startsWith('war:')) {
                                          return <span onClick={() => { setViewingEventArticle(null); setSelectedWikiNationId(null); setSelectedWikiWarId(href.split(':')[1]); setWikiTab('wars'); }} className="text-[#0645ad] hover:underline cursor-pointer" {...props}>{children}</span>
                                        }
                                        return <a href={href} className="text-[#0645ad] hover:underline" {...props}>{children}</a>
                                      }
                                    }}>{w.customWiki.intro}</Markdown>
                                  </div>
                                ) : (
                                  <p className="lead text-lg text-gray-800 whitespace-pre-wrap">
                                    {isRu ? (
                                      <>
                                        <b className="font-bold">{warName}</b> — крупный конфликт, который начался {new Date(w.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} и продолжался до {w.finishedAt ? new Date(w.finishedAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'конца'}.
                                        Он был спровоцирован по причине <span className="italic">"{w.reason}"</span>.
                                      </>
                                    ) : (
                                      <>
                                        The <b className="font-bold">{warName}</b> was a major conflict which began on {new Date(w.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} and lasted until {w.finishedAt ? new Date(w.finishedAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'it ended'}.
                                        It was initiated due to <span className="italic">"{w.reason}"</span>.
                                      </>
                                    )}
                                  </p>
                                )}
                                
                                <h2 className="text-2xl font-serif mt-8 mb-4 border-b border-gray-300 pb-2 text-black flex items-center justify-between">
                                  <span>{isRu ? 'Ход войны' : 'Course of War'}</span>
                                  <div className="flex items-center gap-2">
                                    {(w.customWiki?.narrative || w.narrative || wNarrative) && !w.isGeneratingNarrative && (
                                      <button 
                                        onClick={() => {
                                           setWarNarrativeDraft(w.customWiki?.narrative || w.narrative || wNarrative || '');
                                           setEditingWarNarrativeId(w.id);
                                           setAiEditPrompt('');
                                        }}
                                        className="text-xs font-sans bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded shadow-sm border border-gray-300 transition-colors flex items-center gap-1"
                                      >
                                        <span>✏️ {isRu ? 'Редактировать статью' : 'Edit Article'}</span>
                                      </button>
                                    )}
                                    {!w.customWiki && !w.narrative && !w.isGeneratingNarrative && (
                                      <button 
                                        onClick={() => {
                                           if (socket) generateWarNarrativeClientSide(w, (id) => {
                                             const nat = wikiNations.find(wi => wi.id === id) || nations.find(nn => nn.id === id);
                                             return nat ? nat.name : 'Unknown';
                                           }, language, socket, undefined, undefined, useGameStore.getState().news.map(n => '[' + new Date(n.timestamp).toLocaleDateString() + '] ' + n.text).join('\n').substring(0, 5000));
                                        }}
                                        className="text-xs font-sans bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded shadow-sm border border-blue-200 transition-colors flex items-center gap-1"
                                      >
                                        <span>🤖 {isRu ? 'Сгенерировать ИИ-статью' : 'Generate AI Article'}</span>
                                      </button>
                                    )}
                                    {w.isGeneratingNarrative && (
                                      <span className="text-xs font-sans text-gray-500 flex items-center gap-1">
                                        <span className="animate-spin text-lg">⏳</span> {isRu ? 'Генерация...' : 'Generating...'}
                                      </span>
                                    )}
                                  </div>
                                </h2>
                                <div className="text-gray-800">
                                  <Markdown components={{
                                    h1: ({node, ...props}: any) => <h1 className="text-3xl font-serif mt-6 mb-3 text-black border-b border-[#a2a9b1] pb-2" {...props} />,
                                    h2: ({node, ...props}: any) => <h2 className="text-2xl font-serif mt-6 mb-3 text-black border-b border-[#a2a9b1] pb-2" {...props} />,
                                    h3: ({node, ...props}: any) => <h3 className="text-xl font-serif mt-4 mb-2 text-black border-b border-[#a2a9b1] pb-1" {...props} />,
                                    p: ({node, ...props}: any) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                                    ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                    ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                    strong: ({node, ...props}: any) => <strong className="font-bold text-black" {...props} />,
                                    a: ({node, href, children, ...props}: any) => {
                                        if (href?.startsWith('nation:')) {
                                          return <span onClick={() => { setViewingEventArticle(null); setSelectedWikiNationId(href.split(':')[1]); }} className="text-[#0645ad] hover:underline cursor-pointer" {...props}>{children}</span>
                                        }
                                        if (href?.startsWith('war:')) {
                                          return <span onClick={() => { setViewingEventArticle(null); setSelectedWikiNationId(null); setSelectedWikiWarId(href.split(':')[1]); setWikiTab('wars'); }} className="text-[#0645ad] hover:underline cursor-pointer" {...props}>{children}</span>
                                        }
                                        return <a href={href} className="text-[#0645ad] hover:underline" {...props}>{children}</a>
                                    }
                                  }}>
                                    {w.customWiki?.narrative || w.narrative || wNarrative}
                                  </Markdown>
                                </div>
                                
                                {w.peaceTreaty && (
                                  <>
                                    <h2 className="text-2xl font-serif mt-8 mb-4 border-b border-gray-300 pb-2 text-black">{isRu ? 'Договор и последствия' : 'Peace Treaty & Aftermath'}</h2>
                                    <p className="text-gray-800 mb-2">{isRu ? 'Конфликт был завершён подписанием мирного договора, детализирующего территориальные изменения.' : 'The conflict was concluded with a peace agreement detailing territorial transfers and political restructuring.'}</p>
                                    <ul className="list-disc pl-5 text-sm text-gray-700">
                                      {Object.keys(w.peaceTreaty.territoryClaims).length > 0 && (
                                        <li><b>{isRu ? 'Территориальные уступки:' : 'Territory exchanges:'}</b> {isRu ? `передано ${Object.keys(w.peaceTreaty.territoryClaims).length} регионов.` : `${Object.keys(w.peaceTreaty.territoryClaims).length} regions were transferred to new ownership.`}</li>
                                      )}
                                      {w.peaceTreaty.puppetClaims && Object.keys(w.peaceTreaty.puppetClaims).length > 0 && (
                                        <li><b>{isRu ? 'Новые марионеточные государства:' : 'Puppet States established:'}</b> {isRu ? `${Object.keys(w.peaceTreaty.puppetClaims).length} наций стали марионетками.` : `${Object.keys(w.peaceTreaty.puppetClaims).length} nations became puppet states.`}</li>
                                      )}
                                    </ul>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Infobox */}
                            <div className="w-[300px] shrink-0 space-y-4 text-sm flex flex-col h-fit self-start">
                               <div className="bg-[#f8f9fa] border border-[#a2a9b1] text-gray-900 shadow-sm overflow-hidden text-[12px] leading-[1.3]">
                                 <div className="bg-[#eaecf0] py-2 px-3 text-center border-b border-[#a2a9b1]">
                                   <span className="font-bold text-base">{warName}</span>
                                 </div>
                                 <WarStaticMap war={w} wikiNations={wikiNations} nations={nations} lang={language} bgImage={bgImage} gridSize={gridSize} />
                                 <div className="p-2 border-b border-[#a2a9b1]">
                                   <div className="grid grid-cols-[80px_1fr] gap-2 mb-1">
                                      <div className="font-bold">{isRu ? 'Дата' : 'Date'}</div>
                                      <div>
                                        {new Date(w.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} – {w.finishedAt ? new Date(w.finishedAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (isRu ? 'Наши дни' : 'Present')}
                                        <div className="mt-0.5 text-gray-500">
                                          ({(() => {
                                            const start = w.createdAt;
                                            const end = w.finishedAt || Date.now();
                                            const diffMs = end - start;
                                            const totalMins = Math.floor(diffMs / 60000);
                                            const hours = Math.floor(totalMins / 60);
                                            const mins = totalMins % 60;
                                            // Scale up time a bit for game immersion (e.g., 1 min = 1 month)
                                            // Let's just state real time for now
                                            // Or let's say "N minutes"
                                            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                            if (days > 0) return isRu ? `${days} дней` : `${days} days`;
                                            if (hours > 0 && mins > 0) return isRu ? `${hours} ч ${mins} мин` : `${hours}h ${mins}m`;
                                            if (hours > 0) return isRu ? `${hours} ч` : `${hours}h`;
                                            if (mins > 0) return isRu ? `${mins} мин` : `${mins}m`;
                                            return isRu ? '< 1 мин' : '< 1m';
                                          })()})
                                        </div>
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-[80px_1fr] gap-2 mb-1">
                                      <div className="font-bold">{isRu ? 'Место' : 'Location'}</div>
                                      <div>{isRu ? 'Весь мир' : 'World'}</div>
                                   </div>
                                   <div className="grid grid-cols-[80px_1fr] gap-2 mb-1">
                                      <div className="font-bold">{isRu ? 'Причина' : 'Reason'}</div>
                                      <div className="italic">{w.reason}</div>
                                   </div>
                                   {w.finishedAt && (
                                     <>
                                       <div className="grid grid-cols-[80px_1fr] gap-2 mt-1 pt-1 border-t border-[#eaecf0]">
                                          <div className="font-bold">{isRu ? 'Итог' : 'Outcome'}</div>
                                          <div>
                                            {w.customWiki?.result ? w.customWiki.result : (
                                              w.peaceTreaty 
                                                ? (isRu ? 'Мирный договор подписан' : 'Peace treaty signed') 
                                                : (isRu ? 'Неизвестен' : 'Unknown')
                                            )}
                                          </div>
                                       </div>
                                       {w.peaceTreaty && (Object.keys(w.peaceTreaty.territoryClaims).length > 0 || (w.peaceTreaty.puppetClaims && Object.keys(w.peaceTreaty.puppetClaims).length > 0)) && (
                                         <div className="grid grid-cols-[80px_1fr] gap-2 mt-1 pt-1 border-t border-[#eaecf0]">
                                            <div className="font-bold">{isRu ? 'Изменения' : 'Changes'}</div>
                                            <div>
                                              <ul className="list-disc pl-3 m-0 text-gray-800">
                                                {Object.keys(w.peaceTreaty.territoryClaims).length > 0 && (
                                                  <li>{isRu ? `Передача территорий (${Object.keys(w.peaceTreaty.territoryClaims).length})` : `Territory transfers (${Object.keys(w.peaceTreaty.territoryClaims).length})`}</li>
                                                )}
                                                {w.peaceTreaty.puppetClaims && Object.keys(w.peaceTreaty.puppetClaims).length > 0 && (
                                                  <li>{isRu ? `Установлены марионетки (${Object.keys(w.peaceTreaty.puppetClaims).length})` : `Puppets established (${Object.keys(w.peaceTreaty.puppetClaims).length})`}</li>
                                                )}
                                              </ul>
                                            </div>
                                         </div>
                                       )}
                                       {(!w.peaceTreaty || (Object.keys(w.peaceTreaty.territoryClaims).length === 0 && (!w.peaceTreaty.puppetClaims || Object.keys(w.peaceTreaty.puppetClaims).length === 0))) && (
                                          <div className="grid grid-cols-[80px_1fr] gap-2 mt-1 pt-1 border-t border-[#eaecf0]">
                                            <div className="font-bold">{isRu ? 'Изменения' : 'Changes'}</div>
                                            <div>{isRu ? 'Без территориальных изменений' : 'Status quo ante bellum'}</div>
                                          </div>
                                       )}
                                     </>
                                   )}
                                 </div>
                                 <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-[#a2a9b1]">{isRu ? 'Стороны' : 'Belligerents'}</div>
                                 <div className="flex border-b border-[#a2a9b1]">
                                    <div className="flex-1 p-2 border-r border-[#a2a9b1]">
                                       <div className="font-bold mb-2">{isRu ? 'Атакующие' : 'Attackers'}</div>
                                       {w.attackers.map(id => {
                                          const n = wikiNations.find(wi => wi.id === id) || nations.find(nn => nn.id === id);
                                          if (!n) return null;
                                          return (
                                            <div key={id} className="flex flex-col mb-1.5 cursor-pointer hover:bg-black/5" onClick={() => { setWikiTab('nations'); setSelectedWikiNationId(n.id); }}>
                                              <div className="flex items-center gap-1.5">
                                                {n.flag && <img src={n.flag} className="w-5 h-3 object-cover border border-gray-400"/>}
                                                <span className="text-[#0645ad] hover:underline font-bold">{n.name}</span>
                                              </div>
                                            </div>
                                          );
                                       })}
                                    </div>
                                    <div className="flex-1 p-2">
                                       <div className="font-bold mb-2">{isRu ? 'Защитники' : 'Defenders'}</div>
                                       {w.defenders.map(id => {
                                          const n = wikiNations.find(wi => wi.id === id) || nations.find(nn => nn.id === id);
                                          if (!n) return null;
                                          return (
                                            <div key={id} className="flex flex-col mb-1.5 cursor-pointer hover:bg-black/5" onClick={() => { setWikiTab('nations'); setSelectedWikiNationId(n.id); }}>
                                              <div className="flex items-center gap-1.5">
                                                {n.flag && <img src={n.flag} className="w-5 h-3 object-cover border border-gray-400"/>}
                                                <span className="text-[#0645ad] hover:underline font-bold">{n.name}</span>
                                              </div>
                                            </div>
                                          );
                                       })}
                                    </div>
                                 </div>
                                 <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-[#a2a9b1]">{isRu ? 'Силы сторон' : 'Forces & Strength'}</div>
                                 <div className="flex text-center p-2 border-b border-[#a2a9b1]">
                                     <div className="flex-1 border-r border-[#a2a9b1]">
                                        <div className="font-bold">{w.attackers.length} {isRu ? 'дивизий' : 'divisions'}</div>
                                     </div>
                                     <div className="flex-1">
                                        <div className="font-bold">{w.defenders.length} {isRu ? 'дивизий' : 'divisions'}</div>
                                     </div>
                                 </div>
                                 <div className="bg-[#eaecf0] py-1 text-center font-bold border-b border-[#a2a9b1]">{isRu ? 'Потери' : 'Casualties & Losses'}</div>
                                 <div className="flex text-center p-2">
                                     <div className="flex-1 border-r border-[#a2a9b1]">
                                        <div className="font-bold text-[#d23030]">~{(w.attackers.length * 1500 + w.battles.length * 520).toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-500">{isRu ? 'потерь' : 'troops & property'}</div>
                                     </div>
                                     <div className="flex-1">
                                        <div className="font-bold text-[#d23030]">~{(w.defenders.length * 1500 + w.battles.length * 520).toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-500">{isRu ? 'потерь' : 'troops & property'}</div>
                                     </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                           <div className="w-full mt-6">
                              <WarAnimatedMap war={w} wikiNations={wikiNations} nations={nations} lang={language} bgImage={bgImage} gridSize={gridSize} />
                           </div>
                          </>
                        );
                     })()}
                   </div>
                )
              )}
            </div>
            {editingDescriptionId && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl flex flex-col gap-4">
                  <h3 className="text-xl font-serif text-white flex items-center justify-between">
                    <span>{t('editArticle')}</span>
                    {isGeneratingNationArticle && (
                       <span className="text-sm font-sans text-gray-400 font-normal">
                          <span className="animate-spin inline-block text-lg mr-1">⏳</span> 
                          {language === 'ru' ? 'Генерация...' : 'Generating...'}
                       </span>
                    )}
                  </h3>

                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-gray-200 outline-none focus:border-blue-500 placeholder-gray-500"
                      placeholder={language === 'ru' ? 'Запрос для ИИ (напр. напиши про...' : 'AI prompt (e.g. write about...'}
                      value={nationAiEditPrompt}
                      onChange={(e) => setNationAiEditPrompt(e.target.value)}
                    />
                    <button
                       onClick={() => {
                          const wiki = wikiNations.find(w => w.id === editingDescriptionId);
                          if (wiki) generateNationArticleClientSide(wiki, nationAiEditPrompt);
                       }}
                       disabled={isGeneratingNationArticle}
                       className="px-4 py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="text-xl">✨</span> {language === 'ru' ? 'ИИ Редакт/Генерация' : 'AI Generate'}
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400 -mt-2">
                     {language === 'ru' ? 'Кнопка "ИИ Редакт" перепишет текст ниже. Вы можете просто добавить текст вручную:' : 'AI button rewrites text below. Or edit manually:'}
                  </div>

                  <textarea 
                    className="w-full h-64 bg-gray-900 border border-gray-600 rounded p-4 text-gray-200 custom-scrollbar outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    placeholder={t('customDescriptionPlaceholder')}
                    value={descriptionDraft}
                    onChange={(e) => setDescriptionDraft(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setEditingDescriptionId(null)}
                      className="px-4 py-2 rounded text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {t('cancelEdit')}
                    </button>
                    <button 
                      onClick={() => {
                        updateWikiDescription(descriptionDraft);
                        setEditingDescriptionId(null);
                      }}
                      className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
                    >
                      {t('saveArticle')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {editingEventArticle && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#f8f9fa] p-8 rounded-sm w-full max-w-4xl border border-[#a2a9b1] shadow-xl flex flex-col gap-4 relative">
                  <h3 className="text-3xl font-serif text-black border-b border-[#a2a9b1] pb-2 flex items-center justify-between">
                    <span>{language === 'ru' ? 'Редактирование статьи' : 'Edit Article'}</span>
                    {isGeneratingNationArticle && (
                      <span className="text-sm font-sans text-gray-500 animate-pulse">
                        {language === 'ru' ? 'Генерация...' : 'Generating...'}
                      </span>
                    )}
                  </h3>
                  
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-white border border-[#a2a9b1] rounded-sm p-2 text-black outline-none focus:border-blue-500 placeholder-gray-500"
                      placeholder={language === 'ru' ? 'Сгенерировать статью с ИИ (напишите что добавить/изменить)' : 'Generate with AI (write what to add or change)'}
                      value={nationAiEditPrompt}
                      onChange={(e) => setNationAiEditPrompt(e.target.value)}
                    />
                    <button
                       onClick={() => {
                          const w = wikiNations.find(wi => wi.id === editingEventArticle.nationId);
                          if (w && w.events[editingEventArticle.eventIndex] && socket) {
                            setIsGeneratingNationArticle(true);
                            ai.models.generateContent({
                               model: 'gemini-2.5-flash',
                               contents: [
                                 language === 'ru' ?
                                 `Сгенерируй полноценную Вики-статью об историческом событии: "${w.events[editingEventArticle.eventIndex].description}".
                                 ВАЖНО: Игнорируй реальные исторические события и страны. Опирайся СТРОГО на события из игры. Игровая дата этого события (используй её в статье): ${new Date(w.events[editingEventArticle.eventIndex].timestamp).toLocaleDateString()}.
                                 Обязательно напиши вводный абзац в самом начале текста ДО первого заголовка ###. НЕ фантазируй о предыстории до основания государства.
                                 Текущий текст: "${eventArticleDraft.text || 'Отсутствует'}"
                                 Пожелание пользователя: "${nationAiEditPrompt}"
                                 
                                 Верни валидный JSON с тремя полями:
                                 1) "title" - Эпичное название события.
                                 2) "text" - Подробный текст статьи в стиле Википедии (вступление, предыстория, ход, последствия). Разрешено использовать Markdown (заголовки ###, списки, жирный текст). Строго без инфобокса в тексте!
                                 3) "infobox" - Объект (ключ-значение) с краткими фактами (например, "Место", "Причина", "Итог" и т.п.). Ключи должны быть с большой буквы.` :
                                 `Generate a full Wiki article about the historical event: "${w.events[editingEventArticle.eventIndex].description}".
                                 IMPORTANT: Ignore real historical events strings. Strictly base it on game context. The game date for this event is: ${new Date(w.events[editingEventArticle.eventIndex].timestamp).toLocaleDateString()}, use it in the article.
                                 You MUST write an introductory paragraph at the very beginning BEFORE the first ### heading. Do NOT hallucinate history prior to the founding of nations.
                                 Current text: "${eventArticleDraft.text || 'None'}"
                                 User request: "${nationAiEditPrompt}"
                                 
                                 Return valid JSON with three fields:
                                 1) "title" - Epic name for the event.
                                 2) "text" - Detailed Wikipedia-style article text. Use Markdown formatting like ### headers. Strictly NO infobox in the text!
                                 3) "infobox" - Object (key-value) with brief facts.`
                               ],
                               config: {
                                 responseMimeType: "application/json"
                               }
                            }).then(res => {
                               if (res.text) {
                                  try {
                                     const txt = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
                                     const parsed = JSON.parse(txt);
                                     updateWikiEventArticle(editingEventArticle.nationId, editingEventArticle.eventIndex, parsed.text || '', parsed);
                                     setEditingEventArticle(null);
                                  } catch (e) {
                                     console.error('Failed to parse AI response', e);
                                  }
                               }
                            }).finally(() => setIsGeneratingNationArticle(false));
                          }
                       }}
                       disabled={!nationAiEditPrompt.trim() || isGeneratingNationArticle}
                       className="px-4 py-2 rounded-sm bg-[#3366cc] text-white font-sans hover:bg-[#2a4b8d] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <span className="text-base">✨</span> {language === 'ru' ? 'Сгенерировать и сохранить' : 'Generate & Save'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                     {language === 'ru' ? 'Вы можете сгенерировать статью с ИИ, либо просто сохранить текст вручную ниже:' : 'Generate an article using AI, or write manually below:'}
                  </div>
                    <textarea 
                    className="w-full h-80 bg-white border border-[#a2a9b1] rounded-sm p-4 text-black font-sans custom-scrollbar outline-none focus:border-blue-500 transition-colors"
                    placeholder={language === 'ru' ? 'Опишите данное историческое событие вручную...' : 'Describe this historical event manually...'}
                    value={eventArticleDraft.text || ''}
                    onChange={(e) => setEventArticleDraft({ ...eventArticleDraft, text: e.target.value })}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setEditingEventArticle(null)}
                      className="px-4 py-2 bg-[#f8f9fa] border border-[#a2a9b1] rounded-sm text-black hover:bg-[#eaecf0] transition-colors font-sans"
                    >
                      {t('cancelEdit')}
                    </button>
                    <button 
                      onClick={() => {
                        const w = wikiNations.find(wi => wi.id === editingEventArticle.nationId);
                        if (w && w.events[editingEventArticle.eventIndex]) {
                           // preserve customWiki if it exists when strictly editing text
                           const existingCustomWiki = w.events[editingEventArticle.eventIndex].customWiki;
                           if (existingCustomWiki) {
                              existingCustomWiki.text = eventArticleDraft.text;
                           }
                           updateWikiEventArticle(editingEventArticle.nationId, editingEventArticle.eventIndex, eventArticleDraft.text, existingCustomWiki);
                        }
                        setEditingEventArticle(null);
                      }}
                      disabled={isCheckingArticleImage || !!articleModerationError}
                      className="px-4 py-2 rounded-sm bg-[#3366cc] text-white font-sans hover:bg-[#2a4b8d] transition-colors disabled:opacity-50"
                    >
                      {t('saveArticle')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {addingCustomEventNationId && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-[#f8f9fa] p-6 w-full max-w-md border border-[#a2a9b1] shadow-2xl flex flex-col gap-4 font-sans text-black">
                  <h3 className="text-xl font-serif border-b border-[#a2a9b1] pb-2">
                     {language === 'ru' ? 'Новое историческое событие' : 'New Historical Event'}
                  </h3>
                  <input
                    type="text"
                    className="w-full bg-white border border-[#a2a9b1] p-2 text-black outline-none focus:border-blue-500 rounded-sm"
                    placeholder={language === 'ru' ? 'Краткое описание события' : 'Short description of the event'}
                    value={customEventDesc}
                    onChange={(e) => setCustomEventDesc(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button 
                      onClick={() => {
                        setAddingCustomEventNationId(null);
                        setCustomEventDesc('');
                      }}
                      className="px-4 py-2 bg-[#f8f9fa] border border-[#a2a9b1] rounded-sm text-black hover:bg-[#eaecf0] transition-colors"
                    >
                      {t('cancelEdit')}
                    </button>
                    <button 
                      onClick={() => {
                        if (customEventDesc.trim() && addingCustomEventNationId) {
                           useGameStore.getState().addCustomWikiEvent(addingCustomEventNationId, customEventDesc.trim());
                           setAddingCustomEventNationId(null);
                           setCustomEventDesc('');
                        }
                      }}
                      className="px-4 py-2 rounded-sm bg-[#3366cc] text-white hover:bg-[#2a4b8d] transition-colors"
                    >
                      {language === 'ru' ? 'Добавить' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {editingWarNarrativeId && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl flex flex-col gap-4">
                  <h3 className="text-xl font-serif text-white">{language === 'ru' ? 'Редактировать статью о войне' : 'Edit War Article'}</h3>
                  
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-gray-200 outline-none focus:border-blue-500 placeholder-gray-500"
                      placeholder={language === 'ru' ? 'Запрос для ИИ: например, добавь драмы, сделай короче...' : 'AI prompt: e.g., make it more dramatic, shorter...'}
                      value={aiEditPrompt}
                      onChange={(e) => setAiEditPrompt(e.target.value)}
                    />
                    <button
                       onClick={() => {
                          const w = finishedWars.find(war => war.id === editingWarNarrativeId) || wars.find(war => war.id === editingWarNarrativeId);
                          if (w && socket) {
                             generateWarNarrativeClientSide(w, (id) => {
                               const nat = wikiNations.find(wi => wi.id === id) || nations.find(nn => nn.id === id);
                               return nat ? nat.name : 'Unknown';
                             }, language, socket, aiEditPrompt, JSON.stringify(w.customWiki || {}), useGameStore.getState().news.map(n => '[' + new Date(n.timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + '] ' + n.text).join('\n').substring(0, 5000));
                             setEditingWarNarrativeId(null);
                          }
                       }}
                       disabled={!aiEditPrompt.trim()}
                       className="px-4 py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="text-xl">✨</span> {language === 'ru' ? 'ИИ Переписать Статью' : 'AI Rewrite Article'}
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 -mt-2">
                     {language === 'ru' ? 'Вы также можете отредактировать только "Ход войны" вручную ниже:' : 'Or manually edit ONLY the "Course of War" narrative below:'}
                  </div>

                  <textarea 
                    className="w-full h-64 bg-gray-900 border border-gray-600 rounded p-4 text-gray-200 custom-scrollbar outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                    placeholder={language === 'ru' ? 'Текст статьи...' : 'Article text...'}
                    value={warNarrativeDraft}
                    onChange={(e) => setWarNarrativeDraft(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setEditingWarNarrativeId(null)}
                      className="px-4 py-2 rounded text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {t('cancelEdit')}
                    </button>
                    <button 
                      onClick={() => {
                        if (socket) {
                           socket.emit('setWarNarrative', { warId: editingWarNarrativeId, narrative: warNarrativeDraft });
                        }
                        setEditingWarNarrativeId(null);
                      }}
                      className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
                    >
                      {t('saveArticle')}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Alliance Flag (URL or File)</label>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newAllianceFlag} onChange={e => setNewAllianceFlag(e.target.value)} placeholder="https://..." className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-purple-500" />
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded px-3 py-2 flex items-center justify-center transition-colors">
                        <Upload className="w-4 h-4 text-gray-300" />
                        <input type="file" accept="image/*" onChange={handleAllianceFlagUpload} className="hidden" />
                      </label>
                    </div>
                    {newAllianceFlagError && <div className="text-xs text-center text-red-600 mb-2 py-2 border border-red-500 bg-red-50/10 rounded-sm font-bold">{newAllianceFlagError}</div>}
                    {isCheckingNewAllianceFlag && <div className="text-xs text-center text-gray-500 mb-2 py-2 border border-dashed border-gray-300/30">{language === 'ru' ? 'Модерация ИИ...' : 'AI Moderation...'}</div>}
                    {newAllianceFlag && !isCheckingNewAllianceFlag && !newAllianceFlagError && (
                      <div className="h-16 border border-white/10 rounded overflow-hidden flex items-center justify-center bg-black/50">
                        <img src={newAllianceFlag} alt="Preview" className="h-full object-contain" />
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={isCheckingNewAllianceFlag || !!newAllianceFlagError} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
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
                        {showAllianceSettings ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> {language === 'ru' ? 'Настройки альянса' : 'Alliance Settings'}</h3>
                              <button onClick={() => setShowAllianceSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{language === 'ru' ? 'Название альянса' : 'Alliance Name'}</label>
                              <input type="text" value={editAllianceName} onChange={e => setEditAllianceName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{language === 'ru' ? 'Описание' : 'Description'}</label>
                              <textarea value={editAllianceDesc} onChange={e => setEditAllianceDesc(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 min-h-[80px]" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('flag')}</label>
                              <div className="flex gap-2">
                                <input type="text" value={editAllianceFlag} onChange={e => setEditAllianceFlag(e.target.value)} placeholder="https://..." className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded px-3 py-2 flex items-center justify-center transition-colors">
                                  <Upload className="w-4 h-4 text-gray-300" />
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          setEditAllianceFlag(event.target.result as string);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                                </label>
                              </div>
                              {editAllianceFlagError && <div className="text-xs text-center text-red-600 mt-2 py-2 border border-red-500 bg-red-50/10 rounded-sm font-bold">{editAllianceFlagError}</div>}
                              {isCheckingEditAllianceFlag && <div className="text-xs text-center text-gray-500 mt-2 py-2 border border-dashed border-gray-300/30">{language === 'ru' ? 'Модерация ИИ...' : 'AI Moderation...'}</div>}
                              {editAllianceFlag && !isCheckingEditAllianceFlag && !editAllianceFlagError && (
                                <div className="mt-2 flex justify-center">
                                  <img src={editAllianceFlag} alt="Preview" className="h-16 w-auto object-contain rounded border border-white/20" />
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => {
                                useGameStore.getState().updateAlliance(alliance.id, {
                                  name: editAllianceName,
                                  description: editAllianceDesc,
                                  flag: editAllianceFlag
                                });
                                setShowAllianceSettings(false);
                              }}
                              disabled={isCheckingEditAllianceFlag || !!editAllianceFlagError}
                              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors mt-4 disabled:opacity-50"
                            >
                              Сохранить изменения
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-4 bg-white/5 p-4 rounded-lg border border-white/10 relative">
                              {myDiplomaticEntity && myDiplomaticEntity.isFounder && alliance.founderId === myDiplomaticEntity.id && (
                                <button 
                                  onClick={() => {
                                    setEditAllianceName(alliance.name || '');
                                    setEditAllianceDesc(alliance.description || '');
                                    setEditAllianceFlag(alliance.flag || '');
                                    setShowAllianceSettings(true);
                                  }}
                                  className="absolute top-2 right-2 bg-purple-600/50 hover:bg-purple-500 text-white text-xs font-bold p-1.5 rounded transition-colors"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              )}
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
                                      <EntityName entity={entity} noTruncate={true} />
                                      {memberId === alliance.founderId && <span className="text-xs text-yellow-500 ml-auto shrink-0">Founder</span>}
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
                    {newUnionFlagError && <div className="text-xs text-center text-red-600 mt-2 py-2 border border-red-500 bg-red-50/10 rounded-sm font-bold">{newUnionFlagError}</div>}
                    {isCheckingNewUnionFlag && <div className="text-xs text-center text-gray-500 mt-2 py-2 border border-dashed border-gray-300/30">{language === 'ru' ? 'Модерация ИИ...' : 'AI Moderation...'}</div>}
                    {newUnionFlag && !isCheckingNewUnionFlag && !newUnionFlagError && (
                      <div className="mt-2 flex justify-center">
                        <img src={newUnionFlag} alt="Preview" className="h-16 w-auto object-contain rounded border border-white/20" />
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isCheckingNewUnionFlag || !!newUnionFlagError}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded transition-colors disabled:opacity-50"
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
                              <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> {language === 'ru' ? 'Настройки союза' : 'Union Settings'}</h3>
                              <button onClick={() => setShowUnionSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{language === 'ru' ? 'Название союза' : 'Union Name'}</label>
                              <input type="text" value={editUnionName} onChange={e => setEditUnionName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{language === 'ru' ? 'Цвет союза' : 'Union Color'}</label>
                              <div className="flex gap-2">
                                <input type="color" value={editUnionColor} onChange={e => setEditUnionColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                                <input type="text" value={editUnionColor} onChange={e => setEditUnionColor(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('flag')}</label>
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
                              {editUnionFlagError && <div className="text-xs text-center text-red-600 mt-2 py-2 border border-red-500 bg-red-50/10 rounded-sm font-bold">{editUnionFlagError}</div>}
                              {isCheckingEditUnionFlag && <div className="text-xs text-center text-gray-500 mt-2 py-2 border border-dashed border-gray-300/30">{language === 'ru' ? 'Модерация ИИ...' : 'AI Moderation...'}</div>}
                              {editUnionFlag && !isCheckingEditUnionFlag && !editUnionFlagError && (
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
                              disabled={isCheckingEditUnionFlag || !!editUnionFlagError}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors mt-4 disabled:opacity-50"
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
                                      setEditUnionName(union.name || '');
                                      setEditUnionColor(union.color || '#ffffff');
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
                                      <EntityName entity={nation} noTruncate={true} />
                                      {memberId === union.founderId && <Star className="w-3 h-3 text-yellow-500 ml-auto shrink-0" />}
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
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('fullName')}</label>
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
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('color')}</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-[38px] bg-white/5 border border-white/10 rounded cursor-pointer"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('shortName')}</label>
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
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('ideology')}</label>
                <input
                  type="text"
                  value={ideology}
                  onChange={(e) => setIdeology(e.target.value)}
                  placeholder={t('ideology')}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('loreDesc')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('lorePlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none h-20"
                />
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">{t('flag')}</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setFlagType('preset')} className={`flex-1 py-1 text-xs rounded border ${flagType === 'preset' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-white/10 text-gray-400'}`}>{t('searchFlags')}</button>
                  <button type="button" onClick={() => setFlagType('upload')} className={`flex-1 py-1 text-xs rounded border ${flagType === 'upload' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-white/10 text-gray-400'}`}>{t('uploadCustom')}</button>
                  <button type="button" onClick={() => setFlagType('url')} className={`flex-1 py-1 text-xs rounded border ${flagType === 'url' ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-white/10 text-gray-400'}`}>{t('url')}</button>
                </div>
                
                {flagUrlError && <div className="text-xs text-center text-red-600 mb-2 py-2 border border-red-500 bg-red-50 rounded-sm font-bold">{flagUrlError}</div>}
                {isCheckingFlagUrl && <div className="text-xs text-center text-gray-500 mb-2 py-2 border border-dashed border-gray-300">{language === 'ru' ? 'Модерация ИИ...' : 'AI Moderation...'}</div>}

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
                  <option value="">{language === 'ru' ? 'Свободная Территория (Независимая)' : 'Free Territory (Independent)'}</option>
                  {nations.map((n) => (
                    <option key={n.id} value={n.id}>{language === 'ru' ? 'Внутри' : 'Inside'} {n.name}</option>
                  ))}
                </select>

                {targetNationId && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('depStatus')}</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {DEPENDENCY_STATUSES.map((s) => {
                         const map: Record<string, any> = {
                           'Independent': {en: 'Independent', ru: 'Независимый'},
                           'Vassal': {en: 'Vassal', ru: 'Вассал'},
                           'Colony': {en: 'Colony', ru: 'Колония'},
                           'Protectorate': {en: 'Protectorate', ru: 'Протекторат'},
                           'Puppet State': {en: 'Puppet State', ru: 'Марионетка'},
                           'Territory': {en: 'Territory', ru: 'Территория'},
                           'Autonomous Region': {en: 'Autonomous Region', ru: 'Автономия'},
                           'Occupied': {en: 'Occupied', ru: 'Оккупирована'}
                         };
                         return <option key={s} value={s}>{map[s]?.[language] || s}</option>;
                      })}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isCheckingFlagUrl || !!flagUrlError}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                Select Territory
              </button>
            </form>
          </div>
        )}

        {/* Settings Overlay */}
        {showSettings && (
          <div className="absolute top-20 left-20 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col z-50">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400"/> {t('settings')}</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">{t('language')}</label>
                <div className="flex gap-2">
                   <button onClick={() => setLanguage('ru')} className={`flex-1 py-1 rounded border ${language === 'ru' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>Русский</button>
                   <button onClick={() => setLanguage('en')} className={`flex-1 py-1 rounded border ${language === 'en' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>English</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drawing Mode Overlay */}
        {!myNation && setupPhase === 'draw' && !showAlliances && (
          <div className="self-center bg-black/80 backdrop-blur-xl border border-blue-500/50 p-6 rounded-xl w-full max-w-md pointer-events-auto shadow-2xl text-center">
            <h2 className="text-xl font-bold mb-2 text-blue-400">{t('drawBorders')}</h2>
            <p className="text-sm text-gray-300 mb-4">
              Click and drag on the map to claim land.
            </p>
            
            <div className="flex justify-between items-center mb-6 bg-white/5 p-3 rounded">
              <span className="text-sm uppercase tracking-wider text-gray-400">{t('territory')}</span>
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
                disabled={draftTerritories.length === 0 || spawnStatus === 'pending' || isCheckingFlagUrl || !!flagUrlError}
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
                        <EntityName entity={u} noTruncate={true} />
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">Union</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-400">Members</span>
                          <span className="font-bold">{u.members.length}</span>
                        </div>
                        <div className="flex justify-between items-start border-b border-white/5 pb-1">
                          <span className="text-gray-400 shrink-0 mr-2 mt-0.5">Founder</span>
                          <span className="font-bold text-right min-w-0"><EntityName entity={nations.find(nat => nat.id === u.founderId)} noTruncate={true} className="justify-end" /></span>
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
                                <EntityName entity={memberNation} noTruncate={true} />
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
                                  setIsCityMode(false);
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
                      <EntityName entity={n} noTruncate={true} />
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">{n.shortName}</p>
                    
                    <div className="flex gap-2 mb-4 border-b border-white/5 pb-2">
                      <button 
                        onClick={() => setNationInfoTab('info')} 
                        className={`flex-1 py-1 text-xs uppercase tracking-wider font-bold rounded transition-colors ${nationInfoTab === 'info' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                      >
                        {t('tabInfo')}
                      </button>
                      <button 
                        onClick={() => setNationInfoTab('politics')} 
                        className={`flex-1 py-1 text-xs uppercase tracking-wider font-bold rounded transition-colors ${nationInfoTab === 'politics' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                      >
                        {t('tabPolitics')}
                      </button>
                      <button 
                        onClick={() => setNationInfoTab('lore')} 
                        className={`flex-1 py-1 text-xs uppercase tracking-wider font-bold rounded transition-colors ${nationInfoTab === 'lore' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                      >
                        {t('tabLore')}
                      </button>
                      <button 
                        onClick={() => setNationInfoTab('economy')} 
                        className={`flex-1 py-1 text-xs uppercase tracking-wider font-bold rounded transition-colors ${nationInfoTab === 'economy' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                      >
                        {language === 'ru' ? 'Экономика' : 'Economy'}
                      </button>
                    </div>

                    {nationInfoTab === 'lore' ? (
                      <div className="space-y-2 text-sm">
                        {n.description ? (
                          <div className="bg-white/5 p-4 rounded-lg text-gray-300 italic whitespace-pre-wrap leading-relaxed border border-white/10">
                            {n.description}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8 italic bg-black/20 rounded-lg border border-white/5">
                            {t('noLore')}
                          </div>
                        )}
                      </div>
                    ) : nationInfoTab === 'politics' ? (
                      <div className="space-y-4">
                        {n.parties && n.parties.length > 0 ? (
                          <div className="bg-black/20 border border-white/5 rounded-lg p-3">
                            <h4 className="text-sm font-bold text-gray-300 mb-4 text-center">{t('parties')}</h4>
                            <div className="h-48 relative overflow-hidden">
                              {n.parties && n.parties.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={n.parties}
                                      dataKey="percentage"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={0}
                                      outerRadius={80}
                                      paddingAngle={0}
                                      isAnimationActive={false}
                                      stroke="none"
                                      strokeWidth={0}
                                    >
                                      {n.parties.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                      itemStyle={{ color: '#fff' }}
                                      formatter={(value: number, name: string, props: any) => [`${value}% - ${tMapIdeology(language, props.payload.ideology)}`, name]}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {n.parties.sort((a, b) => b.percentage - a.percentage).map((party, idx) => (
                                <div key={idx} className="flex flex-col text-xs bg-black/40 p-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: party.color }}></span>
                                    <span className="font-bold truncate">{party.name}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-gray-400 mt-1">
                                    <span>{party.percentage}%</span>
                                    <span className="truncate ml-1">{tMapIdeology(language, party.ideology)}</span>
                                  </div>
                                  {party.leader && (
                                    <div className="text-gray-500 mt-0.5 truncate">{t('leader')}: {party.leader}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8 italic bg-black/20 rounded-lg border border-white/5">
                            {language === 'ru' ? 'В этой стране нет зарегистрированных партий.' : 'There are no registered parties in this nation.'}
                          </div>
                        )}
                      </div>
                    ) : nationInfoTab === 'economy' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                          <span className="text-gray-400">{language === 'ru' ? 'Текущий ВВП' : 'Current GDP'}</span>
                          <span className="font-bold text-green-400">${(n.gdp || 1000).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                          <span className="text-gray-400">{language === 'ru' ? 'Состояние' : 'State'}</span>
                          <span className="font-bold text-blue-400">{tMapEconomy(language, n.economyState || 'Стагнация')}</span>
                        </div>
                        <div className="bg-black/20 border border-white/5 rounded-lg p-3">
                          <h4 className="text-sm font-bold text-gray-300 mb-4 text-center">{language === 'ru' ? 'График ВВП' : 'GDP Chart'}</h4>
                          <div className="h-48 w-full relative overflow-hidden">
                            {n.gdpHistory && n.gdpHistory.length > 1 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={n.gdpHistory}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                  <XAxis 
                                    dataKey="time" 
                                    type="number" 
                                    domain={['dataMin', 'dataMax']} 
                                    hide 
                                  />
                                  <YAxis hide domain={['auto', 'auto']} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                                    itemStyle={{ color: '#4ade80' }}
                                    labelFormatter={(label) => new Date(Number(label)).toLocaleTimeString()}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'GDP']}
                                  />
                                  <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs italic">
                                {n.gdpHistory && n.gdpHistory.length === 1 ? (language === 'ru' ? 'Ожидание новых данных...' : 'Waiting for more data...') : (language === 'ru' ? 'Сбор данных...' : 'Collecting data...')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 text-sm">
                          {nationUnion && (
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-green-400 font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> Union</span>
                              <span className="text-green-300 font-bold"><EntityName entity={nationUnion} /></span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400">{t('ideology')}</span>
                            <span>{tMapIdeology(language, n.ideology)}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400">Status</span>
                            <span>{n.status}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1 items-center">
                            <span className="text-gray-400">{t('gdp')}</span>
                            <div className="text-right">
                              <span className="font-bold text-green-400">${n.gdp?.toLocaleString() || 1000}</span>
                              {n.gdpChange !== undefined && (
                                <span className={`ml-2 text-xs ${n.gdpChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {n.gdpChange >= 0 ? '+' : ''}{n.gdpChange}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400">{t('economy')}</span>
                            <span>{tMapEconomy(language, n.economyState || "Стагнация") || 'Стагнация'}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-gray-400">Territory Size</span>
                            <span>{n.territories.length} px</span>
                          </div>
                          {n.cities && n.cities.length > 0 && (
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-gray-400">Cities</span>
                              <span>{n.cities.length}</span>
                            </div>
                          )}
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
                                setIsCityMode(false);
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
                      </>
                    )}
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
                const senderUnion = senderNation ? unions.find(u => u.members.includes(senderNation.id)) : null;
                return (
                  <div key={msg.id} className="break-words leading-snug">
                    {senderUnion && (
                      <span className="font-bold text-green-400 mr-1" title={senderUnion.name}>
                        [{senderUnion.name}]
                      </span>
                    )}
                    {senderNation?.flag && (
                      <img src={senderNation.flag} alt={senderNation.name} title={senderNation.name} className="inline-block h-3 w-auto rounded-[2px] align-middle mr-1 -mt-0.5" />
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
          <div className="absolute bottom-4 right-4 flex flex-row justify-end gap-2 pointer-events-auto">
            <button 
              onClick={() => {
                setIsCityMode(!isCityMode);
                if (!isCityMode) {
                  setIsPaintingMode(false);
                  setIsRollMode(false);
                  setPlacingBattle(null);
                }
              }} 
              className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full flex items-center justify-center transition-colors shadow-lg ${isCityMode ? 'bg-blue-500/50 hover:bg-blue-500/70 border-blue-500/50' : 'hover:bg-gray-800/80'}`}
              title={t('buildCity')}
            >
              <Landmark className={`w-6 h-6 ${isCityMode ? 'text-white' : 'text-blue-400'}`} /> 
            </button>
            <button 
              onClick={() => {
                setIsRollMode(!isRollMode);
                if (!isRollMode) {
                  setIsPaintingMode(false);
                  setIsCityMode(false);
                  setPlacingBattle(null);
                }
              }} 
              className={`relative bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full flex items-center justify-center transition-colors shadow-lg ${isRollMode ? 'bg-orange-500/50 hover:bg-orange-500/70 border-orange-500/50' : 'hover:bg-gray-800/80'}`}
              title="Rolls (Colonization & War)"
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

        {/* City Creation Modal */}
        {showCityModal && selectedTerritoryIdx !== null && (
          <div className="absolute top-20 left-4 w-[350px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col z-50">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Landmark className="w-5 h-5 text-blue-400"/> {t('foundCityTitle')}</h2>
              <button 
                onClick={() => { 
                  setShowCityModal(false); 
                  setNewCityName(''); 
                }} 
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <p className="text-sm text-gray-400">{t('foundCityDesc')}</p>
              <input
                type="text"
                value={newCityName}
                onChange={e => setNewCityName(e.target.value)}
                placeholder={t('cityName')}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={() => {
                  if (newCityName.trim()) {
                    useGameStore.getState().createCity(newCityName.trim(), selectedTerritoryIdx);
                    setShowCityModal(false);
                    setNewCityName('');
                    setSelectedTerritoryIdx(null);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Основать
              </button>
            </div>
          </div>
        )}

        {/* City Details Modal */}
        {selectedCity && (
          <div className="absolute top-20 left-4 w-[350px] max-h-[calc(100vh-140px)] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl pointer-events-auto shadow-2xl overflow-hidden flex flex-col z-50">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Landmark className="w-5 h-5 text-blue-400"/> {t('cityInfo')}</h2>
              <button onClick={() => setSelectedCity(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {(() => {
                const nation = nations.find(n => n.id === selectedCity.nationId);
                const city = nation?.cities?.find(c => c.id === selectedCity.cityId);
                const isMyCity = myNation && nation && myNation.id === nation.id;
                
                if (!city || !nation) return <p>{language === 'ru' ? 'Данные города не найдены' : 'City data not found'}</p>;

                // Format population (e.g. 1000 -> 1 000)
                const popDisplay = city.population ? city.population.toLocaleString('ru-RU') : t('noData');
                
                return (
                  <div className="space-y-4">
                    {isMyCity ? (
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{t('cityName')}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue={city.name}
                            id="renameCityInput"
                            className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('renameCityInput') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                useGameStore.getState().renameCity(city.id, input.value.trim());
                                setSelectedCity(null);
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-black tracking-tight">{city.name}</h3>
                        <p className="text-sm text-gray-400">{t('belongsTo')}: {nation.shortName}</p>
                      </div>
                    )}
                    
                    <div className="bg-black/40 border border-white/5 p-4 rounded-lg flex items-center justify-between">
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">{t('population')}</span>
                      <span className="font-mono text-lg text-emerald-400 break-words">{popDisplay} {language === 'ru' ? 'чел.' : 'pop.'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Full-Screen Telegram-like Mail Modal */}
        {showMail && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
              {!myNation ? (
                <div className="bg-[#1c1c1e] max-w-md w-full p-8 rounded-2xl border border-white/10 text-center shadow-2xl relative pointer-events-auto">
                  <button onClick={() => setShowMail(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
                  <Mail className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">{language === 'ru' ? 'Почта недоступна' : 'Mail locked'}</h3>
                  <p className="text-gray-400">{language === 'ru' ? 'Вы должны создать государство для начала использования внутренней почты.' : 'You must create a nation to start using internal mail.'}</p>
                </div>
              ) : (
                <div className="w-full max-w-5xl h-[85vh] bg-[#1c1c1e] text-white border border-[#2c2c2e] rounded-2xl shadow-2xl flex overflow-hidden relative pointer-events-auto">
                   {/* Left Sidebar */}
                   <div className="w-80 bg-[#1c1c1e] border-r border-[#2c2c2e] flex flex-col shrink-0">
                      <div className="p-4 border-b border-[#2c2c2e] flex items-center justify-between">
                         <h2 className="text-lg font-bold flex items-center gap-2">
                            <Mail className="w-5 h-5 text-indigo-400"/>
                            {language === 'ru' ? 'Почта' : 'Mail'}
                         </h2>
                         <div className="flex items-center gap-1">
                           <button onClick={() => setNewMailChatTab(t => t === 'new' ? 'chats' : 'new')} className="text-gray-400 hover:text-white p-2 rounded hover:bg-white/5 transition-colors">
                              {newMailChatTab === 'new' ? <ArrowLeft className="w-5 h-5"/> : <Edit3 className="w-5 h-5"/>}
                           </button>
                           <button onClick={() => setShowMail(false)} className="md:hidden text-gray-400 hover:text-white p-2 rounded hover:bg-white/5 transition-colors">
                              <X className="w-5 h-5"/>
                           </button>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                         {newMailChatTab === 'new' ? (
                            <div className="p-4 space-y-4">
                              <h3 className="font-bold text-sm tracking-widest text-gray-400 uppercase mb-2">
                                {language === 'ru' ? 'Новый чат' : 'New Chat'}
                              </h3>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  {language === 'ru' ? 'Выберите получателей' : 'Select recipients'}
                                </label>
                                <select 
                                  multiple 
                                  className="w-full bg-[#2c2c2e] border border-transparent rounded px-2 py-2 text-sm focus:outline-none focus:border-indigo-500 h-40 custom-scrollbar"
                                  onChange={(e) => {
                                    const selectedIds = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                    setMailTo(selectedIds.join(','));
                                  }}
                                >
                                  {nations.filter(n => n.id !== myNation.id).map(n => (
                                    <option key={n.id} value={n.id}>{n.name} ({n.shortName})</option>
                                  ))}
                                </select>
                              </div>
                              <button 
                                onClick={() => {
                                  const parts = mailTo.split(',').filter(p => p.trim() !== '');
                                  if (parts.length > 0) {
                                    useGameStore.getState().createMailChat(parts);
                                    setNewMailChatTab('chats');
                                    setMailTo('');
                                  }
                                }}
                                disabled={!mailTo}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4"/> {language === 'ru' ? 'Создать чат' : 'Create Chat'}
                              </button>
                            </div>
                         ) : (
                            useGameStore.getState().mailChats.length > 0 ? (
                              useGameStore.getState().mailChats.map((chat) => {
                                const otherParticipantsIds = chat.participants.filter(id => id !== myNation.id);
                                let avatarNode = null;
                                let displayTitle = chat.title;

                                if (chat.type === 'private' && otherParticipantsIds.length === 1) {
                                   const pNat = nations.find(n => n.id === otherParticipantsIds[0]);
                                   displayTitle = displayTitle || pNat?.name || 'Unknown';
                                   if (pNat) {
                                      avatarNode = pNat.flag ? (
                                        <img src={pNat.flag} alt="flag" className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/5" />
                                      ) : (
                                        <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: pNat.color || '#555' }}>
                                          {(pNat.shortName || pNat.name)?.[0]?.toUpperCase()}
                                        </div>
                                      );
                                   } else {
                                      avatarNode = <div className="w-12 h-12 rounded-full bg-gray-800 shrink-0 flex items-center justify-center">?</div>;
                                   }
                                } else {
                                   const otherNames = otherParticipantsIds.map(id => nations.find(n => n.id === id)?.name || 'Unknown').join(', ');
                                   displayTitle = displayTitle || otherNames || (language === 'ru' ? 'Группа' : 'Group');
                                   avatarNode = <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 shrink-0 flex items-center justify-center border border-indigo-500/30"><Users className="w-6 h-6" /></div>;
                                }
                                
                                const isSelected = selectedMailChatId === chat.id;
                                const lastMessage = chat.messages[chat.messages.length - 1];

                                return (
                                  <div key={chat.id} 
                                    onClick={() => setSelectedMailChatId(chat.id)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-[#2c2c2e]/50 ${isSelected ? 'bg-indigo-600/20' : 'hover:bg-[#2c2c2e]'}`}
                                  >
                                    {avatarNode}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                          <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-300' : 'text-white'}`}>{displayTitle}</h3>
                                        </div>
                                        <p className={`text-xs truncate ${isSelected ? 'text-indigo-200/70' : 'text-gray-400'}`}>
                                          {lastMessage ? (
                                             lastMessage.type === 'transfer' ? '💰 ' + (language==='ru' ? 'Перевод' : 'Transfer') :
                                             lastMessage.type === 'treaty' ? '📜 ' + (language==='ru' ? 'Договор' : 'Treaty') :
                                             lastMessage.text
                                          ) : (language === 'ru' ? 'Нет сообщений' : 'No messages')}
                                        </p>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="text-center text-gray-500 mt-10 p-4">
                                {language === 'ru' ? 'У вас нет чатов. Начните общение, нажав на иконку создания чата.' : 'No chats found. Start a conversation by clicking new chat icon.'}
                              </div>
                            )
                         )}
                      </div>
                   </div>

                   {/* Center Messages */}
                   <div className="flex-1 flex flex-col min-w-0 bg-[#000000] relative">
                      <button onClick={() => setShowMail(false)} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white hidden md:block bg-black/40 p-1 rounded-full backdrop-blur-sm"><X className="w-5 h-5"/></button>
                      
                      {selectedMailChatId ? (() => {
                        const chat = useGameStore.getState().mailChats.find(c => c.id === selectedMailChatId);
                        if (!chat) return null;
                        
                        const otherParticipantsIds = chat.participants.filter(id => id !== myNation.id);
                        let displayTitle = chat.title;
                        if (chat.type === 'private' && otherParticipantsIds.length === 1) {
                           displayTitle = displayTitle || nations.find(n => n.id === otherParticipantsIds[0])?.name || 'Unknown';
                        } else {
                           displayTitle = displayTitle || otherParticipantsIds.map(id => nations.find(n => n.id === id)?.name || 'Unknown').join(', ') || 'Group';
                        }

                        return (
                          <>
                            <div className="bg-[#1c1c1e] border-b border-[#2c2c2e] p-3 flex items-center justify-between shrink-0 h-[68px]">
                              <div className="flex items-center gap-3 w-full">
                                <button onClick={() => setSelectedMailChatId(null)} className="md:hidden text-gray-400 hover:text-white p-1 ml-[-4px]">
                                  <ChevronLeft className="w-6 h-6"/>
                                </button>
                                <div>
                                  <h3 className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">{displayTitle}</h3>
                                  <p className="text-xs text-indigo-400">{chat.participants.length} {language==='ru' ? 'участников' : 'participants'}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar flex flex-col items-center">
                              {chat.messages.length === 0 ? (
                                <div className="m-auto text-center">
                                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                                     <MessageSquare className="w-8 h-8" />
                                  </div>
                                  <p className="text-gray-500 font-medium">{language === 'ru' ? 'Отправьте первое сообщение' : 'Send the first message'}</p>
                                </div>
                              ) : (
                                <div className="w-full max-w-3xl space-y-4">
                                {chat.messages.map((msg) => {
                                  const isMe = msg.senderId === myNation.id;
                                  const senderNat = nations.find(n => n.id === msg.senderId);
                                  const senderName = isMe ? myNation.shortName : (senderNat?.shortName || 'Unknown');
                                  
                                  const avatarNode = senderNat?.flag ? (
                                    <img src={senderNat.flag} alt="flag" className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[10px] shadow-inner" style={{ backgroundColor: senderNat?.color || '#555' }}>
                                      {(senderNat?.shortName || senderNat?.name)?.[0]?.toUpperCase()}
                                    </div>
                                  );

                                  return (
                                    <div key={msg.id} className={`flex gap-3 w-full ${isMe ? 'flex-row-reverse' : ''}`}>
                                      {avatarNode}
                                      <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] text-gray-500 mb-1 px-1">{senderName}</span>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                          msg.type === 'transfer' ? 'bg-[#3d2b1f] border border-[#d97706]/30 text-amber-100 rounded-tr-sm' :
                                          msg.type === 'treaty' ? 'bg-[#2d1b4e] border border-[#a855f7]/30 text-purple-100 rounded-tl-sm' :
                                          isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-[#2c2c2e] text-white rounded-tl-sm'
                                        }`}>
                                          {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}
                                          {msg.type === 'transfer' && (
                                            <div className="mt-1 font-bold text-amber-400 text-base flex flex-col gap-0.5">
                                              <div className="flex items-center gap-1">💰 {language === 'ru' ? 'Перевод: $' : 'Transfer: $'}{msg.amount?.toLocaleString()}</div>
                                              {msg.transferTarget && msg.transferTarget !== 'all' && (
                                                 <div className="text-[10px] text-amber-500/70 font-normal">
                                                   {language === 'ru' ? 'Получатель:' : 'To:'} {nations.find(n => n.id === msg.transferTarget)?.name || 'Unknown'}
                                                 </div>
                                              )}
                                            </div>
                                          )}
                                          {msg.type === 'treaty' && msg.treatyId && (
                                            <div className="mt-2 flex flex-col gap-2">
                                              {(() => {
                                                 const tr = useGameStore.getState().treaties.find(t => t.id === msg.treatyId);
                                                 if (!tr) return <span className="text-purple-300 text-xs text-center border-t border-purple-500/30 pt-2 block">{language === 'ru' ? 'Договор не найден' : 'Treaty not found'}</span>;
                                                 const isSigned = tr.signatures.includes(myNation.id);
                                                 const isRequired = tr.requiredSigners.includes(myNation.id);
                                                 return (
                                                   <div className="bg-black/30 rounded border border-purple-500/20 overflow-hidden text-left">
                                                     <div className="p-3 bg-purple-500/10 border-b border-purple-500/20">
                                                        <h4 className="font-bold text-purple-200 text-base">{tr.title}</h4>
                                                     </div>
                                                     <div className="p-3 text-sm text-purple-100 whitespace-pre-wrap">
                                                        {tr.content}
                                                     </div>
                                                     <div className="px-3 py-2 bg-black/40 text-xs">
                                                        <span className="text-purple-400 font-medium block mb-1">{language === 'ru' ? 'Подписи:' : 'Signatures:'} {tr.signatures.length}/{tr.requiredSigners.length}</span>
                                                        <div className="flex flex-wrap gap-1">
                                                          {tr.requiredSigners.map(s => {
                                                             const signed = tr.signatures.includes(s);
                                                             const n = nations.find(x => x.id === s);
                                                             if (!n) return null;
                                                             return (
                                                               <span key={s} className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${signed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                                                                 {n.shortName}
                                                               </span>
                                                             )
                                                          })}
                                                        </div>
                                                     </div>
                                                     {tr.status === 'active' && (
                                                        <div className="p-2 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border-t border-emerald-500/20">
                                                          {language === 'ru' ? 'ДОГОВОР ВСТУПИЛ В СИЛУ' : 'TREATY ACTIVE'}
                                                        </div>
                                                     )}
                                                     {tr.status === 'pending' && isRequired && !isSigned && (
                                                        <button onClick={() => useGameStore.getState().signTreaty(tr.id)} className="w-full p-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors uppercase tracking-wider">
                                                          {language === 'ru' ? 'Подписать' : 'Sign Treaty'}
                                                        </button>
                                                     )}
                                                   </div>
                                                 );
                                              })()}
                                            </div>
                                          )}
                                          <div className={`text-[10px] text-right mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                </div>
                              )}
                            </div>
                            
                            <div className="bg-[#1c1c1e] p-3 shrink-0 relative border-t border-[#2c2c2e]">
                               {attachType !== 'none' && (
                                 <div className="absolute bottom-full left-0 right-0 p-2 pointer-events-none">
                                   <div className="mx-auto max-w-3xl bg-[#2c2c2e] border border-[#3c3c3e] rounded-lg p-3 shadow-xl pointer-events-auto flex items-center justify-between">
                                      <div>
                                        <span className={`font-bold uppercase text-xs tracking-wider flex items-center gap-1 ${attachType === 'transfer' ? 'text-amber-400' : 'text-purple-400'}`}>
                                           {attachType === 'transfer' ? <><Landmark className="w-3 h-3"/> {language === 'ru' ? 'Перевод средств' : 'Money Transfer'}</> : <><Shield className="w-3 h-3"/> {language === 'ru' ? 'Заключение договора' : 'Treaty Proposal'}</>}
                                        </span>
                                        {attachType === 'transfer' && (
                                           <div className="flex flex-col gap-2 mt-2">
                                             <div className="flex items-center gap-3">
                                               <div className="flex items-center bg-black/40 rounded border border-white/5 overflow-hidden">
                                                 <span className="text-gray-400 px-2 text-sm">$</span>
                                                 <input type="number" value={attachAmount || ''} onChange={e => setAttachAmount(Number(e.target.value))} className="w-32 bg-transparent border-none focus:ring-0 px-2 py-1.5 text-sm text-amber-100 placeholder-gray-600 focus:outline-none" placeholder={language==='ru' ? 'Сумма' : 'Amount'} />
                                               </div>
                                               <span className="text-xs text-gray-500">
                                                 {language === 'ru' ? 'Доступно: $' : 'Available: $'}{myNation.budget?.toLocaleString() || 0}
                                               </span>
                                             </div>
                                             {chat.participants.length > 2 && (
                                                <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)} className="bg-black/40 border border-white/5 rounded px-2 py-1 text-sm text-white focus:outline-none w-max">
                                                  <option value="all">{language === 'ru' ? 'Всем поровну' : 'Split equally amongst all'}</option>
                                                  {chat.participants.filter((p: string) => p !== myNation.id).map((p: string) => {
                                                    const nat = nations.find(n => n.id === p);
                                                    if (!nat) return null;
                                                    return <option key={p} value={p}>{nat.name}</option>;
                                                  })}
                                                </select>
                                             )}
                                           </div>
                                        )}
                                        {attachType === 'treaty' && (
                                           <div className="mt-1 text-xs text-gray-400">
                                             {language === 'ru' ? 'Напишите текст договора в поле сообщения ниже.' : 'Write the treaty conditions in the message field below.'}
                                           </div>
                                        )}
                                      </div>
                                      <button onClick={() => { setAttachType('none'); setAttachAmount(0); }} className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/5"><X className="w-5 h-5" /></button>
                                   </div>
                                 </div>
                               )}
                               <form onSubmit={(e) => {
                                 e.preventDefault();
                                 if (!mailMessage.trim() && !(attachType === 'transfer' && attachAmount > 0)) return;
                                 let summary = '';
                                 if (attachType === 'treaty') summary = mailMessage.trim();
                                 useGameStore.getState().sendMailMessage(chat.id, mailMessage, attachType === 'none' ? 'text' : attachType, attachAmount || 0, summary, transferTarget);
                                 setMailMessage('');
                                 setAttachAmount(0);
                                 setAttachType('none');
                               }} className="max-w-3xl mx-auto flex items-end gap-2 relative">
                                 {showAttachMenu && (
                                    <div className="absolute bottom-full left-0 mb-3 w-56 bg-[#2c2c2e] border border-[#3c3c3e] rounded-xl shadow-2xl overflow-hidden z-20">
                                       <button type="button" onClick={() => { setAttachType('transfer'); setShowAttachMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-[#3c3c3e] flex items-center gap-3 text-sm text-white transition-colors">
                                          <div className="bg-amber-500/20 p-1.5 rounded-lg"><Landmark className="w-4 h-4 text-amber-400" /></div> {language === 'ru' ? 'Перевод денег' : 'Transfer Money'}
                                       </button>
                                       <button type="button" onClick={() => { 
                                          setTreatyDraftSigners(chat.participants.filter(p => p !== myNation.id));
                                          setShowTreatyDraft(true); 
                                          setShowAttachMenu(false); 
                                       }} className="w-full text-left px-4 py-3 hover:bg-[#3c3c3e] flex items-center gap-3 text-sm text-white border-t border-[#3c3c3e] transition-colors">
                                          <div className="bg-purple-500/20 p-1.5 rounded-lg"><Shield className="w-4 h-4 text-purple-400" /></div> {language === 'ru' ? 'Договор или сделка' : 'Agreement / Treaty'}
                                       </button>
                                    </div>
                                 )}
                                 <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-3 text-gray-400 hover:text-indigo-400 rounded-full hover:bg-white/5 transition-colors shrink-0">
                                   <Plus className={`w-6 h-6 transition-transform ${showAttachMenu ? 'rotate-45 text-white' : ''}`} />
                                 </button>
                                 <textarea 
                                   rows={1}
                                   placeholder={attachType==='treaty' ? (language === 'ru' ? "Опишите условия договора..." : "Describe treaty conditions...") : (language === 'ru' ? "Написать сообщение..." : "Write a message...")}
                                   className="flex-1 bg-[#2c2c2e] border border-transparent focus:border-indigo-500/50 rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none overflow-hidden max-h-32 custom-scrollbar shadow-inner"
                                   value={mailMessage}
                                   onChange={e => {
                                     e.target.style.height = 'auto';
                                     e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                     setMailMessage(e.target.value);
                                   }}
                                   onKeyDown={e => {
                                      if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        e.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                      }
                                   }}
                                 />
                                 <button 
                                  type="submit" 
                                  disabled={(!mailMessage.trim() && !(attachType === 'transfer' && attachAmount > 0))} 
                                  className="p-3 bg-indigo-600 text-white hover:bg-indigo-500 rounded-full transition-colors disabled:opacity-50 disabled:bg-[#2c2c2e] disabled:text-gray-500 shrink-0 shadow-lg"
                                 >
                                   <Send className="w-5 h-5 ml-0.5" />
                                 </button>
                               </form>
                            </div>
                          </>
                        );
                      })() : (
                        <div className="m-auto text-center p-8 bg-[#1c1c1e]/50 rounded-2xl border border-white/5">
                           <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                           <h3 className="text-xl font-bold text-gray-400 mb-2">{language === 'ru' ? 'Выберите чат' : 'Select a chat'}</h3>
                           <p className="text-sm text-gray-500">{language === 'ru' ? 'Выберите кому хотели бы написать из списка слева' : 'Choose who you would like to write to from the list on the left'}</p>
                        </div>
                      )}
                   </div>

                   {/* Right Sidebar: Group Info */}
                   {selectedMailChatId && (() => {
                      const chat = useGameStore.getState().mailChats.find(c => c.id === selectedMailChatId);
                      if (!chat || chat.type !== 'group') return null;
                      return (
                        <div className="w-64 bg-[#1c1c1e] border-l border-[#2c2c2e] flex flex-col shrink-0 hidden lg:flex">
                           <div className="p-4 border-b border-[#2c2c2e]">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                {language === 'ru' ? 'Информация о группе' : 'Group Info'}
                             </h3>
                             
                             <div className="mb-4">
                                <label className="text-[10px] text-gray-500 mb-1 block uppercase tracking-wider">{language === 'ru' ? 'Название группы' : 'Group Name'}</label>
                                {isRenamingChat ? (
                                   <div className="flex gap-1">
                                      <input 
                                        type="text" 
                                        value={editChatTitle} 
                                        onChange={e => setEditChatTitle(e.target.value)} 
                                        className="flex-1 bg-[#2c2c2e] px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white" 
                                        autoFocus
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            useGameStore.getState().renameMailChat(chat.id, editChatTitle);
                                            setIsRenamingChat(false);
                                          }
                                        }}
                                      />
                                      <button onClick={() => {
                                         useGameStore.getState().renameMailChat(chat.id, editChatTitle);
                                         setIsRenamingChat(false);
                                      }} className="bg-indigo-600 hover:bg-indigo-500 p-1.5 rounded text-white"><Check className="w-4 h-4"/></button>
                                   </div>
                                ) : (
                                   <div className="flex items-center justify-between group cursor-pointer p-1.5 -mx-1.5 rounded hover:bg-[#2c2c2e]" onClick={() => setIsRenamingChat(true)}>
                                      <span className="text-sm font-medium truncate pr-2">{chat.title || (language==='ru'?'Группа':'Group')}</span>
                                      <Edit2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                   </div>
                                )}
                             </div>
                           </div>
                           
                           <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2c2c2e] pb-2 mb-3">
                                {language === 'ru' ? 'Участники' : 'Participants'} <span className="text-gray-500 ml-1 font-normal">({chat.participants.length})</span>
                             </h3>
                             <div className="space-y-3">
                                {chat.participants.map(pId => {
                                   const pNat = nations.find(n => n.id === pId);
                                   if (!pNat) return null;
                                   return (
                                      <div key={pId} className="flex items-center gap-3">
                                         {pNat.flag ? (
                                            <img src={pNat.flag} alt="f" className="w-8 h-8 rounded-full border border-white/5 object-cover" />
                                         ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] flex items-center justify-center border border-indigo-500/20">
                                               {pNat.shortName?.[0]?.toUpperCase()}
                                            </div>
                                         )}
                                         <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate text-gray-200">{pNat.name}</span>
                                            <span className="text-[10px] text-gray-500 truncate">{pNat.shortName}</span>
                                         </div>
                                      </div>
                                   );
                                })}
                             </div>
                           </div>
                        </div>
                      );
                   })()}
                </div>
              )}
           </div>
        )}

        {/* Treaty Draft Modal */}
        {showTreatyDraft && myNation && selectedMailChatId && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-[#1c1c1e] text-white border border-[#2c2c2e] rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col pointer-events-auto max-h-[90vh]">
                   <div className="p-4 border-b border-[#2c2c2e] flex items-center justify-between">
                     <h3 className="font-bold text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400"/> {language === 'ru' ? 'Новый договор' : 'New Treaty'}</h3>
                     <button onClick={() => setShowTreatyDraft(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
                   </div>
                   <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                     <div>
                       <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{language === 'ru' ? 'Название договора' : 'Treaty Title'}</label>
                       <input type="text" value={treatyDraftTitle} onChange={e => setTreatyDraftTitle(e.target.value)} placeholder={language === 'ru' ? 'Напр., Торговое соглашение...' : 'e.g., Trade Agreement...'} className="w-full bg-black/40 border border-white/5 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                     </div>
                     <div>
                       <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{language === 'ru' ? 'Условия' : 'Conditions'}</label>
                       <textarea value={treatyDraftContent} onChange={e => setTreatyDraftContent(e.target.value)} rows={6} className="w-full bg-black/40 border border-white/5 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none" placeholder={language === 'ru' ? 'Текст договора...' : 'Treaty text...'} />
                     </div>
                     <div>
                       <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">{language === 'ru' ? 'Требуемые подписи' : 'Required Signatures'}</label>
                       {(() => {
                         const chat = useGameStore.getState().mailChats.find(c => c.id === selectedMailChatId);
                         const otherParticipants = chat ? chat.participants.filter(p => p !== myNation.id) : [];
                         return (
                           <div className="space-y-2 bg-black/20 p-3 rounded-lg border border-white/5">
                             {otherParticipants.map(pid => {
                               const nat = nations.find(n => n.id === pid);
                               if (!nat) return null;
                               return (
                                 <label key={pid} className="flex items-center gap-3 cursor-pointer">
                                   <input type="checkbox" checked={treatyDraftSigners.includes(pid)} onChange={(e) => {
                                     if(e.target.checked) setTreatyDraftSigners([...treatyDraftSigners, pid]);
                                     else setTreatyDraftSigners(treatyDraftSigners.filter(id => id !== pid));
                                   }} className="rounded bg-black border border-white/20 text-purple-600 focus:ring-0 w-4 h-4" />
                                   <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] bg-gray-700 overflow-hidden relative">
                                        {nat.flag ? (
                                           <img src={nat.flag} alt="" className="w-full h-full object-cover" crossOrigin="anonymous"/>
                                        ) : (
                                           nat.shortName?.[0]?.toUpperCase()
                                        )}
                                   </div>
                                   <span className="text-sm">{nat.name}</span>
                                 </label>
                               )
                             })}
                           </div>
                         )
                       })()}
                     </div>
                   </div>
                   <div className="p-4 border-t border-[#2c2c2e] flex justify-end gap-2">
                     <button onClick={() => setShowTreatyDraft(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors">
                       {language === 'ru' ? 'Отмена' : 'Cancel'}
                     </button>
                     <button disabled={!treatyDraftTitle.trim() || !treatyDraftContent.trim()} onClick={() => {
                        useGameStore.getState().proposeTreaty(treatyDraftTitle, treatyDraftContent, [myNation.id, ...treatyDraftSigners], selectedMailChatId, `${language === 'ru' ? 'Предложен договор:' : 'Treaty Proposed:'} ${treatyDraftTitle}`);
                        setShowTreatyDraft(false);
                        setTreatyDraftTitle('');
                        setTreatyDraftContent('');
                     }} className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-colors disabled:opacity-50">
                       {language === 'ru' ? 'Отправить' : 'Propose'}
                     </button>
                   </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
