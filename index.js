var ncToken;
var type;
var zrToken;

const ReCaptchaBypass = require('recaptcha-bypass')
const fs = require('fs')
const { ZenRows } = require("zenrows");
const puppeteer = require('puppeteer');
const gradient = require('gradient-string');
const path = require('path');
const { nopecha, zenrows } = require('./configuration.json');
const recaptchaBypass = require('recaptcha-bypass');

let color = gradient(['#9a92dc', '#4c3dca', '#bd61af', '#cda9c8'])

async function checkAlt(username, password) {
  const reCaptchaBypass = new ReCaptchaBypass("https://www.google.com/recaptcha/api2/anchor?ar=1&k=6LcHLH8mAAAAAMTsFRAk0M-82phr7G7f4-rOqYyt&co=aHR0cHM6Ly9pZC5taW5lZmMuY29tOjQ0Mw..&hl=en&v=MHBiAvbtvk5Wb2eTZHoP1dUd&size=invisible&cb=lsc7xulpfido")
  const capToken = await reCaptchaBypass.bypass()
}

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
  if (process.argv.length < 3) {
    console.log(color("usage: node rylzgen.js type"))
    console.log(color("types: heromc, minefc"))
    process.exit()
  }
  ncToken = nopecha;
  zrToken = zenrows;
  type = process.argv[2]
} else {
  if (process.argv.length < 5) {
    console.log(color("usage: node rylzgen.js nopechatoken zenrowstoken type"))
    console.log(color("types: heromc, minefc"))
    process.exit()
  }
  ncToken = process.argv[2]
  zrToken = process.argv[3]
  type = process.argv[4]
}

function random(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
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


(async () => {
  const pathToExtension = path.join(process.cwd(), 'nopecha');
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });
  const page = await browser.newPage();

  await page.goto(`https://nopecha.com/setup#${ncToken}|keys=|enabled=true|disabled_hosts=|hcaptcha_auto_open=true|hcaptcha_auto_solve=true|hcaptcha_solve_delay=true|hcaptcha_solve_delay_time=3000|recaptcha_auto_open=true|recaptcha_auto_solve=true|recaptcha_solve_delay=false|recaptcha_solve_delay_time=0|funcaptcha_auto_open=true|funcaptcha_auto_solve=true|funcaptcha_solve_delay=true|funcaptcha_solve_delay_time=1000|awscaptcha_auto_open=false|awscaptcha_auto_solve=false|awscaptcha_solve_delay=true|awscaptcha_solve_delay_time=1000|turnstile_auto_solve=true|turnstile_solve_delay=true|turnstile_solve_delay_time=1000|perimeterx_auto_solve=false|perimeterx_solve_delay=true|perimeterx_solve_delay_time=1000|textcaptcha_auto_solve=false|textcaptcha_solve_delay=true|textcaptcha_solve_delay_time=100|textcaptcha_image_selector=|textcaptcha_input_selector=`);
  await page.setViewport({ width: 1080, height: 1024 });
  const client = new ZenRows(`${zrToken}`);
  const username = `${random(10)}r`

  if (type == "heromc") {
    await page.goto('https://heromc.net');
    await page.goto('https://id.heromc.net/member/dangky.php');
    const csrfToken = await page.$eval('input[name="token"]', el => el.value)
    const cookies = await page.cookies();
    const PHPSESS = cookies.find(cookie => cookie.name === 'PHPSESSID');
    const capToken = await waitCapToken(page)
    const headers = {
      "Cookie": `PHPSESSID=${PHPSESS.value}`,
    };
    const postData = `type=dangky&username=${username}&password=12312312&passc=12312312&email=nodjsenj@gmail.com&token=${csrfToken}&captcha=${capToken}`;
    try {
      const { data } = await client.post("https://id.heromc.net/member/xuly.php", {
        "premium_proxy": "true",
        "proxy_country": "vn",
        "original_status": "true",
        "custom_headers": "true",
      }, { headers, data: postData });
      if (data.status == "ok") {
        console.log(username)
      } else {
        console.log(`Error: ${data.status}`)
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
        console.log(username)
      } else {
        console.log(`Error: ${data.status}`)
      }
    } catch (error) {
      console.error(error.message);
      if (error.response) {
        console.error(error.response.data);
      }
    }
  }

  await browser.close();
})();
