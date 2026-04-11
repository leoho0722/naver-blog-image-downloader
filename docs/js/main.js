/**
 * main.js — 主要互動邏輯
 * - 暗色模式切換（OS 偏好 + localStorage）
 * - 導覽列捲動陰影
 * - 語言選單切換
 * - 行動版選單
 * - 平滑捲動後關閉選單
 */

(function () {
  'use strict';

  // === Theme Toggle ===
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    localStorage.setItem('theme', theme);
  }

  // Apply theme immediately (before DOMContentLoaded to prevent flash)
  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Listen for OS theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });

  // === Navbar Scroll Shadow ===
  const navbar = document.getElementById('navbar');

  function updateNavShadow() {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  }

  window.addEventListener('scroll', updateNavShadow, { passive: true });
  updateNavShadow();

  // === Language Selector ===
  const langSelector = document.getElementById('langSelector');
  const langToggle = document.getElementById('langToggle');
  const langMenu = document.getElementById('langMenu');

  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    langSelector.classList.toggle('open');
  });

  langMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.lang-menu__item');
    if (!item) return;
    const lang = item.getAttribute('data-lang');
    if (lang && typeof switchLanguage === 'function') {
      switchLanguage(lang);
    }
    langSelector.classList.remove('open');
  });

  // Close language menu on outside click
  document.addEventListener('click', () => {
    langSelector.classList.remove('open');
  });

  // === Mobile Menu Toggle ===
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav__link')) {
      navLinks.classList.remove('open');
    }
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });

  // === Platform Tab Switcher ===
  const platformTabs = document.getElementById('platformTabs');

  platformTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.platform-tab');
    if (!tab) return;

    const platform = tab.getAttribute('data-platform');

    // Update active tab
    platformTabs.querySelectorAll('.platform-tab').forEach((t) => {
      t.classList.toggle('active', t === tab);
    });

    // Toggle screenshot images
    document.querySelectorAll('.screenshot-card__preview img[data-platform]').forEach((img) => {
      img.hidden = img.getAttribute('data-platform') !== platform;
    });
  });
})();
