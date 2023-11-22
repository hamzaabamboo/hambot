import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import moment, { Moment } from 'moment';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app-config.service';
import { Message } from '../../../src/modules/messages/messages.model';
import { PushService } from '../../../src/modules/push/push.service';

interface COVIDAPIResult {
  Confirmed: number;
  Recovered: number;
  Hospitalized?: number;
  Deaths: number;
  NewConfirmed: number;
  NewRecovered: number;
  NewHospitalized?: number;
  NewDeaths: number;
  UpdateDate: string;
}

type MOPHAPIResult = {
  year: number;
  weeknum: number;
  new_case: number;
  total_case: number;
  new_case_excludeabroad: number;
  total_case_excludeabroad: number;
  new_recovered: number;
  total_recovered: number;
  new_death: number;
  total_death: number;
  case_foreign: number;
  case_prison: number;
  case_walkin: number;
  case_new_prev: number;
  case_new_diff: number;
  death_new_prev: number;
  death_new_diff: number;
  update_date: string;
}[];

const parseAPI = (result: MOPHAPIResult): COVIDAPIResult => {
  const {
    total_case,
    total_recovered,
    total_death,
    new_recovered,
    case_new_diff,
    death_new_diff,
    update_date,
  } = result[0];
  return {
    Confirmed: total_case,
    Recovered: total_recovered,
    Deaths: total_death,
    NewConfirmed: case_new_diff,
    NewRecovered: new_recovered,
    NewDeaths: death_new_diff,
    UpdateDate: update_date,
  };
};

const GET_COVID_URL =
  'https://covid19.ddc.moph.go.th/api/Cases/today-cases-all';
// 'https://static.easysunday.com/covid-19/getTodayCases.json';
@Injectable()
export class CovidService {
  lastUpdated: Moment;
  lastCases: number;
  constructor(
    private http: HttpService,
    private push: PushService,
    private config: AppConfigService,
  ) {}

  @Cron('0 0 * * * *')
  async checkCovidData() {
    const data = await this.getCovidData();
    const date = moment(data.UpdateDate, 'DD/MM/yyyy HH:mm');
    if (
      (this.lastUpdated && !date.isAfter(this.lastUpdated)) ||
      (this.lastCases && data.Confirmed === this.lastCases)
    )
      return false;
    this.lastUpdated = date;
    this.lastCases = data.Confirmed;
    const msg = this.generateCovidMessageToScarePeople(data, (data) => {
      return `แถลงสถานการณ์ COVID-19 โดย ศบค. ประจำวันที่ ${date.format(
        'DD/MM/yyyy HH:mm',
      )} 
ผู้ติดเชื่อ: ${data.Confirmed} (+${data.NewConfirmed})
หายแล้ว: ${data.Recovered} (+${data.NewRecovered})
${
  data.Hospitalized &&
  `รักษาอยู่ในรพ.: ${data.Hospitalized} (+${data.NewHospitalized})`
}
เสียชีวิต: ${data.Deaths} (+${data.NewDeaths})
      `;
    });
    return this.push.push(msg, 'covid');
  }

  async getCovidData() {
    const { data } = await firstValueFrom(
      this.http.get<MOPHAPIResult>(GET_COVID_URL),
    );
    return parseAPI(data);
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
          url: this.config.PUBLIC_URL + 'covid/summary',
        },
      ],
    };
  }
}
