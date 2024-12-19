// 加载所有分类
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
            throw new Error('获取分类失败');
        }
        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('加载分类失败:', error);
        document.querySelector('.categories-list').innerHTML = `
            <div class="error-message">
                <p>加载分类失败: ${error.message}</p>
            </div>
        `;
    }
}

// 显示分类列表
function displayCategories(categories) {
    const categoriesContainer = document.querySelector('.categories-list');
    const categoriesHTML = categories.map(category => `
        <div class="category-item">
            <a href="category-posts.html?category=${encodeURIComponent(category.name)}">
                <h3>${category.name}</h3>
                <span class="post-count">${category.count} 篇文章</span>
            </a>
        </div>
    `).join('');
    
    categoriesContainer.innerHTML = categoriesHTML;
}

// 页面加载时执行
window.addEventListener('load', loadCategories); 