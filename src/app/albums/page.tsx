import type { Metadata } from "next";
import Header from "@/components/Header";
import AlbumList from "./AlbumList";

export const metadata: Metadata = { title: "My albums" };

export default function Page() {
  return (
    <>
      <Header />
      <AlbumList />
    </>
  );
}
