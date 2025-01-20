import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  try {
    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json(
        {
          error: "Missing required fields"
        },
        {
          status: 400
        }
      );
    }

    const response = await sql`
    INSERT INTO users (name,email,clerk_id) VALUES(${name},${email},${clerkId})
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        error
      },
      {
        status: 500
      }
    );
  }
}

export async function GET(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  try {
    // Extract `clerkId` from the query parameters
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return Response.json({ error: "clerkId is required" }, { status: 400 });
    }

    // Fetch user from the database
    const user = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkId}
    `;

    if (!user || user.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user: user[0] }, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
