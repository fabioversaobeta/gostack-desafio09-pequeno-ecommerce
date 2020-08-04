import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not exist');
    }

    const productsList = await this.productsRepository.findAllById(products);

    if (productsList.length === 0) {
      throw new AppError('Products not found');
    }

    const productsDone = productsList.map(product => {
      const { quantity } = products.filter(p => p.id === product.id)[0];

      if (quantity > product.quantity) {
        throw new AppError('Insufficient product quantity.');
      }

      return {
        product_id: product.id,
        price: product.price,
        quantity,
      };
    });

    if (productsList.length !== products.length) {
      throw new AppError('Invalid product(s).');
    }

    const order = this.ordersRepository.create({
      customer,
      products: productsDone,
    });

    const productsSubtracted = productsList.map(product => {
      const { quantity } = products.filter(p => p.id === product.id)[0];

      return {
        id: product.id,
        quantity: product.quantity - quantity,
      };
    });

    await this.productsRepository.updateQuantity(productsSubtracted);

    return order;
  }
}

export default CreateOrderService;
