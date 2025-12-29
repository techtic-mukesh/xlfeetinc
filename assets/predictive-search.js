class PredictiveSearch extends SearchForm {
  constructor() {
    super();

    this.cachedResults = {};
    this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
    this.allPredictiveSearchInstances = document.querySelectorAll('predictive-search');
    this.abortController = new AbortController();
    this.searchTerm = '';
    this.isOpen = false;

    this.closeButton = this.querySelector('.search-btn.close-icon');

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));
    this.input.form.addEventListener('reset', this.onFormReset.bind(this));

    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.input.addEventListener('input', this.onChange.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    super.onChange();

    const newSearchTerm = this.getQuery();

    /* Show / hide close button */
    if (this.closeButton) {
      this.closeButton.style.display = newSearchTerm ? 'flex' : 'none';
    }

    /* Remove old results if term changes */
    if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
      this.querySelector('#predictive-search-results-groups-wrapper')?.remove();
    }

    this.searchTerm = newSearchTerm;

    if (!this.searchTerm.length) {
      this.close(true);
      return;
    }

    this.getSearchResults(this.searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) {
      event.preventDefault();
    }
  }

  onFormReset() {
    /* HARD RESET */
    this.searchTerm = '';
    this.abortController.abort();
    this.abortController = new AbortController();

    if (this.closeButton) {
      this.closeButton.style.display = 'none';
    }

    this.close(true);
  }

  onFocus() {
    const currentSearchTerm = this.getQuery();
    if (!currentSearchTerm.length) return;

    if (this.searchTerm !== currentSearchTerm) {
      this.onChange();
    } else if (this.getAttribute('results') === 'true') {
      this.open();
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) {
        this.close();
      }
    });
  }

  onKeyup(event) {
    if (!this.getQuery().length) {
      this.close(true);
    }

    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up');
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      event.preventDefault();
    }
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(/\s+/g, '-').toLowerCase();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    fetch(
      `${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`,
      { signal: this.abortController.signal }
    )
      .then((response) => response.text())
      .then((text) => {
        const markup = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('#shopify-section-predictive-search')?.innerHTML;

        if (!markup) return;

        this.allPredictiveSearchInstances.forEach((instance) => {
          instance.cachedResults[queryKey] = markup;
        });

        this.renderSearchResults(markup);
      })
      .catch(() => this.close());
  }

  renderSearchResults(markup) {
    this.predictiveSearchResults.innerHTML = markup;
    this.predictiveSearchResults.style.display = 'block';
    this.setAttribute('results', 'true');
    this.open();
  }

  open() {
    this.setAttribute('open', 'true');
    this.input.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
  }

  close(clearSearchTerm = false) {
    this.closeResults(clearSearchTerm);
    this.isOpen = false;
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
    }

    /* FORCE HIDE DROPDOWN */
    this.predictiveSearchResults.innerHTML = '';
    this.predictiveSearchResults.style.display = 'none';

    this.removeAttribute('results');
    this.removeAttribute('open');
    this.removeAttribute('loading');

    this.input.setAttribute('aria-expanded', 'false');
    this.input.setAttribute('aria-activedescendant', '');
  }

  switchOption(direction) {
    if (!this.getAttribute('open')) return;

    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');

    const options = Array.from(
      this.querySelectorAll('li, button.predictive-search__item')
    ).filter((el) => el.offsetParent !== null);

    if (!options.length) return;

    let index = options.indexOf(selectedElement);
    index = moveUp
      ? index <= 0 ? options.length - 1 : index - 1
      : index === options.length - 1 ? 0 : index + 1;

    selectedElement?.setAttribute('aria-selected', false);
    options[index].setAttribute('aria-selected', true);
    this.input.setAttribute('aria-activedescendant', options[index].id);
  }

  selectOption() {
    this.querySelector('[aria-selected="true"] a, button[aria-selected="true"]')?.click();
  }
}

customElements.define('predictive-search', PredictiveSearch);
