import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import moment, { Moment } from 'moment';
import { join } from 'path';
import { Message } from '../messages/messages.model';
import { PushService } from '../push/push.service';

interface COVIDAPIResult {
  Confirmed: number;
  Recovered: number;
  Hospitalized: number;
  Deaths: number;
  NewConfirmed: number;
  NewRecovered: number;
  NewHospitalized: number;
  NewDeaths: number;
  UpdateDate: string;
}

const GET_COVID_URL = 'https://covid19.th-stat.com/api/open/today';
@Injectable()
export class CovidService {
  lastUpdated: Moment;
  constructor(
    private http: HttpService,
    private push: PushService,
    private config: ConfigService,
  ) {}

  @Cron('0 0 * * * *')
  async checkCovidData() {
    const data = await this.getCovidData();
    const date = moment(data.UpdateDate, 'DD/MM/yyyy HH:mm');
    if (this.lastUpdated && !date.isAfter(this.lastUpdated)) return false;
    this.lastUpdated = date;
    const msg = this.generateCovidMessageToScarePeople(data, (data) => {
      return `แถลงสถานการณ์ COVID-19 โดย ศบค. ประจำวันที่ ${date.format(
        'DD/MM/yyyy HH:mm',
      )} 
ผู้ติดเชื่อ: ${data.Confirmed} (+${data.NewConfirmed})
หายแล้ว: ${data.Recovered} (+${data.NewRecovered})
รักษาอยู่ในรพ.: ${data.Hospitalized} (+${data.NewHospitalized})
เสียชีวิต: ${data.Deaths} (+${data.NewDeaths})
      `;
    });
    return this.push.push(msg, 'covid');
  }

  async getCovidData() {
    const { data } = await this.http
      .get<COVIDAPIResult>(GET_COVID_URL)
      .toPromise();
    return data;
  }

  generateCovidMessageToScarePeople(
    data: COVIDAPIResult,
    getMessage: (d: COVIDAPIResult) => string,
  ): Message {
    return {
      channel: '*',
      message: getMessage(data),
      image: [
        {
          name: 'Summary ' + moment().format('DD/MM/yyyy, HH:mm') + '.png',
          url: this.config.get('PUBLIC_URL') + 'covid/summary',
        },
      ],
    };
  }
}
