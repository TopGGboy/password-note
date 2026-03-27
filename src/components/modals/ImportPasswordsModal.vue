<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>批量导入密码</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="import-info">
          <h4>支持的格式</h4>
          <ul>
            <li>CSV 文件 (从浏览器或其他密码管理器导出)</li>
            <li>JSON 文件 (标准格式)</li>
          </ul>
          <p class="format-note">
            CSV 格式应包含：标题,网址,用户名,密码,分类,备注
          </p>
        </div>
        
        <div class="upload-section">
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.json"
            @change="handleFileSelect"
            style="display: none"
          />
          
          <div 
            class="upload-zone"
            :class="{ 'drag-over': isDragOver }"
            @click="($refs.fileInput as HTMLInputElement)?.click()"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleFileDrop"
          >
            <div class="upload-icon">📁</div>
            <p v-if="!selectedFile">
              点击选择文件或拖拽文件到此处
            </p>
            <div v-else class="selected-file">
              <div class="file-icon">📄</div>
              <div class="file-info">
                <h5>{{ selectedFile.name }}</h5>
                <p>{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button @click.stop="removeFile" class="remove-file">✕</button>
            </div>
          </div>
        </div>
        
        <div v-if="previewData.length > 0" class="preview-section">
          <h4>预览数据 ({{ previewData.length }} 条记录)</h4>
          <div class="preview-list">
            <div 
              v-for="(item, index) in previewData.slice(0, 5)" 
              :key="index"
              class="preview-item"
            >
              <div class="item-info">
                <h5>{{ item.title }}</h5>
                <p>{{ item.username }} • {{ item.url }}</p>
              </div>
            </div>
            <div v-if="previewData.length > 5" class="more-items">
              还有 {{ previewData.length - 5 }} 条记录...
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          <button 
            @click="confirmImport" 
            class="import-btn"
            :disabled="!selectedFile || loading"
          >
            {{ loading ? '导入中...' : '确认导入' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface ImportPasswordItem {
  title: string
  url: string
  username: string
  password: string
  category: string
  notes: string
}

export default defineComponent({
  name: 'ImportPasswordsModal',
  emits: ['close', 'success'],
  data() {
    return {
      loading: false,
      isDragOver: false,
      selectedFile: null as File | null,
      previewData: [] as ImportPasswordItem[]
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close')
    },
    
    handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement
      if (target.files && target.files[0]) {
        this.selectedFile = target.files[0]
        this.parseFile()
      }
    },
    
    handleFileDrop(event: DragEvent) {
      this.isDragOver = false
      if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
        this.selectedFile = event.dataTransfer.files[0]
        this.parseFile()
      }
    },
    
    removeFile() {
      this.selectedFile = null
      this.previewData = []
    },
    
    formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    async parseFile() {
      if (!this.selectedFile) return
      
      try {
        const text = await this.selectedFile.text()
        
        if (this.selectedFile.name.endsWith('.csv')) {
          this.parseCSV(text)
        } else if (this.selectedFile.name.endsWith('.json')) {
          this.parseJSON(text)
        }
      } catch (error) {
        console.error('解析文件失败:', error)
        alert('文件格式不正确，请检查文件内容')
      }
    },
    
    parseCSV(text: string) {
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      this.previewData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        return {
          title: values[0] || '',
          url: values[1] || '',
          username: values[2] || '',
          password: values[3] || '',
          category: values[4] || '其他',
          notes: values[5] || ''
        }
      }).filter(item => item.title && item.username && item.password)
    },
    
    parseJSON(text: string) {
      try {
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          this.previewData = data.map(item => ({
            title: item.title || item.name || '',
            url: item.url || item.website || '',
            username: item.username || item.login || '',
            password: item.password || '',
            category: item.category || item.folder || '其他',
            notes: item.notes || item.note || ''
          })).filter(item => item.title && item.username && item.password)
        }
      } catch (error) {
        throw new Error('JSON 格式不正确')
      }
    },
    
    async confirmImport() {
      if (!this.selectedFile || this.previewData.length === 0) return
      
      this.loading = true
      try {
        // 模拟导入过程
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log('导入密码:', this.previewData)
        this.$emit('success', this.previewData)
        this.$emit('close')
      } catch (error) {
        console.error('导入失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-border);
  animation: gradientShift 3s ease infinite;
  background-size: 200% 100%;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #718096;
  padding: 4px;
}

.close-btn:hover {
  color: #2d3748;
}

.modal-body {
  padding: 24px;
}

.import-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.import-info h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.import-info ul {
  margin: 0 0 12px 0;
  padding-left: 20px;
}

.import-info li {
  margin-bottom: 4px;
  color: #4a5568;
}

.format-note {
  margin: 0;
  font-size: 14px;
  color: #718096;
  font-style: italic;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #3182ce;
  background: #ebf8ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-zone p {
  color: #718096;
  margin: 0;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.file-icon {
  font-size: 24px;
}

.file-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.file-info p {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

.remove-file {
  background: #fed7d7;
  color: #c53030;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
}

.preview-section {
  margin-bottom: 24px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.preview-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.preview-item {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.item-info h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.item-info p {
  margin: 0;
  font-size: 12px;
  color: #718096;
}

.more-items {
  padding: 12px 16px;
  text-align: center;
  color: #718096;
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn,
.import-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
}

.import-btn {
  background: #3182ce;
  color: white;
  border: 1px solid #3182ce;
}

.import-btn:hover:not(:disabled) {
  background: #2c5aa0;
}

.import-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>