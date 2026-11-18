import {
  AllowNull,
  Column,
  DataType,
  Index,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'reference' })
export class Reference extends BaseModel<Reference> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  referenceId: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  referenceCode: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  referenceName: string;

  @Column({ type: DataType.STRING })
  referenceTitle: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  product: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  productType: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  startNumber: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  endNumber: number;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  status: boolean;
}
