import { chromium } from "playwright";
for (const opts of [{ channel: "chromium" }, { executablePath: "/opt/pw-browsers/chromium" }]) {
  try {
    const browser = await chromium.launch(opts);
    const page = await browser.newPage();
    const r = await page.goto("https://www.planity.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
    console.log(JSON.stringify(opts), "OK", r?.status(), await page.title());
    await browser.close();
  } catch (e) { console.log(JSON.stringify(opts), "ERR", e.message.split("\n")[0]); }
}
