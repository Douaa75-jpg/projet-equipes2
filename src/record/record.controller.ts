import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { RecordService } from './record.service';

@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post('bulk-upload')
  @HttpCode(200)
  async bulkUpload(@Body() body: { records: CreateRecordDto[] }) {
    try {
      const result = await this.recordService.processBulkRecords(body.records);
      return {
        success: true,
        message: `تمت معالجة ${result.length} تسجيل بنجاح`,
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `فشل في معالجة التسجيلات: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}