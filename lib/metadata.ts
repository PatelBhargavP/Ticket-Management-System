// lib/metadata.ts

import { Priority, Status } from '@/models';
import { statuses } from './status.data';
import { priorities } from './priority.data';

export async function ensureMetadata() {
  const statusCount = await Status.countDocuments();
  if (statusCount === 0) {
    statuses.forEach(async status => {
        await Status.create(status);
    });
  } else {
    console.log('Status already exists');
  }
  const priorityCount = await Priority.countDocuments();
  if (priorityCount === 0) {
    priorities.forEach(async priority => {
        await Priority.create(priority);
    });
  } else {
    console.log('Status already exists');
  }
}
