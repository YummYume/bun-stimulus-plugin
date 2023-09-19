import { Controller } from '@hotwired/stimulus';

export default class CustomController extends Controller {
  connect() {
    this.element.textContent = 'Custom controller!';
  }
}
