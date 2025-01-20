import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { payment_method_id, payment_intent_id, customer_id } =
      await request.json();

    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return Response.json(
        {
          error: "Missing required payment information"
        },
        {
          status: 400
        }
      );
    }

    // Attach the payment method to the customer
    const paymentMethod = await stripe.paymentMethods.attach(
      payment_method_id,
      { customer: customer_id }
    );

    if (!paymentMethod) {
      return Response.json(
        { error: "Failed to attach payment method" },
        { status: 400 }
      );
    }

    // Confirm the payment intent
    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
      return_url: "myapp://book-ride"
    });

    // Handle various statuses
    console.log("Payment Intent Status:", result.status);
    if (result.status === "succeeded") {
      return Response.json(
        {
          success: true,
          message: "Payment confirmed successfully",
          result
        },
        { status: 200 }
      );
    } else if (result.status === "requires_action") {
      console.log("nextAction: result.next_action", result.next_action);
      return Response.json(
        {
          error: "Payment requires additional actions",
          nextAction: result.next_action
        },
        { status: 400 }
      );
    } else if (result.status === "requires_payment_method") {
      return Response.json(
        {
          error: result.last_payment_error?.message || "Payment failed"
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          error: "Payment is still processing",
          status: result.status
        },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error("Error confirming payment intent:", error);
    return Response.json(
      {
        error: "An error occurred while confirming the payment intent"
      },
      { status: 500 }
    );
  }
}
