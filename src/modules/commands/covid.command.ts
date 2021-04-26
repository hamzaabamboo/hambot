import { Injectable } from '@nestjs/common';
import { BaseCommand } from './command.base';
import { Message } from '../messages/messages.model';
import { CovidService } from '../covid/covid.service';
import { ModuleRef } from '@nestjs/core';
import moment from 'moment';

@Injectable()
export class CovidCommand extends BaseCommand {
  public command = /^(covid|cov)/i;
  constructor(private covid: CovidService) {
    super();
  }

  async handle(message: Message) {
    const data = await this.covid.getCovidData();
    const msg = this.covid.generateCovidMessageToScarePeople(data, (data) => {
      return `สถานการณ์ COVID-19 ${moment(
        data.UpdateDate,
        'DD/MM/yyyy HH:mm',
      ).format('DD/MM/yyyy')}
ผู้ติดเชื่อ: ${data.Confirmed} (+${data.NewConfirmed})
หายแล้ว: ${data.Recovered} (+${data.NewRecovered})
รักษาอยู่ในรพ.: ${data.Hospitalized} (+${data.NewHospitalized})
เสียชีวิต: ${data.Deaths} (+${data.NewDeaths})
        `;
    });
    return msg;
  }
}
