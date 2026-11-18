import { Column, DataType, Model } from 'sequelize-typescript';
import { ApprovalStatusEnum, RequestStatusEnum } from 'src/common/enums';

export abstract class BaseModel<T = any> extends Model<T> {
  @Column({ type: DataType.STRING })
  initiator: string;

  @Column({ type: DataType.UUID })
  initiatorId: string;

  @Column({ type: DataType.STRING })
  approver: string;

  @Column({ type: DataType.UUID })
  approverId: string;

  @Column({ type: DataType.STRING })
  initiatorDepartment: string;

  @Column({ type: DataType.STRING })
  approverDepartment: string;

  @Column({ type: DataType.STRING })
  initiatorBranchCode: string;

  @Column({ type: DataType.STRING })
  approverBranchCode: string;

  @Column({ type: DataType.UUID })
  tenantId: string;

  @Column({
    type: DataType.ENUM(...Object.values(RequestStatusEnum)),
    defaultValue: RequestStatusEnum.IN_REVIEW,
  })
  requestStatus: RequestStatusEnum;

  @Column({
    type: DataType.ENUM(...Object.values(ApprovalStatusEnum)),
    defaultValue: ApprovalStatusEnum.PENDING,
  })
  approvalStatus: ApprovalStatusEnum;

  @Column({ type: DataType.STRING })
  reasonForRejection: string;

  @Column({ type: DataType.STRING })
  deactivationReason: string;

  @Column({ type: DataType.STRING })
  deactivationReasonSupportingDocumentUrl: string;
}
