import { pagePaths } from "../helpers/paths.js";
import { formSelectorsId } from "../helpers/selectors.js";
import UNSPLASH_ACCESS_KEY from "./apikey.js";

const accessKey = UNSPLASH_ACCESS_KEY;
const elements = {
  gallery: document.querySelector(".gallery"),
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
  modal: document.querySelector(".modal"),
  modalImg: document.querySelector(".modal img"),
  closeModal: document.querySelector(".close-modal"),
  prevBtn: document.querySelector(".prev"),
  nextBtn: document.querySelector(".next"),
};

let images = [];
const imageCache = {};
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

// Получение изображений из Unsplash API с учетом запроса
async function fetchImages(query = "random") {
  try {
    Object.keys(imageCache).forEach((key) => delete imageCache[key]);

    const endpoint =
      query === "random"
        ? `https://api.unsplash.com/photos/random?count=12&client_id=${accessKey}`
        : `https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}&per_page=12`;

    const response = await fetch(endpoint);
    const data = await response.json();
    images = query === "random" ? data : data.results;
    displayImages(images);
  } catch (error) {
    console.error("Ошибка загрузки изображений", error);
  }
}

function preloadImages() {
  images.forEach((image, index) => {
    if (!imageCache[index]) {
      // Если изображения ещё нет в кэше
      const img = new Image();
      img.src = image.urls.regular;
      img.onload = () => {
        imageCache[index] = img; // Сохраняем загруженное изображение
      };
    }
  });
}

function displayImages(images) {
  elements.gallery.innerHTML = "";

  images.forEach((image, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = image.urls.small;
    imgElement.alt = image.alt_description || "Image";
    imgElement.dataset.index = index;
    imgElement.classList.add("gallery-item");
    elements.gallery.appendChild(imgElement);
  });

  preloadImages(); // Предзагрузка полноразмерных изображений
}

// Делегирование событий: обработка кликов по изображениям галереи
elements.gallery.addEventListener("click", (event) => {
  const imgElement = event.target;
  if (imgElement.tagName === "IMG") {
    openModal(parseInt(imgElement.dataset.index, 10));
  }
});

// Запрос изображений по поисковому запросу
elements.searchButton.addEventListener("click", () => {
  const query = elements.searchInput.value.trim();
  if (query) {
    fetchImages(query);
  }
});

elements.searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const query = elements.searchInput.value.trim();
    if (query) {
      fetchImages(query);
    }
  }
});

// Открытие модального окна
function openModal(index) {
  currentIndex = index;
  updateModalImage();
  elements.modal.classList.add("open");
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function closeModalWindow() {
  elements.modal.classList.remove("open");
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "auto";
}

// Закрытие модального окна
elements.closeModal.addEventListener("click", closeModalWindow);
elements.modal.addEventListener("click", (e) => {
  if (e.target === elements.modal) closeModalWindow();
});

function updateModalImage() {
  if (imageCache[currentIndex]) {
    elements.modalImg.src = imageCache[currentIndex].src;
  } else {
    const img = new Image();
    img.src = images[currentIndex].urls.regular;
    img.onload = () => {
      imageCache[currentIndex] = img;
      elements.modalImg.src = img.src;
    };
  }
}

// Пролистывание карусели
elements.prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateModalImage();
});
elements.nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % images.length;
  updateModalImage();
});

// Обработка стрелок клавиатуры
document.addEventListener("keydown", (e) => {
  if (elements.modal.classList.contains("open")) {
    if (e.key === "ArrowLeft") elements.prevBtn.click();
    if (e.key === "ArrowRight") elements.nextBtn.click();
    if (e.key === "Escape") closeModalWindow();
  }
});

loadCommonComponents();
fetchImages();
