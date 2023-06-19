const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const apiKey = process.env.WEATHER_API;

// Handle incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText.toLowerCase() === "/weather") {
    try {
      const varnaResponse = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=varna`
      );

      const sofiaResponse = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=sofia`
      );

      const varnaData = varnaResponse.data;
      const sofiaData = sofiaResponse.data;

      const varnaWeatherDescription = varnaData.current.condition.text;
      const varnaTemperature = varnaData.current.temp_c;

      const sofiaWeatherDescription = sofiaData.current.condition.text;
      const sofiaTemperature = sofiaData.current.temp_c;

      const weatherMessage = `The weather in Varna is:\nDescription: ${varnaWeatherDescription}\nTemperature: ${varnaTemperature}°C\n\nThe weather in Sofia is:\nDescription: ${sofiaWeatherDescription}\nTemperature: ${sofiaTemperature}°C`;

      bot.sendMessage(chatId, weatherMessage);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      bot.sendMessage(chatId, "Failed to retrieve weather information.");
    }
  }

  if (messageText.toLowerCase() === "/getchatid") {
    try {
      const chatIdResponse = await getChatId();
      bot.sendMessage(chatId, `Your chat ID: ${chatIdResponse}`);
    } catch (error) {
      console.error("Error retrieving chat ID:", error);
      bot.sendMessage(chatId, "Failed to retrieve chat ID.");
    }
  }
});

// Start the bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = "Welcome to your Telegram bot!";

  bot.sendMessage(chatId, welcomeMessage);
});


// Function to retrieve the chat ID
const getChatId = async () => {
  try {
    const updates = await bot.getUpdates();
    if (updates.length > 0) {
      const chatId = updates[0].message.chat.id;
      return chatId;
    } else {
      throw new Error("No updates found. Send a message to your bot first.");
    }
  } catch (error) {
    throw new Error("Error retrieving chat ID:", error);
  }
};

// Run the bot
console.log("Telegram bot is running...");
