import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

client.once("ready", () => {
  console.log(`✅ MigraBOT está online com Gemini 2.0 Flash como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const pergunta = message.content.replace(/<@!?\\d+>/, "").trim();
  if (!pergunta) {
    message.reply("❓ Me mencione com uma pergunta.");
    return;
  }

  await message.channel.send("💬 Processando via Gemini 2.0 Flash...");

  try {
    const respostaGemini = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: pergunta }] }],
      }),
    });

    const dados = await respostaGemini.json();
    console.log("🔍 Resposta bruta Gemini:", dados);

    const textoResposta =
      dados?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") ||
      "⚠️ Não consegui gerar resposta.";

    message.reply(textoResposta);
  } catch (erro) {
    console.error("❌ Erro na API Gemini:", erro);
    message.reply("⚠️ Erro ao processar via Gemini.");
  }
});

client.login(process.env.DISCORD_TOKEN);
