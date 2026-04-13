/// <reference types="vite/client" />

declare module '*.module.css' {
  const content: Record<string, string>;
  export default content;
}
