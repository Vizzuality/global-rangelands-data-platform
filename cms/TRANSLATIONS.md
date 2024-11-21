## Translations

For this specific project, we opted out of Strapi's localization plugin because of several reasons (Strapi relationship model causing deyncs, client not liking the the translations are handled...). Instead, we will be using a custom approach to handle translations. This will allow us to have more control over the translations and avoid relationship desyncs like it could happen before.

All main Collection types will have a `translations` field. This field will be an array of Repeatable Components, each one representing a translation for a given locale of the corresponding Collection. For example, `Datasets` will have a corresponding `Dataset Translation` component, and so on. Each translation component is composed of:
- A `locale` enum field, containing a string representing the locale of the translated fields. Please note, that because of how Strapi handles enums, the locale enum value must be defined for each Component, so whenever adding a new locale to the system, be mindful of updating all the Components that have a `locale` field.
- A set of translatable fields, depending on the corresponding Collection. For example Dataset has `title` and `description` as translatable fields, so these fields must be present in the Dataset Translation Component as well, while Ecoregion only has `title`, so EcoRegion Translation Component will only have a `title` field.

An exception to this are the `Items` inside the Layer's Legend component, which require their `title` field to be localized; either because of Strapi or model limitations, it's not possible to add a Repeatable component to the Item component in the same manner as in the top level Collections. For simplicity in this particular case, we have opted for denormalizing the data, so that the translatable fields are there, one for each locale, with  a prefix. For example, the `title` field in the Item component will have `title_es`, `title_fr`, etc. This is not ideal, but it's a compromise we have to make for now.

A final note to keep in mind, it is assumed that the default locale is English, so the fields that are present on the Collection themselves are considered to be in English.
