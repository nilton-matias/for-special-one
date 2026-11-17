document.addEventListener("DOMContentLoaded", function () {
  const start = new Date(CONFIG.startDate);
  const couple = CONFIG.yourName + " & " + CONFIG.herName;
  const LUNAR = 29.530588;
  const BPM = 72;
  const BODAS = [
    { years: 1, name: "papel" },
    { years: 2, name: "algodão" },
    { years: 3, name: "couro" },
    { years: 4, name: "flores" },
    { years: 5, name: "madeira" },
    { years: 6, name: "açúcar" },
    { years: 7, name: "latão" },
    { years: 8, name: "bronze" },
    { years: 9, name: "cerâmica" },
    { years: 10, name: "estanho" },
    { years: 15, name: "cristal" },
    { years: 20, name: "porcelana" },
    { years: 25, name: "prata" },
    { years: 50, name: "ouro" },
  ];
  var petals = [];
  var burstHearts = function () {};

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const node = byId(id);
    if (node) node.textContent = value;
  }

  setText("coupleNames", couple);
  setText("brandNames", couple);
  setText("heroLine", CONFIG.heroLine);
  setText("signName", CONFIG.yourName);
  setText("footerHer", CONFIG.herName);
  setText(
    "sinceLabel",
    "Desde " +
      start.toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  );
  setText("statLoveLabel", CONFIG.valentinesLabel);
  setText("statLoveWhen", CONFIG.valentinesDay + " / " + CONFIG.valentinesMonth);

  fillPlainList(byId("reasons"), CONFIG.reasons);
  fillPlainList(byId("promises"), CONFIG.promises);
  fillTimeline(byId("timeline"), CONFIG.timeline);

  setupCover();
  setupCounter();
  setupPhotos();
  const musicPlayer = setupMusic();
  setupForgive(musicPlayer);
  setupPetals();

  function fillPlainList(list, items) {
    if (!list) return;
    list.replaceChildren();
    items.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function fillTimeline(list, items) {
    if (!list) return;
    list.replaceChildren();
    items.forEach(function (item) {
      const li = document.createElement("li");
      const title = document.createElement("strong");
      const text = document.createElement("p");
      title.textContent = item.date;
      text.textContent = item.text;
      li.appendChild(title);
      li.appendChild(text);
      list.appendChild(li);
    });
  }

  function setupCover() {
    const img = byId("coverImg");
    const cover = byId("cover");
    img.addEventListener("error", function () {
      cover.classList.add("is-empty");
    });
    img.addEventListener("load", function () {
      cover.classList.remove("is-empty");
    });
    img.src = CONFIG.cover;
  }

  function elapsedParts(now) {
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes -= 1;
    }
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) {
      hours += 24;
      days -= 1;
    }
    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return {
      years: Math.max(0, years),
      months: Math.max(0, months),
      days: Math.max(0, days),
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }

  function countHoliday(month, day, now) {
    let count = 0;
    for (let year = start.getFullYear(); year <= now.getFullYear(); year += 1) {
      const date = new Date(year, month, day, 23, 59, 59);
      if (date >= start && date <= now) count += 1;
    }
    return count;
  }

  function countWeekends(now) {
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    while (cursor.getDay() !== 6) cursor.setDate(cursor.getDate() + 1);
    let count = 0;
    while (cursor <= now) {
      count += 1;
      cursor.setDate(cursor.getDate() + 7);
    }
    return count;
  }

  function setupCounter() {
    function render() {
      const now = new Date();
      const parts = elapsedParts(now);
      const ms = Math.max(0, now - start);
      const totalDays = ms / 86400000;
      const totalHours = Math.floor(ms / 3600000);
      const totalMinutes = Math.floor(ms / 60000);
      const totalSeconds = Math.floor(ms / 1000);
      const moons = Math.floor(totalDays / LUNAR);
      const natais = countHoliday(11, 25, now);
      const namorados = countHoliday(CONFIG.valentinesMonth - 1, CONFIG.valentinesDay, now);
      const weekends = countWeekends(now);
      const beats = Math.floor(totalMinutes * BPM);

      setText("years", parts.years);
      setText("months", parts.months);
      setText("days", parts.days);
      setText("hours", parts.hours);
      setText("minutes", parts.minutes);
      setText("seconds", parts.seconds);
      setText("statMoons", moons);
      setText("statNatais", natais);
      setText("statLove", namorados);
      setText("statWeekends", weekends);
      setText("totalHoursLine", "Um total de " + formatNumber(totalHours) + " horas");
      setText("totalHoursWords", toWords(totalHours));
      setText("totalMinutesLine", "Um total de " + formatNumber(totalMinutes) + " minutos");
      setText("totalMinutesWords", toWords(totalMinutes));
      setText("totalSecondsLine", "Um total de " + formatNumber(totalSeconds) + " segundos");
      setText("totalSecondsWords", toWords(totalSeconds));
      setText("totalBeatsLine", formatNumber(beats) + " batidas do nosso coração");

      const nextBoda = BODAS.find(function (boda) {
        const mark = new Date(start);
        mark.setFullYear(start.getFullYear() + boda.years);
        return mark > now;
      });
      const lastBoda = BODAS.slice().reverse().find(function (boda) {
        const mark = new Date(start);
        mark.setFullYear(start.getFullYear() + boda.years);
        return mark <= now;
      });

      const tiny = byId("bodaTiny");
      if (nextBoda) {
        const mark = new Date(start);
        mark.setFullYear(start.getFullYear() + nextBoda.years);
        const left = Math.max(1, Math.ceil((mark - now) / 86400000));
        const unit = nextBoda.years === 1 ? "ano" : "anos";
        setText("bodaEyebrow", "A próxima");
        setText("bodaTitle", "Bodas de " + nextBoda.name);
        setText(
          "bodaText",
          "Faltam " + left + (left === 1 ? " dia" : " dias") + " para celebrarmos " + nextBoda.years + " " + unit + ".",
        );
        if (lastBoda) {
          tiny.hidden = false;
          tiny.textContent = "Já celebrámos as de " + lastBoda.name;
        } else {
          tiny.hidden = true;
          tiny.textContent = "";
        }
      } else {
        setText("bodaEyebrow", "");
        setText("bodaTitle", "Uma vida inteira");
        setText("bodaText", "O ouro já é pouco para o que somos.");
        tiny.hidden = true;
        tiny.textContent = "";
      }
    }

    render();
    setInterval(render, 1000);
  }

  function setupPhotos() {
    const track = byId("galleryTrack");
    const dateLabel = byId("galleryDate");
    const wrap = byId("gallery");
    const cards = [];
    const sources = new WeakMap();
    let index = 0;
    let timer = Date.now();
    const DURATION = 4200;

    function reveal(card) {
      if (!card) return;
      const img = card.querySelector("img");
      if (!img || img.getAttribute("src")) return;
      img.src = sources.get(card);
    }

    function revealAround(center) {
      if (!cards.length) return;
      for (let offset = -1; offset <= 2; offset += 1) {
        reveal(cards[(center + offset + cards.length) % cards.length]);
      }
    }

    function goTo(next, instant) {
      if (!cards.length) return;
      index = (next + cards.length) % cards.length;
      const card = cards[index];
      dateLabel.textContent = card.getAttribute("data-caption") || "";
      cards.forEach(function (item, i) {
        item.classList.toggle("is-on", i === index);
      });
      revealAround(index);
      const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({
        left: Math.max(0, left),
        behavior: instant ? "auto" : "smooth",
      });
      timer = Date.now();
    }

    const photos = CONFIG.photos || [];
    if (photos.length) {
      wrap.classList.add("has-photos");
      photos.forEach(function (photo) {
        const card = document.createElement("figure");
        const img = document.createElement("img");
        card.className = "tj-card";
        card.setAttribute("data-caption", photo.caption);
        sources.set(card, photo.src);
        img.alt = photo.caption;
        img.decoding = "async";
        card.appendChild(img);
        card.addEventListener("click", function () {
          goTo(cards.indexOf(card));
        });
        track.appendChild(card);
        cards.push(card);
      });
      goTo(0, true);
    }

    track.addEventListener("scroll", function () {
      if (!cards.length) return;
      const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      cards.forEach(function (card, i) {
        const box = card.getBoundingClientRect();
        const dist = Math.abs(box.left + box.width / 2 - mid);
        if (dist < best) {
          best = dist;
          nearest = i;
        }
      });
      if (nearest !== index) {
        index = nearest;
        dateLabel.textContent = cards[index].getAttribute("data-caption") || "";
        cards.forEach(function (item, i) {
          item.classList.toggle("is-on", i === index);
        });
        revealAround(index);
        timer = Date.now();
      }
    });

    setInterval(function () {
      if (cards.length > 1 && Date.now() - timer >= DURATION) goTo(index + 1);
    }, 400);
  }

  function setupMusic() {
    const btn = byId("musicBtn");
    const intro = byId("bgMusic");
    const forgive = byId("forgiveMusic");
    const introSrc = CONFIG.music;
    const forgiveSrc = CONFIG.musicForgive;
    let current = "intro";
    let playing = false;
    let generation = 0;

    intro.src = introSrc;
    intro.loop = true;
    forgive.src = forgiveSrc;
    forgive.loop = true;
    btn.hidden = false;

    function hardStop(el) {
      el.pause();
      el.muted = false;
      el.volume = 1;
      try {
        el.currentTime = 0;
      } catch (err) {}
    }

    function setUi() {
      playing = true;
      btn.classList.add("is-on");
      btn.setAttribute("aria-label", "Pausar música");
    }

    function startIntro() {
      const my = ++generation;
      current = "intro";
      hardStop(forgive);
      intro.muted = false;
      intro.volume = 1;
      const request = intro.play();
      if (request) {
        request.then(function () {
          if (my === generation) setUi();
        }).catch(function () {});
      }
    }

    function startForgive() {
      const my = ++generation;
      current = "forgive";
      hardStop(intro);
      forgive.muted = false;
      forgive.volume = 1;
      if (!forgive.getAttribute("src")) forgive.src = forgiveSrc;
      const request = forgive.play();
      if (request) {
        request.then(function () {
          if (my === generation) setUi();
        }).catch(function () {
          forgive.load();
          forgive.play().then(function () {
            if (my === generation) setUi();
          }).catch(function () {});
        });
      }
    }

    function pauseAll() {
      generation += 1;
      hardStop(intro);
      hardStop(forgive);
      playing = false;
      btn.classList.remove("is-on");
      btn.setAttribute("aria-label", "Tocar música");
    }

    btn.addEventListener("click", function () {
      if (playing) {
        pauseAll();
        return;
      }
      if (current === "forgive") startForgive();
      else startIntro();
    });

    byId("enterBtn").addEventListener("click", function () {
      closeGate();
      forgive.muted = true;
      const prime = forgive.play();
      if (prime) {
        prime.then(function () {
          forgive.pause();
          forgive.currentTime = 0;
          forgive.muted = false;
        }).catch(function () {
          forgive.muted = false;
        });
      }
      startIntro();
    });

    return {
      playForgive: startForgive,
    };
  }

  function closeGate() {
    byId("gate").classList.add("is-open");
  }

  function setupForgive(musicPlayer) {
    const yesBtn = byId("yesBtn");
    const noBtn = byId("noBtn");
    let accepted = false;

    function acceptLove(event) {
      if (accepted) return;
      accepted = true;
      if (event) event.preventDefault();
      noBtn.hidden = true;
      byId("forgiveMsg").hidden = false;
      yesBtn.textContent = "Eu também te amo";
      burstHearts();
    }

    yesBtn.addEventListener("click", acceptLove);
    noBtn.addEventListener("click", acceptLove);
  }

  function setupPetals() {
    const canvas = byId("petals");
    const ctx = canvas.getContext("2d");

    function spawn(anywhere) {
      return {
        x: Math.random() * window.innerWidth,
        y: anywhere ? Math.random() * window.innerHeight : -16,
        r: 4 + Math.random() * 7,
        s: 0.4 + Math.random() * 0.9,
        a: Math.random() * Math.PI * 2,
        spin: 0.01 + Math.random() * 0.03,
        tone: Math.random() > 0.5 ? "rgba(243, 201, 197, 0.4)" : "rgba(212, 176, 106, 0.32)",
      };
    }

    for (let i = 0; i < 26; i += 1) petals.push(spawn(true));

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawHeart(x, y, size, color, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size, -size * 0.4, -size * 0.5, -size, 0, -size * 0.45);
      ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.4, 0, size * 0.3);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(function (petal, i) {
        petal.y += petal.s;
        petal.x += Math.sin(petal.a) * 0.4;
        petal.a += petal.spin;
        if (petal.y > canvas.height + 16) petals[i] = spawn(false);
        drawHeart(petal.x, petal.y, petal.r, petal.tone, petal.a);
      });
      requestAnimationFrame(draw);
    }

    burstHearts = function () {
      for (let i = 0; i < 16; i += 1) petals.push(spawn(false));
    };

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  function formatNumber(value) {
    return value.toLocaleString("pt-PT");
  }

  function toWords(value) {
    return numberToWords(value).replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function numberToWords(value) {
    if (value === 0) return "zero";
    const ones = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const teens = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezasseis", "dezassete", "dezoito", "dezanove"];
    const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const hundreds = [
      "",
      "cento",
      "duzentos",
      "trezentos",
      "quatrocentos",
      "quinhentos",
      "seiscentos",
      "setecentos",
      "oitocentos",
      "novecentos",
    ];

    function underThousand(n) {
      if (n === 0) return "";
      if (n === 100) return "cem";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " e " + ones[n % 10] : "");
      return hundreds[Math.floor(n / 100)] + (n % 100 ? " e " + underThousand(n % 100) : "");
    }

    const scales = [
      { n: 1000000000, one: "mil milhões", many: "mil milhões" },
      { n: 1000000, one: "um milhão", many: "milhões" },
      { n: 1000, one: "mil", many: "mil" },
    ];

    let remaining = value;
    const parts = [];
    scales.forEach(function (scale) {
      const amount = Math.floor(remaining / scale.n);
      if (!amount) return;
      if (scale.n === 1000 && amount === 1) parts.push("mil");
      else if (scale.n === 1000000 && amount === 1) parts.push(scale.one);
      else if (scale.n === 1000000000 && amount === 1) parts.push(scale.one);
      else parts.push(underThousand(amount) + " " + scale.many);
      remaining %= scale.n;
    });
    if (remaining) parts.push(underThousand(remaining));
    return parts.join(" ");
  }
});
