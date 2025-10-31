
let nocurrentmarker = true;
let nocurrentlocation = true;
let guesslat = 0;
let guesslong = 0;
let reallat = 0;
let reallng = 0;
let realtime = 0;
let roundnum = 0;
let indexarray = [];
let totalpoints = 0;
let loc = null;
let gameover = false;
let hasguessed = false;

$("#guess").show();
$("#next-round").hide();
$(".gameover").hide();

document.addEventListener("DOMContentLoaded", () => {
  const rangeSlider = document.getElementById("rs-range-line");
  const rangeBullet = document.getElementById("rs-bullet");
  if (!rangeSlider || !rangeBullet) return;

  function getThumbWidthPx(el) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--thumb-w').trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 22; // fallback
  }

  function setBullet() {
    const min = Number(rangeSlider.min || 0);
    const max = Number(rangeSlider.max || 100);
    const val = Number(rangeSlider.value || min);
    const t = (max === min) ? 0 : (val - min) / (max - min); // 0..1
  
    const trackRect = rangeSlider.getBoundingClientRect();
    const containerRect = rangeSlider.parentElement.getBoundingClientRect();
    const containerX = trackRect.left - containerRect.left;   // input's left inside .range-slider
  
    // sizes
    const trackW = rangeSlider.clientWidth;
    const thumbW = (() => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--thumb-w').trim();
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : 22;
    })();
  
    // center of thumb relative to the input's left edge
    const xWithinInput = t * (trackW - thumbW) + thumbW / 2;
  
    // final left relative to .range-slider
    const finalLeft = containerX + xWithinInput;
  
    rangeBullet.textContent = val;
    rangeBullet.style.left = finalLeft + "px";
  }

  rangeSlider.addEventListener("input", setBullet);
  rangeSlider.addEventListener("change", setBullet);
  window.addEventListener("resize", setBullet);
  setBullet(); // init

  //Code for zooming into photo
  const baseImg = document.getElementById("display");
  if (!baseImg) return;

  baseImg.addEventListener("click", () => {
    // Build overlay structure
    const overlay = document.createElement("div");
    overlay.className = "zoom-overlay";

    const viewport = document.createElement("div");
    viewport.className = "zoom-viewport";

    const clone = baseImg.cloneNode();
    clone.removeAttribute("id");
    clone.className = "zoom-image";

    viewport.appendChild(clone);
    overlay.appendChild(viewport);
    document.body.appendChild(overlay);

    // Close on background click or Esc
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    const onKey = (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        window.removeEventListener("keydown", onKey);
      }
    };
    window.addEventListener("keydown", onKey);

    // Helper: initialize Panzoom AFTER the image has real dimensions
    const initPanzoom = () => {
      const pz = Panzoom(clone, {
        maxScale: 5,
        minScale: 1,
        contain: "outside",   // allow zoom beyond the viewport edges
        animate: true
      });

      // Wheel/pinch to zoom
      viewport.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          pz.zoomWithWheel(e);
        },
        { passive: false }
      );

      // Double-click to zoom toward the pointer
      clone.addEventListener("dblclick", (e) => {
        const rect = clone.getBoundingClientRect();
        pz.zoomIn({
          animate: true,
          focal: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        });
      });

      // Start centered & fully visible
      pz.reset({ animate: false });
    };

    // If the clone is already cached/loaded, init immediately; otherwise wait
    if (clone.complete && clone.naturalWidth > 0) {
      initPanzoom();
    } else {
      clone.addEventListener("load", initPanzoom, { once: true });
      // If something fails to load, fail-safe close overlay
      clone.addEventListener("error", () => overlay.remove(), { once: true });
    }
  });

});

var greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const map = L.map("map", {
  center: [0, 0],
  zoom: 0,
  maxBounds: [[-85, -180], [85, 180]],   // constrain panning
  maxBoundsViscosity: 1.0,               // hard clamp at bounds
});
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  noWrap: true,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  minZoom: 2,
  maxBounds: [
    [-85, -180.0],
    [85, 180.0],
  ],
}).addTo(map);

window.addEventListener("resize", () => {
  if (window.map && typeof map.invalidateSize === "function") {
    map.invalidateSize();
  }
});

document.getElementById("display").addEventListener("load", () => {
  setTimeout(() => map.invalidateSize(), 0);
});
// var marker = L.marker([51.5, -0.09]).addTo(map);
// longitude = (longitude % 360 + 540) % 360 - 180
var popup = L.popup();
$("#next-round").hide();
$(".gameover").hide();

$.ajax({
  url: "/generaterounds",
  type: "GET",
  data: null,
  success: function (data) {
    indexarray = data.indexarray;
    console.log(indexarray);
    onRoundStart();
  },
  dataType: "json",
});

function onRoundStart() {
  console.log(indexarray[roundnum]);
  $.ajax({
    url: "/getinfo",
    type: "GET",
    data: { index: indexarray[roundnum] },
    success: function (data) {
      reallat = data.lat;
      reallng = data.lng;
      realtime = data.tme;
      display.src = "images/optimized/" + data.file.replace(/\.(png|jpe?g)$/i, ".webp");
    },
    dataType: "json",
  });
}

function onMapClick(e) {
  if (nocurrentmarker) {
    marker = new L.marker(e.latlng, {
      draggable: true,
      autoPan: true,
    });
    nocurrentmarker = false;
    guesslat = e.latlng.lat;
    guesslong = e.latlng.lng;
  }
  map.removeLayer(marker);
  marker = new L.marker(e.latlng, {
    draggable: true,
    autoPan: true,
  });
  guesslat = e.latlng.lat;
  guesslong = e.latlng.lng;

  marker.on("dragend", function (event) {
    var marker = event.target;
    var position = marker.getLatLng();
    marker.setLatLng(new L.LatLng(position.lat, position.lng), {
      draggable: "true",
    });
    map.panTo(new L.LatLng(position.lat, position.lng));
    var position = new L.LatLng(position.lat, position.lng);
    guesslat = position.lat;
    guesslong = position.lng;
    console.log(e.latlng.lat);
    console.log(e.latlng.lng);
  });
  map.addLayer(marker);
}


function onspace(e) {
  var key = e.originalEvent.keyCode;
  if (key === 32) {
    console.log("works");
    map.removeLayer(marker);
    nocurrentmarker = true;
  }
}
map.on("click", onMapClick);
map.on("keypress", onspace);

function submittedguess() {
  if (nocurrentmarker || gameover) return;

  const sliderEl = document.getElementById("rs-range-line");
  const d = map.distance([reallat, reallng], [guesslat, guesslong]) / 1000;
  const t = Math.abs(realtime - Number(sliderEl ? sliderEl.value : realtime));

  $.ajax({
    url: "/calcpoints",
    type: "GET",
    data: { distanceoff: d, timeoff: t },
    success: function (data) {
      if (!hasguessed) {
        loc = new L.marker([reallat, reallng], { icon: greenIcon }).addTo(map);
        $("#roundinfo").html(
          "Location: " + data.pointsD + "/5000  | Year: " + data.pointsT + "/5000" +
          "<br>" + Math.floor(d) + " km off | " + t + " years off (" + realtime + ")"
        );

        // guard against NaN from server (if t was undefined)
        const dPts = Number.isFinite(data.pointsD) ? data.pointsD : 0;
        const tPts = Number.isFinite(data.pointsT) ? data.pointsT : 0;
        totalpoints += dPts + tPts;

        $("#totalpoints").text(
          "points total = " + totalpoints + " round " + (roundnum + 1) + "/5"
        );
        $("#guess").hide();
        $("#next-round").show();
        hasguessed = true;
      }
    },
    dataType: "json",
  });
}
function movetonextround() {
  if (roundnum < 4) {
    roundnum++;
    $("#totalpoints").text(
      "points total = " + totalpoints + " round " + (roundnum + 1) + "/5"
    );
    hasguessed = false;
    onRoundStart();
  } else {
    gameover = true;
    $(".entiregame").hide();
    $("#gameover").text("Final Score: " + totalpoints + "/50000");
    $(".gameover").show();
  }

  $("#roundinfo").text("");

  if (typeof marker !== "undefined" && map.hasLayer(marker)) {
    map.removeLayer(marker);
  }
  nocurrentmarker = true;

  if (typeof loc !== "undefined" && map.hasLayer(loc)) {
    map.removeLayer(loc);
  }

  $("#next-round").hide();
  $("#guess").show();
}

function gohome() {
  $.ajax({
    url: "/uploadscore",
    type: "POST",
    data: { score: Number(totalpoints), name: $("#name").val() },
  })
  .always(function() {
    // Redirect whether success or error, so the button always works
    window.location.assign("/");
  });
}