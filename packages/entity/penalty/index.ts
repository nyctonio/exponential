import { EntityManager, ILike, In } from 'typeorm';
import { m_penalty, m_transaction } from 'database/sql/schema';

class ProjectSetting {
  userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  async getUserPenalty() {
    console.log('this.userId', this.userId);
    let penalty = await m_penalty.find({
      where: {
        user: { id: this.userId },
        isDeleted: false,
      },
      relations: ['penaltyType'],
    });
    return penalty;
  }

  async setPenalty(data: {
    penaltyType: number;
    hours: number;
    penalty: number;
    cutBrokerage: boolean;
  }) {
    const penalty = await m_penalty.upsert(
      {
        user: { id: this.userId },
        hours: data.hours,
        penalty: data.penalty,
        cutBrokerage: data.cutBrokerage,
        penaltyType: { id: data.penaltyType },
      },
      {
        conflictPaths: ['user'],
      }
    );
    return penalty;
  }

  async getPenaltyOfAllUsers() {
    const penalty = await m_penalty.find({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        hours: true,
        penalty: true,
        cutBrokerage: true,
        user: {
          id: true,
          username: true,
        },
        penaltyType: {
          id: true,
          prjSettConstant: true,
        },
      },
      relations: {
        user: true,
        penaltyType: true,
      },
    });
    return penalty;
  }

  async updateLastPenaltyDate({ orderId }: { orderId: number }) {
    const penalty = await m_transaction.update(
      {
        id: orderId,
      },
      {
        lastPenaltyDate: new Date(),
      }
    );
    return penalty;
  }
}

export default ProjectSetting;
