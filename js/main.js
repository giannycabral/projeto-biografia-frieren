// Configurações e Constantes
const CONFIG = {
  SCROLL_OFFSET: 100,
  ANIMATION_DURATION: 5000,
  MODAL_DELAY: 10,
  LAZY_LOAD_OFFSET: "50px",
  IMAGE_PLACEHOLDER: "./images/placeholder.jpg",
  ERROR_DISPLAY_TIME: 3000,
  AUDIO_PATH: "./audio/",
  FADE_DURATION: 300,
  ANIMATION_DELAY: 50,
};

// Inicializar componentes quando o documento estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Inicializar o player de música
    musicPlayer.init();
    initializeScrollEffects();
    galleryManager.init();
    videoManager.init();
    heroBackgrounds.init();
    magicSystem.init();
    createGalleryParticles();

    // Verificar arquivos de áudio (para depuração)
    musicPlayer.checkAudioFiles();

    // Inicializar outros componentes aqui
    initializeUI();
    initBackToTop();
  } catch (error) {
    console.error("Erro ao inicializar a aplicação:", error);
  }
});

// Player de Música
const musicPlayer = {
  audioFiles: {
    "summer-crush": CONFIG.AUDIO_PATH + "summer-crush.mp3",
    "theme-principal": CONFIG.AUDIO_PATH + "theme-principal.mp3",
    "battle-theme": CONFIG.AUDIO_PATH + "battle-theme.mp3",
  },

  isInitialized: false,

  init() {
    console.log("Inicializando player de música...");

    // Obter elementos do DOM
    this.audio = document.getElementById("bgMusic");
    this.selector = document.getElementById("musicSelector");
    this.toggleButton = document.getElementById("toggleMusic");
    this.volumeSlider = document.getElementById("volumeSlider");

    // Verificar se todos os elementos necessários existem
    if (
      !this.audio ||
      !this.selector ||
      !this.toggleButton ||
      !this.volumeSlider
    ) {
      console.error("Elementos do player de música não encontrados");
      return;
    }

    // Configurar event listeners
    this.setupEventListeners();

    // Definir volume inicial
    this.updateVolume();

    // Marcar como inicializado
    this.isInitialized = true;

    console.log("Player de música inicializado com sucesso");
  },

  setupEventListeners() {
    // Mudar música quando o seletor for alterado
    this.selector.addEventListener("change", () => {
      console.log("Seleção de música alterada:", this.selector.value);
      this.changeMusic();
    });

    // Toggle play/pause quando o botão for clicado
    this.toggleButton.addEventListener("click", () => {
      console.log("Botão de play/pause clicado");
      this.togglePlay();
    });

    // Atualizar volume quando o slider for alterado
    this.volumeSlider.addEventListener("input", () => {
      this.updateVolume();
    });

    // Lidar com erros de áudio
    this.audio.addEventListener("error", (e) => {
      console.error("Erro no elemento de áudio:", e);
      this.handleAudioError();
    });

    // Atualizar UI quando a música terminar
    this.audio.addEventListener("ended", () => {
      this.toggleButton.textContent = "▶️";
      this.toggleButton.classList.remove("playing");
    });
  },

  changeMusic() {
    if (!this.isInitialized) {
      console.error("Player não inicializado");
      return;
    }

    const selectedValue = this.selector.value;
    if (!selectedValue) {
      console.log("Nenhuma música selecionada");
      return;
    }

    // Caminho do arquivo de áudio
    const audioPath = this.audioFiles[selectedValue];
    if (!audioPath) {
      console.error("Caminho do áudio não encontrado para:", selectedValue);
      this.showError("Arquivo de áudio não encontrado");
      return;
    }

    console.log("Carregando áudio:", audioPath);

    // Pausar qualquer reprodução atual
    if (!this.audio.paused) {
      this.audio.pause();
    }

    // Configurar o src diretamente - mais confiável que innerHTML para áudio
    this.audio.src = audioPath;

    // Carregar o áudio
    this.audio.load();

    // Log para verificar o status do áudio
    console.log("Áudio carregado:", {
      src: this.audio.src,
      readyState: this.audio.readyState,
      networkState: this.audio.networkState,
    });

    // Se o botão estiver no estado "playing", tocar a música automaticamente
    if (this.toggleButton.classList.contains("playing")) {
      this.play();
    }
  },

  togglePlay() {
    if (!this.isInitialized) {
      console.error("Player não inicializado");
      return;
    }

    console.log("Toggle play/pause");

    // Se não houver música selecionada, escolher uma
    if (!this.audio.src && this.selector.value) {
      console.log("Nenhum src definido, carregando música selecionada");
      this.changeMusic();
      return;
    } else if (!this.audio.src) {
      console.log("Nenhuma música selecionada");
      this.showError("Selecione uma música primeiro");
      return;
    }

    // Alternar entre play e pause
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  },

  play() {
    console.log("Tentando reproduzir áudio:", this.audio.src);

    // Verificar se há um arquivo de áudio para reproduzir
    if (!this.audio.src) {
      console.error("Nenhum src definido para reprodução");
      this.showError("Selecione uma música primeiro");
      return;
    }

    // Armazenar a promise retornada por play()
    this.playPromise = this.audio.play();

    if (this.playPromise !== undefined) {
      this.playPromise
        .then(() => {
          console.log("Áudio reproduzindo com sucesso");
          this.toggleButton.textContent = "⏸️";
          this.toggleButton.classList.add("playing");
        })
        .catch((error) => {
          console.error("Erro ao reproduzir áudio:", error);
          this.toggleButton.textContent = "▶️";
          this.toggleButton.classList.remove("playing");

          // Tratar diferentes tipos de erro
          if (error.name === "NotSupportedError") {
            this.showError("Formato de áudio não suportado pelo seu navegador");
          } else if (error.name === "NotAllowedError") {
            this.showError(
              "Reprodução automática bloqueada pelo navegador. Clique novamente."
            );
          } else {
            this.showError(
              "Não foi possível reproduzir o áudio. Clique novamente."
            );
          }
        });
    }
  },

  pause() {
    console.log("Pausando áudio");

    if (this.playPromise !== undefined) {
      this.playPromise
        .then(() => {
          this.audio.pause();
          this.toggleButton.textContent = "▶️";
          this.toggleButton.classList.remove("playing");
        })
        .catch((error) => {
          console.error("Erro ao pausar áudio:", error);
        });
    } else {
      this.audio.pause();
      this.toggleButton.textContent = "▶️";
      this.toggleButton.classList.remove("playing");
    }
  },

  updateVolume() {
    if (!this.isInitialized) return;

    const volume = this.volumeSlider.value / 100;
    this.audio.volume = volume;
    console.log("Volume atualizado:", volume);
  },

  handleAudioError() {
    if (!this.audio) return;

    const error = this.audio.error;
    let message = "Erro ao carregar o áudio";

    if (error) {
      // Tratar códigos de erro específicos
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = "A reprodução foi abortada";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = "Erro de rede ao carregar o áudio";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message = "Erro ao decodificar o áudio";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = "Formato de áudio não suportado";
          break;
      }
    }

    console.error("Erro de áudio:", message, error);
    this.showError(message);
    this.toggleButton.textContent = "▶️";
    this.toggleButton.classList.remove("playing");
  },

  showError(message) {
    const playerElement = document.querySelector(".music-player");
    if (!playerElement) return;

    console.error("Erro no player:", message);

    // Remover mensagens de erro anteriores
    const oldError = playerElement.querySelector(".error-message");
    if (oldError) oldError.remove();

    // Criar mensagem de erro
    const errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    errorMsg.textContent = message;
    playerElement.appendChild(errorMsg);

    // Remover após 3 segundos
    setTimeout(() => {
      if (errorMsg.parentNode) {
        errorMsg.remove();
      }
    }, CONFIG.ERROR_DISPLAY_TIME);
  },

  // Método para teste manual - verificar se os arquivos existem
  checkAudioFiles() {
    console.log("Verificando arquivos de áudio...");

    Object.entries(this.audioFiles).forEach(([key, path]) => {
      fetch(path, { method: "HEAD" })
        .then((response) => {
          if (!response.ok) {
            console.error(`Arquivo não encontrado: ${path}`);
          } else {
            console.log(`Arquivo OK: ${path}`);
          }
        })
        .catch((error) => {
          console.error(`Erro ao verificar ${path}:`, error);
        });
    });
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
} // Adicionar função para pulsar itens ao rolar a tela
function initializeScrollEffects() {
  // Criar um observador de interseção
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // Adicionar efeito de pulso temporário
          if (entry.target.classList.contains("gallery-item")) {
            entry.target.style.animation = "pulse 1s ease-out";
            setTimeout(() => {
              entry.target.style.animation = "";
            }, 1000);
          }
        }
      });
    },
    { threshold: 0.2 }
  );

  // Observar elementos de galeria, vídeo e seção de footer
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

// Inicializar a UI principal
function initializeUI() {
  // Menu mobile
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      menuToggle.textContent = navLinks.classList.contains("show") ? "✕" : "☰";
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");
        menuToggle.textContent = "☰";
      });
    });
  }

  // Inicializar efeitos de scroll
  initializeScrollEffects();

  // Inicializar galeria
  if (document.querySelector(".gallery-grid")) {
    createGalleryParticles();
  }
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

// Tratar erros globais
function handleGlobalError(error) {
  console.error("Erro global:", error);

  // Mostrar mensagem de erro na interface
  const errorContainer = document.createElement("div");
  errorContainer.className = "error-message global-error";
  errorContainer.style.position = "fixed";
  errorContainer.style.top = "10px";
  errorContainer.style.left = "50%";
  errorContainer.style.transform = "translateX(-50%)";
  errorContainer.style.backgroundColor = "rgba(255, 68, 68, 0.9)";
  errorContainer.style.color = "white";
  errorContainer.style.padding = "10px 20px";
  errorContainer.style.borderRadius = "5px";
  errorContainer.style.zIndex = "9999";
  errorContainer.textContent = error.message || "Ocorreu um erro na aplicação.";

  document.body.appendChild(errorContainer);

  // Remover mensagem após 5 segundos
  setTimeout(() => {
    if (errorContainer.parentNode) {
      errorContainer.remove();
    }
  }, 5000);
}

// Event listener para erros não tratados
window.addEventListener("error", function (event) {
  handleGlobalError(event.error || new Error("Erro na aplicação"));
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
  const gallery = document.getElementById("galeria");
  if (!gallery) return;

  // Criar o contêiner de partículas
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "gallery-particles";
  gallery.prepend(particlesContainer);

  // Quantidade de partículas
  const particleCount = 20;

  // Criar partículas
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "gallery-particle";

    // Definir tamanho aleatório
    const size = Math.random() * 6 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Posição aleatória
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    // Propriedades de animação aleatórias
    const duration = Math.random() * 15 + 5;
    const delay = Math.random() * 5;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    // Cor aleatória
    const colors = ["#8265a7", "#44318d", "#a98eda", "#e4d3ff"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.backgroundColor = color;

    // Opacidade inicial aleatória
    particle.style.opacity = Math.random() * 0.5 + 0.1;

    // Adicionar partícula ao contêiner
    particlesContainer.appendChild(particle);
  }

  console.log("Partículas da galeria criadas com sucesso");
}

// Inicializar o botão de voltar ao topo
function initBackToTop() {
  const backToTopBtn = document.querySelector(".back-to-top");
  if (!backToTopBtn) return;

  // Mostrar/ocultar botão baseado na posição de rolagem
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  // Adicionar funcionalidade de rolagem suave
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
