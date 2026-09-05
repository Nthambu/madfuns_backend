import {
  Controller, Post, Body, Headers,
  Req, HttpCode, HttpStatus, RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { CheckoutService }        from './checkout.service';
import { InitializePaymentDto }   from './dto/initialize-payment.dto';
import { VerifyPaymentDto }       from './dto/verify-payment.dto';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Step 1 — Customer selects tickets and clicks Pay.
   * Returns accessCode (for Paystack Inline popup) and authorizationUrl
   * (for redirect fallback on mobile).
   */
  @Post('initialize')
  @ApiOperation({ summary: 'Initialize Paystack transaction — returns accessCode + reference' })
  @ApiResponse({ status: 201, description: '{ accessCode, authorizationUrl, reference, breakdown }' })
  @ApiResponse({ status: 400, description: 'Invalid event or ticket type' })
  initializePayment(@Body() dto: InitializePaymentDto) {
    return this.checkoutService.initializePayment(dto);
  }

  /**
   * Step 2 — Called by the Angular frontend after Paystack popup fires onSuccess.
   * Verifies the reference server-side with Paystack and saves the Order to DB.
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment reference with Paystack and save order' })
  @ApiResponse({ status: 200, description: '{ orderId, orderNumber }' })
  @ApiResponse({ status: 400, description: 'Payment not completed or invalid reference' })
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.checkoutService.verifyAndSaveOrder(dto);
  }

  /**
   * Paystack Webhook — Paystack calls this URL when a payment succeeds.
   * This is the backup confirmation path in case the user closes the popup early.
   * Configure this URL in your Paystack dashboard → Settings → Webhooks.
   *
   * Raw body is required for HMAC signature verification.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook — configure this URL in Paystack dashboard' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: any,
  ) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(payload);
    return this.checkoutService.handleWebhook(rawBody, signature, payload);
  }
}
