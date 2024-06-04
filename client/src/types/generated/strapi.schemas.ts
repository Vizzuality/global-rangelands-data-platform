/**
 * Generated by orval v6.29.1 🍺
 * Do not edit manually.
 * DOCUMENTATION
 * OpenAPI spec version: 1.0.0
 */
export type GetLayersIdPopulateOneOf = { [key: string]: any };

export type GetLayersIdParams = {
  /**
   * Relations to return
   */
  populate?: string | GetLayersIdPopulateOneOf;
};

export type GetLayersPopulateOneOf = { [key: string]: any };

export type GetLayersParams = {
  /**
   * Sort by attributes ascending (asc) or descending (desc)
   */
  sort?: string;
  /**
   * Return page/pageSize (default: true)
   */
  "pagination[withCount]"?: boolean;
  /**
   * Page number (default: 0)
   */
  "pagination[page]"?: number;
  /**
   * Page size (default: 25)
   */
  "pagination[pageSize]"?: number;
  /**
   * Offset value (default: 0)
   */
  "pagination[start]"?: number;
  /**
   * Number of entities to return (default: 25)
   */
  "pagination[limit]"?: number;
  /**
   * Fields to return (ex: ['title','author','test'])
   */
  fields?: string[];
  /**
   * Relations to return
   */
  populate?: string | GetLayersPopulateOneOf;
  /**
   * Filters to apply
   */
  filters?: { [key: string]: any };
  /**
   * Locale to apply
   */
  locale?: string;
};

export type GetDatasetsIdPopulateOneOf = { [key: string]: any };

export type GetDatasetsIdParams = {
  /**
   * Relations to return
   */
  populate?: string | GetDatasetsIdPopulateOneOf;
};

export type GetDatasetsPopulateOneOf = { [key: string]: any };

export type GetDatasetsParams = {
  /**
   * Sort by attributes ascending (asc) or descending (desc)
   */
  sort?: string;
  /**
   * Return page/pageSize (default: true)
   */
  "pagination[withCount]"?: boolean;
  /**
   * Page number (default: 0)
   */
  "pagination[page]"?: number;
  /**
   * Page size (default: 25)
   */
  "pagination[pageSize]"?: number;
  /**
   * Offset value (default: 0)
   */
  "pagination[start]"?: number;
  /**
   * Number of entities to return (default: 25)
   */
  "pagination[limit]"?: number;
  /**
   * Fields to return (ex: ['title','author','test'])
   */
  fields?: string[];
  /**
   * Relations to return
   */
  populate?: string | GetDatasetsPopulateOneOf;
  /**
   * Filters to apply
   */
  filters?: { [key: string]: any };
  /**
   * Locale to apply
   */
  locale?: string;
};

/**
 * every controller of the api
 */
export type UsersPermissionsPermissionsTreeControllers = {
  [key: string]: {
    [key: string]: {
      enabled?: boolean;
      policy?: string;
    };
  };
};

export interface UsersPermissionsPermissionsTree {
  [key: string]: {
    /** every controller of the api */
    controllers?: UsersPermissionsPermissionsTreeControllers;
  };
}

export type UsersPermissionsRoleRequestBody = {
  description?: string;
  name?: string;
  permissions?: UsersPermissionsPermissionsTree;
  type?: string;
};

export interface UsersPermissionsUser {
  blocked?: boolean;
  confirmed?: boolean;
  createdAt?: string;
  email?: string;
  id?: number;
  provider?: string;
  updatedAt?: string;
  username?: string;
}

export interface UsersPermissionsUserRegistration {
  jwt?: string;
  user?: UsersPermissionsUser;
}

export interface UsersPermissionsRole {
  createdAt?: string;
  description?: string;
  id?: number;
  name?: string;
  type?: string;
  updatedAt?: string;
}

export type UploadFileProviderMetadata = { [key: string]: any };

export interface UploadFile {
  alternativeText?: string;
  caption?: string;
  createdAt?: string;
  ext?: string;
  formats?: number;
  hash?: string;
  height?: number;
  id?: number;
  mime?: string;
  name?: string;
  previewUrl?: string;
  provider?: string;
  provider_metadata?: UploadFileProviderMetadata;
  size?: number;
  updatedAt?: string;
  url?: string;
  width?: number;
}

export interface DefaultCitationsComponent {
  id?: number;
  name?: string;
  url?: string;
}

export interface DefaultSourceComponent {
  id?: number;
  name?: string;
  url?: string;
}

export type DefaultLegendComponentType =
  (typeof DefaultLegendComponentType)[keyof typeof DefaultLegendComponentType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DefaultLegendComponentType = {
  Basic: "Basic",
  Gradient: "Gradient",
  Choropleth: "Choropleth",
} as const;

export type DefaultLegendComponentItemsItem = {
  color?: string;
  id?: number;
  name?: string;
};

export interface DefaultLegendComponent {
  id?: number;
  items?: DefaultLegendComponentItemsItem[];
  type?: DefaultLegendComponentType;
}

export type LayerResponseMeta = { [key: string]: any };

export interface LayerResponse {
  data?: LayerResponseDataObject;
  meta?: LayerResponseMeta;
}

export type LayerUpdatedByDataAttributes = { [key: string]: any };

export type LayerUpdatedByData = {
  attributes?: LayerUpdatedByDataAttributes;
  id?: number;
};

export type LayerUpdatedBy = {
  data?: LayerUpdatedByData;
};

export type LayerType = (typeof LayerType)[keyof typeof LayerType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LayerType = {
  Mapbox: "Mapbox",
  GEE: "GEE",
} as const;

export type LayerLocalizations = {
  data?: LayerListResponseDataItemLocalized[];
};

export type LayerCreatedByDataAttributes = {
  blocked?: boolean;
  createdAt?: string;
  createdBy?: LayerCreatedByDataAttributesCreatedBy;
  email?: string;
  firstname?: string;
  isActive?: boolean;
  lastname?: string;
  preferedLanguage?: string;
  registrationToken?: string;
  resetPasswordToken?: string;
  roles?: LayerCreatedByDataAttributesRoles;
  updatedAt?: string;
  updatedBy?: LayerCreatedByDataAttributesUpdatedBy;
  username?: string;
};

export type LayerCreatedByData = {
  attributes?: LayerCreatedByDataAttributes;
  id?: number;
};

export type LayerCreatedBy = {
  data?: LayerCreatedByData;
};

export interface Layer {
  citations?: DefaultCitationsComponent[];
  config: unknown;
  createdAt?: string;
  createdBy?: LayerCreatedBy;
  description: string;
  interaction_config?: unknown;
  legend: DefaultLegendComponent;
  locale?: string;
  localizations?: LayerLocalizations;
  params_config?: unknown;
  publishedAt?: string;
  sources?: DefaultSourceComponent[];
  title: string;
  type: LayerType;
  updatedAt?: string;
  updatedBy?: LayerUpdatedBy;
}

export interface LayerResponseDataObject {
  attributes?: Layer;
  id?: number;
}

export type LayerCreatedByDataAttributesUpdatedByDataAttributes = { [key: string]: any };

export type LayerCreatedByDataAttributesUpdatedByData = {
  attributes?: LayerCreatedByDataAttributesUpdatedByDataAttributes;
  id?: number;
};

export type LayerCreatedByDataAttributesUpdatedBy = {
  data?: LayerCreatedByDataAttributesUpdatedByData;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesUsers = {
  data?: LayerCreatedByDataAttributesRolesDataItemAttributesUsersDataItem[];
};

export type LayerCreatedByDataAttributesRolesDataItemAttributes = {
  code?: string;
  createdAt?: string;
  createdBy?: LayerCreatedByDataAttributesRolesDataItemAttributesCreatedBy;
  description?: string;
  name?: string;
  permissions?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissions;
  updatedAt?: string;
  updatedBy?: LayerCreatedByDataAttributesRolesDataItemAttributesUpdatedBy;
  users?: LayerCreatedByDataAttributesRolesDataItemAttributesUsers;
};

export type LayerCreatedByDataAttributesRolesDataItem = {
  attributes?: LayerCreatedByDataAttributesRolesDataItemAttributes;
  id?: number;
};

export type LayerCreatedByDataAttributesRoles = {
  data?: LayerCreatedByDataAttributesRolesDataItem[];
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesUsersDataItemAttributes = {
  [key: string]: any;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesUsersDataItem = {
  attributes?: LayerCreatedByDataAttributesRolesDataItemAttributesUsersDataItemAttributes;
  id?: number;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesUpdatedByDataAttributes = {
  [key: string]: any;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesUpdatedByData = {
  attributes?: LayerCreatedByDataAttributesRolesDataItemAttributesUpdatedByDataAttributes;
  id?: number;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesUpdatedBy = {
  data?: LayerCreatedByDataAttributesRolesDataItemAttributesUpdatedByData;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItem = {
  attributes?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributes;
  id?: number;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissions = {
  data?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItem[];
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByDataAttributes =
  { [key: string]: any };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByData =
  {
    attributes?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByDataAttributes;
    id?: number;
  };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedBy =
  {
    data?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByData;
  };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleDataAttributes =
  { [key: string]: any };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleData =
  {
    attributes?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleDataAttributes;
    id?: number;
  };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRole = {
  data?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleData;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByDataAttributes =
  { [key: string]: any };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByData =
  {
    attributes?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByDataAttributes;
    id?: number;
  };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedBy =
  {
    data?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByData;
  };

export type LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributes = {
  action?: string;
  actionParameters?: unknown;
  conditions?: unknown;
  createdAt?: string;
  createdBy?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedBy;
  properties?: unknown;
  role?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRole;
  subject?: string;
  updatedAt?: string;
  updatedBy?: LayerCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedBy;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesCreatedByDataAttributes = {
  [key: string]: any;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesCreatedByData = {
  attributes?: LayerCreatedByDataAttributesRolesDataItemAttributesCreatedByDataAttributes;
  id?: number;
};

export type LayerCreatedByDataAttributesRolesDataItemAttributesCreatedBy = {
  data?: LayerCreatedByDataAttributesRolesDataItemAttributesCreatedByData;
};

export type LayerCreatedByDataAttributesCreatedByDataAttributes = { [key: string]: any };

export type LayerCreatedByDataAttributesCreatedByData = {
  attributes?: LayerCreatedByDataAttributesCreatedByDataAttributes;
  id?: number;
};

export type LayerCreatedByDataAttributesCreatedBy = {
  data?: LayerCreatedByDataAttributesCreatedByData;
};

export type LayerListResponseMetaPagination = {
  page?: number;
  /** @maximum 1 */
  pageCount?: number;
  /** @minimum 25 */
  pageSize?: number;
  total?: number;
};

export type LayerListResponseMeta = {
  pagination?: LayerListResponseMetaPagination;
};

export interface LayerListResponseDataItem {
  attributes?: Layer;
  id?: number;
}

export interface LayerListResponse {
  data?: LayerListResponseDataItem[];
  meta?: LayerListResponseMeta;
}

export type LayerLocalizationListResponseMetaPagination = {
  page?: number;
  /** @maximum 1 */
  pageCount?: number;
  /** @minimum 25 */
  pageSize?: number;
  total?: number;
};

export type LayerLocalizationListResponseMeta = {
  pagination?: LayerLocalizationListResponseMetaPagination;
};

export interface LayerListResponseDataItemLocalized {
  attributes?: Layer;
  id?: number;
}

export interface LayerLocalizationListResponse {
  data?: LayerListResponseDataItemLocalized[];
  meta?: LayerLocalizationListResponseMeta;
}

export type LayerLocalizationResponseMeta = { [key: string]: any };

export interface LayerResponseDataObjectLocalized {
  attributes?: Layer;
  id?: number;
}

export interface LayerLocalizationResponse {
  data?: LayerResponseDataObjectLocalized;
  meta?: LayerLocalizationResponseMeta;
}

export type LayerRequestDataType = (typeof LayerRequestDataType)[keyof typeof LayerRequestDataType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LayerRequestDataType = {
  Mapbox: "Mapbox",
  GEE: "GEE",
} as const;

export type LayerRequestData = {
  citations?: DefaultCitationsComponent[];
  config: unknown;
  description: string;
  interaction_config?: unknown;
  legend: DefaultLegendComponent;
  locale?: string;
  params_config?: unknown;
  sources?: DefaultSourceComponent[];
  title: string;
  type: LayerRequestDataType;
};

export interface LayerRequest {
  data: LayerRequestData;
}

export type LayerLocalizationRequestType =
  (typeof LayerLocalizationRequestType)[keyof typeof LayerLocalizationRequestType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LayerLocalizationRequestType = {
  Mapbox: "Mapbox",
  GEE: "GEE",
} as const;

export interface LayerLocalizationRequest {
  citations?: DefaultCitationsComponent[];
  config: unknown;
  description: string;
  interaction_config?: unknown;
  legend: DefaultLegendComponent;
  locale: string;
  params_config?: unknown;
  sources?: DefaultSourceComponent[];
  title: string;
  type: LayerLocalizationRequestType;
}

export interface DefaultLayerComponent {
  id?: number;
  layer?: DefaultLayerComponentLayer;
  name?: string;
}

export type DefaultLayerComponentLayerData = {
  attributes?: DefaultLayerComponentLayerDataAttributes;
  id?: number;
};

export type DefaultLayerComponentLayer = {
  data?: DefaultLayerComponentLayerData;
};

export type DefaultLayerComponentLayerDataAttributesUpdatedByDataAttributes = {
  [key: string]: any;
};

export type DefaultLayerComponentLayerDataAttributesUpdatedByData = {
  attributes?: DefaultLayerComponentLayerDataAttributesUpdatedByDataAttributes;
  id?: number;
};

export type DefaultLayerComponentLayerDataAttributesUpdatedBy = {
  data?: DefaultLayerComponentLayerDataAttributesUpdatedByData;
};

export type DefaultLayerComponentLayerDataAttributesType =
  (typeof DefaultLayerComponentLayerDataAttributesType)[keyof typeof DefaultLayerComponentLayerDataAttributesType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DefaultLayerComponentLayerDataAttributesType = {
  Mapbox: "Mapbox",
  GEE: "GEE",
} as const;

export type DefaultLayerComponentLayerDataAttributesSourcesItem = {
  id?: number;
  name?: string;
  url?: string;
};

export type DefaultLayerComponentLayerDataAttributesLocalizations = {
  data?: unknown[];
};

export type DefaultLayerComponentLayerDataAttributes = {
  citations?: DefaultLayerComponentLayerDataAttributesCitationsItem[];
  config?: unknown;
  createdAt?: string;
  createdBy?: DefaultLayerComponentLayerDataAttributesCreatedBy;
  description?: string;
  interaction_config?: unknown;
  legend?: DefaultLayerComponentLayerDataAttributesLegend;
  locale?: string;
  localizations?: DefaultLayerComponentLayerDataAttributesLocalizations;
  params_config?: unknown;
  publishedAt?: string;
  sources?: DefaultLayerComponentLayerDataAttributesSourcesItem[];
  title?: string;
  type?: DefaultLayerComponentLayerDataAttributesType;
  updatedAt?: string;
  updatedBy?: DefaultLayerComponentLayerDataAttributesUpdatedBy;
};

export type DefaultLayerComponentLayerDataAttributesLegendType =
  (typeof DefaultLayerComponentLayerDataAttributesLegendType)[keyof typeof DefaultLayerComponentLayerDataAttributesLegendType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DefaultLayerComponentLayerDataAttributesLegendType = {
  Basic: "Basic",
  Gradient: "Gradient",
  Choropleth: "Choropleth",
} as const;

export type DefaultLayerComponentLayerDataAttributesLegendItemsItem = {
  color?: string;
  id?: number;
  name?: string;
};

export type DefaultLayerComponentLayerDataAttributesLegend = {
  id?: number;
  items?: DefaultLayerComponentLayerDataAttributesLegendItemsItem[];
  type?: DefaultLayerComponentLayerDataAttributesLegendType;
};

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributes = {
  blocked?: boolean;
  createdAt?: string;
  createdBy?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesCreatedBy;
  email?: string;
  firstname?: string;
  isActive?: boolean;
  lastname?: string;
  preferedLanguage?: string;
  registrationToken?: string;
  resetPasswordToken?: string;
  roles?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRoles;
  updatedAt?: string;
  updatedBy?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesUpdatedBy;
  username?: string;
};

export type DefaultLayerComponentLayerDataAttributesCreatedByData = {
  attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributes;
  id?: number;
};

export type DefaultLayerComponentLayerDataAttributesCreatedBy = {
  data?: DefaultLayerComponentLayerDataAttributesCreatedByData;
};

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesUpdatedByDataAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesUpdatedByData = {
  attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesUpdatedByDataAttributes;
  id?: number;
};

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesUpdatedBy = {
  data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesUpdatedByData;
};

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItem = {
  attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributes;
  id?: number;
};

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRoles = {
  data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItem[];
};

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUsersDataItemAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUsersDataItem =
  {
    attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUsersDataItemAttributes;
    id?: number;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUsers =
  {
    data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUsersDataItem[];
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributes =
  {
    code?: string;
    createdAt?: string;
    createdBy?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesCreatedBy;
    description?: string;
    name?: string;
    permissions?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissions;
    updatedAt?: string;
    updatedBy?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUpdatedBy;
    users?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUsers;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUpdatedByDataAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUpdatedByData =
  {
    attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUpdatedByDataAttributes;
    id?: number;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUpdatedBy =
  {
    data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesUpdatedByData;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItem =
  {
    attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributes;
    id?: number;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissions =
  {
    data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItem[];
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByDataAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByData =
  {
    attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByDataAttributes;
    id?: number;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedBy =
  {
    data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedByData;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleDataAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleData =
  {
    attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleDataAttributes;
    id?: number;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRole =
  {
    data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRoleData;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByDataAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByData =
  {
    attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByDataAttributes;
    id?: number;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedBy =
  {
    data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedByData;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributes =
  {
    action?: string;
    actionParameters?: unknown;
    conditions?: unknown;
    createdAt?: string;
    createdBy?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesCreatedBy;
    properties?: unknown;
    role?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesRole;
    subject?: string;
    updatedAt?: string;
    updatedBy?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesPermissionsDataItemAttributesUpdatedBy;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesCreatedBy =
  {
    data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesCreatedByData;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesCreatedByDataAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesCreatedByData =
  {
    attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesRolesDataItemAttributesCreatedByDataAttributes;
    id?: number;
  };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesCreatedByDataAttributes =
  { [key: string]: any };

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesCreatedByData = {
  attributes?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesCreatedByDataAttributes;
  id?: number;
};

export type DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesCreatedBy = {
  data?: DefaultLayerComponentLayerDataAttributesCreatedByDataAttributesCreatedByData;
};

export type DefaultLayerComponentLayerDataAttributesCitationsItem = {
  id?: number;
  name?: string;
  url?: string;
};

export type DatasetResponseMeta = { [key: string]: any };

export interface DatasetResponseDataObject {
  attributes?: Dataset;
  id?: number;
}

export interface DatasetResponse {
  data?: DatasetResponseDataObject;
  meta?: DatasetResponseMeta;
}

export type DatasetUpdatedByDataAttributes = { [key: string]: any };

export type DatasetUpdatedByData = {
  attributes?: DatasetUpdatedByDataAttributes;
  id?: number;
};

export type DatasetUpdatedBy = {
  data?: DatasetUpdatedByData;
};

export type DatasetType = (typeof DatasetType)[keyof typeof DatasetType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DatasetType = {
  Group: "Group",
  Temporal: "Temporal",
} as const;

export type DatasetLocalizations = {
  data?: DatasetListResponseDataItemLocalized[];
};

export type DatasetCreatedByDataAttributes = { [key: string]: any };

export type DatasetCreatedByData = {
  attributes?: DatasetCreatedByDataAttributes;
  id?: number;
};

export type DatasetCreatedBy = {
  data?: DatasetCreatedByData;
};

export interface Dataset {
  createdAt?: string;
  createdBy?: DatasetCreatedBy;
  layers: DefaultLayerComponent[];
  locale?: string;
  localizations?: DatasetLocalizations;
  publishedAt?: string;
  title: string;
  type: DatasetType;
  updatedAt?: string;
  updatedBy?: DatasetUpdatedBy;
}

export type DatasetListResponseMetaPagination = {
  page?: number;
  /** @maximum 1 */
  pageCount?: number;
  /** @minimum 25 */
  pageSize?: number;
  total?: number;
};

export type DatasetListResponseMeta = {
  pagination?: DatasetListResponseMetaPagination;
};

export interface DatasetListResponseDataItem {
  attributes?: Dataset;
  id?: number;
}

export interface DatasetListResponse {
  data?: DatasetListResponseDataItem[];
  meta?: DatasetListResponseMeta;
}

export type DatasetLocalizationListResponseMetaPagination = {
  page?: number;
  /** @maximum 1 */
  pageCount?: number;
  /** @minimum 25 */
  pageSize?: number;
  total?: number;
};

export type DatasetLocalizationListResponseMeta = {
  pagination?: DatasetLocalizationListResponseMetaPagination;
};

export interface DatasetListResponseDataItemLocalized {
  attributes?: Dataset;
  id?: number;
}

export interface DatasetLocalizationListResponse {
  data?: DatasetListResponseDataItemLocalized[];
  meta?: DatasetLocalizationListResponseMeta;
}

export type DatasetLocalizationResponseMeta = { [key: string]: any };

export interface DatasetResponseDataObjectLocalized {
  attributes?: Dataset;
  id?: number;
}

export interface DatasetLocalizationResponse {
  data?: DatasetResponseDataObjectLocalized;
  meta?: DatasetLocalizationResponseMeta;
}

export type DatasetRequestDataType =
  (typeof DatasetRequestDataType)[keyof typeof DatasetRequestDataType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DatasetRequestDataType = {
  Group: "Group",
  Temporal: "Temporal",
} as const;

export type DatasetRequestData = {
  layers: DefaultLayerComponent[];
  locale?: string;
  title: string;
  type: DatasetRequestDataType;
};

export interface DatasetRequest {
  data: DatasetRequestData;
}

export type DatasetLocalizationRequestType =
  (typeof DatasetLocalizationRequestType)[keyof typeof DatasetLocalizationRequestType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DatasetLocalizationRequestType = {
  Group: "Group",
  Temporal: "Temporal",
} as const;

export interface DatasetLocalizationRequest {
  layers: DefaultLayerComponent[];
  locale: string;
  title: string;
  type: DatasetLocalizationRequestType;
}

export type ErrorErrorDetails = { [key: string]: any };

export type ErrorError = {
  details?: ErrorErrorDetails;
  message?: string;
  name?: string;
  status?: number;
};

export interface Error {
  /** @nullable */
  data?: ErrorData;
  error: ErrorError;
}

export type ErrorDataOneOfTwoItem = { [key: string]: any };

export type ErrorDataOneOf = { [key: string]: any };

/**
 * @nullable
 */
export type ErrorData = ErrorDataOneOf | ErrorDataOneOfTwoItem[] | null;