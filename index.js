var ncToken;
var zrToken;

const input = require('prompt-sync')()
const fs = require('fs')
const { ZenRows } = require("zenrows");
const puppeteer = require('puppeteer');
const gradient = require('gradient-string');
const path = require('path');
const { nopecha, zenrows } = require('./configuration.json');

let color = gradient(['#9a92dc', '#4c3dca', '#bd61af', '#cda9c8'])

console.log(color(`
    ╔─────────────────────────────────────────────────╗
    │                                                 │
    │               __            _                   │
    │   _ __   ___ / _| __ _ _ __(_) ___  _   _ ___   │
    │  | '_ \\ / _ \\ |_ / _\\ | '__| |/ _ \\| | | / __|  │
    │  | | | |  __/  _| (_| | |  | | (_) | |_| \\__ \\  │
    │  |_| |_|\\___|_|  \\__,_|_|  |_|\\___/ \\__,_|___/  │
    │                                                 │
    ╚─────────────────────────────────────────────────╝
`))

if (fs.existsSync('configuration.json')) {
  if (process.argv.length < 2) {
    console.log(color("usage: node rylzgen.js type"))
    console.log(color("types: heromc, minefc"))
    process.exit()
  }
  ncToken = nopecha;
  zrToken = zenrows;
} else {
  if (process.argv.length < 4) {
    console.log(color("usage: node rylzgen.js nopechatoken zenrowstoken type"))
    console.log(color("types: heromc, minefc"))
    process.exit()
  }
  ncToken = process.argv[2]
  zrToken = process.argv[3]
}

function random(length) {
    let str = '';
    let chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}

function waitCapToken(page) {
  return new Promise((resolve) => {
    async function check() {
      if (await page.evaluate(() => grecaptcha.getResponse() !== "")) {
        resolve(await page.evaluate(() => grecaptcha.getResponse()));
      } else {
        setTimeout(check, 5000); // Check again after 5 seconds
      }
    }
    check();
  });
}

async function generate(type, username2, password) {
  if (username2.length > 16) return;

  const pathToExtension = path.join(process.cwd(), 'nopecha');
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      `--window-size=100,100`
    ],
  });
  const page = await browser.newPage();

  await page.goto(`https://nopecha.com/setup#${ncToken}|keys=|enabled=true|disabled_hosts=|hcaptcha_auto_open=true|hcaptcha_auto_solve=true|hcaptcha_solve_delay=true|hcaptcha_solve_delay_time=3000|recaptcha_auto_open=true|recaptcha_auto_solve=true|recaptcha_solve_delay=false|recaptcha_solve_delay_time=0|funcaptcha_auto_open=true|funcaptcha_auto_solve=true|funcaptcha_solve_delay=true|funcaptcha_solve_delay_time=1000|awscaptcha_auto_open=false|awscaptcha_auto_solve=false|awscaptcha_solve_delay=true|awscaptcha_solve_delay_time=1000|turnstile_auto_solve=true|turnstile_solve_delay=true|turnstile_solve_delay_time=1000|perimeterx_auto_solve=false|perimeterx_solve_delay=true|perimeterx_solve_delay_time=1000|textcaptcha_auto_solve=false|textcaptcha_solve_delay=true|textcaptcha_solve_delay_time=100|textcaptcha_image_selector=|textcaptcha_input_selector=`);
  await page.setViewport({ width: 1080, height: 1024 });
  const client = new ZenRows(`${zrToken}`);
  var username;
  if (username2 == "random") { 
    username = random(15)
  } else { 
    username = `${username2}_${random(15 - username2.length)}n`
  }

  if (type == "heromc") {
    await page.goto('https://heromc.net');
    await page.goto('https://id.heromc.net/member/dangky.php');
    const csrfToken = await page.$eval('input[name="token"]', el => el.value)
    const cookies = await page.cookies();
    const email = `nf${random(10)}@gmail.com`
    const PHPSESS = cookies.find(cookie => cookie.name === 'PHPSESSID');
    const capToken = await waitCapToken(page)
    const headers = {
      "Cookie": `PHPSESSID=${PHPSESS.value}`,
    };
    const postData = `type=dangky&username=${username}&password=${password}&passc=${password}&email=${email}&token=${csrfToken}&captcha=${capToken}`;
    try {
      const { data } = await client.post("https://id.heromc.net/member/xuly.php", {
        "premium_proxy": "true",
        "proxy_country": "vn",
        "original_status": "true",
        "custom_headers": "true",
      }, { headers, data: postData });
      if (data.status == "ok") {
        await browser.close();
        return `ok|${username}|${password}`
      } else {
        await browser.close();
        console.log(data)
        return `error|data.status`
      }
    } catch (error) {
      console.error(error.message);
      if (error.response) {
        console.error(error.response.data);
      }
    }

  } else if (type == "3fmc") {
    console.log("waiting for 3fmc to allow web register")
    process.exit()

    await page.goto('https://3fmc.com/register')
    const csrfToken = await page.$eval('input[name="csrf-token"]', el => el.value)
    const cookies = await page.cookies();
    const PHPSESS = cookies.find(cookie => cookie.name === 'PHPSESSID');
    const capToken = await waitCapToken(page)
    const headers = {
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://3fmc.com/register",
      "Origin": "https://3fmc.com",
      "Cookie": `PHPSESSID=${PHPSESS.value}`
    };
    const postData = `username=${username}&email=rylaziussus@gmail.com&password=12312312&passwordRe=12312312&g-recaptcha-response=${capToken}&csrf-token=${csrfToken}&insertAccounts=`;
    const posd = {
      "username": username,
      "email": `${random(10)}@gmail.com`,
      "password": "12312312",
      "passwordRe": "12312312",
      "g-recaptcha-response": capToken,
      "csrf-token": csrfToken,
      "insertAccounts": ""
    }

    console.log(username)
    console.log(csrfToken)
    console.log(PHPSESS.value)
    console.log(capToken)
    try {
      const { data } = await client.post("https://3fmc.com/register", {
        "custom_headers": "true"
      }, { headers, data: postData });
      console.log(username);
      console.log(data)
    } catch (error) {
      console.error(error.message);
      if (error.response) {
        console.error(error.response.data);
      }
    }
  } else if (type == "minefc") {
    await page.goto('https://id.minefc.com/member/dangky.php');
    const cookies = await page.cookies();
    const PHPSESS = cookies.find(cookie => cookie.name === 'PHPSESSID');
    const capToken = await waitCapToken(page)
    const headers = {
      "Cookie": `PHPSESSID=${PHPSESS.value}`,
    };
    const postData = `type=dangky&username=${username}&password=12312312&passc=12312312&email=nodjsenj@gmail.com&captcha=${capToken}`;
    try {
      const { data } = await client.post("https://id.minefc.com/member/xuly.php", {
        "premium_proxy": "true",
        "proxy_country": "vn",
        "original_status": "true",
        "custom_headers": "true",
      }, { headers, data: postData });
      if (data.status == "ok") {
        await browser.close();
        return `ok|${username}|${password}`
      } else {
        await browser.close();
        return `error|data.status`
      }
    } catch (error) {
      console.error(error.message);
      if (error.response) {
        console.error(error.response.data);
      }
    }
  }
}

function ask(what) {
  console.log(color(`    ╭─ ♥ ${new Date().getHours()}:${new Date().getMinutes()} | ${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()} | ${what}`))
  const ans = input(color`    ╰─ ~  `)
  return ans
}

const type = ask("Type")
const username = ask("Username (will be username_randomchars)")
const password = ask("Password")
const amount = ask("Amount")

let i = 0

/*

async function dump() {
  const promises = [];
  for (let j = 0; j < amount; j++) {
    promises.push(generate(type, username, password));
  }

  await Promise.all(promises).then(results => {
    results.forEach(acc => {
      const splitted = acc.split("|");
      if (splitted[0] == "error") {
        console.log("error", splitted[1]);
        console.log("retrying...");
      } else if (splitted[0] == "ok") {
        console.log("success", `${splitted[1]}:${splitted[2]}`);
      }
    });
  }).catch(error => {
    console.error("Error occurred:", error);
  });
}

dump();

parallel running (laggy asf)
*/

async function dump() {
  do {
      const acc = await generate(type, username, password)
      const splitted = acc.split("|")
      if (splitted[0] == "error") {
        console.log("error", splitted[1])
        console.log("retrying...")
      } else if (splitted[0] == "ok") {
        console.log(color(`success ${splitted[1]}:${splitted[2]}`))
        i++
      }
  } while (i < amount)
}

dump()