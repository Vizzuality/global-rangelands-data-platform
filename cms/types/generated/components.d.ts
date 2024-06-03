import type { Schema, Attribute } from '@strapi/strapi';

export interface DefaultCitations extends Schema.Component {
  collectionName: 'components_default_citations';
  info: {
    displayName: 'Citations';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
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
    color: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'#000000'>;
  };
}

export interface DefaultLayer extends Schema.Component {
  collectionName: 'components_default_layers';
  info: {
    displayName: 'Layer';
    description: '';
  };
  attributes: {
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    layer: Attribute.Relation<'default.layer', 'oneToOne', 'api::layer.layer'>;
  };
}

export interface DefaultLegend extends Schema.Component {
  collectionName: 'components_default_legends';
  info: {
    displayName: 'Legend';
  };
  attributes: {
    type: Attribute.Enumeration<['Basic', 'Gradient', 'Choropleth']> &
      Attribute.Required &
      Attribute.DefaultTo<'Basic'>;
    items: Attribute.Component<'default.item', true>;
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

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'default.citations': DefaultCitations;
      'default.item': DefaultItem;
      'default.layer': DefaultLayer;
      'default.legend': DefaultLegend;
      'default.source': DefaultSource;
    }
  }
}
