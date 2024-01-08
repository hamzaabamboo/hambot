import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { CovidService } from '../../../../__old__/deprecated/covid/covid.service';
import { Message } from '../../messages/messages.model';
import { BaseCommand } from '../command.base';

@Injectable()
export class CovidCommand extends BaseCommand {
  public name = 'covid';
  public command = /^(covid|cov)/i;
  constructor(private covid: CovidService) {
    super();
  }

  async handle(message: Message): Promise<Partial<Message>> {
    const data = await this.covid.getCovidData();
    const msg = this.covid.generateCovidMessageToScarePeople(data, (data) => {
      return `สถานการณ์ COVID-19 ${moment(
        data.UpdateDate,
        'DD/MM/yyyy HH:mm',
      ).format('DD/MM/yyyy HH:mm')}
ผู้ติดเชื่อ: ${data.Confirmed} (+${data.NewConfirmed})
หายแล้ว: ${data.Recovered} (+${data.NewRecovered})
รักษาอยู่ในรพ.: ${data.Hospitalized} (+${data.NewHospitalized})
เสียชีวิต: ${data.Deaths} (+${data.NewDeaths})
        `;
    });
    return msg;
  }
}
