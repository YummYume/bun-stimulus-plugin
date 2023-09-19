import { Application } from '@hotwired/stimulus';
import absoluteDefinitions from 'stimulus:/home/bun/bun-stimulus-plugin/test/src/absolute-controllers';
import customDefinitions from 'stimulus:./$custom-controllers';
import invalidDefinitions from 'stimulus:./invalid-controllers';
import relativeDefinitions from 'stimulus:./relative-controllers';

import { exportDefinitions } from './utils';

// Load the Stimulus application
const app = Application.start();

// Register the controllers in ./controllers
app.load(relativeDefinitions);
app.load(customDefinitions);
app.load(absoluteDefinitions);

// Export the controller definitions
exportDefinitions('relative-definitions', relativeDefinitions);
exportDefinitions('custom-definitions', customDefinitions);
exportDefinitions('absolute-definitions', absoluteDefinitions);
exportDefinitions('invalid-definitions', invalidDefinitions);
