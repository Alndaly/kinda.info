interface Project {
    title: string;
    description: string;
    url: string;
    image?: string;
}

export const projects: Project[] = [
    {
        title: '@kinda/utils',
        description: '一个提供一些基础服务的npm包',
        url: 'https://github.com/Alndaly/kinda-utils',
        image: 'https://oss.kinda.info/image/202402121954106.png',
    },
    {
        title: 'Unit-One',
        description: '一站式私域社区（暂不可用）',
        url: 'https://docs.unit-one.top',
        image: 'https://oss.kinda.info/image/202402121949063.png',
    },
    {
        title: 'UniAPI',
        description: '工具接口（暂不可用）',
        url: 'https://uniapi.top',
        image: 'https://oss.kinda.info/image/202402121958647.png',
    },
    {
        title: 'qin',
        description: 'qin工具库，python包',
        url: 'https://github.com/Alndaly/qin-cli',
        image: 'https://oss.kinda.info/image/202407042343412.png'
    }
];