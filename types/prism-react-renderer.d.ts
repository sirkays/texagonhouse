declare module "prism-react-renderer" {
  import * as React from "react";

  declare module "prism-react-renderer/themes/nightOwl" {
    const theme: any;
    export default theme;
  }

  export type Language =
    | "javascript"
    | "typescript"
    | "jsx"
    | "tsx"
    | "json"
    | "html"
    | "css"
    | "bash"
    | "python"
    | "java"
    | "cpp"
    | string;

  export interface Token {
    types: string[];
    content: string;
  }

  export interface RenderProps {
    className: string;
    style: React.CSSProperties;
    tokens: Token[][];
    getLineProps: (input: {line: Token[]; key?: React.Key}) => any;
    getTokenProps: (input: {token: Token; key?: React.Key}) => any;
  }

  export interface HighlightProps {
    code: string;
    language: Language;
    theme?: any;
    children: (props: RenderProps) => React.ReactNode;
  }

  const Highlight: React.FC<HighlightProps>;
  export default Highlight;
}
