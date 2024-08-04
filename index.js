const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const http = require("http");
const axios = require("axios");
const semver = require("semver");
const logger = require("./utils/log");
const { base64encode, base64decode } = require('nodejs-base64');

/////////////////////////////////////////////
//========= Check Node.js Version =========//
/////////////////////////////////////////////

const nodeVersion = semver.parse(process.version);
if (nodeVersion.major < 14) {
    logger(`Your Node.js ${process.version} is not supported. Node.js 14 or higher is required.`, "error");
    process.exit(1);
}

///////////////////////////////////////////////////////////
//========= Create website for dashboard/uptime =========//
///////////////////////////////////////////////////////////

const PORT = process.env.PORT || 3000; // Ensure PORT is set

const dashboard = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("HI! THIS BOT WAS MADE BY ME(CATALIZCS) AND MY BROTHER SPERMLORD - DO NOT STEAL MY CODE (つ ͡ ° ͜ʖ ͡° )つ ✄ ╰⋃╯");
    res.end();
});

dashboard.listen(PORT, () => {
    logger(`Dashboard server is running on port ${PORT}`, "[ INFO ]");
});

/////////////////////////////////////////////////////////
//========= Create start bot and make it loop =========//
/////////////////////////////////////////////////////////

function startBot(message) {
    if (message) logger(message, "[ INFO ]");

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "mirai.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit !== 0) {
            if (!global.countRestart) global.countRestart = 0;
            if (global.countRestart < 5) {
                logger("Restarting bot...", "[ INFO ]");
                global.countRestart += 1;
                startBot();
            } else {
                logger("Bot failed to start after 5 attempts.", "[ ERROR ]");
                process.exit(codeExit);
            }
        }
    });

    child.on("error", (error) => {
        logger(`An error occurred: ${error.message}`, "[ ERROR ]");
    });
}

function decode(data) {
    let decoded = base64decode(data);
    return decoded;
}

////////////////////////////////////////////////
//========= Check update from GitHub =========//
////////////////////////////////////////////////

const updateUrl = decode("WVVoU01HTklUVFpNZVRsNVdWaGpkVm95YkRCaFNGWnBaRmhPYkdOdFRuWmlibEpzWW01UmRWa3lPWFJNTWpGb1lWZG9NV1ZYU21oaWVUbE9ZVmhLYUdGVlNqVmpSMFo2WXpCa2FWbFhOSFppVjBad1ltazVkMWxYVG5KWlYyUnNURzF3ZW1JeU5EMD0=");
axios.get(updateUrl)
    .then((res) => {
        const local = JSON.parse(readFileSync(__dirname + '/version.json', 'utf8')); // Ensure path is correct
        if (semver.lt(local.version, res.data.version)) {
            logger('New update available. Updating...', "[ INFO ]");
            const updateProcess = spawn('node', ['update-script.js'], { cwd: __dirname, stdio: 'inherit' });
            updateProcess.on('exit', (code) => {
                if (code === 0) {
                    logger('Update complete. Restarting...', "[ INFO ]");
                    startBot();
                } else {
                    logger('Update failed. Restarting bot...', "[ ERROR ]");
                    startBot();
                }
            });
        } else {
            logger('No update needed. Starting bot...', "[ INFO ]");
            startBot();
        }
    })
    .catch(err => {
        logger(`Unable to check for updates: ${err.message}`, "[ CHECK UPDATE ]");
        startBot();
    });
