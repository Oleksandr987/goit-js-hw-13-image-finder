import searchService from './services/apiService';
import { refs } from './utils/refs';
import photoCardTemplate from './templates/photo-card.hbs';
const debounce = require('lodash.debounce');
import { pWarning, pNotice } from './utils/pnotify';
import { messages } from './utils/messages';
import 'regenerator-runtime/runtime';

function searchFormSubmitHandler(event) {
  event.preventDefault();
  const form = event.target;
  const inputValue = form.value.toLowerCase();
  searchService.searchQuery = inputValue;
  searchService
    .fetchImages()
    .then(data => {
      if (data.hits.length === 0) {
        pWarning(messages.warningNotIn);
      } else if (inputValue.length === 0) {
        clearListItems();
      } else {
        clearListItems();
        const markup = buildPhotoCardMarkup(data);
        insertPhotoCards(markup);
      }
    })
    .catch(err => console.log(err));
}

function loadMoreBtnHandler(event) {
  event.preventDefault();
  const galleryHeight = refs.galleryList.offsetHeight;
  const formHeight = refs.searchForm.offsetHeight;
  const scrollingPoint = galleryHeight + formHeight;
  if (searchService.searchQuery.length === 0) {
    pNotice(messages.warningNoInput);
  } else {
    searchService
      .fetchImages()
      .then(data => {
        const markup = buildPhotoCardMarkup(data);
        insertPhotoCards(markup);
      })
      .then(
        setTimeout(() => {
          window.scrollTo({
            top: scrollingPoint,
            left: 0,
            behavior: 'smooth',
          });
        }, 100),
      );
  }
}

function buildPhotoCardMarkup(items) {
  return photoCardTemplate(items);
}

function insertPhotoCards(items) {
  refs.galleryList.insertAdjacentHTML('beforeend', items);
}

function clearListItems() {
  refs.galleryList.innerHTML = '';
}

refs.searchForm.addEventListener(
  'input',
  debounce(searchFormSubmitHandler, 500),
);

refs.searchForm.addEventListener('keydown', event => {
  if (event.code === 'Enter' || event.code === 'NumpadEnter') {
    event.preventDefault();
  }
});

refs.loadMoreBtn.addEventListener('click', loadMoreBtnHandler);
