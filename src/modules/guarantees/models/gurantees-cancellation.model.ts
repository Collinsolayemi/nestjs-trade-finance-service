import { Guarantees } from './guarantees.model';
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { GuaranteesRequest } from './guarantees-request.model';
import { BillsForCollectionAdviseByEnum } from 'src/common/enums';
import { uuidv7 } from 'uuidv7';
import { GuaranteesDocumentUploadDto } from '../dto/guarantees-document-upload.dto';

@Table({ modelName: 'guarantees_cancellation' })
export class GuaranteesCancellation extends Model<GuaranteesCancellation> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  guaranteesCancellationId: string;

  @ForeignKey(() => GuaranteesRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => GuaranteesRequest, { onDelete: 'CASCADE' })
  guaranteesRequest: GuaranteesRequest;

  @ForeignKey(() => Guarantees)
  @AllowNull(false)
  @Column({ type: DataType.STRING })
  @Index
  guaranteesReferenceNumber: string;

  @BelongsTo(() => Guarantees, {
    foreignKey: 'guaranteesReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  guarantees: Guarantees;

  @Column({ type: DataType.DATE })
  cancellationDate: Date;

  @Column({ type: DataType.STRING })
  reference: string;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionAdviseByEnum)),
  })
  adviseBy: BillsForCollectionAdviseByEnum;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  seekBeneficiaryApproval: boolean;

  @Column({ type: DataType.TEXT })
  narrative: string;

  @Column({ type: DataType.TEXT })
  instructionsFromApplicant: string;

  @Column({ type: DataType.TEXT })
  instructionsToAdvisingBank: string;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: GuaranteesDocumentUploadDto[] | null;
}
