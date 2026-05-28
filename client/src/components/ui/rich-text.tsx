import Markdown from "react-markdown";

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

type RichTextProps = {
  children: string | undefined | null;
  className?: string;
};

const RichText = ({ children, className }: RichTextProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Markdown
        components={{
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
        }}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      >
        {children}
      </Markdown>
    </div>
  );
};

export default RichText;
