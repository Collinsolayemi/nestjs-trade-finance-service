import {
  Column,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { uuidv7 } from 'uuidv7';

interface RegulatoryFormCharge {
  chargeId: string;
}

interface RegulatoryFormTax {
  taxId: string;
}

@Table({ modelName: 'regulatory_form_charges_and_taxes' })
export class RegulatoryFormChargesAndTaxes extends Model<RegulatoryFormChargesAndTaxes> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index({ name: 'regulatory_form_charges_and_taxes_id_index' })
  regulatoryFormChargesAndTaxesId: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  regulatoryFormCharges: RegulatoryFormCharge[];

  @Column({ type: DataType.JSONB, allowNull: true })
  regulatoryFormTaxes: RegulatoryFormTax[];
}
