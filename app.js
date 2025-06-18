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
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const uploadButton = document.getElementById('upload-button');
const recognizeButton = document.getElementById('recognize-button');
const recognitionResults = document.getElementById('recognition-results');
const loadingSpinner = document.getElementById('loading-spinner');
const loadingText = document.getElementById('loading-text');
const clearImageButton = document.getElementById('clear-image-button');
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

    // 上传按钮点击事件
    uploadButton.addEventListener('click', function() {
        fileInput.click();
    });

    // 识别按钮点击事件
    recognizeButton.addEventListener('click', function() {
        if (imagePreview.src && imagePreview.style.display !== 'none') {
            recognizeImage();
        } else {
            displayRecognitionError('请先上传图片');
        }
    });
    
    // 清除图片按钮点击事件
    if (clearImageButton) {
        clearImageButton.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡到上传区域
            clearImagePreview();
        });
    }
    
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
        imagePreview.style.display = 'block';
        if (uploadPlaceholder) {
            uploadPlaceholder.style.display = 'none';
        }
        if (clearImageButton) {
            clearImageButton.style.display = 'inline-block';
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
    imagePreview.style.display = 'none';
    fileInput.value = '';
    if (uploadPlaceholder) {
        uploadPlaceholder.style.display = 'flex';
    }
    if (clearImageButton) {
        clearImageButton.style.display = 'none';
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
    if (!imagePreview.src || imagePreview.style.display === 'none') {
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
    // 随机生成一个分类结果
    const categories = ['可回收物', '厨余垃圾', '有害垃圾', '其他垃圾'];
    const randomIndex = Math.floor(Math.random() * categories.length);
    const category = categories[randomIndex];
    
    // 生成随机置信度
    const confidence = (0.7 + Math.random() * 0.3).toFixed(2);
    
    return [{
        className: category,
        probability: parseFloat(confidence)
    }];
}

// 显示识别结果
function displayRecognitionResult(predictions) {
    if (predictions && predictions.length > 0) {
        const topPrediction = predictions[0];
        const category = topPrediction.className;
        const probability = (topPrediction.probability * 100).toFixed(1);
        const info = categoryInfo[category] || getCategoryInfo(category);
        
        const resultHTML = `
            <div class="result-item ${info.class} fade-in">
                <div class="d-flex align-items-center mb-2">
                    ${info.icon}
                    <h4 class="ms-2 mb-0">识别结果：${info.name}</h4>
                </div>
                <div class="progress mb-3">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${probability}%" 
                        aria-valuenow="${probability}" aria-valuemin="0" aria-valuemax="100">
                        ${probability}%
                    </div>
                </div>
                <p>${info.description}</p>
                <div class="alert alert-light">
                    <strong>投放提示：</strong> ${info.tips}
                </div>
            </div>
        `;
        
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