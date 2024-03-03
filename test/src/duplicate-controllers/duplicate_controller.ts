import { Controller } from '@hotwired/stimulus';

export default class DuplicateController extends Controller {
  connect() {
    this.element.textContent = 'Duplicate controller!';
  }
}
