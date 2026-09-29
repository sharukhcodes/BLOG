// public/script.js
// One script shared by index.html, add.html and edit.html.
// At the bottom we check which page we are on and run the matching code.

const API_URL = '/api/posts';

// ---------- Helpers ----------

// Wrapper around fetch(): sends the request, reads the JSON reply and
// throws an Error (with the server's message) if the status is not 2xx.
async function request(url, options) {
  const response = await fetch(url, options);
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // the reply had no JSON body - that's okay
  }
  if (!response.ok) {
    throw new Error((data && data.message) || 'Something went wrong');
  }
  return data;
}

// Shows a message box (type is "error" or "success").
function showMessage(text, type) {
  const box = document.getElementById('message');
  box.textContent = text;              // textContent is safe from HTML injection
  box.className = 'message ' + type;
}

// Turns a date string from MongoDB into something readable.
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Reads the three form fields and checks none of them is empty.
// Returns the data object, or null (after showing an error).
function readForm(form) {
  const data = {
    title: form.elements.title.value.trim(),
    author: form.elements.author.value.trim(),
    content: form.elements.content.value.trim(),
  };
  if (!data.title || !data.author || !data.content) {
    showMessage('Please fill in the title, author and content.', 'error');
    return null;
  }
  return data;
}

// ---------- Home page: show all posts ----------

// Builds one blog card. We create elements with textContent (not innerHTML)
// so that anything a user types can never run as code.
function createCard(post) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h2');
  title.textContent = post.title;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = 'By ' + post.author + ' on ' + formatDate(post.createdAt);

  const content = document.createElement('p');
  content.className = 'card-content';
  content.textContent = post.content;

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editLink = document.createElement('a');
  editLink.className = 'btn btn-outline';
  editLink.href = 'edit.html?id=' + post._id;
  editLink.textContent = 'Edit';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-danger';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deletePost(post._id, post.title));

  actions.append(editLink, deleteButton);
  card.append(title, meta, content, actions);
  return card;
}

async function loadPosts() {
  const list = document.getElementById('posts');
  try {
    const posts = await request(API_URL);
    list.innerHTML = '';

    if (posts.length === 0) {
      list.innerHTML =
        '<div class="empty">No posts yet. <a href="add.html">Write the first one</a>.</div>';
      return;
    }
    posts.forEach((post) => list.appendChild(createCard(post)));
  } catch (err) {
    showMessage('Could not load posts: ' + err.message, 'error');
  }
}

async function deletePost(id, title) {
  // confirm() shows a browser popup; it returns false if the user clicks Cancel.
  if (!confirm('Delete "' + title + '"? This cannot be undone.')) return;

  try {
    await request(API_URL + '/' + id, { method: 'DELETE' });
    showMessage('Post deleted.', 'success');
    loadPosts(); // refresh the list
  } catch (err) {
    showMessage('Could not delete the post: ' + err.message, 'error');
  }
}

// ---------- Add page: create a post ----------

function setupAddForm(form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // stop the browser from reloading the page
    const data = readForm(form);
    if (!data) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await request(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      window.location.href = 'index.html'; // go back to the home page
    } catch (err) {
      showMessage('Could not save the post: ' + err.message, 'error');
      button.disabled = false;
    }
  });
}

// ---------- Edit page: load a post and update it ----------

async function setupEditForm(form) {
  // The post id comes from the URL: edit.html?id=<id>
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    showMessage('No post selected. Go back and click Edit on a post.', 'error');
    form.classList.add('hidden');
    return;
  }

  // 1. Load the existing post and fill the form
  try {
    const post = await request(API_URL + '/' + id);
    form.elements.title.value = post.title;
    form.elements.author.value = post.author;
    form.elements.content.value = post.content;
  } catch (err) {
    showMessage('Could not load the post: ' + err.message, 'error');
    form.classList.add('hidden');
    return;
  }

  // 2. Save the changes when the form is submitted
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = readForm(form);
    if (!data) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await request(API_URL + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      window.location.href = 'index.html';
    } catch (err) {
      showMessage('Could not update the post: ' + err.message, 'error');
      button.disabled = false;
    }
  });
}

// ---------- Start: run the code for the current page ----------

if (document.getElementById('posts')) loadPosts();

const addForm = document.getElementById('add-form');
if (addForm) setupAddForm(addForm);

const editForm = document.getElementById('edit-form');
if (editForm) setupEditForm(editForm);
