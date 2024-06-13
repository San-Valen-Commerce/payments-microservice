import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_SECRET);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      // TODO: Colocar aquí el id de mi orden
      payment_intent_data: {
        metadata: {
          order_id: orderId,
        },
      },

      line_items: lineItems,
      mode: 'payment',
      success_url: envs.STRIPE_SUCCESS_URL,
      cancel_url: envs.STRIPE_CANCEL_URL,
    });

    return session;
  }

  async stripeWebhook(req: any, res: Response) {
    const sig = req.headers['stripe-signature'] || '';

    const rawBody: any = req.rawBody;

    let event: Stripe.Event;

    const endpointSecret = envs.STRIPE_WEBHOOK_SECRET;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

      switch (event.type) {
        case 'charge.succeeded':
          // TODO: llamar al microservicio
          const chargeSucceded = event.data.object;
          console.log({ orderId: chargeSucceded.metadata.order_id });
          return res.status(200).send('Webhook received');

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send('Webhook Error');
    }
  }
}
