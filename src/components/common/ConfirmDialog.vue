<template>
  <div v-if="visible" class="confirm-dialog-overlay" @click="handleOverlayClick">
    <div class="confirm-dialog" @click.stop>
      <div class="dialog-header">
        <div class="dialog-icon" :class="iconClass">
          {{ icon }}
        </div>
        <h3 class="dialog-title">{{ title }}</h3>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-message">{{ message }}</p>
        <div v-if="details" class="dialog-details">
          {{ details }}
        </div>
      </div>
      
      <div class="dialog-actions">
        <button 
          @click="handleCancel" 
          class="btn btn-cancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          class="btn btn-confirm"
          :class="confirmButtonClass"
          :disabled="loading"
        >
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ConfirmDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '确认操作'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: '确认'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    loadingText: {
      type: String,
      default: '处理中...'
    },
    type: {
      type: String as () => 'warning' | 'danger' | 'info',
      default: 'warning'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['confirm', 'cancel', 'close'],
  computed: {
    icon(): string {
      const icons = {
        warning: '⚠️',
        danger: '🗑️',
        info: 'ℹ️'
      }
      return icons[this.type] || icons.warning
    },
    iconClass(): string {
      return `icon-${this.type}`
    },
    confirmButtonClass(): string {
      return `btn-${this.type}`
    }
  },
  methods: {
    handleConfirm() {
      if (this.loading) return
      this.$emit('confirm')
    },
    handleCancel() {
      if (this.loading) return
      this.$emit('cancel')
      this.$emit('close')
    },
    handleOverlayClick(event: Event) {
      if (event.target === event.currentTarget && !this.loading) {
        this.handleCancel()
      }
    }
  }
})
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: dialogSlideIn 0.2s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  padding: 24px 24px 16px;
  gap: 12px;
}

.dialog-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-warning {
  background: #fef3cd;
  color: #f59e0b;
}

.icon-danger {
  background: #fee2e2;
  color: #ef4444;
}

.icon-info {
  background: #dbeafe;
  color: #3b82f6;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.dialog-content {
  padding: 0 24px 24px;
}

.dialog-message {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin: 0 0 8px 0;
}

.dialog-details {
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #e5e7eb;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  min-width: 80px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f9fafb;
  color: #4b5563;
  border-color: #d1d5db;
}

.btn-cancel:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-confirm {
  color: white;
}

.btn-warning {
  background: #f59e0b;
  border-color: #f59e0b;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
  border-color: #d97706;
}

.btn-danger {
  background: #ef4444;
  border-color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
}

.btn-info {
  background: #3b82f6;
  border-color: #3b82f6;
}

.btn-info:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

@media (max-width: 480px) {
  .confirm-dialog {
    margin: 20px;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>