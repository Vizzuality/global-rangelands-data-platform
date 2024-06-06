import slugify from "slugify";

export default {
  async beforeCreate(event) {
    const { title, locale } = event.params.data;

    if (title && locale === 'en') {
      event.params.data.slug = slugify(title, { lower: true, strict: true, trim: true });
    }
  },

  async beforeUpdate(event) {
    const { title } = event.params.data;
    const existingEntity: any = await strapi.entityService.findOne('api::rangeland.rangeland', event.params.where.id, {
      fields: ['locale']
    });

    if (title && existingEntity.locale && existingEntity.locale === 'en') {
      event.params.data.slug = slugify(title, { lower: true, strict: true, trim: true });
    }
  }
}