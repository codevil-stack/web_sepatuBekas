let currentProduct = "";
let currentIndex = 0;
let images = [];
let selectedProduct = null;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartOpen = false;
let waLink = "";

// modal global masalah z tabrakan
function closeAllModals() {
  closeCart();
  closeCheckout();
  closeQRIS?.();
  closeSuccess?.();
}

document.addEventListener("click", (e) => {
  console.log("klik:", e.target);
});

function openModal(name, price, imgs, size, condition, note) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");

  modal.classList.remove("pointer-events-none");

  setTimeout(() => {
    modal.classList.remove("opacity-0");
    content.classList.remove("scale-95", "opacity-0");
  }, 10);

  //  SIMPAN PRODUK YANG DIPILIH (INI KUNCI NYA)
  selectedProduct = {
    id: name, // sementara pake name id
    name,
    price,
    imgs,
    size,
    condition,
    note
  };

  // isi modal
  document.getElementById("modalTitle").innerText = name;
  document.getElementById("modalPrice").innerText = "Rp " + price.toLocaleString();
  document.getElementById("modalSize").innerText = "Size: " + size;
  document.getElementById("modalCondition").innerText = "Condition: " + condition;
  document.getElementById("modalNote").innerText = "Note: " + note;

  images = imgs;
  currentIndex = 0;

  renderSlider();
  attachSwipe();
}

// add chart
function addToCart() {
  const product = selectedProduct;

  const existing = cart.find(
    item => item.id === product.id && item.size === product.size
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      ...product,
      qty: 1
    });
  }

  saveCart();
  renderCart();
  updateCartBadge();

  closeModal(); // INI KUNCINYA
}

// 1. DI FUNGSI OPEN CART
function openCart() {
  const drawer = document.getElementById("cartDrawer");
  const content = document.getElementById("cartContent");

  drawer.classList.remove("pointer-events-none");
  drawer.classList.remove("opacity-0");

  // UBAH DARI translate-y-0 JADI translate-x-0
  content.classList.remove("translate-x-full");
  content.classList.add("translate-x-0");

  cartOpen = true;
}

// 2. DI FUNGSI CLOSE CART
function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  const content = document.getElementById("cartContent");

  drawer.classList.add("opacity-0");
  drawer.classList.add("pointer-events-none");

  // UBAH DARI translate-y-full JADI translate-x-full
  content.classList.remove("translate-x-0");
  content.classList.add("translate-x-full");

  cartOpen = false;
}

// render cart
function renderCart() {
  const container = document.getElementById("cartDrawerItems");
  const totalEl = document.getElementById("cartTotal");

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-sm text-gray-500">Cart kosong !</p>`;
    totalEl.innerText = "Total: Rp 0";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    container.innerHTML += `
      <div class="flex items-center justify-between border-b pb-2">

        <div class="flex items-top gap-2">
          <img src="${item.imgs?.[0] || 'img/default.jpg'}"
               class="w-[150px] h-[150px] object-cover rounded">

          <div class="p-2 text-top">
            <p class="font-semibold">${item.name}</p>
            <p class="text-sm text-gray-500 pt-4">Size ${item.size}</p>
            <p class="text-sm">Rp ${subtotal.toLocaleString()}</p>

            <!--  qty control -->
            <div class="flex items-center gap-2 pt-8">
              <button onclick="decreaseQty(${index})"
                class="px-4 bg-gray-200 rounded">-</button>

              <span>${item.qty}</span>

              <button onclick="increaseQty(${index})"
                class="px-4 bg-gray-200 rounded">+</button>
            </div>
          </div>
        </div>

        <!--  tombol hapus -->
        <button onclick="removeFromCart(${index})"
          class="text-red-500 hover:text-red-700 text-sm">
          Hapus
        </button>

      </div>
    `;
  });

  totalEl.innerText = "Total: Rp " + total.toLocaleString();
}

//qty
function increaseQty(index) {
  cart[index].qty++;
  saveCart();
  renderCart();
  updateCartBadge();
}

function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty--;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
  updateCartBadge();
}

// cart badge
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");

  const total = cart.reduce((sum, item) => sum + item.qty, 0);

  if (total > 0) {
    badge.innerText = total;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// simpan cart
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

renderCart();
updateCartBadge();

// tombol hapus
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart(); // penting
  renderCart();
  updateCartBadge();
}

// open checkout
function openCheckout() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong");
    return;
  }

  const modal = document.getElementById("checkoutModal");
  const content = document.getElementById("checkoutContent");

  // show modal container
  modal.classList.remove("pointer-events-none");

  // trigger animation
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    content.classList.remove("scale-95", "opacity-0");
  }, 10);

  // auto focus input
  setTimeout(() => {
    document.getElementById("checkoutName").focus();
  }, 200);
}

// close ceckout
function closeCheckout() {
  const modal = document.getElementById("checkoutModal");
  const content = document.getElementById("checkoutContent");

  modal.classList.add("opacity-0");
  content.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.add("pointer-events-none"); // 🔥 INI KUNCI
  }, 300);
}

function checkoutWA() {
  const name = document.getElementById("checkoutName").value;
  const address = document.getElementById("checkoutAddress").value;
  const note = document.getElementById("checkoutNote").value;

  if (!name || !address) {
    alert("Nama & alamat wajib diisi!");
    return;
  }

  let message = `Halo, saya ${name} mau order:%0A%0A`;
  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    message += `- ${item.name} (Size ${item.size}) x${item.qty} - Rp ${subtotal.toLocaleString()}%0A`;
  });

  message += `%0AAlamat: ${address}%0A`;
  message += `%0A--------------------%0A`;
  message += `Total: Rp ${total.toLocaleString()}`;
  message += `📝 Catatan: ${note}\n\n`;


  const url = `https://wa.me/6288971827752?text=${message}`;
  window.open(url, "_blank");

  // reset cart
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  closeCheckout();
  closeCart();

  // ✨ reset form
  document.getElementById("checkoutName").value = "";
  document.getElementById("checkoutAddress").value = "";
}

setTimeout(() => {
  document.getElementById("checkoutName").focus();
}, 100);

// cekout qris
function checkoutQRIS() {
  closeCheckout();
  closeCart();

  const modal = document.getElementById("qrisModal");
  const content = document.getElementById("qrisContent");

  // 🔥 RESET STATE (ini penting banget)
  modal.classList.remove("pointer-events-none", "opacity-0");

  setTimeout(() => {
    content.classList.remove("opacity-0", "scale-95");
  }, 50);
}

// closeqris
function closeQRIS() {
  const modal = document.getElementById("qrisModal");
  const content = document.getElementById("qrisContent");

  content.classList.add("opacity-0", "scale-95");

  setTimeout(() => {
    modal.classList.add("opacity-0", "pointer-events-none"); // 🔥 WAJIB
  }, 300);
}

// cekout qris - langsung nginfo ke wa
function confirmQRIS() {
  const name = document.getElementById("checkoutName").value;
  const address = document.getElementById("checkoutAddress").value;
  const note = document.getElementById("checkoutNote").value;

  // ✅ validasi dulu
  if (!name || !address) {
    alert("Nama & alamat wajib diisi bang ");
    return;
  }

  closeQRIS();
  showLoading();

  const phone = "6288971827752";

  let message = `Halo, saya sudah melakukan pembayaran QRIS.\n\n`;
  message += `📦 Detail Pesanan:\n`;

  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    message += `${i + 1}. ${item.name}\n`;
    message += `Size: ${item.size}\n`;
    message += `Qty: ${item.qty}\n`;
    message += `Subtotal: Rp ${subtotal.toLocaleString()}\n\n`;
  });

  message += `💰 Total: Rp ${total.toLocaleString()}\n\n`;
  message += `👤 Nama: ${name}\n`;
  message += `📍 Alamat: ${address}\n\n`;
  message += `📝 Catatan: ${note}\n\n`;
  message += `Saya akan kirim bukti pembayaran ya 🙏`;

  waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // ⏳ simulasi proses
  setTimeout(() => {
    hideLoading();
    openSuccess(); //  cukup ini aja
  }, 2000);
}

function openSuccess() {
  const modal = document.getElementById("successModal");
  const content = document.getElementById("successContent");

  modal.classList.remove("opacity-0", "pointer-events-none");
  content.classList.remove("opacity-0", "scale-95");
  content.classList.add("scale-100");
}

// close sukses
function closeSuccess() {
  const modal = document.getElementById("successModal");
  const content = document.getElementById("successContent");

  content.classList.add("opacity-0", "scale-95");

  setTimeout(() => {
    modal.classList.add("opacity-0", "pointer-events-none");
  }, 200);
}

// fungsi ke wa
function goToWhatsApp() {
  if (waLink) {
    window.open(waLink, "_blank");
  }

  closeSuccess();

  // reset cart setelah kirim
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
}

// buat loading ala ala
function showLoading() {
  const modal = document.getElementById("loadingModal");
  modal.classList.remove("opacity-0", "pointer-events-none");
}

function hideLoading() {
  const modal = document.getElementById("loadingModal");
  modal.classList.add("opacity-0", "pointer-events-none");
}

function renderSlider() {
  const slider = document.getElementById("slider");
  const dots = document.getElementById("dots");

  slider.innerHTML = "";
  dots.innerHTML = "";

  images.forEach((img, i) => {
    const image = document.createElement("img");
    image.src = img;
    image.className = "w-full h-full object-cover flex-shrink-0";
    image.loading = i === 0 ? "eager" : "lazy"; //  hanya gambar pertama yang langsung load

    slider.appendChild(image);

    const dot = document.createElement("div");
    dot.className = "w-2 h-2 rounded-full " + (i === 0 ? "bg-black" : "bg-gray-300");

    dots.appendChild(dot);
  });

  updateSlide();
}

function updateSlide() {
  const slider = document.getElementById("slider");
  const dots = document.getElementById("dots").children;

  slider.style.transform = `translateX(-${currentIndex * 100}%)`;

  [...dots].forEach((dot, i) => {
    dot.className = "w-2 h-2 rounded-full " + (i === currentIndex ? "bg-black" : "bg-gray-300");
  });
}

function nextSlide() {
  if (currentIndex < images.length - 1) {
    currentIndex++;
    updateSlide();
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex--;
    updateSlide();
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");

  modal.classList.add("opacity-0");
  content.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.add("pointer-events-none");
  }, 300);
}

function orderWA() {
  const phone = "6281234567890";
  const message = "Halo, saya mau order: " + currentProduct;

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
}



let swipeAttached = false;

function attachSwipe() {
  if (swipeAttached) return; // biar gak nambah terus

  const sliderEl = document.getElementById("slider");

  let startX = 0;
  let isDragging = false;

  sliderEl.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  sliderEl.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    const moveX = e.touches[0].clientX;
    const diff = startX - moveX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < images.length - 1) {
        currentIndex++;
      } else if (diff < 0 && currentIndex > 0) {
        currentIndex--;
      }

      updateSlide();
      isDragging = false;
    }
  });

  swipeAttached = true;
}

// show hidden
const btn = document.getElementById('loadMoreBtn');
const allProducts = document.querySelectorAll('.product');

let index = 0;
const step = 4;

btn.addEventListener('click', () => {

  let shown = 0;

  for (let i = 0; i < allProducts.length; i++) {

    if (allProducts[i].classList.contains('hidden')) {

      allProducts[i].classList.remove('hidden');

      //  trigger animasi
      allProducts[i].classList.add('animate-fadeUp');

      shown++;
    }

    if (shown >= step) break;
  }

  if (document.querySelectorAll('.product.hidden').length === 0) {
    btn.style.display = 'none';
  }

});

// slide gambar
let slideIndex = 0;

function autoSlide() {
  const track = document.getElementById("sliderTrack");
  const slides = track.children;

  slideIndex++;

  if (slideIndex >= slides.length) {
    slideIndex = 0;
  }

  track.style.transform = `translateX(-${slideIndex * 100}%)`;
}

setInterval(autoSlide, 3000);

// fade up hero
window.addEventListener("load", () => {
  const hero = document.getElementById("heroContent");

  setTimeout(() => {
    hero.classList.remove("opacity-0", "translate-y-6");
  }, 150);
});

// AOS
if (typeof AOS !== "undefined") {
  AOS.init({
    duration: 1000,
    once: true,
    easing: 'ease-out-cubic'
  });
}

lucide.createIcons();
