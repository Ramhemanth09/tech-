import puppeteer from 'puppeteer-core';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\RAM\\.gemini\\antigravity\\brain\\554c72da-6bdc-4826-8415-4e9640f51345';

async function runBrowserVerification() {
  console.log('[BROWSER] Launching headless Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('[PAGE LOG]', msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  // 1. Landing Page
  console.log('[BROWSER] Navigating to Landing Page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_landing.png'), fullPage: true });
  console.log('✓ Captured 01_landing.png');

  // 2. Marketplace Page
  console.log('[BROWSER] Navigating to Marketplace Page...');
  await page.goto('http://localhost:5173/marketplace', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_marketplace.png'), fullPage: true });
  console.log('✓ Captured 02_marketplace.png');

  // 3. Login Page
  console.log('[BROWSER] Navigating to Login Page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_login.png'), fullPage: true });
  console.log('✓ Captured 03_login.png');

  // Click Quick-Fill "Demo Buyer" button and submit login
  console.log('[BROWSER] Logging in as Demo Buyer...');
  const buyerBtn = await page.waitForSelector('button::-p-text(Demo Buyer)');
  await buyerBtn.click();
  await new Promise(r => setTimeout(r, 500));
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  // 4. Comparison Agent Page & Run Demo
  console.log('[BROWSER] Navigating to Comparison Agent...');
  await page.goto('http://localhost:5173/compare', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('[BROWSER] Clicking Run Mandatory Demo...');
  const demoBtn = await page.waitForSelector('button::-p-text(Run Mandatory Demo)');
  await demoBtn.click();

  // Wait 4 seconds for API response and render
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_comparison_agent_results.png'), fullPage: true });
  console.log('✓ Captured 04_comparison_agent_results.png');

  await browser.close();
  console.log('[BROWSER] Verification completed successfully. All screenshots saved to artifact directory.');
}

runBrowserVerification().catch((err) => {
  console.error('[BROWSER ERROR]', err);
  process.exit(1);
});
