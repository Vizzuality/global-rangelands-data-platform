import slugify from "slugify";

export default {
  async beforeCreate(event) {
    const { title} = event.params.data;

    if (title) {
      event.params.data.slug = slugify(title, { lower: true, strict: true, trim: true });
    }
  },

  async beforeUpdate(event) {
    const { title } = event.params.data;

    if (title) {
      event.params.data.slug = slugify(title, { lower: true, strict: true, trim: true });
    }
  }
}
