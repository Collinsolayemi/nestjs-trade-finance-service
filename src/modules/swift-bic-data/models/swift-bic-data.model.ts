import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ modelName: 'swift_bic' })
export class SwiftBic extends Model<SwiftBic> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @AllowNull(true)
  @Column({ type: DataType.STRING })
  @Index
  bic: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  institutionName: string;

  @Column({ type: DataType.STRING })
  streetAddress1: string;

  @Column({ type: DataType.STRING })
  streetAddress2: string;

  @Column({ type: DataType.STRING })
  streetAddress3: string;

  @Column({ type: DataType.STRING })
  streetAddress4: string;

  @Column({ type: DataType.STRING })
  city: string;

  @Column({ type: DataType.STRING })
  cps: string;

  @Column({ type: DataType.STRING })
  zipCode: string;

  @Column({ type: DataType.STRING })
  country: string;
}
