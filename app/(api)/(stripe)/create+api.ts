import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { name, email, amount } = await request.json();

    if (!name || !email || !amount || isNaN(amount) || parseInt(amount) <= 0) {
      return Response.json(
        { error: "Invalid name, email, or amount" },
        { status: 400 }
      );
    }

    let customer;

    const existingCustomer = await stripe.customers.list({ email });

    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0];
    } else {
      const newCustomer = await stripe.customers.create({ name, email });
      customer = newCustomer;
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: "usd",
      customer: customer.id,
    //   automatic_payment_methods: {
    //     enabled: true,
    //     allow_redirects: "never"
    //   }
    });

    return Response.json(
      {
        paymentIntent,
        ephemeralKey,
        customer: customer.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return Response.json(
      {
        error: "An error occurred while creating the payment intent"
      },
      { status: 500 }
    );
  }
}
