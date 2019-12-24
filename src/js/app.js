import searchService from './services/apiService';
import { refs } from './utils/refs';
import photoCardTemplate from './templates/photo-card.hbs';
import { pWarning, pNotice } from './utils/pnotify';
import { messages } from './utils/messages';
import 'regenerator-runtime/runtime';
const debounce = require('lodash.debounce');
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
        const markup = makePhotoMarkup(data);
        insPhotoCards(markup);
      }
    })
    .catch(err => console.log(err));
}
function loadMoreBtnHandler(event) {
  event.preventDefault();
  const galleryHeight = refs.imagesList.offsetHeight;
  const formHeight = refs.searchForm.offsetHeight;
  const scrollingPoint = galleryHeight + formHeight;
  if (searchService.searchQuery.length === 0) {
    pNotice(messages.warningNoInput);
  } else {
    searchService
      .fetchImages()
      .then(data => {
        const markup = makePhotoMarkup(data);
        insPhotoCards(markup);
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
function clearListItems() {
  refs.imagesList.innerHTML = '';
}
function makePhotoMarkup(items) {
  return photoCardTemplate(items);
}
function insPhotoCards(items) {
  refs.imagesList.insertAdjacentHTML('beforeend', items);
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
