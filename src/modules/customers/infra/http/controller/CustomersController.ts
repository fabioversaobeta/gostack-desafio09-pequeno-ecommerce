import { Request, Response } from 'express';

import ShowCustomerService from '@modules/customers/services/ShowCustomerService';
import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';
import AppError from '@shared/errors/AppError';

export default class CustomersController {
  public async index(request: Request, response: Response): Promise<Response> {
    const showCustomers = container.resolve(ShowCustomerService);

    try {
      const customers = await showCustomers.execute();
      return response.json(customers);
    } catch (err) {
      throw new AppError('Erro showCustomers');
    }
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;

    const createCustomer = container.resolve(CreateCustomerService);

    const customer = await createCustomer.execute({
      name,
      email,
    });

    return response.json(customer);
  }
}
