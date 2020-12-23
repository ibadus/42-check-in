# 42-Monitor

## 💬 Introduction

First of all, this project was aimed to help me joining the 42 school. I decided to code this small project after missing check-ins multiple times. Please bare in mind this project was coded in few hours after missing a check-in, so there might be some more optimized way to do it but i didn't wanted to waste a lot of time on it.

I tried to comment the code to help people comprehend the process of this small bot.

Do not use this project for malicious purposes, this wasn't the purpose.


## 🤔 How does it work ? 

⚠️ THIS BOT ONLY WORKS ON PARIS CHECKIN FOR THE MOMENT ⚠️

The idea of this small bot is to automate the check in process. To achieve that, the bot will try to login with the informations you provided with puppeteer using chromium (i did this because i didn't wanted to waste time on the session cookie with requests). After successfully logged in the bot will retrieve the session cookie. After retrieving this cookie, the bot will check every X time if there is a new check-in available. If so the bot will send you a discord webhook (+ a nice sound), will open a chromium window and will login and try to sign in the check-in for you !

## 🔔 How to use it
### 🗺️ Requirements :
- **NODE.JS** - Install Node.js [click here](https://nodejs.org/en/download/)
- **PACKAGES** - With npm install all the packages (run `npm install`) [help here](https://stackoverflow.com/questions/8367031/how-do-i-install-package-json-dependencies-in-the-current-directory-using-npm)
- **CHROMIUM** - Check if you have right version of Chromium (need to correspond to your Chrome version) [help here](https://www.npmjs.com/package/puppeteer)
  
### ⚙️ Setup the bot :
Head up to the `src` file, edit the config.json.
- **discord_webhook** : If you don't know what's a webhook [click here](https://support.discord.com/hc/fr/articles/228383668-Utiliser-les-Webhooks).
-  **email** : the one of your account
-  **password** : the one of your account
-  **retry_delay** : correspond to the delay in milliseconds (ms) that the bot will wait before refreshing while monitoring the check-ins.
- in `src\Bash Script` modify the `scripth.sh` by adding the path to the `src` after the `cd` command. You'll be now able to run the bot when starting your pc + execute it more easily.

💌 *If you have any questions/feedback about this project feel free to DM me on discord: ibadus#0300*