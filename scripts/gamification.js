(function () {
  'use strict';

  const STORAGE_KEY = 'ignight.progress.v1';
  const VERSION = 1;
  const GAME = {
    NEVER: 'neverHaveIEver',
    TD: 'truthOrDare'
  };

  const SOURCE_KIND = {
    neverCards: 'never',
    truthCards: 'truth',
    dareCards: 'dare'
  };
  const QUICK_NORMAL_COUNT = 12;
  const RITUAL_UNLOCK_ORDER = {
    neverHaveIEver: ['velvet-fire', 'the-window', 'third-shadow'],
    truthOrDare: ['no-skips', 'red-room', 'confessional']
  };

  const L = {
    en: {
      tonight: 'Tonight',
      chooseRitual: 'Choose the ritual',
      ritualSub: 'A private arc for the room you want to enter.',
      back: 'Back',
      classicNeverTitle: 'Classic deck',
      classicNeverDesc: 'A 12-card Never Have I Ever run, your tier pool.',
      classicTdTitle: 'Classic draw',
      classicTdDesc: 'A 12-card Truth or Dare run, your tier pool.',
      afterglow: 'Afterglow',
      chemistryFallback: 'The room kept its secrets close.',
      embersEarned: '+{count} Embers',
      sealsUnlocked: '{count} Seal{plural} opened',
      unlocksOpened: '{count} new atmosphere{plural}',
      ritualsUnlocked: '{count} ritual{plural} opened',
      modeUnlocked: 'Mode opened',
      nextRitual: 'Next ritual: {title}',
      nextQuick: 'Next: finish {title} to open the ritual deck.',
      collection: 'Collection',
      rituals: 'Rituals',
      share: 'Share',
      collectionTitle: 'Private collection',
      embers: 'Embers',
      seals: 'Seals',
      paths: 'Paths',
      unlocks: 'Atmospheres',
      locked: 'Locked',
      opened: 'Open',
      new: 'New',
      skin: 'Skin',
      effectPack: 'Effect',
      ambient: 'Room',
      tooltipPlay: 'Tap again to play',
      tooltipExplore: 'Unlocked in your private collection',
      sealInfo: 'A private seal earned by how the room answered.',
      pathInfo: 'A ritual path that lights when its arc is completed.',
      skinInfo: 'A card-room skin earned with embers.',
      effectPackInfo: 'A visual effect language for future rounds.',
      ambientInfo: 'A room atmosphere earned through afterglow.',
      nextEmberUnlock: '{count} Embers to {title}',
      readyEmberUnlock: '{title} is ready to open next',
      moodSignature: 'Mood',
      shareFallback: 'Share card ready',
      shareTitle: 'Ignight afterglow',
      shareText: 'We survived Ignight.',
      moodNames: {
        confession: 'Confession',
        power: 'Power',
        voyeur: 'Watching',
        surrender: 'Surrender',
        desire: 'Desire',
        fire: 'Fire'
      },
      moods: {
        confession: 'Tonight kept circling confession: the beautiful kind of almost-saying-it.',
        power: 'The heat leaned toward control, obedience, and the nerve to enjoy it.',
        voyeur: 'There was a watching charge in the room: eyes, exposure, and that quiet risk.',
        surrender: 'The signature was surrender: softer movement, darker wanting, less pretending.',
        desire: 'Desire did most of the talking tonight.',
        fire: 'The deck stopped flirting and started leaving marks on the room.'
      }
    },
    pl: {
      tonight: 'Dzisiejsza noc',
      chooseRitual: 'Wybierz rytual',
      ritualSub: 'Prywatny luk dla pokoju, do ktorego chcecie wejsc.',
      back: 'Wroc',
      classicNeverTitle: 'Klasyczna talia',
      classicNeverDesc: '12 kart Nigdy nie, z wybranej puli.',
      classicTdTitle: 'Klasyczny los',
      classicTdDesc: '12 kart Prawda czy wyzwanie, z wybranej puli.',
      afterglow: 'Afterglow',
      chemistryFallback: 'Pokoj trzymal swoje sekrety blisko.',
      embersEarned: '+{count} Zary',
      sealsUnlocked: 'Otwarto pieczecie: {count}',
      unlocksOpened: 'Nowe atmosfery: {count}',
      ritualsUnlocked: 'Otwarto rytualy: {count}',
      modeUnlocked: 'Tryb otwarty',
      nextRitual: 'Nastepny rytual: {title}',
      nextQuick: 'Dalej: ukoncz {title}, zeby otworzyc rytualy.',
      collection: 'Kolekcja',
      rituals: 'Rytualy',
      share: 'Udostepnij',
      collectionTitle: 'Prywatna kolekcja',
      embers: 'Zary',
      seals: 'Pieczecie',
      paths: 'Sciezki',
      unlocks: 'Atmosfery',
      locked: 'Zamkniete',
      opened: 'Otwarte',
      new: 'Nowe',
      skin: 'Skorka',
      effectPack: 'Efekt',
      ambient: 'Pokoj',
      tooltipPlay: 'Stuknij ponownie, zeby grac',
      tooltipExplore: 'Otwarte w prywatnej kolekcji',
      sealInfo: 'Prywatna pieczec za to, jak odpowiadal pokoj.',
      pathInfo: 'Sciezka rytualu, ktora zapala sie po ukonczeniu luku.',
      skinInfo: 'Skorka pokoju kart zdobyta za zary.',
      effectPackInfo: 'Jezyk efektow wizualnych na kolejne rundy.',
      ambientInfo: 'Atmosfera pokoju zdobyta przez afterglow.',
      nextEmberUnlock: '{count} zarow do {title}',
      readyEmberUnlock: '{title} czeka jako nastepne',
      moodSignature: 'Nastroj',
      shareFallback: 'Karta gotowa',
      shareTitle: 'Ignight afterglow',
      shareText: 'Przetrwalismy Ignight.',
      moodNames: {
        confession: 'Wyznanie',
        power: 'Wladza',
        voyeur: 'Patrzenie',
        surrender: 'Poddanie',
        desire: 'Pozadanie',
        fire: 'Ogien'
      },
      moods: {
        confession: 'Ta noc krazyla wokol wyznan: tych, ktore prawie przechodza przez usta.',
        power: 'Cieplo poszlo w kontrole, posluszenstwo i odwage, zeby to lubic.',
        voyeur: 'W pokoju bylo patrzenie: oczy, ekspozycja i ciche ryzyko.',
        surrender: 'Podpis nocy to poddanie: wolniej, ciemniej, bez udawania.',
        desire: 'Pozadanie powiedzialo dzisiaj najwiecej.',
        fire: 'Talia przestala flirtowac i zaczela zostawiac slad na pokoju.'
      }
    },
    'pt-BR': {
      tonight: 'Hoje',
      chooseRitual: 'Escolha o ritual',
      ritualSub: 'Um arco privado para o clima que voces querem acender.',
      back: 'Voltar',
      classicNeverTitle: 'Baralho classico',
      classicNeverDesc: '12 cartas de Eu Nunca, com a temperatura que voce escolher.',
      classicTdTitle: 'Rodada classica',
      classicTdDesc: '12 cartas de Verdade ou Desafio, na temperatura que voce escolher.',
      afterglow: 'Afterglow',
      chemistryFallback: 'O quarto guardou os segredos bem perto.',
      embersEarned: '+{count} Brasas',
      sealsUnlocked: '{count} Selo{plural} aberto{plural}',
      unlocksOpened: '{count} nova atmosfera{plural}',
      ritualsUnlocked: 'Rituais liberados: {count}',
      modeUnlocked: 'Modo liberado',
      nextRitual: 'Proximo ritual: {title}',
      nextQuick: 'Agora: termine {title} para abrir os rituais.',
      collection: 'Colecao',
      rituals: 'Rituais',
      share: 'Compartilhar',
      collectionTitle: 'Colecao privada',
      embers: 'Brasas',
      seals: 'Selos',
      paths: 'Caminhos',
      unlocks: 'Atmosferas',
      locked: 'Travado',
      opened: 'Aberto',
      new: 'Novo',
      skin: 'Skin',
      effectPack: 'Efeito',
      ambient: 'Quarto',
      tooltipPlay: 'Toque de novo para jogar',
      tooltipExplore: 'Aberto na sua colecao privada',
      sealInfo: 'Um selo privado pelo jeito que o quarto respondeu.',
      pathInfo: 'Um caminho ritual que acende quando o arco termina.',
      skinInfo: 'Uma skin do quarto de cartas ganha com brasas.',
      effectPackInfo: 'Uma linguagem visual para proximas rodadas.',
      ambientInfo: 'Uma atmosfera de quarto ganha no afterglow.',
      nextEmberUnlock: '{count} brasas ate {title}',
      readyEmberUnlock: '{title} fica pronto na proxima',
      moodSignature: 'Clima',
      shareFallback: 'Cartao pronto',
      shareTitle: 'Ignight afterglow',
      shareText: 'A gente sobreviveu ao Ignight.',
      moodNames: {
        confession: 'Confissao',
        power: 'Poder',
        voyeur: 'Olhar',
        surrender: 'Entrega',
        desire: 'Desejo',
        fire: 'Fogo'
      },
      moods: {
        confession: 'A noite ficou rodeando confissao: aquela quase coragem gostosa.',
        power: 'O calor puxou para controle, obediencia e vontade de gostar disso.',
        voyeur: 'Tinha um clima de olhar no quarto: olhos, exposicao e risco baixo.',
        surrender: 'A assinatura foi entrega: mais lento, mais escuro, menos fingimento.',
        desire: 'Hoje quem falou mais alto foi o desejo.',
        fire: 'O baralho parou de flertar e comecou a marcar o quarto.'
      }
    },
    fr: {
      tonight: 'Ce soir',
      chooseRitual: 'Choisis le rituel',
      ritualSub: 'Un arc prive pour la piece que vous voulez allumer.',
      back: 'Retour',
      classicNeverTitle: 'Deck classique',
      classicNeverDesc: '12 cartes Je n ai jamais, avec la chaleur choisie.',
      classicTdTitle: 'Tirage classique',
      classicTdDesc: '12 cartes Action ou Verite, avec la chaleur choisie.',
      afterglow: 'Afterglow',
      chemistryFallback: 'La piece a garde ses secrets tout pres.',
      embersEarned: '+{count} Braises',
      sealsUnlocked: '{count} Sceau{plural} ouvert{plural}',
      unlocksOpened: '{count} nouvelle atmosphere{plural}',
      ritualsUnlocked: 'Rituels ouverts : {count}',
      modeUnlocked: 'Mode ouvert',
      nextRitual: 'Prochain rituel : {title}',
      nextQuick: 'Ensuite : termine {title} pour ouvrir les rituels.',
      collection: 'Collection',
      rituals: 'Rituels',
      share: 'Partager',
      collectionTitle: 'Collection privee',
      embers: 'Braises',
      seals: 'Sceaux',
      paths: 'Chemins',
      unlocks: 'Atmospheres',
      locked: 'Verrouille',
      opened: 'Ouvert',
      new: 'Nouveau',
      skin: 'Skin',
      effectPack: 'Effet',
      ambient: 'Piece',
      tooltipPlay: 'Tape encore pour jouer',
      tooltipExplore: 'Ouvert dans ta collection privee',
      sealInfo: 'Un sceau prive gagne par la facon dont la piece a repondu.',
      pathInfo: 'Un chemin rituel qui s allume quand son arc est termine.',
      skinInfo: 'Un skin de piece de cartes gagne avec les braises.',
      effectPackInfo: 'Un langage visuel pour les prochains tours.',
      ambientInfo: 'Une atmosphere de piece gagnee dans l afterglow.',
      nextEmberUnlock: '{count} braises avant {title}',
      readyEmberUnlock: '{title} est pret pour la suite',
      moodSignature: 'Climat',
      shareFallback: 'Carte prete',
      shareTitle: 'Ignight afterglow',
      shareText: 'On a survecu a Ignight.',
      moodNames: {
        confession: 'Aveu',
        power: 'Pouvoir',
        voyeur: 'Regard',
        surrender: 'Abandon',
        desire: 'Desir',
        fire: 'Feu'
      },
      moods: {
        confession: 'Ce soir tournait autour de l aveu: celui qui reste presque sur la langue.',
        power: 'La chaleur allait vers le controle, l obeissance, et le plaisir de l admettre.',
        voyeur: 'Il y avait une charge de regard: yeux, exposition, risque discret.',
        surrender: 'La signature etait l abandon: plus lent, plus sombre, moins sage.',
        desire: 'Le desir a parle plus fort que tout.',
        fire: 'Le deck a arrete de flirter et a marque la piece.'
      }
    },
    de: {
      tonight: 'Heute Nacht',
      chooseRitual: 'Ritual waehlen',
      ritualSub: 'Ein privater Bogen fuer den Raum, den ihr betreten wollt.',
      back: 'Zurueck',
      classicNeverTitle: 'Klassisches Deck',
      classicNeverDesc: '12 Karten Ich hab noch nie, mit eurem Hitzegrad.',
      classicTdTitle: 'Klassischer Zug',
      classicTdDesc: '12 Karten Wahrheit oder Pflicht, mit eurem Hitzegrad.',
      afterglow: 'Afterglow',
      chemistryFallback: 'Der Raum hielt seine Geheimnisse nah.',
      embersEarned: '+{count} Glut',
      sealsUnlocked: '{count} Siegel geoeffnet',
      unlocksOpened: '{count} neue Atmosphaere{plural}',
      ritualsUnlocked: 'Rituale geoeffnet: {count}',
      modeUnlocked: 'Modus geoeffnet',
      nextRitual: 'Naechstes Ritual: {title}',
      nextQuick: 'Als Naechstes: {title} beenden, um die Rituale zu oeffnen.',
      collection: 'Sammlung',
      rituals: 'Rituale',
      share: 'Teilen',
      collectionTitle: 'Private Sammlung',
      embers: 'Glut',
      seals: 'Siegel',
      paths: 'Pfade',
      unlocks: 'Atmosphaeren',
      locked: 'Verschlossen',
      opened: 'Offen',
      new: 'Neu',
      skin: 'Skin',
      effectPack: 'Effekt',
      ambient: 'Raum',
      tooltipPlay: 'Nochmal tippen zum Spielen',
      tooltipExplore: 'In deiner privaten Sammlung offen',
      sealInfo: 'Ein privates Siegel dafuer, wie der Raum geantwortet hat.',
      pathInfo: 'Ein Ritualpfad, der leuchtet, wenn sein Bogen vollendet ist.',
      skinInfo: 'Ein Kartenraum-Skin, verdient mit Glut.',
      effectPackInfo: 'Eine visuelle Effektsprache fuer weitere Runden.',
      ambientInfo: 'Eine Raumatmosphaere aus dem Afterglow.',
      nextEmberUnlock: '{count} Glut bis {title}',
      readyEmberUnlock: '{title} ist als Naechstes bereit',
      moodSignature: 'Stimmung',
      shareFallback: 'Share-Karte bereit',
      shareTitle: 'Ignight Afterglow',
      shareText: 'Wir haben Ignight ueberlebt.',
      moodNames: {
        confession: 'Beichte',
        power: 'Macht',
        voyeur: 'Blick',
        surrender: 'Hingabe',
        desire: 'Begehren',
        fire: 'Feuer'
      },
      moods: {
        confession: 'Heute Nacht kreiste um Beichte: die schoene Art von Fast-Aussprechen.',
        power: 'Die Hitze zog zu Kontrolle, Gehorsam und dem Mut, es zu moegen.',
        voyeur: 'Im Raum lag Blickspannung: Augen, Ausstellen und dieses leise Risiko.',
        surrender: 'Die Signatur war Hingabe: langsamer, dunkler, weniger brav.',
        desire: 'Begehren hat heute am lautesten gesprochen.',
        fire: 'Das Deck hat aufgehoert zu flirten und den Raum markiert.'
      }
    }
  };

  const RITUALS = [
    {
      id: 'classic-never',
      mode: GAME.NEVER,
      classic: true,
      tier: 'all',
      icon: '🔥',
      copy: {
        en: ['Classic deck', 'A 12-card Never Have I Ever run, your tier pool.'],
        pl: ['Klasyczna talia', '12 kart Nigdy nie, z wybranej puli.'],
        'pt-BR': ['Baralho classico', '12 cartas de Eu Nunca, com a temperatura que voce escolher.'],
        fr: ['Deck classique', '12 cartes Je n ai jamais, avec la chaleur choisie.'],
        de: ['Klassisches Deck', '12 Karten Ich hab noch nie, mit eurem Hitzegrad.']
      }
    },
    {
      id: 'classic-td',
      mode: GAME.TD,
      classic: true,
      tier: 'all',
      icon: '🎭',
      copy: {
        en: ['Classic draw', 'A 12-card Truth or Dare run, your tier pool.'],
        pl: ['Klasyczny los', '12 kart Prawda czy wyzwanie, z wybranej puli.'],
        'pt-BR': ['Rodada classica', '12 cartas de Verdade ou Desafio, na temperatura que voce escolher.'],
        fr: ['Tirage classique', '12 cartes Action ou Verite, avec la chaleur choisie.'],
        de: ['Klassischer Zug', '12 Karten Wahrheit oder Pflicht, mit eurem Hitzegrad.']
      }
    },
    {
      id: 'velvet-fire',
      mode: GAME.NEVER,
      path: 'velvet-path',
      tier: 'all',
      tiers: ['warm', 'hot', 'fire'],
      count: { neverCards: 24 },
      icon: '◆',
      copy: {
        en: ['Velvet Fire', 'A slow climb from staring to answers that stop behaving.'],
        pl: ['Aksamitny ogien', 'Powolne przejscie od spojrzen do odpowiedzi, ktore przestaja byc grzeczne.'],
        'pt-BR': ['Fogo de veludo', 'Uma subida lenta do olhar ate as respostas pararem de se comportar.'],
        fr: ['Feu de velours', 'Une montee lente du regard aux reponses qui ne sont plus sages.'],
        de: ['Samtfeuer', 'Ein langsamer Aufstieg vom Blick zu Antworten, die nicht mehr brav sind.']
      }
    },
    {
      id: 'the-window',
      mode: GAME.NEVER,
      path: 'the-window',
      tier: 'all',
      tiers: ['hot', 'fire'],
      count: { neverCards: 18 },
      icon: '◐',
      copy: {
        en: ['The Window', 'For eyes, exposure, and almost getting caught.'],
        pl: ['Okno', 'Dla spojrzen, ekspozycji i prawie-przylapania.'],
        'pt-BR': ['A Janela', 'Para olhares, exposicao e quase ser pego.'],
        fr: ['La Fenetre', 'Pour les yeux, l exposition, et le presque surpris.'],
        de: ['Das Fenster', 'Fuer Blicke, Ausstellen und fast erwischt werden.']
      }
    },
    {
      id: 'third-shadow',
      mode: GAME.NEVER,
      path: 'third-shadow',
      tier: 'all',
      tiers: ['hot', 'fire'],
      count: { neverCards: 18 },
      icon: '◈',
      copy: {
        en: ['The Third Shadow', 'Jealousy, sharing, and the fantasy of extra hands.'],
        pl: ['Trzeci cien', 'Zazdrosc, dzielenie i fantazja o dodatkowych dloniach.'],
        'pt-BR': ['A Terceira Sombra', 'Ciume, partilha e fantasia de maos extras.'],
        fr: ['La Troisieme Ombre', 'Jalousie, partage, et fantasme de mains en plus.'],
        de: ['Der dritte Schatten', 'Eifersucht, Teilen und die Fantasie von zusaetzlichen Haenden.']
      }
    },
    {
      id: 'no-skips',
      mode: GAME.TD,
      path: 'confessional',
      tier: 'all',
      tiers: ['warm', 'hot'],
      count: { truthCards: 10, dareCards: 10 },
      icon: '◇',
      copy: {
        en: ['No Skips', 'A compact truth-and-nerve run with nowhere to hide.'],
        pl: ['Bez pasow', 'Krotki bieg prawdy i odwagi bez kryjowki.'],
        'pt-BR': ['Sem pular', 'Uma rodada curta de verdade e coragem sem esconderijo.'],
        fr: ['Sans passer', 'Un run court de verite et de nerfs, sans cachette.'],
        de: ['No Skips', 'Ein kompakter Wahrheit-und-Nerven-Lauf ohne Versteck.']
      }
    },
    {
      id: 'red-room',
      mode: GAME.TD,
      path: 'red-room',
      tier: 'fire',
      tiers: ['hot', 'fire'],
      count: { truthCards: 9, dareCards: 9 },
      icon: '●',
      copy: {
        en: ['Red Room', 'Commands, surrender, and the part that likes being told.'],
        pl: ['Czerwony pokoj', 'Polecenia, poddanie i ta czesc, ktora lubi instrukcje.'],
        'pt-BR': ['Quarto Vermelho', 'Comandos, entrega e a parte que gosta de obedecer.'],
        fr: ['Chambre Rouge', 'Ordres, abandon, et la partie qui aime obeir.'],
        de: ['Roter Raum', 'Befehle, Hingabe und der Teil, der gern gesagt bekommt, was zu tun ist.']
      }
    },
    {
      id: 'confessional',
      mode: GAME.TD,
      path: 'confessional',
      tier: 'all',
      tiers: ['warm', 'hot', 'fire'],
      count: { truthCards: 14, dareCards: 6 },
      icon: '◌',
      copy: {
        en: ['Confessional', 'Mostly truth, a little dare, and a lot less hiding.'],
        pl: ['Konfesjonal', 'Glownie prawda, troche wyzwan i znacznie mniej ukrywania.'],
        'pt-BR': ['Confessionario', 'Mais verdade, um pouco de desafio e bem menos mascara.'],
        fr: ['Confessionnal', 'Surtout verite, un peu d action, beaucoup moins de masque.'],
        de: ['Beichtstuhl', 'Meist Wahrheit, ein bisschen Pflicht und viel weniger Verstecken.']
      }
    }
  ];

  const PATHS = [
    { id: 'velvet-path', ritualIds: ['velvet-fire'], name: { en: 'The Velvet Path', pl: 'Aksamitna sciezka', 'pt-BR': 'O Caminho de Veludo', fr: 'Le Chemin de Velours', de: 'Der Samtpfad' } },
    { id: 'red-room', ritualIds: ['red-room'], name: { en: 'The Red Room', pl: 'Czerwony pokoj', 'pt-BR': 'O Quarto Vermelho', fr: 'La Chambre Rouge', de: 'Der Rote Raum' } },
    { id: 'the-window', ritualIds: ['the-window'], name: { en: 'The Window', pl: 'Okno', 'pt-BR': 'A Janela', fr: 'La Fenetre', de: 'Das Fenster' } },
    { id: 'third-shadow', ritualIds: ['third-shadow'], name: { en: 'The Third Shadow', pl: 'Trzeci Cien', 'pt-BR': 'A Terceira Sombra', fr: 'La Troisieme Ombre', de: 'Der dritte Schatten' } },
    { id: 'confessional', ritualIds: ['no-skips', 'confessional'], name: { en: 'The Confessional', pl: 'Konfesjonal', 'pt-BR': 'O Confessionario', fr: 'Le Confessionnal', de: 'Der Beichtstuhl' } }
  ];

  const SEALS = [
    { id: 'first-afterglow', icon: '✦', condition: ctx => ctx.progress.sessions >= 1, name: { en: 'First Afterglow', pl: 'Pierwszy Afterglow', 'pt-BR': 'Primeiro Afterglow', fr: 'Premier Afterglow', de: 'Erster Afterglow' } },
    { id: 'first-fire', icon: '🔥', condition: ctx => ctx.session.fireCards >= 3 || ctx.stats.tier === 'fire', name: { en: 'First Fire', pl: 'Pierwszy ogien', 'pt-BR': 'Primeiro Fogo', fr: 'Premier Feu', de: 'Erstes Feuer' } },
    { id: 'no-skips', icon: '◇', condition: ctx => ctx.stats.game === GAME.TD && ctx.stats.drawn >= 8 && ctx.stats.skips === 0, name: { en: 'No Skips', pl: 'Bez pasow', 'pt-BR': 'Sem pular', fr: 'Sans passer', de: 'No Skips' } },
    { id: 'truth-hunter', icon: '◌', condition: ctx => ctx.stats.truths >= 8, name: { en: 'Truth Hunter', pl: 'Lowca prawdy', 'pt-BR': 'Cacador de Verdades', fr: 'Chasseur de Verite', de: 'Wahrheitsjaeger' } },
    { id: 'dare-drunk', icon: '●', condition: ctx => ctx.stats.dares >= 8, name: { en: 'Dare Drunk', pl: 'Pijany od wyzwan', 'pt-BR': 'Bebado de Desafio', fr: 'Ivre d Action', de: 'Pflichttrunken' } },
    { id: 'window-open', icon: '◐', condition: ctx => topTheme(ctx.session, ['voyeur', 'exhibition', 'watching']) >= 4, name: { en: 'Window Open', pl: 'Otwarte okno', 'pt-BR': 'Janela Aberta', fr: 'Fenetre Ouverte', de: 'Fenster Offen' } },
    { id: 'red-command', icon: '◆', condition: ctx => topTheme(ctx.session, ['power', 'surrender', 'obedience', 'control']) >= 5, name: { en: 'Red Command', pl: 'Czerwony rozkaz', 'pt-BR': 'Comando Vermelho', fr: 'Ordre Rouge', de: 'Roter Befehl' } },
    { id: 'ritualist', icon: '✧', condition: ctx => !!ctx.ritual && !ctx.ritual.classic, name: { en: 'Ritualist', pl: 'Rytualista', 'pt-BR': 'Ritualista', fr: 'Ritualiste', de: 'Ritualist' } }
  ];

  const UNLOCKS = [
    { id: 'ember-veil', threshold: 18, kind: 'skin', icon: '◒', name: { en: 'Ember Veil', pl: 'Zaslona zaru', 'pt-BR': 'Véu de Brasas', fr: 'Voile de Braises', de: 'Glutschleier' } },
    { id: 'rose-rift', threshold: 42, kind: 'effectPack', icon: '✦', name: { en: 'Rose Rift', pl: 'Rozowa szczelina', 'pt-BR': 'Fenda Rosa', fr: 'Faille Rose', de: 'Rosenriss' } },
    { id: 'gold-smoke', threshold: 78, kind: 'effectPack', icon: '◌', name: { en: 'Gold Smoke', pl: 'Zloty dym', 'pt-BR': 'Fumaca Dourada', fr: 'Fumee Doree', de: 'Goldrauch' } },
    { id: 'midnight-room', threshold: 126, kind: 'ambient', icon: '●', name: { en: 'Midnight Room', pl: 'Pokoj po polnocy', 'pt-BR': 'Quarto da Meia-noite', fr: 'Chambre de Minuit', de: 'Mitternachtsraum' } }
  ];

  const MOOD_RULES = [
    { id: 'power', themes: ['power', 'obedience', 'control', 'ownership'], rgb: '190,28,54', glow: 'rgba(190,28,54,0.24)', glyphs: ['●', '◆'] },
    { id: 'voyeur', themes: ['voyeur', 'watching', 'exhibition', 'public-risk'], rgb: '150,86,210', glow: 'rgba(150,86,210,0.18)', glyphs: ['◐', '◌'] },
    { id: 'surrender', themes: ['surrender', 'free-use-fantasy', 'objectified', 'kneel'], rgb: '218,66,96', glow: 'rgba(218,66,96,0.20)', glyphs: ['◇', '✧'] },
    { id: 'confession', themes: ['confession', 'shame', 'secret', 'voice'], rgb: '232,146,116', glow: 'rgba(232,146,116,0.18)', glyphs: ['✦', '◌'] },
    { id: 'fire', themes: ['more', 'ritual', 'punishment', 'reward'], rgb: '255,103,38', glow: 'rgba(255,103,38,0.24)', glyphs: ['🔥', '✦'] },
    { id: 'desire', themes: ['desire', 'flirt', 'mouth', 'hands', 'praise'], rgb: '232,201,122', glow: 'rgba(232,201,122,0.17)', glyphs: ['✦', '✧'] }
  ];

  function langKey(lang) {
    return L[lang] ? lang : 'en';
  }

  function label(lang, key) {
    const pack = L[langKey(lang)];
    return pack[key] || L.en[key] || key;
  }

  function format(str, vars = {}) {
    return String(str).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }

  function localized(value, lang) {
    if (!value) return '';
    if (Array.isArray(value)) return value;
    return value[langKey(lang)] || value.en || '';
  }

  function ritualTitle(ritual, lang) {
    return localized(ritual.copy, lang)[0] || ritual.id;
  }

  function ritualDesc(ritual, lang) {
    return localized(ritual.copy, lang)[1] || '';
  }

  function pathName(path, lang) {
    return localized(path.name, lang) || path.id;
  }

  function sealName(seal, lang) {
    return localized(seal.name, lang) || seal.id;
  }

  function unlockName(unlock, lang) {
    return localized(unlock.name, lang) || unlock.id;
  }

  function blankProgress() {
    return {
      version: VERSION,
      embers: 0,
      sessions: 0,
      cardsDrawn: 0,
      normalNeverCards: 0,
      rituals: {},
      unlockedRituals: {},
      paths: {},
      seals: {},
      unlocks: {},
      chemistry: { themes: {}, moods: {}, games: {}, tiers: {} },
      recent: []
    };
  }

  function readProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return blankProgress();
      const progress = {
        ...blankProgress(),
        ...raw,
        version: VERSION,
        chemistry: { ...blankProgress().chemistry, ...(raw.chemistry || {}) }
      };
      progress.chemistry.themes = {
        ...(raw.chemistry?.themes || {})
      };
      if (!Number.isFinite(progress.normalNeverCards)) {
        progress.normalNeverCards = Number.isFinite(raw.cardsDrawn) ? raw.cardsDrawn : 0;
      }
      progress.unlockedRituals = raw.unlockedRituals || {};
      delete progress.rituals['first-spark'];
      delete progress.unlockedRituals['first-spark'];
      return progress;
    } catch (e) {
      return blankProgress();
    }
  }

  function writeProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {}
  }

  function resetProgress() {
    const progress = blankProgress();
    writeProgress(progress);
    return progress;
  }

  function inc(map, key, amount = 1) {
    if (!key) return;
    map[key] = (map[key] || 0) + amount;
  }

  function manifestEntry(card, source) {
    const manifest = window.IgnightCardManifest?.sources || {};
    return manifest[source]?.[card?.id] || null;
  }

  function themesFor(card, source) {
    const meta = manifestEntry(card, source);
    const themes = Array.isArray(meta?.themes) ? meta.themes : [];
    return themes.length ? [...new Set(themes)] : ['desire'];
  }

  function moodForThemes(themes = [], intensity = 'warm') {
    let best = { id: 'desire', score: 0 };
    MOOD_RULES.forEach(rule => {
      const score = rule.themes.reduce((sum, theme) => sum + (themes.includes(theme) ? 1 : 0), 0);
      if (score > best.score) best = { id: rule.id, score };
    });
    if (intensity === 'fire' && best.score < 2) return 'fire';
    return best.id;
  }

  function moodRule(mood) {
    return MOOD_RULES.find(rule => rule.id === mood) || MOOD_RULES[MOOD_RULES.length - 1];
  }

  function moodName(mood, lang) {
    const pack = L[langKey(lang)];
    return pack.moodNames?.[mood] || L.en.moodNames?.[mood] || mood || 'desire';
  }

  function enrichCard(card, source) {
    if (!card) return card;
    const meta = manifestEntry(card, source);
    const themes = themesFor(card, source);
    const intensity = meta?.intensity || card.tier || 'warm';
    return {
      ...card,
      source,
      kind: meta?.kind || SOURCE_KIND[source] || 'card',
      intensity,
      themes,
      mood: moodForThemes(themes, intensity)
    };
  }

  function ritualApplies(ritual, game, source) {
    if (!ritual || ritual.classic) return false;
    if (ritual.mode !== game) return false;
    return Number.isFinite(ritual.count?.[source]);
  }

  function filterCardsForRitual(cards, ritual, source) {
    if (!ritual || ritual.classic) return cards;
    const picked = cards.filter(card => {
      const meta = manifestEntry(card, source);
      return Array.isArray(meta?.rituals) && meta.rituals.includes(ritual.id);
    });
    if (picked.length) return picked;
    return cards.filter(card => !ritual.tiers?.length || ritual.tiers.includes(card.tier));
  }

  function deckLimit(ritual, source) {
    if (ritual?.id === 'classic-never' && source === 'neverCards') return QUICK_NORMAL_COUNT;
    if (!ritual || ritual.classic) return null;
    const value = ritual.count?.[source];
    return Number.isFinite(value) ? value : null;
  }

  function getRitualsForMode(mode) {
    return RITUALS.filter(ritual => ritual.mode === mode);
  }

  function getRitual(id) {
    return RITUALS.find(ritual => ritual.id === id) || null;
  }

  function quickNormalCount() {
    return QUICK_NORMAL_COUNT;
  }

  function classicIdForGame(game) {
    return game === GAME.TD ? 'classic-td' : 'classic-never';
  }

  function effectiveRitualId(session, stats) {
    return session?.ritualId || classicIdForGame(stats?.game);
  }

  function ritualUnlockOrder(game) {
    return RITUAL_UNLOCK_ORDER[game] || [];
  }

  function isClassicRitual(ritualOrId) {
    const id = typeof ritualOrId === 'string' ? ritualOrId : ritualOrId?.id;
    return id === 'classic-never' || id === 'classic-td';
  }

  function ritualIsOpen(progress, ritualId) {
    if (isClassicRitual(ritualId)) return true;
    return !!(progress.unlockedRituals?.[ritualId] || progress.rituals?.[ritualId]?.completed);
  }

  function nextLockedRitualForGame(progress, game) {
    const nextId = ritualUnlockOrder(game).find(id => !ritualIsOpen(progress, id));
    return nextId ? getRitual(nextId) : null;
  }

  function isRitualUnlocked(ritual, progress = readProgress()) {
    if (!ritual) return true;
    return ritualIsOpen(progress, ritual.id);
  }

  function hasUnlockedRitualForMode(mode, progress = readProgress()) {
    return getRitualsForMode(mode).some(ritual => isRitualUnlocked(ritual, progress));
  }

  function unlockRequirement(ritual, progress = readProgress(), lang = 'en') {
    if (isRitualUnlocked(ritual, progress)) return '';
    const order = ritualUnlockOrder(ritual.mode);
    const index = order.indexOf(ritual.id);
    if (index >= 0) return `${index + 1} ✦ ${label(lang, 'locked')}`;
    return label(lang, 'locked');
  }

  function unlockedRitualIds(progress = readProgress()) {
    return RITUALS.filter(ritual => isRitualUnlocked(ritual, progress)).map(ritual => ritual.id);
  }

  function getPath(id) {
    return PATHS.find(path => path.id === id) || null;
  }

  function startSession({ game, tier, ritual }) {
    return {
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startedAt: new Date().toISOString(),
      game,
      tier,
      ritualId: ritual?.id || null,
      pathId: ritual?.path || null,
      cards: [],
      outcomes: [],
      themes: {},
      moods: {},
      fireCards: 0,
      completed: false
    };
  }

  function recordDraw(session, card, source) {
    if (!session || !card) return { themes: [], mood: 'desire' };
    const rich = enrichCard(card, source);
    rich.themes.forEach(theme => inc(session.themes, theme));
    inc(session.moods, rich.mood);
    if (rich.tier === 'fire') session.fireCards++;
    session.cards.push({
      id: rich.id,
      tier: rich.tier,
      source,
      mood: rich.mood,
      themes: rich.themes
    });
    return { themes: rich.themes, mood: rich.mood, rgb: moodRule(rich.mood).rgb, glow: moodRule(rich.mood).glow, glyphs: moodRule(rich.mood).glyphs };
  }

  function recordOutcome(session, card, outcome) {
    if (!session || !card) return;
    session.outcomes.push({
      id: card.id,
      outcome,
      ts: Date.now()
    });
  }

  function topTheme(session, themes) {
    return themes.reduce((sum, theme) => sum + (session.themes?.[theme] || 0), 0);
  }

  function topKey(map) {
    return Object.entries(map || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  function chemistryRead(session, lang) {
    const mood = topKey(session?.moods) || topKey(session?.themes) || 'desire';
    const pack = L[langKey(lang)];
    return pack.moods[mood] || pack.moods.desire || L.en.chemistryFallback;
  }

  const EMBER_VALUES = {
    yes: { warm: 3, hot: 5, fire: 8 },
    never: { warm: 1, hot: 2, fire: 3 },
    truth: { warm: 2, hot: 4, fire: 6 },
    dare: { warm: 3, hot: 6, fire: 9 }
  };

  function emberValue(session, stats, ritual) {
    const cards = new Map((session?.cards || []).map(card => [card.id, card]));
    const breakdown = { yes: 0, never: 0, truth: 0, dare: 0, skipped: 0, ritual: 0, noSkip: 0 };

    (session?.outcomes || []).forEach(item => {
      const card = cards.get(item.id);
      const tier = card?.tier || stats.tier || 'warm';
      const outcome = String(item.outcome || '');
      let bucket = null;

      if (outcome === 'yes') bucket = 'yes';
      else if (outcome === 'never') bucket = 'never';
      else if (outcome.endsWith(':skip')) {
        breakdown.skipped += 1;
        return;
      } else if (outcome.startsWith('truth:')) bucket = 'truth';
      else if (outcome.startsWith('dare:')) bucket = 'dare';

      if (!bucket) return;
      breakdown[bucket] += EMBER_VALUES[bucket]?.[tier] || 0;
    });

    if (ritual && !ritual.classic && (stats.drawn || 0) > 0) {
      breakdown.ritual = Math.max(2, Math.ceil((stats.drawn || 0) / 5));
    }
    if (stats.game === GAME.TD && stats.skips === 0 && stats.drawn >= 8) {
      breakdown.noSkip = 3;
    }

    const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
    return { total, breakdown };
  }

  function emberProgress(progress = readProgress()) {
    const current = Math.max(0, Number(progress.embers) || 0);
    const sorted = [...UNLOCKS].sort((a, b) => a.threshold - b.threshold);
    const next = sorted.find(unlock => !progress.unlocks?.[unlock.id]) || null;
    const previous = [...sorted].reverse().find(unlock => progress.unlocks?.[unlock.id]) || null;
    const start = previous ? previous.threshold : 0;
    const end = next ? next.threshold : Math.max(current, start || 1);
    const span = Math.max(1, end - start);
    const pct = next ? Math.max(0, Math.min(100, ((current - start) / span) * 100)) : 100;
    return { current, start, end, pct, next };
  }

  function pathProgress(progress, pathId) {
    const path = getPath(pathId);
    if (!path) return { done: 0, total: 0 };
    const done = path.ritualIds.filter(id => progress.rituals[id]?.completed).length;
    return { done, total: path.ritualIds.length };
  }

  function nextRitual(progress, mode, currentId = null) {
    const locked = nextLockedRitualForGame(progress, mode);
    if (locked) return locked;
    const rituals = getRitualsForMode(mode).filter(ritual => !ritual.classic && ritualIsOpen(progress, ritual.id));
    const current = getRitual(currentId);
    if (current?.path) {
      const path = getPath(current.path);
      const nextId = path?.ritualIds.find(id => !progress.rituals[id]?.completed);
      if (nextId && nextId !== currentId) return getRitual(nextId);
    }
    return rituals.find(ritual => !progress.rituals[ritual.id]?.completed && ritual.id !== currentId) || rituals[0] || null;
  }

  function finishSession(session, stats, lang = 'en') {
    if (!session || session.completed) {
      const progress = readProgress();
      return {
        progress,
        embersEarned: 0,
        embersBefore: progress.embers || 0,
        embersTotal: progress.embers || 0,
        unlocksBefore: { ...(progress.unlocks || {}) },
        emberBreakdown: { total: 0, breakdown: {} },
        newSeals: [],
        newUnlocks: [],
        newPaths: [],
        newModeUnlocks: [],
        chemistry: label(lang, 'chemistryFallback'),
        mood: 'desire',
        next: null,
        nextQuick: nextLockedRitualForGame(progress, GAME.NEVER) || nextLockedRitualForGame(progress, GAME.TD)
      };
    }

    const progress = readProgress();
    const beforeEmbers = progress.embers || 0;
    const beforeUnlocks = { ...(progress.unlocks || {}) };
    const beforePathDone = new Map(PATHS.map(path => [path.id, pathProgress(progress, path.id).done]));
    const ritualId = effectiveRitualId(session, stats);
    const ritual = getRitual(ritualId);
    const emberGain = emberValue(session, stats, ritual);
    const embersEarned = emberGain.total;
    progress.sessions += 1;
    progress.cardsDrawn += stats.drawn || 0;
    if (stats.game === GAME.NEVER && ritualId === 'classic-never') {
      progress.normalNeverCards += stats.drawn || 0;
    }
    progress.embers += embersEarned;
    inc(progress.chemistry.games, stats.game);
    inc(progress.chemistry.tiers, stats.tier);
    Object.entries(session.themes).forEach(([theme, value]) => inc(progress.chemistry.themes, theme, value));
    Object.entries(session.moods).forEach(([mood, value]) => inc(progress.chemistry.moods, mood, value));

    if (ritual) {
      progress.rituals[ritual.id] = {
        completed: true,
        count: (progress.rituals[ritual.id]?.count || 0) + 1,
        last: new Date().toISOString()
      };
      if (!ritual.classic && ritual.path) {
        const pp = pathProgress(progress, ritual.path);
        progress.paths[ritual.path] = { done: pp.done, total: pp.total };
      }
    }

    const ctx = { progress, session, ritual, stats };
    const newSeals = SEALS.filter(seal => !progress.seals[seal.id] && seal.condition(ctx));
    newSeals.forEach(seal => {
      progress.seals[seal.id] = { openedAt: new Date().toISOString() };
    });

    const nextEmberUnlock = [...UNLOCKS]
      .sort((a, b) => a.threshold - b.threshold)
      .find(unlock => !progress.unlocks[unlock.id] && progress.embers >= unlock.threshold);
    const newUnlocks = nextEmberUnlock ? [nextEmberUnlock] : [];
    newUnlocks.forEach(unlock => {
      progress.unlocks[unlock.id] = { openedAt: new Date().toISOString() };
    });

    const newPaths = PATHS.filter(path => {
      const pp = pathProgress(progress, path.id);
      return pp.total && pp.done >= pp.total && (beforePathDone.get(path.id) || 0) < pp.total;
    });

    const newModeUnlocks = [];
    const nextModeRitual = nextLockedRitualForGame(progress, stats.game);
    if (nextModeRitual) {
      progress.unlockedRituals[nextModeRitual.id] = { openedAt: new Date().toISOString(), sourceGame: stats.game };
      newModeUnlocks.push(nextModeRitual);
    }

    progress.recent.unshift({
      id: session.id,
      game: stats.game,
      tier: stats.tier,
      ritualId,
      mood: topKey(session.moods) || 'desire',
      drawn: stats.drawn,
      embers: embersEarned,
      ts: new Date().toISOString()
    });
    progress.recent = progress.recent.slice(0, 12);

    session.completed = true;
    const nextQuick = nextLockedRitualForGame(progress, stats.game);
    writeProgress(progress);

    return {
      progress,
      embersEarned,
      embersBefore: beforeEmbers,
      embersTotal: progress.embers || 0,
      unlocksBefore: beforeUnlocks,
      emberBreakdown: emberGain,
      newSeals,
      newUnlocks,
      newPaths,
      newModeUnlocks,
      chemistry: chemistryRead(session, lang),
      mood: topKey(session.moods) || 'desire',
      next: nextRitual(progress, stats.game, ritual?.id),
      nextQuick
    };
  }

  function collection(lang = 'en') {
    const progress = readProgress();
    return {
      progress,
      seals: SEALS.map(seal => ({ ...seal, title: sealName(seal, lang), opened: !!progress.seals[seal.id] })),
      unlocks: UNLOCKS.map(unlock => ({
        ...unlock,
        title: unlockName(unlock, lang),
        kindLabel: label(lang, unlock.kind),
        opened: !!progress.unlocks[unlock.id]
      })),
      paths: PATHS.map(path => {
        const pp = pathProgress(progress, path.id);
        return { ...path, title: pathName(path, lang), ...pp, opened: pp.total > 0 && pp.done >= pp.total };
      }),
      ember: emberProgress(progress)
    };
  }

  function sharePayload(afterglow, stats, lang = 'en') {
    const pack = L[langKey(lang)];
    const ritual = getRitual(stats.ritualId);
    const title = ritual ? ritualTitle(ritual, lang) : 'Ignight';
    return {
      title: pack.shareTitle,
      text: `${title}. ${stats.drawn} cards. ${afterglow?.chemistry || pack.shareText}`,
      filename: 'ignight-afterglow.png'
    };
  }

  window.IgnightGamification = {
    GAME,
    label,
    format,
    readProgress,
    writeProgress,
    resetProgress,
    cardMeta: manifestEntry,
    enrichCard,
    ritualApplies,
    filterCardsForRitual,
    deckLimit,
    quickNormalCount,
    ritualUnlockOrder,
    isRitualUnlocked,
    hasUnlockedRitualForMode,
    unlockRequirement,
    getRitualsForMode,
    getRitual,
    ritualTitle,
    ritualDesc,
    startSession,
    recordDraw,
    recordOutcome,
    finishSession,
    collection,
    emberProgress,
    sharePayload,
    moodRule,
    moodName,
    pathName,
    sealName,
    unlockName
  };
})();
