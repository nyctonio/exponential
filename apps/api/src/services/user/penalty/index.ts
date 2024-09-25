// import User from 'entity/user';
import { redisClient } from '../../../lib/redis';
import ProjectSetting from 'entity/project-settings';
import Penalty from 'entity/penalty';
import User from 'entity/user';

class PenaltyService {
  public static async getPenalty(currUserId: number, userId: number) {
    const penalty = new Penalty(userId);
    const project_settings = new ProjectSetting(['PNLTY']);
    const [penalty_types, user_penalty] = await Promise.all([
      project_settings.getProjectSettingByKeys(),
      penalty.getUserPenalty(),
    ]);
    return { penaltyTypes: penalty_types, userPenalty: user_penalty };
  }

  public static async setPenalty(userId: number, data) {
    const penalty = new Penalty(data.userId);
    const user = new User({ userId: data.userId });
    const user_data = await user.getUserData({
      userType: true,
    });
    if (user_data.userType.prjSettConstant != 'Client') {
      throw new Error('Penalty can be set only for client');
    }
    return await penalty.setPenalty(data);
  }
}

export default PenaltyService;
