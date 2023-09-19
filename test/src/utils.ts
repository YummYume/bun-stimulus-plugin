import type { Definition } from '@hotwired/stimulus';

export const exportDefinitions = (name: string, definitions: Definition[]) => {
  const metaDefinitions = document.createElement('meta');
  metaDefinitions.name = name;
  metaDefinitions.content = JSON.stringify(definitions.map((definition) => definition.identifier));

  document.head.appendChild(metaDefinitions);
};
