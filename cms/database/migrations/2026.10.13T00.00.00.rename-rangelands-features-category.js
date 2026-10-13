"use strict";

module.exports = {
  async up(knex) {
    const hasSlug =
      (await knex.schema.hasTable("feature_categories")) &&
      (await knex.schema.hasColumn("feature_categories", "slug"));
    if (!hasSlug) {
      return;
    }
    await knex("feature_categories")
      .where({ slug: "rangelands-features" })
      .update({ slug: "rangelands-stories", title: "Rangelands Stories" });
  },
};
