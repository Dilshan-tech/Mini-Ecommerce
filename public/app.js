const apiBase = "/products";

const form = document.getElementById("product-form");
const idInput = document.getElementById("product-id");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const imageUrlInput = document.getElementById("imageUrl");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const productsList = document.getElementById("products-list");
const productsCount = document.getElementById("products-count");
const emptyState = document.getElementById("empty-state");
const toastEl = document.getElementById("toast");
const userIndicator = document.getElementById("user-indicator");

function updateUserIndicator() {
  if (!userIndicator) return;

  const name = localStorage.getItem("loggedInUserName");
  const email = localStorage.getItem("loggedInUserEmail");

  if (name) {
    userIndicator.textContent = `Logged in as ${name}`;
  } else if (email) {
    userIndicator.textContent = `Logged in as ${email}`;
  } else {
    userIndicator.textContent = "Guest user";
  }
}

async function fetchProducts() {
  try {
    const res = await fetch(apiBase);

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    showToast("Could not load products", true);
  }
}

function renderProducts(products) {
  productsList.innerHTML = "";

  if (!products.length) {
    productsCount.textContent = "0 items";
    emptyState.classList.remove("hidden");
    return;
  }

  productsCount.textContent =
    products.length === 1 ? "1 item" : `${products.length} items`;
  emptyState.classList.add("hidden");

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "product-image-wrapper";

    if (product.imageUrl) {
      const img = document.createElement("img");
      img.className = "product-image";
      img.src = product.imageUrl;
      img.alt = product.name || "Product image";
      img.onerror = () => {
        img.remove();
        const fallback = document.createElement("div");
        fallback.className = "product-image-fallback";
        fallback.textContent = "Image not available";
        imageWrapper.appendChild(fallback);
      };
      imageWrapper.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "product-image-fallback";
      fallback.textContent = "No image";
      imageWrapper.appendChild(fallback);
    }

    const body = document.createElement("div");
    body.className = "product-body";

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.name;

    const meta = document.createElement("div");
    meta.className = "product-meta";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = `₹${Number(product.price).toLocaleString("en-IN")}`;

    const id = document.createElement("span");
    id.className = "product-id";
    id.textContent = `#${product.id}`;

    meta.appendChild(price);
    meta.appendChild(id);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn ghost small";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(product));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn danger small";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handleDelete(product.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(actions);

    card.appendChild(imageWrapper);
    card.appendChild(body);
    productsList.appendChild(card);
  });
}

function resetForm() {
  idInput.value = "";
  nameInput.value = "";
  priceInput.value = "";
  imageUrlInput.value = "";
  submitBtn.textContent = "Add Product";
}

function startEdit(product) {
  idInput.value = product.id;
  nameInput.value = product.name;
  priceInput.value = product.price;
  imageUrlInput.value = product.imageUrl || "";
  submitBtn.textContent = "Update Product";
}

async function handleSubmit(event) {
  event.preventDefault();

  const id = idInput.value.trim();
  const name = nameInput.value.trim();
  const price = priceInput.value;
  const imageUrl = imageUrlInput.value.trim();

  if (!name || price === "") {
    showToast("Please enter name and price", true);
    return;
  }

  const payload = { name, price, imageUrl };

  try {
    const isEdit = Boolean(id);

    const url = isEdit ? `${apiBase}/${id}` : apiBase;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data && data.message ? data.message : "Request failed";
      throw new Error(message);
    }

    showToast(isEdit ? "Product updated" : "Product added");
    resetForm();
    fetchProducts();
  } catch (err) {
    showToast(err.message || "Something went wrong", true);
  }
}

async function handleDelete(id) {
  const confirmDelete = window.confirm("Delete this product?");

  if (!confirmDelete) {
    return;
  }

  try {
    const res = await fetch(`${apiBase}/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data && data.message ? data.message : "Delete failed";
      throw new Error(message);
    }

    showToast("Product deleted");
    fetchProducts();
  } catch (err) {
    showToast(err.message || "Could not delete product", true);
  }
}

let toastTimeoutId;

function showToast(message, isError) {
  if (!toastEl) {
    return;
  }

  toastEl.textContent = message;
  toastEl.classList.toggle("toast-error", Boolean(isError));
  toastEl.classList.add("show");

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2200);
}

form.addEventListener("submit", handleSubmit);

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

fetchProducts();
updateUserIndicator();
