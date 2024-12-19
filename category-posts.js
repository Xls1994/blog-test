// 加载分类下的文章
async function loadCategoryPosts() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        if (!category) {
            throw new Error('未指定分类');
        }

        // 设置页面标题
        document.querySelector('.category-title').textContent = `分类: ${category}`;
        
        const response = await fetch(`/api/categories/${encodeURIComponent(category)}/posts`);
        if (!response.ok) {
            throw new Error('获取文章失败');
        }
        
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('加载文章失败:', error);
        document.querySelector('.posts-list').innerHTML = `
            <div class="error-message">
                <p>加载文章失败: ${error.message}</p>
            </div>
        `;
    }
}

// 显示文章列表
function displayPosts(posts) {
    const postsContainer = document.querySelector('.posts-list');
    const postsHTML = posts.map(post => `
        <article class="post">
            <h3 class="post-title">
                <a href="post-detail.html?id=${post.id}">${post.title}</a>
            </h3>
            <div class="post-meta">
                <span>发表于 ${post.date}</span>
            </div>
            <div class="post-excerpt">
                ${post.content.substring(0, 200)}...
            </div>
            <a href="post-detail.html?id=${post.id}" class="read-more">阅读全文</a>
        </article>
    `).join('');
    
    postsContainer.innerHTML = postsHTML;
}

// 页面加载时执行
window.addEventListener('load', loadCategoryPosts); 