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
    initFloatingMusicPlayer();

    // Verificar arquivos de áudio (para depuração)
    musicPlayer.checkAudioFiles();

    // Inicializar outros componentes aqui
    initializeUI();
    initBackToTop();

    // Para adaptar o musicPlayer existente, garanta que a função init() seja chamada:
    if (typeof musicPlayer !== "undefined" && musicPlayer.init) {
      musicPlayer.init();
    }
  } catch (error) {
    console.error("Erro ao inicializar a aplicação:", error);
  }
});

// Otimização do musicPlayer para carregamento mais rápido

const musicPlayer = {
  // Definição dos arquivos de áudio
  audioFiles: {
    "summer-crush": CONFIG.AUDIO_PATH + "summer-crush.mp3",
    "theme-principal": CONFIG.AUDIO_PATH + "theme-principal.mp3",
    "battle-theme": CONFIG.AUDIO_PATH + "battle-theme.mp3",
  },

  // Objetos de som
  sounds: {},

  // Música atual
  currentSound: null,
  currentAudio: null,

  isInitialized: false,

  init() {
    console.log("Inicializando player de música com Howler.js...");

    // Obter elementos do DOM
    this.selector = document.getElementById("musicSelector");
    this.toggleButton = document.getElementById("toggleMusic");
    this.volumeSlider = document.getElementById("volumeSlider");

    // Verificar se todos os elementos necessários existem
    if (!this.selector || !this.toggleButton || !this.volumeSlider) {
      console.error("Elementos do player de música não encontrados");
      return;
    }

    // Pré-carregar sons
    this.preloadSounds();

    // Configurar event listeners
    this.setupEventListeners();

    // Definir volume inicial
    this.updateVolume();

    // Marcar como inicializado
    this.isInitialized = true;

    console.log("Player de música inicializado com sucesso");
  },

  // Pré-carrega os sons usando Howler.js
  preloadSounds() {
    for (const [key, path] of Object.entries(this.audioFiles)) {
      this.sounds[key] = new Howl({
        src: [path],
        html5: true, // Para melhor compatibilidade em dispositivos móveis
        preload: false, // Carregar apenas quando necessário
        volume: this.volumeSlider ? this.volumeSlider.value / 100 : 0.5,
        onload: () => console.log(`✓ Som carregado: ${key}`),
        onloaderror: (id, error) => this.handleLoadError(key, error),
        onplayerror: (id, error) => this.handlePlayError(key, error),
      });

      // Começar a carregar o áudio
      this.sounds[key].load();

      console.log(`Inicializando carregamento para: ${key}`);
    }
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

    console.log("Carregando música:", selectedValue);

    // Pausar qualquer som atual
    if (this.currentSound) {
      this.currentSound.stop();
    }

    // Atualizar o som atual
    this.currentAudio = selectedValue;
    this.currentSound = this.sounds[selectedValue];

    // Garantir que o som está carregado
    if (
      !this.currentSound.state() ||
      this.currentSound.state() === "unloaded"
    ) {
      this.showLoader(true);
      this.currentSound.load();
    }

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

    // Se não houver música selecionada, escolher uma
    if (!this.currentSound && this.selector.value) {
      console.log("Nenhum som ativo, carregando música selecionada");
      this.changeMusic();
      return;
    } else if (!this.currentSound) {
      console.log("Nenhuma música selecionada");
      this.showError("Selecione uma música primeiro");
      return;
    }

    // Alternar entre play e pause
    if (!this.currentSound.playing()) {
      this.play();
    } else {
      this.pause();
    }
  },

  play() {
    console.log("Tentando reproduzir áudio");

    // Atualizar UI imediatamente para feedback visual rápido
    this.toggleButton.textContent = "⏸️";
    this.toggleButton.classList.add("playing");

    // Se o som ainda estiver carregando, mostrar loader
    if (!this.currentSound.state() || this.currentSound.state() === "loading") {
      this.toggleButton.textContent = "⌛";

      // Tocar quando terminar de carregar
      this.currentSound.once("load", () => {
        this.currentSound.play();
        this.toggleButton.textContent = "⏸️";
        this.showLoader(false);
      });

      // Começar a carregar se ainda não estiver
      if (this.currentSound.state() !== "loading") {
        this.showLoader(true);
        this.currentSound.load();
      }

      return;
    }

    // Se já estiver carregado, tocar imediatamente
    this.currentSound.play();
  },

  pause() {
    console.log("Pausando áudio");

    // Atualizar UI imediatamente para feedback visual rápido
    this.toggleButton.textContent = "▶️";
    this.toggleButton.classList.remove("playing");

    if (this.currentSound && this.currentSound.playing()) {
      this.currentSound.pause();
    }
  },

  updateVolume() {
    if (!this.isInitialized) return;

    const volume = this.volumeSlider.value / 100;
    console.log("Volume atualizado:", volume);

    // Atualizar volume de todos os sons
    for (const sound of Object.values(this.sounds)) {
      sound.volume(volume);
    }
  },

  handleLoadError(key, error) {
    console.error(`Erro ao carregar áudio ${key}:`, error);
    this.showError(`Erro ao carregar a música: ${key}`);
    this.showLoader(false);
    this.toggleButton.textContent = "▶️";
    this.toggleButton.classList.remove("playing");
  },

  handlePlayError(key, error) {
    console.error(`Erro ao reproduzir áudio ${key}:`, error);
    this.showError(
      "Não foi possível reproduzir o áudio. Tente clicar novamente."
    );
    this.showLoader(false);
    this.toggleButton.textContent = "▶️";
    this.toggleButton.classList.remove("playing");

    // Tentar recarregar o áudio
    this.sounds[key].unload();
    this.sounds[key].load();
  },

  showLoader(show) {
    if (show) {
      this.toggleButton.classList.add("loading");
      this.toggleButton.textContent = "⌛";
    } else {
      this.toggleButton.classList.remove("loading");
      if (this.toggleButton.classList.contains("playing")) {
        this.toggleButton.textContent = "⏸️";
      } else {
        this.toggleButton.textContent = "▶️";
      }
    }
  },

  showError(message) {
    const playerElement = document.querySelector(".floating-music-player");
    if (!playerElement) return;

    // Remover mensagens de erro anteriores
    const oldError = playerElement.querySelector(".error-message");
    if (oldError) oldError.remove();

    // Criar mensagem de erro
    const errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    errorMsg.textContent = message;

    // Inserir no topo para melhor visibilidade no player flutuante
    playerElement.insertBefore(errorMsg, playerElement.firstChild);

    // Remover após 3 segundos
    setTimeout(() => {
      if (errorMsg.parentNode) {
        errorMsg.remove();
      }
    }, CONFIG.ERROR_DISPLAY_TIME);
  },

  // Método para verificação básica dos arquivos
  checkAudioFiles() {
    console.log("Verificando arquivos de áudio...");
    Object.entries(this.audioFiles).forEach(([name, path]) => {
      fetch(path, { method: "HEAD" })
        .then((response) => {
          console.log(`${name}: ${response.ok ? "✓" : "✗"}`);
        })
        .catch((error) => {
          console.error(`Erro ao verificar ${name}:`, error);
        });
    });
  },

  // Detecta o melhor formato de áudio suportado pelo navegador
  detectBestSupportedFormat() {
    const audio = document.createElement("audio");

    // Verificar os formatos em ordem de preferência
    const formats = [
      { ext: "mp3", mime: "audio/mpeg" },
      { ext: "ogg", mime: 'audio/ogg; codecs="vorbis"' },
      { ext: "wav", mime: "audio/wav" },
    ];

    for (const format of formats) {
      const canPlay = audio.canPlayType(format.mime);
      console.log(`Suporte para ${format.ext}: ${canPlay}`);

      if (canPlay === "probably" || canPlay === "maybe") {
        return format.ext;
      }
    }

    // Fallback para mp3 se nenhum formato for explicitamente suportado
    return "mp3";
  },

  checkAudioFilesExistence() {
    console.log("Verificando a existência dos arquivos de áudio...");

    for (const [name, formats] of Object.entries(this.audioFiles)) {
      for (const [format, path] of Object.entries(formats)) {
        fetch(path, { method: "HEAD" })
          .then((response) => {
            if (!response.ok) {
              console.error(
                `❌ Arquivo ${name}.${format} não encontrado (${path}): ${response.status}`
              );
            } else {
              console.log(`✅ Arquivo ${name}.${format} encontrado (${path})`);
            }
          })
          .catch((error) => {
            console.error(
              `❌ Erro ao verificar ${name}.${format} (${path}):`,
              error
            );
          });
      }
    }
  },
};

// Atualização para o initFloatingMusicPlayer
function initFloatingMusicPlayer() {
  const floatingPlayer = document.querySelector(".floating-music-player");
  const expandBtn = document.getElementById("expandMusicPlayer");
  const collapseBtn = document.getElementById("collapseMusicPlayer");

  if (!floatingPlayer || !expandBtn || !collapseBtn) return;

  // Expandir o player
  expandBtn.addEventListener("click", () => {
    floatingPlayer.classList.add("expanded");

    // Iniciar carregamento completo dos audios quando o player é expandido
    if (musicPlayer.isInitialized) {
      Object.values(musicPlayer.audioSources).forEach((source) => {
        source.preload = "auto";
      });
    }
  });

  // Recolher o player
  collapseBtn.addEventListener("click", () => {
    floatingPlayer.classList.remove("expanded");
  });

  // Posicionamento para evitar botão de voltar ao topo
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    floatingPlayer.style.bottom = "90px";
  }
}

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
