import Customer from '../infra/typeorm/entities/Customer';

import ICreateCustomerDTO from '../dtos/ICreateCustomerDTO';

export default interface ICustomersRepository {
  all(): Promise<Customer[]>;
  create(data: ICreateCustomerDTO): Promise<Customer>;
  findByEmail(email: string): Promise<Customer | undefined>;
  findById(id: string): Promise<Customer | undefined>;
}
