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

  if (category !== 'albums') {
    return NextResponse.json(
      { message: "현재 온라인 검색을 지원하지 않는 카테고리입니다." },
      { status: 400 }
    );
  }

  const results = await searchExternalContent(category, query);
  return NextResponse.json({ items: results });
}