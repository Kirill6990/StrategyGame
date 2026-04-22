const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replacements
const reps = [
  // Intro / HUD
  [`"Join Global Server"`, `{t('joinServer')}`],
  [`"Enter your name..."`, `{t('enterName')}`],
  [`"Connecting to server..."`, `{t('connecting')}`],
  [`"Connected as"`, `{t('connectedAs')}`],

  // Icons / Buttons
  [`title="Settings"`, `title={t('settings')}`],
  [`title="Alliances"`, `title={t('alliances')}`],
  [`title="Wars"`, `title={t('wars')}`],
  [`title="UN"`, `title={t('un')}`],
  [`title="Unions"`, `title={t('unions')}`],
  [`title="Build City"`, `title={t('buildCity')}`],
  
  // HUD buttons
  [`"Publish News"`, `{t('publishNews')}`],
  [`"Publish news..."`, `{t('newsPlaceholder')}`],

  // Spawn Form
  [`>Found a Nation<`, `>{t('foundNation')}<`],
  [`>Full Name<`, `>{t('fullName')}<`],
  [`>Short Name<`, `>{t('shortName')}<`],
  [`>Ideology<`, `>{t('ideology')}<`],
  [`>Описание (Лор - по желанию)<`, `>{t('loreDesc')}<`],
  [`placeholder="Опишите историю вашей страны..."`, `placeholder={t('lorePlaceholder')}`],
  [`>Color<`, `>{t('color')}<`],
  [`>National Flag<`, `>{t('flag')}`],
  [`>Search Flags<`, `>{t('searchFlags')}<`],
  [`>Upload Custom<`, `>{t('uploadCustom')}<`],
  [`>URL<`, `>{t('url')}<`],
  [`>Dependency Status<`, `>{t('depStatus')}<`],
  [`>Select Territory<`, `>{t('selectTerritory')}<`],
  [`>Draw Your Borders<`, `>{t('drawBorders')}<`],
  [`>Click and drag on the map to claim land.<`, `>{t('drawBordersDesc')}<`],
  [`>Territory<`, `>{t('territory')}<`],
  [`> Back<`, `> {t('back')}<`],
  [`>Confirm Spawn<`, `>{t('confirmSpawn')}<`],

  // Nation Settings Modal
  [`> Настройки страны<`, `> {t('nationSettings')}<`],
  [`>Полное название<`, `>{t('fullName')}<`],
  [`>Короткое название<`, `>{t('shortName')}<`],
  [`>Идеология<`, `>{t('ideology')}<`],
  [`>Описание (Лор)<`, `>{t('loreDesc')}<`],
  [`>Цвет<`, `>{t('color')}<`],
  [`>Флаг (URL или файл)<`, `>{t('flag')}<`],
  [`>Экономика<`, `>{t('economy')}<`],
  [`>ВВП:<`, `>{t('gdp')}:<`],
  [`>Состояние экономики<`, `>{t('economyState')}<`],
  [`>Перегрев<`, `>{t('overheat')}<`],
  [`>Экономика заблокирована после перегрева.<`, `>{t('overheatLocked')}<`],
  [`>Сохранить изменения<`, `>{t('saveChanges')}<`],
  [`>Вы уверены? Ваша страна будет навсегда удалена.<`, `>{t('disbandConfirm')}<`],
  [`>Удалить страну<`, `>{t('disbandNation')}<`],

  // City Creation Modal
  [`> Основать город<`, `> {t('foundCityTitle')}<`],
  [`>Введите название для нового города на выбранной территории.<`, `>{t('foundCityDesc')}<`],
  [`placeholder="Название города"`, `placeholder={t('cityName')}`],
  [`>Основать<`, `>{t('confirmSpawn')}<`],

  // City Details Modal
  [`> Информация о городе<`, `> {t('cityInfo')}<`],
  [`>Название города<`, `>{t('cityName')}<`],
  [`>Сохранить<`, `>{t('save')}<`],
  [`Принадлежит: `, `{t('belongsTo')}: `],
  [`>Население<`, `>{t('population')}<`],
  [`Нет данных`, `{t('noData')}`],

  // Nation Info Tab
  [`>Основное<`, `>{t('tabInfo')}<`],
  [`>Лор<`, `>{t('tabLore')}<`],
  [`>История этой страны пока не написана...<`, `>{t('noLore')}<`],
  [`>ВВП (GDP)<`, `>{t('gdp')}<`],

  // Additional fixes
  ['n.ideology', 'tMapIdeology(language, n.ideology)'],
  ['myNation.ideology', 'tMapIdeology(language, myNation.ideology)'],
  ['n.economyState', 'tMapEconomy(language, n.economyState || "Стагнация")'],
  ['myNation.economyState', 'tMapEconomy(language, myNation.economyState || "Стагнация")'],
  ['i}</option>', 'tMapIdeology(language, i)}</option>'],
  ['s}</option>', 'tMapEconomy(language, s)}</option>']
];

for (const [search, replace] of reps) {
  content = content.replaceAll(search, replace);
}

// Add state for language and imports if not present
if (!content.includes('import { translations, TranslationKey, Language, tMapIdeology, tMapEconomy } from')) {
    content = content.replace("import React, {", "import React, { useEffect,");
    content = `import { translations, TranslationKey, Language, tMapIdeology, tMapEconomy } from './i18n';\n` + content;
}

if (!content.includes('const [language, setLanguage]')) {
    const hookInsertionStr = "const [newsInput, setNewsInput] = useState('');";
    const languageStr = `
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'ru');
  const [showSettings, setShowSettings] = useState(false);
  
  useEffect(() => { localStorage.setItem('lang', language); }, [language]);
  
  const t = (key: TranslationKey) => translations[language][key] || translations['en'][key] || key;
  `;
    content = content.replace(hookInsertionStr, hookInsertionStr + "\n" + languageStr);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched.');
