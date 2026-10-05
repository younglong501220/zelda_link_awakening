import { DialogueLine } from '../types/game';

export function getMarinDialogue(instrumentCount: number): DialogueLine[] {
  if (instrumentCount === 0) {
    return [
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '林克……你醒了嗎？太好了！那天你在托隆波海灘昏迷不醒，我和爸爸差點嚇壞了呢。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '這座美麗的島嶼叫做「可湖霖島」……島上的微風總帶著青草與海潮的芬芳，大家都在這裡過著平靜的日子。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_sing',
        text: '村長爺爺常說，在北方聳立的塔瑪蘭奇山頂上，有一顆巨大的神聖之蛋，裡面沉睡著萬物之主「風之魚」。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '傳說唯有集齊沉眠在島嶼各處的【三件海妖樂器】，奏響樂章，才能喚醒風之魚離開這座島……',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '用你的劍砍開村邊的草叢，穿過南邊的沙灘與西方的迷失之森吧！林克，如果找到了樂器，能回來告訴我嗎？',
      },
    ];
  } else if (instrumentCount === 1) {
    return [
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_sing',
        text: '哇……你真的找到第一件海妖樂器了！那悠揚的琴韻，彷彿讓整座島上的花草都在輕輕搖曳。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '有時候我會一個人坐在南邊的沙灘上，望著遠方的水平線發呆……海的那一頭，真的有別的大陸與城堡嗎？',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '如果我也有一對海鷗的翅膀就好了……就能乘著微風飛向世界的彼端，把這首歌唱給所有人聽。',
      },
    ];
  } else if (instrumentCount === 2) {
    return [
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '已經集齊兩件樂器了！大提琴與海螺的合奏越來越清晰了……林克，你好勇敢。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_sad',
        text: '……不知為什麼，隨著樂器一件件找到，我胸口總有一股淡淡的心酸。彷彿這場溫柔的日常，就要迎來黃昏了。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_sad',
        text: '林克，如果有一天你離開了這座島……你一定不要忘記可湖霖島，還有我和這首歌喔，好嗎？',
      },
    ];
  } else {
    return [
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '三件樂器……滿月大提琴、海螺號角、海百合之鈴……全都齊聚了呢！',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_sad',
        text: '林克……我有個埋藏在心底的祕密，一直沒有勇氣告訴你。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_sad',
        text: '古老的石板記載著……風之魚的甦醒，即是夢境的破曉。這座美麗的島、村落、村民，甚至是我……其實都是風之魚的一場宏大夢境。',
      },
      {
        speaker: '瑪琳 (Marin)',
        speakerRole: '島上的歌姬',
        portrait: 'marin_smile',
        text: '但遇見你的這段記憶，對我來說是無比真實的珍寶。走吧，林克！前往北方的塔瑪蘭奇山頂，喚醒風之魚吧！',
      },
    ];
  }
}

export const TARIN_DIALOGUE: DialogueLine[] = [
  {
    speaker: '塔林 (Tarin)',
    speakerRole: '瑪琳的父親',
    portrait: 'marin_smile',
    text: '呼嚕嚕……哈啾！喔喔，是林克啊！昨天你在海灘上像一根泡水的漂流木一樣，幸好瑪琳發現了你。',
  },
  {
    speaker: '塔林 (Tarin)',
    speakerRole: '瑪琳的父親',
    portrait: 'marin_smile',
    text: '島上的草叢裡藏著很多好東西，用劍揮砍草叢可以找到綠寶石（盧比）或者恢復體力的愛心喔！',
  },
  {
    speaker: '塔林 (Tarin)',
    speakerRole: '瑪琳的父親',
    portrait: 'marin_smile',
    text: '不過森林深處有迷霧跟愛彈跳的史萊姆怪，自己多小心點啦！',
  },
];

export function getInstrumentFoundDialogue(name: string, region: string, poetic: string): DialogueLine[] {
  return [
    {
      speaker: '獲得海妖樂器！',
      speakerRole: '聖物之音',
      portrait: 'instrument',
      text: `獲得了【${name}】！沉睡於${region}。`,
    },
    {
      speaker: '獲得海妖樂器！',
      speakerRole: '聖物之音',
      portrait: 'instrument',
      text: `${poetic} 風之魚沉睡的心海似乎泛起了一絲溫柔的漣漪……`,
    },
  ];
}

export function getEggAltarDialogue(instrumentCount: number): DialogueLine[] {
  if (instrumentCount < 3) {
    return [
      {
        speaker: '神聖巨蛋 (Mt. Tamaranch Egg)',
        speakerRole: '風之魚的沉眠之所',
        portrait: 'egg',
        text: '這是風之魚沉睡的巨大彩斑之蛋。蛋殼周圍散發著神聖而古老的威嚴氣息。',
      },
      {
        speaker: '神聖巨蛋 (Mt. Tamaranch Egg)',
        speakerRole: '風之魚的沉眠之所',
        portrait: 'egg',
        text: `殼底鐫刻著古老的銘文：『唯有集齊三枚海妖的純潔樂聲，破曉之歌方能喚醒永眠之人。』\n【目前收集進度：${instrumentCount} / 3】`,
      },
    ];
  } else {
    return [
      {
        speaker: '神聖巨蛋 (Mt. Tamaranch Egg)',
        speakerRole: '風之魚的沉眠之所',
        portrait: 'egg',
        text: '三件海妖樂器發出純淨而耀眼的金光，與巨蛋上的斑紋產生了強烈的共鳴！',
      },
      {
        speaker: '神聖巨蛋 (Mt. Tamaranch Egg)',
        speakerRole: '風之魚的沉眠之所',
        portrait: 'egg',
        text: '你舉起滿月大提琴、海螺號角與海百合之鈴，合奏起《可湖霖島的搖籃曲——風之魚之歌》！',
      },
      {
        speaker: '命運的破曉',
        speakerRole: '夢之覺醒',
        portrait: 'egg',
        text: '巨蛋表面裂開了耀眼的金色光芒！神聖的羽化光輝正籠罩整座島嶼……',
      },
    ];
  }
}
