import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
} from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { AppConfigService } from 'src/config/app-config.service';
import path from 'node:path';
import { mkdirp } from 'mkdirp';
import { writeFile, unlink } from 'node:fs/promises';
import { AppLogger } from '../logger/logger';
import moment from 'moment';

@Injectable()
export class GeminiService {
  private genAi: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;

  private model: GenerativeModel;

  constructor(
    config: AppConfigService,
    private logger: AppLogger,
  ) {
    this.genAi = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    this.fileManager = new GoogleAIFileManager(config.GEMINI_API_KEY);

    const PROMPT = `You are in charge of extracting data from image of a receipt/ bank statement. The text will mostly be in Japanese, please leave them as-is don't translate. Label the categories appropriately or leave blank. Ignore anything that has been greyed, striked through, or ignored. Output in CSV with the date,item,category,amount columns. Use english in places that is not item name. Put the date in YYYY/MM/DD format. Do not leave space, add commas or currency symbol to the amount. Use minus symbol and be clear whether the transaction is incoming or outgoing, by default if there is no symbol assume it's outgoing (minus sign). If there is a common prefix to the transaction name, remove them. Classify into the following categories: entertainment, food, groceries, shopping, transport or others if it doesn't belong to any of these. For relative dates, refer to dates in the receipt but if there is no clue, today is ${moment().format('YYYY/MM/DD')}`;

    this.model = this.genAi.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: PROMPT,
    });
  }
  /**
   * Uploads the given file to Gemini.
   *
   * See https://ai.google.dev/gemini-api/docs/prompting_with_media
   */
  private async uploadToGemini(path: string, mimeType: string) {
    this.logger.verbose('Uploading File to Gemini');
    const uploadResult = await this.fileManager.uploadFile(path, {
      mimeType,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
    return file;
  }

  async readReceipt(buffer: Buffer, mimetype: string) {
    this.logger.verbose('Storing Local Files');
    const tmpPath = path.join(__dirname, '../files/file/tmp');
    await mkdirp(tmpPath);

    const filePath = path.join(tmpPath, 'gemini-tmp');
    await writeFile(filePath, buffer);

    const f = await this.uploadToGemini(filePath, mimetype);

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    };

    this.logger.verbose('Generating Results');
    const result = await this.model.generateContent({
      generationConfig,
      contents: [
        {
          role: 'user',
          parts: [
            { text: '' },
            {
              fileData: {
                fileUri: f.uri,
                mimeType: f.mimeType,
              },
            },
          ],
        },
      ],
    });

    this.logger.verbose('Cleanup files');
    await this.fileManager.deleteFile(f.name);
    await unlink(filePath);

    const res = result.response
      .text()
      .replace('```csv\n', '')
      .replace('\n```', '');

    console.log(res);

    return res;
  }
}
