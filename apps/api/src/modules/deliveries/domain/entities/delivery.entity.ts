export interface DeliveryProps {
  id: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  createdAt: Date;
}

export class Delivery {
  public readonly id: string;
  public readonly customerId: string;
  public readonly address: string;
  public readonly city: string;
  public readonly region: string;
  public readonly postalCode?: string;
  public readonly createdAt: Date;

  private constructor(props: DeliveryProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.address = props.address;
    this.city = props.city;
    this.region = props.region;
    this.postalCode = props.postalCode;
    this.createdAt = props.createdAt;
  }

  public static create(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }
}
