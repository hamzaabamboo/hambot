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

    const q: any[] = await new Promise((resolve, reject) =>
      this.service.db.all(
        `SELECT id, temp.word_id, dictionary_id, kanji, reading, entry."text" FROM (
          SELECT DISTINCT word_id FROM entry WHERE ${
            dictionaryId ? 'dictionary_id = $dictionary and' : ''
          } instr(kanji, $term) OR instr(reading, $term) ORDER BY length(entry.kanji) ASC, length(entry.reading) ASC LIMIT $limit
        ) as temp 
        LEFT JOIN entry ON entry.word_id = temp.word_id
        ORDER BY length(entry.kanji) ASC, length(entry.reading) ASC`,
        {
          $term: `${query}`,
          $limit: 40,
          $dictionary: dictionaryId,
        },
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        },
      ),
    );

    res.status(200).send([...q]);
  }
}
