import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Public } from './guards';
import { CatalogService } from './commerce.service';
import { CommerceInquiryService } from './commerce-inquiry.service';
import { checkedCatalogId, parseCatalogItem, parseCatalogQuery, parseCatalogTranslation } from './commerce.validation';
import { parseInquiryInput } from './commerce-inquiry.validation';
import type { AuthenticatedRequest } from './types';

@Controller('v1/catalog')
export class PublicCatalogController {
  constructor(private readonly catalog: CatalogService, private readonly inquiries: CommerceInquiryService) {}

  @Public()
  @Get('config')
  configuration() { return this.inquiries.configuration(); }

  @Public()
  @Get()
  list(@Query() query: Record<string, unknown>) {
    const options = parseCatalogQuery(query);
    return this.catalog.listPublic(options.locale, options.kind, options.limit, options.offset);
  }

  @Public()
  @Post('inquiries')
  request(@Body() body: unknown) { return this.inquiries.create(parseInquiryInput(body)); }

  @Public()
  @Get(':slug')
  get(@Param('slug') slug: string, @Query('locale') locale: string | undefined) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) throw new BadRequestException('Invalid listing URL.');
    const options = parseCatalogQuery({ locale });
    return this.catalog.getPublic(options.locale, slug);
  }
}

@Controller('v1/admin/catalog')
export class CatalogAdminController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    const options = parseCatalogQuery(query);
    return this.catalog.listAdmin(request.user, options.limit, options.offset);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.catalog.create(request.user, parseCatalogItem(body));
  }

  @Patch(':id')
  update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.catalog.update(request.user, checkedCatalogId(id), parseCatalogItem(body));
  }

  @Post(':id/translations')
  upsertTranslation(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.catalog.upsertTranslation(request.user, checkedCatalogId(id), parseCatalogTranslation(body));
  }

  @Post(':id/translations/:locale/approval')
  approve(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Param('locale') locale: string) {
    if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale)) throw new BadRequestException('Invalid locale.');
    return this.catalog.approveTranslation(request.user, checkedCatalogId(id), locale);
  }

  @Post(':id/publication')
  publication(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    if (!body || typeof body !== 'object' || typeof (body as { published?: unknown }).published !== 'boolean') {
      throw new BadRequestException('published must be a boolean.');
    }
    return this.catalog.setPublished(request.user, checkedCatalogId(id), (body as { published: boolean }).published);
  }
}

@Controller('v1/admin/inquiries')
export class InquiryAdminController {
  constructor(private readonly inquiries: CommerceInquiryService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    const options = parseCatalogQuery(query);
    return this.inquiries.listAdmin(request.user, options.limit, options.offset);
  }

  @Get(':id')
  get(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.inquiries.getAdmin(request.user, checkedCatalogId(id));
  }

  @Post(':id/status')
  status(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    if (!body || typeof body !== 'object' || !('status' in body) || !['contacted', 'closed'].includes(String(body.status))) {
      throw new BadRequestException('status must be contacted or closed.');
    }
    return this.inquiries.updateStatus(request.user, checkedCatalogId(id), (body as { status: 'contacted' | 'closed' }).status);
  }
}
