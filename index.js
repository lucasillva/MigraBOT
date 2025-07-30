import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import express from "express";

dotenv.config();

// Inicializa cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Configuração da API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Inicializa servidor Express para manter ativo no Render
const app = express();
app.get("/", (req, res) => res.send("MigraBOT está rodando!"));
app.listen(3000, () => console.log("🌐 Web Service ativo na porta 3000"));

// Evento quando bot está online
client.once("ready", () => {
  console.log(`✅ MigraBOT está online com Gemini 2.0 Flash como ${client.user.tag}`);
});

// Evento para mensagens
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  // Remove menção e deixa só a pergunta
  const pergunta = message.content.replace(/<@!?\d+>/, "").trim();
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

// Login do bot no Discord
client.login(process.env.DISCORD_TOKEN);
