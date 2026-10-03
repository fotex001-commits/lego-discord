const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const FEED_URL = process.env.FEED_URL || "https://example.com/offers.json";

const MIN_PROFIT = Number(process.env.MIN_PROFIT || 30);
const CHECK_MINUTES = Number(process.env.CHECK_MINUTES || 5);

if (!TOKEN || !CHANNEL_ID) {
  console.error("Brakuje zmiennych środowiskowych.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const sentOffers = new Set();

async function getOffers() {
  return [
    {
      id: "test-1",
      title: "TEST LEGO 75300",
      buyPrice: 50,
      resalePrice: 100,
      profit: 50,
      url: "https://www.vinted.pl/"
    }
  ];
}
  const channel = await client.channels.fetch(CHANNEL_ID);
  const offers = await getOffers();

  for (const offer of offers) {
    if (offer.profit < MIN_PROFIT) continue;
    if (sentOffers.has(offer.id)) continue;

    sentOffers.add(offer.id);

    const embed = new EmbedBuilder()
      .setTitle("🧱 LEGO — OKAZJA")
      .setDescription(`**${offer.title}**`)
      .addFields(
        {
          name: "Cena zakupu",
          value: `${offer.buyPrice.toFixed(2)} zł`,
          inline: true
        },
        {
          name: "Cena odsprzedaży",
          value: `${offer.resalePrice.toFixed(2)} zł`,
          inline: true
        },
        {
          name: "Potencjalny zysk",
          value: `**${offer.profit.toFixed(2)} zł**`,
          inline: true
        }
      )
      .setURL(offer.url)
      .setTimestamp();

    await channel.send({
      embeds: [embed]
    });
  }
}

client.once("ready", async () => {
  console.log(`Bot zalogowany jako ${client.user.tag}`);

  try {
    await checkOffers();
  } catch (error) {
    console.error(error);
  }

  setInterval(async () => {
    try {
      await checkOffers();
    } catch (error) {
      console.error(error);
    }
  }, CHECK_MINUTES * 60 * 1000);
});

client.login(TOKEN);
