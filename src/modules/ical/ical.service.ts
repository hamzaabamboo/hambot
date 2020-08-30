import { Injectable, HttpService } from '@nestjs/common';
import ical from 'node-ical';
import moment from 'moment';
@Injectable()
export class IcalService {
  constructor(private http: HttpService) {}

  async getCalenderData(url: string): Promise<CalendarEvent[]> {
    const res = await this.http.get(url).toPromise();
    const data = await ical.async.parseICS(res.data);
    return Object.values(data).map(d => ({
      id: d.uid as string,
      title: d.summary as string,
      startTime: moment(d.start as ical.DateWithTimeZone).toDate(),
      endTime: moment(d.end as ical.DateWithTimeZone).toDate(),
      description: d.description as string,
    }));
  }
}
