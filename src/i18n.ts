export const translations = {
  en: {
    // General
    settings: 'Settings',
    language: 'Language',
    cancel: 'Cancel',
    save: 'Save',
    saveChanges: 'Save Changes',
    close: 'Close',
    
    // Setup
    joinServer: 'Join Global Server',
    enterName: 'Enter your name...',
    connecting: 'Connecting to server...',
    connectedAs: 'Connected as',
    
    // Spawn
    foundNation: 'Found a Nation',
    fullName: 'Full Name',
    shortName: 'Short Name',
    ideology: 'Ideology',
    color: 'Color',
    flag: 'National Flag',
    searchFlags: 'Search Flags',
    uploadCustom: 'Upload Custom',
    url: 'URL',
    loreDesc: 'Lore / Description (Optional)',
    lorePlaceholder: 'Describe the history of your nation...',
    depStatus: 'Dependency Status',
    selectTerritory: 'Select Territory',
    drawBorders: 'Draw Your Borders',
    drawBordersDesc: 'Click and drag on the map to claim land.',
    territory: 'Territory',
    back: 'Back',
    confirmSpawn: 'Confirm Spawn',
    
    // HUD / Toolbars
    alliances: 'Alliances',
    wars: 'Wars',
    un: 'UN',
    unions: 'Unions',
    
    // Nation Settings
    nationSettings: 'Nation Settings',
    economy: 'Economy',
    gdp: 'GDP',
    economyState: 'Economy State',
    overheat: 'Overheating',
    overheatLocked: 'Economy locked after overheat.',
    disbandNation: 'Disband Nation',
    disbandConfirm: 'Are you sure? Your nation will be permanently deleted.',
    
    // Cities
    buildCity: 'Build City',
    foundCityTitle: 'Found a City',
    foundCityDesc: 'Enter a name for the new city on the selected territory.',
    cityName: 'City Name',
    cityInfo: 'City Information',
    belongsTo: 'Belongs to',
    population: 'Population',
    noData: 'No Data',
    noLore: 'The history of this nation is yet to be written...',
    // Categories & Tabs
    tabInfo: 'Info',
    tabLore: 'Lore',
    tabPolitics: 'Politics',
    tabSettingsGeneral: 'General',
    tabSettingsEconomy: 'Economy',
    tabSettingsPolitics: 'Politics',
    parties: 'Political Parties',
    partyName: 'Party Name',
    partyColor: 'Color',
    leader: 'Leader',
    percentage: 'Percentage (%)',
    addParty: 'Add Party',
    leaderOptional: 'Leader (Optional)',
    total: 'Total',
    
    // Actions
    publishNews: 'Publish News',
    newsPlaceholder: 'Publish news...',
    wait: 'Wait',
    send: 'Send',
    spawnRequest: 'Spawn Request',
    approve: 'Approve',
    reject: 'Reject'
  },
  ru: {
    settings: 'Настройки',
    language: 'Язык',
    cancel: 'Отмена',
    save: 'Сохранить',
    saveChanges: 'Сохранить изменения',
    close: 'Закрыть',
    
    joinServer: 'Присоединиться',
    enterName: 'Введите ваше имя...',
    connecting: 'Подключение к серверу...',
    connectedAs: 'Вы подключены как',
    
    foundNation: 'Основать страну',
    fullName: 'Полное название',
    shortName: 'Короткое название',
    ideology: 'Идеология',
    color: 'Цвет',
    flag: 'Флаг',
    searchFlags: 'Поиск флагов',
    uploadCustom: 'Загрузить',
    url: 'Ссылка',
    loreDesc: 'Описание (Лор - по желанию)',
    lorePlaceholder: 'Опишите историю вашей страны...',
    depStatus: 'Статус зависимости',
    selectTerritory: 'Выбрать территорию',
    drawBorders: 'Нарисовать границы',
    drawBordersDesc: 'Кликайте и тяните по карте, чтобы занять землю.',
    territory: 'Территория',
    back: 'Назад',
    confirmSpawn: 'Основать',
    
    alliances: 'Альянсы',
    wars: 'Войны',
    un: 'ООН',
    unions: 'Унии',
    
    nationSettings: 'Настройки страны',
    economy: 'Экономика',
    gdp: 'ВВП',
    economyState: 'Состояние экономики',
    overheat: 'Перегрев',
    overheatLocked: 'Экономика заблокирована после перегрева.',
    disbandNation: 'Удалить страну',
    disbandConfirm: 'Вы уверены? Ваша страна будет навсегда удалена.',
    
    buildCity: 'Основать город',
    foundCityTitle: 'Основать город',
    foundCityDesc: 'Введите название для нового города на выбранной территории.',
    cityName: 'Название города',
    cityInfo: 'Информация о городе',
    belongsTo: 'Принадлежит',
    population: 'Население',
    noData: 'Нет данных',
    noLore: 'История этой страны пока не написана...',
    // Categories & Tabs
    tabInfo: 'Основное',
    tabLore: 'Лор',
    tabPolitics: 'Политика',
    tabSettingsGeneral: 'Основное',
    tabSettingsEconomy: 'Экономика',
    tabSettingsPolitics: 'Политика',
    parties: 'Политические партии',
    partyName: 'Название партии',
    partyColor: 'Цвет',
    leader: 'Лидер',
    percentage: 'Процент (%)',
    addParty: 'Добавить партию',
    leaderOptional: 'Лидер (необяз.)',
    total: 'Всего',
    territorySize: 'Размер территории',
    cities: 'Города',
    
    publishNews: 'Опубликовать новость',
    newsPlaceholder: 'Опубликовать новость...',
    wait: 'Ожидайте',
    send: 'Отправить',
    spawnRequest: 'Запрос на создание',
    approve: 'Одобрить',
    reject: 'Отклонить'
  }
};

export type Language = 'en' | 'ru';
export type TranslationKey = keyof typeof translations.en;

export const tMapIdeology = (lang: Language, ideology: string) => {
  const map: Record<string, any> = {
    'Демократия': {en: 'Democracy', ru: 'Демократия'},
    'Коммунизм': {en: 'Communism', ru: 'Коммунизм'},
    'Фашизм': {en: 'Fascism', ru: 'Фашизм'},
    'Монархия': {en: 'Monarchy', ru: 'Монархия'},
    'Диктатура': {en: 'Dictatorship', ru: 'Диктатура'},
    'Теократия': {en: 'Theocracy', ru: 'Теократия'},
    'Анархия': {en: 'Anarchy', ru: 'Анархия'},
    'Democracy': {en: 'Democracy', ru: 'Демократия'},
    'Communism': {en: 'Communism', ru: 'Коммунизм'},
    'Fascism': {en: 'Fascism', ru: 'Фашизм'},
    'Anarcho-capitalism': {en: 'Anarcho-capitalism', ru: 'Анархо-капитализм'},
    'Theocracy': {en: 'Theocracy', ru: 'Теократия'},
    'Monarchy': {en: 'Monarchy', ru: 'Монархия'},
    'Social Democracy': {en: 'Social Democracy', ru: 'Социал-демократия'},
    'Technocracy': {en: 'Technocracy', ru: 'Технократия'},
    'Oligarchy': {en: 'Oligarchy', ru: 'Олигархия'},
    'Meritocracy': {en: 'Meritocracy', ru: 'Меритократия'},
    'Feudalism': {en: 'Feudalism', ru: 'Феодализм'},
    'Tribalism': {en: 'Tribalism', ru: 'Трайбализм'},
    'Corporatocracy': {en: 'Corporatocracy', ru: 'Корпоратократия'},
    'Eco-Socialism': {en: 'Eco-Socialism', ru: 'Эко-социализм'},
    'Libertarianism': {en: 'Libertarianism', ru: 'Либертарианство'},
    'Dictatorship': {en: 'Dictatorship', ru: 'Диктатура'},
    'Anarchy': {en: 'Anarchy', ru: 'Анархия'},
  };
  return map[ideology]?.[lang] || ideology;
};

export const tMapEconomy = (lang: Language, state: string) => {
  const map: Record<string, any> = {
    'Депрессия': {en: 'Depression', ru: 'Депрессия'},
    'Рецессия': {en: 'Recession', ru: 'Рецессия'},
    'Стагнация': {en: 'Stagnation', ru: 'Стагнация'},
    'Рост': {en: 'Growth', ru: 'Рост'},
    'Экономический бум': {en: 'Economic Boom', ru: 'Экономический бум'},
    'Depression': {en: 'Depression', ru: 'Депрессия'},
    'Recession': {en: 'Recession', ru: 'Рецессия'},
    'Stagnation': {en: 'Stagnation', ru: 'Стагнация'},
    'Growth': {en: 'Growth', ru: 'Рост'},
    'Economic Boom': {en: 'Economic Boom', ru: 'Экономический бум'}
  };
  return map[state]?.[lang] || state;
};
