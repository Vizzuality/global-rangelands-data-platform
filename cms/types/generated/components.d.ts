import type { Schema, Struct } from '@strapi/strapi';

export interface DefaultCitations extends Struct.ComponentSchema {
  collectionName: 'components_default_citations';
  info: {
    description: '';
    displayName: 'Citations';
  };
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface DefaultFurtherInfo extends Struct.ComponentSchema {
  collectionName: 'components_default_further_infos';
  info: {
    displayName: 'Further Info';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    content_es: Schema.Attribute.RichText;
    content_fr: Schema.Attribute.RichText;
    type: Schema.Attribute.Enumeration<['link', 'paper', 'video']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'link'>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface DefaultItem extends Struct.ComponentSchema {
  collectionName: 'components_default_items';
  info: {
    description: '';
    displayName: 'Item';
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#000000'>;
    group: Schema.Attribute.String;
    name: Schema.Attribute.String;
    name_es: Schema.Attribute.String;
    name_fr: Schema.Attribute.String;
    style: Schema.Attribute.Enumeration<['filled', 'outline']>;
  };
}

export interface DefaultLayer extends Struct.ComponentSchema {
  collectionName: 'components_default_layers';
  info: {
    description: '';
    displayName: 'Layer';
  };
  attributes: {
    group: Schema.Attribute.String;
    group_es: Schema.Attribute.String;
    group_fr: Schema.Attribute.String;
    layer: Schema.Attribute.Relation<'oneToOne', 'api::layer.layer'>;
    type: Schema.Attribute.String;
  };
}

export interface DefaultLegend extends Struct.ComponentSchema {
  collectionName: 'components_default_legends';
  info: {
    description: '';
    displayName: 'Legend';
  };
  attributes: {
    items: Schema.Attribute.Component<'default.item', true>;
    type: Schema.Attribute.Enumeration<
      ['Basic', 'Gradient', 'Choropleth', 'Rangeland']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Basic'>;
    unit: Schema.Attribute.String;
    unit_es: Schema.Attribute.String;
    unit_fr: Schema.Attribute.String;
  };
}

export interface DefaultSource extends Struct.ComponentSchema {
  collectionName: 'components_default_sources';
  info: {
    displayName: 'Source';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface TranslationsDatasetCategoryTranslation
  extends Struct.ComponentSchema {
  collectionName: 'components_translations_dataset_category_translations';
  info: {
    displayName: 'dataset-category translation';
  };
  attributes: {
    locale: Schema.Attribute.Enumeration<['en', 'es', 'fr']>;
    title: Schema.Attribute.String;
  };
}

export interface TranslationsDatasetTranslation extends Struct.ComponentSchema {
  collectionName: 'components_translations_dataset_translations';
  info: {
    description: '';
    displayName: 'Dataset Translation';
    icon: 'discuss';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    locale: Schema.Attribute.Enumeration<['es', 'fr']> &
      Schema.Attribute.Required;
    short_description: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TranslationsEcoregionTranslation
  extends Struct.ComponentSchema {
  collectionName: 'components_translations_ecoregion_translations';
  info: {
    description: '';
    displayName: 'Ecoregion Translation';
  };
  attributes: {
    locale: Schema.Attribute.Enumeration<['es', 'fr']> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TranslationsLayerTranslation extends Struct.ComponentSchema {
  collectionName: 'components_translations_layer_translations';
  info: {
    description: '';
    displayName: 'Layer Translation';
  };
  attributes: {
    description: Schema.Attribute.Text;
    locale: Schema.Attribute.Enumeration<['es', 'fr']> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TranslationsRangelandTranslation
  extends Struct.ComponentSchema {
  collectionName: 'components_translations_rangeland_translations';
  info: {
    description: '';
    displayName: 'Rangeland Translation';
  };
  attributes: {
    locale: Schema.Attribute.Enumeration<['es', 'fr']>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TranslationsStoryCategoryTranslation
  extends Struct.ComponentSchema {
  collectionName: 'components_translations_story_category_translations';
  info: {
    displayName: 'story-category translation';
  };
  attributes: {
    locale: Schema.Attribute.Enumeration<['en', 'es', 'fr']>;
    title: Schema.Attribute.String;
  };
}

export interface TranslationsStoryTranslation extends Struct.ComponentSchema {
  collectionName: 'components_translations_story_translations';
  info: {
    description: '';
    displayName: 'Story Translation';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    locale: Schema.Attribute.Enumeration<['es', 'fr']>;
    notes: Schema.Attribute.RichText;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
  };
}

export interface TranslationsTranslations extends Struct.ComponentSchema {
  collectionName: 'components_translations_translations';
  info: {
    displayName: 'translations';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'default.citations': DefaultCitations;
      'default.further-info': DefaultFurtherInfo;
      'default.item': DefaultItem;
      'default.layer': DefaultLayer;
      'default.legend': DefaultLegend;
      'default.source': DefaultSource;
      'translations.dataset-category-translation': TranslationsDatasetCategoryTranslation;
      'translations.dataset-translation': TranslationsDatasetTranslation;
      'translations.ecoregion-translation': TranslationsEcoregionTranslation;
      'translations.layer-translation': TranslationsLayerTranslation;
      'translations.rangeland-translation': TranslationsRangelandTranslation;
      'translations.story-category-translation': TranslationsStoryCategoryTranslation;
      'translations.story-translation': TranslationsStoryTranslation;
      'translations.translations': TranslationsTranslations;
    }
  }
}
