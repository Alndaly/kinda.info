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
        description: '一站式私域社区（暂不可用）。',
        url: 'https://docs.unit-one.top',
        image: 'https://oss.kinda.info/image/202402121949063.png',
    },
    {
        title: 'UniAPI',
        description: '工具接口（暂不可用）。',
        url: 'https://uniapi.top',
        image: 'https://oss.kinda.info/image/202402121958647.png',
    },
    {
        title: 'qin',
        description: 'qin工具库，python包，具备ai、视频、图片等操作功能，整体较为完整丰富。',
        url: 'https://github.com/Alndaly/qin-cli',
        image: 'https://oss.kinda.info/image/202407042343412.png'
    },
    {
        title: 'aiop',
        description: 'aiop工具库，python包，建立这个包的目的是为了便于一些ai的操作，相比较qin工具包而言，这个包的功能比较简洁单一。',
        url: 'https://github.com/Alndaly/aiop',
        image: 'https://oss.kinda.info/image/202407260943972.png'
    }
];