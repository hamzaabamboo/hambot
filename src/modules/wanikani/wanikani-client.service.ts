import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AppLogger } from '../logger/logger';
import {
  WanikaniAssignmentQueryArguments,
  WanikaniAssignmentResponse,
  WanikaniSubjectResponse,
  WanikaniSubjectsQueryArguments,
  WanikaniUser,
  WanikaniUserResponse,
} from './wanikani.types';
import qs from 'qs';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class WanikaniClientService {
  static base_url = 'https://api.wanikani.com/v2/';

  private http: AxiosInstance;

  constructor(
    config: AppConfigService,
    private logger: AppLogger,
  ) {
    logger.setContext('WanikaniClient');

    this.logger.verbose('Initializing Wanikani Client');

    const token = config.WANIKANI_API_KEY;

    if (!token) throw new Error('Wanikani API not found');

    this.http = axios.create({
      baseURL: WanikaniClientService.base_url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      paramsSerializer: (params: any) => {
        return qs.stringify(params, {
          arrayFormat: 'comma',
          encode: false,
          encodeValuesOnly: true,
          indices: false,
        });
      },
    });

    this.init();
  }

  async init() {
    this.logger.verbose('Getting user info');
    const {
      data: { username },
    } = await this.getUser();
    this.logger.verbose(`Logged in as ${username}`);
  }

  async getUser(): Promise<WanikaniUserResponse> {
    const { data } = await this.http.get<WanikaniUserResponse>('user');
    return data;
  }

  async getAssignments(
    options?: WanikaniAssignmentQueryArguments,
  ): Promise<WanikaniAssignmentResponse> {
    const { data } = await this.http.get<WanikaniAssignmentResponse>(
      'assignments',
      {
        params: options,
      },
    );
    return data;
  }

  async getSubjects(
    options?: WanikaniSubjectsQueryArguments,
  ): Promise<WanikaniSubjectResponse> {
    try {
      const { data } = await this.http.get<WanikaniSubjectResponse>(
        'subjects',
        {
          params: options,
        },
      );

      return data;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
    }
  }
}
