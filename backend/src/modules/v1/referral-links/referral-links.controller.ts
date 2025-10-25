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
  ParseIntPipe,
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
  ReferralLinkDto,
} from '@shared/dtos/referral-link-dtos';
import { AuthUser } from '@/decorators/user.decorator';

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
  create(
    @Body() createReferralLinkDto: CreateReferralLinkDto,
    @AuthUser() user: any,
  ) {
    const userId = user.id;
    return this.referralLinksService.createReferralLink(
      createReferralLinkDto,
      userId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all referral links with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Referral links retrieved successfully',
  })
  findAll(@Query() query: ReferralLinkListDto, @AuthUser() user: any) {
    return this.referralLinksService.get(query, ReferralLinkListDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a referral link by ID' })
  @ApiResponse({
    status: 200,
    description: 'Referral link retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Referral link not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.referralLinksService.getSingle(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a referral link' })
  @ApiResponse({
    status: 200,
    description: 'Referral link updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Referral link not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.referralLinksService.delete(id);
  }
}
