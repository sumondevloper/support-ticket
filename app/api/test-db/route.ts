import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  await client.db("test").command({ ping: 1 });
  return NextResponse.json({ success: true, message: "MongoDB connected" });
}
