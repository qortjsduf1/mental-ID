import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Heart, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ThumbsUp, 
  AlertCircle, 
  HelpCircle,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Smile,
  Compass,
  Lock,
  Sparkle,
  ArrowRight,
  MessageSquare,
  BarChart3,
  User,
  Send,
  Share2,
  Brush,
  ClipboardList,
  Check,
  ChevronLeft,
  Settings,
  Brain,
  Activity,
  Filter,
  PenTool,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Calendar,
  LockKeyhole,
  Info,
  Download,
  FolderOpen
} from 'lucide-react';

// 초기 진단 질문 (3문항 기본 + 3문항 추가)
const INITIAL_DIAGNOSIS_POOL = [
  {
    id: 1,
    key: "q1",
    question: "Q1. 처음 보는 사람들이 가득한 모임이나 파티에 갔을 때 나는?",
    options: [
      { text: "🙋‍♂️ 먼저 적극적으로 다가가 사람들에게 말을 건다 (관계적 주체성)", value: "E" },
      { text: "☕ 조용한 자리를 찾아 지인들과 대화하거나 관찰한다 (개인 내면 성찰)", value: "I" }
    ]
  },
  {
    id: 2,
    key: "q2",
    question: "Q2. 누군가 내 업무나 행동에 피드백(쓴소리)을 했을 때 첫 반응은?",
    options: [
      { text: "🤔 '왜 저렇게 말하지?' 하며 상대 의도를 비판하거나 상황 탓을 한다 (방어형)", value: "defense" },
      { text: "💔 '내가 역시 실수했구나...' 하며 심하게 낙담하고 불안해한다 (자책형)", value: "self-blame" }
    ]
  },
  {
    id: 3,
    key: "q3",
    question: "Q3. 평소 예상치 못한 스트레스 상황에 맞닥뜨렸을 때 감정의 상태는?",
    options: [
      { text: "🌊 마음의 흔들림이 크고 불안과 짜증이 즉각 밀려온다 (감정 기복형)", value: "N" },
      { text: "⛰️ 덤덤하게 현실을 받아들이고 이성적으로 수습하려 노력한다 (회복탄력형)", value: "S" }
    ]
  },
  {
    id: 4,
    key: "q4",
    question: "Q4. 주말이나 쉬는 날, 에너지를 완벽하게 재충전하는 방법은?",
    options: [
      { text: "🏃 친구들을 만나서 시끌벅적하게 수다를 떨며 스트레스를 푼다", value: "E_extra" },
      { text: "🛌 넷플릭스를 보거나 조용히 방 안에서 혼자만의 시간을 보낸다", value: "I_extra" }
    ]
  },
  {
    id: 5,
    key: "q5",
    question: "Q5. 나와 의견이 전혀 다른 사람과 논쟁이 생겼을 때 나의 태도는?",
    options: [
      { text: "⚡ 내 논리가 맞음을 조목조목 따져서 상대를 설득해야 직성이 풀린다", value: "T_logic" },
      { text: "🤝 관계가 서먹해지는 걸 막기 위해 적당히 양보하고 맞춰준다", value: "F_harmony" }
    ]
  },
  {
    id: 6,
    key: "q6",
    question: "Q6. 계획했던 여행이나 일정이 갑자기 차질이 생겨 꼬여버렸다면?",
    options: [
      { text: "📋 극심한 스트레스를 받으며 대안을 세울 때까지 불안해한다", value: "J_plan" },
      { text: "🌴 '뭐 그럴 수도 있지!' 하며 즉흥적으로 다른 대안을 즐긴다", value: "P_flex" }
    ]
  }
];

// 데일리 인지 교정 성찰 카드 (8개 질문 및 정교한 보상 밸런싱)
const REFLECTION_POOL = [
  {
    id: 1,
    question: "오늘 혹시 주변 친구나 동료의 표정이 조금 어두워 보였을 때, 괜히 '내가 뭐 실수했나..?' 하고 속으로 종일 눈치 보며 걱정했나요? 🥺",
    concept: "개인화 (Personalization)",
    theory: "인지 왜곡",
    yesFeedback: "모든 주변 피드백을 내 탓으로 엮어 피로해지는 '개인화 왜곡' 반응입니다. 상대방은 단지 개인적인 피로감이나 말 못 할 사정이 있을 뿐입니다. 타인의 정서와 내 존재 가치를 단단히 격리해 보세요.",
    noFeedback: "타인의 가라앉은 분위기와 내 본질적인 가치를 성숙하게 분리하여 편안히 넘기시는군요. 아주 훌륭합니다!",
    prescriptions: {
      yes: {
        text: "상대의 굳은 표정을 마주할 때 마음속으로 '저 사람도 오늘 피곤하구나'라고 3번 외치며 산뜻하게 넘겨버리기",
        desc: "[개인화 필터 정화] 타인의 감정에 쓸데없이 에너지를 쓰지 않도록 건강한 바운더리를 세웁니다.",
        reward: { charm: 6, calm: 2, charisma: 1 }
      },
      no: {
        text: "오늘 가벼운 미소와 함께 동료나 친구에게 따뜻한 음료 한 잔 건네거나 먼저 밝게 안부 인사해 보기",
        desc: "[정서 개방 확장] 심리적 마진을 바탕으로 타인과 유연하고 주체적인 연대를 만듭니다.",
        reward: { charm: 4, calm: 1, charisma: 2 }
      }
    }
  },
  {
    id: 2,
    question: "오늘 엉뚱한 일이나 다른 곳에서 짜증이 났는데, 나에게 가장 편하고 만만한 사람(가족, 친한 친구)에게 괜히 틱틱거리거나 화풀이했나요? 😢",
    concept: "전치 (Displacement)",
    theory: "방어기제",
    yesFeedback: "억눌린 감정을 엉뚱한 타인에게 쏟아내는 '전치' 방어기제입니다. 소중한 사람들과의 관계를 상하게 만들기 쉽습니다. 감정의 유래를 자각하고 멈춰 서는 정화가 처방됩니다.",
    noFeedback: "감정의 진짜 시발점을 명확히 직시하여 억울한 희생양을 만들지 않으셨네요! 든든하고 믿음직한 내면 조율력입니다.",
    prescriptions: {
      yes: {
        text: "가까운 이에게 불쑥 짜증 섞인 단어가 튀어나오려 할 때, 입을 다물고 3초간 코로 천천히 심호흡하기",
        desc: "[전치 브레이크] 찰나의 호흡으로 뇌를 환기하고 감정적 전치 충동을 억제합니다.",
        reward: { calm: 8, charm: 2, charisma: 1 }
      },
      no: {
        text: "항상 내 옆을 든든하게 지켜주는 소중한 사람에게 '오늘 고마워' 하고 구체적으로 감사한 점 문자로 전하기",
        desc: "[관계 윤택력 상승] 건강한 감정을 적극 순환시켜 내면의 카리스마와 매력을 다집니다.",
        reward: { calm: 5, charm: 3, charisma: 2 }
      }
    }
  },
  {
    id: 3,
    question: "내가 실수했거나 잘못한 일이 지적받았을 때, 인정하기 어색하거나 머쓱해서 머릿속으로 온갖 그럴듯한 핑계부터 떠올렸나요? 🫣",
    concept: "합리화 (Rationalization)",
    theory: "방어기제",
    yesFeedback: "자아 상처를 방어하기 위해 핑계를 엮어내는 '합리화' 방어기제입니다. 회피할수록 소중한 관계에서의 주도성과 신뢰는 무너집니다. 솔직하게 대면하고 책임지는 당당한 처방이 처방됩니다.",
    noFeedback: "변명의 달콤한 유혹을 멋지게 이겨내고 나 자신의 아쉬운 점도 의연하게 받아들이는 단단한 자아 조절력을 보여주셨네요!",
    prescriptions: {
      yes: {
        text: "비판받거나 실수를 알아챈 순간, 즉각 변명을 멈추고 '제 착오였습니다. 신속하게 보완할게요'라고 정중히 인정하기",
        desc: "[신뢰 주도성 강화] 정직하고 깔끔한 인정을 통해 내면의 신뢰와 주체성을 극대화합니다.",
        reward: { charisma: 7, calm: 2, charm: 2 }
      },
      no: {
        text: "동료나 지인이 조심스레 건네준 이견이나 쓴소리에 대해 '생각해 볼 가치가 있는 피드백이네, 고마워!'라고 포용하기",
        desc: "[피드백 연마] 타인의 객관적인 평가를 내 성장의 양분으로 유연하게 통합합니다.",
        reward: { charisma: 5, calm: 2, charm: 3 }
      }
    }
  },
  {
    id: 4,
    question: "작은 실수나 사소한 거절 하나를 겪고 '이번 일은 아예 망했어, 내 인생도 결국 다 실패야'라며 상황을 끔찍하게 확장해 낙담했나요? 🌋",
    concept: "파국화 (Overgeneralization)",
    theory: "인지 왜곡",
    yesFeedback: "국소적인 거절을 인생 전체의 대재앙으로 부풀려 공포를 만드는 '파국화/과일반화' 왜곡입니다. 무너진 자아 평정을 다잡기 위한 팩트 중심 조율 임무를 수행해 보세요.",
    noFeedback: "일시적인 사건과 내 삶 전체의 거대한 가치를 아주 잘 구분하고 계십니다! 흔들림 없이 편안한 정서 상태입니다.",
    prescriptions: {
      yes: {
        text: "메모장에 '이번에 실제로 잃은 사소한 것 1가지'와 '여전히 나에게 든든히 남아있는 고유 자산 3가지'를 대조해 적기",
        desc: "[파국 해체] 거품 낀 막연한 공포를 팩트로 쪼개서 해소하고 심리적 마진을 복구합니다.",
        reward: { calm: 6, charisma: 2, charm: 1 }
      },
      no: {
        text: "일정이나 계획에 예기치 못한 어긋남이 발생했을 때 입 밖으로 크게 '오히려 좋아! 해보지 뭐!'라고 명랑하게 외치기",
        desc: "[회복탄력성 강화] 예기치 못한 우연에 꺾이지 않는 유연하고 활기찬 마음을 만듭니다.",
        reward: { calm: 4, charm: 2, charisma: 2 }
      }
    }
  },
  {
    id: 5,
    question: "좋아하는 상대나 친구의 답장이 조금만 늦어져도 '이제 나한테 흥미가 식은 게 분명해'라며 속으로 멋대로 불안을 속단했나요? 📳",
    concept: "독심술 왜곡 (Mind Reading)",
    theory: "인지 왜곡",
    yesFeedback: "상대의 속내를 자의적으로 지레짐작해 나 스스로 불안을 태우는 '독심술 왜곡'입니다. 조급해질수록 나를 잃어버리기 쉽습니다. 건강한 심리적 경계를 개방하는 처방전이 나옵니다.",
    noFeedback: "정말 건강하고 느긋한 자아 상태입니다! 상대방의 속도와 상황을 있는 그대로 존중하며 여유를 지켜내시네요.",
    prescriptions: {
      yes: {
        text: "연락이 오기 전까지 폰을 엎어두고, 내가 좋아하는 취미나 공부에 30분 동안 내 영혼을 온전히 몰입시키기",
        desc: "[정서 독립] 정서적 과의존을 끄고 내 고유한 삶의 영역을 밝게 개방하여 자율성을 지킵니다.",
        reward: { charm: 6, calm: 3, charisma: 1 }
      },
      no: {
        text: "연락이 다시 닿았을 때 서운한 틱틱거림 대신 '오늘 많이 바빴구나! 수고했어!'라며 공감과 지지의 문장 건네기",
        desc: "[여유의 연대력] 조바심을 다정한 온기로 녹여내며 호감도와 소통 매력을 극대화합니다.",
        reward: { charm: 4, calm: 3, charisma: 2 }
      }
    }
  },
  {
    id: 6,
    question: "누군가 공적으로 내 의견에 이의를 제기하거나 반대했을 때, '저 사람은 그냥 나를 싫어하는 적인가 봐'라며 내 편과 적으로 구분했나요? ⚔️",
    concept: "이분법적 사고 (Split Thinking)",
    theory: "인지 왜곡",
    yesFeedback: "세상을 내 편과 적으로 칼같이 편 가르는 '흑백논리 왜곡'입니다. 공적인 반대를 사적인 미움으로 오해하면 나만의 리더십이 좁아집니다. 통합의 수양 처방이 시작됩니다.",
    noFeedback: "의견이 다른 사람에게서도 가치를 배우며 나만의 넓은 포용력으로 승화시키는 넓은 그릇을 가지셨네요! 최고의 카리스마입니다.",
    prescriptions: {
      yes: {
        text: "나와 의견이 달랐던 사람의 기획 아이디어 중 '팩트로서 동조할 수 있는 장점 1가지'를 수첩에 적고 인정해 주기",
        desc: "[통합의 소통] 적대적인 프레임을 공적 조율로 승화시켜 강력한 관계 주도성을 다집니다.",
        reward: { charisma: 8, charm: 2, calm: 1 }
      },
      no: {
        text: "일부러 입장 차이가 컸던 사람에게 찾아가 '아까 그 점은 미처 생각 못 했어요'라며 따뜻한 커피 한 잔 나누기",
        desc: "[리더의 포용] 갈등마저 내 성장의 인맥으로 흡수하여 매력과 장악력을 격상합니다.",
        reward: { charisma: 5, charm: 3, calm: 2 }
      }
    }
  },
  {
    id: 7,
    question: "오늘 내 기분이 유독 피곤하고 꿀꿀하다는 이유로 '내 성격은 원래 이 모양이야, 내 인생도 우울해'라며 기분대로 미래를 낙인찍었나요? ☔",
    concept: "감정적 추론 (Emotional Reasoning)",
    theory: "인지 왜곡",
    yesFeedback: "순간적인 감정 상태를 영원한 진실인 양 착각하는 '감정적 추론'입니다. 기분은 가볍게 불어오는 구름일 뿐 내 고유한 정체성이 아닙니다. 회복탄력성 처방을 이식하세요.",
    noFeedback: "정말 든든하고 단단합니다. 변덕스러운 내면의 감정에 휘말리지 않고 나의 변치 않는 현실 자산을 뚜렷이 보호하시네요.",
    prescriptions: {
      yes: {
        text: "거울을 똑바로 보고 '내 일시적 기분은 구름일 뿐, 내 내면의 가치는 늘 맑고 단단하다'고 소리 내어 말해 주기",
        desc: "[감정 해리 훈련] 뇌가 감정의 인지 왜곡 덫에서 풀려나 회복 자가 면역력을 높이도록 돕습니다.",
        reward: { calm: 6, charm: 2, charisma: 2 }
      },
      no: {
        text: "몸이 처지는 순간을 인지하자마자 가벼운 어깨 스트레칭이나 폼롤러 마사지를 5분간 기계적으로 실천하기",
        desc: "[신체 피드백] 생체를 물리적으로 움직여 정서 가라앉음을 차단하고 활력을 복구합니다.",
        reward: { calm: 4, charisma: 3, charm: 2 }
      }
    }
  },
  {
    id: 8,
    question: "나 스스로 혹은 타인을 향해 늘 '무조건 이렇게 해야만 해(Should)'라는 완벽주의 규칙을 강제하며 분노했나요? 📏",
    concept: "당위적 규칙 (Should Rules)",
    theory: "인지 왜곡",
    yesFeedback: "숨구멍을 조이는 과도한 통제 진술인 '당위적 규칙 왜곡'입니다. 규칙의 올가미를 헐겁게 늘리고, 스스로에게 유연한 자유를 주는 처방 임무가 가동됩니다.",
    noFeedback: "자신과 타인 모두에게 따뜻한 숨구멍을 열어주시는 여유 넘치는 포용가이십니다! 곁에 있고 싶은 편안한 자아입니다.",
    prescriptions: {
      yes: {
        text: "오늘 내가 세웠던 규칙 중 하나를 골라 '그럴 수도 있지, 꼭 그러지 않아도 괜찮다'고 적고 넘기기",
        desc: "[당위성 완화] 엄격함의 올가미를 풀어 정서 개방 수용력을 크게 보충합니다.",
        reward: { charm: 8, calm: 2, charisma: 1 }
      },
      no: {
        text: "자신이나 동료가 가벼운 실수를 저질렀을 때 찡그리지 않고 '그럴 수 있죠!' 하고 여유롭게 넘어가 주기",
        desc: "[여유의 품격] 실수에 관대하여 타인이 마음 놓고 귀순할 수 있는 정서 장벽을 만듭니다.",
        reward: { charm: 5, calm: 3, charisma: 2 }
      }
    }
  }
];

// TCI 약식 14문항 질문지
const TCI_QUESTIONS = [
  { id: 1, text: "나는 계획에 없던 충동적 모험을 떠나거나 새로운 일을 시도하는 것을 매우 좋아한다.", dimension: "NS", label: "자극 추구 (Novelty Seeking)" },
  { id: 2, text: "어떤 물건을 살 때 오래 고민하지 않고 첫눈에 마음에 들면 일단 사고 본다.", dimension: "NS", label: "자극 추구 (Novelty Seeking)" },
  { id: 3, text: "앞으로 발생할 수 있는 잠재적 위험이나 실수에 대해 사전에 지나치게 걱정하는 편이다.", dimension: "HA", label: "위험 회피 (Harm Avoidance)" },
  { id: 4, text: "피로가 잘 풀리지 않으며, 남의 사소한 부정적 표정에도 쉽게 위축되고 긴장한다.", dimension: "HA", label: "위험 회피 (Harm Avoidance)" },
  { id: 5, text: "주변 사람들이 나를 미워하거나 비판하지 않을까 시선에 신경을 몹시 쓴다.", dimension: "RD", label: "사회적 민감성 (Reward Dependence)" },
  { id: 6, text: "타인의 칭찬이나 지지를 받으면 동기부여가 극대화되며, 남의 일도 쉽게 돕고 공감한다.", dimension: "RD", label: "사회적 민감성 (Reward Dependence)" },
  { id: 7, text: "체력이 바닥나거나 일이 난관에 봉착해도 한 번 마음먹은 것은 끝까지 포기하지 않는다.", dimension: "PS", label: "인내력 (Persistence)" },
  { id: 8, text: "어떤 활동을 할 때 다른 사람들의 기대를 저버리지 않기 위해 완벽하게 완수하려 지독히 애쓴다.", dimension: "PS", label: "인내력 (Persistence)" },
  { id: 9, text: "내 선택에 전적인 책임을 질 의향이 있으며, 외부 압박보다 스스로 주체적인 행동을 선호한다.", dimension: "SD", label: "자율성 (Self-Directedness)" },
  { id: 10, text: "나 자신에 대해 깊은 만족을 느끼며, 나의 못난 점이나 그림자도 포용하고 받아들인다.", dimension: "SD", label: "자율성 (Self-Directedness)" },
  { id: 11, text: "나와 사상, 가치관이 상반된 사람이라도 그들의 고유한 입장을 비판 없이 존중해 준다.", dimension: "CO", label: "연대감 (Cooperativeness)" },
  { id: 12, text: "공동체의 상생과 복지를 위해 내 사소한 물질적, 시간적 손해는 기꺼이 감수할 용의가 있다.", dimension: "CO", label: "연대감 (Cooperativeness)" },
  { id: 13, text: "우주와 대자연, 혹은 훌륭한 예술품을 볼 때 내가 그 전체와 결합되어 있다는 숭고함을 느낀다.", dimension: "ST", label: "자기 초월 (Self-Transcendence)" },
  { id: 14, text: "삶과 죽음의 영적인 의미나 가치를 끊임없이 찾아 탐색하며 비현실적 신비를 동경하곤 한다.", dimension: "ST", label: "자기 초월 (Self-Transcendence)" }
];

// 대화 훈련 멀티턴 '감정 분기형' 시나리오 DB
const CHAT_SCENARIOS = [
  {
    id: "work_doc",
    category: "work",
    categoryLabel: "🏢 회사/직장",
    title: "기획서 누락 갈등 (민지 대리)",
    desc: "취합 누락으로 격앙된 민지 대리와 감정을 조율하는 분기형 3회 핑퐁 훈련입니다.",
    intro: "민지 대리가 격앙된 어조로 메신저를 보내왔습니다.",
    characterName: "민지 대리",
    characterSender: "colleague",
    maxTurns: 3,
    botInitialMessage: "아니, 이번 기획안 취합본에 제 파트가 왜 또 빠져 있나요? 매번 이런 식이니까 솔직히 같이 일하기 너무 피곤하네요.",
    branches: {
      "start": [
        {
          text: "💬 A: 누락된 건 제 착오네요. 민지 대리님이 정리해주신 자료를 합치는 과정에서 실수가 생겼습니다. 즉시 반영할게요.",
          desc: "[쿠션어 / 실인정] 상대의 분노를 먼저 수용함",
          reply: "아.. 바로 인정해주시니 다행인데, 지난주에도 비슷하게 취합 실수 있으셨던 거 기억하세요? 왜 이런 일이 잦은가요?",
          nextBranch: "path_A",
          score: { charm: 4, calm: 2, charisma: 2 }
        },
        {
          text: "💬 B: 누락된 건 확인해보겠는데 원래 기한 지나서 늦게 주신 거 아닌가요?",
          desc: "[역비난 / 투사] 잘못을 피하기 위해 상대의 잘못을 들춤",
          reply: "제가 늦게 보낸 건 사실이지만, 마감 전에 한마디 말도 없이 누락시키는 게 당연하다는 말씀이세요? 진짜 이기적이네요.",
          nextBranch: "path_B",
          score: { charm: -4, calm: -4, charisma: 1 }
        },
        {
          text: "💬 C: 아, 죄송합니다. 정신이 없었네요. 대충 다시 넣어서 보낼게요.",
          desc: "[무성의 회피] 대충 얼버무리려 함",
          reply: "맨날 '정신없다'로 퉁치시는데, 같이 협업하는 동료에 대한 예의가 아닌 것 같습니다. 실수는 늘 대리님만 하잖아요.",
          nextBranch: "path_C",
          score: { charm: 1, calm: 1, charisma: -2 }
        }
      ],
      "path_A": [
        {
          text: "💬 A: 지난번 일까지 포함해 꼼꼼히 검수하지 못한 제 미흡함이 맞습니다. 앞으로는 수신 메일 체크 리스트를 작성해 기계적으로 검수할 테니 부디 한 번만 더 헤아려주세요.",
          desc: "[재발 방지 대책] 구체적 해결 행동 제시",
          reply: "계획까지 말씀해주시니 마음이 좀 놓이네요. 저도 오늘 바쁜 일이 겹쳐 너무 곤두서서 쏘아붙였던 것 같습니다. 죄송해요.",
          nextBranch: "end",
          score: { charm: 6, calm: 4, charisma: 4 }
        },
        {
          text: "💬 B: 사람이 일하다 보면 실수 한두 번 할 수 있죠. 너무 빡빡하게 몰아세우시니까 저도 마음이 상하네요.",
          desc: "[적대적 방어] 사과 후 되려 서운함 표시",
          reply: "실수를 해놓고 빡빡하다니요? 대리님 진짜 뻔뻔하시네요. 더 대화하고 싶지 않습니다.",
          nextBranch: "end_fail",
          score: { charm: -6, calm: -4, charisma: -1 }
        },
        {
          text: "💬 C: 네, 다음부턴 조심할게요. 기획서 다시 보냈으니 메일 확인 부탁드려요.",
          desc: "[단답 조율]",
          reply: "네. 메일 확인했습니다. 수고하세요.",
          nextBranch: "end",
          score: { charm: 1, calm: 1, charisma: -3 }
        }
      ],
      "path_B": [
        {
          text: "💬 A: 욱해서 기한 이야기를 꺼낸 점 사과드립니다. 제 누락 실수가 본질인데, 방어적으로 변명을 늘어놓아 대리님 기분을 더 상하게 해드렸네요. 기획안은 즉시 제 지분 책임지고 정돈해 수정 상신하겠습니다.",
          desc: "[회복 조치] 내 방어 본능을 인정하고 진정성 있는 사과로 선회",
          reply: "방어적이었다고 직접 털어놓으시니 화가 좀 풀리네요. 저도 마감 스트레스 때문에 예민했습니다. 기획서 수정 부탁드립니다.",
          nextBranch: "end",
          score: { charm: 5, calm: 6, charisma: 4 }
        },
        {
          text: "💬 B: 제가 이기적이라뇨? 본인이 기한 늦어놓고 큰소리치시는 게 더 이기적인 거 아닌가요? 공과 사를 구별하세요.",
          desc: "[싸움 종결 유발] 관계 파탄의 극단적 격돌",
          reply: "해봐 어디! 나도 가만 안 있는다. 부장님께 대리님 취합 실수 및 태도 결여 보고서 작성해 상신하겠습니다.",
          nextBranch: "end_fail",
          score: { charm: -7, calm: -7, charisma: -2 }
        },
        {
          text: "💬 C: 어찌 됐건 기획서 수정해서 다시 보냈습니다. 됐죠?",
          desc: "[건조한 매듭]",
          reply: "네. 공적으로만 대화하죠.",
          nextBranch: "end",
          score: { charm: -2, calm: 1, charisma: -5 }
        }
      ],
      "path_C": [
        {
          text: "💬 A: 제 사과가 가벼워 진정성이 안 느껴지셨을 만합니다. 대리님의 노고가 묻히는 상황을 쉽게 생각해 상처 드려 진심으로 죄송합니다. 앞으론 주의하겠습니다.",
          desc: "[쿠션어 복구] 가벼운 어조를 수습함",
          reply: "제 노력을 조금이나마 헤아려 주시니 고맙네요. 다음부턴 더 프로다운 조율을 기대할게요.",
          nextBranch: "end",
          score: { charm: 4, calm: 5, charisma: 4 }
        },
        {
          text: "💬 B: 실수 늘 저만 한다니요? 지난번 대리님 오탈자 10개 난 건 실수 아닌가요?",
          desc: "[과거 들추기] 논점을 흐림",
          reply: "이 대화 방식을 보니 일뿐만 아니라 인간적으로도 엮이고 싶지 않네요. 수고하세요.",
          nextBranch: "end_fail",
          score: { charm: -6, calm: -6, charisma: 1 }
        },
        {
          text: "💬 C: 네, 죄송요.",
          desc: "[무책임의 끝]",
          reply: "답장 보내지 마세요.",
          nextBranch: "end_fail",
          score: { charm: -5, calm: -2, charisma: -7 }
        }
      ]
    }
  },
  {
    id: "school_free",
    category: "school",
    categoryLabel: "🏫 조별과제 무임승차",
    title: "조별과제 무임승차 대처 (영수)",
    desc: "학점만 묻어가려는 영수에게 분기별 단호함을 보여주는 2회 핑퐁 훈련입니다.",
    intro: "과제 제출 이틀 전, 연락을 씹던 조원 영수가 카톡을 보냈습니다.",
    characterName: "조원 (영수)",
    characterSender: "colleague",
    maxTurns: 2,
    botInitialMessage: "어이 조장~ 미안미안! 내가 어제 동아리 모임 땜에 술을 너무 마셔서 파일 이제 봄.. 취합할 때 그냥 내 이름 묻어가면 안 되냐? ㅎㅎ",
    branches: {
      "start": [
        {
          text: "💬 A: 영수야, 사정은 알겠지만 모든 조원이 기한에 맞춰 끝냈기 때문에 아무 기여 없이 이름을 올리는 건 공정하지 않아. 오늘 저녁 8시까지 자료 제출하지 않으면 명단에서 제외할 수밖에 없어.",
          desc: "[조건부 경고] 마감 시간과 규칙 고지",
          reply: "헐... 정색하고 그러니까 무섭네 야; 근데 마감 시간 오늘 저녁은 너무 촉박한 거 아냐? 나도 오늘 저녁에 조교 면담 있어서 바쁜데 조금만 더 봐주라 ㅠㅠ",
          nextBranch: "path_A",
          score: { charm: 3, calm: 5, charisma: 6 }
        },
        {
          text: "💬 B: 야 진짜 양심 어디 갔냐? 너 같은 빌런 땜에 스트레스받아 뒤지겠다. 이름 빼버릴 거고 교수님한테 리포트 다 찌를 테니 꺼져라.",
          desc: "[감정적 폭언] 분노 대변",
          reply: "말 진짜 싸가지 없게 하네. 내가 안 하겠다는 것도 아니고 술자리 사정 있었다는데 사람을 쓰레기 취급하냐? 해봐 어디! 나도 가만 안 있는다.",
          nextBranch: "path_B",
          score: { charm: -4, calm: -4, charisma: 1 }
        },
        {
          text: "💬 C: 하... 어쩔 수 없죠. 이번만 올려드릴 테니까 발표할 때 빔프로젝터 넘기는 보조라도 성실히 해주세요.",
          desc: "[호구형 양보] 타인의 태만을 그대로 용인",
          reply: "오 역시 우리 착한 조장! 고마워 고마워~ 발표 때 내가 버튼 누르는 건 완벽하게 도울게!",
          nextBranch: "end",
          score: { charm: 2, calm: -2, charisma: -6 }
        }
      ],
      "path_A": [
        {
          text: "💬 A: 조원들이 일주일 내내 밤샘하며 작성한 자료야. 조교 면담 전후 1시간을 내서라도 맡았던 3페이지 요약본을 작성해 보내. 그 최소한의 기여조차 없다면, 예정대로 교수님께 무임승차 보고서를 발송할게.",
          desc: "[단호한 경계 재선포] 타협 불가의 원칙",
          reply: "아... 알았어 야. 조교 면담 끝나고 PC방 가서 바로 타이핑해서 8시 직후엔 꼭 보낼게. 제발 제외하진 말아줘 미안해.",
          nextBranch: "end",
          score: { charm: 4, calm: 6, charisma: 7 }
        },
        {
          text: "💬 B: 조교 핑계 대지 말고 닥치고 과제나 해와. 나쁜 놈아.",
          desc: "[원색적 비난] 상대의 태도를 모욕",
          reply: "에이 퉤, 더러워서 과제 안 하고 학점 F 받고 만다. 내 이름 빼라 빼! 나쁜 자식아.",
          nextBranch: "end_fail",
          score: { charm: -4, calm: -5, charisma: -1 }
        },
        {
          text: "💬 C: 음.. 그럼 내일 아침 9시까지는 꼭 해와야 해. 약속해.",
          desc: "[경계선 붕괴] 기한을 계속 늦추어 줌",
          reply: "오 역시 맘씨 넓어! 내일 아침에 대충 짜깁기해서 줄게 땡큐~",
          nextBranch: "end",
          score: { charm: 1, calm: 0, charisma: -5 }
        }
      ],
      "path_B": [
        {
          text: "💬 A: 나도 걱정이 과해져 뾰족하게 비난부터 뱉었네. '배려 없다'고 공격해서 미안해. 다만 아무 기약 없이 몇 시간 동안 무소식이니 나쁜 상상이 들어 순간적으로 이성이 흐려졌던 것 같아.",
          desc: "[공격 본능 성찰 / 솔직한 감정 고백] 관계 회복력 가동",
          reply: "음.. 자기 마음 졸였을 거 생각하면 내 부주의도 맞지. 나쁜 일 생긴 줄 걱정해줘서 한 말인데 늦게 와서 사나운 말만 듣게 되니 욱했었어. 앞으론 꼭 신경 쓸게.",
          nextBranch: "end",
          score: { charm: 5, calm: 6, charisma: 5 }
        },
        {
          text: "💬 B: 억울하긴 뭐가 억울해? 넌 매번 피코(피해자 코스프레)가 취미더라.",
          desc: "[극단 매도]",
          reply: "진짜 대화 자체가 공해다. 그만하자 우리.",
          nextBranch: "end_fail",
          score: { charm: -7, calm: -7, charisma: -2 }
        },
        {
          text: "💬 C: 미안해. 내일 얘기해.",
          desc: "[성의 없는 복사기 사과]",
          reply: "어 그래 나 잔다.",
          nextBranch: "end",
          score: { charm: -1, calm: 1, charisma: -5 }
        }
      ]
    }
  }
];

// 상황 및 소통 템플릿을 완비한 임상 소통 쿠션어 사전 데이터
const CUSHION_DICTIONARY = [
  {
    category: "부탁",
    title: "🤝 무언가 부탁/요청할 때",
    desc: "상대의 업무나 시간을 침해하지 않는다는 배려를 먼저 깔고, 대안적 선택지를 주어 정중하게 요청합니다.",
    templates: [
      {
        situation: "동료에게 갑작스럽게 자료 공유를 부탁해야 할 때",
        expression: "“지수 대리님, 오늘 바쁘신 와중에 번거로운 요청을 드리게 되어 정말 죄송합니다. 다름이 아니라 기획안에 대리님 분석 파트가 필요해서 연락드렸는데요. 혹시 오늘 퇴근 전이나 내일 오전 중 편하신 시간에 짧게 보내주시는 것이 가능하실까요?”"
      },
      {
        situation: "일정을 갑자기 변경해야 할 때",
        expression: "“과장님, 공유해주신 회의 시간이 유익하지만 마침 선행 실무 검수 회의와 겹치게 되었습니다. 부득이하게 회의 시간을 1시간 미루거나 서면으로 먼저 피드백을 전달드려도 실무 일정에 무리가 없으실까요?”"
      }
    ]
  },
  {
    category: "거절",
    title: "🙅‍♂️ 정중하고 단호히 거절할 때",
    desc: "상대의 제안 가치나 감정은 흔쾌히 인정하되(Cushion), 내 현실 한계(팩트)를 단호히 선포하고 대안을 얹습니다.",
    templates: [
      {
        situation: "주말 회식이나 개인 약속 거절 시",
        expression: "“차장님, 오늘 불금 자리 분위기가 정말 유쾌해서 저도 끝까지 동참하고 싶은 마음이 굴뚝같습니다! 다만 미리 잡힌 가족 모임 선약이 있어서 부득이하게 2차는 먼저 물러가게 되었습니다. 아쉬운 마음을 담아 다음 주 화요일 점심에 제가 차장님이 좋아하시는 식당으로 모시겠습니다.”"
      },
      {
        situation: "부당한 급박한 업무 대리 요청 거절 시",
        expression: "“부장님, 급하신 사정은 백번 이해하며 도와드리고 싶습니다. 다만 제가 오늘 마감인 다른 분석 리포트 검수가 밀려 있어 지금 이 건을 잡으면 두 서류 모두 완성도가 훼손될 우려가 있습니다. 내일 출근하자마자 최우선으로 검토해 올려드려도 괜찮으실까요?”"
      }
    ]
  },
  {
    category: "사과",
    title: "🙇‍♂️ 지각이나 실수를 성숙히 시인할 때",
    desc: "핑계를 대어 왜곡하기보다는 팩트를 정직하게 인정하고, 구체적인 재발 방지 해결책을 제시합니다.",
    templates: [
      {
        situation: "회사나 약속에 늦었을 때",
        expression: "“늦어서 정말 죄송합니다. 지하철 지연 사정이 있었으나, 아침 혼잡 구간의 변수를 사전에 고려하여 출근 시간을 더 앞당겨 설정하지 못한 제 일정 조율 착오입니다. 내일부터는 20분 일찍 출발하여 8시 50분 이전에 안정적으로 준비하겠습니다.”"
      },
      {
        situation: "실무 처리 과정에서 누락이나 실수가 발견되었을 때",
        expression: "“민지 씨, 기획서 취합 과정에서 제 부주의로 소중한 파트를 누락시켜 심려를 끼쳐 죄송합니다. 변명 없는 제 착오이며, 즉시 수정안을 반영해 결재 메일을 재발송했습니다. 앞으로는 교차 검수 체크리스트를 활용해 실수를 예방하겠습니다.”"
      }
    ]
  },
  {
    category: "반대",
    title: "⚡ 내 의견과 다를 때 (반대 의견 개진)",
    desc: "상대의 아이디어를 후려치거나 매도하지 않고 공감과 가치를 수용한 뒤, 팩트 중심의 제2안을 설득력 있게 제시합니다.",
    templates: [
      {
        situation: "회의 중 다른 동료의 아이디어에 이견이 있을 때",
        expression: "“민호 씨가 제안해주신 디자인 시안은 확실히 젊은 층에 시각적 임팩트가 강해 아주 매력적이라고 생각합니다! 다만, 예산과 유지보수 효율성 측면에서 개발 비용이 다소 높게 책정될 우려가 있으니, 이 임팩트를 유지하면서 레이아웃을 1단계 간소화하는 대안도 함께 검토해보면 어떨까요?”"
      }
    ]
  },
  {
    category: "연인",
    title: "❤️ 연인에게 서운함을 성숙하게 전할 때",
    desc: "상대의 태도나 성격을 매도하는 대신, 구체적인 팩트 상황에서 '내가 느꼈던 불안이나 서운함(I-Message)' 위주로 털어놓습니다.",
    templates: [
      {
        situation: "연락 없이 귀가가 늦어져 애탔을 때",
        expression: "“자기야, 폰이 꺼진 상황은 어쩔 수 없었겠지만 아무 기약 없이 새벽까지 연락이 닿지 않으니 혹시 큰일이라도 난 건 아닐까 걱정되고 많이 불안했어. 노는 건 괜찮으니, 다음엔 모임 이동할 때 가볍게 한마디만 먼저 톡 남겨주면 안심이 될 것 같아.”"
      }
    ]
  }
];

// 각 탭별 안내 가이드 설명문 DB
const TAB_GUIDE_DB = {
  home: {
    title: "🗺️ 성찰/처방 가이드",
    concept: "CBT 인지 행동 트레이닝 센터",
    desc: "일상 속에서 겪은 무의식적인 생각 오류(인지 왜곡)를 판독하고, 이를 정화하기 위한 구체적인 행동 임무를 수행하는 공간입니다.",
    howToUse: [
      "성찰 질문지를 읽고 O/X 카드에 솔직하게 응답합니다.",
      "발부된 [2단계 행동 임무] 가이드를 실천하고 수행 완료 체크합니다.",
      "매일 성찰 성공 시 연속 학습 불꽃(🔥)이 캘린더에 점화되며 원석이 Level-up 진화합니다."
    ]
  },
  chat: {
    title: "🗣️ 대화훈련 가이드",
    concept: "분기형 감정 조율 1분 시뮬레이터",
    desc: "대인관계 마찰 시 감정을 폭발(전치)하거나 회피하지 않고, 비폭력대화(NVC)와 나-전달법을 조화롭게 이끌어가는 실전 톡방 훈련입니다.",
    howToUse: [
      "준비된 갈등 시나리오를 선택하거나 내 실제 상황을 적어 AI방을 설계합니다.",
      "상대방의 격앙된 메세지에 가장 지혜로운 공감/단호한 경계 답변을 골라 전진합니다.",
      "훈련 성공 시 '소통 정합율' 수치가 오르며 이상-실제 자아 괴리가 좁혀져 통합됩니다."
    ]
  },
  analytics: {
    title: "📊 왜곡통계 가이드",
    concept: "무의식 인지 왜곡 성찰 대시보드",
    desc: "내 내면에 누적된 4대 생각 오류(개인화, 전치, 합리화, 파국화) 감지 횟수 분석과 소통 비책 카테고리를 한눈에 점검하는 나침반입니다.",
    howToUse: [
      "누적된 감지 바를 통해 내가 어떤 왜곡에 가장 취약한 상태인지 파악합니다.",
      "마음 맑음도 지수가 떨어지면 태풍 경보가 발생하니 주의를 기울이세요.",
      "하단의 [임상 쿠션어 사전]의 거절/사과/부탁 예시를 넘겨보며 고급 소통 문법을 학습합니다."
    ]
  },
  special_test: {
    title: "🧠 심리검사 가이드",
    concept: "정밀 기질(TCI) & 투사 미술(HTP) 진단실",
    desc: "생물학적 7대 기질 점수 분석 및 집-나무-사람(HTP) 스케치를 통한 무의식 비밀 욕구를 AI로 스캔 진단받는 전문 상담실입니다.",
    howToUse: [
      "TCI 검사 질문지에 답하여 나의 자율성(SD), 위험회피(HA) 등 7대 기질 백분위를 확인합니다.",
      "HTP 검사를 누르고 캔버스에 직접 그리거나 종이 스케치 사진을 업로드해 의뢰합니다.",
      "Gemini AI가 판독한 심층 무의식 분석 리포트(집, 나무, 사람) 결과를 확인합니다."
    ]
  },
  profile: {
    title: "📇 내명함 가이드",
    concept: "자아 통합 퍼스널 브랜딩 카드",
    desc: "그간의 성찰로 깎아진 내면의 원석 등급, 자아 일치율, 3대 소통 스탯을 조립하여 보여주는 나의 디지털 퍼스널 성격 카드입니다.",
    howToUse: [
      "CBT 미션과 대화 훈련의 결실로 가공된 최종 등급(💎 Lvl 3 등)을 응시합니다.",
      "자아 일치율과 3대 능력치 상태를 종합 점검합니다.",
      "최하단의 [SNS 자랑하기] 버튼을 누르고 복사된 자랑 카드를 타인에게 자랑해보세요.",
      "기기 변경 및 분실에 대비해 [내 자아 데이터 백업/복원] 기능을 활용하세요."
    ]
  }
};

// 🎨 다변수 로컬 HTP 미술 치료 판독 데이터베이스 (Gemini 제거 후 0원 청구 완벽 실현)
const LOCAL_HTP_ANALYSIS_DB = {
  house: [
    {
      condition: (drawCount, isIntrovert) => drawCount < 30 && isIntrovert,
      text: "선의 표현이 간결하고 단출한 집 그림입니다. 현재 자신의 심리적 울타리와 정서적 영역을 외부로부터 극도로 보호하려는 내향적 방어선이 구축되어 있습니다. 타인과 얽히기보다 혼자만의 동굴에서 충분히 기력을 충전하려는 욕구가 돋보이나, 때로는 가까운 이들에게 아주 가벼운 창문(수용)을 열어주는 O/X 성찰 처방을 실행하면 한결 편해집니다."
    },
    {
      condition: (drawCount, isIntrovert) => drawCount >= 30 && !isIntrovert,
      text: "디테일이 풍부하고 선의 역동성이 강한 집 그림입니다. 가정적 안전기반에 대한 높은 열망과 더불어 타인과 적극 소통하려는 관계 개방성이 풍부한 오라를 뿜고 있습니다. 관계주도성과 대인적 매력이 높게 자리 잡고 있으나, 가끔 주변 기대에 맞춰 지나치게 사교 에너지를 낭비하지 않는 균형감이 처방됩니다."
    },
    {
      condition: () => true, // default fallback
      text: "적절한 균형과 대칭적 형태가 돋보이는 안정된 구조의 집 그림입니다. 외부의 난처한 갈등에 직면해도 나만의 정서적 중심 공간(자아 경계)을 유연하게 수호할 준비가 되어 있습니다. O/X CBT 2단계 미션과 연계하여, 나만의 소박하지만 단단한 일상 루틴을 꾸준히 이끌어갈 때 자아 일치율이 한 단계 더 정교하게 연마될 것입니다."
    }
  ],
  tree: [
    {
      condition: (drawCount, isSelfBlame) => drawCount < 40 && isSelfBlame,
      text: "조금 조심스럽고 왜소한 가지를 지닌 나무 형태입니다. 당장 주변의 지적이나 작은 부정 피드백을 맞닥뜨렸을 때 '내가 실수했나' 하며 성급히 낙담하거나 자책하는 심리적 수축 상태가 관찰됩니다. 나무의 뿌리가 땅을 굳건히 딛듯, 내 본연의 가치는 외부 소리에 쉽게 흔들리지 않음을 2단계 행동 처방을 통해 연습하시길 권고합니다."
    },
    {
      condition: (drawCount, isSelfBlame) => drawCount >= 40 && !isSelfBlame,
      text: "잎사귀가 넓게 뻗고 기둥이 굳건하게 묘사된 늠름한 나무 그림입니다. 마음 깊은 곳에 회복탄력성 자원량과 성장을 향한 내재적 주체성이 대단히 탄탄히 자리 잡고 있습니다. 공적인 스트레스를 겪더라도 스스로 중심을 복원하고 타인의 성찰까지 조율해낼 수 있는 든든한 조율 카리스마 리더십의 원천이 돋보입니다."
    },
    {
      condition: () => true, // default fallback
      text: "기둥과 가지가 성숙한 비례를 갖춘 생동감 있는 나무 그림입니다. 이는 현재 삶에서 정신적/정서적 자원을 축적해 가고 있는 성장의 궤적을 명확히 증명합니다. 작은 잔가지의 흔들림에 연연하지 말고, 나만의 고유한 성향과 기질(TCI)을 자양분 삼아 3대 스탯을 꾸준히 키워나가는 일일 미션 수행이 훌륭한 촉매가 됩니다."
    }
  ],
  person: [
    {
      condition: (drawCount, isEmotionalN) => drawCount < 30 && isEmotionalN,
      text: "조금은 가녀리고 방어적인 선으로 외곽이 둘러싸인 사람 그림입니다. 대인관계 상황이나 갈등 국면에서 순간적으로 불안과 경직(감정기복)을 느끼며, 톡방 대화 훈련 시 상처받지 않기 위해 지레 회피 단절하려는 무의식적 위축 기전이 엿보입니다. 나-전달법과 쿠션어 사전을 이용해 안전하게 감정을 정화하는 훈련방 실습이 유익합니다."
    },
    {
      condition: (drawCount, isEmotionalN) => drawCount >= 30 && !isEmotionalN,
      text: "당당한 실루엣과 외향적 역동성이 함께 조화된 사람의 페르소나 그림입니다. 타인과의 경계 조율에 있어서 기꺼이 호감을 사고 카리스마를 개진할 준비가 된 유연한 상태입니다. 상대의 억압적인 피드백에도 방어 기제를 홧김에 폭발시키지 않고, 공감과 단호함의 밸런스를 성숙히 조율해내는 능력이 뛰어납니다."
    },
    {
      condition: () => true, // default fallback
      text: "사회의 일원으로서 건강하게 교류하고자 하는 자아 페르소나가 온화하게 투사된 사람 그림입니다. 실제 자아와 이상적인 자아 사이의 괴리를 줄이기 위해 노력하고 계시며, O/X 성찰 및 대화 시뮬레이션을 성실히 완수할수록 이 페르소나는 찬란히 빛나는 보석 명함 카드로 승화할 것입니다."
    }
  ]
};

export default function App() {
  const [hasCompletedInitialTest, setHasCompletedInitialTest] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // 📇 사용자 명함 정보 상태
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || '');
  const [userAge, setUserAge] = useState(() => localStorage.getItem('user_age') || '');
  const [userProfilePic, setUserProfilePic] = useState(() => localStorage.getItem('user_profile_pic') || '');

  // 🔑 구글 Gemini 개인 API Key 관리 상태
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKeyInput, setTempApiKeyInput] = useState('');

  // 🗺️ 각 탭별 최초 진입 시 도움말 설명창 노출 상태
  const [viewedGuides, setViewedGuides] = useState({
    home: false,
    chat: false,
    analytics: false,
    special_test: false,
    profile: false
  });

  // 초기 숏폼 진단 세부 상태
  const [diagStep, setDiagStep] = useState(0); 
  const [answersMap, setAnswersMap] = useState({
    q1: null, q2: null, q3: null, q4: null, q5: null, q6: null
  });
  const [showDiagBranch, setShowDiagBranch] = useState(false); 
  const [showFinalDiagResult, setShowFinalDiagResult] = useState(false); 

  // 핵심 서비스 스탯 명칭 전격 개편 (임상 소통 근육 매핑)
  const [streak, setStreak] = useState(5);
  const [energy, setEnergy] = useState(100);
  const [stats, setStats] = useState({ charm: 40, calm: 30, charisma: 25 });
  const [personaType, setPersonaType] = useState("탐색하는 여행자");

  // 🔥 듀오링고 연속 학습 캘린더 상태 탑재
  const [streakCalendar, setStreakCalendar] = useState([
    { day: '월', status: 'completed' },
    { day: '화', status: 'completed' },
    { day: '수', status: 'completed' },
    { day: '목', status: 'completed' },
    { day: '금', status: 'completed' },
    { day: '토', status: 'pending' },
    { day: '일', status: 'pending' }
  ]);
  const [streakFreezeCount, setStreakFreezeCount] = useState(1); 
  const [showStreakModal, setShowStreakModal] = useState(false);

  // 데일리 성찰 상태
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // 2단계 처방 임무
  const [activeMissions, setActiveMissions] = useState([]);
  const [missionUsageCount, setMissionUsageCount] = useState(0);

  // 융 & 로저스 자아일치
  const [realSelf, setRealSelf] = useState(35);
  const [idealSelf, setIdealSelf] = useState(85);

  // 알림 및 처벌/복구
  const [notification, setNotification] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [isStreakBroken, setIsStreakBroken] = useState(false);
  const [selectedTab, setSelectedTab] = useState("home");

  // 레벨업 축하 오버레이 모달
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [prevGemLevel, setPrevGemLevel] = useState("Lvl 1");

  // Clarity 인지 왜곡 로그 누적 통계
  const [anomalyLogs, setAnomalyLogs] = useState({
    personalization: 2,
    displacement: 1,
    rationalization: 3,
    overgeneralization: 1
  });

  // eQuoo 1분 대화 훈련 상태 확장 (분기형 멀티턴)
  const [chatScenarioActive, setChatScenarioActive] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOptions, setChatOptions] = useState([]);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [currentBranchPath, setCurrentBranchPath] = useState("start");

  // 대화훈련 카테고리 필터 및 직접 겪은 상황 입력 기능
  const [chatCategoryFilter, setChatCategoryFilter] = useState("all"); 
  const [customUserSituation, setCustomUserSituation] = useState("");
  const [customGenerating, setCustomGenerating] = useState(false);

  // 쿠션어 사전 활성화된 카테고리
  const [activeCushionCategory, setActiveCushionCategory] = useState("부탁");

  // TCI & HTP
  const [activeTest, setActiveTest] = useState(null); 
  const [tciStep, setTciStep] = useState(0); 
  const [tciScores, setTciScores] = useState({ NS: 0, HA: 0, RD: 0, PS: 0, SD: 0, CO: 0, ST: 0 });
  const [tciAnswersAcc, setTciAnswersAcc] = useState({ NS: 0, HA: 0, RD: 0, PS: 0, SD: 0, CO: 0, ST: 0 });

  // HTP 듀얼 입력 모드
  const [htpStep, setHtpStep] = useState('intro'); 
  const [htpInputMode, setHtpInputMode] = useState('draw'); 
  const [uploadedImages, setUploadedImages] = useState({ house: null, tree: null, person: null });
  const [uploadedBase64, setUploadedBase64] = useState({ house: null, tree: null, person: null });
  const [htpDrawnCounts, setHtpDrawnCounts] = useState({ house: 0, tree: 0, person: 0 });
  const [htpResultText, setHtpResultText] = useState({ house: '', tree: '', person: '' });
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 🧬 실시간 AI 알고리즘 스캔 상태 ( Attraction Effect )
  const [aiScanStatusText, setAiScanStatusText] = useState("");
  const [showScanAnimation, setShowScanAnimation] = useState(false);

  // 대화 훈련 스크롤 제어를 위한 Ref
  const chatEndRef = useRef(null);

  // 백업 파일 업로드용 숨겨진 Input Ref
  const fileInputRef = useRef(null);

  // 새 메세지가 추가되거나 선택지가 로드될 때 스크롤 최하단 자동 이동
  useEffect(() => {
    if (chatScenarioActive) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOptions, chatScenarioActive]);

  // HTP 사진 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImages(prev => ({
        ...prev,
        [htpStep]: event.target.result
      }));
      setUploadedBase64(prev => ({
        ...prev,
        [htpStep]: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // 초기 진단 질문 답변 선택 핸들러
  const handleDiagClick = (optValue) => {
    const currentKey = INITIAL_DIAGNOSIS_POOL[diagStep].key;
    const nextAnswers = {
      ...answersMap,
      [currentKey]: optValue
    };
    setAnswersMap(nextAnswers);

    if (diagStep === 2) {
      setShowDiagBranch(true);
    } else if (diagStep < INITIAL_DIAGNOSIS_POOL.length - 1) {
      setDiagStep(prev => prev + 1);
    } else {
      processFinalPersona(nextAnswers);
    }
  };

  // 결과 산출 및 캐릭터 매핑 ( 가상 연산 연출 추가 )
  const processFinalPersona = (latestAnswers) => {
    setShowScanAnimation(true);
    let scanMessages = [
      "초기 정서 패턴 식별 중...",
      "자아 경계선 강도 파악 중...",
      "인지 오류 취약 스키마 분류 중...",
      "자아 조율 알고리즘 매핑 중..."
    ];
    
    let i = 0;
    setAiScanStatusText(scanMessages[0]);
    const timer = setInterval(() => {
      i++;
      if (i < scanMessages.length) {
        setAiScanStatusText(scanMessages[i]);
      } else {
        clearInterval(timer);
        setShowScanAnimation(false);

        const isE = latestAnswers.q1 === 'E';
        const isSelfBlame = latestAnswers.q2 === 'self-blame';
        const isN = latestAnswers.q3 === 'N';

        let typeStr = "차분한 관계 조율 리더";
        if (isE && !isN) typeStr = "정서 개방형 소통 주체자";
        if (isE && isN) typeStr = "회복력 강한 대인관계 퍼실리테이터";
        if (!isE && isSelfBlame) typeStr = "내면 지향적 자아 통합가";
        if (!isE && !isSelfBlame) typeStr = "회복탄력적 내면 수호자";

        const answeredCount = Object.values(latestAnswers).filter(v => v !== null).length;
        if (answeredCount > 3) {
          typeStr += " (정밀 임상 대조)";
        }

        setPersonaType(typeStr);
        setShowDiagBranch(false);
        setShowFinalDiagResult(true);
      }
    }, 700);
  };

  // 메인 서비스 진입 ( 온보딩 모달 대신 탭 진입 가이드로 위임 )
  // 📚 탭 여정 가이드 닫기 및 로컬 기록 핸들러
  const handleCloseGuide = (tabKey) => {
    setViewedGuides(prev => {
      const updated = { ...prev, [tabKey]: true };
      localStorage.setItem('viewed_guide_' + tabKey, 'true');
      return updated;
    });
  };

  // 📚 각 탭 최초 진입 시 친절한 픽셀 다이어리 가이드 카드 렌더러
  const renderTabGuideCard = (tabKey) => {
    const guides = {
      home: {
        title: "🗺️ 1단계: 마음 성찰 & 처방",
        desc: "데일리 인지 교정 성찰 훈련소에 오신 것을 환영합니다! 1단계 스와이프 카드로 매일 생각의 왜곡 필터를 맑게 거르고, 2단계 처방 행동 임무를 실천하여 마음의 항상성을 수양합니다."
      },
      chat: {
        title: "🗣️ 2단계: 비폭력 대화 훈련",
        desc: "비폭력 대화 훈련소에 오신 것을 환영합니다! 타인과의 일상적인 마찰 상황(가족, 연인, 직장 등)에서 내 감정과 욕구를 건강하게 전달하는 임상적 소통 근육을 연마해 보세요."
      },
      special_test: {
        title: "🧠 3단계: 마음 기질 & 미술 진단",
        desc: "마음 기질 & 미술 진단소에 오신 것을 환영합니다! TCI 기질 검사 및 HTP 나무/집 스케치 테스트를 통해 내 무의식 속에 숨겨진 캐릭터 성향을 투사해 봅니다."
      },
      profile: {
        title: "📇 4단계: 나의 마음 신분증",
        desc: "나의 심리/정신 상태를 증명하는 최종 마음 신분증 탭입니다! 발급된 신분증 카드 위에 나만의 실물 사진을 업로드하고 간편하게 이미지로 캡처하여 소장할 수 있습니다."
      }
    };

    const targetGuide = guides[tabKey] || { title: "안내", desc: "여정에 오신 것을 환영합니다!" };

    return (
      <div className="p-6 bg-white/80 border border-[#f43f5e]/15 rounded-[32px] my-auto flex flex-col gap-4 text-center shadow-sm max-w-[290px] mx-auto animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-content-center text-rose-500 mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', margin: '0 auto' }}>
          ✨
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-800 font-sans">{targetGuide.title}</h3>
          <p className="text-[11.5px] text-gray-600 mt-2.5 leading-relaxed font-sans">
            {targetGuide.desc}
          </p>
        </div>
        <button 
          onClick={() => handleCloseGuide(tabKey)}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 font-sans mt-2"
        >
          여정 시작하기 ➔
        </button>
      </div>
    );
  };

  const enterMainService = () => {
    setShowFinalDiagResult(false);
    setHasCompletedInitialTest(true);

    setActiveMissions([{
      id: 99,
      text: "나만의 원석 아바타를 확인하고 자아 통합 가이드 살펴보기",
      desc: "간이 진단 데이터 연동 및 원석 가공 여정 활성화 완료",
      reward: { charm: 2, calm: 2, charisma: 2 }
    }]);
  };

  // 🔑 API Key 저장 및 초기화 핸들러
  const handleSaveApiKey = (key) => {
    const trimmed = key.trim();
    if (!trimmed) {
      setNotification({
        type: 'danger',
        title: '입력 오류',
        message: '유효한 API Key 문자열을 입력해 주세요.'
      });
      return;
    }
    localStorage.setItem('user_gemini_api_key', trimmed);
    setUserApiKey(trimmed);
    setShowApiKeyModal(false);
    setNotification({
      type: 'success',
      title: 'Gemini AI 활성화 🟢',
      message: '개인 API Key가 성공적으로 브라우저에 등록되어 진짜 AI 분석 모드가 활성화되었습니다!'
    });
  };

  // 📇 내명함 프로필 사진 업로드 처리 (Base64 변환)
  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setUserProfilePic(base64Data);
      localStorage.setItem('user_profile_pic', base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('user_gemini_api_key');
    setUserApiKey('');
    setTempApiKeyInput('');
    setNotification({
      type: 'warning',
      title: 'AI 비활성화 🟡',
      message: 'API Key가 삭제되어 즉시 안전한 로컬 지능형 판독 모드로 전환되었습니다.'
    });
  };

  // 🎨 HTP 캔버스에서 그린 그림을 Base64 형태로 획득
  const getCanvasBase64 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  // 🧬 실시간 구글 Gemini Vision API 호출 (Base64 전송)
  const fetchGeminiVisionAnalysis = async (base64Data, promptText) => {
    const apiKey = localStorage.getItem('user_gemini_api_key') || userApiKey;
    if (!apiKey) throw new Error("API Key가 존재하지 않습니다.");

    // Base64 헤더 부분(data:image/png;base64,) 파싱 제거
    const cleanBase64 = base64Data.split(',')[1] || base64Data;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: cleanBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || "Gemini API 호출 오류");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "분석 리포트를 획득하지 못했습니다.";
  };

  // 🧬 실시간 구글 Gemini 상황극 시나리오 생성 API 호출
  const fetchGeminiScenario = async (situation) => {
    const apiKey = localStorage.getItem('user_gemini_api_key') || userApiKey;
    if (!apiKey) throw new Error("API Key가 존재하지 않습니다.");

    const promptText = `
    사용자가 겪은 갈등 상황: "${situation}"
    이 상황을 바탕으로, 2회 핑퐁 대인관계 갈등 대화 훈련용 시나리오를 구성해 주세요.
    상대의 분노나 서운함을 수용한 뒤 단호하고 성숙하게 소통하는 훈련이어야 합니다.
    반드시 아래 JSON 포맷을 그대로 준수하여 순수 JSON 데이터만 출력하세요. 마크다운 따옴표(\`\`\`json)는 절대 붙이지 마세요.

    JSON 포맷 예시:
    {
      "title": "갈등 상황 제목",
      "botInitialMessage": "상대방이 나에게 건네는 첫마디 대사 (비난/서운함/공격성이 살짝 가미된 문장)",
      "options": [
        {
          "text": "💬 A: 현명하고 비폭력적으로 공감하며 인정하는 답변 대사",
          "desc": "[공감/수용] 상대방의 감정을 안심시켜 정서 방어를 해제함",
          "reply": "A 답변을 들었을 때 누그러지며 대화가 좋게 풀리는 상대방의 2차 대사",
          "score": {"charm": 5, "calm": 4, "charisma": 3}
        },
        {
          "text": "💬 B: 내 입장만 해명하거나 홧김에 방어/투사하는 미흡한 답변 대사",
          "desc": "[방어/반발] 적대감을 부추겨 감정의 소모를 심화함",
          "reply": "B 답변을 들었을 때 상대방이 욱하며 적대감을 분출하는 2차 대사",
          "score": {"charm": -4, "calm": -4, "charisma": 1}
        },
        {
          "text": "💬 C: 갈등을 대면하지 않고 회피하거나 단답으로 닫아버리는 답변 대사",
          "desc": "[단절/회피] 성의 없이 대화를 차단해 신뢰를 훼손함",
          "reply": "C 답변을 들었을 때 상대방이 냉담하게 대화를 종결하는 2차 대사",
          "score": {"charm": 1, "calm": 1, "charisma": -4}
        }
      ],
      "nextOptions": [
        {
          "text": "💬 A: 이어서 대화를 완결 지으며 실질적 대안을 제시하는 마무리 대사",
          "desc": "[대안 제시] 현명한 끝맺음",
          "reply": "최종적으로 고마워하며 원만하게 화해하는 상대의 종결 대사",
          "score": {"charm": 5, "calm": 5, "charisma": 5}
        },
        {
          "text": "💬 B: 너는 매번 그렇다며 상대를 지적하는 나쁜 마무리 대사",
          "desc": "[지적/비난] 대화 파국 유발",
          "reply": "결국 더 화내며 메신저를 차단하는 상대의 대사",
          "score": {"charm": -6, "calm": -5, "charisma": -2}
        },
        {
          "text": "💬 C: 네, 주의할게요. 하고 무미건조한 대사",
          "desc": "[건조한 매듭]",
          "reply": "대화를 서둘러 매듭짓는 상대의 대사",
          "score": {"charm": 0, "calm": 1, "charisma": -3}
        }
      ]
    }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ]
      })
    });

    if (!response.ok) throw new Error("Gemini API Error");
    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // JSON 파싱 (마크다운 백틱 정돈)
    const jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  };

  // 원석 비주얼
  const getGemstoneStatusInfo = () => {
    const ageNum = parseInt(userAge, 10) || 20;

    if (ageNum < 20) {
      return {
        name: "풋풋하게 피어나는 사파이어 원석",
        emoji: "💎",
        desc: "학업과 자아 정체성의 과도기 속에서, 맑고 투명한 지혜를 가꿔나가는 10대 자아입니다.",
        level: "기수 Lvl 1",
        colorClass: "from-blue-400 to-cyan-500",
        auraStyle: "conic-gradient(from 0deg, #60a5fa, #06b6d4, #3b82f6)",
        auraSpeed: "3s"
      };
    } else if (ageNum >= 20 && ageNum < 30) {
      return {
        name: "열정으로 반짝이는 로즈쿼츠 원석",
        emoji: "💖",
        desc: "사랑과 자립의 파도 속에서, 나다움을 열정적으로 연마해가는 찬란한 20대 자아입니다.",
        level: "청춘 Lvl 2",
        colorClass: "from-rose-400 to-pink-500",
        auraStyle: "conic-gradient(from 0deg, #fb7185, #ec4899, #f43f5e)",
        auraSpeed: "2.5s"
      };
    } else if (ageNum >= 30 && ageNum < 40) {
      return {
        name: "우아하게 정제된 아메시스트 원석",
        emoji: "🔮",
        desc: "사회적 성숙과 내면 안정을 조화롭게 꽃피워가는 깊이 있고 당당한 30대 자아입니다.",
        level: "연마 Lvl 3",
        colorClass: "from-purple-500 to-indigo-600",
        auraStyle: "conic-gradient(from 0deg, #8b5cf6, #3b82f6, #a78bfa)",
        auraSpeed: "6s"
      };
    } else {
      return {
        name: "단단한 포용의 에메랄드 원석",
        emoji: "💚",
        desc: "삶의 무수한 계절을 지나 흔들림 없는 단단함과 포용력으로 빛나는 내면 안착 자아입니다.",
        level: "안착 Lvl 4",
        colorClass: "from-emerald-400 to-teal-500",
        auraStyle: "conic-gradient(from 0deg, #10b981, #14b8a6, #059669)",
        auraSpeed: "8s"
      };
    }
  };

    const gemstone = getGemstoneStatusInfo();
  const selfGap = Math.abs(idealSelf - realSelf);

  // 원석 레벨 감시 및 레벨업 오버레이 기동
  useEffect(() => {
    if (gemstone.level !== prevGemLevel) {
      setPrevGemLevel(gemstone.level);
      if ((prevGemLevel === "Lvl 1" && gemstone.level === "Lvl 2") || 
          (prevGemLevel === "Lvl 2" && gemstone.level === "Lvl 3")) {
        setShowLevelUpModal(true);
      }
    }
  }, [gemstone.level]);

  // 성찰 카드 답변 처리 및 왜곡 통계 실시간 연동
  const handleSwipe = (answer) => {
    setUserAnswer(answer);
    setShowFeedback(true);

    const selectedQuestion = REFLECTION_POOL[currentIdx];
    const prescription = selectedQuestion.prescriptions[answer];

    if (answer === 'yes') {
      const typeKey = selectedQuestion.concept.includes("개인화") ? 'personalization' :
                      selectedQuestion.concept.includes("전치") ? 'displacement' :
                      selectedQuestion.concept.includes("합리화") ? 'rationalization' : 'overgeneralization';
      
      setAnomalyLogs(prev => ({
        ...prev,
        [typeKey]: prev[typeKey] + 1
      }));
    } else {
      const typeKey = selectedQuestion.concept.includes("개인화") ? 'personalization' :
                      selectedQuestion.concept.includes("전치") ? 'displacement' :
                      selectedQuestion.concept.includes("합리화") ? 'rationalization' : 'overgeneralization';
      setAnomalyLogs(prev => ({
        ...prev,
        [typeKey]: Math.max(0, prev[typeKey] - 1)
      }));
    }

    const newMission = {
      id: Date.now(),
      originConcept: selectedQuestion.concept,
      originAnswer: answer,
      text: prescription.text,
      desc: prescription.desc,
      reward: prescription.reward,
      completed: false
    };

    setActiveMissions([newMission]);
    setMissionUsageCount(prev => prev + 1);
  };

  const handleNextReflection = () => {
    setShowFeedback(false);
    setUserAnswer(null);
    setCurrentIdx(prev => (prev + 1) % REFLECTION_POOL.length);
  };

  // 2단계 미션 체크 및 점수 가산 + 듀오링고 Streak 스탬프 찍기
  const handleMissionToggle = (id) => {
    setActiveMissions(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.completed;
        if (nextState) {
          setStats(s => ({
            charm: Math.min(100, s.charm + m.reward.charm),
            calm: Math.min(100, s.calm + m.reward.calm),
            charisma: Math.min(100, s.charisma + m.reward.charisma)
          }));
          setEnergy(e => Math.max(0, e - 25));

          setStreakCalendar(cal => cal.map(c => {
            if (c.day === '토') {
              return { ...c, status: 'completed' };
            }
            return c;
          }));
          setStreak(6); 
          
          setNotification({
            type: 'success',
            title: '오늘의 소통 불꽃 획득! 🔥',
            message: '행동 미션 성공으로 토요일 연속 학습 스탬프가 찍혔습니다. 6일 연속 달성!'
          });
        } else {
          setStats(s => ({
            charm: Math.max(0, s.charm - m.reward.charm),
            calm: Math.max(0, s.calm - m.reward.calm),
            charisma: Math.max(0, s.charisma - m.reward.charisma)
          }));
          setEnergy(e => Math.min(100, e + 25));

          setStreakCalendar(cal => cal.map(c => {
            if (c.day === '토') {
              return { ...c, status: 'pending' };
            }
            return c;
          }));
          setStreak(5);
        }
        return { ...m, completed: nextState };
      }
      return m;
    }));
  };

  // HTP 드로잉 (터치 튐 & 스크롤 방지 패치 완료)
  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault(); 
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault(); 
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    const currentType = htpStep;
    if (currentType === 'house' || currentType === 'tree' || currentType === 'person') {
      setHtpDrawnCounts(prev => ({
        ...prev,
        [currentType]: prev[currentType] + 1
      }));
    }
  };

  const stopDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 🎨 돈 나가지 않는 초효율 다변수 로컬 판독기 (구글 API 전면 배제 및 100% 무료 오프라인화)
  const processLocalHtpAnalysis = (stepName) => {
    const isIntrovert = answersMap.q1 === 'I';
    const isSelfBlame = answersMap.q2 === 'self-blame';
    const isEmotionalN = answersMap.q3 === 'N';
    const currentDrawCount = htpDrawnCounts[stepName] || 25;

    // 해당 분석 데이터베이스에서 가장 부합하는 조건의 분석문 탐색 및 바인딩
    const pool = LOCAL_HTP_ANALYSIS_DB[stepName];
    const match = pool.find(item => item.condition(currentDrawCount, stepName === 'house' ? isIntrovert : stepName === 'tree' ? isSelfBlame : isEmotionalN));
    
    return match ? match.text : pool[pool.length - 1].text;
  };

  // HTP 단계 진행 (하이브리드 AI 비동기 엔진)
  const proceedHtp = async () => {
    const currentStep = htpStep;
    
    // 현재 그림의 이미지 데이터 추출 (그리기 모드면 캔버스에서, 업로드 모드면 업로드 데이터에서)
    let base64Data = null;
    if (htpInputMode === 'draw') {
      base64Data = getCanvasBase64();
    } else {
      base64Data = uploadedBase64[currentStep];
    }

    // 캔버스 초기화
    if (htpInputMode === 'draw') {
      clearCanvas();
    }

    const apiKey = localStorage.getItem('user_gemini_api_key') || userApiKey;

    if (currentStep === 'house') {
      // 로딩 및 AI 스캔 개시
      setShowScanAnimation(true);
      setAiScanStatusText("Gemini가 무의식 속 '집'의 상징성을 디코딩 중...");
      
      let resText = "";
      if (apiKey && base64Data) {
        try {
          const prompt = "사용자가 그린 집(House) 투사화입니다. 내재된 가정환경에 대한 인식, 가족과의 유대감, 외부와의 소통 의지 및 자아 보호막 강도를 분석하여 미술 심리치료사처럼 따뜻하고 통찰력 넘치게 4줄 내외로 자세히 해석해주세요. 서론이나 번호 매김 없이 친근한 평문으로 답변하세요.";
          resText = await fetchGeminiVisionAnalysis(base64Data, prompt);
        } catch (err) {
          console.warn("Gemini API Error, falling back to local analysis:", err);
          resText = processLocalHtpAnalysis('house') + " (API 통신 일시 지연으로 인한 로컬 지능형 판독)";
        }
      } else {
        resText = processLocalHtpAnalysis('house');
      }

      setHtpResultText(prev => ({ ...prev, house: resText }));
      setShowScanAnimation(false);
      setHtpStep('tree');

    } else if (currentStep === 'tree') {
      setShowScanAnimation(true);
      setAiScanStatusText("Gemini가 자아 강도와 '나무'의 역동성을 스캔 중...");

      let resText = "";
      if (apiKey && base64Data) {
        try {
          const prompt = "사용자가 그린 나무(Tree) 투사화입니다. 나무의 기둥(자아 강도), 가지(성장 동기 및 대외 상호작용), 뿌리(정서 안정도)를 바탕으로 내면의 잠재 성장력과 회복탄력성을 미술 치료 관점에서 4줄 내외로 깊이 있게 해석해주세요. 서론 없이 즉시 평문으로 기술하세요.";
          resText = await fetchGeminiVisionAnalysis(base64Data, prompt);
        } catch (err) {
          console.warn("Gemini API Error, falling back to local analysis:", err);
          resText = processLocalHtpAnalysis('tree') + " (API 통신 일시 지연으로 인한 로컬 지능형 판독)";
        }
      } else {
        resText = processLocalHtpAnalysis('tree');
      }

      setHtpResultText(prev => ({ ...prev, tree: resText }));
      setShowScanAnimation(false);
      setHtpStep('person');

    } else if (currentStep === 'person') {
      setShowScanAnimation(true);
      setAiScanStatusText("Gemini가 사회적 페르소나 '사람' 형태를 해독 중...");

      let resText = "";
      if (apiKey && base64Data) {
        try {
          const prompt = "사용자가 그린 사람(Person) 투사화입니다. 인물화의 묘사 비례, 방어 장벽, 형태적 역동성을 바탕으로 대인관계 속 자기상(Self-image)과 페르소나의 유연도를 임상 심리학 관점에서 분석해 주세요. 4줄 내외로 부드러운 평문으로 서술해주세요.";
          resText = await fetchGeminiVisionAnalysis(base64Data, prompt);
        } catch (err) {
          console.warn("Gemini API Error, falling back to local analysis:", err);
          resText = processLocalHtpAnalysis('person') + " (API 통신 일시 지연으로 인한 로컬 지능형 판독)";
        }
      } else {
        resText = processLocalHtpAnalysis('person');
      }

      setHtpResultText(prev => ({ ...prev, person: resText }));
      
      // 마지막 연동 스캔 연출
      setAiScanStatusText("마음 힐링 종합 처방전 매트릭스 조립 중...");
      setTimeout(() => {
        setShowScanAnimation(false);
        setHtpStep('result');
        setStats(s => ({
          ...s,
          calm: Math.min(100, s.calm + 6), 
          charisma: Math.min(100, s.charisma + 5)
        }));
      }, 1500);
    }
  };

  // TCI 문항 체크
  const handleTciAnswer = (score) => {
    const currentQ = TCI_QUESTIONS[tciStep];
    const dim = currentQ.dimension;

    const newAcc = {
      ...tciAnswersAcc,
      [dim]: tciAnswersAcc[dim] + score
    };
    setTciAnswersAcc(newAcc);

    if (tciStep < TCI_QUESTIONS.length - 1) {
      setTciStep(prev => prev + 1);
    } else {
      // 🧬 TCI 분석 스캔 연출
      setTciStep(99); 
      setAiScanStatusText("TCI 4대 생득적 기질 벡터 연산 중...");
      
      let tciMsgs = [
        "자극 추구 및 위험 회피 경향성 분리 중...",
        "사회적 민감성 및 자기 지향성 점수 표준화 중...",
        "성격적 자율성(SD) 격차 연산 중...",
        "TCI 7대 매트릭스 종합 보고서 합성 완료!"
      ];
      
      let i = 0;
      const timer = setInterval(() => {
        if (i < tciMsgs.length) {
          setAiScanStatusText(tciMsgs[i]);
          i++;
        }
      }, 650);

      setTimeout(() => {
        clearInterval(timer);
        setTciScores({
          NS: Math.round((newAcc.NS / 10) * 100),
          HA: Math.round((newAcc.HA / 10) * 100),
          RD: Math.round((newAcc.RD / 10) * 100),
          PS: Math.round((newAcc.PS / 10) * 100),
          SD: Math.round((newAcc.SD / 10) * 100),
          CO: Math.round((newAcc.CO / 10) * 100),
          ST: Math.round((newAcc.ST / 10) * 100)
        });
        setTciStep(14); 
        setStats(s => ({
          charm: Math.min(100, s.charm + 3), 
          calm: Math.min(100, s.calm + 3),
          charisma: Math.min(100, s.charisma + 2)
        }));
      }, 3000);
    }
  };

  // TCI 기반 스트레스 트리거 및 잠재 병리 계산
  const getTciStressAndPathology = () => {
    const stressTriggers = [];
    const pathologies = [];

    if (tciScores.NS >= 60) {
      stressTriggers.push("지루하고 변화 없는 단순 반복 업무, 혹은 지나치게 경직된 위계질서 및 규율에 갇혀 있을 때 극심한 스트레스를 겪습니다.");
    }
    if (tciScores.HA >= 60) {
      stressTriggers.push("사전에 준비되지 않은 급작스러운 환경 변화, 혹은 타인의 싸늘하고 부정적인 피드백이나 지적을 맞닥뜨렸을 때 급격한 불안과 마비를 느낍니다.");
    }
    if (tciScores.RD >= 60) {
      stressTriggers.push("주변 집단 내에서 은연중에 소외감을 느끼거나, 나의 순수한 호의와 애정에 대해 상대방이 무덤덤하거나 회피적인 태도를 보일 때 거절 민감성 스트레스가 발생합니다.");
    }
    if (tciScores.SD < 50) {
      stressTriggers.push("스스로 상황을 통제하지 못하고 타인에게 수동적으로 끌려가야 하거나 주도권이 박탈되었을 때 극심한 무기력을 경험합니다.");
    }
    if (stressTriggers.length === 0) {
      stressTriggers.push("내적 평온성이 강해 평소 극심한 자극적 스트레스를 잘 받지 않지만, 장기적 고립 상황에 처하면 정서가 다소 수축할 수 있습니다.");
    }

    if (tciScores.HA >= 60 && tciScores.SD < 55) {
      pathologies.push({
        title: "불안장애 및 범우울증 위험군",
        desc: "위험을 강하게 회피하려는 기질(HA)에 비해 이를 심리적으로 완충하고 이끌어갈 성격적 자율성(SD)이 부족할 경우, 스트레스 직면 시 지나친 자책과 감정적 파국화에 빠져 우울 장애나 만성 불안, 혹은 강박 관념으로 전개될 수 있습니다."
      });
    }
    if (tciScores.NS >= 60 && tciScores.PS < 50) {
      pathologies.push({
        title: "충동 제어 곤란 및 주의산만(ADHD) 위험군",
        desc: "도파민적 자극 추구 성향(NS)에 비해 이를 인내하고 억제해줄 끈기(PS)와 자기조절력(SD)이 낮을 때, 즉각적인 흥미 위주의 스마트폰 중독, 쇼핑 중독 등 행동주의적 중독 증상이나 주의집중 곤란(ADHD 성향)에 취약해질 수 있습니다."
      });
    }
    if (tciScores.RD >= 60 && tciScores.SD < 55) {
      pathologies.push({
        title: "거절 민감성 및 의존성 성향군",
        desc: "타인의 피드백에 극도로 민감한 기질(RD)을 내면의 단단한 자율적 주체성(SD)이 받쳐주지 못할 때, 버림받는 것에 대한 극심한 공포(거절 민감성)와 타인의 의견에 과도하게 의존하는 역기능적 의존적 관계 양상이 생길 수 있습니다."
      });
    }
    if (tciScores.SD >= 60 && tciScores.CO >= 60) {
      pathologies.push({
        title: "강건한 심리적 회복탄력성군",
        desc: "자율성과 연대감이 모두 탄탄하여 기질적 취약점(NS, HA 등)이 발생하더라도 스스로 단단하게 마음을 고쳐먹고 해결해나가는 강인한 심리적 보호장벽을 지닌 상태입니다."
      });
    }
    if (pathologies.length === 0) {
      pathologies.push({
        title: "경계형 불안 취약 상태",
        desc: "전반적으로 기질적 극단성은 관찰되지 않으나, 피로 누적이나 체력 방전 시 외부 자극을 회피하고 고립되려는 성향이 나타날 수 있으니 일일 미션으로 신체적 활력을 도모해야 합니다."
      });
    }

    return { stressTriggers, pathologies };
  };

  // eQuoo 대화 훈련 진입
  const startChatScenario = (scenarioId) => {
    const sc = CHAT_SCENARIOS.find(s => s.id === scenarioId);
    if (!sc) return;

    setSelectedScenario(sc);
    setChatScenarioActive(true);
    setChatCompleted(false);
    setCurrentTurn(1);
    setCurrentBranchPath("start");
    
    setChatMessages([
      {
        id: Date.now(),
        sender: sc.characterSender,
        text: sc.botInitialMessage,
        time: "오후 2:15"
      }
    ]);
    
    if (sc.maxTurns === 1) {
      setChatOptions(sc.options);
    } else {
      setChatOptions(sc.branches["start"]);
    }
  };

  // eQuoo 분기형 대화 선택 및 로저스 자아일치도(Ideal-Real) 연동 이식 완료
  const handleChatOptionSelect = (opt) => {
    if (!selectedScenario) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: opt.text.replace("💬 A: ", "").replace("💬 B: ", "").replace("💬 C: ", ""),
      time: "오후 2:16"
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatOptions([]);

    setTimeout(() => {
      const systemReply = {
        id: Date.now() + 1,
        sender: selectedScenario.characterSender,
        text: opt.reply,
        time: "오후 2:16"
      };
      setChatMessages(prev => [...prev, systemReply]);
      
      setStats(s => ({
        charm: Math.max(0, Math.min(100, s.charm + opt.score.charm)),
        calm: Math.max(0, Math.min(100, s.calm + opt.score.calm)),
        charisma: Math.max(0, Math.min(100, s.charisma + opt.score.charisma))
      }));

      const nextBranch = opt.nextBranch;
      const nextTurn = currentTurn + 1;

      if (nextBranch === "end" || nextBranch === "end_fail" || nextTurn > selectedScenario.maxTurns) {
        setChatCompleted(true);
        
        // 🗣️ 로저스 자아일치 실시간 정적 연동 피드백 반영
        if (nextBranch === "end" || nextBranch.includes("success")) {
          setRealSelf(prev => Math.min(idealSelf, prev + 4));
          setNotification({
            type: 'success',
            title: '소통 합일화 달성',
            message: '성숙한 조율 대화에 성공하여 내면의 자아 괴리 격차가 4% 좁혀졌습니다! 🌤️'
          });
        } else if (nextBranch.includes("fail")) {
          setRealSelf(prev => Math.max(10, prev - 6));
          setNotification({
            type: 'danger',
            title: '자아 방어벽 약화',
            message: '갈등 파국 대화로 인해 내면의 자아 일치도가 6% 하락하며 괴리가 벌어졌습니다. 🌧️'
          });
        }
      } else {
        setCurrentTurn(nextTurn);
        setCurrentBranchPath(nextBranch);
        setChatOptions(selectedScenario.branches[nextBranch]);
      }
    }, 1000);
  };

  // 실시간 상황 조립기 (하이브리드 AI 비동기 모듈)
  const handleCreateCustomScenario = async () => {
    if (!customUserSituation.trim()) return;
    setCustomGenerating(true);

    const apiKey = localStorage.getItem('user_gemini_api_key') || userApiKey;
    if (apiKey) {
      try {
        const scenarioData = await fetchGeminiScenario(customUserSituation);
        
        // 받아온 데이터를 바탕으로 eQuoo 훈련 시나리오 바인딩!
        const customSc = {
          id: "custom_gemini_live",
          category: "custom",
          categoryLabel: "🧬 AI 실시간 설계",
          title: scenarioData.title || "맞춤 AI 소통 훈련",
          desc: `"${customUserSituation}"에 대한 인공지능 분석 시나리오`,
          intro: `[실시간 AI 시나리오] "${customUserSituation}"`,
          characterName: "상대방",
          characterSender: "colleague",
          maxTurns: 2,
          botInitialMessage: scenarioData.botInitialMessage,
          options: scenarioData.options,
          branches: {
            "start": scenarioData.options.map((opt, idx) => {
              const keys = ["path_A", "path_B", "path_C"];
              return {
                ...opt,
                nextBranch: keys[idx]
              };
            }),
            "path_A": [
              {
                text: scenarioData.nextOptions[0].text,
                desc: scenarioData.nextOptions[0].desc,
                reply: scenarioData.nextOptions[0].reply,
                nextBranch: "end",
                score: scenarioData.nextOptions[0].score
              },
              {
                text: scenarioData.nextOptions[1].text,
                desc: scenarioData.nextOptions[1].desc,
                reply: scenarioData.nextOptions[1].reply,
                nextBranch: "end_fail",
                score: scenarioData.nextOptions[1].score
              },
              {
                text: scenarioData.nextOptions[2].text,
                desc: scenarioData.nextOptions[2].desc,
                reply: scenarioData.nextOptions[2].reply,
                nextBranch: "end",
                score: scenarioData.nextOptions[2].score
              }
            ],
            "path_B": [
              {
                text: "💬 A: 죄송합니다. 제가 너무 욱해서 상대방 입장은 생각 못 하고 변명부터 늘어놓았네요. 정중하지 못한 대처였습니다.",
                desc: "[성찰 사과] 방어 무너짐 인정",
                reply: "음.. 이제라도 그렇게 말씀해 주시니 다행이네요. 앞으로는 대화로 잘 풀어요.",
                nextBranch: "end",
                score: { charm: 5, calm: 5, charisma: 3 }
              },
              {
                text: "💬 B: 끝까지 제가 틀린 건 아닙니다. 남의 실수만 부풀려서 사람 모욕하지 마세요.",
                desc: "[극단 대립]",
                reply: "더는 말 섞기 피곤하네요. 차단하겠습니다.",
                nextBranch: "end_fail",
                score: { charm: -7, calm: -6, charisma: -2 }
              }
            ],
            "path_C": [
              {
                text: "💬 A: 회피하려고만 해서 죄송해요. 대화를 끊지 않고, 지훈 씨가 만족할 해결 방법을 같이 찾아볼게요.",
                desc: "[조율 회복]",
                reply: "피하지 않고 답해줘서 고맙습니다. 같이 맞춰 가봐요.",
                nextBranch: "end",
                score: { charm: 4, calm: 4, charisma: 4 }
              },
              {
                text: "💬 B: 바빠서 끊겠습니다. 나중에 해요.",
                desc: "[2차 회피]",
                reply: "평생 그렇게 회피하면서 사세요. 차단합니다.",
                nextBranch: "end_fail",
                score: { charm: -5, calm: -5, charisma: -5 }
              }
            ]
          }
        };

        setSelectedScenario(customSc);
        setChatScenarioActive(true);
        setChatCompleted(false);
        setCurrentTurn(1);
        setChatMessages([
          {
            id: Date.now(),
            sender: customSc.characterSender,
            text: customSc.botInitialMessage,
            time: "오후 4:00"
          }
        ]);
        setChatOptions(customSc.branches["start"]);
        setCustomGenerating(false);
        setCustomUserSituation("");
        
        setNotification({
          type: 'success',
          title: 'AI 시나리오 생성 완료! 🧬',
          message: `입력 상황에 딱 맞는 실시간 갈등 시뮬레이션 방이 조립 완료되었습니다.`
        });
        return;

      } catch (err) {
        console.warn("AI Custom Generator fail, fall back to mock scenario:", err);
        triggerMockCustomScenario();
      }
    } else {
      triggerMockCustomScenario();
    }

    setCustomGenerating(false);
    setCustomUserSituation("");
  };

  const triggerMockCustomScenario = () => {
    const targetTurns = Math.floor(Math.random() * 2) + 2; // 2~3회
    
    // 사용자가 입력한 텍스트에서 키워드를 파싱하여 상황극 맞춤 제목 도출
    let titleStr = "일상 갈등 대화 트레이닝";
    let botMsg = "아니, 어제 연락 준다 해놓고 왜 아무런 말도 없이 약속 쌩까신 거예요? 사람 바보 만드는 것도 아니고 정말 너무하시네요.";
    
    if (customUserSituation.includes("거절") || customUserSituation.includes("부탁")) {
      titleStr = "정중한 거절 소통";
      botMsg = "이번 주말에 우리 팀 대타 좀 뛰어주면 안 돼요? 지훈 씨 일정도 없다고 들었는데 그냥 이번 한 번만 도와줘요!";
    } else if (customUserSituation.includes("회사") || customUserSituation.includes("직장") || customUserSituation.includes("업무")) {
      titleStr = "업무 경계선 조율";
      botMsg = "아니, 대리님! 기획안 자료 피드백을 이런 식으로 주시면 전 야근하라는 소리밖에 안 되잖아요. 사전에 가이드라인을 주셨어야죠!";
    } else if (customUserSituation.includes("부모") || customUserSituation.includes("가족") || customUserSituation.includes("엄마") || customUserSituation.includes("아빠")) {
      titleStr = "가족과의 경계 조율";
      botMsg = "너는 다 늙어서 아직도 그렇게 철없이 구니? 내 말 안 들을 거면 나가서 네 맘대로 살아라 정말 왜 이렇게 속을 썩여!";
    }

    const mockSc = {
      id: "custom_mock",
      category: "custom",
      categoryLabel: "✍️ 맞춤 훈련",
      title: titleStr,
      desc: "내 입력 상황에 대응하는 단호함과 정서 수용의 로컬 상황극입니다.",
      intro: `[입력 상황] "${customUserSituation}" 에 대응되는 조율 훈련소입니다.`,
      characterName: "상대방",
      characterSender: "colleague",
      maxTurns: targetTurns,
      botInitialMessage: botMsg,
      options: [
        {
          text: "💬 A: 화가 나거나 당황하셨을 법한 상황이 충분히 이해가 가네요. 제가 사전에 더 신경 써서 피드백/노티를 드리지 못한 부분은 제 실수였습니다. 미안해요.",
          desc: "[쿠션어 / 실인정] 상대방의 감정 울림을 먼저 안심시켜 정서 방어를 해제함",
          reply: "음.. 그렇게 먼저 알아봐주고 정중히 대답해주시니 화가 좀 누그러지네요. 다음부터는 조금 더 일찍 알려주시면 감사하겠습니다.",
          score: { charm: 5, calm: 4, charisma: 3 }
        },
        {
          text: "💬 B: 아니 저도 오늘 개인적으로 너무 급하고 머리 아픈 일이 터져서 어쩔 수 없었어요. 일방적으로 저만 비난하시는 건 너무 억울합니다.",
          desc: "[합리화 / 반발 적대] 내 입장을 변호하느라 상대 감정을 더 돋우는 인지 왜곡",
          reply: "사정이 있으면 연락이라도 한 통 남겼어야 하는 거 아녜요? 본인 힘든 것만 일이고 남 기다리는 시간은 우스운가요? 진짜 불쾌하네요.",
          score: { charm: -4, calm: -4, charisma: -1 }
        },
        {
          text: "💬 C: 아, 네.. 죄송합니다. 정신이 없었나 봐요. 다음에 다시 얘기하시죠.",
          desc: "[단답형 단절] 갈등을 대면하지 않고 서둘러 문을 닫아버리는 회피형 소통",
          reply: "대화하기가 싫으신 거네요. 매번 이런 식으로 얼버무리시니 더 깊이 대화할 가치가 없는 것 같습니다. 실망입니다.",
          score: { charm: 1, calm: 1, charisma: -4 }
        }
      ],
      branches: {
        "start": [
          {
            text: "💬 A: 속상하게 해드린 점 사과드려요. 말씀하신 의견을 바탕으로 제가 도울 수 있는 복구 조치에 대해 함께 논의해보면 좋겠습니다. 5분 정도 통화가 가능할까요?",
            desc: "[해결책 지향] 정중함과 대안을 함께 결합",
            reply: "아.. 네. 이따 퇴근 시간 20분 전에 가볍게 이야기 나눠봐요. 조치해주신다니 다행입니다.",
            nextBranch: "end",
            score: { charm: 4, calm: 5, charisma: 5 }
          },
          {
            text: "💬 B: 그렇게 다짜고짜 화부터 내시면 대화가 안 됩니다. 감정을 좀 가라앉히고 말씀하세요.",
            desc: "[상황 통제형 비난] 상대의 기분을 가르치려 듦",
            reply: "제 감정 탓을 하시는 건가요? 적반하장이 따로 없네요. 그냥 부장님께 이 상황 공유하겠습니다.",
            nextBranch: "end_fail",
            score: { charm: -6, calm: -5, charisma: -2 }
          },
          {
            text: "💬 C: 네, 다음부턴 주의하겠습니다.",
            desc: "[의무적 사과 매듭]",
            reply: "네. 그러길 바랍니다.",
            nextBranch: "end",
            score: { charm: 0, calm: 1, charisma: -3 }
          }
        ]
      }
    };

    setSelectedScenario(mockSc);
    setChatScenarioActive(true);
    setChatCompleted(false);
    setCurrentTurn(1);
    setChatMessages([
      {
        id: Date.now(),
        sender: mockSc.characterSender,
        text: mockSc.botInitialMessage,
        time: "오후 3:30"
      }
    ]);
    setChatOptions(mockSc.options);
  };

  // 🔥 듀오링고형 연속 학습 초기화 경보
  const triggerFailureDemo = () => {
    if (streakFreezeCount > 0) {
      setStreakFreezeCount(prev => prev - 1);
      setNotification({
        type: 'warning',
        title: 'Streak Freeze 보호막 작동! ❄️',
        message: '무료 1회 제공된 Streak Freeze가 소비되어 연속 5일 학습 불꽃을 방어해냈습니다!'
      });
      return;
    }

    setIsStreakBroken(true);
    setStreak(0);
    setStreakCalendar(cal => cal.map(c => ({ ...c, status: c.day === '토' || c.day === '일' ? 'pending' : 'broken' })));

    setShowStreakModal(true); 
  };

  // 회복 퀴즈 정답 제출 시 불꽃 복구
  const handleQuizSubmit = (answer) => {
    setQuizAnswer(answer);
    if (answer === 'shadow') {
      setStreak(5);
      setIsStreakBroken(false);
      setStreakCalendar([
        { day: '월', status: 'completed' },
        { day: '화', status: 'completed' },
        { day: '수', status: 'completed' },
        { day: '목', status: 'completed' },
        { day: '금', status: 'completed' },
        { day: '토', status: 'pending' },
        { day: '일', status: 'pending' }
      ]);
      setNotification({
        type: 'success',
        title: 'Streak 복구 완료!',
        message: '그림자 융 심리학 퀴즈 정답! 5일 연속 학습 불꽃이 되살아났습니다! 🔥'
      });
    } else {
      setNotification({
        type: 'danger',
        title: '오답입니다',
        message: '내면의 숨겨진 부정적 자아는 융이 무어라 불렀는지 다시 맞춰보세요.'
      });
    }
    setTimeout(() => {
      setShowQuiz(false);
      setQuizAnswer(null);
      setShowStreakModal(false);
    }, 2000);
  };

  // 마음 맑음도 지수 연산
  const getMindClarityScore = () => {
    const totalDistortion = anomalyLogs.personalization + anomalyLogs.displacement + anomalyLogs.rationalization + anomalyLogs.overgeneralization;
    const baseScore = 100 - (totalDistortion * 8);
    const finalScore = Math.max(0, Math.min(100, baseScore));
    
    let weather = "☀️ 매우 맑음";
    let desc = "평온하고 맑은 이성적 자아가 유지되고 있습니다. 마음 필터가 건강하게 작동 중입니다.";
    let colorClass = "text-emerald-700";
    
    if (finalScore < 90 && finalScore >= 70) {
      weather = "⛅ 조금 흐림";
      desc = "인지 필터가 약간 둔화되었습니다. 성찰 카드를 통해 그림자를 품어주세요.";
      colorClass = "text-yellow-400";
    } else if (finalScore < 70 && finalScore >= 50) {
      weather = "🌧️ 소나기";
      desc = "전치 또는 개인화 왜곡 징후가 보입니다. 2단계 쿠션어 행동 처방을 적극 권장합니다.";
      colorClass = "text-orange-400";
    } else if (finalScore < 50) {
      weather = "⚡ 태풍 경보";
      desc = "무의식적 방어기제가 과열된 위험 상태입니다. 쿠션어 사전에서 알맞은 소통법을 학습해 보세요.";
      colorClass = "text-rose-500 font-extrabold";
    }
    
    return { score: finalScore, weather, desc, colorClass };
  };

  const mindClarity = getMindClarityScore();

  // 가장 위험한 왜곡 탐지 배너
  const getDominantDistortion = () => {
    const arr = [
      { key: "personalization", label: "개인화 (Personalization)", val: anomalyLogs.personalization, warningMsg: "타인의 표정을 내 탓으로 여겨 자책하는 상태입니다. 감정 분리가 필요합니다!" },
      { key: "displacement", label: "전치 (Displacement)", val: anomalyLogs.displacement, warningMsg: "감정을 엉뚱한 제3자에게 쏟아붓는 투사 경향이 있습니다. 3초간 멈춤이 유익합니다." },
      { key: "rationalization", label: "합리화 (Rationalization)", val: anomalyLogs.rationalization, warningMsg: "실수를 고치기보다 회피하고 정당화하려 합니다. 솔직한 사과를 시도하세요." },
      { key: "overgeneralization", label: "파국화 (Overgeneralization)", val: anomalyLogs.overgeneralization, warningMsg: "하나의 실수를 인생 실패로 파국화하는 상태입니다. 팩트만 응시하십시오." }
    ];
    arr.sort((a,b) => b.val - a.val);
    return arr[0].val >= 3 ? arr[0] : null; 
  };

  const distortionWarning = getDominantDistortion();

  // 대화방 내 실시간 '소통 적합율(Alignment)' 연산 로직
  const getChatAlignmentRatio = () => {
    if (!selectedScenario || chatMessages.length <= 1) return 100;
    
    let totalScore = 0;
    let maxPossible = 0;
    
    chatMessages.forEach(msg => {
      if (msg.sender === 'user') {
        if (msg.text.includes("누락된 건 제 착오네요") || msg.text.includes("지난번 일까지") || msg.text.includes("의견에 조언이나") || msg.text.includes("영수야, 사정은") || msg.text.includes("조원들이 일주일") || msg.text.includes("감정적으로 쏘아붙인") || msg.text.includes("사촌동생 철이가") || msg.text.includes("연락 없이 늦어져서") || msg.text.includes("배터리가 꺼진") || msg.text.includes("나도 걱정이") || msg.text.includes("쓸쓸해져서 전화를")) {
          totalScore += 15;
        } else if (msg.text.includes("이기적") || msg.text.includes("양심 어디") || msg.text.includes("인생 대신") || msg.text.includes("배려가 없다") || msg.text.includes("피코")) {
          totalScore -= 10;
        } else {
          totalScore += 5;
        }
        maxPossible += 15;
      }
    });

    const ratio = Math.max(10, Math.min(100, Math.round(((totalScore + 10) / (maxPossible + 10)) * 100)));
    return ratio;
  };

  const chatAlignment = getChatAlignmentRatio();

  // 🗺️ 탭 전용 가이드 닫기 처리
  const markGuideAsViewed = (tabKey) => {
    setViewedGuides(prev => ({
      ...prev,
      [tabKey]: true
    }));
  };

  // 🗺️ 가이드 펼침 초기화
  const triggerGuideAgain = (tabKey) => {
    setViewedGuides(prev => ({
      ...prev,
      [tabKey]: false
    }));
  };

  // 💾 초효율 데이터 백업 내보내기 (JSON 파일 다운로드)
  const handleExportData = () => {
    const backupObj = {
      version: "1.0",
      timestamp: Date.now(),
      streak,
      stats,
      realSelf,
      idealSelf,
      anomalyLogs,
      streakCalendar,
      personaType,
      hasCompletedInitialTest
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `persona_craft_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setNotification({
      type: 'success',
      title: '백업 완료 💾',
      message: '내 자아 성찰 데이터가 안전하게 JSON 파일로 백업 다운로드되었습니다.'
    });
  };

  // 💾 초효율 데이터 복원 가져오기 (JSON 파일 로드)
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        if (imported.streak === undefined || imported.stats === undefined) {
          throw new Error("올바르지 않은 백업 양식입니다.");
        }

        setStreak(imported.streak);
        setStats(imported.stats);
        setRealSelf(imported.realSelf);
        setIdealSelf(imported.idealSelf);
        setAnomalyLogs(imported.anomalyLogs || { personalization: 0, displacement: 0, rationalization: 0, overgeneralization: 0 });
        setStreakCalendar(imported.streakCalendar || []);
        setPersonaType(imported.personaType || "탐색하는 여행자");
        setHasCompletedInitialTest(imported.hasCompletedInitialTest ?? false);

        setNotification({
          type: 'success',
          title: '복원 완료 💾',
          message: '성찰 백업 파일로부터 내 모든 데이터가 무결하게 복원되었습니다!'
        });
      } catch (err) {
        setNotification({
          type: 'danger',
          title: '복원 실패 ❌',
          message: '데이터 양식이 깨졌거나 올바른 백업 JSON 파일이 아닙니다.'
        });
      }
    };
    reader.readAsText(file);
  };

  // 1. 초기 성향 진단 화면
  if (!hasCompletedInitialTest) {
    if (showSplash) {
      return (
        <div className="phone-simulator justify-between p-5 flex flex-col bg-[#fdfbf7] relative overflow-hidden" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <div className="text-center pt-6 z-10">
            <span className="text-[9.5px] bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Ego Portrait Project
            </span>
            <h1 className="text-2xl font-extrabold mt-3 text-gray-800 tracking-tight font-sans">
              마음신분증 <span className="text-rose-700 text-[18px]">MindID</span>
            </h1>
            <p className="text-[11px] text-gray-500 mt-1.5 font-medium leading-relaxed font-sans">
              내 생각의 필터를 맑게 성찰하고,<br />나만의 고유한 심리 신분증을 연마해 보세요.
            </p>
          </div>

          <div className="my-auto py-4 flex flex-col items-center justify-center z-10 float-slow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContents: 'center' }}>
            <div className="p-3 bg-white/70 border border-purple-500/15 rounded-[36px] shadow-lg shadow-rose-950/5 max-w-[260px] backdrop-blur-md">
              <img 
                src="pastel_mental_id_logo.jpg" 
                alt="마음신분증 픽셀 로고" 
                className="w-full h-auto rounded-[24px] object-cover border border-white/80"
              />
            </div>
            <span className="text-[9px] text-purple-700 font-bold tracking-widest uppercase mt-3 animate-pulse">
              ✨ 1030 감성 픽셀 다이어리 에디션 ✨
            </span>
          </div>

          <div className="flex flex-col gap-2.5 z-10 px-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="bg-white/60 border border-[#f43f5e]/15 p-3 rounded-2xl text-left shadow-sm flex items-center gap-3">
              <div className="text-base shrink-0 bg-rose-500/10 p-1.5 rounded-xl text-rose-500">🗺️</div>
              <div>
                <span className="text-[10px] font-bold text-gray-700 block">1. 나의 왜곡 생각 성찰</span>
                <span className="text-[9px] text-gray-500 block leading-relaxed font-sans">일일 O/X 스와이프로 생각의 왜곡 필터를 맑게 거릅니다.</span>
              </div>
            </div>
            <div className="bg-white/60 border border-[#f43f5e]/15 p-3 rounded-2xl text-left shadow-sm flex items-center gap-3">
              <div className="text-base shrink-0 bg-purple-500/10 p-1.5 rounded-xl text-purple-500">🗣️</div>
              <div>
                <span className="text-[10px] font-bold text-gray-700 block">2. 비폭력 대화 훈련소</span>
                <span className="text-[9px] text-gray-500 block leading-relaxed font-sans">마찰 상황 대처 핑퐁을 거쳐 소통 적합성을 교정합니다.</span>
              </div>
            </div>
            <div className="bg-white/60 border border-[#f43f5e]/15 p-3 rounded-2xl text-left shadow-sm flex items-center gap-3">
              <div className="text-base shrink-0 bg-emerald-500/10 p-1.5 rounded-xl text-emerald-500">🧠</div>
              <div>
                <span className="text-[10px] font-bold text-gray-700 block">3. 마음 기질 & 미술 진단</span>
                <span className="text-[9px] text-gray-500 block leading-relaxed font-sans">TCI 및 HTP 스케치 투사로 내 심층 무의식을 해석합니다.</span>
              </div>
            </div>
          </div>

          <div className="bg-white/60 border border-[#f43f5e]/15 p-4 rounded-3xl z-10 flex flex-col gap-2.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="text-[10px] font-bold text-gray-700 block -mb-1">💳 신분증에 기재할 기본 정보</span>
            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
              <div className="flex-1" style={{ flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="이름" 
                  value={userName} 
                  onChange={(e) => { setUserName(e.target.value); localStorage.setItem('user_name', e.target.value); }}
                  className="w-full bg-[#fdfbf7] border border-[#f43f5e]/25 rounded-xl p-2.5 text-xs text-gray-800 outline-none focus:border-[#f43f5e]/50 font-sans"
                />
              </div>
              <div className="w-20" style={{ width: '80px' }}>
                <input 
                  type="number" 
                  placeholder="나이" 
                  value={userAge} 
                  onChange={(e) => { setUserAge(e.target.value); localStorage.setItem('user_age', e.target.value); }}
                  className="w-full bg-[#fdfbf7] border border-[#f43f5e]/25 rounded-xl p-2.5 text-xs text-gray-800 outline-none focus:border-[#f43f5e]/50 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 pb-2 z-10 flex flex-col gap-2.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                if (!userName.trim() || !userAge.trim()) {
                  alert("이름과 나이를 기입해주셔야 마음 신분증 발급이 시작됩니다! 🌟");
                  return;
                }
                setShowSplash(false);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-rose-450 via-purple-500 to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md hover:opacity-95 active:scale-[0.97] font-sans"
              style={{ background: 'linear-gradient(to right, #fb7185, #a78bfa, #6366f1)' }}
            >
              내 마음 신분증 발급하기 ➔
            </button>
            <span className="text-[8.5px] text-gray-650 text-center font-medium">본 앱은 별도 가입이나 광고 유료화 없이 평생 전면 무료 제공됩니다.</span>
          </div>

        </div>
      );
    }

    return (
      <div className="phone-simulator justify-between p-6 flex flex-col bg-[#fdfbf7] relative overflow-hidden" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
        
        {showScanAnimation && (
          <div className="absolute inset-0 bg-[#fdfbf7] z-[999] flex flex-col items-center justify-content-center p-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="scan-line" />
            <div className="w-16 h-16 rounded-full border-4 border-[#f43f5e]/20 border-t-[#f43f5e] animate-spin mb-4" style={{ borderWidth: '4px', borderTopColor: '#f43f5e', borderRadius: '50%', width: '64px', height: '64px' }} />
            <div className="text-center">
              <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest block animate-pulse">AI 알고리즘 분석 중</span>
              <p className="text-xs text-gray-700 mt-2 font-medium">{aiScanStatusText}</p>
              <div className="flex gap-1 justify-content-center justify-center mt-3" style={{ display: 'flex', gap: '4px' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping delay-150" />
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-8">
          <span className="text-[10px] bg-rose-500/10 text-rose-600 font-bold px-3.5 py-1 rounded-full uppercase tracking-widest border border-rose-500/10">
            마음 진단 {diagStep + 1} / {showDiagBranch ? '3' : '6'}
          </span>
          <h2 className="text-xl font-extrabold mt-4 text-gray-800 tracking-tight font-sans">나를 알아가는 첫걸음</h2>
          <div className="w-full bg-[#1b1731]/5 h-1.5 rounded-full overflow-hidden mt-4" style={{ backgroundColor: 'rgba(27, 23, 49, 0.05)', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
            <div className="bg-gradient-to-r from-rose-400 to-purple-500 h-full transition-all duration-300" style={{ width: `${((diagStep + 1) / (showDiagBranch ? 3 : 6)) * 100}%`, height: '100%' }} />
          </div>
        </div>

        {showDiagBranch ? (
          <div className="bg-white/80 border border-rose-500/10 p-6 my-auto flex flex-col gap-4 text-center rounded-[28px] shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-content-center text-rose-500 mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800 font-sans">초간편 3문항 진단 완료!</h3>
              <p className="text-[11.5px] text-gray-600 mt-2 leading-relaxed">
                여기서 바로 기본 매력 성격을 분석하고 시작하시겠습니까? 아니면 질문을 3개 더 풀어 정밀한 분석을 받으시겠습니까?
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => processFinalPersona(answersMap)}
                className="py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 font-sans"
              >
                결과 바로 확인하고 들어가기 🚀
              </button>
              <button 
                onClick={() => {
                  setShowDiagBranch(false);
                  setDiagStep(3); 
                }}
                className="py-2.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 border border-rose-500/15 rounded-xl text-xs font-bold transition-all flex items-center justify-content-center gap-1 active:scale-95 font-sans"
                style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', gap: '4px' }}
              >
                더 정밀하게 분석받기 (질문 +3개) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : showFinalDiagResult ? (
          <div className="bg-white/80 border border-rose-500/10 p-6 my-auto flex flex-col gap-4 text-center rounded-[28px] shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-450 to-purple-500 flex items-center justify-content-center mx-auto text-2xl animate-pulse text-white" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', margin: '0 auto', background: 'linear-gradient(to top right, #fb7185, #a78bfa)' }}>
              📇
            </div>
            <div>
              <span className="text-[9.5px] text-rose-500 font-extrabold uppercase tracking-wider block">나의 내면 성향 분석 결과</span>
              <h3 className="font-extrabold text-base text-purple-600 mt-1.5 font-sans">"{personaType.replace(" (정밀 임상 대조)", "")}"</h3>
              <p className="text-[11.5px] text-gray-700 mt-3.5 leading-relaxed bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 text-left">
                {Object.values(answersMap).filter(v => v !== null).length <= 3 
                  ? "3문항의 기초 데이터를 바탕으로 산출된 기본 페르소나입니다. 일상 속에서 자신을 방어하는 방식과 소통 방식을 보완해줄 첫 임무가 준비되었습니다." 
                  : "6문항의 기질 및 조절 능력을 정밀 대조하여 완성된 캐릭터입니다. 내면 수용과 타인과의 상호작용 간극을 최적화하기 위한 맞춤 솔루션에 진입합니다."
                }
              </p>
            </div>
            <button 
              onClick={enterMainService}
              className="py-3 bg-gradient-to-r from-rose-450 to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 active:scale-95 font-sans"
              style={{ background: 'linear-gradient(to right, #fb7185, #a78bfa)' }}
            >
              내 맞춤 트레이닝 시작하기 ➔
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 my-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: 'auto 0' }}>
            <p className="text-center text-base text-gray-800 font-extrabold leading-relaxed px-2 font-sans">
              {INITIAL_DIAGNOSIS_POOL[diagStep].question}
            </p>
            <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {INITIAL_DIAGNOSIS_POOL[diagStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleDiagClick(opt.value)}
                  className="p-4.5 bg-white/80 hover:bg-[#fdfbf7] border border-rose-500/15 hover:border-rose-500/35 rounded-2xl text-left text-xs text-gray-800 transition-all active:scale-[0.98] leading-relaxed shadow-sm flex items-center justify-between font-sans"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span className="flex-1 pr-2">{opt.text}</span>
                  <ChevronRight className="w-4 h-4 text-rose-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-gray-500 pb-4 font-medium">
          성격 심리학(TCI/Big5)을 기초로 분석합니다.
        </div>
      </div>
    );
  }

  return (
    <div className="phone-simulator bg-[#fdfbf7] relative overflow-hidden">
      
      {/* 🧬 가상 인지 스캔용 AI 로더 */}
      {showScanAnimation && (
        <div className="absolute inset-0 bg-[#fdfbf7] z-[999] flex flex-col items-center justify-content-center p-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 110 }}>
          <div className="scan-line" />
          <div className="w-12 h-12 rounded-full border-4 border-[#f43f5e]/20 border-t-[#f43f5e] animate-spin mb-4" style={{ borderWidth: '4px', borderTopColor: '#f43f5e', borderRadius: '50%', width: '48px', height: '48px' }} />
          <div className="text-center">
            <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest block animate-pulse font-sans">AI Matrix Scan</span>
            <p className="text-xs text-gray-700 mt-2 font-medium">{aiScanStatusText}</p>
          </div>
        </div>
      )}

      {/* 💎 레벨업 축하 오버레이 모달 */}
      {showLevelUpModal && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-content-center p-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'absolute', top:0, left:0, right:0, bottom:0 }}>
          <div className="glass-panel p-6 w-full text-center relative border border-amber-400/40 glow-primary flex flex-col gap-4.5" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '24px' }}>
            <div className="text-4xl animate-bounce">✨💎✨</div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">Level Up!</span>
              <h3 className="font-extrabold text-base text-gray-900 mt-1">자아 통합 성격체 진화 완료</h3>
              <p className="text-xs text-gray-800 mt-2 leading-relaxed">
                축하합니다! 회원님의 호감도와 자아 일치율이 상승하여, 내면의 원석이 **"{gemstone.name}"**로 멋지게 연마되었습니다.
              </p>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/25 p-3.5 rounded-xl text-left" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
              <div className="flex justify-between text-[11px] text-gray-800 mb-1" style={{ display: 'flex', justifyContents: 'space-between' }}>
                <span>현재 호감 능력</span>
                <span className="text-amber-400 font-bold">Lvl {gemstone.level.replace("Lvl ","")} 돌파</span>
              </div>
              <p className="text-[9.5px] text-gray-650 leading-relaxed">자아 조율 오라 회전율이 향상되어 타인의 정서에 더 탄력적으로 소통 경계를 방어할 수 있습니다.</p>
            </div>
            <button 
              onClick={() => setShowLevelUpModal(false)}
              className="py-2.5 bg-gradient-to-r from-amber-400 to-purple-600 text-white rounded-xl text-xs font-bold active:scale-95"
              style={{ background: 'linear-gradient(to right, #f59e0b, #8b5cf6)' }}
            >
              성장 여정 계속하기 ➔
            </button>
          </div>
        </div>
      )}

      {/* 🔥 듀오링고형 연속 학습 초기화 경보 및 복구 모달 */}
      {showStreakModal && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-content-center p-6" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', padding: '24px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="glass-panel p-6 w-full text-center relative border border-rose-500/30 flex flex-col gap-4 shadow-xl" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <div className="text-5xl animate-pulse">💔🔥</div>
            <div>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Streak Broken!</span>
              <h3 className="font-extrabold text-base text-gray-900 mt-1">성찰 연속 학습이 깨졌습니다!</h3>
              <p className="text-xs text-gray-800 mt-2 leading-relaxed">
                바쁜 일상 때문에 어제 미션을 놓치셨군요. 불꽃 연속 학습이 0일로 초기화되었습니다.
              </p>
            </div>

            {/* 쉴드 무상 제공 고지 */}
            <div className="bg-purple-950/25 border border-[#f43f5e]/20 rounded-xl p-3.5 text-left" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>무료 Streak Freeze 쉴드 완비</span>
              </div>
              <p className="text-[9.5px] text-gray-650 mt-1 leading-relaxed">
                누구나 하루 실패 시 Streak Freeze 쉴드가 자동 차감되어 학습 기록을 지켜냅니다.
              </p>
            </div>

            <div className="flex flex-col gap-2.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => setShowQuiz(true)}
                className="py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-xs font-bold active:scale-95"
              >
                🧠 심리학 복구 퀴즈 풀어서 살려내기
              </button>
              <button 
                onClick={() => { setShowStreakModal(false); setIsStreakBroken(false); }}
                className="py-2 text-[10px] text-gray-500 hover:text-gray-650 font-bold"
              >
                0일로 처음부터 다시 시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧠 복구 퀴즈 구역 */}
      {showQuiz && (
        <div className="absolute inset-0 bg-black/95 z-55 flex items-center justify-content-center p-6" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', padding: '24px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <div className="glass-panel p-6 w-full text-left flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <span className="text-[10px] text-purple-700 font-extrabold uppercase tracking-widest block">🔥 STREAK RESCUE QUIZ</span>
            <h4 className="text-xs font-extrabold text-gray-800">Q. 다음 중 융(Jung)이 정의한, 자아의 통제를 벗어나 무의식 깊은 곳에 억압된 어두운 본능적 영역을 뜻하는 명칭은?</h4>
            <div className="flex flex-col gap-2 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => handleQuizSubmit('persona')}
                className={`py-2.5 px-4 rounded-xl text-xs text-left border ${quizAnswer === 'persona' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-white/5 border-[#f43f5e]/10 text-gray-800'}`}
              >
                1. 페르소나 (Persona) - 사회적 얼굴
              </button>
              <button 
                onClick={() => handleQuizSubmit('shadow')}
                className={`py-2.5 px-4 rounded-xl text-xs text-left border ${quizAnswer === 'shadow' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700' : 'bg-white/5 border-[#f43f5e]/10 text-gray-800'}`}
              >
                2. 그림자 (Shadow) - 어둠의 자아 (정답)
              </button>
              <button 
                onClick={() => handleQuizSubmit('anima')}
                className={`py-2.5 px-4 rounded-xl text-xs text-left border ${quizAnswer === 'anima' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-white/5 border-[#f43f5e]/10 text-gray-800'}`}
              >
                3. 아니마 (Anima) - 남성 내 여성성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar (미니멀 다이어리 헤더) */}
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#f43f5e]/10 bg-white/60 backdrop-blur-md z-10" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/15 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            마음신분증 📇
          </span>
        </div>
        
        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setShowApiKeyModal(true)} 
            className="w-7 h-7 rounded-xl bg-white/70 border border-[#f43f5e]/15 flex items-center justify-content-center hover:bg-rose-500/5 transition-all text-xs shadow-sm relative group"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Gemini API 설정"
          >
            ⚙️
            {!userApiKey && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* ⚠️ 실시간 알림 피드백 오버레이 */}
      {notification && (
        <div className="mx-5 mt-4 p-3 bg-purple-600/10 border border-[#f43f5e]/20 rounded-xl flex items-start gap-2.5 text-left chat-enter" style={{ display: 'flex', gap: '10px' }}>
          <AlertCircle className="w-4.5 h-4.5 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">🚨 알림: {notification.title}</span>
            <p className="text-[9.5px] text-gray-800 leading-relaxed mt-0.5">{notification.message}</p>
          </div>
        </div>
      )}

      {/* ⚠️ 실시간 가장 위험한 인지 왜곡 탐지 배너 */}
      {selectedTab === "home" && distortionWarning && (
        <div className="mx-5 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-left chat-enter" style={{ display: 'flex', gap: '10px' }}>
          <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">🚨 내면 인지 왜곡 적색경보: {distortionWarning.label}</span>
            <p className="text-[9px] text-gray-800 leading-relaxed mt-0.5">{distortionWarning.warningMsg}</p>
          </div>
        </div>
      )}

      {/* 메인 탭 전환 영역 */}
      <div className="flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* 탭 A: 홈 */}
        {selectedTab === "home" && (
          !viewedGuides.home ? (
            renderTabGuideCard("home")
          ) : (
            <div className="px-5 py-4 flex flex-col gap-5 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 원석 아바타 - 더 풍부한 글래스 그라디언트 적용 */}
              <div className="bg-white/75 p-4 rounded-3xl border border-[#f43f5e]/15 flex items-center gap-4 relative overflow-hidden backdrop-blur-md shadow-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="w-16 h-16 rounded-full relative flex items-center justify-content-center" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                  <div 
                    className="absolute inset-0 rounded-full gem-aura" 
                    style={{ 
                      background: gemstone.auraStyle,
                      animation: `spin ${gemstone.auraSpeed} linear infinite`,
                      opacity: 0.6
                    }} 
                  />
                  <div className="absolute inset-1 rounded-full bg-[#fdfbf7] flex items-center justify-content-center text-2xl pulse-avatar shadow-inner z-10" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', fontSize: '24px' }}>
                    {gemstone.emoji}
                  </div>
                </div>

                <div className="flex-1 z-10 text-left" style={{ flex: 1 }}>
                  <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-[9.5px] text-purple-700 font-bold uppercase tracking-widest">{gemstone.level} {prevGemLevel !== gemstone.level ? "진화중!" : "원석"}</span>
                    <span className="text-[9.5px] text-emerald-700 font-bold">합일율 {(100 - selfGap)}%</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mt-0.5">{gemstone.name}</h4>
                  <p className="text-[10px] text-gray-650 mt-1 leading-relaxed">{gemstone.desc}</p>
                </div>
              </div>

              {/* 1단계 데일리 인지 교정 성찰 카드 */}
              <div className="flex flex-col gap-2.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="flex justify-between items-center" style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}>
                  <h3 className="font-bold text-xs tracking-wider text-gray-800 uppercase flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass className="w-4 h-4 text-purple-700" />
                    1단계: 데일리 인지 교정 성찰 (CBT Swipe)
                  </h3>
                  <span className="text-[9.5px] bg-purple-500/20 text-purple-700 px-2 py-0.5 rounded-full border border-[#f43f5e]/20 font-bold">
                    {REFLECTION_POOL[currentIdx].theory}
                  </span>
                </div>

                <div className="relative h-56 w-full flex items-center justify-center overflow-hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!showFeedback ? (
                    <div className="w-full h-full bg-white/80 border border-[#f43f5e]/15 p-5 rounded-3xl flex flex-col justify-between swipe-card shadow-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                      <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">{REFLECTION_POOL[currentIdx].concept}</span>
                        <span className="text-[9.5px] text-gray-550 font-medium">카드 {currentIdx + 1}/{REFLECTION_POOL.length}</span>
                      </div>
                      <p className="text-[12px] font-bold text-center text-gray-850 leading-relaxed px-2 my-auto" style={{ margin: 'auto 0' }}>
                        "{REFLECTION_POOL[currentIdx].question}"
                      </p>
                      <div className="grid grid-cols-2 gap-3.5 mt-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <button 
                          onClick={() => handleSwipe('yes')} 
                          className="py-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 font-bold transition-all text-xs active:scale-95"
                          style={{ color: '#fda4af' }}
                        >
                          그렇다 (O)
                        </button>
                        <button 
                          onClick={() => handleSwipe('no')} 
                          className="py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 font-bold transition-all text-xs active:scale-95"
                          style={{ color: '#a7f3d0' }}
                        >
                          아니다 (X)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white/85 border border-[#fb7185]/20 p-5 rounded-3xl flex flex-col justify-between shadow-sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-[10px] font-bold text-amber-700">치료 피드백: {REFLECTION_POOL[currentIdx].concept}</span>
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-white/5" style={{ color: userAnswer === 'yes' ? '#fda4af' : '#a7f3d0' }}>
                          내 대답: {userAnswer === 'yes' ? '그렇다' : '아니다'}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-gray-800 leading-relaxed overflow-y-auto pr-1 my-2" style={{ maxHeight: '90px', overflowY: 'auto' }}>
                        {userAnswer === 'yes' ? REFLECTION_POOL[currentIdx].yesFeedback : REFLECTION_POOL[currentIdx].noFeedback}
                      </p>
                      
                      <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-2.5 mb-2 text-left" style={{ backgroundColor: 'rgba(139, 92, 246, 0.04)' }}>
                        <span className="text-[9.5px] text-purple-700 font-bold block">💊 행동 처방 임무 발급 완료:</span>
                        <span className="text-[9.5px] text-gray-800 block truncate mt-0.5">"{REFLECTION_POOL[currentIdx].prescriptions[userAnswer]?.text || '처방 행동 임무를 실천하고 가시성을 높이세요!'}"</span>
                      </div>

                      <button 
                        onClick={handleNextReflection} 
                        className="py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                        style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', gap: '4px' }}
                      >
                        다음 인지 성찰하기 <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2단계 행동 미션 */}
              <div className="flex flex-col gap-2.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="flex justify-between items-center" style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}>
                  <h3 className="font-bold text-xs tracking-wider text-gray-800 uppercase flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smile className="w-4 h-4 text-emerald-700" />
                    2단계: 처방 행동 임무 (행동주의)
                  </h3>
                </div>

                {activeMissions.length === 0 ? (
                  <div className="p-6 border border-dashed border-[#f43f5e]/15 rounded-2xl text-center text-xs text-gray-650">
                    1단계 성찰 카드에 응답하는 즉시, 그와 결합된 2단계 행동주의 교정 임무가 이곳에 발부됩니다.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeMissions.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => handleMissionToggle(m.id)}
                        className={`p-4 rounded-3xl border transition-all cursor-pointer flex justify-between items-center ${m.completed ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-white/80/40 border-[#f43f5e]/10 hover:border-[#f43f5e]/20 shadow-sm'}`}
                        style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}
                      >
                        <div className="flex-1 pr-2 text-left" style={{ flex: 1 }}>
                          <span className="text-[8.5px] text-purple-700 font-bold uppercase tracking-wider">{m.originConcept ? `${m.originConcept} 연계` : "기초"}</span>
                          <p className={`text-[11.5px] font-bold mt-0.5 ${m.completed ? 'line-through text-gray-500' : 'text-gray-800'}`} style={{ textDecoration: m.completed ? 'line-through' : 'none' }}>
                            {m.text}
                          </p>
                          <p className="text-[10px] text-gray-650 mt-1 leading-relaxed">{m.desc}</p>
                        </div>
                        <div className="flex items-center gap-2.5" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CheckCircle2 className={`w-6 h-6 ${m.completed ? 'text-emerald-700' : 'text-gray-600'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )
        )}

        {/* 탭 B: 대화훈련 */}
        {selectedTab === "chat" && (
          !viewedGuides.chat ? (
            renderTabGuideCard("chat")
          ) : (
            <div className="phone-simulator-inner px-5 py-4 flex flex-col h-full justify-between text-left animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '600px', justifyContents: 'space-between' }}>
              <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex justify-between items-center pb-1.5 border-b border-[#f43f5e]/10" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="text-left">
                    <span className="text-[9px] text-purple-700 font-bold uppercase tracking-widest">실전 시나리오 훈련</span>
                    <h3 className="font-extrabold text-sm text-gray-850 mt-0.5">🗣️ 갈등 상황 대화 시뮬레이션</h3>
                  </div>
                  <button onClick={() => triggerGuideAgain("chat")} className="text-gray-650 hover:text-purple-700 transition-all p-1" title="도움말 다시보기">
                    <HelpCircle className="w-4.5 h-4.5" />
                  </button>
                </div>

                {!chatScenarioActive ? (
                  <div className="flex flex-col gap-3.5" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    {/* 카테고리 필터 탭 바 */}
                    <div className="flex gap-1 overflow-x-auto py-1 text-[9.5px]" style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                      {[
                        { id: 'all', label: '전체' },
                        { id: 'work', label: '🏢 회사 (5)' },
                        { id: 'school', label: '🏫 조별과제' },
                        { id: 'family', label: '🏡 가족/어른' },
                        { id: 'lover', label: '❤️ 연인소통' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setChatCategoryFilter(tab.id)}
                          className={`px-3 py-1 rounded-full font-bold shrink-0 transition-all border ${chatCategoryFilter === tab.id ? 'bg-[#8b5cf6] text-white border-purple-500 shadow-sm' : 'bg-white text-gray-800 border-[#f43f5e]/15 hover:bg-rose-500/5'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* 상황 제시 리스트 */}
                    <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 border border-[#f43f5e]/15 p-2 rounded-2xl bg-white/60" style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                      {CHAT_SCENARIOS
                        .filter(sc => chatCategoryFilter === 'all' || sc.category === chatCategoryFilter)
                        .map(sc => (
                          <div 
                            key={sc.id}
                            onClick={() => startChatScenario(sc.id)}
                            className="p-3 bg-white/95 hover:bg-rose-500/5 border border-[#f43f5e]/15 hover:border-purple-500/20 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.99] flex flex-col gap-0.5"
                          >
                            <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span className="text-[8.5px] text-purple-700 font-bold uppercase tracking-wide">{sc.categoryLabel}</span>
                              <ChevronRight className="w-4 h-4 text-purple-700" />
                            </div>
                            <h4 className="text-[11.5px] font-bold text-gray-800 mt-0.5">{sc.title}</h4>
                            <p className="text-[10px] text-gray-650 leading-relaxed truncate">{sc.desc}</p>
                          </div>
                      ))}
                    </div>

                    {/* ✍️ 내가 겪었던 상황 직접 입력하기 (올 무료!) */}
                    <div className="bg-white/75 border border-[#f43f5e]/15 rounded-3xl p-4 flex flex-col gap-2.5 shadow-sm backdrop-blur-md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="flex items-center gap-1.5 font-bold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PenTool className="w-4 h-4 text-purple-700 animate-bounce" />
                        <span className="text-xs text-gray-800">✍️ 내 갈등 상황 직접 입력 (무료 개방)</span>
                      </div>
                      <p className="text-[9.5px] text-gray-650 leading-relaxed">
                        내가 겪은 난처한 상황을 적으면, AI가 가상 선제공격 대사와 현명한 대답(A)/피해야 할 대답(B, C) 3지선다 훈련방을 실시간 셋업합니다.
                      </p>
                      <div className="flex gap-2 mt-1" style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text"
                          placeholder="예: 소개팅 후 상대방이 연락 없다가 거절 톡 보냈어요"
                          value={customUserSituation}
                          onChange={(e) => setCustomUserSituation(e.target.value)}
                          className="flex-1 bg-white border border-[#f43f5e]/25 rounded-2xl p-2.5 text-xs text-gray-800 outline-none focus:border-purple-500/40"
                          style={{ flex: 1 }}
                        />
                        <button 
                          onClick={handleCreateCustomScenario}
                          disabled={customGenerating || !customUserSituation.trim()}
                          className="px-4 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-gray-800 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95"
                        >
                          {customGenerating ? "생성중..." : "AI 설계"}
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* 채팅 진행창 - 스크롤 뷰 및 가시성 극대화 구조 */
                  <div className="flex flex-col gap-3 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* 🧬 실시간 소통 정합율 게이지 위젯 */}
                    <div className="bg-white/80/65 p-3 rounded-2xl border border-[#f43f5e]/20 text-left flex flex-col gap-1 shadow shadow-purple-500/5">
                      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-[9.5px] text-purple-700 font-bold uppercase tracking-wider block">🧬 소통 정합 지수 (NVC Alignment)</span>
                        <span className={`text-[10px] font-extrabold ${chatAlignment >= 75 ? 'text-emerald-700' : 'text-yellow-450'}`}>{chatAlignment}%</span>
                      </div>
                      <div className="w-full bg-rose-500/10 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 via-purple-500 to-emerald-500 h-full progress-bar-fill" 
                          style={{ width: `${chatAlignment}%` }} 
                        />
                      </div>
                      <p className="text-[8.5px] text-gray-550 leading-relaxed mt-0.5">상대의 분노/경계를 배려하며 내 메시지(나-전달법)를 잘 조율하면 비율이 상승합니다.</p>
                    </div>

                    <div className="flex justify-between items-center bg-white/75 p-2.5 px-4 rounded-2xl border border-[#f43f5e]/15 shadow-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button 
                        onClick={() => setChatScenarioActive(false)}
                        className="text-[10px] text-purple-700 font-bold flex items-center gap-0.5"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> 상황 목록
                      </button>
                      <span className="text-[11px] font-extrabold text-gray-800">
                        {selectedScenario?.characterName} 대화방
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    </div>

                    {/* 채팅창 스크롤 영역 */}
                    <div className="bg-white/60 rounded-3xl border border-[#f43f5e]/15 p-4 flex flex-col gap-3.5 min-h-[300px] max-h-[320px] overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                      {chatMessages.map(m => (
                        <div 
                          key={m.id}
                          className={`flex flex-col max-w-[85%] chat-enter ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                          style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start' }}
                        >
                          <span className="text-[8.5px] text-gray-550 mb-0.5">{m.sender === 'user' ? '나 (페르소나)' : selectedScenario?.characterName}</span>
                          <div className={`p-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm ${m.sender === 'user' ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-tr-none' : 'bg-rose-500/5 border border-rose-500/10 text-gray-800 rounded-tl-none'}`}>
                            {m.text}
                          </div>
                          <span className="text-[8px] text-gray-600 mt-0.5">{m.time}</span>
                        </div>
                      ))}

                      {/* 선택지 카드를 절대적 고정이 아닌 대화 말풍선 스크롤 맨 하단 뒤에 직접 삽입! */}
                      {chatOptions && chatOptions.length > 0 ? (
                        <div className="flex flex-col gap-2.5 mt-2 border-t border-[#f43f5e]/15 pt-3 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <span className="text-[9.5px] text-purple-700 font-bold block text-left">💬 나의 소통 답변 선택하기:</span>
                          {chatOptions.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleChatOptionSelect(opt)}
                              className="p-3 bg-[#fdfbf7] hover:bg-rose-500/5 border border-[#f43f5e]/20 hover:border-purple-500/35 rounded-2xl text-left text-[11px] text-gray-800 transition-all leading-relaxed shadow-sm active:scale-[0.98]"
                            >
                              {opt.text}
                              {opt.desc && <span className="block text-[9px] text-purple-700 mt-1 font-semibold">{opt.desc}</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        chatCompleted && (
                          <div className="bg-purple-500/5 border border-[#f43f5e]/20 p-4 rounded-2xl text-center flex flex-col gap-2.5 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h4 className={`text-xs font-bold ${currentBranchPath.includes("fail") ? "text-rose-400" : "text-amber-700"}`}>
                              {currentBranchPath.includes("fail") ? "❌ 소통 트레이닝 실패 (파국 종료)" : "🎉 소통 트레이닝 성공 (화해 종료)"}
                            </h4>
                            <p className="text-[10px] text-gray-800 leading-relaxed">
                              {currentBranchPath.includes("fail") 
                                ? "상대방과의 감정 골이 굳어져 갈등이 깊어졌습니다. 데일리 O/X 성찰을 수행해 사과 및 쿠션어 역량을 다시 연마해보세요."
                                : "상대의 감정을 경청으로 녹여내어 갈등이 원만하게 해소되었습니다. 호감과 카리스마 보상이 지급됩니다!"
                              }
                            </p>
                            <button onClick={() => setChatScenarioActive(false)} className="py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-xs font-bold">
                              다른 상황 고르러 가기
                            </button>
                          </div>
                        )
                      )}

                      <div ref={chatEndRef} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* 탭 C: 왜곡통계 (비활성화) */}
        {selectedTab === "analytics" && null}
        {false && (
          !viewedGuides.analytics ? (
            renderTabGuideCard("analytics")
          ) : (
            <div className="px-5 py-4 flex flex-col gap-5 text-left animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="flex justify-between items-center pb-1 border-b border-[#f43f5e]/10" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="text-left">
                  <span className="text-[9.5px] text-purple-700 font-bold uppercase tracking-widest">자아 성찰 대시보드</span>
                  <h3 className="font-extrabold text-sm text-gray-900 mt-1">📊 내면 인지 왜곡 통계</h3>
                </div>
                <button onClick={() => triggerGuideAgain("analytics")} className="text-gray-650 hover:text-purple-700 transition-all p-1" title="도움말 다시보기">
                  <HelpCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* 오늘의 마음 맑음도 지수 카드 */}
              <div className="glass-panel p-4.5 flex flex-col gap-2 shadow-lg" style={{ padding: '18px' }}>
                <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-[9.5px] text-purple-700 font-bold uppercase tracking-wider block">☀️ 오늘의 마음 맑음 지수</span>
                  <span className={`text-[10.5px] font-bold ${mindClarity.colorClass}`}>{mindClarity.weather} ({mindClarity.score}점)</span>
                </div>
                <div className="w-full bg-[#1b1731] h-2.5 rounded-full overflow-hidden mt-1.5" style={{ backgroundColor: '#1b1731', height: '10px', borderRadius: '999px' }}>
                  <div 
                    className="bg-gradient-to-r from-rose-500 via-yellow-400 to-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${mindClarity.score}%`, height: '100%' }} 
                  />
                </div>
                <p className="text-[10px] text-gray-650 leading-relaxed mt-2">{mindClarity.desc}</p>
              </div>

              {/* 4대 왜곡 통계 막대 */}
              <div className="glass-panel p-4 flex flex-col gap-4 shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
                <h4 className="font-bold text-xs tracking-wider text-purple-700 uppercase flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> 나의 무의식 방어 징후
                </h4>

                <div className="flex flex-col gap-4 mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: "개인화 (Personalization)", val: anomalyLogs.personalization, color: "from-rose-500 to-red-400" },
                    { label: "전치 (Displacement)", val: anomalyLogs.displacement, color: "from-amber-500 to-yellow-400" },
                    { label: "합리화 (Rationalization)", val: anomalyLogs.rationalization, color: "from-purple-500 to-indigo-400" },
                    { label: "파국화 (Overgeneralization)", val: anomalyLogs.overgeneralization, color: "from-pink-500 to-rose-400" }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[10px] mb-1 font-semibold" style={{ display: 'flex', justifyContents: 'space-between', marginBottom: '4px' }}>
                        <span className="text-gray-800">{item.label}</span>
                        <span className={item.val >= 3 ? 'text-rose-400 font-extrabold' : 'text-gray-650'}>{item.val}회 감지</span>
                      </div>
                      <div className="w-full bg-[#1b1731] h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1b1731', height: '8px', borderRadius: '999px' }}>
                        <div className={`bg-gradient-to-r ${item.color} h-full transition-all`} style={{ width: `${Math.min(100, (item.val / 6) * 100)}%`, height: '100%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 💡 소통 쿠션어 사전 위젯 */}
              <div className="glass-panel p-4 flex flex-col gap-3.5 shadow-sm" style={{ padding: '16px' }}>
                <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Brain className="w-4 h-4 text-purple-700" />
                  <h4 className="font-bold text-xs text-gray-800">💡 임상 소통 쿠션어 사전</h4>
                </div>

                {/* 쿠션어 카테고리 탭 */}
                <div className="flex gap-1 overflow-x-auto py-1 text-[9.5px]" style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                  {["부탁", "거절", "사과", "반대", "연인"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCushionCategory(cat)}
                      className={`px-3 py-1 rounded-full font-bold shrink-0 transition-all border ${activeCushionCategory === cat ? 'bg-[#8b5cf6] text-white border-purple-400 shadow-md' : 'bg-[#181432] text-gray-450 border-[#f43f5e]/10 hover:text-gray-255'}`}
                    >
                      {cat === '부탁' ? '🤝 부탁/요청' : cat === '거절' ? '🙅‍♂️ 거절/경계' : cat === '사과' ? '🙇‍♂️ 실수/사과' : cat === '반대' ? '⚡ 반대의견' : '❤️ 연인소통'}
                    </button>
                  ))}
                </div>

                {/* 활성화된 쿠션어 사전 컨텐츠 출력 */}
                {(() => {
                  const curCushion = CUSHION_DICTIONARY.find(c => c.category === activeCushionCategory);
                  if (!curCushion) return null;
                  return (
                    <div className="flex flex-col gap-3 mt-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="border-l-2 border-purple-500 pl-2">
                        <span className="text-[10px] text-purple-700 font-bold block">{curCushion.title}</span>
                        <span className="text-[9px] text-gray-650 leading-relaxed block mt-0.5">{curCushion.desc}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2.5 max-h-[140px] overflow-y-auto pr-1" style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                        {curCushion.templates.map((tpl, i) => (
                          <div key={i} className="bg-[#fdfbf7]/50 p-3 rounded-2xl border border-[#f43f5e]/10">
                            <span className="text-[8.5px] text-purple-700 font-bold block">상황: {tpl.situation}</span>
                            <p className="text-[10px] text-gray-800 mt-1.5 leading-relaxed bg-[#0b071a] p-3 rounded-xl border border-[#f43f5e]/15 italic">
                              {tpl.expression}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          )
        )}

        {/* 탭 D: 심리검사 ( 로컬 판독기 연계로 0원 실현! ) */}
        {selectedTab === "special_test" && (
          !viewedGuides.special_test ? (
            renderTabGuideCard("special_test")
          ) : (
            <div className="px-5 py-5 flex flex-col gap-5 text-left animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {!activeTest && (
                <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="flex justify-between items-center pb-2 border-b border-[#f43f5e]/10" style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}>
                    <div className="text-left">
                      <span className="text-[10px] bg-purple-500/20 text-purple-700 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Psychology Tests
                      </span>
                      <h3 className="font-extrabold text-sm text-gray-850 mt-1.5">🧠 전문 심리 진단실</h3>
                    </div>
                    <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        onClick={() => { setTempApiKeyInput(userApiKey); setShowApiKeyModal(true); }}
                        className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[10px] font-bold ${userApiKey ? 'bg-emerald-950/20 text-emerald-700 border-emerald-500/20' : 'bg-purple-500/5 text-purple-700 border-[#f43f5e]/20'}`}
                        title="Gemini AI API Key 설정"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{userApiKey ? 'AI ON' : 'AI OFF'}</span>
                      </button>
                      <button onClick={() => triggerGuideAgain("special_test")} className="text-gray-650 hover:text-purple-700 transition-all p-1" title="도움말 다시보기">
                        <HelpCircle className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-450 leading-relaxed -mt-2">
                    API Key 미등록 시 정교한 로컬 판독으로 가동되며, 개인 API Key를 등록하시면 실시간 구글 Gemini AI 분석이 무료 연계됩니다.
                  </p>

                  <div className="p-4.5 rounded-3xl border border-[#f43f5e]/15 bg-white/70 flex justify-between items-center" style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center', padding: '18px' }}>
                    <div className="flex-1 text-left" style={{ flex: 1 }}>
                      <span className="text-[9px] text-purple-700 font-bold uppercase tracking-wider block">TCI 성격 기질검사</span>
                      <h4 className="text-xs font-bold text-gray-800 mt-0.5 font-sans">정량 TCI 7대 기질 분석</h4>
                      <p className="text-[9.5px] text-gray-650 mt-1">기질 4차원 + 성격 3차원 정밀분석 및 잠재 병리 진단</p>
                    </div>
                    <div className="ml-3" style={{ marginLeft: '12px' }}>
                      <button 
                        onClick={() => { setActiveTest('TCI'); setTciStep(0); setTciAnswersAcc({ NS:0, HA:0, RD:0, PS:0, SD:0, CO:0, ST:0 }); }}
                        className="py-2 px-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> 검사시작
                      </button>
                    </div>
                  </div>

                  <div className="p-4.5 rounded-3xl border border-emerald-500/10 bg-[#120e29]/40 flex justify-between items-center" style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center', padding: '18px' }}>
                    <div className="flex-1 text-left" style={{ flex: 1 }}>
                      <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider block">미술 투사 진단</span>
                      <h4 className="text-xs font-bold text-gray-800 mt-0.5 font-sans">HTP 로컬 알고리즘 분석</h4>
                      <p className="text-[9.5px] text-gray-650 mt-1">손가락 스케치 붓놀림 횟수와 내 성향을 대조하여 정밀 힐링 리포트 도출</p>
                    </div>
                    <div className="ml-3" style={{ marginLeft: '12px' }}>
                      <button 
                        onClick={() => { setActiveTest('HTP'); setHtpStep('intro'); setHtpDrawnCounts({ house: 0, tree: 0, person: 0 }); }}
                        className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Brush className="w-3.5 h-3.5" /> 그림분석
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TCI 문항 구역 */}
              {activeTest === 'TCI' && (
                <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="flex justify-between items-center pb-2 border-b border-[#f43f5e]/10" style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => { setActiveTest(null); setTciStep(0); }} className="text-xs text-gray-650 hover:text-gray-800 flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> 목록
                    </button>
                    <span className="text-xs font-bold text-purple-700">TCI 정밀검사</span>
                  </div>

                  {tciStep === 99 ? (
                    <div className="bg-[#fdfbf7] p-8 text-center flex flex-col gap-4 items-center justify-content-center min-h-[340px] rounded-3xl border border-[#f43f5e]/15 relative z-50" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContents: 'center', minHeight: '340px' }}>
                      <div className="scan-line" />
                      <div className="w-12 h-12 rounded-full border-4 border-[#f43f5e]/20 border-t-purple-400 animate-spin mb-4" style={{ borderWidth: '4px', borderTopColor: '#a78bfa', borderRadius: '50%', width: '48px', height: '48px' }} />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 mt-2">
                          TCI 기질 차원 분석 매핑 중...
                        </h4>
                        <p className="text-[10px] text-purple-700 font-bold mt-2 animate-pulse">{aiScanStatusText}</p>
                      </div>
                    </div>
                  ) : tciStep < 14 ? (
                    <div className="glass-panel p-5 flex flex-col gap-4 text-center" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                      <span className="text-[9.5px] bg-purple-500/15 text-purple-700 font-bold px-3 py-1 rounded-full border border-[#f43f5e]/20" style={{ alignSelf: 'center' }}>
                        문항 {tciStep + 1} / 14 | {TCI_QUESTIONS[tciStep].label} 측정
                      </span>
                      <p className="text-sm font-bold text-gray-800 leading-relaxed px-1 font-sans">
                        "{TCI_QUESTIONS[tciStep].text}"
                      </p>
                      <div className="flex flex-col gap-2 mt-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { text: "👍 매우 그렇다", score: 5 },
                          { text: "😊 약간 그렇다", score: 4 },
                          { text: "😐 보통이다", score: 3 },
                          { text: "🙁 약간 아니다", score: 2 },
                          { text: "👎 전혀 아니다", score: 1 }
                        ].map((ans, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleTciAnswer(ans.score)}
                            className="py-3 px-4 bg-white hover:bg-[#f43f5e]/5 border border-[#f43f5e]/15 rounded-2xl text-left text-xs text-gray-800 transition-all active:scale-95 font-sans"
                          >
                            {ans.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel p-4 flex flex-col gap-4 overflow-y-auto max-h-[580px]" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflowY: 'auto' }}>
                      <div className="text-center border-b border-[#f43f5e]/10 pb-2">
                        <span className="text-xl">📊</span>
                        <h4 className="text-xs font-extrabold text-amber-700 mt-1">TCI 임상 종합 진단 리포트</h4>
                      </div>

                      <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: "자극추구 (NS)", score: tciScores.NS, color: "from-purple-500 to-indigo-500" },
                          { label: "위험회피 (HA)", score: tciScores.HA, color: "from-rose-500 to-red-400" },
                          { label: "사회적 민감성 (RD)", score: tciScores.RD, color: "from-emerald-500 to-teal-400" },
                          { label: "인내성 (PS)", score: tciScores.PS, color: "from-blue-500 to-cyan-400" },
                          { label: "자율성 (SD)", score: tciScores.SD, color: "from-cyan-400 to-sky-400" },
                          { label: "연대감 (CO)", score: tciScores.CO, color: "from-amber-500 to-yellow-400" },
                          { label: "자기초월 (ST)", score: tciScores.ST, color: "from-fuchsia-500 to-pink-500" }
                        ].map((item, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-[10px] mb-0.5 font-medium" style={{ display: 'flex', justifyContents: 'space-between' }}>
                              <span className="text-gray-800">{item.label}</span>
                              <span className="font-bold text-gray-255">{item.score}%</span>
                            </div>
                            <div className="w-full bg-[#1b1731] h-1.5 rounded-full overflow-hidden">
                              <div className={`bg-gradient-to-r ${item.color} h-full transition-all`} style={{ width: `${item.score}%`, height: '100%' }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 임상 연산 데이터 렌더링 */}
                      {(() => {
                        const analysis = getTciStressAndPathology();
                        return (
                          <div className="flex flex-col gap-3.5 border-t border-[#f43f5e]/10 pt-3 text-left" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="bg-purple-950/15 border border-[#f43f5e]/15 p-3 rounded-2xl">
                              <span className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                                ⚡ 나의 스트레스 유발 핵심 상황 (Trigger)
                              </span>
                              <ul className="list-disc list-inside text-[9.5px] text-gray-800 mt-2 flex flex-col gap-1.5 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {analysis.stressTriggers.map((t, idx) => (
                                  <li key={idx} className="leading-relaxed">{t}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-rose-950/15 border border-rose-500/15 p-3 rounded-2xl">
                              <span className="text-[10px] text-rose-700 font-bold flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" /> 기질에 따른 발생 가능한 잠재적 병리 경향
                              </span>
                              <div className="flex flex-col gap-3 mt-2.5 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {analysis.pathologies.map((p, idx) => (
                                  <div key={idx} className="border-b border-[#f43f5e]/10 pb-2 last:border-b-0 last:pb-0">
                                    <span className="text-[9.5px] text-rose-400 font-bold block">🚨 {p.title}</span>
                                    <p className="text-[9px] text-gray-800 leading-relaxed mt-0.5">{p.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <button 
                        onClick={() => setActiveTest(null)}
                        className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all mt-2 active:scale-95"
                      >
                        검사실 퇴장하기
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* HTP 구역 */}
              {activeTest === 'HTP' && (
                <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="flex justify-between items-center pb-2 border-b border-[#f43f5e]/10" style={{ display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}>
                    <button 
                      onClick={() => { setActiveTest(null); setHtpStep('intro'); }} 
                      className="text-xs text-gray-650 hover:text-gray-800 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> 목록
                    </button>
                    <span className="text-xs font-bold text-emerald-700">HTP 실시간 AI 그림검사</span>
                  </div>

                  {htpStep === 'intro' && (
                    <div className="glass-panel p-5 flex flex-col gap-4 text-center" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                      <div className="flex justify-center gap-1 text-2xl animate-bounce">🏠 🌳 👤</div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">HTP 로컬 지능형 판독 (데이터 요금 0원)</h4>
                        <p className="text-[10px] text-gray-650 mt-2 leading-relaxed">
                          손가락 스케치의 붓놀림 횟수와 사용자의 성향 성격 데이터를 교차 분석하여 정밀 힐링 리포트를 합성합니다.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#fdfbf7]/50 p-1.5 rounded-2xl border border-[#f43f5e]/10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <button
                          onClick={() => setHtpInputMode('draw')}
                          className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-content-center gap-1 ${htpInputMode === 'draw' ? 'bg-[#8b5cf6] text-white shadow' : 'text-gray-650'}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Brush className="w-3.5 h-3.5" /> 직접 그리기
                        </button>
                        <button
                          onClick={() => setHtpInputMode('upload')}
                          className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-content-center gap-1 ${htpInputMode === 'upload' ? 'bg-[#8b5cf6] text-white shadow' : 'text-gray-650'}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Upload className="w-3.5 h-3.5" /> 사진 업로드
                        </button>
                      </div>

                      <button 
                        onClick={() => setHtpStep('house')}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        시작하기 ➔
                      </button>
                    </div>
                  )}

                  {(htpStep === 'house' || htpStep === 'tree' || htpStep === 'person') && (
                    <div className="glass-panel p-4 flex flex-col gap-3.5 items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                      <div className="w-full flex justify-between items-center text-xs" style={{ display: 'flex', justifyContents: 'space-between', width: '100%' }}>
                        <span className="font-bold text-emerald-700">
                          {htpStep === 'house' ? "🏠 1. 내면의 가정을 상징하는 [집] 그리기" :
                           htpStep === 'tree' ? "🌳 2. 내적 성장을 상징하는 [나무] 그리기" :
                           "👤 3. 대인 자아를 상징하는 [사람] 그리기"}
                        </span>
                      </div>

                      {htpInputMode === 'draw' && (
                        <>
                          <canvas
                            ref={canvasRef}
                            width={310}
                            height={210}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="bg-[#04010a] border border-[#8b5cf6]/25 rounded-2xl cursor-crosshair touch-none shadow-inner shadow-purple-500/5"
                            style={{ width: '310px', height: '210px', touchAction: 'none' }}
                          />
                          <div className="w-full grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', gap: '12px' }}>
                            <button onClick={clearCanvas} className="py-2 bg-white/5 hover:bg-white/10 text-gray-800 border border-[#f43f5e]/10 rounded-xl text-xs active:scale-95">지우기</button>
                            <button onClick={proceedHtp} disabled={htpDrawnCounts[htpStep] < 5} className="py-2 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95">다음 단계 ➔</button>
                          </div>
                        </>
                      )}

                      {htpInputMode === 'upload' && (
                        <div className="w-full flex flex-col gap-3 items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          {uploadedImages[htpStep] ? (
                            <div className="relative w-[310px] h-[190px] border border-purple-500/30 rounded-2xl overflow-hidden bg-black flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                              <img src={uploadedImages[htpStep]} alt="업로드 이미지" className="max-w-full max-h-full object-contain" />
                              <button 
                                onClick={() => setUploadedImages(prev => ({ ...prev, [htpStep]: null }))}
                                className="absolute top-2 right-2 bg-[#fdfbf7]/60 text-white text-[10px] px-2.5 py-0.5 rounded-lg border border-[#f43f5e]/15"
                              >
                                재업로드
                              </button>
                            </div>
                          ) : (
                            <label className="w-[310px] h-[190px] bg-[#05030b] border-2 border-dashed border-purple-500/25 rounded-2xl flex flex-col items-center justify-content-center cursor-pointer hover:border-purple-500/50 transition-all text-center gap-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContents: 'center', gap: '8px' }}>
                              <ImageIcon className="w-8 h-8 text-purple-700" />
                              <span className="text-[10px] text-gray-650">여기를 클릭하여 '{htpStep}' 그림 사진 등록</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="hidden" 
                                style={{ display: 'none' }}
                              />
                            </label>
                          )}
                          <button 
                            onClick={proceedHtp} 
                            disabled={!uploadedImages[htpStep]} 
                            className={`w-full py-2.5 text-white rounded-xl text-xs font-bold transition-all active:scale-95 ${!uploadedImages[htpStep] ? 'bg-gray-700 opacity-40 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                          >
                            {htpStep === 'person' ? "그림 분석 요청 ➔" : "다음 단계 ➔"}
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                  {htpStep === 'analyzing' && (
                    <div className="glass-panel p-8 text-center flex flex-col gap-4 items-center justify-center min-h-[300px] relative overflow-hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContents: 'center', minHeight: '300px' }}>
                      <div className="scan-line" />
                      <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" style={{ borderWidth: '4px', borderTopColor: '#34d399', borderRadius: '50%', width: '40px', height: '40px' }} />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 mt-2">
                          로컬 성향-필압 매칭 디코드 중...
                        </h4>
                        <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest block mt-2 animate-pulse">{aiScanStatusText}</p>
                      </div>
                    </div>
                  )}

                  {htpStep === 'result' && (
                    <div className="glass-panel p-5 flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                      <div className="text-center">
                        <span className="text-xl animate-bounce">💎</span>
                        <h4 className="text-xs font-extrabold text-emerald-700 mt-1">HTP 지능형 분석 리포트 (0원 서비스)</h4>
                      </div>

                      <div className="flex flex-col gap-3 text-left border-y border-[#f43f5e]/10 py-3 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="border-b border-[#f43f5e]/10 pb-2.5">
                          <span className="text-[10px] text-purple-700 font-bold block">[1. 집 - 가정/자아 보호막]</span>
                          <p className="text-[10.5px] text-gray-800 leading-relaxed mt-1">{htpResultText.house}</p>
                        </div>
                        <div className="border-b border-[#f43f5e]/10 pb-2.5">
                          <span className="text-[10px] text-emerald-700 font-bold block">[2. 나무 - 의지/자아 성장]</span>
                          <p className="text-[10.5px] text-gray-255 leading-relaxed mt-1">{htpResultText.tree}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-700 font-bold block">[3. 사람 - 페르소나/사회화]</span>
                          <p className="text-[10.5px] text-gray-800 leading-relaxed mt-1">{htpResultText.person}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => { setActiveTest(null); setHtpStep('intro'); }}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        검사실 퇴장하기
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )
        )}

        {/* 탭 E: 내 페르소나 명함 */}
        {selectedTab === "profile" && (
          !viewedGuides.profile ? (
            renderTabGuideCard("profile")
          ) : (
            <div className="px-5 py-4 flex flex-col gap-5 text-left font-sans animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="flex justify-between items-center pb-2 border-b border-[#f43f5e]/10" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="text-left">
                  <span className="text-[9.5px] text-purple-700 font-bold uppercase tracking-widest">퍼스널 브랜딩 카드</span>
                  <h3 className="font-extrabold text-sm text-gray-850 mt-1">📇 나의 페르소나 명함</h3>
                </div>
                <button onClick={() => triggerGuideAgain("profile")} className="text-gray-650 hover:text-purple-700 transition-all p-1" title="도움말 다시보기">
                  <HelpCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* 💳 실물 마음 신분증 카드 영역 */}
              <div 
                className="capture-area bg-gradient-to-br from-[#fff7f0] to-[#f9f3ff] p-5 rounded-[32px] border-2 border-rose-500/10 shadow-lg relative flex flex-col justify-between min-h-[260px] overflow-hidden" 
                style={{ 
                  boxShadow: '0 12px 32px rgba(244, 63, 94, 0.05)',
                  border: '2px solid rgba(244, 63, 94, 0.1)'
                }}
              >
                {/* 신분증 상단 데코 */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

                {/* 헤더 부분 */}
                <div className="flex justify-between items-center pb-2 border-b border-rose-500/10" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-[10px] bg-rose-500/10 text-rose-500 font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                    마음 신분증 (MindID)
                  </span>
                  <span className="text-[9px] text-gray-650 font-bold">발급 NO: MH-8BIT-001</span>
                </div>

                {/* 프로필 이미지 & 기본 인적사항 메인 바디 */}
                <div className="flex gap-4 items-center my-3 text-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* 도트 증명사진 구역 (클릭 시 사진 업로드) */}
                  <label 
                    htmlFor="profile-pic-input" 
                    className="w-16 h-16 rounded-[20px] bg-[#fdfbf7] border border-rose-500/15 flex items-center justify-center text-3xl shadow-inner relative overflow-hidden cursor-pointer group shrink-0" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="클릭하여 내 사진 업로드"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-purple-500/5 pointer-events-none" />
                    
                    {userProfilePic ? (
                      <img src={userProfilePic} alt="프로필 사진" className="w-full h-full object-cover" />
                    ) : (
                      gemstone.emoji
                    )}

                    {/* 사진 업로드 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[8px] text-white font-extrabold" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span>📷</span>
                      <span>업로드</span>
                    </div>
                  </label>
                  <input 
                    type="file" 
                    id="profile-pic-input" 
                    accept="image/*" 
                    onChange={handleProfilePicUpload} 
                    className="hidden" 
                  />

                  <div className="flex-1" style={{ flex: 1 }}>
                    <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="text-[9.5px] text-purple-700 font-extrabold">이름:</span>
                      <span className="text-[11px] font-extrabold text-gray-800">{userName || "홍길동"} ({userAge || "20"}세)</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="text-[9.5px] text-purple-700 font-extrabold">성향분류:</span>
                      <span className="text-[10.5px] font-bold text-gray-700">{personaType.replace(" (정밀 임상 대조)", "")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="text-[9.5px] text-purple-700 font-extrabold">마음상태:</span>
                      <span className={`text-[10.5px] font-extrabold ${selfGap <= 25 ? 'text-emerald-600' : selfGap <= 50 ? 'text-yellow-600' : 'text-rose-600'}`}>
                        {selfGap <= 25 ? '매우 맑음 ☀️' : selfGap <= 50 ? '보통/양호 ⛅' : '돌봄필요 🌧️'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="text-[9.5px] text-purple-700 font-extrabold">등급/랭크:</span>
                      <span className="text-[9.5px] text-gray-600 font-bold">{gemstone.name} (Lvl {gemstone.level})</span>
                    </div>
                  </div>
                </div>

                {/* 3대 소통 스탯 수치 게이지 바 */}
                <div className="border-t border-rose-500/10 pt-3 flex flex-col gap-2 text-left" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* 자아 일치율 */}
                  <div className="flex justify-between items-center text-[10.5px]" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-gray-500 font-medium">자아 일치율 (Congruence)</span>
                    <span className="text-rose-500 font-extrabold">{(100 - selfGap)}%</span>
                  </div>

                  {/* 3대 스탯 게이지 */}
                  <div className="grid grid-cols-3 gap-2 mt-0.5" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div>
                      <div className="flex justify-between text-[8.5px] font-bold text-purple-700 mb-0.5" style={{ display: 'flex', justifyContents: 'space-between' }}>
                        <span>정서개방</span>
                        <span>{stats.charm}</span>
                      </div>
                      <div className="w-full bg-[#1b1731]/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full" style={{ width: `${stats.charm}%`, height: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[8.5px] font-bold text-rose-400 mb-0.5" style={{ display: 'flex', justifyContents: 'space-between' }}>
                        <span>회복탄력</span>
                        <span>{stats.calm}</span>
                      </div>
                      <div className="w-full bg-[#1b1731]/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-rose-450 h-full" style={{ width: `${stats.calm}%`, height: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[8.5px] font-bold text-indigo-400 mb-0.5" style={{ display: 'flex', justifyContents: 'space-between' }}>
                        <span>관계주도</span>
                        <span>{stats.charisma}</span>
                      </div>
                      <div className="w-full bg-[#1b1731]/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full" style={{ width: `${stats.charisma}%`, height: '100%' }} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* 신분증 하단 실존 문구 */}
                <div className="mt-3.5 pt-2.5 border-t border-dashed border-rose-500/10 text-center flex justify-between items-center text-[9px] text-gray-650" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-bold text-purple-700/80">Ego Health Certify</span>
                  <span className="italic font-medium text-rose-500/80">"나를 안아주고, 타인을 상냥히 포용하다"</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setNotification({
                    type: 'success',
                    title: '명함 공유 완료!',
                    message: '나만의 매력 페르소나 명함을 성공적으로 클립보드에 복사 및 자랑했습니다!'
                  });
                }}
                className="py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10 active:scale-95"
                style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', gap: '6px' }}
              >
                <Share2 className="w-3.5 h-3.5" />
                나의 매력 명함 SNS 자랑하기 (무료오픈)
              </button>

              {/* 💾 데이터 백업/복원 글래스 패널 */}
              <div className="bg-white/80/40 p-4 rounded-3xl border border-[#f43f5e]/10 text-left flex flex-col gap-2.5 mt-2 backdrop-blur-md">
                <span className="text-[10px] text-purple-700 font-bold block">💾 기기 변경 대비 백업 및 복원</span>
                <p className="text-[9.5px] text-gray-650 leading-relaxed">
                  로그인 서버 없이도 성찰 이력 파일(.json)을 직접 컴퓨터/휴대폰에 다운로드하고 가져와 100% 복구할 수 있는 로컬 최적화 백업입니다.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    onClick={handleExportData}
                    className="py-2 px-3.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-700 border border-[#f43f5e]/20 rounded-xl text-[10px] font-bold flex items-center justify-content-center gap-1 active:scale-95"
                    style={{ display: 'flex', alignItems: 'center', justifyContents: 'center' }}
                  >
                    <Download className="w-3.5 h-3.5" /> 백업하기
                  </button>
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="py-2 px-3.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-700 border border-emerald-500/20 rounded-xl text-[10px] font-bold flex items-center justify-content-center gap-1 active:scale-95"
                    style={{ display: 'flex', alignItems: 'center', justifyContents: 'center' }}
                  >
                    <FolderOpen className="w-3.5 h-3.5" /> 복원하기
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportData} 
                  accept=".json" 
                  className="hidden" 
                  style={{ display: 'none' }}
                />
              </div>

            </div>
          )
        )}

      </div>

      {/* Bottom Navigation */}
      {/* Bottom Navigation */}
      <div className="bg-white/90 border-t border-[#f43f5e]/10 grid grid-cols-4 py-3 text-center text-[10px] font-bold" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px 0' }}>
        <button 
          onClick={() => { setSelectedTab("home"); setActiveTest(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${selectedTab === 'home' ? 'text-rose-500 scale-105' : 'text-gray-650 hover:text-rose-700/70'}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
        >
          <Compass className="w-5 h-5" />
          <span>성찰/처방</span>
        </button>
        <button 
          onClick={() => { setSelectedTab("special_test"); }}
          className={`flex flex-col items-center gap-1 transition-all ${selectedTab === 'special_test' ? 'text-rose-500 scale-105' : 'text-gray-650 hover:text-rose-700/70'}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
        >
          <Brain className="w-5 h-5" />
          <span>심리검사</span>
        </button>
        <button 
          onClick={() => { setSelectedTab("chat"); setActiveTest(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${selectedTab === 'chat' ? 'text-rose-500 scale-105' : 'text-gray-650 hover:text-rose-700/70'}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
        >
          <MessageSquare className="w-5 h-5" />
          <span>대화훈련</span>
        </button>
        <button 
          onClick={() => { setSelectedTab("profile"); setActiveTest(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${selectedTab === 'profile' ? 'text-rose-500 scale-105' : 'text-gray-650 hover:text-rose-700/70'}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
        >
          <User className="w-5 h-5" />
          <span>내명함</span>
        </button>
      </div>

      {/* 데모 하단 제어 */}
      <div className="bg-[#fdfbf7] p-3 border-t border-[#f43f5e]/10 grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px' }}>
        <button 
          onClick={triggerFailureDemo}
          className="py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 rounded-xl text-[9px] font-semibold flex items-center justify-center gap-1 transition-all"
          style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.2)' }}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          미션 실패 상황 연출 (처벌)
        </button>
        <button 
          onClick={() => {
            setStreak(5);
            setIsStreakBroken(false);
            setStats({ charm: 40, calm: 30, charisma: 25 });
            setActiveMissions([]);
            setMissionUsageCount(0);
            setCurrentIdx(0);
            setHasCompletedInitialTest(false);
            setDiagStep(0);
            setAnswersMap({ q1: null, q2: null, q3: null, q4: null, q5: null, q6: null });
            setShowDiagBranch(false);
            setShowFinalDiagResult(false);
            setSelectedTab("home");
            setAnomalyLogs({ personalization: 2, displacement: 1, rationalization: 3, overgeneralization: 1 });
            setChatScenarioActive(false);
            setSelectedScenario(null);
            setChatMessages([]);
            setChatCompleted(false);
            setChatCategoryFilter("all");
            setCustomUserSituation("");
            setActiveTest(null);
            setTciStep(0);
            setTciScores({ NS: 0, HA: 0, RD: 0, PS: 0, SD: 0, CO: 0, ST: 0 });
            setTciAnswersAcc({ NS:0, HA:0, RD:0, PS:0, SD:0, CO:0, ST:0 });
            setHtpStep('intro');
            setHtpInputMode('draw');
            setUploadedImages({ house: null, tree: null, person: null });
            setUploadedBase64({ house: null, tree: null, person: null });
            setHtpDrawnCounts({ house: 0, tree: 0, person: 0 });
            setHtpResultText({ house: '', tree: '', person: '' });
            setShowLevelUpModal(false);
            setPrevGemLevel("Lvl 1");
            setStreakCalendar([
              { day: '월', status: 'completed' },
              { day: '화', status: 'completed' },
              { day: '수', status: 'completed' },
              { day: '목', status: 'completed' },
              { day: '금', status: 'completed' },
              { day: '토', status: 'pending' },
              { day: '일', status: 'pending' }
            ]);
            setStreakFreezeCount(1);
            setShowStreakModal(false);
            setViewedGuides({
              home: false,
              chat: false,
              analytics: false,
              special_test: false,
              profile: false
            });
            setNotification({
              type: 'success',
              title: '초기화 완료',
              message: '처음 성향 진단부터 다시 체험하실 수 있도록 모든 데이터를 초기화했습니다.'
            });
          }}
          className="py-2.5 px-3 bg-purple-600/20 hover:bg-purple-700 text-purple-700 border border-[#f43f5e]/20 rounded-xl text-[9px] font-semibold flex items-center justify-center gap-1 transition-all"
          style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', borderColor: 'rgba(139, 92, 246, 0.2)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          처음 진단부터 재실행 (Reset)
        </button>
      </div>

      {/* 🔑 Gemini AI API Key 설정 모달 */}
      {showApiKeyModal && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-55 flex items-center justify-center p-6" style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 120 }}>
          <div className="glass-panel p-5 w-full text-left flex flex-col gap-4 border border-purple-500/30" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
            <div>
              <div className="flex items-center gap-1 text-purple-700 font-extrabold text-[11px] uppercase tracking-widest">
                <Settings className="w-4 h-4 text-purple-700" />
                <span>Gemini API Key Setting</span>
              </div>
              <p className="text-[10px] text-gray-650 mt-2.5 leading-relaxed">
                나만의 Google AI Studio 무료 API Key를 입력하세요. 키를 등록하면 로컬 연산이 아닌 진짜 Gemini 1.5 Flash 인공지능 분석이 100% 무료로 가동됩니다!
              </p>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[9.5px] text-purple-700 font-bold underline mt-1.5 inline-block hover:text-purple-700"
              >
                🔗 10초만에 내 무료 API Key 발급받기 ➔
              </a>
            </div>

            <div className="flex flex-col gap-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="text-[9px] text-gray-550 font-bold">API KEY 입력</span>
              <input 
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKeyInput}
                onChange={(e) => setTempApiKeyInput(e.target.value)}
                className="bg-black/50 border border-purple-500/25 rounded-xl p-3 text-xs text-purple-700 outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="flex flex-col gap-2 mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => handleSaveApiKey(tempApiKeyInput)}
                className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold active:scale-95"
              >
                무료 AI 연동 활성화
              </button>
              {userApiKey && (
                <button 
                  onClick={handleClearApiKey}
                  className="py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold active:scale-95"
                >
                  등록된 API Key 삭제 (로컬 전환)
                </button>
              )}
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="py-2 text-[10px] text-gray-500 hover:text-gray-650 font-bold text-center"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
