import { Controller } from '@hotwired/stimulus';

export default class NestedRelativeLongNameController extends Controller {
  connect() {
    this.element.textContent = 'Nested Relative long name controller!';
  }
}
