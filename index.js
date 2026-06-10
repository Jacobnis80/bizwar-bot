require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📌 список участников
let participants = [];

// ===== команда =====
const commands = [
  new SlashCommandBuilder()
    .setName('bizwar')
    .setDescription('Открыть бизвар меню')
].map(c => c.toJSON());

// регистрация команды
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('✅ Команды зарегистрированы');
  } catch (err) {
    console.error(err);
  }
})();

// ===== embed + кнопки =====
function getBizwarMessage() {
  const list =
    participants.length === 0
      ? '📭 Пока никто не записан'
      : participants.map((id, i) => `${i + 1}. <@${id}>`).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('🏆 БИЗВАР')
    .setDescription(`@everyone\n\n**Участники:**\n${list}`)
    .setColor(0x00ff99);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('join')
      .setLabel('Зайти')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('leave')
      .setLabel('Выйти')
      .setStyle(ButtonStyle.Danger)
  );

  return {
    content: '@everyone',
    embeds: [embed],
    components: [row]
  };
}

// ===== кнопки =====
client.on('interactionCreate', async interaction => {

  // 🔘 BUTTONS
  if (interaction.isButton()) {
    const userId = interaction.user.id;

    // ➕ join
    if (interaction.customId === 'join') {
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
      return interaction.update(getBizwarMessage());
    }

    // ➖ leave
    if (interaction.customId === 'leave') {
      participants = participants.filter(id => id !== userId);
      return interaction.update(getBizwarMessage());
    }
  }

  // ===== SLASH =====
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'bizwar') {
    return interaction.reply(getBizwarMessage());
  }
});

// ===== ready =====
client.once('ready', () => {
  console.log(`🤖 Бот запущен как ${client.user.tag}`);
});

client.login(process.env.TOKEN);