// 垃圾分类数据库
const garbageDatabase = {
    // 可回收物
    recyclable: [
        "纸箱", "报纸", "书籍", "纸袋", "塑料瓶", "饮料瓶", "塑料玩具", "塑料盆", "金属罐", 
        "易拉罐", "铁皮盒", "铝箔", "玻璃瓶", "玻璃杯", "玻璃碎片", "衣服", "布料", "毛绒玩具",
        "电池", "充电宝", "手机", "电脑", "电视", "冰箱", "洗衣机", "电风扇", "电饭煲", "微波炉"
    ],
    // 厨余垃圾
    kitchen: [
        "剩饭", "剩菜", "骨头", "果皮", "果核", "茶叶渣", "菜叶", "蛋壳", "鱼骨", "肉类",
        "过期食品", "面包", "糕点", "中药渣", "咖啡渣", "宠物饲料", "动物内脏", "水果", "蔬菜"
    ],
    // 有害垃圾
    harmful: [
        "废电池", "废荧光灯管", "废灯泡", "废水银温度计", "废油漆桶", "过期药品", "废农药",
        "杀虫剂", "消毒剂", "废墨盒", "废硒鼓", "废旧化妆品", "过期指甲油", "染发剂"
    ],
    // 其他垃圾
    other: [
        "烟头", "尿不湿", "卫生纸", "卫生巾", "口香糖", "橡皮泥", "创可贴", "陶瓷碎片",
        "污染纸张", "一次性筷子", "牙签", "口罩", "灰尘", "头发", "指甲", "干燥剂", "保冷剂"
    ]
};

// 分类对应的显示信息
const categoryInfo = {
    recyclable: {
        name: "可回收物",
        icon: "<i class='fas fa-recycle text-warning'></i>",
        description: "可循环利用和资源再生的物品",
        class: "result-recyclable",
        tips: "请投放至可回收物收集容器，保持清洁干燥，并进行分类投放。"
    },
    kitchen: {
        name: "厨余垃圾",
        icon: "<i class='fas fa-apple-alt text-success'></i>",
        description: "易腐烂的生物质生活废弃物",
        class: "result-kitchen",
        tips: "请投放至厨余垃圾收集容器，尽量沥干水分，避免混入塑料袋等其他垃圾。"
    },
    harmful: {
        name: "有害垃圾",
        icon: "<i class='fas fa-skull-crossbones text-danger'></i>",
        description: "含有害物质，需特殊安全处理",
        class: "result-harmful",
        tips: "请投放至有害垃圾收集容器，并确保安全密封，防止有害物质泄漏。"
    },
    other: {
        name: "其他垃圾",
        icon: "<i class='fas fa-trash text-secondary'></i>",
        description: "难以回收的混合垃圾",
        class: "result-other",
        tips: "请投放至其他垃圾收集容器，尽量减少产生量，做好垃圾减量工作。"
    }
};

// DOM元素引用
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const fileInput = document.getElementById('image-upload'); // 修正为HTML中实际的ID
const imagePreview = document.getElementById('image-preview');
const recognizeButton = document.getElementById('recognize-button');
const recognitionResults = document.getElementById('recognition-results');
const loadingSpinner = document.getElementById('loading-spinner');
const loadingText = document.getElementById('loading-text');
const uploadPlaceholder = document.getElementById('upload-placeholder');

// 初始化事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 搜索按钮点击事件
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            searchGarbage(query);
        } else {
            displaySearchError('请输入垃圾名称');
        }
    });

    // 搜索框回车事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchGarbage(query);
            } else {
                displaySearchError('请输入垃圾名称');
            }
        }
    });

    // 文件上传事件
    fileInput.addEventListener('change', handleImageUpload);

    // 识别按钮点击事件
    recognizeButton.addEventListener('click', function() {
        if (imagePreview.src && !imagePreview.classList.contains('d-none')) {
            recognizeImage();
        } else {
            displayRecognitionError('请先上传图片');
        }
    });
    
    // 热门搜索标签点击事件
    const popularTags = document.querySelectorAll('.popular-tags .badge');
    popularTags.forEach(tag => {
        tag.addEventListener('click', function() {
            searchInput.value = this.textContent.trim();
            searchGarbage(searchInput.value);
        });
    });
    
    // 分类指南折叠按钮点击事件
    const collapseBtn = document.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', function() {
            const target = document.getElementById(this.getAttribute('data-bs-target').substring(1));
            const bsCollapse = new bootstrap.Collapse(target);
            
            // 切换图标
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-chevron-down')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        });
    }
    
    // 加载模型
    loadModel();
});

// 搜索垃圾分类
function searchGarbage(query) {
    if (!query) {
        displaySearchError('请输入垃圾名称');
        return;
    }

    // 显示加载中
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';
    loadingSpinner.style.display = 'block';
    loadingText.textContent = '正在搜索...';

    // 模拟搜索延迟
    setTimeout(() => {
        loadingSpinner.style.display = 'none';
        const result = findGarbageCategory(query);
        displaySearchResult(result, query);
    }, 800);
}

// 显示搜索错误
function displaySearchError(message) {
    searchResults.style.display = 'block';
    searchResults.innerHTML = `<div class="alert alert-warning">${message}</div>`;
}

// 在数据库中查找垃圾分类
function findGarbageCategory(name) {
    name = name.toLowerCase();
    
    // 检查每个分类
    for (const category in garbageDatabase) {
        if (garbageDatabase[category].some(item => 
            item.toLowerCase().includes(name) || name.includes(item.toLowerCase())
        )) {
            return category;
        }
    }
    
    // 如果没有找到，返回其他垃圾（默认分类）
    return "other";
}

// 显示搜索结果
function displaySearchResult(category, query) {
    const info = categoryInfo[category];
    
    const resultHTML = `
        <div class="result-item ${info.class} fade-in">
            <div class="d-flex align-items-center mb-2">
                ${info.icon}
                <h4 class="ms-2 mb-0">${query} 属于 ${info.name}</h4>
            </div>
            <p>${info.description}</p>
            <div class="alert alert-light">
                <strong>投放提示：</strong> ${info.tips}
            </div>
        </div>
    `;
    
    searchResults.innerHTML = resultHTML;
}

// 显示搜索错误
function showSearchError(message) {
    searchResults.innerHTML = `
        <div class="alert alert-danger fade-in" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>${message}
        </div>
    `;
}

// 获取分类信息
function getCategoryInfo(category) {
    return categoryInfo[category] || {
        icon: 'fas fa-question-circle',
        badgeClass: 'bg-secondary',
        description: '未知分类',
        examples: '请咨询当地垃圾分类指南'
    };
}

// 处理图片上传
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('d-none'); // 使用Bootstrap类控制显示
        if (uploadPlaceholder) {
            uploadPlaceholder.style.display = 'none';
        }
        recognizeButton.disabled = false;
    };
    reader.readAsDataURL(file);
    
    // 清空之前的结果
    recognitionResults.innerHTML = '';
}

// 清除图片预览
function clearImagePreview() {
    imagePreview.src = '';
    imagePreview.classList.add('d-none'); // 使用Bootstrap类控制隐藏
    fileInput.value = '';
    if (uploadPlaceholder) {
        uploadPlaceholder.style.display = 'flex';
    }
    // 清除识别结果
    recognitionResults.innerHTML = '';
    recognitionResults.style.display = 'none';
}

// 显示识别错误
function displayRecognitionError(message) {
    recognitionResults.style.display = 'block';
    recognitionResults.innerHTML = `<div class="alert alert-warning">${message}</div>`;
}

// 加载模型（模拟）
let model = null;

function loadModel() {
    console.log('模拟加载模型...');
    // 模拟异步加载模型
    setTimeout(() => {
        model = {
            predict: function(img) {
                // 这里只是模拟，实际应用中会使用真正的模型预测
                return simulatePredict();
            }
        };
        console.log('模型加载完成');
    }, 1000);
}

// 识别图像
function recognizeImage() {
    // 检查是否有图片
    if (!imagePreview.src || imagePreview.classList.contains('d-none')) {
        displayRecognitionError('请先上传图片');
        return;
    }

    // 显示加载中
    recognitionResults.style.display = 'block';
    recognitionResults.innerHTML = '';
    loadingSpinner.style.display = 'block';
    loadingText.textContent = '正在加载模型...';

    // 模拟加载模型和识别过程
    setTimeout(() => {
        loadingText.textContent = '正在分析图像...';

        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            // 模拟识别结果
            const predictions = simulatePredict();
            displayRecognitionResult(predictions);
        }, 1200);
    }, 1000);
}

// 模拟预测结果
function simulatePredict() {
    // 分析图片特征（这里我们使用一个更智能的模拟算法）
    // 在实际应用中，这里应该使用真正的图像分析和机器学习模型
    
    // 1. 创建一个临时canvas来分析图片颜色
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imagePreview.naturalWidth || 300;
    canvas.height = imagePreview.naturalHeight || 300;
    
    // 2. 绘制图片到canvas
    ctx.drawImage(imagePreview, 0, 0, canvas.width, canvas.height);
    
    // 3. 获取图片数据
    let imageData;
    try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch(e) {
        console.error('无法分析图片:', e);
        // 如果无法分析图片（例如跨域问题），则回退到随机模式
        return fallbackRandomPredict();
    }
    
    // 4. 分析主要颜色
    const colors = analyzeColors(imageData);
    
    // 5. 基于颜色特征进行分类
    // 这里使用一些启发式规则来模拟智能分类
    // 绿色/棕色多 -> 可能是厨余垃圾
    // 蓝色/白色/透明多 -> 可能是可回收物
    // 红色/黄色多 -> 可能是有害垃圾
    // 灰色/黑色多 -> 可能是其他垃圾
    
    const predictions = [];
    
    // 根据颜色特征计算各类别的可能性
    const greenBrownRatio = (colors.green + colors.brown) / colors.total;
    const blueWhiteRatio = (colors.blue + colors.white) / colors.total;
    const redYellowRatio = (colors.red + colors.yellow) / colors.total;
    const grayBlackRatio = (colors.gray + colors.black) / colors.total;
    
    // 添加预测结果，按可能性从高到低排序
    if (greenBrownRatio > 0.3) {
        predictions.push({
            className: 'kitchen',
            probability: 0.7 + (greenBrownRatio - 0.3) * 0.3
        });
    }
    
    if (blueWhiteRatio > 0.25) {
        predictions.push({
            className: 'recyclable',
            probability: 0.65 + (blueWhiteRatio - 0.25) * 0.35
        });
    }
    
    if (redYellowRatio > 0.2) {
        predictions.push({
            className: 'harmful',
            probability: 0.6 + (redYellowRatio - 0.2) * 0.4
        });
    }
    
    if (grayBlackRatio > 0.2) {
        predictions.push({
            className: 'other',
            probability: 0.6 + (grayBlackRatio - 0.2) * 0.4
        });
    }
    
    // 如果没有明显特征，添加默认分类
    if (predictions.length === 0) {
        return fallbackRandomPredict();
    }
    
    // 按概率排序
    predictions.sort((a, b) => b.probability - a.probability);
    
    // 限制概率最大值为0.98
    predictions.forEach(p => {
        if (p.probability > 0.98) p.probability = 0.98;
    });
    
    // 如果只有一个预测结果，添加次要预测
    if (predictions.length === 1) {
        const categories = ['recyclable', 'kitchen', 'harmful', 'other'];
        const otherCategories = categories.filter(c => c !== predictions[0].className);
        const secondCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
        
        predictions.push({
            className: secondCategory,
            probability: Math.max(0.1, predictions[0].probability - 0.3 - Math.random() * 0.2)
        });
    }
    
    return predictions;
}

// 分析图片颜色分布
function analyzeColors(imageData) {
    const colors = {
        red: 0,
        green: 0,
        blue: 0,
        yellow: 0,
        brown: 0,
        white: 0,
        black: 0,
        gray: 0,
        total: 0
    };
    
    // 每隔几个像素采样一次，以提高性能
    const step = 10;
    
    for (let i = 0; i < imageData.length; i += step * 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        
        // 简单的颜色分类
        if (r > 200 && g > 200 && b > 200) {
            colors.white++;
        } else if (r < 60 && g < 60 && b < 60) {
            colors.black++;
        } else if (Math.abs(r - g) < 30 && Math.abs(r - b) < 30 && r < 180) {
            colors.gray++;
        } else if (r > 150 && g < 100 && b < 100) {
            colors.red++;
        } else if (r < 100 && g > 150 && b < 100) {
            colors.green++;
        } else if (r < 100 && g < 100 && b > 150) {
            colors.blue++;
        } else if (r > 180 && g > 180 && b < 100) {
            colors.yellow++;
        } else if (r > 120 && g < 120 && b < 80) {
            colors.brown++;
        } else {
            // 其他颜色归为灰色
            colors.gray++;
        }
        
        colors.total++;
    }
    
    return colors;
}

// 回退到随机预测（当无法分析图片时使用）
function fallbackRandomPredict() {
    const categories = ['recyclable', 'kitchen', 'harmful', 'other'];
    const randomIndex = Math.floor(Math.random() * categories.length);
    const category = categories[randomIndex];
    
    // 生成随机置信度
    const confidence = (0.7 + Math.random() * 0.25).toFixed(2);
    
    return [{
        className: category,
        probability: parseFloat(confidence)
    }];
}

// 显示识别结果
function displayRecognitionResult(predictions) {
    if (predictions && predictions.length > 0) {
        let resultHTML = '<div class="fade-in">';
        
        // 显示主要预测结果
        const topPrediction = predictions[0];
        const topCategory = topPrediction.className;
        const topProbability = (topPrediction.probability * 100).toFixed(1);
        const topInfo = categoryInfo[topCategory];
        
        resultHTML += `
            <div class="result-item ${topInfo.class} mb-3">
                <div class="d-flex align-items-center mb-2">
                    ${topInfo.icon}
                    <h4 class="ms-2 mb-0">主要识别结果：${topInfo.name}</h4>
                </div>
                <div class="progress mb-2">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${topProbability}%" 
                        aria-valuenow="${topProbability}" aria-valuemin="0" aria-valuemax="100">
                        ${topProbability}%
                    </div>
                </div>
                <p>${topInfo.description}</p>
                <div class="alert alert-light">
                    <strong>投放提示：</strong> ${topInfo.tips}
                </div>
            </div>
        `;
        
        // 如果有其他预测结果，显示备选结果
        if (predictions.length > 1) {
            resultHTML += '<div class="mt-3"><h5 class="fs-6">其他可能的分类：</h5><div class="row g-2">';
            
            // 显示其他预测结果
            for (let i = 1; i < Math.min(predictions.length, 3); i++) {
                const altPrediction = predictions[i];
                const altCategory = altPrediction.className;
                const altProbability = (altPrediction.probability * 100).toFixed(1);
                const altInfo = categoryInfo[altCategory];
                
                resultHTML += `
                    <div class="col-md-12">
                        <div class="card border-light mb-2">
                            <div class="card-body py-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        ${altInfo.icon} <span class="ms-1">${altInfo.name}</span>
                                    </div>
                                    <span class="badge bg-secondary">${altProbability}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            resultHTML += '</div></div>';
        }
        
        // 添加提示信息
        resultHTML += `
            <div class="alert alert-info mt-3 small">
                <i class="fas fa-info-circle me-2"></i>
                图片识别结果仅供参考，如有疑问请使用搜索功能进行确认。
            </div>
        `;
        
        resultHTML += '</div>';
        recognitionResults.innerHTML = resultHTML;
    } else {
        recognitionResults.innerHTML = `
            <div class="alert alert-warning fade-in">
                <i class="fas fa-exclamation-triangle me-2"></i>
                无法识别图像，请尝试上传更清晰的图片或使用搜索功能。
            </div>
        `;
    }
}