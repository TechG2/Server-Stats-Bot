const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

async function createChannels(interaction, channelType, categoryId) {
  const channelsArr = [];

  // Get Counts
  const members = await interaction.guild.members.fetch({
    limit: interaction.guild.memberCount,
  });
  const bots = await members
    .filter((member) => member.user.bot)
    .map((member) => member.id);

  const channels = interaction.guild.channels.cache;

  const membersChannel = await interaction.guild.channels.create({
    type: channelType,
    name: `Members: ${interaction.guild.memberCount}`,
    parent: categoryId,
    topic: "Members Count",
  });

  channelsArr.push({
    name: membersChannel.name,
    id: membersChannel.id,
  });

  const botsChannel = await interaction.guild.channels.create({
    type: channelType,
    name: `Bots: ${bots.length}`,
    parent: categoryId,
    topic: "Bots Count",
  });

  channelsArr.push({ name: botsChannel.name, id: botsChannel.id });

  const channelsChannel = await interaction.guild.channels.create({
    type: channelType,
    name: `Channels: ${channels.map((channel) => channel.id).length}`,
    parent: categoryId,
    topic: "Channels Count",
  });

  channelsArr.push({
    name: channelsChannel.name,
    id: channelsChannel.id,
  });

  return channelsArr;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats-setup")
    .setDescription("The statistics setup command")
    .addStringOption((option) =>
      option
        .setName("channel-type")
        .setDescription("The type of the channels")
        .addChoices(
          {
            name: "Voice Channel",
            value: ChannelType.GuildVoice.toString(),
          },
          {
            name: "Text Channel",
            value: ChannelType.GuildText.toString(),
          }
        )
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const channelType = parseInt(interaction.options.getString("channel-type"));
    const dbCategory = await db.get(`${interaction.guild.id}-settings`);

    let categoryId;
    if (!dbCategory) {
      const category = await interaction.guild.channels.create({
        type: ChannelType.GuildCategory,
        name: `Server Stats`,
      });

      categoryId = category.id;
    } else {
      categoryId = dbCategory.category;
    }

    let channelsArr = [];

    const channels = interaction.guild.channels.cache;

    if (dbCategory && dbCategory.channels[0]) {
      dbCategory.channels.forEach(async (channel) => {
        const channelExist = channels
          .map((channel) => channel.id)
          .includes(channel.id);

        if (!channelExist) return;

        const getChannel = await interaction.guild.channels.fetch(channel.id);
        await getChannel.delete();
      });

      channelsArr = await createChannels(interaction, channelType, categoryId);
    } else {
      channelsArr = await createChannels(interaction, channelType, categoryId);
    }

    await db.set(`${interaction.guild.id}-settings`, {
      category: categoryId,
      channels: channelsArr,
    });

    await interaction.reply({
      ephemeral: true,
      content: "Successfully setupped all channels",
    });
  },
};
