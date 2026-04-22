const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const reps = [
  ["setToast('Заявка отправлена!');", "setToast(language === 'ru' ? 'Заявка отправлена!' : 'Request sent!');"],
  ["name: 'Природа', shortName: 'Природа'", "name: language === 'ru' ? 'Природа' : 'Nature', shortName: language === 'ru' ? 'Природа' : 'Nature'"],
  ["'Атакующий'", "language === 'ru' ? 'Атакующий' : 'Attacker'"],
  ["'Защитник'", "language === 'ru' ? 'Защитник' : 'Defender'"],
  ['"Колонизация" : "Битва"', "language === 'ru' ? 'Колонизация' : 'Colonization' : (language === 'ru' ? 'Битва' : 'Battle')"],
  ['"ГОТОВ" : "НАЧАТЬ"', "language === 'ru' ? 'ГОТОВ' : 'READY' : (language === 'ru' ? 'НАЧАТЬ' : 'START')"],
  ["'Ничья'", "language === 'ru' ? 'Ничья' : 'Draw'"],
  ["'Победа: '", "language === 'ru' ? 'Победа: ' : 'Victory: '"],
  ["\`Победа:", "\`\${language === 'ru' ? 'Победа:' : 'Victory:'}"],
  ["{newsCooldown > 0 ? `${newsCooldown}с` : 'Отправить'}", "{newsCooldown > 0 ? `${newsCooldown}s` : t('send')}"],
  ["> Настройки альянса<", "> {language === 'ru' ? 'Настройки альянса' : 'Alliance Settings'}<"],
  [">Название альянса<", ">{t('allianceName')}<"],
  [">Описание<", ">{language === 'ru' ? 'Описание' : 'Description'}<"],
  ["> Настройки союза<", "> {language === 'ru' ? 'Настройки союза' : 'Union Settings'}<"],
  [">Название союза<", ">{language === 'ru' ? 'Название союза' : 'Union Name'}<"],
  [">Цвет союза<", ">{language === 'ru' ? 'Цвет союза' : 'Union Color'}<"],
  [">Основное<", ">{t('tabInfo')}<"],
  [">Лор<", ">{t('tabLore')}<"],
  [">История этой страны пока не написана...<", ">{t('noLore')}<"],
  [">Данные города не найдены<", ">{language === 'ru' ? 'Данные города не найдены' : 'City data not found'}<"],
  [">Основать<", ">{t('confirmSpawn')}<"],
  ["чел.", "{language === 'ru' ? 'чел.' : 'pop.'}"]
];

for (const [search, replace] of reps) {
  content = content.replaceAll(search, replace);
}

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched stage 2.');
