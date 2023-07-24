import { Controller, Get, HttpException, Param, Res } from '@nestjs/common';
import { createReadStream, promises } from 'fs';
import { mkdirp } from 'mkdirp';
import { join } from 'path';

@Controller('files')
export class FileController {
  @Get(':name')
  async getFile(@Param('name') name: string, @Res() res: Response) {
    const tmpDir = join(__dirname, '../../../files/tmp');
    await mkdirp(tmpDir);
    if (!name) throw new HttpException('Name not supplied', 401);
    try {
      const file = await promises.open(join(tmpDir, name), 'r');
      if (!file) {
        throw new Error();
      }
      file.close();
      return createReadStream(join(tmpDir, name)).pipe(res as any);
    } catch {
      throw new HttpException('File not found', 404);
    }
  }
}
