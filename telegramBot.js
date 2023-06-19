const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require('dotenv').config();


// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual Telegram Bot token
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Replace 'YOUR_WEATHERAPI_API_KEY' with your actual WeatherAPI API key
const apiKey = process.env.WEATHER_API;

// Handle incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the message is the weather command
  if (messageText.toLowerCase() === "/weather") {
    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=varna`
      );

      const weatherData = response.data;
      const weatherDescription = weatherData.current.condition.text;
      const temperature = weatherData.current.temp_c;

      const weatherMessage = `The weather in Varna: ${weatherDescription}\nTemperature: ${temperature}°C`;

      bot.sendMessage(chatId, weatherMessage);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      bot.sendMessage(chatId, "Failed to retrieve weather information.");
    }
  }

  // Check if the message is the getChatId command
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

// Handle other commands or events as needed

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
