
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const subjectCards = [...document.querySelectorAll(".subject-grid button[data-subject]")];
  const subjectTabs = [...document.querySelectorAll(".subject-tab[data-topic-subject]")];
  const topicPanels = [...document.querySelectorAll(".subject-topic-panel[data-topic-panel]")];
  const topicLinks = [...document.querySelectorAll(".topic-link")];

  const subjectFilter = document.getElementById("subjectFilter");
  const boardFilter = document.getElementById("boardFilter");
  const levelFilter = document.getElementById("levelFilter");
  const typeFilter = document.getElementById("typeFilter");
  const topicFilter = document.getElementById("topicFilter");
  const searchInput = document.getElementById("searchInput");
  const noteCards = [...document.querySelectorAll(".note-card")];
  const emptyState = document.getElementById("emptyState");

  function normalize(value) {
    return (value || "").toLowerCase().trim();
  }

  function filterNotes() {
    const query = normalize(searchInput?.value);
    const subject = subjectFilter?.value || "all";
    const board = boardFilter?.value || "all";
    const level = levelFilter?.value || "all";
    const type = typeFilter?.value || "all";
    const selectedTopic = normalize(topicFilter?.value);

    let shown = 0;

    noteCards.forEach((card) => {
      const searchable = normalize([
        card.dataset.title,
        card.dataset.subject,
        card.dataset.board,
        card.dataset.level,
        card.dataset.type,
        card.textContent
      ].join(" "));

      const matchesQuery = !query || searchable.includes(query);
      const matchesTopic = !selectedTopic || searchable.includes(selectedTopic);
      const matchesSubject = subject === "all" || card.dataset.subject === subject;
      const matchesBoard = board === "all" || card.dataset.board === board;
      const matchesLevel = level === "all" || card.dataset.level === level;
      const matchesType = type === "all" || card.dataset.type === type;

      const visible =
        matchesQuery &&
        matchesTopic &&
        matchesSubject &&
        matchesBoard &&
        matchesLevel &&
        matchesType;

      card.classList.toggle("hidden", !visible);
      if (visible) shown += 1;
    });

    emptyState?.classList.toggle("hidden", shown !== 0);
  }

  function activateSubject(subjectName, options = {}) {
    const { scroll = false, updateFilter = true } = options;

    subjectTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.topicSubject === subjectName);
    });

    topicPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.topicPanel === subjectName);
    });

    subjectCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.subject === subjectName);
    });

    if (updateFilter && subjectFilter) {
      subjectFilter.value = subjectName;
    }

    if (topicFilter) topicFilter.value = "";
    if (searchInput) searchInput.value = "";

    topicLinks.forEach((link) => link.classList.remove("selected"));
    filterNotes();

    if (scroll) {
      document.getElementById("topic-browser")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  subjectCards.forEach((card) => {
    card.addEventListener("click", () => {
      activateSubject(card.dataset.subject, { scroll: true, updateFilter: true });
    });
  });

  subjectTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateSubject(tab.dataset.topicSubject, {
        scroll: false,
        updateFilter: true
      });
    });
  });

  topicLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const subject = link.dataset.subject;
      const topic = link.dataset.topic;

      activateSubject(subject, { scroll: false, updateFilter: true });

      topicLinks.forEach((item) => item.classList.remove("selected"));
      link.classList.add("selected");

      if (topicFilter) topicFilter.value = topic;
      if (searchInput) searchInput.value = topic;

      filterNotes();

      document.getElementById("notes")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  [subjectFilter, boardFilter, levelFilter, typeFilter].forEach((control) => {
    control?.addEventListener("change", () => {
      if (control === subjectFilter && subjectFilter.value !== "all") {
        activateSubject(subjectFilter.value, {
          scroll: false,
          updateFilter: false
        });
      } else {
        filterNotes();
      }
    });
  });

  searchInput?.addEventListener("input", () => {
    if (topicFilter) topicFilter.value = "";
    topicLinks.forEach((link) => link.classList.remove("selected"));
    filterNotes();
  });

  noteCards.forEach((card) => {
    const saveButton = card.querySelector(".note-meta button");
    saveButton?.addEventListener("click", () => {
      const saved = saveButton.textContent.trim() === "♥";
      saveButton.textContent = saved ? "♡" : "♥";
      saveButton.setAttribute("aria-label", saved ? "Save note" : "Remove saved note");
    });
  });

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "levelnotes-theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });

  if (localStorage.getItem("levelnotes-theme") === "dark") {
    document.body.classList.add("dark");
  }

  // Ensure the initial active panel and filters are consistent.
  const initialSubject =
    subjectTabs.find((tab) => tab.classList.contains("active"))?.dataset.topicSubject ||
    "Further Mathematics";

  activateSubject(initialSubject, {
    scroll: false,
    updateFilter: false
  });

  if (subjectFilter) subjectFilter.value = "all";
  filterNotes();
});
