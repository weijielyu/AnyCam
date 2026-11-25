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
  anchor: [
    ["anchor/camera", "Push in on either camera, or pull back from the armchair"],
    ["anchor/gaming", "Orbit the gaming chair, or push in toward the PC tower"],
    ["anchor/candle", "Orbit the armchair, or rise above the side table"],
    ["anchor/pinkb", "Orbit left around the telephone, or right around the perfume bottle"],
  ],
  switch: [
    ["switch/cars", "When the silver car leaves the view, we switch to the red car and keep controlling the camera"],
    ["switch/chair-car", "When the chair leaves the view, we switch to the sports car and keep controlling the camera"],
    ["switch/desk-chair", "We switch from the desk to the chair and keep controlling the camera, now orbiting the other way"],
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
  (RESULTS[box.dataset.results] || []).forEach(([key, cap]) => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.appendChild(makeVideo(key));
    const p = document.createElement("p");
    p.className = "result-caption";
    p.textContent = cap;
    item.appendChild(p);
    box.appendChild(item);
  });
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
  }, { rootMargin: "300px 0px" });
  videos.forEach(v => io.observe(v));
} else {
  videos.forEach(load);
}
