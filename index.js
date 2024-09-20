const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const RegularMeeting = require('./models/regularMeeting'); // 모델 가져오기
const schedule = require('node-schedule');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`로그인 성공: ${client.user.tag}`);
    // MongoDB 연결
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB 연결 성공'))
    .catch(err => console.error('MongoDB 연결 에러:', err));
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;
    const guildId = interaction.guildId; // 서버 ID 가져오기

    if (commandName === 'addregular') {
        const schedule = options.getString('schedule').toUpperCase();
        // 입력 형식 검증 (요일 및 시간 형식 확인)
        if (!/^(MON|TUE|WED|THU|FRI|SAT|SUN)[0-2][0-9][0-5][0-9]$/.test(schedule)) {
            return interaction.reply({ content: '잘못된 입력 형식입니다. 요일 및 시간을 확인해주세요. (예: THU1630)', ephemeral: true });
        }

        try {
            // 정기 모임 저장
            const newRegularMeeting = new RegularMeeting({ guildId, schedule });
            await newRegularMeeting.save();
            await interaction.reply('정기 모임이 추가되었습니다!');
        } catch (error) {
            console.error('정기 모임 추가 에러:', error);
            await interaction.reply({ content: '정기 모임 추가 중 오류가 발생했습니다.', ephemeral: true });
        }
    } else if (commandName === 'checkdate') {
        try {
            const today = moment();
            const sixtyDaysLater = moment().add(60, 'days');
    
            // 60일 이내의 모임 조회
            const meetings = await RegularMeeting.find({
                guildId,
                // 날짜 조건 추가
                // meetings 컬렉션에 날짜 필드가 아직 없으므로, 
                // schedule 필드를 기반으로 날짜 조건을 계산해야 함.
                // 이 부분은 다음 단계에서 정기 모임 자동 생성 기능을 구현할 때 함께 처리할 예정
            });
    
            if (meetings.length > 0) {
                const formattedMeetings = meetings.map(meeting => {
                    // meeting.date에서 날짜 정보를 추출하여 원하는 형식으로 변환
                    // 예: meeting.date.format('YYYY-MM-DD HH:mm')
                    return `- ${formattedDate}`; // 실제 날짜 형식으로 변경해야 함
                }).join('\n');
    
                const embed = new EmbedBuilder()
                    .setTitle('앞으로 60일간 예정된 모임')
                    .setDescription(formattedMeetings);
    
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply('예정된 모임이 없습니다.');
            }
        } catch (error) {
            console.error('모임 조회 에러:', error);
            await interaction.reply({ content: '모임 조회 중 오류가 발생했습니다.', ephemeral: true });
        }
    } else if (commandName === 'delregular') {
        const schedule = options.getString('schedule').toUpperCase();
        // 입력 형식 검증 (요일 및 시간 형식 확인)
        if (!/^(MON|TUE|WED|THU|FRI|SAT|SUN)[0-2][0-9][0-5][0-9]$/.test(schedule)) {
            return interaction.reply({ content: '잘못된 입력 형식입니다. 요일 및 시간을 확인해주세요. (예: THU1630)', ephemeral: true });
        }

        try {
            // 정기 모임 삭제
            const result = await RegularMeeting.deleteMany({ guildId, schedule });
            if (result.deletedCount > 0) {
                await interaction.reply('정기 모임이 삭제되었습니다!');
            } else {
                await interaction.reply({ content: '해당하는 정기 모임이 존재하지 않습니다.', ephemeral: true });
            }
        } catch (error) {
            console.error('정기 모임 삭제 에러:', error);
            await interaction.reply({ content: '정기 모임 삭제 중 오류가 발생했습니다.', ephemeral: true });
        }
    } 

    // ... (다른 명령어 핸들러 추가)
});

// 매일 자정에 실행되는 작업 예약
schedule.scheduleJob('0 0 * * *', async () => {
    const today = moment();
    const sixtyDaysLater = moment().add(60, 'days');

    // 60일 후의 날짜와 요일을 기반으로 정기 모임 생성 로직 구현
    // 1. RegularMeeting 컬렉션에서 모든 정기 모임 설정 조회
    // 2. 각 설정에 대해 60일 후의 날짜가 조건에 맞는지 확인
    // 3. 조건에 맞는 경우 새로운 모임 객체 생성 및 저장
    // ... (구현 필요)
});

client.login(process.env.DISCORD_TOKEN);