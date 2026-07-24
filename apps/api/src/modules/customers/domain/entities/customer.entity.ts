export interface CustomerProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
  createdAt: Date;
}

export class Customer {
  public readonly id: string;
  public readonly fullName: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly documentId: string;
  public readonly createdAt: Date;

  private constructor(props: CustomerProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.email = props.email;
    this.phone = props.phone;
    this.documentId = props.documentId;
    this.createdAt = props.createdAt;
  }

  public static create(props: CustomerProps): Customer {
    return new Customer(props);
  }
}
