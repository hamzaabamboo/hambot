import { Injectable } from '@nestjs/common';
import ical, { VEvent } from 'node-ical';
import moment from 'moment';
import { CalendarEvent } from './events.model';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class IcalService {
  constructor(private http: HttpService) {}

  async getCalenderData(url: string): Promise<CalendarEvent[]> {
    const res = await lastValueFrom(this.http.get(url));
    const data = await ical.async.parseICS(res.data);
    return Object.values(data)
      .filter((d) => d.type === 'VEVENT')
      .map((d: VEvent) => ({
        id: d.uid as string,
        title: d.summary as string,
        startTime: moment(d.start as ical.DateWithTimeZone).toDate(),
        endTime: moment(d.end as ical.DateWithTimeZone).toDate(),
        description: d.description as string,
      }));
  }
}
