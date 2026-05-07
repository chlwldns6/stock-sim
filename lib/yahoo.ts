export interface StockPrice {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
}

export const STOCKS = [
  // ===== KOSPI (코스피) =====

  // 반도체 / 전자부품
  { ticker: '005930.KS', name: '삼성전자',           sector: '반도체' },
  { ticker: '000660.KS', name: 'SK하이닉스',         sector: '반도체' },
  { ticker: '042700.KS', name: '한미반도체',          sector: '반도체' },
  { ticker: '009150.KS', name: '삼성전기',            sector: '반도체' },
  { ticker: '357780.KS', name: '솔브레인',            sector: '반도체' },
  { ticker: '278280.KS', name: '천보',               sector: '반도체' },
  { ticker: '240810.KS', name: '원익IPS',            sector: '반도체' },
  { ticker: '058470.KS', name: '리노공업',            sector: '반도체' },
  { ticker: '263720.KS', name: '디엔에프',            sector: '반도체' },
  { ticker: '093370.KS', name: '후성',               sector: '반도체' },
  { ticker: '033240.KS', name: '자화전자',            sector: '전자' },
  { ticker: '066570.KS', name: 'LG전자',             sector: '전자' },
  { ticker: '034220.KS', name: 'LG디스플레이',        sector: '전자' },
  { ticker: '011070.KS', name: 'LG이노텍',           sector: '전자' },
  { ticker: '018260.KS', name: '삼성SDS',            sector: 'IT' },
  { ticker: '010140.KS', name: '삼성중공업',          sector: '조선' },

  // IT / 플랫폼 / 소프트웨어
  { ticker: '035420.KS', name: 'NAVER',             sector: 'IT' },
  { ticker: '035720.KS', name: '카카오',              sector: 'IT' },
  { ticker: '035760.KS', name: 'CJ올리브네트웍스',    sector: 'IT' },
  { ticker: '030000.KS', name: '제일기획',            sector: 'IT' },
  { ticker: '053210.KS', name: 'KT스카이라이프',      sector: 'IT' },

  // 게임
  { ticker: '036570.KS', name: 'NC소프트',           sector: '게임' },
  { ticker: '251270.KS', name: '넷마블',              sector: '게임' },
  { ticker: '259960.KS', name: '크래프톤',            sector: '게임' },
  { ticker: '263750.KS', name: '펄어비스',            sector: '게임' },
  { ticker: '293490.KS', name: '카카오게임즈',         sector: '게임' },
  { ticker: '112040.KS', name: '위메이드',            sector: '게임' },

  // 엔터 / 미디어
  { ticker: '041510.KS', name: '에스엠',              sector: '엔터' },
  { ticker: '352820.KS', name: '하이브',              sector: '엔터' },
  { ticker: '035900.KS', name: 'JYP엔터',            sector: '엔터' },
  { ticker: '051500.KS', name: 'CJ ENM',            sector: '엔터' },
  { ticker: '079160.KS', name: 'CJ CGV',            sector: '엔터' },
  { ticker: '034120.KS', name: 'SBS',               sector: '엔터' },

  // 자동차 / 부품
  { ticker: '005380.KS', name: '현대차',              sector: '자동차' },
  { ticker: '000270.KS', name: '기아',               sector: '자동차' },
  { ticker: '012330.KS', name: '현대모비스',           sector: '자동차' },
  { ticker: '011210.KS', name: '현대위아',            sector: '자동차' },
  { ticker: '018880.KS', name: '한온시스템',           sector: '자동차' },
  { ticker: '204320.KS', name: '만도',               sector: '자동차' },
  { ticker: '161390.KS', name: '한국타이어앤테크놀로지', sector: '자동차' },
  { ticker: '064350.KS', name: '현대로템',            sector: '자동차' },
  { ticker: '086280.KS', name: '현대글로비스',         sector: '자동차' },
  { ticker: '005440.KS', name: '현대지에프홀딩스',     sector: '자동차' },
  { ticker: '000240.KS', name: '한국타이어앤테크',     sector: '자동차' },
  { ticker: '002350.KS', name: '넥센',               sector: '자동차' },

  // 항공 / 운송 / 물류
  { ticker: '003490.KS', name: '대한항공',            sector: '항공' },
  { ticker: '020560.KS', name: '아시아나항공',         sector: '항공' },
  { ticker: '180640.KS', name: '한진칼',              sector: '항공' },
  { ticker: '011200.KS', name: 'HMM',               sector: '해운' },
  { ticker: '000120.KS', name: 'CJ대한통운',          sector: '물류' },

  // 바이오 / 제약
  { ticker: '068270.KS', name: '셀트리온',            sector: '바이오' },
  { ticker: '207940.KS', name: '삼성바이오로직스',     sector: '바이오' },
  { ticker: '128940.KS', name: '한미약품',            sector: '바이오' },
  { ticker: '000100.KS', name: '유한양행',            sector: '바이오' },
  { ticker: '326030.KS', name: 'SK바이오팜',          sector: '바이오' },
  { ticker: '145020.KS', name: '휴젤',               sector: '바이오' },
  { ticker: '196170.KS', name: '알테오젠',            sector: '바이오' },
  { ticker: '000020.KS', name: '동화약품',            sector: '바이오' },
  { ticker: '185750.KS', name: '종근당',              sector: '바이오' },
  { ticker: '003850.KS', name: '보령',               sector: '바이오' },
  { ticker: '009420.KS', name: '한올바이오파마',       sector: '바이오' },
  { ticker: '402340.KS', name: 'SK바이오사이언스',     sector: '바이오' },
  { ticker: '068760.KS', name: '셀트리온제약',         sector: '바이오' },
  { ticker: '069620.KS', name: '대웅제약',            sector: '바이오' },
  { ticker: '003090.KS', name: '대웅',               sector: '바이오' },
  { ticker: '007570.KS', name: '일양약품',            sector: '바이오' },
  { ticker: '041960.KS', name: '코미팜',              sector: '바이오' },
  { ticker: '041830.KS', name: '인바디',              sector: '바이오' },
  { ticker: '216410.KS', name: '부광약품',            sector: '바이오' },
  { ticker: '005250.KS', name: '녹십자홀딩스',         sector: '바이오' },

  // 에너지 / 정유
  { ticker: '096770.KS', name: 'SK이노베이션',        sector: '에너지' },
  { ticker: '010950.KS', name: 'S-Oil',             sector: '에너지' },
  { ticker: '010060.KS', name: 'OCI홀딩스',          sector: '에너지' },
  { ticker: '034020.KS', name: '두산에너빌리티',       sector: '에너지' },
  { ticker: '015760.KS', name: '한국전력',            sector: '에너지' },
  { ticker: '051600.KS', name: '한전KPS',            sector: '에너지' },
  { ticker: '336260.KS', name: '두산퓨얼셀',          sector: '에너지' },
  { ticker: '001430.KS', name: 'SK가스',             sector: '에너지' },

  // 2차전지 / 배터리
  { ticker: '373220.KS', name: 'LG에너지솔루션',      sector: '2차전지' },
  { ticker: '051910.KS', name: 'LG화학',             sector: '2차전지' },
  { ticker: '006400.KS', name: '삼성SDI',            sector: '2차전지' },
  { ticker: '086520.KS', name: '에코프로',            sector: '2차전지' },
  { ticker: '247540.KS', name: '에코프로비엠',         sector: '2차전지' },
  { ticker: '066970.KS', name: 'L&F',               sector: '2차전지' },
  { ticker: '003670.KS', name: '포스코퓨처엠',         sector: '2차전지' },

  // 화학 / 소재
  { ticker: '011170.KS', name: '롯데케미칼',           sector: '화학' },
  { ticker: '011780.KS', name: '금호석유화학',          sector: '화학' },
  { ticker: '004000.KS', name: '롯데정밀화학',          sector: '화학' },
  { ticker: '003600.KS', name: 'SK케미칼',             sector: '화학' },
  { ticker: '298020.KS', name: '효성티앤씨',            sector: '화학' },
  { ticker: '298050.KS', name: '효성첨단소재',           sector: '소재' },
  { ticker: '120110.KS', name: '코오롱인더',            sector: '소재' },
  { ticker: '002380.KS', name: 'KCC',                 sector: '소재' },
  { ticker: '006650.KS', name: '대한유화',              sector: '화학' },
  { ticker: '025000.KS', name: 'KPX케미칼',            sector: '화학' },
  { ticker: '006380.KS', name: '카프로',               sector: '화학' },
  { ticker: '023150.KS', name: 'MH에탄올',             sector: '화학' },
  { ticker: '006110.KS', name: '삼아알미늄',            sector: '소재' },

  // 전력 / 전기장비
  { ticker: '267260.KS', name: 'HD현대일렉트릭',       sector: '전력' },
  { ticker: '010120.KS', name: 'LS일렉트릭',          sector: '전력' },
  { ticker: '298040.KS', name: '효성중공업',            sector: '전력' },
  { ticker: '006260.KS', name: 'LS',                 sector: '전력' },

  // 금융 / 은행
  { ticker: '105560.KS', name: 'KB금융',              sector: '금융' },
  { ticker: '055550.KS', name: '신한지주',             sector: '금융' },
  { ticker: '086790.KS', name: '하나금융지주',          sector: '금융' },
  { ticker: '316140.KS', name: '우리금융지주',          sector: '금융' },
  { ticker: '139130.KS', name: 'DGB금융지주',          sector: '금융' },
  { ticker: '175330.KS', name: 'JB금융지주',           sector: '금융' },
  { ticker: '138930.KS', name: 'BNK금융지주',          sector: '금융' },
  { ticker: '024110.KS', name: '기업은행',             sector: '금융' },
  { ticker: '323410.KS', name: '카카오뱅크',           sector: '금융' },

  // 보험
  { ticker: '000810.KS', name: '삼성화재',             sector: '보험' },
  { ticker: '032830.KS', name: '삼성생명',             sector: '보험' },
  { ticker: '088350.KS', name: '한화생명',             sector: '보험' },
  { ticker: '082640.KS', name: '동양생명',             sector: '보험' },
  { ticker: '000060.KS', name: '메리츠화재',           sector: '보험' },
  { ticker: '138040.KS', name: '메리츠금융지주',        sector: '보험' },
  { ticker: '000400.KS', name: '롯데손해보험',          sector: '보험' },

  // 증권
  { ticker: '071050.KS', name: '한국금융지주',         sector: '증권' },
  { ticker: '016360.KS', name: '삼성증권',             sector: '증권' },
  { ticker: '006800.KS', name: '미래에셋증권',          sector: '증권' },
  { ticker: '039490.KS', name: '키움증권',             sector: '증권' },
  { ticker: '030610.KS', name: '교보증권',             sector: '증권' },
  { ticker: '003540.KS', name: '대신증권',             sector: '증권' },
  { ticker: '001720.KS', name: '신영증권',             sector: '증권' },
  { ticker: '001270.KS', name: '부국증권',             sector: '증권' },
  { ticker: '056080.KS', name: '유진투자증권',          sector: '증권' },
  { ticker: '001500.KS', name: '현대차증권',           sector: '증권' },
  { ticker: '377300.KS', name: '카카오페이',           sector: '증권' },

  // 소비재 / 유통 / 식품
  { ticker: '028260.KS', name: '삼성물산',             sector: '소비재' },
  { ticker: '033780.KS', name: 'KT&G',               sector: '소비재' },
  { ticker: '000080.KS', name: '하이트진로',            sector: '소비재' },
  { ticker: '097950.KS', name: 'CJ제일제당',           sector: '소비재' },
  { ticker: '139480.KS', name: '이마트',               sector: '소비재' },
  { ticker: '004370.KS', name: '농심',                sector: '소비재' },
  { ticker: '007070.KS', name: 'GS리테일',             sector: '소비재' },
  { ticker: '023530.KS', name: '롯데쇼핑',             sector: '소비재' },
  { ticker: '271560.KS', name: '오리온',               sector: '소비재' },
  { ticker: '282330.KS', name: 'BGF리테일',            sector: '소비재' },
  { ticker: '069960.KS', name: '현대백화점',            sector: '소비재' },
  { ticker: '051900.KS', name: 'LG생활건강',           sector: '소비재' },
  { ticker: '090430.KS', name: '아모레퍼시픽',          sector: '소비재' },
  { ticker: '002790.KS', name: '아모레G',              sector: '소비재' },
  { ticker: '004170.KS', name: '신세계',               sector: '소비재' },
  { ticker: '057050.KS', name: '현대홈쇼핑',           sector: '소비재' },
  { ticker: '093050.KS', name: 'LF',                 sector: '소비재' },
  { ticker: '001680.KS', name: '대상',                sector: '소비재' },
  { ticker: '005300.KS', name: '롯데칠성',             sector: '소비재' },
  { ticker: '007310.KS', name: '오뚜기',               sector: '소비재' },
  { ticker: '008770.KS', name: '호텔신라',             sector: '소비재' },
  { ticker: '035250.KS', name: '강원랜드',             sector: '소비재' },
  { ticker: '039130.KS', name: '하나투어',             sector: '소비재' },
  { ticker: '007160.KS', name: '사조산업',             sector: '소비재' },
  { ticker: '001040.KS', name: 'CJ',                 sector: '소비재' },
  { ticker: '383220.KS', name: 'F&F',                sector: '소비재' },
  { ticker: '293780.KS', name: '신세계인터내셔날',       sector: '소비재' },
  { ticker: '009240.KS', name: '한샘',                sector: '소비재' },
  { ticker: '021240.KS', name: '코웨이',               sector: '소비재' },
  { ticker: '004450.KS', name: '삼화왕관',             sector: '소비재' },

  // 통신
  { ticker: '030200.KS', name: 'KT',                 sector: '통신' },
  { ticker: '017670.KS', name: 'SK텔레콤',            sector: '통신' },
  { ticker: '032640.KS', name: 'LG유플러스',           sector: '통신' },

  // 건설 / 부동산
  { ticker: '000720.KS', name: '현대건설',             sector: '건설' },
  { ticker: '006360.KS', name: 'GS건설',              sector: '건설' },
  { ticker: '047040.KS', name: '대우건설',             sector: '건설' },
  { ticker: '012630.KS', name: 'HDC',                sector: '건설' },
  { ticker: '028050.KS', name: '삼성엔지니어링',        sector: '건설' },
  { ticker: '375500.KS', name: 'DL이앤씨',            sector: '건설' },
  { ticker: '000210.KS', name: 'DL',                 sector: '건설' },
  { ticker: '060980.KS', name: '한라홀딩스',           sector: '건설' },
  { ticker: '241560.KS', name: '두산밥캣',            sector: '건설' },
  { ticker: '001260.KS', name: '남광토건',             sector: '건설' },
  { ticker: '002820.KS', name: '삼환기업',             sector: '건설' },
  { ticker: '009830.KS', name: '한화솔루션',           sector: '건설' },

  // 조선 / 중공업
  { ticker: '009540.KS', name: 'HD한국조선해양',       sector: '조선' },
  { ticker: '042660.KS', name: 'HD현대중공업',         sector: '조선' },

  // 철강 / 금속
  { ticker: '005490.KS', name: 'POSCO홀딩스',         sector: '철강' },
  { ticker: '004020.KS', name: '현대제철',             sector: '철강' },
  { ticker: '010130.KS', name: '고려아연',             sector: '철강' },
  { ticker: '000670.KS', name: '영풍',                sector: '철강' },
  { ticker: '047050.KS', name: '포스코인터내셔널',      sector: '철강' },
  { ticker: '016380.KS', name: 'KG스틸',              sector: '철강' },
  { ticker: '025820.KS', name: '이구산업',             sector: '철강' },

  // 방산 / 우주
  { ticker: '012450.KS', name: '한화에어로스페이스',    sector: '방산' },
  { ticker: '000880.KS', name: '한화',                sector: '방산' },
  { ticker: '047810.KS', name: '한국항공우주',          sector: '방산' },
  { ticker: '272210.KS', name: '한화시스템',           sector: '방산' },
  { ticker: '005870.KS', name: '휴니드',               sector: '방산' },

  // 지주 / 대기업
  { ticker: '003550.KS', name: 'LG',                 sector: '지주' },
  { ticker: '034730.KS', name: 'SK',                 sector: '지주' },
  { ticker: '078930.KS', name: 'GS',                 sector: '지주' },
  { ticker: '000150.KS', name: '두산',                sector: '지주' },
  { ticker: '001740.KS', name: 'SK네트웍스',          sector: '지주' },
  { ticker: '004800.KS', name: '효성',                sector: '지주' },
  { ticker: '023590.KS', name: '다우기술',             sector: '지주' },
  { ticker: '005710.KS', name: 'SK디스커버리',         sector: '지주' },
  { ticker: '010780.KS', name: 'IS동서',              sector: '지주' },

  // 추가 KOSPI 종목
  { ticker: '079550.KS', name: 'LIG넥스원',          sector: '방산' },
  { ticker: '005940.KS', name: 'NH투자증권',          sector: '증권' },
  { ticker: '003690.KS', name: '코리안리',            sector: '보험' },
  { ticker: '049770.KS', name: '동원F&B',            sector: '소비재' },
  { ticker: '006040.KS', name: '동원산업',            sector: '소비재' },
  { ticker: '073240.KS', name: '금호타이어',          sector: '자동차' },
  { ticker: '000990.KS', name: 'DB하이텍',           sector: '반도체' },
  { ticker: '085810.KS', name: '이노션',              sector: 'IT' },
  { ticker: '020000.KS', name: '한섬',               sector: '소비재' },
  { ticker: '016610.KS', name: 'DB금융투자',         sector: '증권' },
  { ticker: '004940.KS', name: '한독',               sector: '바이오' },
  { ticker: '017800.KS', name: '현대엘리베이터',       sector: '건설' },
  { ticker: '024720.KS', name: '한국콜마',            sector: '소비재' },
  { ticker: '011760.KS', name: '현대코퍼레이션홀딩스', sector: '지주' },
  { ticker: '003300.KS', name: '한일시멘트',          sector: '건설' },
  { ticker: '003570.KS', name: 'SNT다이내믹스',       sector: '방산' },
  { ticker: '004490.KS', name: '세방전지',            sector: '자동차' },
  { ticker: '014830.KS', name: '유니드',              sector: '화학' },
  { ticker: '003410.KS', name: '쌍용C&E',            sector: '건설' },
  { ticker: '030190.KS', name: 'NICE평가정보',        sector: 'IT' },
  { ticker: '012510.KS', name: '더존비즈온',          sector: 'IT' },
  { ticker: '036460.KS', name: '한국가스공사',         sector: '에너지' },
  { ticker: '071320.KS', name: '한국지역난방공사',     sector: '에너지' },
  { ticker: '005430.KS', name: '한국공항',            sector: '항공' },
  { ticker: '025530.KS', name: 'SBS미디어홀딩스',     sector: '엔터' },
  { ticker: '060900.KS', name: '카카오인프라',         sector: 'IT' },
  { ticker: '161890.KS', name: '한국콜마홀딩스',       sector: '소비재' },
  { ticker: '000320.KS', name: '노루홀딩스',          sector: '소재' },
  { ticker: '001780.KS', name: '알루코',              sector: '소재' },
  { ticker: '009070.KS', name: '조선내화',            sector: '소재' },
  { ticker: '000885.KS', name: '한화우',              sector: '방산' },
  { ticker: '002460.KS', name: '화성산업',            sector: '건설' },
  { ticker: '003280.KS', name: '흥아해운',            sector: '해운' },
  { ticker: '019870.KS', name: '삼호',               sector: '건설' },
  { ticker: '192650.KS', name: 'KG이니시스',          sector: 'IT' },
  { ticker: '029780.KS', name: '삼성카드',            sector: '금융' },

  // ===== KOSDAQ (코스닥) =====

  // 반도체 / 장비 / 소재
  { ticker: '095340.KQ', name: 'ISC',                sector: '반도체' },
  { ticker: '403870.KQ', name: 'HPSP',               sector: '반도체' },
  { ticker: '348210.KQ', name: '넥스틴',              sector: '반도체' },
  { ticker: '064760.KQ', name: '티씨케이',             sector: '반도체' },
  { ticker: '056190.KQ', name: '에스에프에이',          sector: '반도체' },
  { ticker: '036930.KQ', name: '주성엔지니어링',        sector: '반도체' },
  { ticker: '089030.KQ', name: '테크윙',               sector: '반도체' },
  { ticker: '183300.KQ', name: '코미코',               sector: '반도체' },
  { ticker: '108320.KQ', name: '실리콘웍스',           sector: '반도체' },
  { ticker: '091700.KQ', name: '파트론',               sector: '반도체' },
  { ticker: '122990.KQ', name: '와이솔',               sector: '반도체' },
  { ticker: '090460.KQ', name: '비에이치',             sector: '반도체' },
  { ticker: '353200.KQ', name: '대덕전자',             sector: '반도체' },
  { ticker: '014680.KQ', name: '한솔케미칼',           sector: '반도체' },
  { ticker: '140860.KQ', name: '파크시스템스',          sector: '반도체' },
  { ticker: '039030.KQ', name: '이오테크닉스',          sector: '반도체' },
  { ticker: '058970.KQ', name: '엠플러스',             sector: '반도체' },
  { ticker: '086390.KQ', name: '유니테스트',           sector: '반도체' },
  { ticker: '033160.KQ', name: '엠씨넥스',             sector: '반도체' },
  { ticker: '101490.KQ', name: 'S&T모티브',           sector: '반도체' },
  { ticker: '222080.KQ', name: '씨아이에스',           sector: '반도체' },
  { ticker: '240320.KQ', name: '솔트룩스',             sector: '반도체' },
  { ticker: '049800.KQ', name: '에이스테크',           sector: '반도체' },
  { ticker: '083930.KQ', name: '아바코',               sector: '반도체' },
  { ticker: '036830.KQ', name: '솔브레인홀딩스',        sector: '반도체' },
  { ticker: '101160.KQ', name: '월덱스',               sector: '반도체' },

  // IT / 소프트웨어
  { ticker: '060250.KQ', name: 'NHN',                sector: 'IT' },
  { ticker: '376080.KQ', name: '원티드랩',             sector: 'IT' },
  { ticker: '035080.KQ', name: '인터파크',             sector: 'IT' },
  { ticker: '036680.KQ', name: '에프앤가이드',          sector: 'IT' },
  { ticker: '119850.KQ', name: '지어소프트',           sector: 'IT' },
  { ticker: '033630.KQ', name: '에이텍',               sector: 'IT' },
  { ticker: '348030.KQ', name: '모아데이터',           sector: 'IT' },
  { ticker: '405640.KQ', name: '케이웨더',             sector: 'IT' },

  // AI / 로봇
  { ticker: '042510.KQ', name: '라온피플',             sector: 'AI' },
  { ticker: '950200.KQ', name: '알체라',               sector: 'AI' },
  { ticker: '258790.KQ', name: '로보티즈',             sector: 'AI' },
  { ticker: '108490.KQ', name: '로보스타',             sector: 'AI' },
  { ticker: '357550.KQ', name: '석경에이티',           sector: 'AI' },
  { ticker: '232530.KQ', name: '이엠텍',               sector: 'AI' },

  // 게임
  { ticker: '225570.KQ', name: '넥슨게임즈',           sector: '게임' },
  { ticker: '078340.KQ', name: '컴투스',               sector: '게임' },
  { ticker: '069080.KQ', name: '웹젠',                sector: '게임' },
  { ticker: '194480.KQ', name: '데브시스터즈',          sector: '게임' },
  { ticker: '192080.KQ', name: '더블유게임즈',          sector: '게임' },
  { ticker: '047080.KQ', name: '한빛소프트',           sector: '게임' },

  // 엔터 / 미디어
  { ticker: '122870.KQ', name: 'YG엔터테인먼트',       sector: '엔터' },
  { ticker: '253450.KQ', name: '스튜디오드래곤',        sector: '엔터' },
  { ticker: '054780.KQ', name: '키이스트',             sector: '엔터' },
  { ticker: '376300.KQ', name: '디어유',               sector: '엔터' },
  { ticker: '357870.KQ', name: '위지윅스튜디오',        sector: '엔터' },
  { ticker: '121440.KQ', name: '골프존',               sector: '엔터' },

  // 바이오 / 제약 / 의료기기
  { ticker: '214150.KQ', name: '클래시스',             sector: '바이오' },
  { ticker: '039200.KQ', name: '오스코텍',             sector: '바이오' },
  { ticker: '237690.KQ', name: '에스티팜',             sector: '바이오' },
  { ticker: '145720.KQ', name: '덴티움',               sector: '바이오' },
  { ticker: '206640.KQ', name: '바디텍메드',           sector: '바이오' },
  { ticker: '064550.KQ', name: '바이오니아',           sector: '바이오' },
  { ticker: '214430.KQ', name: '아이쓰리시스템',        sector: '바이오' },
  { ticker: '290650.KQ', name: '엘앤씨바이오',          sector: '바이오' },
  { ticker: '039840.KQ', name: 'DIO',                sector: '바이오' },
  { ticker: '950130.KQ', name: '엑세스바이오',          sector: '바이오' },
  { ticker: '328130.KQ', name: '루닛',                sector: '바이오' },
  { ticker: '085660.KQ', name: '차바이오텍',           sector: '바이오' },
  { ticker: '048260.KQ', name: '오스테오닉',           sector: '바이오' },
  { ticker: '294090.KQ', name: '이오플로우',           sector: '바이오' },
  { ticker: '048410.KQ', name: '현대바이오',           sector: '바이오' },
  { ticker: '950160.KQ', name: '코오롱티슈진',          sector: '바이오' },
  { ticker: '039440.KQ', name: '에스티큐브',           sector: '바이오' },
  { ticker: '119830.KQ', name: '아이텍',               sector: '바이오' },
  { ticker: '053300.KQ', name: '한국테크놀로지그룹',    sector: '바이오' },
  { ticker: '108230.KQ', name: '티플랙스',             sector: '바이오' },
  { ticker: '131290.KQ', name: '티씨씨스틸',           sector: '바이오' },

  // 추가 KOSDAQ 반도체 / IT
  { ticker: '005290.KQ', name: '동진쎄미켐',           sector: '반도체' },
  { ticker: '036200.KQ', name: '유니셈',               sector: '반도체' },
  { ticker: '102120.KQ', name: '어보브반도체',          sector: '반도체' },
  { ticker: '079940.KQ', name: '가비아',               sector: 'IT' },
  { ticker: '041190.KQ', name: '우리기술',             sector: '반도체' },
  { ticker: '080180.KQ', name: '한라IMS',              sector: '반도체' },
  { ticker: '059120.KQ', name: '아진엑스텍',           sector: '반도체' },
  { ticker: '211050.KQ', name: '인카금융서비스',        sector: '금융' },
  { ticker: '290120.KQ', name: '이노뎁',               sector: 'IT' },
  { ticker: '060370.KQ', name: '수산아이앤티',          sector: 'IT' },
  { ticker: '053450.KQ', name: '세코닉스',             sector: '전자' },
  { ticker: '048730.KQ', name: '비씨아이',             sector: '반도체' },
  { ticker: '200710.KQ', name: '에이디테크놀로지',      sector: '반도체' },
  { ticker: '131100.KQ', name: '로보로보',             sector: 'AI' },
  { ticker: '053080.KQ', name: '시큐레터',             sector: 'IT' },
  { ticker: '052860.KQ', name: '아이엔지생명보험',      sector: 'IT' },
  { ticker: '096690.KQ', name: '두올',                sector: '소재' },
  { ticker: '289080.KQ', name: '글로벌에스엠',          sector: '반도체' },
  { ticker: '033290.KQ', name: '코웰패션',             sector: '소비재' },
  { ticker: '048550.KQ', name: 'SM C&C',             sector: '엔터' },
  { ticker: '054040.KQ', name: '한국정보인증',          sector: 'IT' },
  { ticker: '065690.KQ', name: '지씨씨',               sector: 'IT' },
  { ticker: '060720.KQ', name: 'KH필룩스',            sector: '전자' },
  { ticker: '047770.KQ', name: '코아스',               sector: '소비재' },
  { ticker: '016670.KQ', name: '디아이',               sector: '반도체' },

  // 추가 KOSDAQ 바이오
  { ticker: '085670.KQ', name: '케어젠',               sector: '바이오' },
  { ticker: '078520.KQ', name: '에이블씨앤씨',          sector: '소비재' },
  { ticker: '214450.KQ', name: '파나진',               sector: '바이오' },
  { ticker: '272450.KQ', name: '파마리서치',            sector: '바이오' },
  { ticker: '220100.KQ', name: '퓨쳐켐',               sector: '바이오' },
  { ticker: '317690.KQ', name: '장원테크',             sector: '바이오' },
  { ticker: '096990.KQ', name: '에스티씨라이프',        sector: '바이오' },
  { ticker: '900260.KQ', name: '크리스탈지노믹스',      sector: '바이오' },
  { ticker: '214370.KQ', name: '케어랩스',             sector: '바이오' },
  { ticker: '200130.KQ', name: '케이사인',             sector: 'IT' },
  { ticker: '187660.KQ', name: '에이디엠코리아',        sector: '소재' },
  { ticker: '115180.KQ', name: '큐리언트',             sector: '바이오' },
  { ticker: '310210.KQ', name: '보로노이',             sector: '바이오' },
  { ticker: '286940.KQ', name: '웰크론한텍',           sector: '바이오' },
  { ticker: '217270.KQ', name: '넵튠',                sector: 'IT' },

  // 추가 KOSDAQ 엔터 / 게임 / 소비재
  { ticker: '045310.KQ', name: '대원미디어',           sector: '엔터' },
  { ticker: '041920.KQ', name: '메타랩스',             sector: 'IT' },
  { ticker: '094820.KQ', name: '슈피겐코리아',          sector: '소비재' },
  { ticker: '066360.KQ', name: 'NICE',                sector: 'IT' },
  { ticker: '246690.KQ', name: 'TS트릴리온',           sector: '소비재' },
  { ticker: '149980.KQ', name: '하이딥',               sector: '전자' },
  { ticker: '024800.KQ', name: '멕아이씨에스',          sector: '바이오' },
  { ticker: '064090.KQ', name: '웨이브일렉트로',        sector: '전자' },
  { ticker: '250060.KQ', name: '모비스',               sector: '자동차' },
  { ticker: '034790.KQ', name: '다보링크',             sector: 'IT' },
  { ticker: '052710.KQ', name: '아모텍',               sector: '전자' },

  // 기타 코스닥
  { ticker: '347700.KQ', name: '스피어',               sector: '기타' },
  { ticker: '041020.KQ', name: '폴루스바이오팜',        sector: '바이오' },
  { ticker: '900290.KQ', name: 'GRT',                sector: '기타' },
  { ticker: '039010.KQ', name: '현대에이치씨엔',        sector: 'IT' },
  { ticker: '065770.KQ', name: '퓨쳐스트림네트웍스',    sector: 'IT' },
  { ticker: '178320.KQ', name: '서진시스템',           sector: '반도체' },
  { ticker: '049070.KQ', name: '인탑스',               sector: '전자' },
  { ticker: '039830.KQ', name: '오로라',               sector: '기타' },
  { ticker: '319400.KQ', name: '현대무벡스',           sector: '기타' },

  // ===== 추가 KOSPI =====

  // 로봇
  { ticker: '454910.KS', name: '두산로보틱스',          sector: '로봇' },
  { ticker: '277810.KS', name: '레인보우로보틱스',       sector: '로봇' },
  { ticker: '090355.KS', name: '노루페인트',            sector: '소재' },

  // 조선 추가
  { ticker: '267250.KS', name: 'HD현대',               sector: '조선' },
  { ticker: '443060.KS', name: 'HD현대마린솔루션',       sector: '조선' },
  { ticker: '329180.KS', name: '한화오션',              sector: '조선' },

  // 2차전지 추가
  { ticker: '361610.KS', name: 'SK아이이테크놀로지',     sector: '2차전지' },
  { ticker: '020150.KS', name: '롯데에너지머티리얼즈',   sector: '2차전지' },

  // 반도체 추가
  { ticker: '007660.KS', name: '이수페타시스',           sector: '반도체' },
  { ticker: '018470.KS', name: '조일알미늄',            sector: '반도체' },

  // IT 추가
  { ticker: '022100.KS', name: '포스코DX',              sector: 'IT' },
  { ticker: '248070.KS', name: '솔루엠',                sector: 'IT' },

  // 소비재 추가
  { ticker: '003230.KS', name: '삼양식품',              sector: '소비재' },
  { ticker: '280360.KS', name: '롯데웰푸드',             sector: '소비재' },
  { ticker: '005180.KS', name: '빙그레',                sector: '소비재' },
  { ticker: '192820.KS', name: '코스맥스',               sector: '소비재' },
  { ticker: '278470.KS', name: '에이피알',               sector: '소비재' },
  { ticker: '007340.KS', name: '부광약품',               sector: '소비재' },
  { ticker: '026960.KS', name: '동서',                  sector: '소비재' },
  { ticker: '145990.KS', name: '삼양사',                sector: '소비재' },
  { ticker: '002140.KS', name: '고려산업',               sector: '소비재' },
  { ticker: '008290.KS', name: '원풍물산',               sector: '소비재' },

  // 보험 추가
  { ticker: '001450.KS', name: '현대해상',               sector: '보험' },

  // 지주 추가
  { ticker: '383800.KS', name: 'LX홀딩스',              sector: '지주' },
  { ticker: '001120.KS', name: 'LX인터내셔널',           sector: '지주' },
  { ticker: '108670.KS', name: 'LX하우시스',            sector: '소재' },

  // ===== 추가 KOSDAQ =====

  // 바이오 추가
  { ticker: '028300.KQ', name: 'HLB',                  sector: '바이오' },
  { ticker: '141080.KQ', name: '리가켐바이오',            sector: '바이오' },
  { ticker: '086900.KQ', name: '메디톡스',               sector: '바이오' },
  { ticker: '298380.KQ', name: '에이비엘바이오',          sector: '바이오' },
  { ticker: '287410.KQ', name: '제이시스메디칼',          sector: '바이오' },
  { ticker: '019170.KQ', name: '신풍제약',               sector: '바이오' },
  { ticker: '102940.KQ', name: '코오롱생명과학',          sector: '바이오' },
  { ticker: '311690.KQ', name: 'CJ바이오사이언스',        sector: '바이오' },
  { ticker: '016580.KQ', name: '환인제약',               sector: '바이오' },
  { ticker: '009580.KQ', name: '무림P&P',               sector: '소재' },

  // 2차전지 추가
  { ticker: '383310.KQ', name: '에코프로에이치엔',        sector: '2차전지' },
  { ticker: '137400.KQ', name: '피엔티',                 sector: '2차전지' },
  { ticker: '005070.KQ', name: '코스모신소재',            sector: '2차전지' },
  { ticker: '247540.KQ', name: '나노신소재',              sector: '2차전지' },

  // 반도체 추가
  { ticker: '084370.KQ', name: '유진테크',               sector: '반도체' },
  { ticker: '074600.KQ', name: '원익QnC',               sector: '반도체' },
  { ticker: '089980.KQ', name: '상아프론테크',            sector: '반도체' },
  { ticker: '067310.KQ', name: '하나마이크론',            sector: '반도체' },
  { ticker: '161580.KQ', name: '필옵틱스',               sector: '반도체' },
  { ticker: '039440.KQ', name: '어보브반도체',            sector: '반도체' },

  // 로봇 / AI 추가
  { ticker: '317330.KQ', name: '루닛',                  sector: 'AI' },
  { ticker: '196300.KQ', name: '애니젠',                sector: 'AI' },

  // 소비재 추가
  { ticker: '381970.KQ', name: '케이카',                sector: '소비재' },
  { ticker: '094820.KQ', name: '슈피겐코리아',            sector: '소비재' },

  // 엔터 추가
  { ticker: '348370.KQ', name: '에스엠스튜디오스',        sector: '엔터' },
  { ticker: '950170.KQ', name: 'JTC',                  sector: '엔터' },

  // IT 추가
  { ticker: '950160.KQ', name: '코오롱티슈진',           sector: 'IT' },
  { ticker: '290120.KQ', name: '이노뎁',                sector: 'IT' },

  // ===== 소형주 추가 KOSPI =====

  // 조선 소형
  { ticker: '010620.KS', name: 'HD현대미포',             sector: '조선' },

  // 철강 소형
  { ticker: '306200.KS', name: '세아제강',               sector: '철강' },
  { ticker: '001230.KS', name: '동국홀딩스',             sector: '철강' },

  // 기계
  { ticker: '042670.KS', name: 'HD현대인프라코어',        sector: '기계' },

  // 화학 소형
  { ticker: '005950.KS', name: '이수화학',               sector: '화학' },
  { ticker: '009300.KS', name: '삼양홀딩스',             sector: '화학' },
  { ticker: '001070.KS', name: '조비',                  sector: '화학' },
  { ticker: '025860.KS', name: '남해화학',               sector: '화학' },

  // 소비재 소형
  { ticker: '161000.KS', name: '애경산업',               sector: '소비재' },
  { ticker: '014710.KS', name: '사조씨푸드',             sector: '소비재' },
  { ticker: '003920.KS', name: '남양유업',               sector: '소비재' },
  { ticker: '000050.KS', name: '경방',                  sector: '소비재' },
  { ticker: '003610.KS', name: '방림',                  sector: '소비재' },

  // 소재 소형
  { ticker: '017960.KS', name: '한국카본',               sector: '소재' },
  { ticker: '016590.KS', name: '신대양제지',             sector: '소재' },

  // 건설 소형
  { ticker: '005960.KS', name: '동부건설',               sector: '건설' },
  { ticker: '002780.KS', name: '진흥기업',               sector: '건설' },
  { ticker: '001160.KS', name: '아세아시멘트',            sector: '건설' },
  { ticker: '011700.KS', name: '한신공영',               sector: '건설' },

  // 바이오 소형
  { ticker: '115480.KS', name: '씨젠',                  sector: '바이오' },
  { ticker: '008490.KS', name: '서흥',                  sector: '바이오' },

  // 반도체 소형
  { ticker: '007810.KS', name: '코리아써키트',            sector: '반도체' },

  // 에너지 소형
  { ticker: '024060.KS', name: '흥구석유',               sector: '에너지' },

  // ===== 소형주 추가 KOSDAQ =====

  // AI / 의료AI
  { ticker: '338220.KQ', name: '뷰노',                  sector: 'AI' },
  { ticker: '322510.KQ', name: '제이엘케이',             sector: 'AI' },
  { ticker: '049950.KQ', name: '미래컴퍼니',             sector: 'AI' },

  // 2차전지 소재
  { ticker: '121600.KQ', name: '나노신소재',             sector: '2차전지' },
  { ticker: '336370.KQ', name: '솔루스첨단소재',          sector: '2차전지' },
  { ticker: '060480.KQ', name: '이엔테크놀로지',          sector: '2차전지' },

  // 수소 / 에너지
  { ticker: '271940.KQ', name: '일진하이솔루스',          sector: '에너지' },
  { ticker: '126340.KQ', name: '비나텍',                sector: '에너지' },
  { ticker: '263810.KQ', name: '에스퓨얼셀',             sector: '에너지' },

  // IT / 핀테크 / 보안
  { ticker: '053580.KQ', name: '웹케시',                sector: 'IT' },
  { ticker: '150900.KQ', name: '파수',                  sector: 'IT' },
  { ticker: '136540.KQ', name: '윈스',                  sector: 'IT' },
  { ticker: '115450.KQ', name: '모니터랩',               sector: 'IT' },
  { ticker: '067160.KQ', name: '아프리카TV',             sector: 'IT' },
  { ticker: '057680.KQ', name: '나이스정보통신',          sector: 'IT' },
  { ticker: '093380.KQ', name: '이크레더블',             sector: 'IT' },
  { ticker: '065620.KQ', name: '한솔인티큐브',           sector: 'IT' },

  // 전력 소형
  { ticker: '033100.KQ', name: '제룡전기',               sector: '전력' },
  { ticker: '057500.KQ', name: '광명전기',               sector: '전력' },
  { ticker: '013360.KQ', name: '일진전기',               sector: '전력' },

  // 반도체 소형
  { ticker: '222800.KQ', name: '심텍',                  sector: '반도체' },
  { ticker: '030530.KQ', name: '원익홀딩스',             sector: '반도체' },
  { ticker: '098460.KQ', name: '고영',                  sector: '반도체' },
  { ticker: '094170.KQ', name: '동운아나텍',             sector: '반도체' },
  { ticker: '080160.KQ', name: '모아텍',                sector: '반도체' },

  // 환경
  { ticker: '029960.KQ', name: '코엔텍',                sector: '기타' },
  { ticker: '037370.KQ', name: 'KG ETS',               sector: '기타' },

  // 바이오 소형
  { ticker: '082270.KQ', name: '젬백스',                sector: '바이오' },
  { ticker: '225220.KQ', name: '제놀루션',               sector: '바이오' },
  { ticker: '078160.KQ', name: '메디아나',               sector: '바이오' },
  { ticker: '084110.KQ', name: '휴온스',                sector: '바이오' },
  { ticker: '294630.KQ', name: '지놈앤컴퍼니',           sector: '바이오' },

  // 미디어
  { ticker: '079170.KQ', name: '한국경제TV',             sector: '엔터' },

  // 소비재 소형
  { ticker: '046250.KQ', name: '위닉스',                sector: '소비재' },
  { ticker: '073190.KQ', name: '듀오백',                sector: '소비재' },
  { ticker: '171090.KQ', name: '선진',                  sector: '소비재' },
  { ticker: '065510.KS', name: '휴비스',                sector: '소비재' },

  // 건설 소형
  { ticker: '013700.KQ', name: '까뮤이앤씨',             sector: '건설' },
  { ticker: '045100.KQ', name: '한양이엔지',             sector: '건설' },

  // 소재 / 기타
  { ticker: '025900.KQ', name: '동화기업',               sector: '소재' },

  // 방산 소형
  { ticker: '159010.KQ', name: '아스트',                sector: '방산' },

  // ===== 중소형주 100종목 추가 =====

  // KOSPI 중소형
  { ticker: '011790.KS', name: 'SKC',                  sector: '2차전지' },
  { ticker: '019440.KS', name: '세아특수강',             sector: '철강' },
  { ticker: '058650.KS', name: '세아홀딩스',             sector: '철강' },
  { ticker: '103140.KS', name: '풍산',                  sector: '소재' },
  { ticker: '008930.KS', name: '한미사이언스',            sector: '바이오' },
  { ticker: '000640.KS', name: '동아쏘시오홀딩스',        sector: '바이오' },
  { ticker: '003470.KS', name: '유안타증권',             sector: '증권' },
  { ticker: '004090.KS', name: '한국석유',               sector: '에너지' },
  { ticker: '100840.KS', name: 'SNT에너지',              sector: '방산' },
  { ticker: '021050.KS', name: '서희건설',               sector: '건설' },
  { ticker: '023810.KS', name: '인팩',                  sector: '자동차' },
  { ticker: '057120.KS', name: '명신산업',               sector: '자동차' },
  { ticker: '027740.KS', name: '마니커',                sector: '소비재' },
  { ticker: '005990.KS', name: '매일유업',               sector: '소비재' },
  { ticker: '003780.KS', name: '진양홀딩스',             sector: '화학' },
  { ticker: '010640.KS', name: '진도',                  sector: '소비재' },
  { ticker: '001360.KS', name: '삼화전기',               sector: '전자' },
  { ticker: '006890.KS', name: '태경케미칼',             sector: '화학' },
  { ticker: '035510.KS', name: '신세계I&C',             sector: 'IT' },
  { ticker: '010820.KS', name: '퍼스텍',                sector: '방산' },
  { ticker: '004360.KS', name: '세방',                  sector: '소재' },
  { ticker: '028670.KS', name: '팬오션',                sector: '해운' },
  { ticker: '006840.KS', name: 'AK홀딩스',              sector: '지주' },
  { ticker: '097230.KS', name: '한진',                  sector: '물류' },
  { ticker: '012200.KS', name: '계양전기',               sector: '전자' },
  { ticker: '002720.KS', name: '국제약품',               sector: '바이오' },
  { ticker: '014440.KS', name: '영보화학',               sector: '화학' },
  { ticker: '014820.KS', name: '동원시스템즈',            sector: '소비재' },

  // KOSDAQ 중소형
  { ticker: '032500.KQ', name: '케이엠더블유',            sector: '통신' },
  { ticker: '078600.KQ', name: '대주전자재료',            sector: '2차전지' },
  { ticker: '099430.KQ', name: '바텍',                  sector: '바이오' },
  { ticker: '119290.KQ', name: '인터로조',               sector: '바이오' },
  { ticker: '043910.KQ', name: '자이언트스텝',            sector: 'AI' },
  { ticker: '052900.KQ', name: '유진로봇',               sector: '로봇' },
  { ticker: '039560.KQ', name: '다산네트웍스',            sector: 'IT' },
  { ticker: '032560.KQ', name: '황금에스티',              sector: '소재' },
  { ticker: '073070.KQ', name: '야스',                  sector: '반도체' },
  { ticker: '041170.KQ', name: '피앤이솔루션',            sector: '2차전지' },
  { ticker: '285490.KQ', name: '쏘카',                  sector: 'IT' },
  { ticker: '256840.KQ', name: '한국비엔씨',             sector: '바이오' },
  { ticker: '058220.KQ', name: 'HLB생명과학',            sector: '바이오' },
  { ticker: '043370.KQ', name: '피씨엘',                sector: '바이오' },
  { ticker: '065140.KQ', name: '세틀뱅크',               sector: 'IT' },
  { ticker: '054090.KQ', name: '다원시스',               sector: '에너지' },
  { ticker: '053700.KQ', name: '삼보모터스',             sector: '자동차' },
  { ticker: '036540.KQ', name: 'SCI평가정보',            sector: 'IT' },
  { ticker: '091990.KQ', name: '유바이오로직스',          sector: '바이오' },
  { ticker: '046210.KQ', name: '팜스토리',               sector: '소비재' },
  { ticker: '082920.KQ', name: '비씨월드제약',            sector: '바이오' },
  { ticker: '024840.KQ', name: 'MDS테크',               sector: 'IT' },
  { ticker: '049720.KQ', name: '스맥',                  sector: '기계' },
  { ticker: '045020.KQ', name: '웰크론',                sector: '소비재' },
  { ticker: '300080.KQ', name: '플리토',                sector: 'AI' },
  { ticker: '033230.KQ', name: '테이팩스',               sector: '소비재' },
  { ticker: '037270.KQ', name: 'YBM넷',                sector: 'IT' },
  { ticker: '014160.KQ', name: '박셀바이오',             sector: '바이오' },
  { ticker: '065350.KQ', name: '신성델타테크',            sector: '자동차' },
  { ticker: '204620.KQ', name: '글로벌텍스프리',          sector: 'IT' },
  { ticker: '019540.KQ', name: '일지테크',               sector: '자동차' },
  { ticker: '236200.KQ', name: '슈프리마에이치큐',        sector: 'IT' },
  { ticker: '119650.KQ', name: 'SMS',                  sector: '반도체' },
  { ticker: '228670.KQ', name: '레이',                  sector: '바이오' },
  { ticker: '205500.KQ', name: '넥스트칩',               sector: '반도체' },
  { ticker: '211270.KQ', name: 'AP위성',                sector: 'IT' },
  { ticker: '042000.KQ', name: '카페24',                sector: 'IT' },
  { ticker: '206560.KQ', name: '덱스터',                sector: '엔터' },
  { ticker: '187790.KQ', name: '나노브릭',               sector: '소재' },
  { ticker: '038680.KQ', name: '에스넷',                sector: 'IT' },
  { ticker: '063570.KQ', name: '한국전자금융',            sector: 'IT' },
  { ticker: '040300.KQ', name: 'YTN',                  sector: '엔터' },
  { ticker: '237460.KQ', name: '에코플라스틱',            sector: '자동차' },
  { ticker: '230240.KQ', name: 'HFR',                  sector: '통신' },
  { ticker: '059090.KQ', name: '미코',                  sector: '반도체' },
  { ticker: '064800.KQ', name: '제이씨케미칼',            sector: '화학' },
  { ticker: '049520.KQ', name: '유아이엘',               sector: '전자' },
  { ticker: '066700.KQ', name: '테라사이언스',            sector: '반도체' },
  { ticker: '079810.KQ', name: '디이엔티',               sector: '2차전지' },
  { ticker: '241710.KQ', name: '코스메카코리아',          sector: '소비재' },
  { ticker: '047560.KQ', name: '이스트소프트',            sector: 'IT' },
  { ticker: '100120.KQ', name: '뷰웍스',                sector: '바이오' },
  { ticker: '023160.KQ', name: '태광',                  sector: '소재' },
  { ticker: '072710.KQ', name: '농우바이오',             sector: '바이오' },
  { ticker: '098120.KQ', name: '마이크로컨텍솔',          sector: '반도체' },
  { ticker: '053800.KQ', name: '안랩',                  sector: 'IT' },
  { ticker: '200400.KQ', name: '쿠콘',                  sector: 'IT' },
  { ticker: '302430.KQ', name: '이노스페이스',            sector: '방산' },
  { ticker: '358570.KQ', name: '지아이이노베이션',         sector: '바이오' },
  { ticker: '104540.KQ', name: '코렌텍',                sector: '바이오' },
  { ticker: '033310.KQ', name: '이지케어텍',             sector: 'IT' },
  { ticker: '131970.KQ', name: '두산테스나',             sector: '반도체' },
  { ticker: '089010.KQ', name: '켐온',                  sector: '바이오' },
  { ticker: '241690.KQ', name: '브이티',                sector: '소비재' },
  { ticker: '069260.KQ', name: '휴넷',                  sector: 'IT' },
  { ticker: '089590.KQ', name: '제주항공',               sector: '항공' },
  { ticker: '095570.KQ', name: 'AJ네트웍스',             sector: 'IT' },
  { ticker: '078070.KQ', name: '유비온',                sector: 'IT' },
  { ticker: '310870.KQ', name: '디앤디파마텍',            sector: '바이오' },
  { ticker: '378600.KQ', name: '코어라인소프트',          sector: 'AI' },
  { ticker: '257720.KQ', name: '실리콘투',               sector: '소비재' },
  { ticker: '086980.KQ', name: '바이넥스',               sector: '바이오' },
];

async function fetchBatch(batch: typeof STOCKS): Promise<Record<string, any>> {
  const tickers = batch.map(s => s.ticker).join(',');
  const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${tickers}&range=5d&interval=1d&_=${Date.now()}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return {};
    const data = await res.json();

    // spark 래핑 형식: {"spark":{"result":[{"symbol":...,"response":[...]}]}}
    if (data?.spark) {
      if (!data.spark.result) return {};
      const out: Record<string, any> = {};
      for (const item of data.spark.result) {
        const ticker = item.symbol;
        const resp = item.response?.[0];
        if (!resp) continue;
        out[ticker] = {
          chartPreviousClose: resp.meta?.chartPreviousClose ?? 0,
          close: resp.indicators?.quote?.[0]?.close ?? [],
        };
      }
      return out;
    }

    // 티커 키 형식: {"005930.KS":{close:[...], chartPreviousClose:...}}
    return data;
  } catch {
    return {};
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// 120초 캐시 — 단타봇 2분 주기에 맞춰 TTL 연장, Yahoo 과호출 방지
let stockCache: { data: StockPrice[]; ts: number } | null = null;
const CACHE_TTL_MS = 120 * 1000;

export async function fetchStockPrices(): Promise<StockPrice[]> {
  if (stockCache && Date.now() - stockCache.ts < CACHE_TTL_MS) {
    return stockCache.data;
  }

  const BATCH_SIZE = 25;
  const batches: typeof STOCKS[] = [];
  for (let i = 0; i < STOCKS.length; i += BATCH_SIZE) {
    batches.push(STOCKS.slice(i, i + BATCH_SIZE));
  }

  const results: Record<string, any>[] = [];
  for (let i = 0; i < batches.length; i++) {
    if (i > 0) await sleep(150);
    const result = await fetchBatch(batches[i]);
    results.push(result);
  }
  const json = Object.assign({}, ...results);

  const data = STOCKS.map(stock => {
    const d = json[stock.ticker];
    const closes: (number | null)[] = d?.close ?? [];
    const prevClose: number = d?.chartPreviousClose ?? 0;
    const lastValid = [...closes].reverse().find(v => v != null) ?? null;
    const price = lastValid ?? prevClose;
    const change = prevClose ? price - prevClose : 0;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    return {
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector,
      price: Math.round(price),
      change: Math.round(change),
      changePercent: Math.round(changePercent * 100) / 100,
    };
  });

  stockCache = { data, ts: Date.now() };
  return data;
}
