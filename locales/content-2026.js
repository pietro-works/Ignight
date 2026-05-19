(function () {
  'use strict';

  const LOCALES = window.IghnightLocales || {};
  const LANGS = ['en', 'pl', 'pt-BR', 'fr', 'de'];

  const expansion = {
    neverCards: {
      prefix: '',
      groups: {
        warm: [
          { emoji: '🪩', text: {
            en: 'Never have I ever treated a situationship like it was casual while my body absolutely did not.',
            pl: 'Nigdy nie traktowałem/traktowałam situationship jak luźnej sprawy, kiedy moje ciało miało zupełnie inne zdanie.',
            'pt-BR': 'Eu nunca tratei um rolo como casual enquanto meu corpo claramente discordava.',
            fr: 'Je n’ai jamais traité une situationship comme un truc casual alors que mon corps n’était pas du tout d’accord.',
            de: 'Ich habe noch nie eine Situationship casual genannt, waehrend mein Koerper komplett anderer Meinung war.'
          } },
          { emoji: '📲', text: {
            en: 'Never have I ever replayed a voice note because one breath in it sounded too good.',
            pl: 'Nigdy nie odtwarzałem/odtwarzałam głosówki jeszcze raz, bo jeden oddech brzmiał zbyt dobrze.',
            'pt-BR': 'Eu nunca ouvi um áudio de novo porque uma respiração ali ficou boa demais.',
            fr: 'Je n’ai jamais réécouté un vocal parce qu’un souffle dedans sonnait beaucoup trop bien.',
            de: 'Ich habe noch nie eine Sprachnachricht wiederholt, weil ein Atemzug darin zu gut klang.'
          } },
          { emoji: '🫦', text: {
            en: 'Never have I ever stared at someone’s mouth and hoped they noticed.',
            pl: 'Nigdy nie patrzyłem/patrzyłam komuś na usta, mając nadzieję, że to zauważy.',
            'pt-BR': 'Eu nunca encarei a boca de alguém torcendo para a pessoa perceber.',
            fr: 'Je n’ai jamais fixé la bouche de quelqu’un en espérant qu’il ou elle le remarque.',
            de: 'Ich habe noch nie auf den Mund von jemandem gestarrt und gehofft, dass es auffaellt.'
          } },
          { emoji: '🏷️', text: {
            en: 'Never have I ever had “good girl” or “good boy” land harder than expected.',
            pl: 'Nigdy nie usłyszałem/usłyszałam „grzeczna dziewczynka” albo „grzeczny chłopiec” i nie poczułem/poczułam tego mocniej, niż wypadało.',
            'pt-BR': 'Eu nunca senti um “boa garota” ou “bom garoto” bater mais forte do que devia.',
            fr: 'Je n’ai jamais senti un “brave fille” ou “bon garçon” me toucher plus fort que prévu.',
            de: 'Ich habe noch nie gemerkt, dass „braves Maedchen“ oder „braver Junge“ haerter landet als erwartet.'
          } },
          { emoji: '🪑', text: {
            en: 'Never have I ever wanted to sit on someone’s lap and pretend it was innocent.',
            pl: 'Nigdy nie chciałem/chciałam usiąść komuś na kolanach i udawać, że to niewinne.',
            'pt-BR': 'Eu nunca quis sentar no colo de alguém e fingir que era inocente.',
            fr: 'Je n’ai jamais eu envie de m’asseoir sur les genoux de quelqu’un en prétendant que c’était innocent.',
            de: 'Ich habe noch nie auf jemandes Schoss sitzen und so tun wollen, als waere es harmlos.'
          } },
          { emoji: '👗', text: {
            en: 'Never have I ever dressed for one specific person and acted like it was random.',
            pl: 'Nigdy nie ubrałem/ubrałam się pod jedną konkretną osobę i udawałem/udawałam przypadek.',
            'pt-BR': 'Eu nunca me arrumei para uma pessoa específica e fingi que foi sem querer.',
            fr: 'Je n’ai jamais choisi une tenue pour une personne précise en faisant croire au hasard.',
            de: 'Ich habe noch nie mich extra fuer eine bestimmte Person angezogen und so getan, als waere es Zufall.'
          } },
          { emoji: '🖐️', text: {
            en: 'Never have I ever wanted a hand on my lower back to stay there too long.',
            pl: 'Nigdy nie chciałem/chciałam, żeby dłoń na moich plecach została tam za długo.',
            'pt-BR': 'Eu nunca quis que uma mão na minha lombar ficasse tempo demais.',
            fr: 'Je n’ai jamais voulu qu’une main dans le bas de mon dos reste trop longtemps.',
            de: 'Ich habe noch nie gewollt, dass eine Hand an meinem unteren Ruecken zu lange bleibt.'
          } },
          { emoji: '🍸', text: {
            en: 'Never have I ever been one drink away from saying exactly what I wanted.',
            pl: 'Nigdy nie byłem/byłam o jeden drink od powiedzenia dokładnie, czego chcę.',
            'pt-BR': 'Eu nunca estive a um drink de dizer exatamente o que eu queria.',
            fr: 'Je n’ai jamais été à un verre de dire exactement ce que je voulais.',
            de: 'Ich habe noch nie nur einen Drink davon entfernt gewesen, genau zu sagen, was ich will.'
          } },
          { emoji: '🪞', text: {
            en: 'Never have I ever taken a mirror selfie that felt too charged to post.',
            pl: 'Nigdy nie zrobiłem/zrobiłam selfie w lustrze, które było zbyt naładowane, żeby je wrzucić.',
            'pt-BR': 'Eu nunca tirei selfie no espelho que ficou quente demais para postar.',
            fr: 'Je n’ai jamais pris un selfie miroir trop chargé pour être posté.',
            de: 'Ich habe noch nie ein Spiegelselfie gemacht, das zu geladen zum Posten war.'
          } },
          { emoji: '🖤', text: {
            en: 'Never have I ever pretended not to be jealous because the jealousy was turning me on.',
            pl: 'Nigdy nie udawałem/udawałam, że nie jestem zazdrosny/zazdrosna, bo ta zazdrość mnie nakręcała.',
            'pt-BR': 'Eu nunca fingi que não estava com ciúme porque o ciúme estava me excitando.',
            fr: 'Je n’ai jamais fait semblant de ne pas être jaloux/jalouse parce que la jalousie m’excitait.',
            de: 'Ich habe noch nie so getan, als waere ich nicht eifersuechtig, weil mich die Eifersucht angemacht hat.'
          } },
          { emoji: '👁️', text: {
            en: 'Never have I ever watched someone fix their clothes and imagined undoing the work.',
            pl: 'Nigdy nie patrzyłem/patrzyłam, jak ktoś poprawia ubranie, i wyobrażałem/wyobrażałam sobie, jak to odwracam.',
            'pt-BR': 'Eu nunca vi alguém arrumar a roupa imaginando desfazer tudo.',
            fr: 'Je n’ai jamais regardé quelqu’un remettre ses vêtements en imaginant tout défaire.',
            de: 'Ich habe noch nie zugesehen, wie jemand Kleidung richtet, und mir vorgestellt, alles wieder zu oeffnen.'
          } },
          { emoji: '🃏', text: {
            en: 'Never have I ever used a game as an excuse to say what I already wanted to say.',
            pl: 'Nigdy nie użyłem/użyłam gry jako wymówki, żeby powiedzieć to, co i tak chciałem/chciałam powiedzieć.',
            'pt-BR': 'Eu nunca usei um jogo como desculpa para dizer o que eu já queria dizer.',
            fr: 'Je n’ai jamais utilisé un jeu comme excuse pour dire ce que je voulais déjà dire.',
            de: 'Ich habe noch nie ein Spiel als Ausrede benutzt, um zu sagen, was ich sowieso sagen wollte.'
          } }
        ],
        hot: [
          { emoji: '📱', text: {
            en: 'Never have I ever sent a no-face nude and hoped they still knew exactly it was me.',
            pl: 'Nigdy nie wysłałem/wysłałam nude bez twarzy, licząc, że i tak od razu poznają, że to ja.',
            'pt-BR': 'Eu nunca mandei nude sem rosto esperando que a pessoa soubesse na hora que era meu.',
            fr: 'Je n’ai jamais envoyé un nude sans visage en espérant qu’on sache quand même que c’était moi.',
            de: 'Ich habe noch nie ein Nude ohne Gesicht geschickt und gehofft, dass trotzdem klar ist, dass ich es bin.'
          } },
          { emoji: '🧲', text: {
            en: 'Never have I ever let a “casual” thing become mostly about the sex.',
            pl: 'Nigdy nie pozwoliłem/pozwoliłam, żeby „luźna” relacja stała się głównie seksem.',
            'pt-BR': 'Eu nunca deixei um “casual” virar basicamente sexo.',
            fr: 'Je n’ai jamais laissé un truc “casual” devenir surtout une histoire de sexe.',
            de: 'Ich habe noch nie etwas „Casual“ werden lassen, das fast nur noch um Sex ging.'
          } },
          { emoji: '🧷', text: {
            en: 'Never have I ever liked being undressed because it felt like being claimed.',
            pl: 'Nigdy nie lubiłem/lubiłam być rozbierany/rozbierana, bo brzmiało to jak zawłaszczenie.',
            'pt-BR': 'Eu nunca gostei de ser despido/despida porque parecia posse.',
            fr: 'Je n’ai jamais aimé être déshabillé(e) parce que ça ressemblait à une prise de possession.',
            de: 'Ich habe noch nie gern ausgezogen werden, weil es sich wie Besitz angefuehlt hat.'
          } },
          { emoji: '🎮', text: {
            en: 'Never have I ever wanted someone else to control a toy while I tried to act normal.',
            pl: 'Nigdy nie chciałem/chciałam, żeby ktoś kontrolował toy, kiedy ja próbuję zachowywać się normalnie.',
            'pt-BR': 'Eu nunca quis que alguém controlasse um toy enquanto eu tentava parecer normal.',
            fr: 'Je n’ai jamais voulu que quelqu’un contrôle un toy pendant que j’essayais d’avoir l’air normal.',
            de: 'Ich habe noch nie gewollt, dass jemand ein Toy kontrolliert, waehrend ich normal wirken muss.'
          } },
          { emoji: '🛏️', text: {
            en: 'Never have I ever wanted someone so badly the bedroom felt too far away.',
            pl: 'Nigdy nie chciałem/chciałam kogoś tak bardzo, że sypialnia wydawała się za daleko.',
            'pt-BR': 'Eu nunca quis alguém tanto que o quarto pareceu longe demais.',
            fr: 'Je n’ai jamais eu tellement envie de quelqu’un que la chambre semblait trop loin.',
            de: 'Ich habe noch nie jemanden so sehr gewollt, dass das Schlafzimmer zu weit weg war.'
          } },
          { emoji: '🫳', text: {
            en: 'Never have I ever had my wrists pinned and immediately wanted less freedom.',
            pl: 'Nigdy nie miałem/miałam przytrzymanych nadgarstków i od razu nie chciałem/chciałam mniej wolności.',
            'pt-BR': 'Eu nunca tive os pulsos presos e na hora quis menos liberdade.',
            fr: 'Je n’ai jamais eu les poignets tenus et voulu immédiatement moins de liberté.',
            de: 'Ich habe noch nie meine Handgelenke festgehalten bekommen und sofort weniger Freiheit gewollt.'
          } },
          { emoji: '🪟', text: {
            en: 'Never have I ever wanted a window, a shadow, or a half-open door to make it hotter.',
            pl: 'Nigdy nie chciałem/chciałam, żeby okno, cień albo uchylone drzwi zrobiły z tego coś gorętszego.',
            'pt-BR': 'Eu nunca quis que uma janela, uma sombra ou uma porta entreaberta deixasse tudo mais quente.',
            fr: 'Je n’ai jamais voulu qu’une fenêtre, une ombre ou une porte entrouverte rende tout plus chaud.',
            de: 'Ich habe noch nie gewollt, dass ein Fenster, ein Schatten oder eine halb offene Tuer es heisser macht.'
          } },
          { emoji: '👄', text: {
            en: 'Never have I ever been ruined by one sentence said too close to my mouth.',
            pl: 'Nigdy nie rozwaliło mnie jedno zdanie powiedziane zbyt blisko moich ust.',
            'pt-BR': 'Eu nunca fui destruído/destruída por uma frase dita perto demais da minha boca.',
            fr: 'Je n’ai jamais été détruit(e) par une phrase dite trop près de ma bouche.',
            de: 'Ich habe noch nie wegen eines Satzes verloren, der zu nah an meinem Mund gesagt wurde.'
          } },
          { emoji: '🎥', text: {
            en: 'Never have I ever paused porn because the power dynamic hit too close.',
            pl: 'Nigdy nie zatrzymałem/zatrzymałam porno, bo dynamika władzy trafiła za blisko.',
            'pt-BR': 'Eu nunca pausei pornô porque a dinâmica de poder bateu perto demais.',
            fr: 'Je n’ai jamais mis un porno en pause parce que la dynamique de pouvoir frappait trop juste.',
            de: 'Ich habe noch nie Pornos pausiert, weil die Machtdynamik zu nah getroffen hat.'
          } },
          { emoji: '🥂', text: {
            en: 'Never have I ever wanted to watch someone flirt with my person and not stop it yet.',
            pl: 'Nigdy nie chciałem/chciałam patrzeć, jak ktoś flirtuje z moją osobą, i jeszcze tego nie przerywać.',
            'pt-BR': 'Eu nunca quis ver alguém flertando com a minha pessoa e ainda não interromper.',
            fr: 'Je n’ai jamais voulu regarder quelqu’un draguer ma personne sans arrêter tout de suite.',
            de: 'Ich habe noch nie zusehen wollen, wie jemand mit meiner Person flirtet, ohne es sofort zu stoppen.'
          } },
          { emoji: '🩸', text: {
            en: 'Never have I ever checked a mark the next day and smiled like an idiot.',
            pl: 'Nigdy nie sprawdziłem/sprawdziłam śladu następnego dnia i nie uśmiechnąłem/uśmiechnęłam się jak idiota.',
            'pt-BR': 'Eu nunca olhei uma marca no dia seguinte e sorri feito idiota.',
            fr: 'Je n’ai jamais vérifié une marque le lendemain en souriant comme un idiot.',
            de: 'Ich habe noch nie am naechsten Tag eine Spur angesehen und wie ein Idiot gelaechelt.'
          } },
          { emoji: '🏨', text: {
            en: 'Never have I ever wanted a hotel room for the version of me that does not text back politely.',
            pl: 'Nigdy nie chciałem/chciałam pokoju hotelowego dla wersji mnie, która nie odpisuje grzecznie.',
            'pt-BR': 'Eu nunca quis um quarto de hotel para a versão de mim que não responde educadamente.',
            fr: 'Je n’ai jamais voulu une chambre d’hôtel pour la version de moi qui ne répond pas poliment.',
            de: 'Ich habe noch nie ein Hotelzimmer fuer die Version von mir gewollt, die nicht hoeflich zurueckschreibt.'
          } }
        ],
        fire: [
          { emoji: '🌑', text: {
            en: 'Never have I ever been curious about CNC as a fantasy.',
            pl: 'Nigdy nie byłem/byłam ciekawy/ciekawa CNC jako fantazji.',
            'pt-BR': 'Eu nunca tive curiosidade por CNC como fantasia.',
            fr: 'Je n’ai jamais été curieux/curieuse du CNC comme fantasme.',
            de: 'Ich habe noch nie Neugier auf CNC als Fantasie gehabt.'
          } },
          { emoji: '⛓️', text: {
            en: 'Never have I ever wanted a collar, a leash, or the look that says the same thing.',
            pl: 'Nigdy nie chciałem/chciałam obroży, smyczy albo spojrzenia, które mówi to samo.',
            'pt-BR': 'Eu nunca quis uma coleira, uma guia ou o olhar que diz a mesma coisa.',
            fr: 'Je n’ai jamais voulu un collier, une laisse, ou le regard qui dit la même chose.',
            de: 'Ich habe noch nie ein Halsband, eine Leine oder den Blick gewollt, der dasselbe sagt.'
          } },
          { emoji: '🪟', text: {
            en: 'Never have I ever wanted to be displayed like the room was proud of me.',
            pl: 'Nigdy nie chciałem/chciałam być pokazany/pokazana tak, jakby pokój był ze mnie dumny.',
            'pt-BR': 'Eu nunca quis ser exibido/exibida como se o quarto tivesse orgulho de mim.',
            fr: 'Je n’ai jamais voulu être exposé(e) comme si la pièce était fière de moi.',
            de: 'Ich habe noch nie ausgestellt werden wollen, als waere der Raum stolz auf mich.'
          } },
          { emoji: '🚿', text: {
            en: 'Never have I ever been turned on by the idea of being watched during something too private.',
            pl: 'Nigdy nie podnieciła mnie myśl, że ktoś patrzy podczas czegoś zbyt prywatnego.',
            'pt-BR': 'Eu nunca me excitei com a ideia de ser visto/vista fazendo algo privado demais.',
            fr: 'Je n’ai jamais été excité(e) par l’idée d’être regardé(e) pendant quelque chose de trop privé.',
            de: 'Ich habe noch nie die Vorstellung heiss gefunden, bei etwas zu Privatem beobachtet zu werden.'
          } },
          { emoji: '🎲', text: {
            en: 'Never have I ever wanted two people to silently agree what to do with me.',
            pl: 'Nigdy nie chciałem/chciałam, żeby dwie osoby bez słów ustaliły, co ze mną zrobić.',
            'pt-BR': 'Eu nunca quis que duas pessoas combinassem em silêncio o que fazer comigo.',
            fr: 'Je n’ai jamais voulu que deux personnes se mettent d’accord en silence sur quoi faire de moi.',
            de: 'Ich habe noch nie gewollt, dass zwei Menschen wortlos entscheiden, was sie mit mir machen.'
          } },
          { emoji: '🫦', text: {
            en: 'Never have I ever wanted my mouth to be useful before it was allowed to be clever.',
            pl: 'Nigdy nie chciałem/chciałam, żeby moje usta były użyteczne, zanim pozwolono im być mądre.',
            'pt-BR': 'Eu nunca quis que minha boca fosse útil antes de poder ser esperta.',
            fr: 'Je n’ai jamais voulu que ma bouche soit utile avant d’avoir le droit d’être intelligente.',
            de: 'Ich habe noch nie gewollt, dass mein Mund nuetzlich ist, bevor er klug sein darf.'
          } },
          { emoji: '⏳', text: {
            en: 'Never have I ever wanted someone to deny me just to watch me get worse.',
            pl: 'Nigdy nie chciałem/chciałam, żeby ktoś mi odmawiał tylko po to, żeby patrzeć, jak tracę kontrolę.',
            'pt-BR': 'Eu nunca quis que alguém me negasse só para me ver piorar.',
            fr: 'Je n’ai jamais voulu qu’on me refuse juste pour me regarder devenir pire.',
            de: 'Ich habe noch nie gewollt, dass mir jemand etwas verweigert, nur um mich schlimmer werden zu sehen.'
          } },
          { emoji: '🖤', text: {
            en: 'Never have I ever wanted praise and degradation in the same breath.',
            pl: 'Nigdy nie chciałem/chciałam pochwały i upokorzenia w tym samym oddechu.',
            'pt-BR': 'Eu nunca quis elogio e degradação no mesmo fôlego.',
            fr: 'Je n’ai jamais voulu de la louange et de la dégradation dans le même souffle.',
            de: 'Ich habe noch nie Lob und Degradierung im selben Atemzug gewollt.'
          } },
          { emoji: '🎥', text: {
            en: 'Never have I ever wanted proof of the version of me that only exists after dark.',
            pl: 'Nigdy nie chciałem/chciałam dowodu na wersję mnie, która istnieje tylko po zmroku.',
            'pt-BR': 'Eu nunca quis prova da versão de mim que só existe depois do escuro.',
            fr: 'Je n’ai jamais voulu une preuve de la version de moi qui n’existe qu’après la nuit.',
            de: 'Ich habe noch nie Beweis fuer die Version von mir gewollt, die nur nach Einbruch der Dunkelheit existiert.'
          } },
          { emoji: '🧎', text: {
            en: 'Never have I ever wanted to be put exactly where I belonged.',
            pl: 'Nigdy nie chciałem/chciałam zostać postawiony/postawiona dokładnie tam, gdzie moje miejsce.',
            'pt-BR': 'Eu nunca quis ser colocado/colocada exatamente onde eu pertencia.',
            fr: 'Je n’ai jamais voulu être mis(e) exactement à ma place.',
            de: 'Ich habe noch nie genau dorthin gebracht werden wollen, wo ich hingehoere.'
          } },
          { emoji: '🗿', text: {
            en: 'Never have I ever wanted to stop being a person for one beautiful minute.',
            pl: 'Nigdy nie chciałem/chciałam przestać być osobą na jedną piękną minutę.',
            'pt-BR': 'Eu nunca quis deixar de ser pessoa por um minuto bonito.',
            fr: 'Je n’ai jamais voulu cesser d’être une personne pendant une belle minute.',
            de: 'Ich habe noch nie fuer eine schoene Minute aufhoeren wollen, Person zu sein.'
          } },
          { emoji: '🔥', text: {
            en: 'Never have I ever wanted “no protest” to be the hottest part of the game.',
            pl: 'Nigdy nie chciałem/chciałam, żeby „bez protestu” było najgorętszą częścią gry.',
            'pt-BR': 'Eu nunca quis que “sem protesto” fosse a parte mais quente do jogo.',
            fr: 'Je n’ai jamais voulu que “sans protester” soit la partie la plus chaude du jeu.',
            de: 'Ich habe noch nie gewollt, dass „kein Protest“ der heisseste Teil des Spiels ist.'
          } }
        ]
      }
    },
    truthCards: {
      prefix: 'truth-',
      groups: {
        warm: [
          { emoji: '📱', text: { en: 'What text would make you reread it before answering?', pl: 'Jaka wiadomość sprawiłaby, że przeczytasz ją drugi raz przed odpowiedzią?', 'pt-BR': 'Que mensagem faria você reler antes de responder?', fr: 'Quel message te ferait relire avant de répondre ?', de: 'Welche Nachricht wuerdest du vor dem Antworten zweimal lesen?' } },
          { emoji: '👀', text: { en: 'What do you hope they noticed about you tonight?', pl: 'Co masz nadzieję, że dziś w tobie zauważyli?', 'pt-BR': 'O que você espera que tenham reparado em você hoje?', fr: 'Qu’espères-tu qu’il ou elle ait remarqué chez toi ce soir ?', de: 'Was hoffst du, dass diese Person heute an dir bemerkt hat?' } },
          { emoji: '🫦', text: { en: 'What would you say if your mouth was braver than you?', pl: 'Co byś powiedział/powiedziała, gdyby twoje usta były odważniejsze od ciebie?', 'pt-BR': 'O que você diria se sua boca fosse mais corajosa que você?', fr: 'Que dirais-tu si ta bouche était plus courageuse que toi ?', de: 'Was wuerdest du sagen, wenn dein Mund mutiger waere als du?' } },
          { emoji: '🪩', text: { en: 'What almost-public moment would make this room feel different?', pl: 'Jaki prawie-publiczny moment zmieniłby klimat tego pokoju?', 'pt-BR': 'Que momento quase público mudaria o clima deste quarto?', fr: 'Quel moment presque public changerait l’air de cette pièce ?', de: 'Welcher fast oeffentliche Moment wuerde diesen Raum veraendern?' } },
          { emoji: '🖐️', text: { en: 'Where do you want a hand to pause?', pl: 'Gdzie chcesz, żeby dłoń się zatrzymała?', 'pt-BR': 'Onde você quer que uma mão pare?', fr: 'Où veux-tu qu’une main s’arrête ?', de: 'Wo soll eine Hand kurz stehen bleiben?' } },
          { emoji: '🖤', text: { en: 'What kind of jealousy would secretly flatter you?', pl: 'Jaki rodzaj zazdrości potajemnie by ci schlebiał?', 'pt-BR': 'Que tipo de ciúme secretamente te agradaria?', fr: 'Quelle jalousie te flatterait en secret ?', de: 'Welche Art Eifersucht wuerde dir heimlich schmeicheln?' } },
          { emoji: '🎧', text: { en: 'What song would make you move closer?', pl: 'Jaka piosenka sprawiłaby, że przesuniesz się bliżej?', 'pt-BR': 'Que música faria você chegar mais perto?', fr: 'Quelle chanson te ferait te rapprocher ?', de: 'Welcher Song wuerde dich naeher ruecken lassen?' } },
          { emoji: '😳', text: { en: 'What praise would make you embarrassingly quiet?', pl: 'Jaka pochwała zawstydziłaby cię aż do ciszy?', 'pt-BR': 'Que elogio te deixaria quieto/quieta de vergonha?', fr: 'Quel compliment te rendrait honteusement silencieux/se ?', de: 'Welches Lob wuerde dich peinlich still machen?' } },
          { emoji: '🍷', text: { en: 'What truth gets easier after midnight?', pl: 'Jaka prawda robi się łatwiejsza po północy?', 'pt-BR': 'Que verdade fica mais fácil depois da meia-noite?', fr: 'Quelle vérité devient plus facile après minuit ?', de: 'Welche Wahrheit wird nach Mitternacht leichter?' } },
          { emoji: '🃏', text: { en: 'Which card are you hoping does not come up yet?', pl: 'Której karty masz nadzieję jeszcze nie wylosować?', 'pt-BR': 'Que carta você espera que ainda não apareça?', fr: 'Quelle carte espères-tu ne pas tirer tout de suite ?', de: 'Welche Karte hoffst du, dass noch nicht kommt?' } }
        ],
        hot: [
          { emoji: '🔥', text: { en: 'What do you want more than you want to admit?', pl: 'Czego chcesz bardziej, niż chcesz przyznać?', 'pt-BR': 'O que você quer mais do que quer admitir?', fr: 'Que veux-tu plus que tu ne veux l’admettre ?', de: 'Was willst du mehr, als du zugeben willst?' } },
          { emoji: '🫦', text: { en: 'What sentence would make your body answer first?', pl: 'Jakie zdanie sprawiłoby, że ciało odpowie pierwsze?', 'pt-BR': 'Que frase faria seu corpo responder primeiro?', fr: 'Quelle phrase ferait répondre ton corps en premier ?', de: 'Welcher Satz wuerde deinen Koerper zuerst antworten lassen?' } },
          { emoji: '🪞', text: { en: 'Would you rather watch yourself, watch them, or be watched together?', pl: 'Wolisz patrzeć na siebie, na nich, czy być obserwowanym/obserwowaną razem?', 'pt-BR': 'Você prefere se ver, ver a pessoa, ou serem vistos juntos?', fr: 'Tu préfères te regarder, le/la regarder, ou être regardés ensemble ?', de: 'Wuerdest du lieber dich sehen, diese Person sehen oder zusammen beobachtet werden?' } },
          { emoji: '🧷', text: { en: 'What item of clothing feels most like permission?', pl: 'Który element ubrania najbardziej brzmi jak pozwolenie?', 'pt-BR': 'Que peça de roupa parece mais uma permissão?', fr: 'Quel vêtement ressemble le plus à une permission ?', de: 'Welches Kleidungsstueck fuehlt sich am meisten wie Erlaubnis an?' } },
          { emoji: '🎲', text: { en: 'In a threesome fantasy, do you want to direct, be shared, or watch first?', pl: 'W fantazji o trójkącie chcesz kierować, być dzielony/dzielona czy najpierw patrzeć?', 'pt-BR': 'Numa fantasia de ménage, você quer dirigir, ser dividido/dividida ou ver primeiro?', fr: 'Dans un fantasme à trois, tu veux diriger, être partagé(e), ou regarder d’abord ?', de: 'In einer Dreierfantasie: fuehren, geteilt werden oder zuerst zuschauen?' } },
          { emoji: '🖤', text: { en: 'What order would you enjoy more than you should?', pl: 'Jaki rozkaz spodobałby ci się bardziej, niż powinien?', 'pt-BR': 'Que ordem você gostaria mais do que deveria?', fr: 'Quel ordre aimerais-tu plus que tu ne devrais ?', de: 'Welchen Befehl wuerdest du mehr geniessen, als du solltest?' } },
          { emoji: '🏆', text: { en: 'What do you want to be told you are good at?', pl: 'W czym chcesz usłyszeć, że jesteś dobry/dobra?', 'pt-BR': 'No que você quer ouvir que é bom/boa?', fr: 'Pour quoi veux-tu qu’on te dise que tu es doué(e) ?', de: 'Worin willst du hoeren, dass du gut bist?' } },
          { emoji: '🚿', text: { en: 'What private habit would become hot if the right person liked it?', pl: 'Jaki prywatny nawyk stałby się gorący, gdyby właściwa osoba to lubiła?', 'pt-BR': 'Que hábito privado ficaria quente se a pessoa certa gostasse?', fr: 'Quelle habitude privée deviendrait chaude si la bonne personne aimait ça ?', de: 'Welche private Gewohnheit wuerde heiss, wenn die richtige Person sie mag?' } },
          { emoji: '👁️', text: { en: 'What would you let them watch for ten seconds?', pl: 'Na co pozwoliłbyś/pozwoliłabyś im patrzeć przez dziesięć sekund?', 'pt-BR': 'O que você deixaria a pessoa ver por dez segundos?', fr: 'Que laisserais-tu regarder pendant dix secondes ?', de: 'Was duerfte diese Person zehn Sekunden lang sehen?' } },
          { emoji: '⏳', text: { en: 'What kind of waiting turns you from patient to dangerous?', pl: 'Jakie czekanie zmienia cię z cierpliwej osoby w niebezpieczną?', 'pt-BR': 'Que tipo de espera te transforma de paciente em perigoso/perigosa?', fr: 'Quelle attente te fait passer de patient(e) à dangereux/se ?', de: 'Welche Art Warten macht dich von geduldig zu gefaehrlich?' } }
        ],
        fire: [
          { emoji: '⛓️', text: { en: 'What rule would you hate admitting you want?', pl: 'Jakiej zasady wstydziłbyś/wstydziłabyś się chcieć?', 'pt-BR': 'Que regra você odiaria admitir que quer?', fr: 'Quelle règle détesterais-tu admettre vouloir ?', de: 'Welche Regel wuerdest du ungern zugeben zu wollen?' } },
          { emoji: '🔥', text: { en: 'What does “use me” mean in your hottest version of the room?', pl: 'Co znaczy „użyj mnie” w najgorętszej wersji tego pokoju?', 'pt-BR': 'O que “me usa” significa na versão mais quente deste quarto?', fr: 'Que veut dire “sers-toi de moi” dans la version la plus chaude de la pièce ?', de: 'Was bedeutet „benutz mich“ in der heissesten Version dieses Raums?' } },
          { emoji: '🧎', text: { en: 'What would make kneeling feel less like a pose and more like truth?', pl: 'Co sprawiłoby, że klęczenie byłoby mniej pozą, a bardziej prawdą?', 'pt-BR': 'O que faria ajoelhar parecer menos pose e mais verdade?', fr: 'Qu’est-ce qui ferait de s’agenouiller moins une pose et plus une vérité ?', de: 'Was wuerde Knien weniger wie Pose und mehr wie Wahrheit machen?' } },
          { emoji: '🎥', text: { en: 'What moment would you want saved, even if you acted shy later?', pl: 'Jaki moment chciałbyś/chciałabyś zachować, nawet jeśli potem udawałbyś/udawałabyś wstyd?', 'pt-BR': 'Que momento você gostaria de guardar, mesmo fingindo vergonha depois?', fr: 'Quel moment voudrais-tu garder, même si tu faisais le/la timide après ?', de: 'Welchen Moment wuerdest du speichern wollen, auch wenn du spaeter schuechtern tust?' } },
          { emoji: '🚿', text: { en: 'What bathroom-adjacent fantasy is funnier until it suddenly is not?', pl: 'Jaka łazienkowa fantazja jest śmieszna tylko do chwili, kiedy przestaje być?', 'pt-BR': 'Que fantasia de banheiro é engraçada até de repente não ser?', fr: 'Quel fantasme de salle de bain est drôle jusqu’au moment où il ne l’est plus ?', de: 'Welche Badezimmer-Fantasie ist lustig, bis sie ploetzlich nicht mehr lustig ist?' } },
          { emoji: '🖤', text: { en: 'What word would be too much from almost anyone else?', pl: 'Jakie słowo byłoby za mocne od prawie każdego innego?', 'pt-BR': 'Que palavra seria demais vinda de quase qualquer outra pessoa?', fr: 'Quel mot serait trop venant de presque n’importe qui d’autre ?', de: 'Welches Wort waere von fast allen anderen zu viel?' } },
          { emoji: '👁️', text: { en: 'Would you rather be watched by one hungry person or several quiet ones?', pl: 'Wolisz być oglądany/oglądana przez jedną głodną osobę czy kilka cichych?', 'pt-BR': 'Você prefere ser visto/vista por uma pessoa faminta ou várias quietas?', fr: 'Tu préfères être regardé(e) par une personne affamée ou plusieurs silencieuses ?', de: 'Wuerdest du lieber von einer hungrigen Person oder mehreren stillen beobachtet werden?' } },
          { emoji: '🗿', text: { en: 'What part of being objectified sounds humiliating and perfect?', pl: 'Która część bycia uprzedmiotowionym/uprzedmiotowioną brzmi upokarzająco i idealnie?', 'pt-BR': 'Que parte de ser objetificado/objetificada soa humilhante e perfeita?', fr: 'Quelle partie d’être objectifié(e) semble humiliante et parfaite ?', de: 'Welcher Teil von Objektifizierung klingt erniedrigend und perfekt?' } },
          { emoji: '🎲', text: { en: 'What would make being shared feel like being wanted too much?', pl: 'Co sprawiłoby, że bycie dzielonym/dzieloną brzmiałoby jak bycie chcianym/chcianą za bardzo?', 'pt-BR': 'O que faria ser compartilhado/compartilhada parecer ser desejado/desejada demais?', fr: 'Qu’est-ce qui ferait d’être partagé(e) une preuve d’être trop désiré(e) ?', de: 'Was wuerde Geteiltwerden wie zu starkes Gewolltwerden wirken lassen?' } },
          { emoji: '🌑', text: { en: 'What is the fantasy you would only confess if nobody made it cute?', pl: 'Jaka fantazja wyszłaby z ciebie tylko wtedy, gdyby nikt jej nie upiększał?', 'pt-BR': 'Que fantasia você só confessaria se ninguém tentasse deixar bonitinha?', fr: 'Quel fantasme avouerais-tu seulement si personne ne le rendait mignon ?', de: 'Welche Fantasie wuerdest du nur gestehen, wenn niemand sie niedlich macht?' } }
        ]
      }
    },
    dareCards: {
      prefix: 'dare-',
      groups: {
        warm: [
          { emoji: '👀', text: { en: 'Look at their mouth for three seconds, then look away first.', pl: 'Popatrz na ich usta przez trzy sekundy, potem pierwszy/pierwsza odwróć wzrok.', 'pt-BR': 'Olhe para a boca da pessoa por três segundos, depois desvie primeiro.', fr: 'Regarde sa bouche trois secondes, puis détourne les yeux en premier.', de: 'Schau drei Sekunden auf den Mund dieser Person und sieh dann zuerst weg.' } },
          { emoji: '📱', text: { en: 'Type the message you would send after midnight. Do not send it. Show it.', pl: 'Napisz wiadomość, którą wysłałbyś/wysłałabyś po północy. Nie wysyłaj. Pokaż.', 'pt-BR': 'Digite a mensagem que mandaria depois da meia-noite. Não envie. Mostre.', fr: 'Écris le message que tu enverrais après minuit. Ne l’envoie pas. Montre-le.', de: 'Tipp die Nachricht, die du nach Mitternacht schicken wuerdest. Nicht senden. Zeig sie.' } },
          { emoji: '🖐️', text: { en: 'Place their hand somewhere harmless and make it feel less harmless.', pl: 'Połóż ich dłoń gdzieś niewinnie i spraw, żeby zabrzmiało mniej niewinnie.', 'pt-BR': 'Coloque a mão da pessoa em algum lugar inocente e deixe menos inocente.', fr: 'Pose sa main quelque part d’innocent et rends ça moins innocent.', de: 'Leg ihre Hand irgendwo harmlos hin und mach es weniger harmlos.' } },
          { emoji: '💬', text: { en: 'Give them one compliment that would sound dangerous in a lower voice.', pl: 'Daj im komplement, który niższym głosem brzmiałby niebezpiecznie.', 'pt-BR': 'Faça um elogio que soaria perigoso em voz mais baixa.', fr: 'Fais un compliment qui serait dangereux avec une voix plus basse.', de: 'Mach ein Kompliment, das mit tieferer Stimme gefaehrlich klingen wuerde.' } },
          { emoji: '🪑', text: { en: 'Choose where they sit for one round and make it feel intentional.', pl: 'Wybierz, gdzie siedzą przez jedną rundę, i spraw, żeby wyglądało to celowo.', 'pt-BR': 'Escolha onde a pessoa senta por uma rodada e faça parecer intencional.', fr: 'Choisis où il ou elle s’assoit pendant un tour et rends ça intentionnel.', de: 'Bestimme fuer eine Runde, wo diese Person sitzt, und lass es absichtlich wirken.' } },
          { emoji: '🫦', text: { en: 'Say what their mouth is doing to the room.', pl: 'Powiedz, co ich usta robią z tym pokojem.', 'pt-BR': 'Diga o que a boca da pessoa está fazendo com o quarto.', fr: 'Dis ce que sa bouche fait à la pièce.', de: 'Sag, was ihr Mund mit dem Raum macht.' } },
          { emoji: '😳', text: { en: 'Admit one thought you hoped would stay decorative.', pl: 'Przyznaj jedną myśl, która miała zostać tylko dekoracją.', 'pt-BR': 'Admita um pensamento que você esperava deixar só decorativo.', fr: 'Avoue une pensée que tu espérais garder décorative.', de: 'Gestehe einen Gedanken, der nur dekorativ bleiben sollte.' } },
          { emoji: '🧲', text: { en: 'Move one inch closer every time they blink for ten seconds.', pl: 'Przysuń się o centymetr za każdym razem, gdy mrugną przez dziesięć sekund.', 'pt-BR': 'Chegue um pouco mais perto cada vez que a pessoa piscar por dez segundos.', fr: 'Rapproche-toi un peu à chaque clignement pendant dix secondes.', de: 'Rueck zehn Sekunden lang bei jedem Blinzeln ein Stueck naeher.' } },
          { emoji: '👑', text: { en: 'Tell them one thing that would make them very easy to spoil.', pl: 'Powiedz im jedną rzecz, przez którą łatwo byłoby ich rozpieścić.', 'pt-BR': 'Diga uma coisa que faria a pessoa ser muito fácil de mimar.', fr: 'Dis une chose qui le/la rendrait très facile à gâter.', de: 'Sag eine Sache, wegen der man diese Person sehr leicht verwoehnen koennte.' } },
          { emoji: '🃏', text: { en: 'Let them choose whether your next answer has to be sweeter or dirtier.', pl: 'Niech wybiorą, czy twoja następna odpowiedź ma być słodsza czy brudniejsza.', 'pt-BR': 'Deixe a pessoa escolher se sua próxima resposta será mais doce ou mais suja.', fr: 'Laisse-le/la choisir si ta prochaine réponse sera plus douce ou plus sale.', de: 'Lass diese Person waehlen, ob deine naechste Antwort suesser oder dreckiger sein muss.' } }
        ],
        hot: [
          { emoji: '🫦', text: { en: 'Whisper exactly where you would start with your mouth.', pl: 'Szepnij dokładnie, od czego zacząłbyś/zaczęłabyś ustami.', 'pt-BR': 'Sussurre exatamente onde você começaria com a boca.', fr: 'Chuchote exactement où tu commencerais avec ta bouche.', de: 'Fluestere genau, wo du mit deinem Mund anfangen wuerdest.' } },
          { emoji: '🖐️', text: { en: 'Guide their hand, then stop at the worst possible moment.', pl: 'Poprowadź ich dłoń, potem zatrzymaj w najgorszym możliwym momencie.', 'pt-BR': 'Guie a mão da pessoa e pare no pior momento possível.', fr: 'Guide sa main, puis arrête au pire moment possible.', de: 'Fuehr ihre Hand und stopp im schlimmsten moeglichen Moment.' } },
          { emoji: '🔊', text: { en: 'Say a dirty line like you are not asking permission.', pl: 'Powiedz brudne zdanie tak, jakbyś nie pytał/pytała o pozwolenie.', 'pt-BR': 'Diga uma frase suja como se não estivesse pedindo permissão.', fr: 'Dis une phrase sale comme si tu ne demandais pas la permission.', de: 'Sag einen dreckigen Satz, als wuerdest du nicht um Erlaubnis fragen.' } },
          { emoji: '👁️', text: { en: 'Let them watch you touch one place that is still allowed to be seen.', pl: 'Pozwól im patrzeć, jak dotykasz jednego miejsca, które nadal wolno zobaczyć.', 'pt-BR': 'Deixe a pessoa ver você tocar um lugar que ainda pode ser visto.', fr: 'Laisse-le/la te regarder toucher un endroit encore visible.', de: 'Lass diese Person zusehen, wie du eine Stelle beruehrst, die noch sichtbar sein darf.' } },
          { emoji: '🧷', text: { en: 'Let them choose one thing you loosen for the next card.', pl: 'Niech wybiorą jedną rzecz, którą poluzujesz na następną kartę.', 'pt-BR': 'Deixe a pessoa escolher uma coisa que você afrouxa na próxima carta.', fr: 'Laisse-le/la choisir une chose que tu desserres pour la prochaine carte.', de: 'Lass sie eine Sache waehlen, die du fuer die naechste Karte lockerst.' } },
          { emoji: '⏳', text: { en: 'Make them wait five seconds after they think you are about to touch.', pl: 'Każ im czekać pięć sekund po tym, jak pomyślą, że zaraz dotkniesz.', 'pt-BR': 'Faça a pessoa esperar cinco segundos depois de achar que você vai tocar.', fr: 'Fais-le/la attendre cinq secondes après le moment où il/elle pense que tu vas toucher.', de: 'Lass diese Person fuenf Sekunden warten, nachdem sie denkt, du beruehrst gleich.' } },
          { emoji: '🏆', text: { en: 'Praise them for something that sounds polite until it does not.', pl: 'Pochwal ich za coś, co brzmi grzecznie tylko na początku.', 'pt-BR': 'Elogie a pessoa por algo que parece educado até deixar de parecer.', fr: 'Complimente-le/la pour quelque chose qui semble poli jusqu’à ce que non.', de: 'Lob diese Person fuer etwas, das hoeflich klingt, bis es das nicht mehr tut.' } },
          { emoji: '🎲', text: { en: 'Describe who would get jealous first in a threesome fantasy.', pl: 'Opisz, kto pierwszy byłby zazdrosny w fantazji o trójkącie.', 'pt-BR': 'Descreva quem ficaria com ciúme primeiro numa fantasia de ménage.', fr: 'Décris qui serait jaloux/se en premier dans un fantasme à trois.', de: 'Beschreibe, wer in einer Dreierfantasie zuerst eifersuechtig wuerde.' } },
          { emoji: '🖤', text: { en: 'Give them one soft order and one not-soft order.', pl: 'Daj im jeden miękki rozkaz i jeden wcale nie miękki.', 'pt-BR': 'Dê uma ordem suave e uma nada suave.', fr: 'Donne un ordre doux et un ordre pas doux du tout.', de: 'Gib einen weichen Befehl und einen gar nicht weichen.' } },
          { emoji: '🎥', text: { en: 'Pose for three seconds like the room will remember it.', pl: 'Zapozuj przez trzy sekundy tak, jakby pokój miał to zapamiętać.', 'pt-BR': 'Pose por três segundos como se o quarto fosse lembrar.', fr: 'Pose trois secondes comme si la pièce allait s’en souvenir.', de: 'Pose drei Sekunden, als wuerde der Raum sich daran erinnern.' } }
        ],
        fire: [
          { emoji: '🔥', text: { en: 'Say: “For 60 seconds, I do not get to argue.” Then decide who holds the time.', pl: 'Powiedz: „Przez 60 sekund nie mogę się kłócić”. Potem zdecydujcie, kto pilnuje czasu.', 'pt-BR': 'Diga: “Por 60 segundos, eu não discuto.” Depois decidam quem segura o tempo.', fr: 'Dis : « Pendant 60 secondes, je ne discute pas. » Puis choisissez qui tient le temps.', de: 'Sag: „60 Sekunden lang diskutiere ich nicht.“ Dann entscheidet, wer die Zeit haelt.' } },
          { emoji: '⛓️', text: { en: 'Create one rule for the next three cards.', pl: 'Stwórz jedną zasadę na następne trzy karty.', 'pt-BR': 'Crie uma regra para as próximas três cartas.', fr: 'Crée une règle pour les trois prochaines cartes.', de: 'Erstelle eine Regel fuer die naechsten drei Karten.' } },
          { emoji: '🧎', text: { en: 'Tell them where you would put them if the room obeyed you.', pl: 'Powiedz, gdzie byś ich ustawił/ustawiła, gdyby pokój cię słuchał.', 'pt-BR': 'Diga onde você colocaria a pessoa se o quarto te obedecesse.', fr: 'Dis où tu le/la mettrais si la pièce t’obéissait.', de: 'Sag, wohin du diese Person stellen wuerdest, wenn der Raum dir gehorcht.' } },
          { emoji: '👁️', text: { en: 'Describe exactly how you would want to be watched.', pl: 'Opisz dokładnie, jak chciałbyś/chciałabyś być obserwowany/obserwowana.', 'pt-BR': 'Descreva exatamente como você gostaria de ser visto/vista.', fr: 'Décris exactement comment tu voudrais être regardé(e).', de: 'Beschreibe genau, wie du beobachtet werden willst.' } },
          { emoji: '🚿', text: { en: 'Give the bathroom confession without softening it.', pl: 'Złóż łazienkową spowiedź bez zmiękczania.', 'pt-BR': 'Faça a confissão de banheiro sem suavizar.', fr: 'Fais la confession de salle de bain sans l’adoucir.', de: 'Mach die Badezimmer-Beichte, ohne sie weichzuzeichnen.' } },
          { emoji: '🖤', text: { en: 'Give one praise line and one degrading line that could live together.', pl: 'Powiedz jedną pochwałę i jedną degradującą linię, które mogłyby żyć razem.', 'pt-BR': 'Diga uma frase de elogio e uma de degradação que poderiam morar juntas.', fr: 'Dis une phrase de louange et une phrase dégradante qui pourraient cohabiter.', de: 'Sag eine Lob-Zeile und eine degradierende Zeile, die zusammen passen koennten.' } },
          { emoji: '🎲', text: { en: 'Name the role you would take if there were three hands on you.', pl: 'Nazwij rolę, którą przyjąłbyś/przyjęłabyś, gdyby były na tobie trzy dłonie.', 'pt-BR': 'Nomeie o papel que você teria se houvesse três mãos em você.', fr: 'Nomme le rôle que tu prendrais s’il y avait trois mains sur toi.', de: 'Nenne die Rolle, die du haettest, wenn drei Haende auf dir waeren.' } },
          { emoji: '🫦', text: { en: 'Tell them what your mouth is for, in the least polite way you can manage.', pl: 'Powiedz im, do czego są twoje usta, najmniej grzecznie jak potrafisz.', 'pt-BR': 'Diga para que serve sua boca, do jeito menos educado possível.', fr: 'Dis à quoi sert ta bouche, de la manière la moins polie possible.', de: 'Sag, wofuer dein Mund da ist, so unhoeflich wie du kannst.' } },
          { emoji: '🗿', text: { en: 'Turn them into an object of desire for ten seconds.', pl: 'Zamień ich na dziesięć sekund w obiekt pożądania.', 'pt-BR': 'Transforme a pessoa em objeto de desejo por dez segundos.', fr: 'Transforme-le/la en objet de désir pendant dix secondes.', de: 'Mach diese Person fuer zehn Sekunden zu einem Objekt des Verlangens.' } },
          { emoji: '🌑', text: { en: 'Say the thing you almost censored.', pl: 'Powiedz to, co prawie ocenzurowałeś/ocenzurowałaś.', 'pt-BR': 'Diga a coisa que você quase censurou.', fr: 'Dis la chose que tu as failli censurer.', de: 'Sag das, was du fast zensiert haettest.' } }
        ]
      }
    }
  };

  function nextId(locale, deckName, prefix, tier) {
    const n = locale[deckName].filter(card => card.tier === tier).length + 1;
    return `${prefix}${tier}-${String(n).padStart(2, '0')}`;
  }

  LANGS.forEach(lang => {
    const locale = LOCALES[lang];
    if (!locale) return;
    Object.entries(expansion).forEach(([deckName, pack]) => {
      Object.entries(pack.groups).forEach(([tier, rows]) => {
        rows.forEach(row => {
          locale[deckName].push({
            id: nextId(locale, deckName, pack.prefix, tier),
            tier,
            emoji: row.emoji,
            text: row.text[lang] || row.text.en
          });
        });
      });
    });
  });
})();
