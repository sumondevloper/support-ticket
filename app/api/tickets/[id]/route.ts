import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";  
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Valid ticket id is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("test");

    const ticket = await db.collection("tickets").findOne({
    _id: new ObjectId(id),
  });

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error) {
    console.error("❌ POST ticket error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {

    const params = await request.params; 
    const { id } = params;

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
    } catch (e) {
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
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket: result.value }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update ticket", details: error.message },
      { status: 500 }
    );
  }
}

// ============= DELETE - Delete Ticket =============
export async function DELETE(request: NextRequest) {
  try {
    const params = await request.params; // ← এখানেও await
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("test");

    const result = await db.collection("tickets").findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result.value) {
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
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}