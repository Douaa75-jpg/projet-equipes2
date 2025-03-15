import { Injectable } from '@nestjs/common';
import { CreateAutorisationSortieDto } from './dto/create-autorisation-sortie.dto';
import { UpdateAutorisationSortieDto } from './dto/update-autorisation-sortie.dto';

@Injectable()
export class AutorisationSortieService {
  create(createAutorisationSortieDto: CreateAutorisationSortieDto) {
    return 'This action adds a new autorisationSortie';
  }

  findAll() {
    return `This action returns all autorisationSortie`;
  }

  findOne(id: number) {
    return `This action returns a #${id} autorisationSortie`;
  }

  update(id: number, updateAutorisationSortieDto: UpdateAutorisationSortieDto) {
    return `This action updates a #${id} autorisationSortie`;
  }

  remove(id: number) {
    return `This action removes a #${id} autorisationSortie`;
  }
}
