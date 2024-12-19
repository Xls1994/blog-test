const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 中间件设置
app.use(express.static('.'));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// 获取所有文章
app.get('/api/posts', async (req, res) => {
    try {
        const postsDir = path.join(__dirname, 'posts');
        const files = await fs.readdir(postsDir);
        
        const posts = [];
        for (const file of files) {
            if (file.endsWith('.md')) {
                const content = await fs.readFile(path.join(postsDir, file), 'utf8');
                const [meta, ...contentArr] = content.split('---\n');
                const metaData = JSON.parse(meta);
                posts.push({
                    id: file.replace('.md', ''),
                    ...metaData,
                    content: contentArr.join('---\n')
                });
            }
        }
        
        res.json(posts);
    } catch (error) {
        console.error('读取文章失败:', error);
        res.status(500).json({ error: '无法读取文章' });
    }
});

// 保存新文章
app.post('/api/posts', async (req, res) => {
    try {
        const { title, category, content } = req.body;
        
        // 加强输入验证
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ error: '标题和内容不能为空' });
        }

        // 限制标题长度
        if (title.length > 100) {
            return res.status(400).json({ error: '标题长度不能超过100个字符' });
        }

        // 生成更友好的文件名
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const sanitizedTitle = title.toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
        const fileName = `${dateStr}-${sanitizedTitle}-${Date.now()}.md`;
        const postsDir = path.join(__dirname, 'posts');

        // 确保 posts 目录存在
        await fs.mkdir(postsDir, { recursive: true });

        const metaData = {
            title: title.trim(),
            category: category?.trim() || '未分类',
            date: dateStr,
            lastModified: date.toISOString()
        };

        // 格式化文章内容
        const formattedContent = content.trim();
        const fileContent = `${JSON.stringify(metaData, null, 2)}
---
${formattedContent}`;

        await fs.writeFile(
            path.join(postsDir, fileName),
            fileContent,
            'utf8'
        );

        res.json({ 
            message: '文章保存成功', 
            fileName,
            post: {
                id: fileName.replace('.md', ''),
                ...metaData,
                content: formattedContent
            }
        });
    } catch (error) {
        console.error('保存文章时出错:', error);
        res.status(500).json({ 
            error: '保存文章失败',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 修改获取单篇文章的路由
app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const postsDir = path.join(__dirname, 'posts');
        const filePath = path.join(postsDir, `${postId}.md`);

        // 使用 async/await 读取文件
        const content = await fs.readFile(filePath, 'utf8');
        
        // 解析文章内容
        const [meta, ...contentArr] = content.split('---\n');
        const metaData = JSON.parse(meta);
        
        const post = {
            id: postId,
            ...metaData,
            content: contentArr.join('---\n').trim() // 确保内容被正确提取并去除多余空格
        };

        res.json(post);
    } catch (error) {
        console.error('读取文章失败:', error);
        res.status(404).json({ error: '文章不存在' });
    }
});

// 添加删除文章的路由
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const postPath = path.join(__dirname, 'posts', `${postId}.md`);
    
    // 检查文章是否存在
    try {
      await fs.access(postPath);
    } catch (error) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 删除文章文件
    await fs.unlink(postPath);
    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ error: '删除文章失败' });
  }
});

// 获取所有分类
app.get('/api/categories', async (req, res) => {
    try {
        const postsDir = path.join(__dirname, 'posts');
        const files = await fs.readdir(postsDir);
        
        // 统计每个分类的文章数量
        const categoryCount = {};
        
        for (const file of files) {
            if (file.endsWith('.md')) {
                const content = await fs.readFile(path.join(postsDir, file), 'utf8');
                const [meta] = content.split('---\n');
                const metaData = JSON.parse(meta);
                const category = metaData.category || '未分类';
                
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
        }
        
        // 转换为数组格式
        const categories = Object.entries(categoryCount).map(([name, count]) => ({
            name,
            count
        }));
        
        res.json(categories);
    } catch (error) {
        console.error('获取分类失败:', error);
        res.status(500).json({ error: '获取分类失败' });
    }
});

// 获取分类下的文章
app.get('/api/categories/:name/posts', async (req, res) => {
    try {
        const categoryName = req.params.name;
        const postsDir = path.join(__dirname, 'posts');
        const files = await fs.readdir(postsDir);
        
        const categoryPosts = [];
        
        for (const file of files) {
            if (file.endsWith('.md')) {
                const content = await fs.readFile(path.join(postsDir, file), 'utf8');
                const [meta, ...contentArr] = content.split('---\n');
                const metaData = JSON.parse(meta);
                
                if (metaData.category === categoryName) {
                    categoryPosts.push({
                        id: file.replace('.md', ''),
                        ...metaData,
                        content: contentArr.join('---\n')
                    });
                }
            }
        }
        
        res.json(categoryPosts);
    } catch (error) {
        console.error('获取分类文章失败:', error);
        res.status(500).json({ error: '获取分类文章失败' });
    }
});


// 获取统计数据
app.get('/api/stats', async (req, res) => {
    try {
        const postsDir = path.join(__dirname, 'posts');
        const files = await fs.readdir(postsDir);

        let postCount = 0;
        const categories = new Set();
        const tags = new Set();

        for (const file of files) {
            if (file.endsWith('.md')) {
                postCount++;
                const content = await fs.readFile(path.join(postsDir, file), 'utf8');
                const [meta] = content.split('---\n');
                const metaData = JSON.parse(meta);
                
                if (metaData.category) {
                    categories.add(metaData.category);
                }
                if (metaData.tags && Array.isArray(metaData.tags)) {
                    metaData.tags.forEach(tag => tags.add(tag));
                }
            }
        }

        res.json({
            postCount,
            categoryCount: categories.size,
            tagCount: tags.size
        });
    } catch (error) {
        console.error('获取统计数据失败:', error);
        res.status(500).json({ error: '无法获取统计数据' });
    }
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 