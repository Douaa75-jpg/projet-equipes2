import { Injectable } from '@nestjs/common';
import { CreateCongeDto } from './dto/create-conge.dto';
import { UpdateCongeDto } from './dto/update-conge.dto';

@Injectable()
export class CongeService {
  create(createCongeDto: CreateCongeDto) {
    return 'This action adds a new conge';
  }

  findAll() {
    return `This action returns all conge`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conge`;
  }

  update(id: number, updateCongeDto: UpdateCongeDto) {
    return `This action updates a #${id} conge`;
  }

  remove(id: number) {
    return `This action removes a #${id} conge`;
  }
}
