import { Controller } from '@hotwired/stimulus';

export default class DirectoryDuplicateController extends Controller {
  connect() {
    this.element.textContent = 'Directory duplicate controller!';
  }
}
