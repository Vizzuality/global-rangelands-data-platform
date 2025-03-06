import type { Schema, Attribute } from '@strapi/strapi';

export interface DefaultCitations extends Schema.Component {
  collectionName: 'components_default_citations';
  info: {
    displayName: 'Citations';
    description: '';
  };
  attributes: {
    content: Attribute.Text & Attribute.Required;
    url: Attribute.String;
  };
}

export interface DefaultItem extends Schema.Component {
  collectionName: 'components_default_items';
  info: {
    displayName: 'Item';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    color: Attribute.String & Attribute.DefaultTo<'#000000'>;
    name_es: Attribute.String;
    name_fr: Attribute.String;
  };
}

export interface DefaultLayer extends Schema.Component {
  collectionName: 'components_default_layers';
  info: {
    displayName: 'Layer';
    description: '';
  };
  attributes: {
    layer: Attribute.Relation<'default.layer', 'oneToOne', 'api::layer.layer'>;
    type: Attribute.String;
  };
}

export interface DefaultLegend extends Schema.Component {
  collectionName: 'components_default_legends';
  info: {
    displayName: 'Legend';
    description: '';
  };
  attributes: {
    type: Attribute.Enumeration<
      ['Basic', 'Gradient', 'Choropleth', 'Rangeland']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'Basic'>;
    items: Attribute.Component<'default.item', true>;
    unit: Attribute.String;
    unit_es: Attribute.String;
    unit_fr: Attribute.String;
  };
}

export interface DefaultSource extends Schema.Component {
  collectionName: 'components_default_sources';
  info: {
    displayName: 'Source';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    url: Attribute.String;
  };
}

export interface TranslationsDatasetTranslation extends Schema.Component {
  collectionName: 'components_translations_dataset_translations';
  info: {
    displayName: 'Dataset Translation';
    icon: 'discuss';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.RichText;
    locale: Attribute.Enumeration<['es', 'fr']> & Attribute.Required;
  };
}

export interface TranslationsEcoregionTranslation extends Schema.Component {
  collectionName: 'components_translations_ecoregion_translations';
  info: {
    displayName: 'Ecoregion Translation';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    locale: Attribute.Enumeration<['es', 'fr']> & Attribute.Required;
  };
}

export interface TranslationsLayerTranslation extends Schema.Component {
  collectionName: 'components_translations_layer_translations';
  info: {
    displayName: 'Layer Translation';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    locale: Attribute.Enumeration<['es', 'fr']> & Attribute.Required;
  };
}

export interface TranslationsRangelandTranslation extends Schema.Component {
  collectionName: 'components_translations_rangeland_translations';
  info: {
    displayName: 'Rangeland Translation';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    locale: Attribute.Enumeration<['es', 'fr']>;
  };
}

export interface TranslationsStoryTranslation extends Schema.Component {
  collectionName: 'components_translations_story_translations';
  info: {
    displayName: 'Story Translation';
  };
  attributes: {
    title: Attribute.String & Attribute.Required & Attribute.Unique;
    description: Attribute.RichText;
    further_information: Attribute.RichText;
    notes: Attribute.RichText;
    locale: Attribute.Enumeration<['es', 'fr']>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'default.citations': DefaultCitations;
      'default.item': DefaultItem;
      'default.layer': DefaultLayer;
      'default.legend': DefaultLegend;
      'default.source': DefaultSource;
      'translations.dataset-translation': TranslationsDatasetTranslation;
      'translations.ecoregion-translation': TranslationsEcoregionTranslation;
      'translations.layer-translation': TranslationsLayerTranslation;
      'translations.rangeland-translation': TranslationsRangelandTranslation;
      'translations.story-translation': TranslationsStoryTranslation;
    }
  }
}
