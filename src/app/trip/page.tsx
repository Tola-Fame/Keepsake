import type { Metadata } from "next";
import Header from "@/components/Header";
import TripBuilder from "./TripBuilder";

export const metadata: Metadata = { title: "Make a travel book" };

export default function Page() {
  return (
    <>
      <Header />
      <TripBuilder />
    </>
  );
}
