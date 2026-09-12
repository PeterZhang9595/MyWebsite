/**
 * Interests 交互：
 * 1) 三段式放大/翻面浮层（主页双图与子页卡牌共用）
 * 2) 横滑轨道：指针拖拽 + 垂直滚轮转横向
 *
 * 零依赖原生 JS。浮层只在需要时构建一次，之后复用。
 */

(function () {
  'use strict';

  var root = document.querySelector('[data-interests-root]');
  var labels = {
    dialog: '放大查看',
    close: '关闭',
    zoomHint: '再点一次翻开 · Esc 关闭',
    closeHint: '再点一次关闭 · Esc 关闭',
    scroll: '说明文字，可上下滚动',
  };
  if (root && root.dataset.labels) {
    try {
      var parsed = JSON.parse(root.dataset.labels);
      Object.keys(labels).forEach(function (key) {
        if (typeof parsed[key] === 'string' && parsed[key]) labels[key] = parsed[key];
      });
    } catch (error) {
      /* 标签解析失败时沿用中文默认值 */
    }
  }

  var overlay = null;
  var overlayState = 'closed';
  var activeSource = null;

  function buildOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'interests-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', labels.dialog);
    overlay.hidden = true;
    overlay.dataset.state = 'closed';
    overlay.innerHTML =
      '<div class="interests-overlay__scrim" data-close></div>' +
      '<button type="button" class="interests-overlay__close" data-close>' + labels.close + '</button>' +
      '<div class="interests-overlay__stage">' +
      '  <div class="interests-overlay__inner">' +
      '    <div class="interests-overlay__face interests-overlay__front">' +
      '      <div class="interests-overlay__front-media" data-media></div>' +
      '    </div>' +
      '    <div class="interests-overlay__face interests-overlay__back">' +
      '      <div class="interests-overlay__back-scroll" tabindex="0" role="region">' +
      '        <article class="interests-overlay__doc">' +
      '          <h2 class="interests-overlay__back-title" data-title></h2>' +
      '          <div data-body></div>' +
      '        </article>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<p class="interests-overlay__hint" data-hint></p>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (event) {
      if (event.target.closest('[data-close]')) {
        close();
        return;
      }
      if (overlayState === 'zoomed') {
        flip();
      } else if (overlayState === 'flipped') {
        close();
      }
    });

    return overlay;
  }

  /**
   * 纯文本回退：把文本按空行拆成多个段落渲染到容器里。
   *
   * 只在卡片里没有 `<template data-body-rich>` 时使用（例如模板被移除、
   * 或将来某个调用方只提供了 `data-body`）。仍然只用 textContent、
   * 不碰 innerHTML，保留「永不执行字符串里的标记」这条底线。
   */
  function renderBody(container, text) {
    if (!container) return;
    container.textContent = '';
    var paragraphs = String(text).split(/\n\s*\n/);
    for (var i = 0; i < paragraphs.length; i += 1) {
      var chunk = paragraphs[i].trim();
      if (!chunk) continue;
      var p = document.createElement('p');
      p.className = 'interests-overlay__back-body';
      p.textContent = chunk;
      container.appendChild(p);
    }
  }

  /**
   * 首选路径：克隆构建期编译好的 HTML。
   *
   * 这里刻意**不用 innerHTML**：`cloneNode` 直接克隆已经解析好的节点，
   * 不经过「字符串 → HTML 解析器」这一步，所以能进 DOM 的标签集合
   * 由构建期插件白名单决定，而不是由内容字符串决定。
   * 这是对「永不执行字符串里的标记」那条底线的定向反转，边界在此。
   */
  function renderRichBody(container, source) {
    if (!container || !source) return false;
    var tpl = source.querySelector('template[data-body-rich]');
    if (tpl && tpl.content) {
      container.replaceChildren(tpl.content.cloneNode(true));
      return true;
    }
    return false;
  }

  function open(source) {
    buildOverlay();
    var media = overlay.querySelector('[data-media]');
    var image = source.querySelector('img');
    media.innerHTML = '';
    if (image) {
      var clone = document.createElement('img');
      clone.src = image.currentSrc || image.src;
      clone.alt = source.dataset.alt || image.alt || '';
      media.appendChild(clone);
    } else {
      var mark = source.querySelector('.flip-card__placeholder-mark');
      var placeholder = document.createElement('div');
      placeholder.className = 'flip-card__placeholder';
      placeholder.style.position = 'absolute';
      placeholder.style.inset = '0';
      if (mark) {
        var span = document.createElement('span');
        span.className = 'flip-card__placeholder-mark';
        span.textContent = mark.textContent;
        placeholder.appendChild(span);
      }
      media.appendChild(placeholder);
      var frame = source.style.getPropertyValue('--frame');
      if (frame) media.style.setProperty('--frame', frame);
    }
    overlay.querySelector('[data-title]').textContent = source.dataset.flipTitle || source.dataset.title || '';
    var bodyTarget = overlay.querySelector('[data-body]');
    if (!renderRichBody(bodyTarget, source)) {
      renderBody(bodyTarget, source.dataset.body || '');
    }
    var scrollRegion = overlay.querySelector('.interests-overlay__back-scroll');
    if (scrollRegion) {
      scrollRegion.setAttribute('aria-label', labels.scroll);
      scrollRegion.scrollTop = 0;
    }
    overlay.hidden = false;
    overlay.dataset.state = 'zoomed';
    overlayState = 'zoomed';
    activeSource = source;
    setHint(labels.zoomHint);
    var closeBtn = overlay.querySelector('.interests-overlay__close');
    if (closeBtn) closeBtn.focus();
  }

  function flip() {
    if (!overlay) return;
    overlay.dataset.state = 'flipped';
    overlayState = 'flipped';
    setHint(labels.closeHint);
  }

  function close() {
    if (!overlay) return;
    overlay.dataset.state = 'closed';
    overlay.hidden = true;
    overlayState = 'closed';
    if (activeSource) {
      var target = activeSource;
      activeSource = null;
      target.focus();
    }
  }

  function setHint(text) {
    var hint = overlay.querySelector('[data-hint]');
    if (hint) hint.textContent = text;
  }

  document.addEventListener('click', function (event) {
    var card = event.target.closest('.flip-card');
    if (card) {
      event.preventDefault();
      open(card);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && overlayState !== 'closed') close();
  });

  function initRails() {
    document.querySelectorAll('[data-card-rail]').forEach(function (rail) {
      var track = rail.querySelector('.card-rail__track');
      if (!track) return;

      var dragging = false;
      var startX = 0;
      var startScroll = 0;
      var pointerId = null;

      track.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'touch') return;
        // 仅响应主键（左键）；右键/中键不参与拖拽
        if (event.button !== 0) return;
        // 从链接（卡片）上按下时不启动拖拽，交由浏览器原生点击处理，
        // 否则 setPointerCapture 会吞掉卡片自身的 click 事件。
        if (event.target.closest('a')) return;
        dragging = true;
        startX = event.clientX;
        startScroll = track.scrollLeft;
        pointerId = event.pointerId;
        rail.setAttribute('data-dragging', '');
        track.setPointerCapture(event.pointerId);
      });

      track.addEventListener('pointermove', function (event) {
        if (!dragging || event.pointerId !== pointerId) return;
        var delta = event.clientX - startX;
        track.scrollLeft = startScroll - delta;
      });

      function endDrag(event) {
        if (!dragging) return;
        if (pointerId !== null && event.pointerId !== pointerId) return;
        dragging = false;
        rail.removeAttribute('data-dragging');
        if (track.hasPointerCapture && track.hasPointerCapture(event.pointerId)) {
          track.releasePointerCapture(event.pointerId);
        }
        pointerId = null;
      }

      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.addEventListener('lostpointercapture', function () {
        dragging = false;
        rail.removeAttribute('data-dragging');
        pointerId = null;
      });

      track.addEventListener('wheel', function (event) {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        var max = track.scrollWidth - track.clientWidth;
        if (max <= 0) return;
        var next = track.scrollLeft + event.deltaY;
        if (next <= 0 || next >= max) return;
        event.preventDefault();
        track.scrollLeft = next;
      }, { passive: false });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRails);
  } else {
    initRails();
  }
})();
