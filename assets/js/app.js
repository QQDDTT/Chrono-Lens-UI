/* ==========================================================================
   Chrono-Lens (时空之镜) - 3D 沉浸式生活光影幻灯片交互引擎
   - 鲜明对比度与生活质感叙事
   - 健壮状态机：左右箭头、指示条、直接点击侧翼卡片、移动端触摸滑动、键盘方向键
   - 自动轮播与悬停智能暂停
   ========================================================================== */

// 1. PWA Service Worker 注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

// 2. 幻灯状态自执行控制器
(function () {
  let currentIndex = 0;
  let totalCards = 4;
  let autoPlayTimer = null;
  let touchStartX = 0;
  let touchEndX = 0;

  function getDOM() {
    return {
      deck: document.getElementById('sliderDeck') || document.getElementById('carouselViewport'),
      prevBtn: document.getElementById('slidePrevBtn'),
      nextBtn: document.getElementById('slideNextBtn'),
      dotsGroup: document.getElementById('slideDotsGroup') || document.getElementById('slideTrackDots')
    };
  }

  function updateCards() {
    const DOM = getDOM();
    if (!DOM.deck) return;

    const cards = DOM.deck.querySelectorAll('.slider-card, .art-slide');
    totalCards = cards.length || 4;
    const dots = DOM.dotsGroup ? DOM.dotsGroup.querySelectorAll('.slider-dot-bar, .track-dot') : [];

    cards.forEach((card, idx) => {
      card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden');
      card.style.transform = '';

      if (idx === currentIndex) {
        card.classList.add('is-active');
        card.setAttribute('aria-hidden', 'false');
      } else if (idx === (currentIndex - 1 + totalCards) % totalCards) {
        card.classList.add('is-prev');
        card.setAttribute('aria-hidden', 'true');
      } else if (idx === (currentIndex + 1) % totalCards) {
        card.classList.add('is-next');
        card.setAttribute('aria-hidden', 'true');
      } else {
        card.classList.add('is-hidden');
        card.setAttribute('aria-hidden', 'true');
      }
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentIndex);
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(target) {
    currentIndex = (target + totalCards) % totalCards;
    updateCards();
    restartAutoPlay();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function restartAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(nextSlide, 7500);
  }

  function initInteraction() {
    const DOM = getDOM();
    if (!DOM.deck) return;

    // 箭头按钮
    if (DOM.prevBtn) {
      DOM.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
      });
    }
    if (DOM.nextBtn) {
      DOM.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
      });
    }

    // 指示条点击
    if (DOM.dotsGroup) {
      DOM.dotsGroup.querySelectorAll('.slider-dot-bar, .track-dot').forEach((dot) => {
        dot.addEventListener('click', function () {
          const idx = parseInt(this.dataset.index, 10);
          if (!isNaN(idx)) {
            goToSlide(idx);
          }
        });
      });
    }

    // 点击卡片：侧翼卡片平滑切换聚焦，激活卡片进入子模块
    DOM.deck.querySelectorAll('.slider-card, .art-slide').forEach((card) => {
      card.addEventListener('click', function (e) {
        const idx = parseInt(this.dataset.index, 10);
        if (isNaN(idx)) return;
        if (idx !== currentIndex) {
          e.preventDefault();
          goToSlide(idx);
        } else {
          const url = this.getAttribute('href') || this.dataset.url;
          if (url && url !== '#' && url !== '') {
            window.location.assign(url);
          }
        }
      });
    });

    // 悬停暂停
    DOM.deck.addEventListener('mouseenter', () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    });
    DOM.deck.addEventListener('mouseleave', () => {
      restartAutoPlay();
    });

    // 触摸手势
    DOM.deck.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    DOM.deck.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }, { passive: true });

    // 键盘支持
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });

    // 启动初始状态与轮播
    updateCards();
    restartAutoPlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteraction);
  } else {
    initInteraction();
  }
})();
