export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface CreatePendingTransactionProps {
  id: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
}

export interface TransactionProps {
  id: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  status: TransactionStatus;
  wompiTransactionId: string | null;
  wompiStatusDetail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  public readonly id: string;
  public readonly productId: string;
  public readonly customerId: string;
  public readonly deliveryId: string;
  public readonly productAmountInCents: number;
  public readonly baseFeeInCents: number;
  public readonly deliveryFeeInCents: number;
  public readonly totalAmountInCents: number;
  public readonly status: TransactionStatus;
  public readonly wompiTransactionId: string | null;
  public readonly wompiStatusDetail: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: TransactionProps) {
    this.id = props.id;
    this.productId = props.productId;
    this.customerId = props.customerId;
    this.deliveryId = props.deliveryId;
    this.productAmountInCents = props.productAmountInCents;
    this.baseFeeInCents = props.baseFeeInCents;
    this.deliveryFeeInCents = props.deliveryFeeInCents;
    this.totalAmountInCents = props.totalAmountInCents;
    this.status = props.status;
    this.wompiTransactionId = props.wompiTransactionId;
    this.wompiStatusDetail = props.wompiStatusDetail;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static createPending(props: CreatePendingTransactionProps): Transaction {
    const totalAmountInCents =
      props.productAmountInCents + props.baseFeeInCents + props.deliveryFeeInCents;
    const now = new Date();

    return new Transaction({
      id: props.id,
      productId: props.productId,
      customerId: props.customerId,
      deliveryId: props.deliveryId,
      productAmountInCents: props.productAmountInCents,
      baseFeeInCents: props.baseFeeInCents,
      deliveryFeeInCents: props.deliveryFeeInCents,
      totalAmountInCents,
      status: 'PENDING',
      wompiTransactionId: null,
      wompiStatusDetail: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public isFinalStatus(): boolean {
    return this.status === 'APPROVED' || this.status === 'DECLINED' || this.status === 'ERROR';
  }

  public withWompiReference(wompiTransactionId: string): Transaction {
    return new Transaction({
      ...this,
      wompiTransactionId,
      updatedAt: new Date(),
    });
  }

  public withStatus(status: TransactionStatus, wompiStatusDetail?: string | null): Transaction {
    return new Transaction({
      ...this,
      status,
      wompiStatusDetail: wompiStatusDetail !== undefined ? wompiStatusDetail : this.wompiStatusDetail,
      updatedAt: new Date(),
    });
  }
}
