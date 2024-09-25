import { AppDataSource } from 'database/sql';
import fs from 'fs';
import { m_projectsetting } from 'database/sql/schema';

const getData = async () => {
  await AppDataSource.initialize();

  let data = await m_projectsetting.find({
    select: [
      'prjSettName',
      'prjSettKey',
      'prjSettDisplayName',
      'prjSettConstant',
      'prjSettSortOrder',
      'prjSettActive',
    ],
  });

  fs.writeFileSync(
    'src/scripts/dbdata/data/data.json',
    JSON.stringify(data, null, 2)
  );
};

getData();
