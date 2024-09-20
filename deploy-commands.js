const { REST, Routes } = require('discord.js');
const config = require('./config.json');
require('dotenv').config(); 

const commands = [
    // 여기에 슬래시 명령어들을 추가할 거야
    {
        name: 'setchannel',
        description: '모임용 채널을 설정합니다.',
    },
    {
        name: 'addregular',
        description: '정기 모임을 추가합니다.',
        options: [
            {
                name: 'schedule',
                description: '모임 요일 및 시간 (예: THU1630)',
                type: 3, // 문자열 타입
                required: true,
            },
        ],
    },
    {
        name: 'checkdate',
        description: '앞으로 60일간 예정된 모든 모임의 날짜를 출력합니다.',
    },
    {
        name: 'delregular',
        description: '특정 정기 모임을 삭제합니다.',
        options: [
            {
                name: 'schedule',
                description: '삭제할 모임 요일 및 시간 (예: THU1630)',
                type: 3, // 문자열 타입
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('슬래시 명령어 등록 시작...');

        for (const guildId of config.guildIds) {
            await rest.put(
                Routes.applicationGuildCommands(config.clientId, guildId),
                { body: commands },
            );

            console.log(`서버 ${guildId}에 슬래시 명령어 등록 완료!`);
        }

        console.log('슬래시 명령어 등록 완료!');
    } catch (error) {
        console.error(error);
    }
})();