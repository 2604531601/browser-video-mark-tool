// 弹出窗口的JavaScript

// 当弹出窗口DOM加载完成时执行
document.addEventListener('DOMContentLoaded', () => {
  // 获取当前活动标签页信息
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    // 检查当前页面是否有视频
    chrome.tabs.sendMessage(currentTab.id, { action: 'checkVideo' }, (response) => {
      if (chrome.runtime.lastError) {
        // 处理错误，可能是内容脚本尚未加载
        console.log('无法连接到内容脚本');
        return;
      }
      
      if (response && response.hasVideo) {
        // 页面有视频，显示标记统计
        showMarkStats(currentTab.id);
      } else {
        // 页面没有视频，显示提示信息
        showNoVideoMessage();
      }
    });
  });
});

// 显示标记统计信息
function showMarkStats(tabId) {
  chrome.tabs.sendMessage(tabId, { action: 'getMarks' }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('无法获取标记信息');
      return;
    }
    
    if (response && response.marks) {
      const marksCount = response.marks.length;
      
      // 创建统计信息元素
      const statsElement = document.createElement('div');
      statsElement.className = 'marks-stats';
      statsElement.innerHTML = `
        <p>当前页面上有 <strong>${marksCount}</strong> 个标记点</p>
      `;
      
      // 插入到页面底部
      const footer = document.querySelector('.footer');
      document.body.insertBefore(statsElement, footer);
    }
  });
}

// 显示无视频提示
function showNoVideoMessage() {
  // 修改描述文本
  const description = document.querySelector('.description');
  description.textContent = '当前页面未检测到视频。请打开包含视频的页面来使用此扩展。';
  description.style.color = '#e74c3c';
  
  // 禁用功能列表
  const featureList = document.querySelector('.feature-list');
  featureList.style.opacity = '0.5';
  
  // 修改底部提示
  const footer = document.querySelector('.footer');
  footer.textContent = '提示：只有在包含HTML5视频的页面上才能使用此扩展';
} 