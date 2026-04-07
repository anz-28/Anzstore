import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { getProductById, createOrder } = require('@/lib/db');
    const body = await request.json();

    if (!body.items || !body.items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate items and calculate total
    const orderItems = [];
    let total = 0;

    for (const item of body.items) {
      const product = getProductById(item.id);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
      }
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price_at_time: product.price,
      });
      total += product.price * item.quantity;
    }

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && stripeKey !== 'sk_test_placeholder') {
      // Use Stripe Checkout
      try {
        const stripe = require('stripe')(stripeKey);
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: orderItems.map(item => ({
            price_data: {
              currency: 'usd',
              product_data: { name: item.product_name },
              unit_amount: Math.round(item.price_at_time * 100),
            },
            quantity: item.quantity,
          })),
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        });

        // Create order in pending state
        const order = createOrder({
          customer_name: 'Stripe Customer',
          customer_email: 'pending@checkout.com',
          total: Math.round(total * 100) / 100,
          status: 'pending',
          stripe_session_id: session.id,
          items: orderItems,
        });

        return NextResponse.json({ url: session.url, orderId: order.id });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
      }
    }

    // Demo mode - create order directly
    const order = createOrder({
      customer_name: 'Demo Customer',
      customer_email: 'demo@anzlab.com',
      total: Math.round(total * 100) / 100,
      status: 'processing',
      items: orderItems,
    });

    return NextResponse.json({ 
      message: 'Order placed successfully (demo mode - no Stripe configured)',
      orderId: order.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
