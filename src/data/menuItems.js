// src/constants/menuItems.js

export const menuItems = {
  menus: [
    {
      to: '/template/detail/:id',
      label: '템플릿 상세 정보',
      match: ['/template/detail']
    },
    {
      to: '/project/info',
      label: '프로젝트 정보',
      match: ['/project/info']
    },
    {
      to: '/project/member',
      label: '팀원',
      match: ['/project/member']
    },
    {
      to: '/project/meeting',
      label: '회의록',
      match: ['/project/meeting', '/project/create-meeting']
    },
    {
      to: '/project/issues',
      label: '이슈',
      match: ['/project/issues', '/project/create-issue']
    },
    {
      to: '/project/commits',
      label: '커밋',
      match: ['/project/commits']
    },
    {
      to: '/project/pull-requests',
      label: 'PR',
      match: ['/project/pull-requests', '/project/create-pull-request', '/project/review-pull-request']
    },
    {
      to: '/project/project-review',
      label: '프로젝트 후기',
      match: ['/project/project-review']
    }
  ],

  pages: [
     {
        match: '/template/detail/:id',
        title: '템플릿 상세 정보',
        description: ['/template/detail']
    },
    {
      match: ['/project/member'],
      title: '팀원',
      description: '프로젝트에 참여하는 팀원 목록입니다.'
    },
    {
      match: ['/project/meeting'],
      title: '회의록',
      description: '회의록 목록을 조회할 수 있습니다.'
    },
    {
      match: ['/project/issues'],
      title: '이슈 목록',
      description: '이슈 목록을 조회할 수 있습니다.'
    },
    {
      match: ['/project/create-issue'],
      title: '이슈 생성하기',
      description: '작성한 이슈는 프로젝트 레포지토리에 자동으로 등록됩니다.'
    },
    {
      match: ['/project/pull-requests'],
      title: 'PR 목록',
      description: 'PR 목록을 조회할 수 있습니다.'
    },
    {
      match: ['/project/create-pull-request'],
      title: 'PR 생성하기',
      description: '작성한 PR은 프로젝트 레포지토리에 자동으로 등록됩니다.'
    },
    {
      match: ['/project/commits'],
      title: '커밋 내역',
      description: 'Git 커밋 기록을 조회할 수 있습니다.'
    },
    {
      match: ['/project/project-review'],
      title: '프로젝트 후기',
      description: '참여하신 프로젝트에 대한 후기를 남겨주세요.'
    }
  ]
}
