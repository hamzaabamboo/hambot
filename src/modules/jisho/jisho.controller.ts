import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfigService } from 'src/config/app-config.service';
import { JishoService } from './jisho.service';

@Controller('jisho')
export class JishoController {
  constructor(
    private config: AppConfigService,
    private service: JishoService,
  ) {}

  @Get('/dictionaries')
  async getDictionaries(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    if (req.headers['x-jisho-secret'] !== this.config.AIBOU_SECRET) {
      return res.status(401).send('bye');
    }
    const r = await new Promise((resolve, reject) =>
      this.service.db.all(`select * from dictionary`, (err, row) => {
        if (err) reject(err);
        resolve(row);
      }),
    );

    return res.status(200).send(r);
  }
  @Get('/search')
  async query(
    @Query('q') query: string,
    @Query('dictionary') dictionaryId: number,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    if (req.headers['x-jisho-secret'] !== this.config.AIBOU_SECRET) {
      return res.status(401).send('bye');
    }

    if (!this.service.isEnabled) {
      return res.status(400).send('Not available lah');
    }

    if (query === undefined) {
      return res.status(400).send('query please');
    }
    const exactMatch: any[] = await new Promise((resolve, reject) =>
      this.service.db.all(
        `select * from entry where ${
          dictionaryId ? 'dictionary_id = $dictionary and' : ''
        } heading = $term order by LENGTH(heading) limit 10`,
        {
          $term: query,
          $dictionary: dictionaryId,
        },
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        },
      ),
    );

    const q: any[] = await new Promise((resolve, reject) =>
      this.service.db.all(
        `select * from entry where ${
          dictionaryId ? 'dictionary_id = $dictionary and' : ''
        } heading != $term and heading like $term order by LENGTH(heading) limit $limit`,
        {
          $term: `%${query}%`,
          $limit: 40,
          $dictionary: dictionaryId,
        },
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        },
      ),
    );

    res.status(200).send([...exactMatch, ...q]);
  }
}
