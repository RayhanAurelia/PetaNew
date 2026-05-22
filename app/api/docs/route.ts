import { readFile } from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "docs",
      "api-spec",
      "openapi.yaml",
    );
    const content = await readFile(filePath, "utf-8");
    const spec = yaml.load(content);
    return NextResponse.json(spec);
  } catch (err) {
    console.error("[Docs API] Failed to load OpenAPI spec:", err);
    return NextResponse.json(
      { error: "Failed to load API spec" },
      { status: 500 },
    );
  }
}
