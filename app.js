const app = document.getElementById('app');
let authToken = null;
let currentUser = null;
const BASE_URL = 'http://localhost:5178';

const routes = {
    '/': home,
    '/api/auth/signin': signin,
    '/api/auth/signup': signup,
    '/new-post': newPost,
    '/posts': viewAllPosts,
    '/edit-post': editPost
};

function router() {
    const path = window.location.pathname;
    const route = routes[path] || notFound;
    app.innerHTML = generateHeader() + route();
    attachFormListeners();
    
    if (path === '/posts') {
        fetchPosts();
    } else if (path === '/edit-post') {
        setTimeout(populateEditForm, 0);
    }
}

function generateHeader() {
    return `
        <header>
            <nav>
                <a href="/" class="nav-link">Home</a>
                ${authToken ? `
                    <a href="/posts" class="nav-link">View All Posts</a>
                    <a href="/new-post" class="nav-link">New Post</a>
                    <button onclick="handleLogout()">Logout</button>
                ` : `
                    <a href="/api/auth/signin" class="nav-link">Sign In</a>
                    <a href="/api/auth/signup" class="nav-link">Sign Up</a>
                `}
            </nav>
        </header>
    `;
}

function navigate(event) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    window.history.pushState({}, '', href);
    router();
}

document.addEventListener('click', event => {
    if (event.target.classList.contains('nav-link')) {
        navigate(event);
    }
});

window.addEventListener('popstate', router);

function home() {
    return `
        <h1>Welcome to our Blog</h1>
        <p>This is the home page of our simple blog.</p>
        ${authToken ? `
            <p>Welcome, ${currentUser}!</p>
        ` : `
            <p>Please sign in to create and manage posts.</p>
        `}
    `;
}

function signin() {
    return `
        <h2>Sign In</h2>
        <form id="signin-form">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Sign In</button>
        </form>
        <div id="signin-status"></div>
    `;
}

function signup() {
    return `
        <h2>Sign Up</h2>
        <form id="signup-form">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Sign Up</button>
        </form>
    `;
}

function newPost() {
    if (!authToken) {
        return `<p>Please <a href="/api/auth/signin" class="nav-link">sign in</a> to create a new post.</p>`;
    }
    return `
        <h2>Create a New Post</h2>
        <form id="post-form">
            <input type="text" name="title" placeholder="Title" required>
            <textarea name="content" placeholder="Content" required></textarea>
            <button type="submit">Publish</button>
        </form>
    `;
}

function viewAllPosts() {
    if (!authToken) {
        return `<p>Please <a href="/api/auth/signin" class="nav-link">sign in</a> to view posts.</p>`;
    }
    return `
        <h2>All Posts</h2>
        <div id="posts-container">Loading posts...</div>
    `;
}

function editPost() {
    if (!authToken) {
        return `<p>Please <a href="/api/auth/signin" class="nav-link">sign in</a> to edit posts.</p>`;
    }
    return `
        <h2>Edit Post</h2>
        <form id="edit-post-form">
            <input type="hidden" name="id" id="post-id">
            <input type="text" name="title" id="post-title" placeholder="Title" required>
            <textarea name="content" id="post-content" placeholder="Content" required></textarea>
            <button type="submit">Update Post</button>
        </form>
    `;
}

function notFound() {
    return `
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
    `;
}

function attachFormListeners() {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const postForm = document.getElementById('post-form');
    const editPostForm = document.getElementById('edit-post-form');

    if (signinForm) {
        signinForm.addEventListener('submit', handleSignin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (postForm) {
        postForm.addEventListener('submit', handleNewPost);
    }

    if (editPostForm) {
        editPostForm.addEventListener('submit', handleEditPost);
    }
}

async function handleSignin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const statusDiv = document.getElementById('signin-status');
    
    statusDiv.textContent = 'Attempting to sign in...';
    
    console.log('Attempting to sign in with data:', data);
    console.log('Sending request to:', `${BASE_URL}/api/auth/signin`);

    try {
        const response = await fetch(`${BASE_URL}/api/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Signin result:', result);

        if (result.token) {
            authToken = result.token;
            currentUser = data.username;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', currentUser);
            statusDiv.textContent = 'Signed in successfully!';
            setTimeout(() => navigate({ target: { getAttribute: () => '/' } }), 1000);
        } else {
            statusDiv.textContent = 'Signin failed. Server did not provide a token.';
        }
    } catch (error) {
        console.error('Signin error:', error);
        if (error.name === 'TypeError') {
            statusDiv.textContent = 'Network error. Please check your internet connection and try again.';
            console.log('Detailed error:', error);
            checkServerConnection();
        } else if (error.message.includes('HTTP error!')) {
            statusDiv.textContent = `Signin failed. Server returned an error: ${error.message}`;
        } else {
            statusDiv.textContent = 'An unexpected error occurred during signin. Please try again.';
        }
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    alert('Logged out successfully');
    navigate({ target: { getAttribute: () => '/' } });
}

async function checkServerConnection() {
    try {
        const response = await fetch(`${BASE_URL}/api/health`);
        if (response.ok) {
            console.log('Server is reachable and responding.');
        } else {
            console.log('Server is reachable but returning an error.');
        }
    } catch (error) {
        console.error('Unable to reach the server:', error);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    console.log('Attempting to signup with data:', data);
    console.log('Sending request to:', `${BASE_URL}/api/auth/signup`);
    try {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status !== 201) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            alert('Signup successful');
            navigate({ target: { getAttribute: () => '/api/auth/signin' } });
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup. Please try again.');
    }
}

function handleNewPost(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    fetch(`${BASE_URL}/api/post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        console.log('New post result:', result);
        alert('Post created successfully!');
        navigate({ target: { getAttribute: () => '/posts' } });
    })
    .catch(error => {
        console.error('New post error:', error);
        alert('An error occurred while creating the post. Please try again.');
    });
}

async function fetchPosts() {
    try {
        const response = await fetch(`${BASE_URL}/api/post`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        document.getElementById('posts-container').innerHTML = 'Error loading posts.';
    }
}

function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
        return;
    }
    
    const postsList = posts.map(post => `
        <div class="post">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <button onclick="editPost('${post.id}')">Edit</button>
            <button onclick="deletePost('${post.id}')">Delete</button>
        </div>
    `).join('');
    
    container.innerHTML = postsList;
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        const response = await fetch(`${BASE_URL}/api/post/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert('Post deleted successfully');
        fetchPosts(); // Refresh the posts list
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
    }
}

async function editPost(id) {
    try {
        console.log(`Attempting to fetch post with id: ${id}`);
        console.log(`Sending request to: ${BASE_URL}/api/post/${id}`);
        
        const response = await fetch(`${BASE_URL}/api/post/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const post = await response.json();
        console.log('Fetched post data:', post);
        
        // Store the post data in sessionStorage
        sessionStorage.setItem('editPostData', JSON.stringify(post));
        
        // Navigate to edit post page
        window.history.pushState({}, '', '/edit-post');
        router();
    } catch (error) {
        console.error('Error fetching post for edit:', error);
        alert('Failed to load post for editing. Please try again.');
    }
}

function populateEditForm() {
    const postData = JSON.parse(sessionStorage.getItem('editPostData'));
    if (postData) {
        const postIdInput = document.getElementById('post-id');
        const postTitleInput = document.getElementById('post-title');
        const postContentInput = document.getElementById('post-content');
        
        if (postIdInput && postTitleInput && postContentInput) {
            postIdInput.value = postData.id;
            postTitleInput.value = postData.title;
            postContentInput.value = postData.content;
            console.log('Form populated with post data');
        } else {
            console.error('One or more form elements not found');
            console.log('postIdInput:', postIdInput);
            console.log('postTitleInput:', postTitleInput);
            console.log('postContentInput:', postContentInput);
        }
    } else {
        console.error('No post data found in sessionStorage');
    }
}

async function handleEditPost(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    console.log('Attempting to update post with data:', data);

    try {
        const response = await fetch(`${BASE_URL}/api/post/${data.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Edit post result:', result);

        alert('Post updated successfully');
        sessionStorage.removeItem('editPostData');
        window.history.pushState({}, '', '/posts');
        router();
    } catch (error) {
        console.error('Error updating post:', error);
        alert(`Failed to update post. Error: ${error.message}`);
    }
}

function checkAuth() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = storedUser;
    }
}

checkAuth();
router();