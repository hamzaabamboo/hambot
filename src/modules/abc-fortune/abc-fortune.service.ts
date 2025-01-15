import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import crypto from 'crypto';
import { join } from 'path';
import puppeteer from 'puppeteer';
import { AppConfigService } from 'src/config/app-config.service';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ABCFortuneService {
  static pushChannel = 'abc-fortune';

  constructor(
    private logger: AppLogger,
    private s3Service: S3Service,
    private push: PushService,
    private appConfig: AppConfigService,
  ) {
    logger.setContext('ABCFortune');
  }

  // Remind at 10am
  @Cron('0 0 0 * * *')
  async dailyReminder() {
    this.logger.verbose('Sending Daily Notification');
    this.push.push(
      {
        channel: '*',
        senderId: '',
        message: `Daily Apollo Bay Omikuji! https://hambot.ham-san.net/abc-fortune?token=${this.getTodayHash()}`,
        image: [
          {
            name: 'Fortune',
            url: `https://hambot.ham-san.net/abc-fortune?token=${this.getTodayHash()}`,
          },
        ],
      },
      ABCFortuneService.pushChannel,
    );
  }

  getTodayHash() {
    const hash = crypto
      .createHash('md5')
      .update(this.getFilename() + this.appConfig.SALT)
      .digest('hex');
    console.log(hash);
    return hash;
  }
  async getFortune() {
    if (
      await this.s3Service.checkFileExist(`abc-fortune/${this.getFilename()}`)
    ) {
      this.logger.verbose('Fortune found, using cache ...');
      const screenshot = this.s3Service.getFile(
        `abc-fortune/${this.getFilename()}`,
      );
      return screenshot;
    } else {
      this.logger.verbose('Fortune not found, fetching ...');
      const screenshot = await this.scrapeFortune();
      this.s3Service.uploadFile(screenshot, `abc-fortune/${screenshot.name}`);
      this.logger.verbose('Saving File...');
      return screenshot;
    }
  }

  async scrapeFortune() {
    const browser = await puppeteer.launch({
      browserWSEndpoint: this.appConfig.BROWSERLESS_URL,
    });

    this.logger.verbose('Accessing page...');
    const page = await browser.newPage();

    const url = 'https://event.artist-site.jp/apollobay/sp/cmn_fortune/3/';
    await page.goto(url);
    this.logger.verbose('Logging in...');

    await page.waitForSelector('input[name="form[id]"]');
    await page.type('input[name="form[id]"]', this.appConfig.ABC_USERNAME);
    await page.type('input[name="form[pass]"]', this.appConfig.ABC_PASSWORD);
    await page.click('input[type="submit"]');

    this.logger.verbose('Fetching kuji...');

    await page.waitForSelector('.block--btn input[type="submit"]');
    await page.click('.block--btn input[type="submit"]');

    await page.waitForSelector('.collection--detail-attention');
    const href = await page.evaluate((select) => {
      return document
        .querySelector(select)
        .getAttribute('src')
        .replace('/', '');
    }, 'figure.thumb img:first-child');

    this.logger.verbose('Sending Content...');
    const response = await page.goto(join(url, href.substring(1)));
    const content = await response.content();

    page.close();
    return new File([content], this.getFilename());
  }

  getFilename(date: Date = new Date()) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.png`;
  }
}
