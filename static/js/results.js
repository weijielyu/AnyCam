// Result videos are hosted on Hugging Face (wlyu/AnyCam_website). Clips and captions = the supplementary video.
const BASE = "https://huggingface.co/wlyu/AnyCam_website/resolve/main/videos/";
const RESULTS = {
  v2v: [
    ["v2v/planes-water", "Orbit 60 degrees around the plane in a video"],
    ["v2v/train", "Orbit left 60 degrees around the model railway"],
    ["v2v/loading", "Rise 60 degrees above the shelf while two men load a TV box"],
  ],
  i2v: [
    ["i2v/garden", "From a single image, orbit 174 degrees around the table"],
    ["i2v/flowers", "Orbit 178 degrees around a round flower bed from a single photo"],
    ["i2v/bench", "Orbit from the side of a park bench to its front from a single photo"],
    ["i2v/handbag", "Orbit around a handbag from a single photo, against 3D reconstruction methods"],
  ],
  long: [
    ["long/cellphone", "333 frames around the phone and back"],
  ],
  switch: [
    ["switch/cars", "When the silver car leaves the view, we switch to the red car and keep controlling the camera"],
    ["switch/chair-car", "When the chair leaves the view, we switch to the sports car and keep controlling the camera"],
    ["switch/desk-chair", "We switch from the desk to the chair and keep controlling the camera, now orbiting the other way"],
  ],
  multi: [
    ["anchor/camera", "Push in on either camera, or pull back from the armchair"],
    ["anchor/gaming", "Orbit the gaming chair, or push in toward the PC tower"],
    ["anchor/candle", "Orbit the armchair, or rise above the side table"],
    ["anchor/pinkb", "Orbit left around the telephone, or right around the perfume bottle"],
  ],
  demo: [
    ["demo/counter", "Counter (Mip-NeRF 360): select the oven mitt, then scroll to zoom in"],
    ["demo/garden", "Garden (Mip-NeRF 360): select the table, then drag to orbit around it"],
  ],
};

function makeVideo(key) {
  const v = document.createElement("video");
  v.className = "lazy-video";
  v.dataset.src = key;
  v.width = 100;
  v.style.width = "100%";
  return v;
}

document.querySelectorAll("[data-results]").forEach(box => {
  const items = RESULTS[box.dataset.results] || [];
  const track = document.createElement("div");
  track.className = "rc-track";
  items.forEach(([key, cap]) => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.appendChild(makeVideo(key));
    const p = document.createElement("p");
    p.className = "result-caption";
    p.textContent = cap;
    item.appendChild(p);
    track.appendChild(item);
  });
  box.classList.add("rc");
  box.appendChild(track);
  if (items.length < 2) return;
  // left / right buttons and dots; the track also scrolls by swipe or trackpad
  const go = i => track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  const cur = () => Math.round(track.scrollLeft / track.clientWidth);
  const prev = document.createElement("button"), next = document.createElement("button");
  prev.className = "rc-btn rc-prev"; prev.textContent = "\u2039"; prev.setAttribute("aria-label", "Previous");
  next.className = "rc-btn rc-next"; next.textContent = "\u203A"; next.setAttribute("aria-label", "Next");
  prev.onclick = () => go((cur() - 1 + items.length) % items.length);
  next.onclick = () => go((cur() + 1) % items.length);
  box.appendChild(prev); box.appendChild(next);
  const dots = document.createElement("div");
  dots.className = "rc-dots";
  items.forEach((_, i) => { const d = document.createElement("button"); d.setAttribute("aria-label", "Example " + (i + 1)); d.onclick = () => go(i); dots.appendChild(d); });
  box.appendChild(dots);
  const mark = () => dots.querySelectorAll("button").forEach((d, i) => d.classList.toggle("on", i === cur()));
  track.addEventListener("scroll", () => requestAnimationFrame(mark)); mark();
});

// src is set from JS; load when near the viewport, pause when off screen (mobile-friendly).
const videos = document.querySelectorAll("video.lazy-video");
videos.forEach(v => {
  v.muted = true; v.loop = true; v.playsInline = true;
  v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("loop", "");
  v.preload = "none";
  v.poster = BASE + v.dataset.src + ".jpg";
});
function load(v) {
  if (!v.dataset.loaded) { v.src = BASE + v.dataset.src + ".mp4"; v.dataset.loaded = "1"; }
  const p = v.play(); if (p && p.catch) p.catch(() => {});
}
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) load(e.target); else if (e.target.dataset.loaded) e.target.pause(); });
  }, { rootMargin: "300px 0px", threshold: 0.3 });
  videos.forEach(v => io.observe(v));
} else {
  videos.forEach(load);
}

// Method figures: show the still by default, play the matching animation on hover (tap on touch screens).
document.querySelectorAll(".hover-fig").forEach(box => {
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.loop = false; v.preload = "none";   // builds play once and hold the last frame
  v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
  box.appendChild(v);
  const show = () => {
    if (!v.src) v.src = BASE + box.dataset.src + ".mp4";
    v.currentTime = 0; box.classList.add("playing");
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  };
  const hide = () => { box.classList.remove("playing"); v.pause(); };
  box.addEventListener("mouseenter", show);
  box.addEventListener("mouseleave", hide);
  box.addEventListener("click", () => (box.classList.contains("playing") ? hide() : show()));
});
