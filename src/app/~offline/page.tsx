import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
};

export default function Page() {
  return (
    <>
      <h1>Offline</h1>
      <h2>You are offline.</h2>
    </>
  );
}
