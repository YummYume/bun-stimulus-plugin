import { Controller } from '@hotwired/stimulus';

export default class RelativeLongNameController extends Controller {
  connect() {
    this.element.textContent = 'Relative long name controller!';
  }
}
