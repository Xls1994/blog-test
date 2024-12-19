async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();

        document.querySelector('.stat-item:nth-child(1) .number').textContent = stats.postCount;
        document.querySelector('.stat-item:nth-child(2) .number').textContent = stats.categoryCount;
        document.querySelector('.stat-item:nth-child(3) .number').textContent = stats.tagCount;
    } catch (error) {
        console.error('获取统计数据失败:', error);
    }
}

async function displayPosts() {
    const contentDiv = document.querySelector('.content');
    
    // 显示加载状态
    contentDiv.innerHTML = '<div class="loading">正在加载文章...</div>';
    
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        // 清空内容区
        contentDiv.innerHTML = '';
        
        if (!Array.isArray(posts) || posts.length === 0) {
            contentDiv.innerHTML = '<div class="no-posts">暂无文章</div>';
            return;
        }
        
        // 按照日期降序排序文章
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 显示所有文章
        const postsHTML = posts.map(post => `
            <article class="post">
                <h2 class="post-title">${escapeHtml(post.title)}</h2>
                <div class="post-meta">
                    <span>发表于 ${post.date}</span>
                    <span>分类于 ${escapeHtml(post.category)}</span>
                </div>
                <div class="post-content">
                    <p>${escapeHtml(post.content.substring(0, 200))}...</p>
                    <a href="post-detail.html?id=${encodeURIComponent(post.id)}" class="read-more">阅读全文 »</a>
                </div>
            </article>
        `).join('');
        
        contentDiv.innerHTML = postsHTML;
        
        // 加载文章后更新统计数据
        updateStats();
    } catch (error) {
        console.error('获取文章失败：', error);
        contentDiv.innerHTML = `
            <div class="error-message">
                <h2>获取文章失败</h2>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

// async function displayPosts() {
//     const contentDiv = document.querySelector('.content');
    
//     // 显示加载状态
//     contentDiv.innerHTML = '<div class="loading">正在加载文章...</div>';
    
//     try {
//         // 添加调试日志
//         console.log('开始获取文章...');
        
//         const response = await fetch('http://localhost:3000/api/posts');
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const posts = await response.json();
//         console.log('获取到的文章数据：', posts);
        
//         // 清空内容区
//         contentDiv.innerHTML = '';
        
//         if (!Array.isArray(posts) || posts.length === 0) {
//             contentDiv.innerHTML = '<div class="no-posts">暂无文章</div>';
//             return;
//         }
        
//         // 按照日期降序排序文章
//         posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
//         // 显示所有文章
//         const postsHTML = posts.map(post => `
//             <article class="post">
//                 <h2 class="post-title">${escapeHtml(post.title)}</h2>
//                 <div class="post-meta">
//                     <span>发表于 ${formatDate(post.date)}</span>
//                     <span>分类于 ${escapeHtml(post.category)}</span>
//                 </div>
//                 <div class="post-content">
//                     <p>${escapeHtml(post.content.substring(0, 200))}...</p>
//                     <a href="post-detail.html?id=${encodeURIComponent(post.id)}" class="read-more">阅读全文 »</a>
//                 </div>
//             </article>
//         `).join('');
        
//         contentDiv.innerHTML = postsHTML;
//     } catch (error) {
//         console.error('获取文章失败：', error);
//         contentDiv.innerHTML = `
//             <div class="error-message">
//                 <h2>获取文章失败</h2>
//                 <p>${escapeHtml(error.message)}</p>
//                 <button onclick="displayPosts()">重试</button>
//             </div>
//         `;
//     }
// }

// 添加日期格式化函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 添加 HTML 转义函数以防止 XSS 攻击
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 页面加载时显示文章
window.addEventListener('load', () => {
    displayPosts();
    updateStats();
});