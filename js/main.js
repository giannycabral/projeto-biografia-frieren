// Configurações e Constantes
const CONFIG = {
  SCROLL_OFFSET: 100,
  ANIMATION_DURATION: 5000,
  MODAL_DELAY: 10,
  LAZY_LOAD_OFFSET: "50px",
  IMAGE_PLACEHOLDER: "./images/placeholder.jpg",
  ERROR_DISPLAY_TIME: 3000,
  FADE_DURATION: 300,
  ANIMATION_DELAY: 50,
};

// Player de Música
const musicPlayer = {
  audioFiles: {
    "summer-crush": "./audio/summer-crush.mp3",
    "theme-principal": "./audio/theme-principal.mp3",
    "battle-theme": "./audio/battle-theme.mp3",
  },
  // Inicializa o player de música
  init() {
    this.audio = document.getElementById("bgMusic");
    this.selector = document.getElementById("musicSelector");
    this.toggleButton = document.getElementById("toggleMusic");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.isLoading = false;
    this.currentTrack = null;

    if (
      !this.audio ||
      !this.selector ||
      !this.toggleButton ||
      !this.volumeSlider
    ) {
      console.error("Elementos do player não encontrados");
      return;
    }

    // Event Listeners
    this.setupEventListeners();
    this.updateVolume();
  },

  // Adiciona os eventos necessários para o player de música
  setupEventListeners() {
    this.selector.addEventListener("change", async () => {
      await this.changeMusic();
    });

    this.toggleButton.addEventListener("click", async () => {
      await this.togglePlay();
    });

    this.volumeSlider.addEventListener("input", () => {
      this.updateVolume();
    });

    // Listener para erros de áudio
    this.audio.addEventListener("error", (e) => {
      this.handleError(e);
    });
  },

  // Altera a música selecionada
  async changeMusic() {
    if (this.isLoading) return;

    const selectedValue = this.selector.value;
    if (!selectedValue) return;

    try {
      this.isLoading = true;

      // Pausar áudio atual se estiver tocando
      if (!this.audio.paused) {
        this.audio.pause();
      }

      const audioPath = this.audioFiles[selectedValue];
      if (!audioPath) {
        throw new Error("Caminho do áudio não encontrado");
      }

      // Verificar se o arquivo existe
      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`Arquivo de áudio não encontrado: ${audioPath}`);
      }

      this.audio.src = audioPath;
      this.currentTrack = selectedValue;

      await this.audio.load();

      if (this.toggleButton.classList.contains("playing")) {
        await this.play();
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  },

  // Alterna entre tocar e pausar a música
  async togglePlay() {
    if (this.isLoading) return;

    try {
      if (!this.audio.src && this.selector.value) {
        await this.changeMusic();
      }

      if (this.audio.paused) {
        await this.play();
      } else {
        this.pause();
      }
    } catch (error) {
      this.handleError(error);
    }
  },
  // Toca a música
  async play() {
    try {
      await this.audio.play();
      this.toggleButton.textContent = "⏸️";
      this.toggleButton.classList.add("playing");
    } catch (error) {
      this.handleError(error);
    }
  },
  // Pausa a música
  pause() {
    this.audio.pause();
    this.toggleButton.textContent = "▶️";
    this.toggleButton.classList.remove("playing");
  },
  // Atualiza o volume do áudio
  updateVolume() {
    if (!this.audio || !this.volumeSlider) return;
    this.audio.volume = this.volumeSlider.value / 100;
  },
  // Verifica se o arquivo de áudio existe e lida com erros
  handleError(error) {
    console.error("Erro no áudio:", error);

    // Reset do player
    this.isLoading = false;
    if (this.toggleButton) {
      this.toggleButton.textContent = "▶️";
      this.toggleButton.classList.remove("playing");
    }

    // Mostrar mensagem de erro
    const playerElement = document.querySelector(".music-player");
    if (!playerElement) return;

    const oldError = playerElement.querySelector(".error-message");
    if (oldError) oldError.remove();

    const errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    errorMsg.textContent =
      "Erro ao carregar áudio. Verifique se o arquivo existe.";
    playerElement.appendChild(errorMsg);

    // Remover mensagem após 3 segundos
    setTimeout(() => {
      if (errorMsg.parentNode) {
        errorMsg.remove();
      }
    }, 3000);
  },
};

//Efeitos de Scroll
// Função para adicionar efeitos de scroll
function initializeScrollEffects() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll(".gallery-item, .video-item, .footer-section")
    .forEach((el) => observer.observe(el));
}

// Gerenciamento de Galeria
const galleryManager = {
  init() {
    this.createGallery();
    this.setupBioImageGallery();
  },

  createGallery() {
    const galleryItems = [
      {
        img: "./images/frieren-1.jpeg",
        caption: "Frieren",
      },
      {
        img: "./images/frieren-2.jpeg",
        caption: "Momento de Reflexão",
      },
      {
        img: "./images/frieren-3.jpeg",
        caption: "Frieren olhando para o horizonte",
      },
      {
        img: "./images/frieren-4.jpeg",
        caption: "Frieren",
      },
      { img: "./images/frieren-5.jpeg", caption: "Frieren comendo um lanche" },
      {
        img: "./images/frieren-6.jpg",
        caption: "Frieren Pesquisando sobre o passado",
      },
      {
        img: "./images/frieren-7.jpeg",
        caption: "Frieren olhando para o céu",
      },
      { img: "./images/frieren-8.jpeg", caption: "Frieren com seu grimoório" },
    ];

    const galleryGrid = document.querySelector(".gallery-grid");
    if (!galleryGrid) return;

    this.renderGalleryItems(galleryGrid, galleryItems);
    this.setupModal(galleryItems);
  },
  // Adiciona a galeria de imagens da biografia
  setupBioImageGallery() {
    const mainImage = document.querySelector(".bio-image .main-image");
    const thumbnails = document.querySelectorAll(".bio-small-images img");

    if (!mainImage || thumbnails.length === 0) return;

    thumbnails[0].classList.add("active-thumb");
    this.setupThumbnailEvents(mainImage, thumbnails);
  },
  // Adiciona os itens da galeria
  renderGalleryItems(grid, items) {
    items.forEach((item, index) => {
      const galleryItem = document.createElement("div");
      galleryItem.className = "gallery-item";
      galleryItem.innerHTML = `
        <img src="${item.img}" alt="${item.caption}" loading="lazy">
        <div class="caption"><h3>${item.caption}</h3></div>
      `;

      const img = galleryItem.querySelector("img");
      img.onerror = () => (img.src = "./images/placeholder.jpg");

      galleryItem.addEventListener("click", () => {
        this.showModal(index, items);
      });

      grid.appendChild(galleryItem);
    });
  },
  // Adiciona o modal para exibir imagens ampliadas
  setupModal(items) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <img src="" alt="Imagem ampliada">
        <div class="modal-controls">
          <button class="modal-btn prev-btn">❮ Anterior</button>
          <button class="modal-btn next-btn">Próxima ❯</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupModalControls(modal, items);
  },

  setupModalControls(modal, items) {
    let currentIndex = 0;
    const closeBtn = modal.querySelector(".close-modal");
    const prevBtn = modal.querySelector(".prev-btn");
    const nextBtn = modal.querySelector(".next-btn");

    closeBtn.onclick = () => modal.classList.remove("active");
    prevBtn.onclick = () => this.showImage(--currentIndex, items, modal);
    nextBtn.onclick = () => this.showImage(++currentIndex, items, modal);
  },

  showModal(index, items) {
    const modal = document.querySelector(".modal");
    this.showImage(index, items, modal);
    modal.classList.add("active");
  },

  showImage(index, items, modal) {
    const img = modal.querySelector("img");
    img.src = items[index].img;
    img.alt = items[index].caption;

    modal.querySelector(".prev-btn").disabled = index === 0;
    modal.querySelector(".next-btn").disabled = index === items.length - 1;
  },
  // Adiciona eventos de clique para as miniaturas
  setupThumbnailEvents(mainImage, thumbnails) {
    thumbnails.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbnails.forEach((t) => t.classList.remove("active-thumb"));
        thumb.classList.add("active-thumb");
        mainImage.src = thumb.src;
        mainImage.alt = thumb.alt;
      });
    });
  },
};

// Gerenciamento de Vídeos
const videoManager = {
  init() {
    const videoItems = [
      {
        // Vídeo 1
        videoId: "eXjbk-4ljgc",
        title: "Frieren Trailer Oficial",
      },

      // Vídeo 2
      {
        videoId: "quedt2IB9_Q",
        title: "Frieren vs Frieren | Frieren: Beyond Journey's End",
      },

      // Vídeo 3
      {
        videoId: "QkeXQ8D2-4s",
        title: "Blood Magic Attack! | Frieren: Beyond Journey's End",
      },

      // Vídeo 4
      {
        videoId: "29WO647bTNw",
        title: "Frieren and Fern Tag Team | Frieren: Beyond Journey's End",
      },

      // Vídeo 5
      {
        videoId: "zlmsqVWPf98",
        title:
          "How Many Triangles are in This Picture? | Frieren: Beyond Journey's End",
      },

      // Vídeo 6
      {
        videoId: "QoGM9hCxr4k",
        title:
          "『葬送のフリーレン』ノンクレジットOP(第1クール)／OPテーマ：YOASOBI「勇者」",
      },
    ];

    this.renderVideos(videoItems);
  },

  renderVideos(videoItems) {
    const container = document.querySelector(".video-container");
    if (!container) return;

    // Limpar container antes de adicionar novos vídeos
    container.innerHTML = "";

    videoItems.forEach((video) => {
      const videoItem = this.createVideoElement(video);
      container.appendChild(videoItem);
    });
  },

  createVideoElement(video) {
    const videoItem = document.createElement("div");
    videoItem.className = "video-item";

    // Construir URL simplificada
    const embedUrl = `https://www.youtube.com/embed/${video.videoId}`;

    videoItem.innerHTML = `
      <div class="video-wrapper">
        <iframe width="560" height="315" 
          src="${embedUrl}" 
          title="${video.title}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
        <div class="video-fallback" style="display: none;">
          <p>Vídeo indisponível</p>
          <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noopener">
            Assistir no YouTube
          </a>
        </div>
      </div>
      <h3>${video.title}</h3>
    `;

    return videoItem;
  },
};

// Configuração dos backgrounds
const heroBackgrounds = {
  backgrounds: [
    "./images/frieren-bg.jpg",
    "./images/frieren-bg01.jpg",
    "./images/frieren-bg02.jpg",
    "./images/frieren-bg03.jpg",
    "./images/frieren-bg04.jpg",
    "./images/frieren-bg05.jpg",
    "./images/frieren-bg06.jpg",
    "./images/frieren-bg07.jpg",
    "./images/frieren-bg08.jpg",
    "./images/frieren-bg09.jpg",
    "./images/frieren-bg10.jpg",
  ],
  currentIndex: 0,
  transitionTime: 5000, // 5 segundos entre cada transição

  init() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    // Criar divs de background
    this.backgrounds.forEach((bg, index) => {
      const bgDiv = document.createElement("div");
      bgDiv.className = "hero-background";
      bgDiv.style.backgroundImage = `url(${bg})`;
      if (index === 0) bgDiv.classList.add("active");
      hero.insertBefore(bgDiv, hero.firstChild);
    });

    // Iniciar transição
    this.startTransition();
  },

  startTransition() {
    const bgElements = document.querySelectorAll(".hero-background");
    if (!bgElements.length) return;

    setInterval(() => {
      // Remover classe active do atual
      bgElements[this.currentIndex].classList.remove("active");

      // Atualizar índice
      this.currentIndex = (this.currentIndex + 1) % bgElements.length;

      // Adicionar classe active ao próximo
      bgElements[this.currentIndex].classList.add("active");
    }, this.transitionTime);
  },
};

// Inicialização de UI
function initializeUI() {
  initializeMobileMenu();
  initializeScrollBehavior();
  initializeAnimations();
}

// Função para inicializar o menu móvel
function initializeMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    hamburger.innerHTML = navLinks.classList.contains("show") ? "✕" : "☰";
  });

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".nav-links") &&
      !e.target.closest(".hamburger") &&
      navLinks.classList.contains("show")
    ) {
      navLinks.classList.remove("show");
      hamburger.innerHTML = "☰";
    }
  });
}

// Função para inicializar o comportamento de scroll
function initializeScrollBehavior() {
  const header = document.querySelector(".navbar");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    header.classList.toggle(
      "navbar-hidden",
      currentScroll > lastScroll && currentScroll > CONFIG.SCROLL_OFFSET
    );
    lastScroll = currentScroll;
  });
}

// Função para inicializar animações
function initializeAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll(".animate-on-scroll")
    .forEach((el) => observer.observe(el));
}

// Adicionar gerenciamento de erros global
window.addEventListener("error", function (e) {
  console.error("Erro global:", e.error);
  showErrorMessage("Ocorreu um erro. Por favor, recarregue a página.");
});

// Adicionar loading state
function showLoading() {
  const loader = document.createElement("div");
  loader.className = "loading-spinner";
  document.body.appendChild(loader);
  return loader;
}

// Sistema de Magia
const magicSystem = {
  init() {
    this.setupCategories();
    this.setupSpellEffects();
  },

  setupCategories() {
    const categoryButtons = document.querySelectorAll(".category-btn");
    const spellsCategories = document.querySelectorAll(".spells-category");

    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        // Add active class to clicked button
        button.classList.add("active");

        // Hide all spell categories
        spellsCategories.forEach((category) => {
          category.classList.remove("active");
          category.style.display = "none";
        });

        // Show selected category
        const selectedCategory = button.dataset.category;
        const targetCategory = document.querySelector(
          `.spells-category[data-category="${selectedCategory}"]`
        );
        if (targetCategory) {
          targetCategory.classList.add("active");
          targetCategory.style.display = "grid";
          this.animateSpells(targetCategory);
        }
      });
    });
  },
  // Adiciona efeitos de feitiço
  setupSpellEffects() {
    const spellItems = document.querySelectorAll(".spell-item");

    spellItems.forEach((spell) => {
      spell.addEventListener("click", () => {
        this.activateSpellEffect(spell);
      });

      // Adicionar efeito hover
      spell.addEventListener("mouseenter", () => {
        this.addSpellGlow(spell);
      });

      spell.addEventListener("mouseleave", () => {
        this.removeSpellGlow(spell);
      });
    });
  },

  activateSpellEffect(spellElement) {
    // Adiciona classe de animação
    spellElement.classList.add("spell-activated");

    // Cria efeito de partículas
    this.createSpellParticles(spellElement);

    // Remove a classe após a animação
    setTimeout(() => {
      spellElement.classList.remove("spell-activated");
    }, 1000);
  },

  addSpellGlow(spellElement) {
    const icon = spellElement.querySelector(".spell-icon");
    icon.style.transform = "scale(1.2)";
    icon.style.filter = "drop-shadow(0 0 10px var(--accent-color))";
  },

  removeSpellGlow(spellElement) {
    const icon = spellElement.querySelector(".spell-icon");
    icon.style.transform = "";
    icon.style.filter = "";
  },
  // Cria partículas de feitiço
  createSpellParticles(spellElement) {
    const particlesCount = 20;
    const colors = ["#8265A7", "#44318D", "#E0D5F5"];

    for (let i = 0; i < particlesCount; i++) {
      const particle = document.createElement("div");
      particle.className = "spell-particle";
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      const rect = spellElement.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;

      particle.style.left = startX + "px";
      particle.style.top = startY + "px";

      document.body.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 4;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;

      particle.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          {
            transform: `translate(${dx * 50}px, ${dy * 50}px) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 1000,
          easing: "ease-out",
        }
      ).onfinish = () => particle.remove();
    }
  },
  // Adiciona animação de entrada para os feitiços
  animateSpells(category) {
    const spells = category.querySelectorAll(".spell-item");
    spells.forEach((spell, index) => {
      spell.style.opacity = "0";
      spell.style.transform = "translateY(20px)";

      setTimeout(() => {
        spell.style.transition = "all 0.5s ease";
        spell.style.opacity = "1";
        spell.style.transform = "translateY(0)";
      }, index * 100);
    });
  },
};

// Função para criar partículas na galeria
function createGalleryParticles() {
  const gallery = document.querySelector("#galeria");
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "gallery-particles";

  // Criar 20 partículas
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "gallery-particle";

    // Posição aleatória
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";

    // Atraso de animação aleatório
    particle.style.animationDelay = Math.random() * 15 + "s";

    particlesContainer.appendChild(particle);
  }

  gallery.appendChild(particlesContainer);
}

// Função para controlar o botão Voltar ao Topo
function initBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");

  if (!backToTopButton) {
    console.error('Botão "Voltar ao Topo" não encontrado no DOM');
    return;
  }

  // Verificar a posição do scroll imediatamente
  checkScrollPosition();

  // Adicionar evento de scroll diretamente (sem setTimeout)
  window.addEventListener("scroll", checkScrollPosition);

  function checkScrollPosition() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    console.log(
      `Scroll position: ${scrollY}, threshold: ${CONFIG.SCROLL_OFFSET}`
    );

    if (scrollY > CONFIG.SCROLL_OFFSET) {
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }
  }

  // Evento de clique para voltar ao topo
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// Garantir que a função é chamada após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar componentes
  musicPlayer.init();
  initializeScrollEffects();
  galleryManager.init();
  videoManager.init();
  heroBackgrounds.init();
  magicSystem.init();
  createGalleryParticles();

  // Inicializar componentes UI
  initializeUI();
  initBackToTop();
});
