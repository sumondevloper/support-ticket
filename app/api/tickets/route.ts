import clientPromise from "../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { createTicketSchema } from "../../schemas/ticket-schema";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const client = await clientPromise;
    console.log(client)
    const db = client.db("test");

    const tickets = await db
      .collection("tickets")
      .find({})
      .toArray();

    // 4️⃣ return response
    return NextResponse.json({ success: true, data: tickets });

  } catch (error) {
    console.error("❌ API Error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}


/* =======================
   POST: Create ticket
======================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ validate input
    const data = createTicketSchema.parse(body);

    const client = await clientPromise;
    const db = client.db("test"); // ✅ correct DB

    const newTicket = {
      id: `TCK-${nanoid(6)}`, // ✅ custom id (NOT _id)
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("tickets").insertOne(newTicket);

    return NextResponse.json(
      { success: true, ticket: newTicket },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /api/tickets ERROR:", error);

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create ticket" },
      { status: 400 }
    );
  }
}
