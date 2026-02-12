import { NextResponse } from "next/server";
import { searchExternalContent } from "@/lib/external/services";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ items: [] })
  }

  const results = await searchExternalContent(category, query);
  return NextResponse.json({ items: results });
}