import Markdown from "react-markdown";

import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { omit } from "lodash-es";

type RichTextProps = {
  children: string | undefined | null;
  className?: string;
};

const RichText = ({ children, className }: RichTextProps) => {
  return (
    <Markdown
      components={{
        a: (props) => (
          <a {...omit(props, "node")} target="_blank" className="underline">
            {props.children}
          </a>
        ),
        ol: (props) => (
          <ol {...omit(props, "node")} className="ml-4 list-decimal">
            {props.children}
          </ol>
        ),
      }}
      className={cn("space-y-2", className)}
      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
      rehypePlugins={[rehypeRaw]}
    >
      {children}
    </Markdown>
  );
};

export default RichText;
