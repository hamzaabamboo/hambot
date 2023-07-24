import { Controller, Get, Header, Res } from '@nestjs/common';
import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import { FastifyReply } from 'fastify/types/reply';
import { CovidService } from './covid.service';

const PADDING = 19;
const WIDTH = 690;
const HEIGHT = 420;

@Controller('covid')
export class CovidController {
  constructor(private covid: CovidService) {}
  @Get('summary')
  @Header('content-type', 'image/png')
  // @Header('content-disposition', 'attachment; filename=qrcode.png')
  async getCovidSummary() {
    const data = await this.covid.getCovidData();
    console.log(data);
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    let currentHeight = PADDING;
    ctx.fillStyle = 'red';
    currentHeight = HEIGHT / 2;
    // TOP LINE
    ctx.fillRect(
      PADDING,
      PADDING,
      WIDTH - 2 * PADDING,
      currentHeight - 2 * PADDING,
    );
    ctx.font = 'bold 40px Noto';
    printTextInTheMiddle(WIDTH / 2, HEIGHT / 4, String(data.Confirmed), ctx);
    ctx.font = '24px Noto';
    printTextInTheMiddle(WIDTH / 2, HEIGHT / 8, `Total Cases`, ctx);
    ctx.font = '30px Noto';
    printTextInTheMiddle(
      WIDTH / 2,
      (3 * HEIGHT) / 8,
      `(${printNumberWithSign(data.NewConfirmed)})`,
      ctx,
    );

    // Second Line
    ctx.fillStyle = 'green';
    ctx.fillRect(
      PADDING,
      HEIGHT / 2 + PADDING,
      (data.Hospitalized ? WIDTH / 3 : WIDTH / 2) - 2 * PADDING,
      HEIGHT / 2 - 2 * PADDING,
    );
    ctx.font = '24px Noto';
    printTextInTheMiddle(
      data.Hospitalized ? WIDTH / 6 : WIDTH / 4,
      (5 * HEIGHT) / 8,
      `Recovered`,
      ctx,
    );
    ctx.font = 'bold 40px Noto';
    printTextInTheMiddle(
      data.Hospitalized ? WIDTH / 6 : WIDTH / 4,
      (3 * HEIGHT) / 4,
      String(data.Recovered),
      ctx,
    );
    ctx.font = '30px Noto';
    printTextInTheMiddle(
      data.Hospitalized ? WIDTH / 6 : WIDTH / 4,
      (7 * HEIGHT) / 8,
      `(${printNumberWithSign(data.NewRecovered)})`,
      ctx,
    );

    if (data.Hospitalized) {
      ctx.fillStyle = 'blue';
      ctx.fillRect(
        WIDTH / 3 + PADDING,
        HEIGHT / 2 + PADDING,
        WIDTH / 3 - 2 * PADDING,
        HEIGHT / 2 - 2 * PADDING,
      );
      ctx.font = '24px Noto';
      printTextInTheMiddle(WIDTH / 2, (5 * HEIGHT) / 8, `Hospitalized`, ctx);
      ctx.font = 'bold 40px Noto';
      printTextInTheMiddle(
        WIDTH / 2,
        (3 * HEIGHT) / 4,
        String(data.Hospitalized),
        ctx,
      );
      ctx.font = '30px Noto';
      printTextInTheMiddle(
        WIDTH / 2,
        (7 * HEIGHT) / 8,
        `(${printNumberWithSign(data.NewHospitalized)})`,
        ctx,
      );
    }
    ctx.fillStyle = 'grey';
    ctx.fillRect(
      (data.Hospitalized ? (2 * WIDTH) / 3 : WIDTH / 2) + PADDING,
      HEIGHT / 2 + PADDING,
      (data.Hospitalized ? WIDTH / 3 : WIDTH / 2) - 2 * PADDING,
      HEIGHT / 2 - 2 * PADDING,
    );
    ctx.font = '24px Noto';
    printTextInTheMiddle(
      data.Hospitalized ? (5 * WIDTH) / 6 : (3 * WIDTH) / 4,
      (5 * HEIGHT) / 8,
      `Death`,
      ctx,
    );
    ctx.font = 'bold 40px Noto';
    printTextInTheMiddle(
      data.Hospitalized ? (5 * WIDTH) / 6 : (3 * WIDTH) / 4,
      (3 * HEIGHT) / 4,
      String(data.Deaths),
      ctx,
    );
    ctx.font = '30px Noto';
    printTextInTheMiddle(
      data.Hospitalized ? (5 * WIDTH) / 6 : (3 * WIDTH) / 4,
      (7 * HEIGHT) / 8,
      `(${printNumberWithSign(data.NewDeaths)})`,
      ctx,
    );

    return canvas.createPNGStream();
  }
}

const printNumberWithSign = (number: number) => {
  return number >= 0 ? `+${number}` : number;
};

const printTextInTheMiddle = (
  w: number,
  h: number,
  text: string,
  ctx: CanvasRenderingContext2D,
) => {
  const dim = ctx.measureText(text);
  ctx.fillStyle = 'white';
  ctx.fillText(text, w - dim.width / 2, h + dim.actualBoundingBoxAscent / 2);
};
