import { Application } from '@hotwired/stimulus';
import customDefinitions from 'stimulus:./$custom-controllers';
import invalidDefinitions from 'stimulus:./invalid-controllers';
import relativeDefinitions from 'stimulus:./relative-controllers';
import relativeLongNameDefinitions from 'stimulus:./relative-long-name-controllers';
import absoluteDefinitions from 'stimulus:/home/bun/bun-stimulus-plugin/test/src/absolute-controllers';

import { exportDefinitions } from './utils';

// Load the Stimulus application
const app = Application.start();

// Register the controllers
app.load(relativeDefinitions);
app.load(customDefinitions);
app.load(absoluteDefinitions);
app.load(relativeLongNameDefinitions);

// Export the controller definitions
exportDefinitions('relative-definitions', relativeDefinitions);
exportDefinitions('custom-definitions', customDefinitions);
exportDefinitions('absolute-definitions', absoluteDefinitions);
exportDefinitions('invalid-definitions', invalidDefinitions);
exportDefinitions('relative-long-name-definitions', relativeLongNameDefinitions);
