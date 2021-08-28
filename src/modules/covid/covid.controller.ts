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
  @Header('content-disposition', 'attachment; filename=qrcode.png')
  async getCovidSummary(@Res() res: FastifyReply) {
    const data = await this.covid.getCovidData();
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    let currentHeight = PADDING;
    ctx.fillStyle = 'red';
    currentHeight = HEIGHT / 2;
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
      `(+${data.NewConfirmed})`,
      ctx,
    );
    ctx.fillStyle = 'green';
    ctx.fillRect(
      PADDING,
      HEIGHT / 2 + PADDING,
      WIDTH / 3 - 2 * PADDING,
      HEIGHT / 2 - 2 * PADDING,
    );
    ctx.font = '24px Noto';
    printTextInTheMiddle(WIDTH / 6, (5 * HEIGHT) / 8, `Recovered`, ctx);
    ctx.font = 'bold 40px Noto';
    printTextInTheMiddle(
      WIDTH / 6,
      (3 * HEIGHT) / 4,
      String(data.Recovered),
      ctx,
    );
    ctx.font = '30px Noto';
    printTextInTheMiddle(
      WIDTH / 6,
      (7 * HEIGHT) / 8,
      `(+${data.NewRecovered})`,
      ctx,
    );
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
      `(+${data.NewHospitalized})`,
      ctx,
    );
    ctx.fillStyle = 'grey';
    ctx.fillRect(
      (2 * WIDTH) / 3 + PADDING,
      HEIGHT / 2 + PADDING,
      WIDTH / 3 - 2 * PADDING,
      HEIGHT / 2 - 2 * PADDING,
    );
    ctx.font = '24px Noto';
    printTextInTheMiddle((5 * WIDTH) / 6, (5 * HEIGHT) / 8, `Death`, ctx);
    ctx.font = 'bold 40px Noto';
    printTextInTheMiddle(
      (5 * WIDTH) / 6,
      (3 * HEIGHT) / 4,
      String(data.Deaths),
      ctx,
    );
    ctx.font = '30px Noto';
    printTextInTheMiddle(
      (5 * WIDTH) / 6,
      (7 * HEIGHT) / 8,
      `(+${data.NewDeaths})`,
      ctx,
    );

    res.send(canvas.createPNGStream());
  }
}

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
