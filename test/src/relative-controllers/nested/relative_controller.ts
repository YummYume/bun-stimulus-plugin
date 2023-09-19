import { Controller } from '@hotwired/stimulus';

export default class NestedRelativeController extends Controller {
  connect() {
    this.element.textContent = 'Nested relative controller!';
  }
}
