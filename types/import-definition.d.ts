// Tells TypeScript that any import starting with "stimulus:" will return an array of Stimulus controller definitions.
declare module 'stimulus:*' {
  import type { Definition } from '@hotwired/stimulus';

  const definitions: Definition[];

  export default definitions;
}
