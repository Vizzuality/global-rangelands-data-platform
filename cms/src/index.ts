import type { Core } from "@strapi/strapi";
import slugify from "slugify";

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use((context, next) => {
      if (context.action !== "create" && context.action !== "update") return next();
      if (!context.uid.startsWith("api::")) return next();

      const attributes = (context.contentType?.attributes ?? {}) as Record<string, unknown>;
      if (!attributes.slug || !attributes.title) return next();

      const data = context.params?.data as { title?: string; slug?: string } | undefined;
      if (data?.title) {
        data.slug = slugify(data.title, { lower: true, strict: true, trim: true });
      }

      return next();
    });
  },

  bootstrap() {},
};
