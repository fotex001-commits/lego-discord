const http = require("http");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const vinted = require("vinted-api");

const PORT = process.env.PORT || 10000;
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const MIN_PROFIT = Number(process.env.MIN_PROFIT || 30);
const CHECK_MINUTES = Number(process.env.CHECK_MINUTES || 5);

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("LEGO Sniper działa!");
}).listen(PORT);

if (!TOKEN || !CHANNEL_ID) {
  console.error("Brakuje DISCORD_TOKEN lub DISCORD_CHANNEL_ID.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const sentOffers = new Set();

/*
  Wyszukiwanie ofert Vinted.
  Na początek szukamy LEGO po słowie "LEGO".
*/
async function getVintedOffers() {
  const searchUrl =
    "https://www.vinted.pl/catalog?search_text=LEGO&order=newest_first";

  try {
    const posts = await vinted.search(searchUrl);

    if (!Array.isArray(posts)) {
      console.log("Vinted nie zwróciło tablicy ofert.");
      return [];
    }

    return posts.map((item, index) => {
      const price = Number(
        String(item.price || item.price_numeric || "0")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      );

      return {
        id: String(item.id || item.url || index),
        title: item.title || "LEGO",
        buyPrice: price,
        url: item.url || item.link || "https://www.vinted.pl/"
      };
    }).filter(item => item.buyPrice > 0);

  } catch (error) {
    console.error("Błąd Vinted API:", error);
    return [];
  }
}

/*
  Na tym etapie nie mamy jeszcze wiarygodnej ceny odsprzedaży.
  Dlatego ustawiamy ją tymczasowo na podstawie ceny zakupu,
  żeby sprawdzić, czy wyszukiwanie Vinted działa.
*/
function calculateResalePrice(buyPrice) {
  return buyPrice + 50;
}

async function checkOffers() {
  console.log("Sprawdzam nowe oferty LEGO...");

  const channel = await client.channels.fetch(CHANNEL_ID);
  const offers = await getVintedOffers();

  console.log(`Znaleziono ofert: ${offers.length}`);

  for (const offer of offers) {
    const resalePrice = calculateResalePrice(offer.buyPrice);
    const profit = resalePrice - offer.buyPrice;

    if (profit < MIN_PROFIT) continue;
    if (sentOffers.has(offer.id)) continue;

    sentOffers.add(offer.id);

    const embed = new EmbedBuilder()
      .setTitle("🧱 LEGO — OKAZJA")
      .setDescription(`**${offer.title}**`)
      .addFields(
        {
          name: "Cena Vinted",
          value: `${offer.buyPrice.toFixed(2)} zł`,
          inline: true
        },
        {
          name: "Szacowana odsprzedaż",
          value: `${resalePrice.toFixed(2)} zł`,
          inline: true
        },
        {
          name: "Potencjalny zysk",
          value: `**${profit.toFixed(2)} zł**`,
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

  await checkOffers();

  setInterval(async () => {
    await checkOffers();
  }, CHECK_MINUTES * 60 * 1000);
});

client.login(TOKEN);
