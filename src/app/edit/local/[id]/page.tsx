import type { Metadata } from "next";
import EditorLoader from "@/components/editor/EditorLoader";

export const metadata: Metadata = { title: "Edit album" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditorLoader localId={id} />;
}
