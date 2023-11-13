const { QuickDB } = require("quick.db");
const db = new QuickDB();

async function channelUpdate(interaction) {
  const dbCategory = await db.get(`${interaction.guild.id}-settings`);
  if (!dbCategory && !dbCategory.channels[0]) return;

  // Get stats
  const members = await interaction.guild.members.fetch({
    limit: interaction.guild.memberCount,
  });
  const bots = await members
    .filter((member) => member.user.bot)
    .map((member) => member.id);

  const channels = interaction.guild.channels.cache;

  dbCategory.channels.forEach(async (channel) => {
    const channelExist = interaction.guild.channels.cache
      .map((channel) => channel.id)
      .includes(channel.id);
    if (!channelExist) return;

    let channelName = `${channel.name.replace(channel.name.split(":")[1], "")}`;
    const channelType = channelName.split(":")[0];

    const getChannel = await interaction.guild.channels.fetch(channel.id);

    if (channelType === "Members") {
      channelName += " " + interaction.guild.memberCount.toString();
      await getChannel.setName(channelName);
    } else if (channelType === "Bots") {
      channelName += " " + bots.length.toString();
      await getChannel.setName(channelName);
    } else if (channelType === "Channels") {
      channelName +=
        " " + channels.map((channel) => channel.id).length.toString();
      await getChannel.setName(channelName);
    }

    return channelName;
  });
}

module.exports = channelUpdate;
