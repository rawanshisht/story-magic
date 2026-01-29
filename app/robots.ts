import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/create", "/stories", "/api/", "/login", "/register"],
    },
    sitemap: "https://storymagic.app/sitemap.xml",
  };
}
