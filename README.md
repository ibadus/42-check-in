# 42 Check-in Bot

```
Status :
Working ✅
```

## 💬 Introduction

First, this project aimed to help me join the 42 school. I decided to code this small project after missing check-ins multiple times. Please bear in mind this project was coded in a few hours after missing a check-in, so there might be some more optimized way to do it but I didn't want to waste a lot of time on it.

I tried to comment the code to help people comprehend the process of this small bot.

Do not use this project for malicious purposes.


## 🤔 How does it work? 

⚠️ THIS BOT ONLY WORKS ON PARIS CHECKIN AT THE MOMENT ⚠️

The idea of this small bot is to automate the check-in process. To achieve that, the bot will try to login with the information you provided with Puppeteer using Chromium (I did this because I didn't want to waste time on the session cookie with requests). After successfully logging in the bot will retrieve the session cookie. After retrieving this cookie, the bot will check every X time if there is a new check-in available. If so the bot will send you a discord webhook (+ a nice sound), will open a Chromium window, and will login and try to sign in the check-in for you!

## 🔔 How to use it
### 🗺️ Requirements :
- **NODE.JS** - Install Node.js [click here](https://nodejs.org/en/download/)
- **PACKAGES** - With npm install all the packages (run `npm install`) [help here](https://stackoverflow.com/questions/8367031/how-do-i-install-package-json-dependencies-in-the-current-directory-using-npm)
- **CHROMIUM** - Check if you have the right version of Chromium (need to correspond to your Chrome version) [help here](https://www.npmjs.com/package/puppeteer)
  
### ⚙️ Setup the bot :
Head up to the `src` file, and edit the config.json.
- **discord_webhook**: If you don't know what a webhook is, [click here](https://support.discord.com/hc/fr/articles/228383668-Utiliser-les-Webhooks).
-  **email**: the one of your account
-  **password**: the one of your account
-  **retry_delay**: corresponds to the delay in milliseconds (ms) that the bot will wait before refreshing while monitoring the check-ins.
- in `src\Bash Script` modify the `script.sh` by adding the path to the `src` after the `cd` command. You'll now be able to run the bot when starting your PC + execute it more easily.

💹 Now you're ready to start the bot with `node main`

💌 *If you have any questions/feedback about this project feel free to DM me on discord: ibadus#0300*

📨 *Need help? Or don't know how to setup? contact me here: [Click here to contact me](https://dub.sh/8TSUWut)*

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fibadus%2F42-check-in&count_bg=%23000000&title_bg=%23000000&icon=&icon_color=%23E7E7E7&title=views&edge_flat=false)](https://hits.seeyoufarm.com)
