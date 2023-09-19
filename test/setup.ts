import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { Event as HappyDOMEvent } from 'happy-dom';

GlobalRegistrator.register();
// See https://github.com/capricorn86/happy-dom/issues/1049
(<typeof HappyDOMEvent>(<unknown>global.Event)) = HappyDOMEvent;
