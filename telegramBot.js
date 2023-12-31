const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");
require('dotenv').config();

const botToken = process.env.BOT_TOKEN;
const apiKey = process.env.WEATHER_API;
const port = process.env.PORT || 3000;
const bot = new TelegramBot(botToken);
const HEROKU_URL = "https://telegram-weather-bot-41bc23e310cb.herokuapp.com/";

// Store the message counts for each user
const messageCounts = {};

const app = express();
app.use(express.json());

app.post(`/bot${botToken}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  bot.setWebHook(`${HEROKU_URL}bot${botToken}`);
  console.log(`Telegram bot is running on port ${port}`);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = "Welcome to your Telegram bot!";
  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/weather(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const city = match[1].trim();

  if (!city) {
    bot.sendMessage(chatId, "Please specify a city after the /weather command. Example: /weather Prague");
    return;
  }

  try {
    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`
    );

    const weatherData = response.data;
    const weatherDescription = weatherData.current.condition.text;
    const temperature = weatherData.current.temp_c;

    const weatherMessage = `Weather in ${city}:\nDescription: ${weatherDescription}\nTemperature: ${temperature}°C`;

    bot.sendMessage(chatId, weatherMessage);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    bot.sendMessage(chatId, "Failed to retrieve weather information.");
  }
});

bot.onText(/\/getchatid/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Your chat ID: ${chatId}`);
});

bot.onText(/\/getrank/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!messageCounts[chatId] || !messageCounts[chatId][userId]) {
    bot.sendMessage(chatId, "You haven't sent any messages in this chat yet.");
    return;
  }

  // Get the rankings based on message counts
  const rankings = Object.entries(messageCounts[chatId])
    .sort((a, b) => b[1] - a[1]) // Sort in descending order
    .map(([userId, count], index) => {
      const firstName = msg.from.first_name || 'Unknown';
      const lastName = msg.from.last_name || '';
      return `${index + 1}. ${firstName} ${lastName}: ${count} messages`;
    });

  // Find the user's rank
  const userRank = rankings.findIndex(([userId]) => userId === String(userId));

  // Create the ranking message
  const rankingMessage = rankings.length > 0
    ? `Your rank in this chat is ${userRank + 1} out of ${rankings.length} users.\n\nMessage Rankings:\n${rankings.join("\n")}`
    : "No messages sent yet.";

  bot.sendMessage(chatId, rankingMessage);
});


bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Increase the message count for the user in the chat
  if (!messageCounts[chatId]) {
    messageCounts[chatId] = {};
  }
  if (!messageCounts[chatId][userId]) {
    messageCounts[chatId][userId] = 0;
  }
  messageCounts[chatId][userId] += 1;
});
