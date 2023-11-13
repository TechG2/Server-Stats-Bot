const channelUpdate = require("../../utils/channelUpdate");

module.exports = {
  async execute(interaction) {
    await channelUpdate(interaction);
  },
};
