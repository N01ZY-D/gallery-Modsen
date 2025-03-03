import { pagePaths } from "../helpers/paths.js";
import { formSelectorsId } from "../helpers/selectors.js";
import UNSPLASH_ACCESS_KEY from "./apikey.js";

const accessKey = UNSPLASH_ACCESS_KEY;
const gallery = document.querySelector(".gallery");
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const modal = document.querySelector(".modal");
const modalImg = document.querySelector(".modal img");
const closeModal = document.querySelector(".close-modal");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let images = [];
let currentIndex = 0;

function loadCommonComponents() {
  return Promise.all([
    fetch(pagePaths.header)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.text();
      })
      .then((data) => {
        document.getElementById(formSelectorsId.header).innerHTML = data;
      }),

    fetch(pagePaths.footer)
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.text();
      })
      .then((data) => {
        document.getElementById(formSelectorsId.footer).innerHTML = data;
      }),
  ]);
}

// Получение изображений из Unsplash API
async function fetchImages() {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/?client_id=${accessKey}&per_page=20`
    );
    images = await response.json();
    displayImages(images);
  } catch (error) {
    console.error("Ошибка загрузки изображений", error);
  }
}

// Отображение изображений в галерее
function displayImages(images) {
  gallery.innerHTML = "";
  images.forEach((image, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = image.urls.small;
    imgElement.alt = image.alt_description || "Image";
    imgElement.dataset.index = index;
    gallery.appendChild(imgElement);
  });
}

// Делегирование событий: обработка кликов по изображениям галереи
gallery.addEventListener("click", (event) => {
  const imgElement = event.target;
  if (imgElement.tagName === "IMG") {
    openModal(parseInt(imgElement.dataset.index, 10));
  }
});

// Фильтрация изображений по поиску
searchButton.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase();
  const filteredImages = images.filter(
    (img) =>
      img.alt_description && img.alt_description.toLowerCase().includes(query)
  );
  displayImages(filteredImages);
});

// Открытие модального окна
function openModal(index) {
  currentIndex = index;
  updateModalImage();
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

// Закрытие модального окна
closeModal.addEventListener("click", closeModalWindow);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalWindow();
});
function closeModalWindow() {
  modal.classList.remove("open");
  document.body.style.overflow = "auto";
}

// Обновление изображения в модальном окне
function updateModalImage() {
  modalImg.src = images[currentIndex].urls.regular;
}

// Пролистывание карусели
prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateModalImage();
});
nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % images.length;
  updateModalImage();
});

// Обработка стрелок клавиатуры
document.addEventListener("keydown", (e) => {
  if (modal.classList.contains("open")) {
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
    if (e.key === "Escape") closeModalWindow();
  }
});

loadCommonComponents();
fetchImages();
