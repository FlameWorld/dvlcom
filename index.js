document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("floatingMenuToggle");
  const menu = document.getElementById("floatingQuickMenu");
  const overlay = document.getElementById("floatingMenuOverlay");
  const track = document.getElementById("slidesTrack");
  const menuLinks = Array.from(document.querySelectorAll(".floating-menu-link"));
  const indicators = Array.from(document.querySelectorAll(".indicator"));
  const jumpButtons = Array.from(document.querySelectorAll("[data-slide-jump]"));
  const totalSlides = 5;
  let currentSlide = 0;
  let wheelLocked = false;

  function setMenuState(isOpen) {
    menu.classList.toggle("is-open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    overlay.hidden = !isOpen;
  }

  function closeMenu() {
    setMenuState(false);
  }

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(totalSlides - 1, index));
    if (window.innerWidth > 900) {
      track.style.transform = "translateX(-" + (currentSlide * 20) + "%)";
    }
    menuLinks.forEach((link, i) => link.classList.toggle("is-active", i === currentSlide));
    indicators.forEach((dot, i) => dot.classList.toggle("is-active", i === currentSlide));
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  menuToggle.addEventListener("click", function () {
    setMenuState(!menu.classList.contains("is-open"));
  });

  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
    if (window.innerWidth > 900) {
      if (event.key === "ArrowRight" || event.key === "PageDown") nextSlide();
      if (event.key === "ArrowLeft" || event.key === "PageUp") prevSlide();
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const target = Number(link.dataset.slide);
      goToSlide(target);
      if (window.innerWidth <= 900) {
        const slides = document.querySelectorAll(".slide");
        if (slides[target]) slides[target].scrollIntoView({ behavior: "smooth", block: "start" });
      }
      closeMenu();
    });
  });

  indicators.forEach((dot) => {
    dot.addEventListener("click", function () {
      const target = Number(dot.dataset.slide);
      goToSlide(target);
      if (window.innerWidth <= 900) {
        const slides = document.querySelectorAll(".slide");
        if (slides[target]) slides[target].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  jumpButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const target = Number(btn.dataset.slideJump);
      goToSlide(target);
    });
  });

  window.addEventListener("wheel", function (event) {
    if (window.innerWidth <= 900) return;
    event.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    if (event.deltaY > 0) nextSlide();
    else if (event.deltaY < 0) prevSlide();
    setTimeout(() => { wheelLocked = false; }, 650);
  }, { passive: false });

  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener("touchstart", function (event) {
    if (!event.touches.length) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", function (event) {
    if (!event.changedTouches.length || window.innerWidth <= 900) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      track.style.transform = "translateX(-" + (currentSlide * 20) + "%)";
    } else {
      track.style.transform = "none";
    }
  });

  const isMobileDevice = window.innerWidth <= 900;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const performanceMode = isMobileDevice || prefersReducedMotion || lowPowerDevice;

  if (performanceMode) {
    document.body.classList.add("performance-mode");
  }

  if (window.particlesJS && !prefersReducedMotion) {
    particlesJS("particles-js", {
      particles: {
        number: { value: performanceMode ? 22 : 58, density: { enable: true, value_area: performanceMode ? 1200 : 900 } },
        color: { value: ["#5eeaff", "#ff51be", "#8a5bff", "#ffffff"] },
        shape: { type: ["circle"] },
        opacity: { value: performanceMode ? 0.28 : 0.4, random: true },
        size: { value: performanceMode ? 2.2 : 3.2, random: true },
        line_linked: {
          enable: false,
          distance: 140,
          color: "#5eeaff",
          opacity: 0.12,
          width: 1
        },
        move: {
          enable: true,
          speed: performanceMode ? 0.7 : 1.4,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: !performanceMode, mode: "grab" },
          onclick: { enable: !performanceMode, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 180, line_linked: { opacity: 0.35 } },
          push: { particles_nb: 3 }
        }
      },
      retina_detect: !performanceMode
    });
  }

  goToSlide(0);
});


async function loadDiscordWidget(inviteCode, nameId, countId, iconId) {
  const nameEl = document.getElementById(nameId);
  const countEl = document.getElementById(countId);
  const iconEl = document.getElementById(iconId);

  if (countEl) {
    countEl.textContent = "Loading server...";
    countEl.classList.add("loading");
  }

  try {
    const res = await fetch("https://discord.com/api/v9/invites/" + inviteCode + "?with_counts=true");
    if (!res.ok) throw new Error("Invite fetch failed");
    const data = await res.json();

    if (nameEl && data.guild && data.guild.name) {
      nameEl.textContent = data.guild.name;
    }

    if (countEl) {
      const online = typeof data.approximate_presence_count === "number" ? data.approximate_presence_count : null;
      const total = typeof data.approximate_member_count === "number" ? data.approximate_member_count : null;

      if (online !== null && total !== null) {
        countEl.textContent = online + " online • " + total + " members";
      } else if (online !== null) {
        countEl.textContent = online + " online";
      } else if (total !== null) {
        countEl.textContent = total + " members";
      } else {
        countEl.textContent = "Discord server";
      }

      countEl.classList.remove("loading");
      countEl.classList.remove("error");
    }

    if (iconEl && data.guild && data.guild.id && data.guild.icon) {
      iconEl.src = "https://cdn.discordapp.com/icons/" + data.guild.id + "/" + data.guild.icon + ".png?size=256";
    }
  } catch (error) {
    if (countEl) {
      countEl.textContent = "Server unavailable";
      countEl.classList.remove("loading");
      countEl.classList.add("error");
    }
  }
}

window.addEventListener("DOMContentLoaded", function () {
  loadDiscordWidget("9aX5u5h8fJ", "partnerName1", "partnerCount1", "partnerIcon1");
  loadDiscordWidget("tCVKMrnAR6", "partnerName2", "partnerCount2", "partnerIcon2");
  loadDiscordWidget("FHGkct9MPX", "partnerName3", "partnerCount3", "partnerIcon3");
  loadDiscordWidget("c625tqaAbc", "partnerName4", "partnerCount4", "partnerIcon4");
  loadDiscordWidget("zwBEe3Tvma", "partnerName5", "partnerCount5", "partnerIcon5");
});


window.addEventListener("DOMContentLoaded", function () {
  const tiktokLink = document.getElementById("tiktokProfileLink");
  const tiktokHandle = document.getElementById("tiktokHandle");
  const tiktokStatus = document.getElementById("tiktokStatus");
  const tiktokFollowers = document.getElementById("tiktokFollowers");
  const tiktokBio = document.getElementById("tiktokBio");
  const tiktokAvatar = document.getElementById("tiktokAvatar");

  if (tiktokLink) {
    try {
      const url = new URL(tiktokLink.href);
      const handle = url.pathname.replace(/\//g, "");
      if (handle) {
        if (tiktokHandle) tiktokHandle.textContent = "@" + handle.replace(/^@/, "");
        if (tiktokFollowers) tiktokFollowers.textContent = "Open Now";
        if (tiktokStatus) tiktokStatus.textContent = "Profile Live";
        if (tiktokBio) {
          tiktokBio.textContent = "Clean DVL TikTok spotlight with a gaming-style visual background and a lightweight profile card for smooth browsing.";
        }
      }
    } catch (e) {}
  }

  if (tiktokAvatar) {
    tiktokAvatar.addEventListener("error", function () {
      tiktokAvatar.src = "DvlProfile.png";
    });
  }
});



async function loadDiscordInviteCard(inviteCode, nameId, countId, iconId) {
  const nameEl = document.getElementById(nameId);
  const countEl = document.getElementById(countId);
  const iconEl = document.getElementById(iconId);

  try {
    const res = await fetch("https://discord.com/api/v9/invites/" + inviteCode + "?with_counts=true");
    if (!res.ok) throw new Error("Invite fetch failed");
    const data = await res.json();

    if (nameEl && data.guild && data.guild.name) {
      nameEl.textContent = data.guild.name;
    }

    if (countEl) {
      const online = typeof data.approximate_presence_count === "number" ? data.approximate_presence_count : null;
      const total = typeof data.approximate_member_count === "number" ? data.approximate_member_count : null;
      if (online !== null && total !== null) {
        countEl.textContent = online + " online • " + total + " members";
      } else if (total !== null) {
        countEl.textContent = total + " members";
      } else {
        countEl.textContent = "Discord server";
      }
    }

    if (iconEl && data.guild && data.guild.id && data.guild.icon) {
      iconEl.src = "https://cdn.discordapp.com/icons/" + data.guild.id + "/" + data.guild.icon + ".png?size=256";
    }
  } catch (e) {
    if (countEl) countEl.textContent = "Server unavailable";
  }
}

window.addEventListener("DOMContentLoaded", function () {
  loadDiscordInviteCard("U3dPecbffQ", "communityName1", "communityCount1", "communityIcon1");
  loadDiscordInviteCard("JGmMJrDHN6", "communityName2", "communityCount2", "communityIcon2");

  const tiktokHandle = document.getElementById("tiktokHandle");
  const tiktokBio = document.getElementById("tiktokBio");
  const tiktokFollowers = document.getElementById("tiktokFollowers");
  const tiktokStatus = document.getElementById("tiktokStatus");
  const tiktokFollowing = document.getElementById("tiktokFollowing");
  if (tiktokHandle) tiktokHandle.textContent = "@mini.aim1";
  if (tiktokBio) tiktokBio.textContent = "Kovaaks Grinder • sharp aim clips, edits, and gaming highlights from the DVL TikTok side.";
  if (tiktokFollowing) tiktokFollowing.textContent = "69";
  if (tiktokFollowers) tiktokFollowers.textContent = "270";
  if (tiktokStatus) tiktokStatus.textContent = "423";
});
