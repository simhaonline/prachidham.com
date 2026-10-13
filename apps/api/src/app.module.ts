import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './controllers';
import { Database } from './database';
import { AuthService } from './auth.service';
import { RateLimitService } from './rate-limit.service';
import { RecordsService } from './records.service';
import { DashboardService } from './dashboard.service';
import { SpecialistService } from './specialist.service';
import { OriginGuard, SessionGuard } from './guards';
import { CatalogService } from './commerce.service';
import { CatalogAdminController, InquiryAdminController, PublicCatalogController } from './commerce.controller';
import { CommerceInquiryService } from './commerce-inquiry.service';

@Module({
  controllers: [AppController, PublicCatalogController, CatalogAdminController, InquiryAdminController],
  providers: [
    Database, AuthService, RateLimitService, RecordsService, DashboardService, SpecialistService, CatalogService, CommerceInquiryService,
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class AppModule {}
