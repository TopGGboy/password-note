<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>导入数据</h3>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="import-steps">
          <div class="step" :class="{ active: currentStep === 1 }">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>选择导入源</h4>
              <p>选择您要从哪个密码管理器导入数据</p>
            </div>
          </div>
          
          <div class="step" :class="{ active: currentStep === 2 }">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>上传文件</h4>
              <p>上传导出的密码文件</p>
            </div>
          </div>
          
          <div class="step" :class="{ active: currentStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>预览和确认</h4>
              <p>预览导入的数据并确认</p>
            </div>
          </div>
        </div>
        
        <!-- 步骤1: 选择导入源 -->
        <div v-if="currentStep === 1" class="step-content-area">
          <h4>选择导入源</h4>
          <div class="import-sources">
            <div 
              v-for="source in importSources" 
              :key="source.id"
              class="source-option"
              :class="{ selected: selectedSource === source.id }"
              @click="selectedSource = source.id"
            >
              <div class="source-icon">{{ source.icon }}</div>
              <div class="source-info">
                <h5>{{ source.name }}</h5>
                <p>{{ source.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 步骤2: 上传文件 -->
        <div v-if="currentStep === 2" class="step-content-area">
          <h4>上传文件</h4>
          <div class="upload-area">
            <input
              ref="fileInput"
              type="file"
              :accept="acceptedFileTypes"
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
            
            <p class="upload-hint">
              支持的文件格式: {{ acceptedFileTypes }}
            </p>
          </div>
        </div>
        
        <!-- 步骤3: 预览数据 -->
        <div v-if="currentStep === 3" class="step-content-area">
          <h4>预览导入数据</h4>
          <div class="preview-summary">
            <div class="summary-item">
              <span class="summary-label">将要导入:</span>
              <span class="summary-value">{{ previewData.length }} 个密码</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">重复项:</span>
              <span class="summary-value">{{ duplicateCount }} 个</span>
            </div>
          </div>
          
          <div class="preview-list">
            <div 
              v-for="(item, index) in previewData.slice(0, 5)" 
              :key="index"
              class="preview-item"
            >
              <div class="item-icon">🔐</div>
              <div class="item-info">
                <h5>{{ item.title }}</h5>
                <p>{{ item.username }} • {{ item.url }}</p>
              </div>
              <div class="item-status">
                <span v-if="item.isDuplicate" class="duplicate-badge">重复</span>
                <span v-else class="new-badge">新增</span>
              </div>
            </div>
            
            <div v-if="previewData.length > 5" class="more-items">
              还有 {{ previewData.length - 5 }} 个项目...
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            v-if="currentStep > 1" 
            @click="previousStep" 
            class="back-btn"
          >
            上一步
          </button>
          
          <button @click="$emit('close')" class="cancel-btn">
            取消
          </button>
          
          <button 
            v-if="currentStep < 3"
            @click="nextStep" 
            class="next-btn"
            :disabled="!canProceed"
          >
            下一步
          </button>
          
          <button 
            v-if="currentStep === 3"
            @click="confirmImport" 
            class="import-btn"
            :disabled="loading"
          >
            {{ loading ? '导入中...' : '确认导入' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

interface ImportSource {
  id: string
  name: string
  description: string
  icon: string
  fileTypes: string[]
}

interface PreviewItem {
  title: string
  username: string
  url: string
  isDuplicate: boolean
}

export default defineComponent({
  name: 'ImportDataModal',
  emits: ['close', 'success'],
  data() {
    return {
      currentStep: 1,
      loading: false,
      isDragOver: false,
      selectedSource: '',
      selectedFile: null as File | null,
      previewData: [] as PreviewItem[],
      
      importSources: [
        {
          id: 'chrome',
          name: 'Chrome 浏览器',
          description: '从 Chrome 导出的 CSV 文件',
          icon: '🌐',
          fileTypes: ['.csv']
        },
        {
          id: '1password',
          name: '1Password',
          description: '从 1Password 导出的 CSV 文件',
          icon: '🔐',
          fileTypes: ['.csv']
        },
        {
          id: 'lastpass',
          name: 'LastPass',
          description: '从 LastPass 导出的 CSV 文件',
          icon: '🔒',
          fileTypes: ['.csv']
        },
        {
          id: 'bitwarden',
          name: 'Bitwarden',
          description: '从 Bitwarden 导出的 JSON 文件',
          icon: '🛡️',
          fileTypes: ['.json']
        },
        {
          id: 'generic',
          name: '通用格式',
          description: 'CSV 或 JSON 格式的密码文件',
          icon: '📄',
          fileTypes: ['.csv', '.json']
        }
      ] as ImportSource[]
    }
  },
  computed: {
    acceptedFileTypes(): string {
      if (!this.selectedSource) return '.csv,.json'
      const source = this.importSources.find(s => s.id === this.selectedSource)
      return source ? source.fileTypes.join(',') : '.csv,.json'
    },
    
    canProceed(): boolean {
      if (this.currentStep === 1) return !!this.selectedSource
      if (this.currentStep === 2) return !!this.selectedFile
      return true
    },
    
    duplicateCount(): number {
      return this.previewData.filter(item => item.isDuplicate).length
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close')
    },
    
    nextStep() {
      if (this.currentStep < 3) {
        this.currentStep++
        if (this.currentStep === 3) {
          this.parseFile()
        }
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    
    handleFileSelect(event: Event) {
      const target = event.target as HTMLInputElement
      if (target.files && target.files[0]) {
        this.selectedFile = target.files[0]
      }
    },
    
    handleFileDrop(event: DragEvent) {
      this.isDragOver = false
      if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
        this.selectedFile = event.dataTransfer.files[0]
      }
    },
    
    removeFile() {
      this.selectedFile = null
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
      
      // 模拟文件解析
      this.previewData = [
        {
          title: 'Google',
          username: 'user@gmail.com',
          url: 'https://accounts.google.com',
          isDuplicate: false
        },
        {
          title: 'Facebook',
          username: 'user123',
          url: 'https://facebook.com',
          isDuplicate: true
        },
        {
          title: 'GitHub',
          username: 'developer',
          url: 'https://github.com',
          isDuplicate: false
        },
        {
          title: 'Amazon',
          username: 'shopper@email.com',
          url: 'https://amazon.com',
          isDuplicate: false
        },
        {
          title: 'Netflix',
          username: 'viewer',
          url: 'https://netflix.com',
          isDuplicate: false
        }
      ]
    },
    
    async confirmImport() {
      this.loading = true
      try {
        // 模拟导入过程
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        console.log('导入数据:', this.previewData)
        this.$emit('success', {
          imported: this.previewData.length,
          duplicates: this.duplicateCount
        })
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

.import-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
}

.import-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s;
}

.step.active .step-number {
  background: #3182ce;
  color: white;
}

.step-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.step-content p {
  margin: 0;
  font-size: 12px;
  color: #718096;
  line-height: 1.3;
}

.step-content-area {
  margin-bottom: 24px;
}

.step-content-area h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.import-sources {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.source-option:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.source-option.selected {
  border-color: #3182ce;
  background: #ebf8ff;
}

.source-icon {
  font-size: 24px;
}

.source-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.source-info p {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

.upload-area {
  text-align: center;
}

.upload-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
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

.upload-hint {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

.preview-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 14px;
  color: #718096;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.preview-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.item-icon {
  font-size: 20px;
}

.item-info {
  flex: 1;
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

.duplicate-badge {
  background: #fed7d7;
  color: #c53030;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.new-badge {
  background: #c6f6d5;
  color: #276749;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.more-items {
  padding: 16px;
  text-align: center;
  color: #718096;
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.back-btn,
.cancel-btn,
.next-btn,
.import-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn,
.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.back-btn:hover,
.cancel-btn:hover {
  background: #edf2f7;
}

.next-btn,
.import-btn {
  background: #3182ce;
  color: white;
  border: 1px solid #3182ce;
}

.next-btn:hover:not(:disabled),
.import-btn:hover:not(:disabled) {
  background: #2c5aa0;
}

.next-btn:disabled,
.import-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .import-steps {
    flex-direction: column;
    gap: 16px;
  }
  
  .import-steps::before {
    display: none;
  }
  
  .preview-summary {
    flex-direction: column;
    gap: 12px;
  }
}
</style>