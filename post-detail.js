async function loadPost() {
    try {
        // 从 URL 获取文章 ID
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (!postId) {
            throw new Error('未找到文章ID');
        }

        console.log('正在加载文章ID:', postId); // 调试日志

        const response = await fetch(`http://localhost:3000/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('文章加载失败');
        }

        const post = await response.json();
        console.log('获取到的文章数据:', post); // 调试日志

        if (!post.content) {
            console.warn('文章内容为空'); // 调试日志
        }

        displayPost(post);
    } catch (error) {
        console.error('加载文章失败：', error);
        document.querySelector('.post-detail').innerHTML = `
            <div class="error-message">
                <h2>文章加载失败</h2>
                <p>${escapeHtml(error.message)}</p>
                <a href="index.html">返回首页</a>
            </div>
        `;
    }
}

function displayPost(post) {
    console.log('正在显示文章:', post); // 调试日志
    const articleElement = document.querySelector('.post-detail');
    
    if (!post || !post.content) {
        articleElement.innerHTML = '<div class="error-message">文章内容为空</div>';
        return;
    }

    articleElement.innerHTML = `
        <h2 class="post-title">${escapeHtml(post.title)}</h2>
        <div class="post-meta">
            <span>发表于 ${formatDate(post.date)}</span>
            <span>分类于 ${escapeHtml(post.category)}</span>
        </div>
        <div class="post-content">
            ${formatContent(post.content)}
        </div>
    `;
}

// 添加 HTML 转义函数
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 添加日期格式化函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatContent(content) {
    if (!content) return '';
    
    console.log('格式化前的内容:', content); // 调试日志
    
    // 将换行符转换为段落标签，并确保内容被正确转义
    const formattedContent = content.split('\n')
        .map(para => para.trim())
        .filter(para => para) // 过滤掉空段落
        .map(para => `<p>${escapeHtml(para)}</p>`)
        .join('');
    
    console.log('格式化后的内容:', formattedContent); // 调试日志
    return formattedContent;
}

// 获取文章ID的辅助函数
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 删除文章的函数
async function deletePost() {
    const postId = getPostIdFromUrl();
    
    if (confirm('确定要删除这篇文章吗？')) {
        try {
            const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('文章删除成功！');
                window.location.href = '/'; // 删除成功后跳转到首页
            } else {
                const data = await response.json();
                throw new Error(data.error || '删除失败');
            }
        } catch (error) {
            alert('删除文章失败：' + error.message);
        }
    }
}

// 页面加载时加载文章
window.addEventListener('load', loadPost); 