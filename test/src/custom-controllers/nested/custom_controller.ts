import { Controller } from '@hotwired/stimulus';

export default class NestedCustomController extends Controller {
  connect() {
    this.element.textContent = 'Nested custom controller!';
  }
}
