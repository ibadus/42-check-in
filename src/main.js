/** 
 *   _  _ ___    __  __  ____  _   _ _____ _____ _______ ____  _____  
 *  | || |__ \  |  \/  |/ __ \| \ | |_   _|_   _|__   __/ __ \|  __ \ 
 *  | || |_ ) | | \  / | |  | |  \| | | |   | |    | | | |  | | |__) |
 *  |__   _/ /  | |\/| | |  | | . ` | | |   | |    | | | |  | |  _  / 
 *     | |/ /_  | |  | | |__| | |\  |_| |_ _| |_   | | | |__| | | \ \ 
 *     |_|____| |_|  |_|\____/|_| \_|_____|_____|  |_|  \____/|_|  \_\ for check-in
 * 
 *                      LAST UPDATE : 23/12/2020
 * 
 * 
 * 
 *                        AUTHOR : Ibadus#0300
 * 
 * Use option.json to login into your account to be notified for new check-in
 * You can use the bash script to start the monitor more easily / or run it when starting your PC
 * 
 */

const chalk = require('chalk');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const webhook = require('webhook-discord');
const puppeteer = require('puppeteer');
const moment = require('moment');
const sound = require('sound-play');
const path = require('path');
const soundPath = path.join(__dirname, 'success.mp3')

// PARAMS
const options = require('./option.json');
const { request } = require('http');
const UserA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36";
const login_url = "https://admissions.42.fr/users/sign_in";

async function main() {
    task = {};
    task.url = login_url;
    task.jar = require('request').jar();
    task.request = require('request').defaults({ jar: task.jar });
    task.counter = 1;
    // put check-in (up to 3) available to false
    task.inscription1 = false;
    task.inscription2 = false;
    task.inscription3 = false;
    console.log(chalk.white(`[${moment().format("HH:mm:ss")}] - Trying To Login...`));
    task.run = true;
    while(task.run) {
        // setup the browser for login
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: {
                width: 960,
                height: 1080
            }
        });
        // get the login cookie
        let cookies = await login(task, browser);
        // close the browser
        await browser.close()
        console.log(chalk.blue(`[${moment().format("HH:mm:ss")}] - Successful Login ! cookie : ${cookies}`));
        // start the monitor
        task.loop_monitor = true;
        while(task.loop_monitor) {
            // set the success to false to avoid webhook and browser spam
            task.success = false;
            // start the monitor
            await monitor(task, cookies);
            if(task.success){
                console.log(chalk.green(`[${moment().format("HH:mm:ss")}] - Checkin Available !`));
                // play sound
                sound.play(soundPath);
                // send webhook to server
                send_webhook();
                // open a browser that will try to sign up for you
                sign_up(task);
                
            }
            await sleep(options.retry_delay);
        }
        // wait 2sec before retrying to login
        sleep(2000);
        console.log("Re-Login");
    }
}

function login(task, browser) {
    return new Promise(async function(resolve, reject){
        // open a new tab
        const page = await browser.newPage();

        let loop = true;
        let req_done = false;
        while(loop) {
            req_done = false
            try{
                // go to login url
                await page.goto(task.url);
                // fill login form
                await page.type('#user_email', options.email);
                await page.type('#user_password', options.password);
                await page.click('[name="commit"]');
                // wait that page load
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                const cookies = await page.cookies()
                // check if cookie is good and if login worked
                if (cookies[0].value && page.url() != task.url) {
                    console.log('Cookie OK');
                    // store the logged in url to be reused
                    task.monitor_url = page.url();
                    // resolve the cookie
                    resolve(cookies[0].value);
                    loop = false;
                } else {
                    console.log(chalk.red(`[${moment().format("HH:mm:ss")}] - Error Geting Cookie, Retrying in ${options.retry_delay}ms...`));
                }
                req_done = true;
            }catch(err){
                console.log(chalk.red("error" + err));
                req_done = true;
                task.run = false;
            }
            await sleep(options.retry_delay);
            while(!req_done) await sleep(20);
        }
    })
}

function monitor(task, cookies) {
    return new Promise(async function(resolve, reject){
        let loop = true;
        let req_done = false;
        while(loop) {
            console.log(`[${moment().format("HH:mm:ss")}] - Monitoring...`);
            task.counter++
            if (task.counter == 1000) console.clear(); task.counter = 1;
            req_done = false;
            try{
                // get the content of the logged url to see if a check-in is available
                task.request.get({
                    url: task.monitor_url,
                    followAllRedirect: true,
                    headers: {
                        Connection: "keep-alive",
                        Cookie: `locale=fr; _admissions_session_production=${cookies}`,
                    }
                }, function(error, response, body){
                    $ = cheerio.load(body);
                    // check if account is disconnected
                    if ($('title').text == "42 Paris | Connexion") {
                        console.log(`[${moment().format("HH:mm:ss")}] - Disconected`);
                        // stop monitor to redo login
                        task.loop_monitor = false;
                        resolve()
                    }
                    // check if the body is from the good page
                    if (body.includes('Présentation')){
                        // get a list of the li elements that represent all the check-in available
                        let inscription = $('li.list-group-item')
                        // check for first check-in
                        if (inscription[0]) {
                            if (!task.inscription1) {
                                console.log(chalk.green(`[${moment().format("HH:mm:ss")}] - Check-in 1 available !`));
                                // allow webhook and browser
                                task.success = true;
                                // tell that this checkin exist to avoid spam ping
                                task.inscription1 = true;
                                // stop the current loop
                                loop = false;
                                resolve()
                            }
                        } else {
                            task.inscription1 = false;
                        }
                        // check for second check-in if the first exist
                        if (inscription[1]) {
                            if (!task.inscription1) {
                                console.log(chalk.green(`[${moment().format("HH:mm:ss")}] - Check-in 2 available !`));
                                // allow webhook and browser
                                task.success = true;
                                // tell that this checkin exist to avoid spam ping
                                task.inscription2 = true;
                                // stop the current loop
                                loop = false;
                                resolve()
                            }
                        } else {
                            task.inscription2 = false;
                        }
                        // check for third check-in if the first exist
                        if (inscription[2]) {
                            if (!task.inscription1) {
                                console.log(chalk.green(`[${moment().format("HH:mm:ss")}] - Check-in 3 available !`));
                                // allow webhook and browser
                                task.success = true;
                                // tell that this checkin exist to avoid spam ping
                                task.inscription3 = true;
                                // stop the current loop
                                loop = false;
                                resolve()
                            }
                        } else {
                            task.inscription3 = false;
                        }
                    }
                    req_done = true;
                })
            }catch(err){
                console.log(chalk.red("error" + err));
                req_done = true;
                task.run = false;
            }
            await sleep(options.retry_delay);
            while(!req_done) await sleep(20);
        }
    })
}

function sign_up(task) {
    return new Promise(async function(resolve, reject){
        // setup success browser to sign-in 
        let Browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            "args": [                
                "--start-maximized"           
            ]
        });
        // open new tab
        const page = await Browser.newPage();
        // go to login url
        await page.goto(task.url);
        // fill the form
        await page.type('#user_email', options.email);
        await page.type('#user_password', options.password);
        await page.click('[name="commit"]');
        // wait for page to load
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        // get body
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);
        // check if need to allow cookies
        if (bodyHTML.includes("allow cookies")) {
            await page.click('[aria-label="allow cookies"]');
        }
        // use "tabs" to sign-in
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        if (task.inscription2){
            await page.keyboard.press("Tab");
        }
        if (task.inscription3){
            await page.keyboard.press("Tab");
        }
        await page.keyboard.press("Enter");
        await sleep(1000)
        bodyHTML = await page.evaluate(() => document.body.innerHTML);
        if (bodyHTML.includes("Si tu te désinscris, tu devras recommencer cette étape du début.")) {
            console.log(chalk.green(`[${moment().format("HH:mm:ss")}] - Already Signed In !`));
            // close the browser in 1min
            await sleep(60000);
            Browser.close();
        } else{
            await page.keyboard.press("Enter");
            await sound.play(soundPath);
        }
        
    })
}

// PLEASE LET THIS DUNCTONS AS IT IS
function send_webhook() {
    const Hook = new webhook.Webhook(options.discord_webhook);
    const message = new webhook.MessageBuilder()
        .setName("42 Check-in Monitor")
        .setURL('https://admissions.42.fr/')
        .setTitle("CHECK-IN AVAILABLE ! GO GO GO")
        .setDescription("Foncez vous inscrire !")
        .setFooter("ibadus#0300", "https://cdn.discordapp.com/avatars/229160979823460353/abea57e5ab144046609d7308001806a1?size=2048")
        .setTime()
        .setText("<@&782346047199903804>");
    Hook.send(message);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main()