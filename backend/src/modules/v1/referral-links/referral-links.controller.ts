import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReferralLinksService } from './referral-links.service';
import {
  CreateReferralLinkDto,
  UpdateReferralLinkDto,
  ReferralLinkListDto,
  SingleQueryDto,
} from '@shared/dtos';
import { ReferralLink } from './entities/referral-link.entity';

@ApiTags('Referral Links')
@ApiBearerAuth()
@Controller('referral-links')
export class ReferralLinksController {
  constructor(private readonly referralLinksService: ReferralLinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new referral link' })
  @ApiResponse({
    status: 201,
    description: 'Referral link created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createReferralLinkDto: CreateReferralLinkDto) {
    return this.referralLinksService.createReferralLink(createReferralLinkDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all referral links with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Referral links retrieved successfully',
  })
  findAll(@Query() query: ReferralLinkListDto) {
    return this.referralLinksService.get(query, ReferralLinkListDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a referral link by ID' })
  @ApiResponse({
    status: 200,
    description: 'Referral link retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Referral link not found' })
  findOne(
    @Param('id') id: string,
    @Query() query: SingleQueryDto<ReferralLink>,
  ) {
    return this.referralLinksService.getSingle(id, query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a referral link' })
  @ApiResponse({
    status: 200,
    description: 'Referral link updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Referral link not found' })
  update(
    @Param('id') id: string,
    @Body() updateReferralLinkDto: UpdateReferralLinkDto,
  ) {
    return this.referralLinksService.updateReferralLink(
      id,
      updateReferralLinkDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a referral link' })
  @ApiResponse({
    status: 200,
    description: 'Referral link deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Referral link not found' })
  remove(@Param('id') id: string) {
    return this.referralLinksService.delete(id);
  }
}
