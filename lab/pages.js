// Add a new entry here to make another test available in the room.
export const pages = [
  {
    id: 'buttons', number: '01', category: 'COMPONENTS', title: '버튼 스타일 가이드',
    description: '노란 캡슐, 검정 테두리, 굵은 글자. 기본·선택·비활성 상태를 한눈에.',
    href: './button-guide/index.html', label: '가이드 열기', preview: 'buttons', local: false,
  },
  {
    id: 'cart-game', number: '02', category: 'PLAYGROUND', title: '띵띵클럽 게임 테스트',
    description: '떨어지는 소품을 카트에 담아보세요. 움직임과 점수, 로컬 랭킹을 테스트해요.',
    href: 'http://127.0.0.1:8090/thingthingclub/', label: '게임 열기', preview: 'game', local: true,
  },
];
