import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Patch,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { BillingsService } from './billings.service';
import {
  CreateBillingDto,
  UpdateBillingDto,
  BillingListDto,
  BillingPaginatedDto,
  BillingDto,
  SingleQueryDto,
} from '@shared/dtos';
import { Billing } from './entities/billing.entity';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '@/common/base-user/entities/user.entity';
import { StripeBillingService } from '../stripe/services/stripe-billing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EUserLevels } from '@shared/enums';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { ProfilesService } from '@/modules/v1/users/profiles/profiles.service';
import { MinUserLevel } from '@/common/decorators/level.decorator';

@ApiTags('Billings')
@MinUserLevel(EUserLevels.CLIENT)
@Controller('billings')
export class BillingsController {
  constructor(
    private readonly billingsService: BillingsService,
    private readonly stripeBillingService: StripeBillingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly profilesService: ProfilesService,
  ) {}

  @ApiOperation({ summary: 'Get all billings with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of billings',
    type: BillingPaginatedDto,
  })
  @Get()
  findAll(@Query() query: BillingListDto, @AuthUser() currentUser: User) {
    const isSuperAdmin = currentUser.level === EUserLevels.SUPER_ADMIN;
    return this.billingsService.get(query, BillingListDto, {
      beforeQuery: (query: SelectQueryBuilder<Billing>) => {
        if (!isSuperAdmin) {
          query.leftJoin('entity.recipientUser', '_recipientUser').andWhere(
            new Brackets((qb2) => {
              qb2
                .where('entity.createdByUserId = :uid', {
                  uid: currentUser.id,
                })
                .orWhere('_recipientUser.id = :uid', {
                  uid: currentUser.id,
                });
            }),
          );
        }
      },
    });
  }

  @ApiOperation({ summary: 'Get billing by ID' })
  @ApiParam({ name: 'id', description: 'Billing ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns billing by ID',
    type: BillingDto,
  })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: SingleQueryDto<Billing>) {
    return this.billingsService.getSingle(id, query);
  }

  @ApiOperation({ summary: 'Add a new billing' })
  @ApiBody({
    type: CreateBillingDto,
    description: 'Create a new billing',
  })
  @ApiResponse({ status: 201, description: 'Billing created successfully' })
  @Post()
  create(@Body() createBillingDto: CreateBillingDto) {
    return this.billingsService.createBilling(createBillingDto);
  }

  @ApiOperation({ summary: 'Update billing by ID' })
  @ApiParam({ name: 'id', description: 'Billing ID' })
  @ApiBody({
    type: UpdateBillingDto,
    description: 'Update billing information',
  })
  @ApiResponse({ status: 200, description: 'Billing updated successfully' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillingDto: UpdateBillingDto) {
    return this.billingsService.updateBilling(id, updateBillingDto);
  }

  @ApiOperation({ summary: 'Delete billing by ID' })
  @ApiParam({ name: 'id', description: 'Billing ID' })
  @ApiResponse({ status: 200, description: 'Billing deleted successfully' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.billingsService.delete(id);
  }

  @Post(':id/checkout-url')
  @ApiOperation({ summary: 'Create checkout URL for billing payment' })
  @ApiResponse({
    status: 201,
    description: 'Checkout URL created successfully',
  })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'Billing ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentSuccessUrl: {
          type: 'string',
          description: 'Success URL from frontend',
        },
        paymentCancelUrl: {
          type: 'string',
          description: 'Cancel URL from frontend',
        },
      },
      required: ['paymentSuccessUrl', 'paymentCancelUrl'],
    },
  })
  async createCheckoutUrl(
    @AuthUser() user: User,
    @Param('id') id: string,
    @Body() body: { paymentSuccessUrl: string; paymentCancelUrl: string },
  ) {
    const billing = await this.billingsService.getSingle(id, {
      _relations: ['recipientUser'],
    });
    const profile = await this.profilesService.getSingle(
      { user: { id: billing.recipientUser.id } },
      { _relations: ['user'] },
    );

    // Get or create Stripe customer for the person who is paying
    let stripeCustomerId: string;
    try {
      stripeCustomerId =
        await this.stripeBillingService.createOrGetStripeCustomer(profile);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create or get Stripe customer: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Create line items - first try Stripe invoice, then fallback to billing
    const lineItems: any[] = [];

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: billing.title || 'Billing Item',
          description: billing.description || 'Billing Item',
        },
        unit_amount: billing.amount, // Convert to cents
      },
      quantity: 1,
    });

    // Create JWT token for success/cancel URLs
    const token = this.jwtService.sign({
      billingId: billing.id,
      id: billing.recipientUser.id,
      type: 'billing_payment',
    });

    // Create success and cancel URLs from frontend DTO (like membership purchase)
    const appConfig = this.configService.get('app');
    const successUrl = `${appConfig.appUrl}${body.paymentSuccessUrl}?token=${token}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appConfig.appUrl}${body.paymentCancelUrl}?token=${token}&cancel=true`;

    // Create checkout session
    let checkoutSession;

    try {
      checkoutSession = await this.stripeBillingService.createCheckoutSession(
        stripeCustomerId,
        lineItems,
        {
          billingId: billing.id.toString(),
          userId: profile.user.id.toString(),
          type: 'billing_payment',
        },
        successUrl,
        cancelUrl,
      );

      // Update billing with checkout session ID
      await this.billingsService.update(billing.id, {
        stripeCheckoutSessionId: checkoutSession.id,
      });

      return {
        checkoutUrl: checkoutSession.url,
        message: 'Checkout URL created successfully',
      };
    } catch (error) {
      // Both checkout session and Stripe invoice failed
      return {
        checkoutUrl: null,
        message:
          'Unable to process automatic payment. Please use manual payment method.',
        error: 'Payment processing unavailable',
      };
    }
  }

  @Get('checkout/success')
  @ApiOperation({ summary: 'Handle successful Order checkout' })
  @ApiResponse({
    status: 200,
    description: 'POS purchase completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
        invoice: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string' },
            paidAt: { type: 'string', format: 'date-time' },
            stripeInvoiceId: { type: 'string' },
            stripeCheckoutSessionId: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({
    name: 'token',
    description: 'JWT token containing purchase details',
  })
  @ApiQuery({ name: 'session_id', description: 'Stripe checkout session ID' })
  async handleCheckoutSuccess(
    @Query('token') token: string,
    @Query('session_id') sessionId: string,
  ) {
    return this.billingsService.handleCheckoutSuccess(token, sessionId);
  }

  @Get('checkout/cancel')
  @ApiOperation({ summary: 'Handle canceled Order  checkout' })
  @ApiResponse({
    status: 200,
    description: 'POS purchase canceled',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
        invoice: { type: 'null' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async handleCheckoutCancel() {
    return this.billingsService.handleCheckoutCancel();
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send billing email to recipient' })
  @ApiParam({ name: 'id', description: 'Billing ID' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 404, description: 'Billing not found' })
  async sendBillingEmail(@Param('id') id: string) {
    return this.billingsService.sendBillingEmail(id);
  }
}
