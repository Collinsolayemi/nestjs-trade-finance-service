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
import { Guarantees } from './guarantees.model';
import { GuaranteesRequest } from './guarantees-request.model';
import { GuaranteesReceivedFromEnum } from 'src/common/enums';
import { uuidv7 } from 'uuidv7';
import { GuaranteesDocumentUploadDto } from '../dto/guarantees-document-upload.dto';

@Table({ modelName: 'guarantees_receive_acknowledgement' })
export class GuaranteesReceiveAcknowledgement extends Model<GuaranteesReceiveAcknowledgement> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  guaranteesReceiveAcknowledgementId: string;

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

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesReceivedFromEnum)),
  })
  receivedFrom: GuaranteesReceivedFromEnum;

  @Column({ type: DataType.STRING })
  receivedFromReference: string;

  @Column({ type: DataType.DATE })
  dateReceived: Date;

  @Column({ type: DataType.TEXT })
  narrative: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  chargesClaimed: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  chargesDebited: boolean;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: GuaranteesDocumentUploadDto[] | null;
}
