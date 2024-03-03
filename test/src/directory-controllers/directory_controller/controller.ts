import { Controller } from '@hotwired/stimulus';

export default class DirectorySuffixController extends Controller {
  connect() {
    this.element.textContent = 'Directory-based controller with a suffix!';
  }
}
