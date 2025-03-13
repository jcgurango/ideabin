import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IdeaBin",
    short_name: "IdeaBin",
    description:
      "A bin for your ideas. Messenger/inbox-style notetaking with audio recording, image, and share capabilities.",
    start_url: "/",
    display: "standalone",
    background_color: "#92abbd",
    theme_color: "#243443",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
