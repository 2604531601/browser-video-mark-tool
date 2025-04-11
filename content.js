// 视频标记工具的主要功能实现

// 存储当前页面的标记
let marks = [];
let currentVideoElement = null;

// 页面加载完成后初始化插件
window.addEventListener('load', () => {
  // 检测页面中的视频元素
  detectVideoElements();
  
  // 为页面中新增的视频元素添加监听
  observeVideoElements();
});

// 检测页面中的视频元素
function detectVideoElements() {
  const videos = document.querySelectorAll('video');
  
  if (videos.length > 0) {
    // 暂时只处理页面中的第一个视频
    currentVideoElement = videos[0];
    createMarkUI();
  }
}

// 监听DOM变化，检测新增的视频元素
function observeVideoElements() {
  const observer = new MutationObserver((mutations) => {
    if (!currentVideoElement) {
      detectVideoElements();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 创建标记工具UI
function createMarkUI() {
  // 创建悬浮窗容器
  const markToolContainer = document.createElement('div');
  markToolContainer.className = 'video-mark-tool-container';
  
  // 创建工具栏
  const toolbar = document.createElement('div');
  toolbar.className = 'video-mark-toolbar';
  
  // 创建添加标记按钮
  const addMarkButton = document.createElement('button');
  addMarkButton.className = 'video-mark-button add-mark';
  addMarkButton.innerHTML = '添加标记';
  addMarkButton.addEventListener('click', handleAddMark);
  
  // 创建跳转标记按钮
  const jumpMarkButton = document.createElement('button');
  jumpMarkButton.className = 'video-mark-button jump-mark';
  jumpMarkButton.innerHTML = '跳转标记';
  jumpMarkButton.addEventListener('click', handleJumpMark);
  
  // 创建删除标记按钮
  const deleteMarkButton = document.createElement('button');
  deleteMarkButton.className = 'video-mark-button delete-mark';
  deleteMarkButton.innerHTML = '删除标记';
  deleteMarkButton.addEventListener('click', handleDeleteMark);
  
  // 添加按钮到工具栏
  toolbar.appendChild(addMarkButton);
  toolbar.appendChild(jumpMarkButton);
  toolbar.appendChild(deleteMarkButton);
  
  // 添加工具栏到容器
  markToolContainer.appendChild(toolbar);
  
  // 将容器添加到页面
  document.body.appendChild(markToolContainer);
  
  // 初始化数据
  initMarksData();
}

// 初始化标记数据
function initMarksData() {
  // 使用当前页面URL作为标识符
  const pageUrl = window.location.href;
  marks = JSON.parse(localStorage.getItem(pageUrl)) || [];
}

// 保存标记数据
function saveMarksData() {
  const pageUrl = window.location.href;
  localStorage.setItem(pageUrl, JSON.stringify(marks));
}

// 添加标记处理
function handleAddMark() {
  if (!currentVideoElement) return;
  
  // 暂停视频
  currentVideoElement.pause();
  
  // 获取当前时间点
  const currentTime = currentVideoElement.currentTime;
  
  // 创建标记输入弹窗
  const markInputContainer = document.createElement('div');
  markInputContainer.className = 'video-mark-input-container';
  
  const markInputForm = document.createElement('div');
  markInputForm.className = 'video-mark-input-form';
  
  // 标题输入
  const titleLabel = document.createElement('label');
  titleLabel.textContent = '标记名称:';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'mark-title-input';
  
  // 描述输入
  const descLabel = document.createElement('label');
  descLabel.textContent = '标记描述:';
  const descInput = document.createElement('textarea');
  descInput.className = 'mark-desc-input';
  
  // 时间显示
  const timeInfo = document.createElement('div');
  timeInfo.className = 'mark-time-info';
  timeInfo.textContent = `时间点: ${formatTime(currentTime)}`;
  
  // 按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'mark-button-container';
  
  // 确认按钮
  const confirmButton = document.createElement('button');
  confirmButton.className = 'mark-confirm-button';
  confirmButton.textContent = '保存';
  confirmButton.addEventListener('click', () => {
    const title = titleInput.value.trim() || `标记 ${formatTime(currentTime)}`;
    const desc = descInput.value.trim();
    
    // 添加新标记
    marks.push({
      id: Date.now(),
      title,
      desc,
      time: currentTime,
      timeFormatted: formatTime(currentTime)
    });
    
    // 保存标记
    saveMarksData();
    
    // 关闭弹窗
    document.body.removeChild(markInputContainer);
  });
  
  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.className = 'mark-cancel-button';
  cancelButton.textContent = '取消';
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(markInputContainer);
    // 继续播放视频
    currentVideoElement.play();
  });
  
  // 添加所有元素
  buttonContainer.appendChild(confirmButton);
  buttonContainer.appendChild(cancelButton);
  
  markInputForm.appendChild(titleLabel);
  markInputForm.appendChild(titleInput);
  markInputForm.appendChild(descLabel);
  markInputForm.appendChild(descInput);
  markInputForm.appendChild(timeInfo);
  markInputForm.appendChild(buttonContainer);
  
  markInputContainer.appendChild(markInputForm);
  document.body.appendChild(markInputContainer);
  
  // 聚焦到标题输入框
  titleInput.focus();
}

// 跳转标记处理
function handleJumpMark() {
  if (!currentVideoElement || marks.length === 0) return;
  
  // 创建标记列表弹窗
  const markListContainer = document.createElement('div');
  markListContainer.className = 'video-mark-list-container';
  
  const markListForm = document.createElement('div');
  markListForm.className = 'video-mark-list-form';
  
  // 标题
  const title = document.createElement('h3');
  title.textContent = '选择要跳转的标记点';
  
  // 标记列表
  const marksList = document.createElement('div');
  marksList.className = 'marks-list';
  
  marks.forEach(mark => {
    const markItem = document.createElement('div');
    markItem.className = 'mark-item';
    markItem.innerHTML = `
      <span class="mark-title">${mark.title}</span>
      <span class="mark-time">${mark.timeFormatted}</span>
    `;
    
    markItem.addEventListener('click', () => {
      // 跳转到选定的标记时间点
      currentVideoElement.currentTime = mark.time;
      currentVideoElement.play();
      
      // 关闭弹窗
      document.body.removeChild(markListContainer);
    });
    
    marksList.appendChild(markItem);
  });
  
  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.className = 'mark-cancel-button';
  cancelButton.textContent = '取消';
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(markListContainer);
  });
  
  // 添加所有元素
  markListForm.appendChild(title);
  markListForm.appendChild(marksList);
  markListForm.appendChild(cancelButton);
  
  markListContainer.appendChild(markListForm);
  document.body.appendChild(markListContainer);
}

// 删除标记处理
function handleDeleteMark() {
  if (!currentVideoElement || marks.length === 0) return;
  
  // 创建标记列表弹窗
  const markListContainer = document.createElement('div');
  markListContainer.className = 'video-mark-list-container';
  
  const markListForm = document.createElement('div');
  markListForm.className = 'video-mark-list-form';
  
  // 标题
  const title = document.createElement('h3');
  title.textContent = '选择要删除的标记点';
  
  // 标记列表
  const marksList = document.createElement('div');
  marksList.className = 'marks-list';
  
  marks.forEach(mark => {
    const markItem = document.createElement('div');
    markItem.className = 'mark-item';
    markItem.innerHTML = `
      <span class="mark-title">${mark.title}</span>
      <span class="mark-time">${mark.timeFormatted}</span>
      <button class="mark-delete-btn">删除</button>
    `;
    
    const deleteBtn = markItem.querySelector('.mark-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 删除选定的标记
      marks = marks.filter(m => m.id !== mark.id);
      
      // 保存标记
      saveMarksData();
      
      // 从列表中移除
      marksList.removeChild(markItem);
      
      // 如果没有标记了，关闭弹窗
      if (marks.length === 0) {
        document.body.removeChild(markListContainer);
      }
    });
    
    marksList.appendChild(markItem);
  });
  
  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.className = 'mark-cancel-button';
  cancelButton.textContent = '取消';
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(markListContainer);
  });
  
  // 添加所有元素
  markListForm.appendChild(title);
  markListForm.appendChild(marksList);
  markListForm.appendChild(cancelButton);
  
  markListContainer.appendChild(markListForm);
  document.body.appendChild(markListContainer);
}

// 格式化时间
function formatTime(timeInSeconds) {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return [
    hours > 0 ? hours : null,
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].filter(Boolean).join(':');
}

// 页面卸载时清除标记
window.addEventListener('beforeunload', () => {
  const pageUrl = window.location.href;
  localStorage.removeItem(pageUrl);
});

// 监听来自扩展弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 检查页面是否有视频
  if (message.action === 'checkVideo') {
    sendResponse({ hasVideo: !!currentVideoElement });
    return true;
  }
  
  // 获取当前标记
  if (message.action === 'getMarks') {
    sendResponse({ marks: marks });
    return true;
  }
  
  return false;
}); 