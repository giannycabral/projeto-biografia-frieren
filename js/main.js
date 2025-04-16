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

  BASE_PATH:
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? ""
      : "/projeto-biografia-frieren", // Nome do seu

  // Use o caminho base para todos os recursos
  get AUDIO_PATH() {
    return this.BASE_PATH + "/audio/";
  },

  ERROR_DISPLAY_TIME: 3000,
};

// Inicializar componentes quando o documento estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Inicializar componentes
    initializeScrollEffects();
    galleryManager.init();
    videoManager.init();
    heroBackgrounds.init();
    magicSystem.init();
    createGalleryParticles();

    // Inicializar player de música - verificar se os elementos existem primeiro
    if (document.getElementById("musicPlayer")) {
      themePlayer.init();
    } else {
      console.warn("Elemento do player de música não encontrado no DOM");
    }

    // Inicializar player flutuante - CORRIGIDO para usar a classe correta
    if (document.querySelector(".floating-player")) {
      // Mudado de .floating-music-player para .floating-player
      initFloatingMusicPlayer();
    } else {
      console.warn("Elemento do player flutuante não encontrado no DOM");
    }

    // Inicializar outros componentes aqui
    initializeUI();
    initBackToTop();
  } catch (error) {
    console.error("Erro ao inicializar a aplicação:", error);
    handleGlobalError(error);
  }
});

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

//MUSIC
//diagnostico do player de música

// Adicione esta função para diagnóstico
function diagnosePlayerIssues() {
  console.group("Diagnóstico do Player de Música");

  // Verificar os elementos do player
  const playerElements = [
    { id: "musicPlayer", desc: "Container do player" },
    { id: "themeAudio", desc: "Elemento de áudio" },
    { id: "playerToggle", desc: "Botão de play/pause" },
    { id: "progressBar", desc: "Barra de progresso" },
    { id: "volumeSlider", desc: "Controle de volume" },
    { id: "volumeToggle", desc: "Botão de mudo" },
  ];

  let allElementsExist = true;

  playerElements.forEach((elem) => {
    const element = document.getElementById(elem.id);
    if (element) {
      console.log(`✅ ${elem.desc} (${elem.id}) encontrado`);
    } else {
      console.error(`❌ ${elem.desc} (${elem.id}) não encontrado!`);
      allElementsExist = false;
    }
  });

  if (!allElementsExist) {
    console.warn(
      "Elementos do player de música estão faltando no HTML. Verifique se todos os IDs estão corretos."
    );
  }

  console.groupEnd();

  return allElementsExist;
}

// Inicializa o player de música flutuante
function initFloatingMusicPlayer() {
  console.log("Inicializando player de música flutuante");

  // Verificar se os elementos existem
  const floatingPlayer = document.querySelector(".floating-player");

  if (!floatingPlayer) {
    console.error("Player flutuante não encontrado no DOM");
    return;
  }

  // Se o player flutuante e o player principal são o mesmo elemento,
  // não precisamos fazer nada, pois themePlayer já foi inicializado
  if (floatingPlayer.id === "musicPlayer") {
    console.log("Player flutuante é o mesmo que o player principal");
    return;
  }

  // Ajustar posicionamento para evitar botão de voltar ao topo
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        floatingPlayer.style.bottom = "80px";
      } else {
        floatingPlayer.style.bottom = "20px";
      }
    });
  }

  // Se o método diagnosePlayerIssues existir, execute-o para debug
  if (typeof diagnosePlayerIssues === "function") {
    diagnosePlayerIssues();
  }

  console.log("Player flutuante inicializado com sucesso");
}

// Inicializa o player de música
const themePlayer = {
  init: function () {
    this.player = document.getElementById("musicPlayer");
    this.audio = document.getElementById("themeAudio");
    this.toggleBtn = document.getElementById("playerToggle");
    this.progressBar = document.getElementById("progressBar");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.volumeToggle = document.getElementById("volumeToggle");

    // Verificar se elementos existem
    if (
      !this.player ||
      !this.audio ||
      !this.toggleBtn ||
      !this.progressBar ||
      !this.volumeSlider ||
      !this.volumeToggle
    ) {
      console.error("Elementos do player de música não encontrados");
      return;
    }

    // Obter elementos de ícone
    this.volumeIcon = this.volumeToggle.querySelector(".volume-icon");
    this.playerIcon = this.toggleBtn.querySelector(".player-icon");

    // Verificar se os ícones foram encontrados
    if (!this.volumeIcon) {
      console.warn("Ícone de volume não encontrado, criando elemento");
      this.volumeIcon = document.createElement("i");
      this.volumeIcon.className = "volume-icon";
      this.volumeIcon.textContent = "🔊";
      this.volumeToggle.appendChild(this.volumeIcon);
    }

    if (!this.playerIcon) {
      console.warn("Ícone do player não encontrado, criando elemento");
      this.playerIcon = document.createElement("i");
      this.playerIcon.className = "player-icon";
      this.playerIcon.textContent = "♫";
      this.toggleBtn.appendChild(this.playerIcon);
    }

    this.isExpanded = false;
    this.isMuted = false;
    this.setupEventListeners();
    this.setInitialVolume();

    // Tentar iniciar a reprodução automática
    this.attemptAutoplay();
  },

  setupEventListeners: function () {
    // Toggle play/pause
    this.toggleBtn.addEventListener("click", () => {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    });

    // Expandir/recolher player
    this.player.addEventListener("mouseenter", () => {
      this.expand();
    });

    this.player.addEventListener("mouseleave", () => {
      if (!this.audio.paused) return; // Mantém expandido se estiver tocando
      this.collapse();
    });

    // Atualizar barra de progresso
    this.audio.addEventListener("timeupdate", () => {
      const percent = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressBar.style.width = `${percent}%`;
    });

    // Controle de volume
    this.volumeSlider.addEventListener("input", () => {
      const volume = this.volumeSlider.value / 100;
      this.audio.volume = volume;
      this.updateVolumeIcon(volume);

      // Se o volume for maior que 0, não está mais mudo
      if (volume > 0) {
        this.isMuted = false;
        this.audio.muted = false;
      }
    });

    // Toggle mudo
    this.volumeToggle.addEventListener("click", () => {
      this.toggleMute();
    });

    // Quando o carregamento for concluído, tentar iniciar a reprodução
    this.audio.addEventListener("canplaythrough", () => {
      if (!this.hasAutoplayAttempted) {
        this.attemptAutoplay();
      }
    });

    // Tratar reprodução manual do usuário para futuras interações
    document.addEventListener("click", () => {
      if (!this.hasUserInteracted) {
        this.hasUserInteracted = true;

        // Se estiver mudo devido ao autoplay, desmutar
        if (this.audio.muted && !this.audio.paused) {
          this.audio.muted = false;
          this.toggleBtn.classList.add("playing");
          this.playerIcon.textContent = "⏸";
          this.expand();
        }
      }
    });

    // Tratamento de erros
    this.audio.addEventListener("error", (e) => {
      console.error("Erro no player de música:", e);
      this.playerIcon.textContent = "❌";
    });

    // Garantir que o player seja ajustado corretamente quando a tela muda de orientação
    window.addEventListener("resize", () => {
      this.adjustPosition();
    });
  },

  attemptAutoplay: function () {
    this.hasAutoplayAttempted = true;
    console.log("Tentando reprodução automática...");

    // Definir o áudio como mudo inicialmente (maior probabilidade de sucesso)
    this.audio.muted = true;

    // Tentar reproduzir
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay bem-sucedido com áudio mudo
          console.log("Reprodução automática iniciada (mudo)");
          this.toggleBtn.classList.add("playing");
          this.playerIcon.textContent = "🔇";
          this.expand();

          // Ativar animação pulsante no player para indicar reprodução com mudo
          this.player.classList.add("muted-playing");

          // Exibir dica visual para o usuário
          this.showAutoplayNotification();
        })
        .catch((error) => {
          console.error("Reprodução automática falhou:", error);

          // Reset do estado
          this.audio.muted = false;
          this.playerIcon.textContent = "♫";

          // Segunda tentativa: mostrar ao usuário que ele precisa clicar
          this.showPlayPrompt();
        });
    }
  },

  showAutoplayNotification: function () {
    // Criar um elemento de notificação
    const notification = document.createElement("div");
    notification.className = "autoplay-notification";
    notification.innerHTML = `
      <p>Música tocando sem som. Clique na página para ativar o áudio.</p>
      <button class="notification-close">×</button>
    `;

    // Estilos inline para a notificação
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.left = "20px";
    notification.style.background = "rgba(68, 49, 141, 0.9)";
    notification.style.color = "#fff";
    notification.style.padding = "12px 16px";
    notification.style.borderRadius = "8px";
    notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    notification.style.zIndex = "1001";
    notification.style.display = "flex";
    notification.style.alignItems = "center";
    notification.style.justifyContent = "space-between";
    notification.style.maxWidth = "300px";
    notification.style.animation = "fadeIn 0.5s ease-out";

    document.body.appendChild(notification);

    // Adicionar evento para fechar a notificação
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        document.body.removeChild(notification);
      });

    // Remover automaticamente após 10 segundos
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
  },

  showPlayPrompt: function () {
    // Adicionar um efeito visual ao botão do player para indicar que o usuário deve clicar
    this.toggleBtn.classList.add("prompt-to-play");

    // Efeito pulsante temporário
    const pulseAnimation = `
      @keyframes promptPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    `;

    const style = document.createElement("style");
    style.innerHTML =
      pulseAnimation +
      `
      .prompt-to-play {
        animation: promptPulse 1.5s infinite;
        box-shadow: 0 0 10px var(--accent-color);
      }
    `;

    document.head.appendChild(style);

    // Remover o efeito após a primeira interação
    document.addEventListener(
      "click",
      () => {
        this.toggleBtn.classList.remove("prompt-to-play");
      },
      { once: true }
    );
  },

  play: function () {
    this.playerIcon.textContent = "⏸";

    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.toggleBtn.classList.add("playing");
          this.expand();
        })
        .catch((error) => {
          console.error("Erro ao reproduzir áudio:", error);

          // Se o erro for por política de autoplay, solicitar interação
          if (error.name === "NotAllowedError") {
            this.showPlayPrompt();
            this.playerIcon.textContent = "♫";
          }
        });
    }
  },

  pause: function () {
    this.audio.pause();
    this.toggleBtn.classList.remove("playing");
    this.playerIcon.textContent = "♫";
    this.player.classList.remove("muted-playing");
  },

  expand: function () {
    if (this.isExpanded) return;

    this.player.classList.add("expanded");
    this.isExpanded = true;
  },

  collapse: function () {
    if (!this.isExpanded) return;

    this.player.classList.remove("expanded");
    this.isExpanded = false;
  },

  toggleMute: function () {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;

    if (this.isMuted) {
      this.volumeIcon.textContent = "🔇";
      this.lastVolume = this.audio.volume;
      this.volumeSlider.value = 0;
    } else {
      this.updateVolumeIcon(this.lastVolume || 0.7);
      this.audio.volume = this.lastVolume || 0.7;
      this.volumeSlider.value = (this.lastVolume || 0.7) * 100;
    }
  },

  updateVolumeIcon: function (volume) {
    if (volume > 0.5) {
      this.volumeIcon.textContent = "🔊";
    } else if (volume > 0) {
      this.volumeIcon.textContent = "🔉";
    } else {
      this.volumeIcon.textContent = "🔇";
    }
  },

  setInitialVolume: function () {
    const volume = this.volumeSlider.value / 100;
    this.audio.volume = volume;
    this.updateVolumeIcon(volume);
  },

  adjustPosition: function () {
    // Ajusta a posição do player para evitar sobreposição com o botão de voltar ao topo
    const backToTopBtn = document.querySelector(".back-to-top");
    if (backToTopBtn && window.innerWidth <= 768) {
      const backToTopVisible = backToTopBtn.classList.contains("visible");
      this.player.style.bottom = backToTopVisible ? "80px" : "20px";
    } else {
      this.player.style.bottom = "80px"; // Posição padrão
    }
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
