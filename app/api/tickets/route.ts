import clientPromise from "../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { createTicketSchema } from "../../schemas/ticket-schema";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const tickets = await db
      .collection("tickets")
      .find({})
      .toArray();

    return NextResponse.json({ success: true, data: tickets });

  } catch (error) {
    console.error(" API Error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createTicketSchema.parse(body);

    const client = await clientPromise;
    const db = client.db("test");


    const newTicket = {
      title: data.title,
      description: data.description ?? "", 
      status: data.status,
      priority: data.priority,
      assignee: data.assignee ?? null,     
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("tickets").insertOne(newTicket);
    return NextResponse.json(
      {
        success: true,
        message: "Ticket created successfully",
        ticket: newTicket,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/tickets ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create ticket",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
