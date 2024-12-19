document.getElementById('newPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        // 获取表单数据前先进行验证
        const titleInput = document.getElementById('title');
        const categoryInput = document.getElementById('category');
        const contentInput = document.getElementById('content');

        if (!titleInput.value.trim()) {
            throw new Error('标题不能为空');
        }

        if (!contentInput.value.trim()) {
            throw new Error('内容不能为空');
        }

        const formData = {
            title: titleInput.value.trim(),
            category: categoryInput.value.trim() || '未分类',
            content: contentInput.value.trim()
        };

        console.log('正在发送数据:', formData); // 调试日志

        const response = await fetch('/api/posts', {  // 修改为相对路径
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('服务器响应状态:', response.status); // 调试日志

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '发布失败');
        }

        alert('文章发布成功！');
        window.location.href = '/'; // 发布成功后跳转到首页
    } catch (error) {
        console.error('发布文章时出错:', error);
        alert(error.message || '发布失败，请稍后重试');
    }
}); 