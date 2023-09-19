import { Controller } from '@hotwired/stimulus';

export default class RelativeController extends Controller {
  connect() {
    this.element.textContent = 'Relative controller!';
  }
}
