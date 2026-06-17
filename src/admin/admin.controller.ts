import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('activity/today')
  getTodayActivity() {
    return this.adminService.getTodayActivity();
  }
  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }
}
