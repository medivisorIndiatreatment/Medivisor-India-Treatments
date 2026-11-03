// Type declarations for modules without types
declare module 'country-list' {
  interface Country {
    name: string;
    code: string;
  }
  function getData(): Country[];
  export default getData;
}