import { Injectable } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordService {
  constructor(private prisma: PrismaService) {}

  async processBulkRecords(records: CreateRecordDto[]) {
    // تحقق من وجود المستخدمين أولاً
    const users = await this.prisma.utilisateur.findMany({
      where: {
        pointeuseId: {
          in: records.map(r => r.user)
        }
      }
    });

    // أنشئ خريطة لربط pointeuseId بـ utilisateurId
    const userMap = new Map(users.map(u => [u.pointeuseId, u.id]));

    // أنشئ البيانات الجاهزة للإدراج
    const recordsToCreate = records
      .filter(r => userMap.has(r.user))
      .map(r => ({
        utilisateurId: userMap.get(r.user) as string,
 // تأكد من أن هذا يتطابق مع نوع ID في قاعدة البيانات
        time: r.time,
        action: r.action
      }));

    // أدخل البيانات في قاعدة البيانات
    return this.prisma.$transaction(
      recordsToCreate.map(record => 
        this.prisma.record.create({ data: record })
      )
    );
  }
}