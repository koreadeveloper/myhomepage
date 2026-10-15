// 프로젝트 목록 — 이 파일 하나에서 관리합니다.
// 메인에는 featuredRank 1~6만 노출, /projects 에는 전체 목록을 보여줍니다.
// 새 프로젝트 추가 시: 기존 항목은 유지하고 featuredRank만 조정하세요.
export type CtaKind = 'service' | 'demo' | 'github';

export interface Project {
  id: string;
  title: string;
  oneLiner: string;
  category: string;
  primaryUrl: string;
  ctaKind: CtaKind;
  image: string;
  imageAlt: string;
  credit?: string;
  featuredRank?: number;
  demoNote?: string;
}

export const ctaLabels: Record<CtaKind, string> = {
  service: '서비스 체험',
  demo: '데모 체험',
  github: 'GitHub에서 보기',
};

export const projects: Project[] = [
  {
    id: 'wekid',
    title: '위키드 직업 탐험',
    oneLiner: '아이와 어른이 흥미와 일의 기준을 살펴보는 진로 탐색 서비스',
    category: '팀 프로젝트',
    primaryUrl: 'https://wekid-black.vercel.app/',
    ctaKind: 'service',
    image: '/projects/wekid.png',
    imageAlt: '위키드 직업 탐험의 시작 화면 — "나는 일에서 무엇이 중요할까요?"라는 질문과 가치 카드들',
    credit: '팀 프로젝트',
    featuredRank: 1,
  },
  {
    id: 'sejong-aerial',
    title: 'SEJONG AERIAL',
    oneLiner: '실제 지도 데이터를 바탕으로 세종대 캠퍼스를 3D로 탐험하는 웹 경험',
    category: '3D 웹',
    primaryUrl: 'https://sejong-aerial.vercel.app/',
    ctaKind: 'service',
    image: '/projects/sejong-aerial.png',
    imageAlt: 'SEJONG AERIAL 시작 화면 — 세종대 캠퍼스의 3D 지도와 항공 루트 안내 카드',
    featuredRank: 2,
  },
  {
    id: 'link15',
    title: 'Link15',
    oneLiner: '학생에게 필요한 도움을 15분 대화로 연결하는 경험을 살펴보는 데모',
    category: '시연용 데모',
    primaryUrl: 'https://saitgak.vercel.app/',
    ctaKind: 'demo',
    image: '/projects/link15.png',
    imageAlt: 'Link15 홈 화면 — 도움 요청 입력창과 지금 만날 수 있는 사람 목록',
    demoNote: '시연용 데모입니다',
    featuredRank: 3,
  },
  {
    id: 'orzu-gallery',
    title: 'ORZU Gallery',
    oneLiner: '코드를 만들고 공유하며 다시 편집하는 협업 갤러리',
    category: '협업 갤러리',
    primaryUrl: 'https://orzu-gallery.vercel.app/',
    ctaKind: 'service',
    image: '/projects/orzu-gallery.png',
    imageAlt: 'ORZU Gallery 화면 — 작품 카드가 놓인 갤러리 목록',
    featuredRank: 4,
  },
  {
    id: 'copy-unbound',
    title: 'Copy Unbound',
    oneLiner: '웹페이지의 일반 텍스트 선택·복사를 돕는 Chrome 확장 프로그램',
    category: 'Chrome 확장',
    primaryUrl: 'https://github.com/koreadeveloper/Copy-Unbound',
    ctaKind: 'github',
    image: '/projects/copy-unbound.svg',
    imageAlt: 'Copy Unbound 배너 — "Select freely. Copy normally." 문구와 선택된 텍스트 일러스트',
    featuredRank: 5,
  },
  {
    id: 'contestforge',
    title: 'ContestForge AI',
    oneLiner: '공모전 자료를 제출 초안과 점검 패키지로 정리하는 로컬 도구',
    category: '로컬 도구',
    primaryUrl: 'https://github.com/koreadeveloper/Contestforge',
    ctaKind: 'github',
    image: '/projects/contestforge.png',
    imageAlt: 'ContestForge AI 작업 공간 — 파일 업로드와 에이전트 실행 단계가 보이는 화면',
    featuredRank: 6,
  },
];

export const featuredProjects = projects
  .filter((p) => p.featuredRank !== undefined)
  .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
