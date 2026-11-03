import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import NewAlbum from "./NewAlbum";

export const metadata: Metadata = { title: "New album" };

export default function Page() {
  return (
    <>
      <Header />
      <Suspense>
        <NewAlbum />
      </Suspense>
    </>
  );
}
