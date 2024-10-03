import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(
    data: CreateUserRequest,
  ): Promise<{ id: number; email: string }> {
    try {
      return await this.databaseService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        },
        select: {
          id: true,
          email: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new UnprocessableEntityException('Email already exists.');
      throw error;
    }
  }
}
