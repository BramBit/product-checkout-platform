export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stockQuantity: number;
  imageUrl?: string;
  createdAt: Date;
}

export class Product {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly priceInCents: number;
  public readonly stockQuantity: number;
  public readonly imageUrl?: string;
  public readonly createdAt: Date;

  private constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.priceInCents = props.priceInCents;
    this.stockQuantity = props.stockQuantity;
    this.imageUrl = props.imageUrl;
    this.createdAt = props.createdAt;
  }

  public static create(props: ProductProps): Product {
    return new Product(props);
  }

  public hasEnoughStock(quantity: number): boolean {
    return this.stockQuantity >= quantity;
  }

  public decreaseStock(quantity: number): Product {
    if (!this.hasEnoughStock(quantity)) {
      throw new Error(`Insufficient stock for product ${this.id}. Available: ${this.stockQuantity}, requested: ${quantity}`);
    }

    return new Product({
      ...this,
      stockQuantity: this.stockQuantity - quantity,
    });
  }
}
