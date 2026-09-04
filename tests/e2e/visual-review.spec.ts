import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const output = 'tests/artifacts/2026-09-03-website-setup/review';
test.beforeAll(()=>mkdirSync(output,{recursive:true}));

test('保存主页、文章和搜索的代表性截图', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('./');
  await page.evaluate(()=>localStorage.removeItem('theme'));
  await page.reload();
  await page.screenshot({path:`${output}/homepage-light-desktop.png`,fullPage:true});
  await page.getByRole('button',{name:'切换主题'}).click();
  await page.screenshot({path:`${output}/homepage-dark-desktop.png`,fullPage:true});
  await page.goto('notes/cs285/policy-gradient/');
  await page.screenshot({path:`${output}/article-dark-desktop.png`,fullPage:true});
  await page.goto('./');
  await page.getByRole('button',{name:'搜索'}).click();
  await page.getByRole('searchbox').fill('策略梯度');
  await expect(page.getByRole('link',{name:/Fixture 策略梯度/})).toBeVisible();
  await page.screenshot({path:`${output}/search-chinese.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.goto('./');
  await page.evaluate(()=>localStorage.removeItem('theme'));
  await page.reload();
  await page.screenshot({path:`${output}/homepage-light-mobile.png`,fullPage:true});
});
