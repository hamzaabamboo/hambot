import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';
import { AppLogger } from '../logger/logger';
import { PushService } from '../push/push.service';
import { WanikaniClientService } from './wanikani-client.service';
import {
  WanikaniAssignment,
  WanikaniObject,
  WanikaniSubjectType,
} from './wanikani.types';

@Injectable()
export class WanikaniService {
  static pushChannel = 'wanikani';

  constructor(
    private logger: AppLogger,
    private push: PushService,
    private wanikani: WanikaniClientService,
  ) {
    logger.setContext('WanikaniService');
  }

  // Remind at 10am
  @Cron('0 0 3 * * *')
  async dailyReminder() {
    this.logger.verbose('Sending Notification');
    const data = await this.wanikani.getAssignments({
      available_before: moment().endOf('day').toDate(),
    });

    const availableNow = data.data.filter((a) =>
      moment().isAfter(moment(a.data.available_at)),
    );

    const getAssignmentTypeCount = (
      data: WanikaniObject<WanikaniAssignment>[],
      type: WanikaniSubjectType,
    ) => {
      return data.filter((a) => a.data.subject_type === type).length;
    };

    const words = await this.wanikani.getSubjects({
      ids: data.data.map((d) => d.data.subject_id),
    });

    await this.push.push(
      {
        channel: '*',
        message: `Daily Wanikani Reminder ! ${moment().format('DD/MM/YYYY')}
You have ${data.total_count} reviews today. (${getAssignmentTypeCount(
          data.data,
          'radical',
        )} radical/${getAssignmentTypeCount(
          data.data,
          'kanji',
        )} kanji/${getAssignmentTypeCount(data.data, 'vocabulary')} vocab)
${availableNow.length} available now (${getAssignmentTypeCount(
          availableNow,
          'radical',
        )} radical/${getAssignmentTypeCount(
          availableNow,
          'kanji',
        )} kanji/${getAssignmentTypeCount(availableNow, 'vocabulary')} vocab)\n
Go do it ! https://www.wanikani.com/
        `,
      },
      WanikaniService.pushChannel,
    );
  }
}

// ${
//   words.data.filter((d) => d.object === 'radical').length > 0
//     ? `Radicals:
// ${words.data
//   .filter((d) => d.object === 'kanji')
//   .map((d) => d.data.characters)
//   .join(', ')}`
//     : 'No Radicals'
// }
// ${
//   words.data.filter((d) => d.object === 'kanji').length > 0
//     ? `Kanji:
// ${words.data
//   .filter((d) => d.object === 'kanji')
//   .map((d) => d.data.characters)
//   .join(', ')}`
//     : 'No Kanji'
// }
// ${
//   words.data.filter((d) => d.object === 'vocabulary').length > 0
//     ? `Vocab:
// ${words.data
//   .filter((d) => d.object === 'vocabulary')
//   .map((d) => d.data.characters)
//   .join(', ')}`
//     : 'No Vocabulary'
// }
