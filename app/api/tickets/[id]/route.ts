import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

async function getTicketId(params: Promise<{ id: string }>) {
  const { id } = await params;

  if (!id) {
    throw new Error("Ticket ID is missing");
  }

  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ticket ID format");
  }

  return new ObjectId(id);  // ObjectId রিটার্ন করুন
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Valid ticket ID is required in request body" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("test");

    const ticket = await db.collection("tickets").findOne({
      _id: new ObjectId(id),  // সবসময় ObjectId দিয়ে সার্চ করুন
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/tickets/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is missing" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket ID format" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("test");

    const result = await db.collection("tickets").findOneAndUpdate(
      { _id: new ObjectId(id) },  // সবসময় ObjectId
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket: result }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update ticket", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const objectId = await getTicketId(params);  // ObjectId পান

    const client = await clientPromise;
    const db = client.db("test");

    const result = await db.collection("tickets").findOneAndDelete({
      _id: objectId,  // সবসময় ObjectId দিয়ে ডিলিট করুন
    });

    if (!result) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Ticket deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket", details: error.message },
      { status: error.message.includes("missing") || error.message.includes("format") ? 400 : 500 }
    );
  }
}