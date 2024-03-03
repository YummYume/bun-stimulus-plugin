import type { Definition } from '@hotwired/stimulus';

/**
 * Set the definitions in a meta tag with the given name.
 * Can then be used to check for definitions in the tests.
 */
export const exportDefinitions = (name: string, definitions: Definition[]) => {
  const metaDefinitions = document.createElement('meta');
  metaDefinitions.name = name;
  metaDefinitions.content = JSON.stringify(definitions.map((definition) => definition.identifier));

  document.head.appendChild(metaDefinitions);
};
