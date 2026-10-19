import { createContext, use } from "react";

import Image from "next/image";
import Markdown, { type Components } from "react-markdown";

import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { omit } from "lodash-es";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
};

export type RichTextVariant = "default" | "feature";

type RichTextProps = {
  children: string | undefined | null;
  className?: string;
  variant?: RichTextVariant;
};

const defaultComponents: Components = {
  a: (props) => (
    <a {...omit(props, "node")} target="_blank" className="break-all underline">
      {props.children}
    </a>
  ),
  ol: (props) => (
    <ol {...omit(props, "node")} className="ml-4 list-decimal">
      {props.children}
    </ol>
  ),
  ul: (props) => (
    <ul {...omit(props, "node")} className="ml-4 list-disc">
      {props.children}
    </ul>
  ),
};

const FeatureUnorderedListContext = createContext(false);

const FEATURE_HEADING_CLASS_NAME = "font-medium leading-6 [&:not(:first-child)]:!mt-6";

const FeatureListItem = (props: React.ComponentProps<"li">) => {
  const isUnordered = use(FeatureUnorderedListContext);

  if (!isUnordered) return <li {...props} />;

  return (
    <li {...props} className="flex gap-2 text-sm leading-6">
      <span aria-hidden className="shrink-0 py-0.5">
        <Image src="/images/features/icon-arrow.svg" alt="" width={20} height={20} unoptimized />
      </span>
      <span>{props.children}</span>
    </li>
  );
};

const featureComponents: Components = {
  ...defaultComponents,
  h1: (props) => (
    <h1 {...omit(props, "node")} className={FEATURE_HEADING_CLASS_NAME}>
      {props.children}
    </h1>
  ),
  h2: (props) => (
    <h2 {...omit(props, "node")} className={FEATURE_HEADING_CLASS_NAME}>
      {props.children}
    </h2>
  ),
  h3: (props) => (
    <h3 {...omit(props, "node")} className={FEATURE_HEADING_CLASS_NAME}>
      {props.children}
    </h3>
  ),
  strong: (props) => (
    <strong {...omit(props, "node")} className="font-medium">
      {props.children}
    </strong>
  ),
  ol: (props) => (
    <FeatureUnorderedListContext value={false}>
      <ol {...omit(props, "node")} className="ml-4 list-decimal">
        {props.children}
      </ol>
    </FeatureUnorderedListContext>
  ),
  ul: (props) => (
    <FeatureUnorderedListContext value>
      <ul {...omit(props, "node")} className="space-y-2.5">
        {props.children}
      </ul>
    </FeatureUnorderedListContext>
  ),
  li: (props) => <FeatureListItem {...omit(props, "node")} />,
};

const getMarkdownComponents = (variant: RichTextVariant): Components =>
  variant === "feature" ? featureComponents : defaultComponents;

const RichText = ({ children, className, variant = "default" }: RichTextProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <Markdown
        components={getMarkdownComponents(variant)}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      >
        {children}
      </Markdown>
    </div>
  );
};

export default RichText;
