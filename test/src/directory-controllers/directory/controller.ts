import { Controller } from '@hotwired/stimulus';

export default class DirectoryController extends Controller {
  connect() {
    this.element.textContent = 'Directory-based controller!';
  }
}
