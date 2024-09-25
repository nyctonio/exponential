import { EntityManager, ILike, In } from 'typeorm';
import { m_projectsetting } from 'database/sql/schema';
export type GetProjectSettings = {
  pageNumber: number;
  pageSize: number;
  prjSettKey: string;
  prjSettName: string;
  sort: {
    key:
      | 'prjSettKey'
      | 'prjSettName'
      | 'prjSettConstant'
      | 'prjSettDisplayName';
    value: 'ASC' | 'DESC';
  };
};

class ProjectSetting {
  project_setting_data: m_projectsetting[] | null = null;
  keys: string[] = null;
  tmanager: EntityManager = null;

  constructor(keys: string[] | null = null) {
    this.keys = keys;
  }

  async getProjectSettingByKeys() {
    if (!this.project_setting_data) {
      if (this.keys) {
        this.project_setting_data = await m_projectsetting.find({
          where: {
            prjSettActive: true,
            prjSettKey: In(this.keys),
          },
          order: { prjSettDisplayName: 'ASC', prjSettSortOrder: 'ASC' },
          select: [
            'id',
            'prjSettActive',
            'prjSettKey',
            'prjSettName',
            'prjSettDisplayName',
            'prjSettConstant',
            'prjSettSortOrder',
          ],
        });
        return this.project_setting_data;
      } else {
        throw new Error('Keys Invalid');
      }
    } else {
      return this.project_setting_data;
    }
  }

  async getProjectSettings(data: GetProjectSettings) {
    let sortObj = {};
    if (data.sort && data.sort.key) {
      sortObj[`${data.sort.key}`] = data.sort.value;
    }
    let [projectSettingsData, count] = await m_projectsetting.findAndCount({
      where: {
        prjSettName: ILike(`%${data.prjSettName}%`),
        prjSettKey: ILike(`%${data.prjSettKey}%`),
      },
      order: {
        ...sortObj,
      },
      select: [
        'id',
        'prjSettActive',
        'prjSettKey',
        'prjSettName',
        'prjSettDisplayName',
        'prjSettSortOrder',
        'prjSettConstant',
      ],
      skip: (data.pageNumber - 1) * data.pageSize,
      take: data.pageSize,
    });

    return { projectSettingsData, count };
  }

  async getDistinctKeys() {
    let settingsData = await m_projectsetting
      .createQueryBuilder('')
      .select('m_projectsetting.prjSettKey', 'prjSettKey')
      .distinct(true)
      .getRawMany();
    return settingsData;
  }

  async updateProjectSetting({
    id,
    displayValue,
    sortOrder,
    active,
  }: {
    id: number;
    displayValue: string;
    sortOrder: number;
    active: boolean;
  }) {
    let updatedSetting = await m_projectsetting.update(
      {
        id: id,
      },
      {
        prjSettDisplayName: displayValue,
        prjSettSortOrder: sortOrder,
        prjSettActive: active,
      }
    );
    return;
  }

  async createProjectSetting({
    applicationSettingKey,
    applicationSettingName,
    applicationSettingValue,
    applicationSettingDisplay,
    applicationSettingSort,
  }: {
    applicationSettingKey: string;
    applicationSettingName: string;
    applicationSettingValue: string;
    applicationSettingDisplay: string;
    applicationSettingSort: number;
  }) {
    let newProjectSetting = await m_projectsetting.insert({
      prjSettKey: applicationSettingKey,
      prjSettName: applicationSettingName,
      prjSettDisplayName: applicationSettingDisplay,
      prjSettSortOrder: applicationSettingSort,
      prjSettConstant: applicationSettingValue,
    });

    return newProjectSetting;
  }

  async getProjectSettingById(id: number) {
    let projectSetting = await m_projectsetting.findOne({ where: { id } });
    return projectSetting;
  }

  async getProjectSettingByKeyAndConstant(key: string, constant: string) {
    return await m_projectsetting.findOne({
      where: { prjSettKey: key, prjSettConstant: constant },
    });
  }

  setEntityManager(tmanager) {
    this.tmanager = tmanager;
    return;
  }
  async upsertProjectSetting(data: m_projectsetting[], conflictPaths: any) {
    await this.tmanager.upsert(m_projectsetting, data, {
      conflictPaths,
    });
    return;
  }
}

export default ProjectSetting;
