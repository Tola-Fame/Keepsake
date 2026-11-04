import type { Metadata } from "next";
import Header from "@/components/Header";
import AlbumList from "./AlbumList";

export const metadata: Metadata = { title: "My bookshelf" };

export default function Page() {
  return (
    <>
      <Header />
      <AlbumList />
    </>
  );
}
