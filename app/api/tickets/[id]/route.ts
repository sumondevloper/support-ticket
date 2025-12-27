import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";


async function getObjectId(params: Promise<{ id: string }>) {
  const { id } = await params;
  if (!id) throw new Error("Ticket ID is missing");
  if (!ObjectId.isValid(id)) throw new Error("Invalid ticket ID format");
  return new ObjectId(id);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Valid ticket ID required" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ticket ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const ticket = await db.collection("tickets").findOne({
      _id: new ObjectId(id),
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error: any) {
    console.error("API POST error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { params } = context;
    const id = await getObjectId(params);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No update data" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("tickets").findOneAndUpdate(
      { _id: id },
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
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { params } = context;
    const id = await getObjectId(params);

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("tickets").findOneAndDelete({
      _id: id,
    });

    if (!result) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ticket deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE error:", error);
    const status = error.message.includes("missing") || error.message.includes("format") ? 400 : 500;
    return NextResponse.json(
      { error: "Failed to delete ticket", details: error.message },
      { status }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { params } = context;
    const id = await getObjectId(params);

    const client = await clientPromise;
    const db = client.db();
    const ticket = await db.collection("tickets").findOne({
      _id: id,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({  ticket: {
    ...ticket,
    _id: ticket._id.toString(),
  } }, { status: 200 });
  } catch (error: any) {
    console.error("GET error:", error);
    const status = error.message.includes("missing") || error.message.includes("format") ? 400 : 500;
    return NextResponse.json(
      { error: "Failed to fetch ticket", details: error.message },
      { status }
    );
  }
}