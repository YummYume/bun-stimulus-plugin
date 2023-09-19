import { Controller } from '@hotwired/stimulus';

export default class NestedAbsoluteController extends Controller {
  connect() {
    this.element.textContent = 'Nested absolute controller!';
  }
}
