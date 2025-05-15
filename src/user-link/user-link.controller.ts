import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserLinkService } from './user-link.service';

@Controller('user-links')
export class UserLinkController {
  constructor(private readonly userLinkService: UserLinkService) {}

  @Post()
  async createLink(@Body() body: { userId: string; pointeuseId: number }) {
    return this.userLinkService.linkUserToPointeuse(body.userId, body.pointeuseId);
  }

  @Get()
  async getAllLinks() {
    return this.userLinkService.getUsersWithPointeuseLinks();
  }
}