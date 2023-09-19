import { Controller } from '@hotwired/stimulus';

export default class AbsoluteController extends Controller {
  connect() {
    this.element.textContent = 'Absolute controller!';
  }
}
