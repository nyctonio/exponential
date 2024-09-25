import { ResponseType } from '../../constants/common/response-type';
import { GetProjectSettings } from '../../types/project-settings';
import ProjectSetting from 'entity/project-settings';

class ProjectSettingService {
  public static async getProjectSettings(data: GetProjectSettings) {
    let projectSetting = new ProjectSetting();
    let { projectSettingsData, count } =
      await projectSetting.getProjectSettings(data);

    return {
      status: true,
      data: { projectSettingsData, count },
      type: ResponseType.SUCCESS,
      message: '',
    };
  }

  public static async getProjectSettingsByKeys(keys: string[]) {
    let projectSetting = new ProjectSetting(keys);
    await projectSetting.getProjectSettingByKeys();
    return projectSetting.project_setting_data;
  }

  public static async getDistinctSettings() {
    let projectSetting = new ProjectSetting();
    return await projectSetting.getDistinctKeys();
  }

  public static async updateProjectSetting({
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
    let projectSetting = new ProjectSetting();
    await projectSetting.updateProjectSetting({
      id,
      displayValue,
      sortOrder,
      active,
    });
    return;
  }

  public static async createProjectSetting({
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
    let projectSetting = new ProjectSetting();
    let data = await projectSetting.createProjectSetting({
      applicationSettingDisplay,
      applicationSettingKey,
      applicationSettingName,
      applicationSettingSort,
      applicationSettingValue,
    });
    return data;
  }
}

export default ProjectSettingService;
