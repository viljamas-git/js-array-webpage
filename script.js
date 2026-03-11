// Cache the core DOM nodes once so event handlers can reuse them efficiently.
const currentImageEl = document.getElementById("currentImage");
const newImageBtn = document.getElementById("newImageBtn");
const assignmentForm = document.getElementById("assignmentForm");
const emailInput = document.getElementById("emailInput");
const formMessage = document.getElementById("formMessage");
const assignmentsContainer = document.getElementById("assignmentsContainer");
const assignmentCount = document.getElementById("assignmentCount");

// Store assignments as: email -> array of assigned image URLs.
const assignments = new Map();

// Build a unique Picsum URL by using a random UUID as the seed.
function getNewImageUrl() {
  return `https://picsum.photos/seed/${crypto.randomUUID()}/900/520`;
}

// Render form feedback text and optionally tag it as success or error.
function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = "form-message";
  if (type) {
    formMessage.classList.add(type);
  }
}

// Swap the current preview image for a newly generated random URL.
function loadNextImage() {
  currentImageEl.src = getNewImageUrl();
}

// Perform lightweight email validation before creating an assignment.
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Rebuild the assignments section so UI always matches in-memory state.
function renderAssignments() {
  assignmentsContainer.innerHTML = "";

  // Show an empty-state helper when no email has assignments yet.
  if (assignments.size === 0) {
    assignmentsContainer.innerHTML =
      '<p class="empty-state">No assignments yet. Link the current image to an email address to get started.</p>';
    assignmentCount.textContent = "0 emails";
    return;
  }

  // Keep the summary pill in sync with the number of unique email keys.
  assignmentCount.textContent = `${assignments.size} email${assignments.size === 1 ? "" : "s"}`;

  // Render one card per email and include all image thumbnails for that email.
  for (const [email, images] of assignments.entries()) {
    const card = document.createElement("article");
    card.className = "email-card";

    const title = document.createElement("h3");
    title.textContent = email;

    const imageCount = document.createElement("p");
    imageCount.className = "image-count";
    imageCount.textContent = `${images.length} image${images.length === 1 ? "" : "s"}`;

    const thumbGrid = document.createElement("div");
    thumbGrid.className = "thumb-grid";

    for (const imageUrl of images) {
      const thumb = document.createElement("img");
      thumb.src = imageUrl;
      thumb.alt = `Assigned image for ${email}`;
      thumb.loading = "lazy";
      thumbGrid.appendChild(thumb);
    }

    card.append(title, imageCount, thumbGrid);
    assignmentsContainer.appendChild(card);
  }
}

// Handle form submission by validating email and saving current image URL.
function assignCurrentImageToEmail(event) {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();

  if (!isValidEmail(email)) {
    showMessage("Enter a valid email address before assigning an image.", "error");
    return;
  }

  // Initialize an image list for first-time emails.
  if (!assignments.has(email)) {
    assignments.set(email, []);
  }

  // Record assignment, refresh UI, and queue the next image for convenience.
  assignments.get(email).push(currentImageEl.src);
  showMessage(`Assigned image to ${email}.`, "success");
  emailInput.value = "";
  renderAssignments();
  loadNextImage();
}

// Wire up user interactions and render initial state on first load.
newImageBtn.addEventListener("click", loadNextImage);
assignmentForm.addEventListener("submit", assignCurrentImageToEmail);

loadNextImage();
renderAssignments();
